"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StreamStatus = "streaming" | "done" | "error";

// De ce: secțiunea separată pentru "Despre" validează protocolul de streaming fără dependență de provider LLM sau SDK extern.
export function AboutForm() {
  const [runId, setRunId] = useState(0);
  const [status, setStatus] = useState<StreamStatus>("streaming");
  const [text, setText] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    const readStream = async () => {
      try {
        const response = await fetch("/api/about", {
          method: "GET",
          headers: { Accept: "text/event-stream" },
          signal: abortController.signal
        });

        if (!response.ok || !response.body) {
          throw new Error("Nu am putut porni stream-ul pentru descriere.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // De ce: `stream: true` păstrează corect caracterele UTF-8 când un caracter cade între două chunk-uri de rețea.
          buffer += decoder.decode(value, { stream: true });

          // De ce: un chunk de rețea poate conține jumătate de eveniment SSE, deci păstrăm ultima parte incompletă pentru iterarea următoare.
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const eventBlock of parts) {
            const lines = eventBlock.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) {
                continue;
              }

              const payload = line.slice(6);

              if (payload === "[DONE]") {
                if (!abortController.signal.aborted) {
                  setStatus("done");
                }
                return;
              }

              const parsedPayload = JSON.parse(payload) as { content: string };
              accumulatedText += parsedPayload.content;

              if (!abortController.signal.aborted) {
                setText(accumulatedText);
              }
            }
          }
        }

        if (!abortController.signal.aborted) {
          setStatus("done");
        }
      } catch {
        // De ce: anularea la unmount este control flow normal și nu trebuie afișată ca eroare pentru utilizator.
        if (abortController.signal.aborted) {
          return;
        }

        setStatus("error");
        setText("Nu am putut încărca descrierea aplicației. Poți încerca din nou cu butonul Reia.");
      }
    };

    void readStream();

    // De ce: oprim citirea când dialogul/tab-ul se demontează, ca să evităm update-uri de state pe componente inactive.
    return () => {
      abortController.abort();
    };
  }, [runId]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div>
        <p className="text-sm font-medium">Despre aplicație</p>
        <p className="text-sm text-muted-foreground">Descriere livrată incremental de pe server prin SSE, fără SDK.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
        <p className="whitespace-pre-wrap">{text}</p>
        {status === "streaming" ? (
          <span className="ml-0.5 inline-block h-4 w-1 animate-pulse rounded bg-foreground/70" />
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
        <p className={cn("text-xs", status === "error" ? "text-destructive" : "text-muted-foreground")}>
          Sursă: /api/about ({status})
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setText("");
            setStatus("streaming");
            setRunId(current => current + 1);
          }}
        >
          Reia
        </Button>
      </div>
    </section>
  );
}
