"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileSkill, SkillLevel, UserProfile } from "@/lib/types";

type ProfileFormProps = {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
};

const emptyProfile: UserProfile = {
  name: "",
  currentStack: "",
  skills: [],
  skillNotes: "",
  objective: ""
};

const SKILL_LEVEL_OPTIONS: Array<{ value: SkillLevel; label: string }> = [
  { value: "începător", label: "Incepator" },
  { value: "intermediar", label: "Intermediar" },
  { value: "avansat", label: "Avansat" }
];

function makeSkillItem(name = "", level: SkillLevel = "începător"): ProfileSkill {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    level
  };
}

// De ce: ținem editarea profilului într-un formular dedicat pentru că profilul e sursa centrală de context, nu un detaliu secundar de UI.
export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [draft, setDraft] = useState<UserProfile>(profile);

  return (
    <form
      className="flex h-full min-h-0 flex-col"
      onSubmit={event => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
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
          <Label>Skills</Label>
          <div className="space-y-2">
            {draft.skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-2">
                <Input
                  value={skill.name}
                  onChange={event =>
                    setDraft(state => ({
                      ...state,
                      skills: state.skills.map(item =>
                        item.id === skill.id ? { ...item, name: event.target.value } : item
                      )
                    }))
                  }
                  placeholder="Nume skill"
                  className="flex-1"
                />

                <Select
                  value={skill.level}
                  onValueChange={value =>
                    setDraft(state => ({
                      ...state,
                      skills: state.skills.map(item =>
                        item.id === skill.id ? { ...item, level: value as SkillLevel } : item
                      )
                    }))
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVEL_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Șterge skill"
                  onClick={() =>
                    setDraft(state => ({
                      ...state,
                      skills: state.skills.filter(item => item.id !== skill.id)
                    }))
                  }
                >
                  <X />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDraft(state => ({
                  ...state,
                  skills: [...state.skills, makeSkillItem()]
                }))
              }
            >
              Adaugă skill
            </Button>
          </div>

          <Label htmlFor="profile-skill-notes">Notes</Label>
          <Textarea
            id="profile-skill-notes"
            value={draft.skillNotes}
            onChange={event => setDraft(state => ({ ...state, skillNotes: event.target.value }))}
            placeholder="Observații despre skills, priorități, lipsuri, plan de practică..."
            className="min-h-28"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-objective">Obiectiv</Label>
          <Input
            id="profile-objective"
            value={draft.objective}
            onChange={event => setDraft(state => ({ ...state, objective: event.target.value }))}
          />
        </div>

        <p className="text-xs break-words whitespace-normal text-muted-foreground">
          Date personale colectate: nume, stack, skill-uri cu nivel și obiectiv. În etapa curentă datele sunt stocate
          local în acest browser, în localStorage (cheia <span className="font-mono">skillforge-app</span>). Profilul
          devine vizibil pentru providerul LLM doar când trimiți un mesaj în chat. Îl poți șterge aici sau din Setări
          browser → Site data.
        </p>
      </div>

      <div className="shrink-0 border-t bg-background py-3">
        <div className="flex flex-wrap justify-end gap-2">
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

          <Button type="submit">Salvează profilul</Button>
        </div>
      </div>
    </form>
  );
}
