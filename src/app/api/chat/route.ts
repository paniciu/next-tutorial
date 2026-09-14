import { convertToModelMessages, streamText } from "ai";

import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID, PROVIDER_REGISTRY } from "@/lib/providers";
import { getModel, isProviderConfigured } from "@/lib/providers.server";
import { buildSystemPrompt } from "@/lib/system-prompt";
import type { ProviderId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const profile = body?.profile;
    // De ce: provider-ul și modelul vin din client cu fiecare mesaj. Validez contra registrului
    // și cad pe implicit dacă nu sunt valide sau dacă client-ul a trimis ceva neașteptat.
    const providerId: ProviderId = body?.providerId ?? DEFAULT_PROVIDER_ID;
    const modelId: string = body?.modelId ?? DEFAULT_MODEL_ID;

    // De ce: verific dacă provider-ul cerut e configurat. Dacă nu, returnez 400 cu mesaj clar.
    if (!isProviderConfigured(providerId)) {
      const providerLabel = PROVIDER_REGISTRY.find(p => p.id === providerId)?.label || providerId;
      return Response.json(
        {
          error: `Provider ${providerLabel} nu este configurat: variabila API Key nu este setată pe server. Configureaz-o în Environment Variables (Preview + Production) și apoi redeploy.`
        },
        { status: 400 }
      );
    }

    // De ce: getModel validează modelId contra registrului și cade pe implicit dacă nu e valid.
    // Întoarce SDK-ul instanțiat cu cheia API. E singurul loc din app care face asta.
    const model = getModel(providerId, modelId);

    const result = streamText({
      model,
      // De ce: system prompt-ul este construit exclusiv pe server, ca să nu poată fi citit sau suprascris din browser.
      system: buildSystemPrompt(profile),
      messages: await convertToModelMessages(messages)
    });

    return result.toUIMessageStreamResponse({
      onError: () => "A apărut o eroare la generarea răspunsului. Încearcă din nou."
    });
  } catch {
    return Response.json(
      { error: "Cererea de chat nu a putut fi procesată. Verifică datele trimise și încearcă din nou." },
      { status: 400 }
    );
  }
}
