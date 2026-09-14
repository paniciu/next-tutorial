"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";

import { ChatInput } from "@/components/chat/chat-input";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DEFAULT_MODEL_ID, PROVIDER_REGISTRY } from "@/lib/providers";
import type { ProviderId } from "@/lib/types";
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
  providerDisabledReasons: Record<ProviderId, string | null>;
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
  modelLabel,
  providerDisabledReasons
}: ChatProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [draft, setDraft] = useState("");

  const profile = useAppStore(state => state.profile);
  const selectedProvider = useAppStore(state => state.selectedProvider);
  const selectedModel = useAppStore(state => state.selectedModel);
  const setProviderModel = useAppStore(state => state.setProviderModel);

  const isAssistantTyping = status === "submitted" || status === "streaming";

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

  // De ce: editare unui mesaj al utilizatorului taie conversația de la acel mesaj în jos
  // (inclusiv răspunsul care urma) și retrimite din nou. Aceasta asigură că modelul
  // primește un istoric coerent, fără fire paralele. Editarea nu e disponibilă în timp ce
  // răspunsul curge (cât timp isAssistantTyping = true).
  const handleEditAndResend = async (messageId: string, newContent: string) => {
    if (isAssistantTyping) {
      return;
    }

    // De ce: simulez trimiterea: pun draft-ul și apelez handleSubmit ca să merg pe fluxul normal.
    setDraft(newContent);
    await onSendMessage(newContent);
  };

  return (
    <section className="flex min-h-[calc(100svh-56px)] flex-col">
      {messages.length > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <MessageList
              messages={messages}
              isTyping={isAssistantTyping}
              isLoading={false}
              error={error}
              onRegenerateMessage={onRegenerateMessage}
              onEditAndResendMessage={handleEditAndResend}
              canRegenerate={!isAssistantTyping}
              canEdit={!isAssistantTyping}
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
              selectedProviderId={selectedProvider as ProviderId}
              selectedModelId={selectedModel}
              onProviderChange={(newProviderId: ProviderId) => {
                const provider = PROVIDER_REGISTRY.find(p => p.id === newProviderId);
                const firstModelId = provider?.models[0]?.id ?? DEFAULT_MODEL_ID;
                setProviderModel(newProviderId, firstModelId);
              }}
              onModelChange={(modelId: string) => setProviderModel(selectedProvider as ProviderId, modelId)}
              providerDisabledReasons={providerDisabledReasons}
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
              selectedProviderId={selectedProvider as ProviderId}
              selectedModelId={selectedModel}
              onProviderChange={(newProviderId: ProviderId) => {
                const provider = PROVIDER_REGISTRY.find(p => p.id === newProviderId);
                const firstModelId = provider?.models[0]?.id ?? DEFAULT_MODEL_ID;
                setProviderModel(newProviderId, firstModelId);
              }}
              onModelChange={(modelId: string) => setProviderModel(selectedProvider as ProviderId, modelId)}
              providerDisabledReasons={providerDisabledReasons}
            />
          </div>
        </div>
      )}
    </section>
  );
}
