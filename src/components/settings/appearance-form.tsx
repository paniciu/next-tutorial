"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ThemePreference } from "@/lib/types";

type AppearanceFormProps = {
  value: ThemePreference;
  onChange: (theme: ThemePreference) => void;
};

// De ce: izolăm alegerea de temă într-un formular separat ca singurul punct oficial de control să rămână în preferințe.
export function AppearanceForm({ value, onChange }: AppearanceFormProps) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm font-medium">Appearance</p>
        <p className="text-sm text-muted-foreground">Tema aplicației se schimbă doar din acest panou.</p>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={nextValue => {
          if (nextValue) {
            onChange(nextValue as ThemePreference);
          }
        }}
      >
        <ToggleGroupItem value="system" aria-label="Sistem" className="gap-2">
          <Monitor className="size-4" />
          Sistem
        </ToggleGroupItem>
        <ToggleGroupItem value="light" aria-label="Light" className="gap-2">
          <Sun className="size-4" />
          Light
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark" className="gap-2">
          <Moon className="size-4" />
          Dark
        </ToggleGroupItem>
      </ToggleGroup>
    </section>
  );
}
