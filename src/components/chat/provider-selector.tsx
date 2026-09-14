"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PROVIDER_REGISTRY } from "@/lib/providers";
import type { ProviderId } from "@/lib/types";

type ProviderSelectorProps = {
  selectedProviderId: ProviderId;
  selectedModelId: string;
  onProviderChange: (providerId: ProviderId) => void;
  onModelChange: (modelId: string) => void;
  // De ce: O hartă din providerId la motiv dacă nu e configurat. Dacă provider-ul e în hartă,
  // e dezactivat și cu tooltip cu motiv. Dată de la server, nu calculată din browser.
  providerDisabledReasons: Record<ProviderId, string | null>;
};

// De ce: Selectorul de provider și model stă lângă caseta de scris ca o decizie de moment,
// nu ca o setare. Fiecare mesaj știe cu ce provider a fost trimis. Ordinea în interfață
// e ordinea din PROVIDER_REGISTRY (Anthropic primul, implicit). Provider-ul dezactivat
// apare în listă dar nu se poate selecta, cu motivul în tooltip.
export function ProviderSelector({
  selectedProviderId,
  selectedModelId,
  onProviderChange,
  onModelChange,
  providerDisabledReasons
}: ProviderSelectorProps) {
  const selectedProvider = PROVIDER_REGISTRY.find(p => p.id === selectedProviderId);

  const isSelectedProviderDisabled = Boolean(providerDisabledReasons[selectedProviderId]);

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        {/* De ce: Selectul de provider stă liber ca să poată comuta între providere pentru mesajul curent. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1">
              <Select
                value={selectedProviderId}
                onValueChange={(value: string) => onProviderChange(value as ProviderId)}
              >
                <SelectTrigger disabled={isSelectedProviderDisabled} className="w-full">
                  <SelectValue placeholder="Alege provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_REGISTRY.map(provider => {
                    const disabledReason = providerDisabledReasons[provider.id];
                    return (
                      <SelectItem
                        key={provider.id}
                        value={provider.id}
                        disabled={Boolean(disabledReason)}
                        title={disabledReason || undefined}
                      >
                        <div className="flex items-center gap-2">
                          <span>{provider.label}</span>
                          {disabledReason && <span className="text-xs text-muted-foreground">({disabledReason})</span>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {isSelectedProviderDisabled && (
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{isSelectedProviderDisabled}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* De ce: Selectul de model e dependent de provider. Dacă provider-ul se schimbă,
        se ia automat primul model disponibil din lista lui. Nu poți selecta model din
        alt provider decât dacă schimbi provider. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1">
              <Select value={selectedModelId} onValueChange={onModelChange} disabled={isSelectedProviderDisabled}>
                <SelectTrigger disabled={isSelectedProviderDisabled} className="w-full">
                  <SelectValue placeholder="Alege model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider?.models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  )) || <SelectItem value="">Niciun model disponibil</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {isSelectedProviderDisabled && (
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{isSelectedProviderDisabled}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
