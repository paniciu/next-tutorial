"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { extractMessageText } from "@/lib/message-utils";
import { cn } from "@/lib/utils";

type MessageItemProps = {
  message: UIMessage;
  onRegenerate: (messageId: string) => Promise<void>;
  canRegenerate: boolean;
  isLastAssistant: boolean;
};

// De ce: separăm item-ul de mesaj pentru a păstra clară diferența de tratament între roluri, copy actions și extinderile viitoare pe fiecare bulă.
export function MessageItem({ message, onRegenerate, canRegenerate, isLastAssistant }: MessageItemProps) {
  const isUser = message.role === "user";
  const [canUseClipboard, setCanUseClipboard] = useState(false);
  const textContent = extractMessageText(message);

  useEffect(() => {
    const clipboardAvailable =
      typeof window !== "undefined" &&
      window.isSecureContext &&
      typeof navigator !== "undefined" &&
      Boolean(navigator.clipboard?.writeText);

    setCanUseClipboard(clipboardAvailable);
  }, []);

  const canShowRegenerate = message.role === "assistant" && isLastAssistant;

  return (
    <article className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar size="sm">
          <AvatarFallback>SF</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "group relative max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed md:max-w-[75%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p
          className={cn(
            "mb-2 text-xs font-medium uppercase",
            isUser ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {isUser ? "Tu" : "SkillForge"}
        </p>
        <p className="whitespace-pre-wrap">{textContent}</p>

        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {canShowRegenerate ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className={cn(
                    isUser ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" : ""
                  )}
                  disabled={!canRegenerate}
                  onClick={() => {
                    void onRegenerate(message.id);
                  }}
                >
                  <RefreshCcw className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mai încearcă</TooltipContent>
            </Tooltip>
          ) : null}

          {canUseClipboard ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className={cn(
                    isUser ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" : ""
                  )}
                  onClick={async () => {
                    await navigator.clipboard.writeText(textContent);
                    toast.success("Mesaj copiat.");
                  }}
                >
                  <Copy className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiază</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className={cn(
                    "cursor-not-allowed opacity-60",
                    isUser ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" : ""
                  )}
                  onClick={() => {
                    toast.error("Copierea directă merge doar pe localhost sau HTTPS.");
                  }}
                >
                  <Copy className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clipboard indisponibil</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar size="sm">
          <AvatarFallback>{"TU"}</AvatarFallback>
        </Avatar>
      )}
    </article>
  );
}
