"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";

import { ChatInput } from "@/components/chat/chat-input";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";

type ChatProps = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onStop: () => void;
  onRegenerateMessage: (messageId: string) => Promise<void>;
  activeConversationId: string;
  providerLabel: string;
  modelLabel: string;
};

// De ce: orchestratorul de chat ține împreună fluxul mesajelor și stările tranzitorii, ca subcomponentele să rămână mici și explicabile.
export function Chat({
  messages,
  status,
  error,
  onSendMessage,
  onStop,
  onRegenerateMessage,
  activeConversationId,
  providerLabel,
  modelLabel
}: ChatProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [draft, setDraft] = useState("");
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const profile = useAppStore(state => state.profile);

  const isAssistantTyping = status === "submitted" || status === "streaming";

  useEffect(() => {
    const startId = window.setTimeout(() => {
      setIsLoadingConversation(Boolean(activeConversationId));
    }, 0);

    const timeoutId = window.setTimeout(() => setIsLoadingConversation(false), 320);

    return () => {
      window.clearTimeout(startId);
      window.clearTimeout(timeoutId);
    };
  }, [activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const handleSubmit = async () => {
    const content = draft.trim();
    if (!content || isAssistantTyping) {
      return;
    }

    setDraft("");

    await onSendMessage(content);
  };

  return (
    <section className="flex min-h-[calc(100svh-56px)] flex-col">
      {messages.length > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <MessageList
              messages={messages}
              isTyping={isAssistantTyping}
              isLoading={isLoadingConversation}
              error={error}
              onRegenerateMessage={onRegenerateMessage}
              canRegenerate={!isAssistantTyping}
            />
            <div ref={bottomRef} />
          </ScrollArea>

          <div className="mx-auto w-full max-w-4xl px-4 pb-5">
            <ChatInput
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onStop={onStop}
              isTyping={isAssistantTyping}
              providerLabel={providerLabel}
              modelLabel={modelLabel}
              focusKey={`${activeConversationId}-${status}`}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-3xl space-y-6">
            <EmptyState name={profile.name} objective={profile.objective} onUseSuggestion={setDraft} />
            <ChatInput
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onStop={onStop}
              isTyping={isAssistantTyping}
              providerLabel={providerLabel}
              modelLabel={modelLabel}
              focusKey={`${activeConversationId}-${status}`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
