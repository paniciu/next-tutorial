"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

type MessageItemProps = {
  message: ChatMessage;
};

// De ce: separăm item-ul de mesaj pentru a păstra clară diferența de tratament între roluri, copy actions și extinderile viitoare pe fiecare bulă.
export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

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
        <p className="whitespace-pre-wrap">{message.content}</p>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100",
                isUser ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" : ""
              )}
              onClick={async () => {
                await navigator.clipboard.writeText(message.content);
                toast.success("Mesaj copiat.");
              }}
            >
              <Copy className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>

      {isUser && (
        <Avatar size="sm">
          <AvatarFallback>{"TU"}</AvatarFallback>
        </Avatar>
      )}
    </article>
  );
}
