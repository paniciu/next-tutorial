import type { ModelPricing, ProviderId, ProviderModelOption } from "@/lib/types";

export const DEFAULT_PROVIDER_ID: ProviderId = "anthropic";
export const DEFAULT_MODEL_ID = "claude-haiku-4-5";

type ProviderRegistryEntry = {
  id: ProviderId;
  label: string;
  models: Array<{ id: string; label: string; pricing: ModelPricing }>;
};

// De ce: ținem registry-ul de provider/model într-un singur fișier ca ruta de server și UI-ul să nu poată devia pe ID-uri diferite.
// ATENȚIE: fișierul providers.ts ajunge în browser. Nu pune aici nicio cheie și nici apeluri la process.env.
// Toda ce ține de chei și SDK stă în providers.server.ts.
export const PROVIDER_REGISTRY: ProviderRegistryEntry[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    models: [
      {
        id: "claude-haiku-4-5",
        label: "Claude Haiku 4.5",
        pricing: {
          inputPerMillionUsd: 0.8,
          outputPerMillionUsd: 4,
          checkedAt: "2026-09-16"
        }
      }
    ]
  },
  {
    id: "openai",
    label: "OpenAI",
    models: [
      {
        id: "gpt-4o-mini",
        label: "GPT-4o Mini",
        pricing: {
          inputPerMillionUsd: 0.15,
          outputPerMillionUsd: 0.6,
          checkedAt: "2026-09-16"
        }
      }
    ]
  }
];

export const providerModelOptions: ProviderModelOption[] = PROVIDER_REGISTRY.flatMap(provider =>
  provider.models.map(model => ({
    provider: provider.id,
    model: model.id,
    label: `${provider.label} · ${model.label}`
  }))
);

export function getProviderModelLabel(providerId: string, modelId: string) {
  const match = providerModelOptions.find(option => option.provider === providerId && option.model === modelId);
  return match?.label ?? `${providerId} · ${modelId}`;
}

export function resolveProviderModel(providerId: ProviderId, modelId: string) {
  const provider = PROVIDER_REGISTRY.find(p => p.id === providerId);
  const fallbackProvider = provider ?? PROVIDER_REGISTRY.find(p => p.id === DEFAULT_PROVIDER_ID);

  if (!fallbackProvider) {
    return {
      providerId: DEFAULT_PROVIDER_ID,
      modelId: DEFAULT_MODEL_ID
    };
  }

  const selectedModel = fallbackProvider.models.find(model => model.id === modelId) ?? fallbackProvider.models[0];

  return {
    providerId: fallbackProvider.id,
    modelId: selectedModel?.id ?? DEFAULT_MODEL_ID
  };
}

export function getModelPricing(providerId: ProviderId, modelId: string): ModelPricing | undefined {
  const resolved = resolveProviderModel(providerId, modelId);
  const provider = PROVIDER_REGISTRY.find(p => p.id === resolved.providerId);
  const model = provider?.models.find(item => item.id === resolved.modelId);

  return model?.pricing;
}
