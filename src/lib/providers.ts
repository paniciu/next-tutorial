import type { ProviderId, ProviderModelOption } from "@/lib/types";

export const DEFAULT_PROVIDER_ID: ProviderId = "anthropic";
export const DEFAULT_MODEL_ID = "claude-haiku-4-5";

type ProviderRegistryEntry = {
  id: ProviderId;
  label: string;
  models: Array<{ id: string; label: string }>;
};

// De ce: ținem registry-ul de provider/model într-un singur fișier ca ruta de server și UI-ul să nu poată devia pe ID-uri diferite.
export const PROVIDER_REGISTRY: ProviderRegistryEntry[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    models: [{ id: "claude-haiku-4-5", label: "Claude Haiku 4.5" }]
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
