"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserProfile } from "@/lib/types";

type ProfileFormProps = {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
};

const emptyProfile: UserProfile = {
  name: "",
  currentStack: "",
  skills: "",
  objective: ""
};

// De ce: ținem editarea profilului într-un formular dedicat pentru că profilul e sursa centrală de context, nu un detaliu secundar de UI.
export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [draft, setDraft] = useState<UserProfile>(profile);

  return (
    <form
      className="space-y-4"
      onSubmit={event => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="profile-name">Nume complet</Label>
        <Input
          id="profile-name"
          value={draft.name}
          onChange={event => setDraft(state => ({ ...state, name: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-stack">Stack actual</Label>
        <Input
          id="profile-stack"
          value={draft.currentStack}
          onChange={event => setDraft(state => ({ ...state, currentStack: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-skills">Skills</Label>
        <Textarea
          id="profile-skills"
          value={draft.skills}
          onChange={event => setDraft(state => ({ ...state, skills: event.target.value }))}
          placeholder="react: intermediar"
          className="min-h-28"
        />
        <p className="text-xs text-muted-foreground">
          O pereche pe linie, format nume: nivel. Niveluri permise: începător, intermediar, avansat.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-objective">Obiectiv</Label>
        <Input
          id="profile-objective"
          value={draft.objective}
          onChange={event => setDraft(state => ({ ...state, objective: event.target.value }))}
        />
      </div>

      <Button type="submit">Salvează profilul</Button>

      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          // De ce: profilul este dată personală și are nevoie de o acțiune clară de ștergere, nu doar de editare manuală.
          setDraft(emptyProfile);
          onSave(emptyProfile);
        }}
      >
        Șterge profilul local
      </Button>

      <p className="text-xs text-muted-foreground">
        Date personale colectate: nume, stack, skill-uri cu nivel și obiectiv. În etapa curentă datele sunt stocate
        local în acest browser, în localStorage (cheia <span className="font-mono">skillforge-app</span>). Profilul
        devine vizibil pentru providerul LLM doar când trimiți un mesaj în chat. Îl poți șterge aici sau din Setări
        browser → Site data.
      </p>
    </form>
  );
}
