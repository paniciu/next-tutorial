import { createHash } from "node:crypto";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText } from "ai";

import { get, set } from "@/lib/cache";
import { calculateMessageCost, toCachedCostSnapshot } from "@/lib/cost";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_PROVIDER_ID,
  getModelPricing,
  PROVIDER_REGISTRY,
  resolveProviderModel
} from "@/lib/providers";
import { getModel, isProviderConfigured } from "@/lib/providers.server";
import { buildSystemPrompt } from "@/lib/system-prompt";
import type { ChatMessage, ChatMessageMetadata, ProviderId } from "@/lib/types";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

// De ce: protecția e simplă și în memorie pentru pasul curent.
// Într-un deploy cu mai multe instanțe fiecare instanță numără separat,
// iar după restart contorul se resetează. E protecție de bun-simț, nu măsură de securitate.
const requestWindows = new Map<string, number[]>();

type CachedAssistantResponse = {
  text: string;
  metadata: ChatMessageMetadata;
};

function getRequestIdentity(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(identity: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const existing = requestWindows.get(identity) ?? [];
  const activeWindow = existing.filter(timestamp => timestamp > windowStart);

  if (activeWindow.length >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAtMs = activeWindow[0] + RATE_LIMIT_WINDOW_MS;
    requestWindows.set(identity, activeWindow);

    return {
      allowed: false,
      retryAtIso: new Date(retryAtMs).toISOString()
    } as const;
  }

  activeWindow.push(now);
  requestWindows.set(identity, activeWindow);

  return {
    allowed: true,
    retryAtIso: null
  } as const;
}

function hashString(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildCacheKey(options: {
  providerId: ProviderId;
  modelId: string;
  systemPrompt: string;
  messagesHash: string;
}) {
  // De ce: cheia include system prompt-ul (care include profilul utilizatorului).
  // Consecință: utilizatori diferiți nu împart răspunsuri din cache.
  // Asta scade rata de hit, dar evită scurgeri de date între utilizatori.
  const systemPromptHash = hashString(options.systemPrompt);
  return [options.providerId, options.modelId, systemPromptHash, options.messagesHash].join(":");
}

function buildCachedStream(messages: ChatMessage[], cached: CachedAssistantResponse) {
  const metadata: ChatMessageMetadata = {
    ...cached.metadata,
    fromCache: true,
    cost: toCachedCostSnapshot(cached.metadata.cost)
  };

  const stream = createUIMessageStream<ChatMessage>({
    originalMessages: messages,
    execute: ({ writer }) => {
      writer.write({ type: "start", messageMetadata: metadata });
      writer.write({ type: "text-start", id: "cache-text" });

      const chunkSize = 48;
      for (let cursor = 0; cursor < cached.text.length; cursor += chunkSize) {
        const chunk = cached.text.slice(cursor, cursor + chunkSize);
        writer.write({ type: "text-delta", id: "cache-text", delta: chunk });
      }

      writer.write({ type: "text-end", id: "cache-text" });
      writer.write({ type: "finish", finishReason: "stop", messageMetadata: metadata });
      writer.setOutcome({ status: "completed" });
    }
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = (Array.isArray(body?.messages) ? body.messages : []) as ChatMessage[];
    const profile = body?.profile;
    const bypassCache = Boolean(body?.bypassCache);

    const identity = getRequestIdentity(request);
    const rateLimit = checkRateLimit(identity);
    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: `Ai atins limita de ${RATE_LIMIT_MAX_REQUESTS} cereri pe minut. Poți reîncerca după ${rateLimit.retryAtIso}.`,
          retryAt: rateLimit.retryAtIso
        },
        { status: 429 }
      );
    }

    // De ce: provider-ul și modelul vin din client cu fiecare mesaj. Validez contra registrului
    // și cad pe implicit dacă nu sunt valide sau dacă client-ul a trimis ceva neașteptat.
    const providerId: ProviderId = body?.providerId ?? body?.selectedProvider ?? DEFAULT_PROVIDER_ID;
    const requestedModelId: string = body?.modelId ?? body?.selectedModel ?? DEFAULT_MODEL_ID;
    const resolvedSelection = resolveProviderModel(providerId, requestedModelId);
    const resolvedModelId = resolvedSelection.modelId;
    const pricing = getModelPricing(resolvedSelection.providerId, resolvedModelId);

    // De ce: verific dacă provider-ul cerut e configurat. Dacă nu, returnez 400 cu mesaj clar.
    if (!isProviderConfigured(resolvedSelection.providerId)) {
      const providerLabel =
        PROVIDER_REGISTRY.find(p => p.id === resolvedSelection.providerId)?.label || resolvedSelection.providerId;
      const missingKeyName = resolvedSelection.providerId === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY";

      return Response.json(
        {
          error: `Provider ${providerLabel} not configured: ${missingKeyName} is not set.`
        },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(profile);
    const modelMessages = await convertToModelMessages(messages);
    const messagesHash = hashString(JSON.stringify(modelMessages));
    const cacheKey = buildCacheKey({
      providerId: resolvedSelection.providerId,
      modelId: resolvedModelId,
      systemPrompt,
      messagesHash
    });

    // De ce: la "Mai încearcă" trimitem bypassCache=true din client.
    // Dacă am servi din cache aici, butonul n-ar mai chema modelul și ar părea "stricat".
    if (!bypassCache) {
      const cached = get<CachedAssistantResponse>(cacheKey);
      if (cached) {
        return buildCachedStream(messages, cached);
      }
    }

    // De ce: getModel validează modelId contra registrului și cade pe implicit dacă nu e valid.
    // Întoarce SDK-ul instanțiat cu cheia API. E singurul loc din app care face asta.
    const model = getModel(resolvedSelection.providerId, resolvedModelId);
    let generatedText = "";
    let assistantMetadata: ChatMessageMetadata | undefined;

    const result = streamText({
      model,
      // De ce: system prompt-ul este construit exclusiv pe server, ca să nu poată fi citit sau suprascris din browser.
      system: systemPrompt,
      messages: modelMessages,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          generatedText += chunk.text;
        }
      },
      onFinish: ({ usage }) => {
        const usageSnapshot = {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens
        };
        const costSnapshot = calculateMessageCost(usageSnapshot, pricing);

        assistantMetadata = {
          providerId: resolvedSelection.providerId,
          modelId: resolvedModelId,
          fromCache: false,
          usage: usageSnapshot,
          inputIncludesHistory: true,
          cost: costSnapshot
        };

        set(cacheKey, {
          text: generatedText,
          metadata: assistantMetadata
        } satisfies CachedAssistantResponse);
      }
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return assistantMetadata;
        }

        return undefined;
      },
      onError: () => "A apărut o eroare la generarea răspunsului. Încearcă din nou."
    });
  } catch {
    return Response.json(
      { error: "Cererea de chat nu a putut fi procesată. Verifică datele trimise și încearcă din nou." },
      { status: 400 }
    );
  }
}
