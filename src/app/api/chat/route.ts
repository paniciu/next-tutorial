import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";

import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID } from "@/lib/providers";
import { buildSystemPrompt } from "@/lib/system-prompt";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: "Cheia ANTHROPIC_API_KEY lipsește pe server. Adaug-o în .env.local și repornește aplicația."
      },
      { status: 400 }
    );
  }

  if (DEFAULT_PROVIDER_ID !== "anthropic") {
    return Response.json({ error: "Providerul implicit nu este compatibil cu ruta de chat curentă." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const profile = body?.profile;

    const anthropic = createAnthropic({ apiKey });

    const result = streamText({
      model: anthropic(DEFAULT_MODEL_ID),
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
