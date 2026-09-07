"use client";

import type { UIMessage } from "ai";
import { LoaderCircle, TriangleAlert } from "lucide-react";

import { MessageItem } from "@/components/chat/message-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type MessageListProps = {
  messages: UIMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
};

// De ce: acest container gestionează explicit stările critice (loading, typing, error) ca integrarea cu date reale să nu spargă experiența de conversație.
export function MessageList({ messages, isTyping, isLoading, error }: MessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-6">
        <Skeleton className="h-20 w-[78%] rounded-2xl" />
        <Skeleton className="ml-auto h-16 w-[68%] rounded-2xl" />
        <Skeleton className="h-24 w-[74%] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {error ? (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>A apărut o eroare</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isTyping ? (
        <article className="flex items-center gap-3 rounded-2xl border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          SkillForge scrie...
        </article>
      ) : null}
    </div>
  );
}
