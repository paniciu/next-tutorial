"use client";

import { useEffect, useRef } from "react";
import { Plus, Send, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isTyping: boolean;
  providerLabel: string;
  modelLabel: string;
};

// De ce: composer-ul este separat pentru că va deveni punctul cu cele mai multe reguli de interacțiune când adăugăm streaming și atașamente.
export function ChatInput({ value, onChange, onSubmit, onStop, isTyping, providerLabel, modelLabel }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [value]);

  return (
    <div className="rounded-2xl border bg-card p-3 shadow-xs">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Scrie mesajul tău..."
        className="max-h-60 min-h-16 resize-none border-0 px-0 py-1 shadow-none focus-visible:ring-0"
        onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (isTyping) {
              onStop();
              return;
            }
            onSubmit();
          }
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Atașamente (în curând)">
          <Plus className="size-4" />
        </Button>

        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {providerLabel} · {modelLabel}
          </p>
          <Button type="button" size="sm" onClick={isTyping ? onStop : onSubmit}>
            {isTyping ? <Square className="size-3.5" /> : <Send className="size-3.5" />}
            {isTyping ? "Stop" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
