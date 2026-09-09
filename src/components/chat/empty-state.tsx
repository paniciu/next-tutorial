"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type EmptyStateProps = {
  name: string;
  objective: string;
  onUseSuggestion: (suggestion: string) => void;
};

const suggestions = ["Plan de învățare", "Gap analysis", "Pregătire interviu", "Alege tu"];

// De ce: ecranul gol oferă direcție clară primului mesaj și reduce blocajul inițial fără să adăugăm acțiuni inutile.
export function EmptyState({ name, objective, onUseSuggestion }: EmptyStateProps) {
  const displayName = name.trim() || "acolo";
  const hasActiveProfile = Boolean(name.trim() || objective.trim());

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">SkillForge</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Salut, {displayName}.</h1>
        <p className="text-sm text-muted-foreground">
          Pornește o conversație nouă și transformăm obiectivul tău într-un plan concret.
        </p>
        {hasActiveProfile ? (
          <div className="flex justify-center pt-1">
            <Badge variant="secondary" className="max-w-full truncate">
              Profil activ: {objective.trim() || name.trim()}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestions.map(suggestion => (
          <Button key={suggestion} variant="outline" size="sm" onClick={() => onUseSuggestion(suggestion)}>
            {suggestion}
          </Button>
        ))}
      </div>
    </section>
  );
}
