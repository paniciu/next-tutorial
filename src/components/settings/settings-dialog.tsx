"use client";

import { type ComponentType, type ReactNode, useState } from "react";
import { Settings, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AppearanceForm } from "@/components/settings/appearance-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { mockProviderModels } from "@/lib/mock/profile";
import type { SettingsSection } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SettingsRegistryItem = {
  id: SettingsSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const settingsRegistry: SettingsRegistryItem[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "profile", label: "Profilul tău", icon: UserRound },
  { id: "providers", label: "Providere", icon: Sparkles }
];

// De ce: preferințele sunt mutate într-un dialog separat pentru a menține conversația principală curată și continuă, exact ca fluxul de produs dorit.
export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

  const profile = useAppStore(state => state.profile);
  const selectedProvider = useAppStore(state => state.selectedProvider);
  const selectedModel = useAppStore(state => state.selectedModel);
  const themePreference = useAppStore(state => state.themePreference);
  const setThemePreference = useAppStore(state => state.setThemePreference);
  const setProviderModel = useAppStore(state => state.setProviderModel);
  const updateProfile = useAppStore(state => state.updateProfile);

  const sectionContentRegistry: Record<SettingsSection, ReactNode> = {
    general: <AppearanceForm value={themePreference} onChange={setThemePreference} />,
    profile: (
      <ProfileForm
        profile={profile}
        onSave={nextProfile => {
          updateProfile(nextProfile);
          toast.success("Profil actualizat.");
        }}
      />
    ),
    providers: (
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium">Providere disponibile</p>
          <p className="text-sm text-muted-foreground">
            Selecția rămâne locală acum și va fi legată de apelurile reale server-side în pasul următor.
          </p>
        </div>
        <div className="space-y-2">
          {mockProviderModels.map(option => {
            const isActive = option.provider === selectedProvider && option.model === selectedModel;

            return (
              <Button
                key={`${option.provider}-${option.model}`}
                type="button"
                variant={isActive ? "default" : "outline"}
                className="w-full justify-between"
                onClick={() => {
                  setProviderModel(option.provider, option.model);
                  toast.success("Provider actualizat.");
                }}
              >
                <span>{option.label}</span>
                {isActive ? <Badge variant="secondary">Activ</Badge> : null}
              </Button>
            );
          })}
        </div>
      </section>
    )
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 sm:max-w-4xl" showCloseButton>
        <DialogHeader className="sr-only">
          <DialogTitle>Preferințe SkillForge</DialogTitle>
          <DialogDescription>Gestionează profilul, tema și providerul activ.</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-[240px_1fr]">
          <aside className="border-r bg-muted/30 p-4">
            <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Settings</p>
            <nav className="space-y-1">
              {settingsRegistry.map(item => {
                const Icon = item.icon;
                const isActive = item.id === activeSection;

                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="p-5 pb-4">
              <h2 className="text-base font-semibold">
                {settingsRegistry.find(item => item.id === activeSection)?.label}
              </h2>
            </div>
            <Separator />
            <div className="min-h-0 flex-1 overflow-y-auto p-5">{sectionContentRegistry[activeSection]}</div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
