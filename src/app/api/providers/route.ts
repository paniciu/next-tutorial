import { PROVIDER_REGISTRY } from "@/lib/providers";
import { isProviderConfigured } from "@/lib/providers.server";
import type { ProviderId } from "@/lib/types";

// De ce: ruta returnează starea fiecărui provider (configurat sau nu, și de ce dacă nu).
// Clientul o folosește ca să afișeze selecturile dezactivate cu motiv. Serverul nu trimite
// niciodată valoarea cheii, doar o valoare booleană calculată din disponibilitate.
export async function GET() {
  const providerAvailability: Record<ProviderId, { available: boolean; reason: string | null }> = {
    anthropic: { available: true, reason: null },
    openai: { available: true, reason: null },
    google: { available: true, reason: null }
  };

  for (const provider of PROVIDER_REGISTRY) {
    const available = isProviderConfigured(provider.id);

    if (!available) {
      const reason =
        provider.id === "anthropic"
          ? "Cheie ANTHROPIC_API_KEY neconfigurată"
          : provider.id === "openai"
            ? "Cheie OPENAI_API_KEY neconfigurată"
            : "Provider neconfigurat";

      providerAvailability[provider.id] = {
        available: false,
        reason
      };
    } else {
      providerAvailability[provider.id] = {
        available: true,
        reason: null
      };
    }
  }

  return Response.json(providerAvailability);
}
