"use client";

import { useState } from "react";
import { Copy, Edit2, RefreshCcw, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MarkdownRenderer } from "@/components/chat/markdown";
import { formatTokenCount, formatUsd } from "@/lib/cost";
import { extractMessageText } from "@/lib/message-utils";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type MessageItemProps = {
  message: ChatMessage;
  onRegenerate: (messageId: string) => Promise<void>;
  onEditAndResend: (messageId: string, newContent: string) => Promise<void>;
  canRegenerate: boolean;
  canEdit: boolean;
  isLastAssistant: boolean;
};

export function MessageItem({
  message,
  onRegenerate,
  onEditAndResend,
  canRegenerate,
  canEdit,
  isLastAssistant
}: MessageItemProps) {
  const isUser = message.role === "user";
  const textContent = extractMessageText(message);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(textContent);

  // De ce: detect clipboard availability la render time, nu în effect.
  const canUseClipboard =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard?.writeText);

  const canShowRegenerate = message.role === "assistant" && isLastAssistant;
  const metadata = message.metadata;
  const cost = metadata?.cost;

  const handleEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === textContent) {
      setIsEditing(false);
      return;
    }

    setIsEditing(false);
    await onEditAndResend(message.id, trimmed);
  };

  const handleCancel = () => {
    setEditValue(textContent);
    setIsEditing(false);
  };

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

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className={cn(
                "min-h-16 resize-none border-0 px-0 py-1 text-sm shadow-none focus-visible:ring-0",
                isUser ? "text-primary-foreground placeholder:text-primary-foreground/50" : ""
              )}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className={cn(
                  isUser ? "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/15" : ""
                )}
              >
                <X className="mr-1 size-3" />
                Anulează
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleEdit}
                className={cn(isUser ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : "")}
              >
                <Send className="mr-1 size-3" />
                Retrimite
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isUser ? <p className="whitespace-pre-wrap">{textContent}</p> : <MarkdownRenderer content={textContent} />}

            {!isUser && cost ? (
              <div className="mt-3 space-y-1 border-t pt-2 text-[11px] text-muted-foreground">
                <p>
                  Intrare (include istoric retrimis): {formatTokenCount(metadata?.usage.inputTokens)} tokeni ·{" "}
                  {formatUsd(cost.inputCostUsd)}
                </p>
                <p>
                  Ieșire: {formatTokenCount(metadata?.usage.outputTokens)} tokeni · {formatUsd(cost.outputCostUsd)}
                </p>
                <p>
                  Total răspuns: {formatUsd(cost.billedCostUsd)}
                  {metadata?.fromCache ? " · din cache (fără cost nou)" : ""}
                </p>
              </div>
            ) : null}
          </>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {isUser && canEdit && !isEditing ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editează</TooltipContent>
            </Tooltip>
          ) : null}

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
                  disabled
                  className={cn(
                    "cursor-not-allowed opacity-60",
                    isUser ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" : ""
                  )}
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
