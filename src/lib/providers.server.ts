import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID, PROVIDER_REGISTRY } from "@/lib/providers";
import type { ProviderId } from "@/lib/types";

// De ce: Funcția getModel e singurul loc din aplicație care instanțiază un SDK de provider.
// Modelul este validat contra registrului — dacă id-ul nu există acolo (stare veche în localStorage
// sau cerere fabricată de mână), se cade pe modelul implicit din provider (DEFAULT_MODEL_ID al acelui provider).
// Această validare apără împotriva erorilor de evoluție și a manipulării manuale.
export function getModel(providerId: ProviderId, modelId: string) {
  const provider = PROVIDER_REGISTRY.find(p => p.id === providerId);

  if (!provider) {
    // Dacă provider-ul nu e în registru, cad pe implicit
    const fallbackProvider = PROVIDER_REGISTRY.find(p => p.id === DEFAULT_PROVIDER_ID);
    if (!fallbackProvider) {
      throw new Error(
        `Nu s-a putut găsi nici provider-ul cerut (${providerId}) nici cel implicit (${DEFAULT_PROVIDER_ID}).`
      );
    }
    return getModelForProvider(DEFAULT_PROVIDER_ID, DEFAULT_MODEL_ID);
  }

  // Validez că modelId-ul există în lista de modele ale provider-ului
  const modelExists = provider.models.some(m => m.id === modelId);
  if (!modelExists) {
    // Dacă modelId nu e în registru, cad pe DEFAULT_MODEL_ID al provider-ului cerut
    const fallbackModelId = provider.models[0]?.id;
    if (!fallbackModelId) {
      throw new Error(`Provider-ul ${providerId} nu are niciun model registrat.`);
    }
    return getModelForProvider(providerId, fallbackModelId);
  }

  return getModelForProvider(providerId, modelId);
}

// De ce: Helper privat care instanțiază SDK-ul și modelul. Separat de validare, ca logica
// să fie clară: validare → instanțiere.
function getModelForProvider(providerId: ProviderId, modelId: string) {
  const apiKey = getProviderApiKey(providerId);

  if (!apiKey) {
    throw new Error(`Provider ${providerId} nu are cheie API configurată.`);
  }

  switch (providerId) {
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    case "google": {
      throw new Error("Google Cloud provider nu este implementat în această fază.");
    }
    default: {
      const exhaustive: never = providerId;
      throw new Error(`Provider necunoscut: ${exhaustive}`);
    }
  }
}

// De ce: Funcția isProviderConfigured e folosită pe server ca să spun clientului dacă
// un provider e disponibil. Clientul nu atinge niciodată process.env, nici măcar
// Boolean(process.env.FOO). Disponibilitatea e o proprietate a serverului și ajunge
// la interfață doar ca date de afișat — niciodată ca valoare de cheie.
export function isProviderConfigured(providerId: ProviderId): boolean {
  const apiKey = getProviderApiKey(providerId);
  return Boolean(apiKey && apiKey.trim().length > 0);
}

// De ce: Helper privat care citește variabila de mediu.
// Aici e singurul loc din app care atinge process.env pentru chei de provider.
function getProviderApiKey(providerId: ProviderId): string | undefined {
  switch (providerId) {
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "google":
      return undefined;
    default:
      return undefined;
  }
}
