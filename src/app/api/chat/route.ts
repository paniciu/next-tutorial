import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";

import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID } from "@/lib/providers";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are SkillForge, a practical AI career copilot.
Give concise, actionable guidance in Romanian.
When useful, structure the answer as short steps.
Avoid inventing user data.`;

type RequestProfile = {
  name?: string;
  currentStack?: string;
  skills?: string;
  objective?: string;
};

function buildProfileContext(profile: RequestProfile | undefined) {
  if (!profile) {
    return "";
  }

  const parts = [
    profile.name ? `Nume: ${profile.name}` : null,
    profile.currentStack ? `Stack curent: ${profile.currentStack}` : null,
    profile.skills ? `Skill-uri: ${profile.skills}` : null,
    profile.objective ? `Obiectiv: ${profile.objective}` : null
  ].filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  return `\n\nContext profil utilizator:\n${parts.join("\n")}`;
}

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
    const profile = body?.profile as RequestProfile | undefined;

    const anthropic = createAnthropic({ apiKey });

    const result = streamText({
      model: anthropic(DEFAULT_MODEL_ID),
      system: `${SYSTEM_PROMPT}${buildProfileContext(profile)}`,
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
