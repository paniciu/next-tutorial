"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { ChatInput } from "@/components/chat/chat-input";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProviderModelLabel } from "@/lib/providers";
import { useAppStore } from "@/store/useAppStore";

// De ce: orchestratorul de chat ține împreună fluxul mesajelor și stările tranzitorii, ca subcomponentele să rămână mici și explicabile.
export function Chat() {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [draft, setDraft] = useState("");
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const profile = useAppStore(state => state.profile);
  const activeConversationId = useAppStore(state => state.activeConversationId);
  const selectedProvider = useAppStore(state => state.selectedProvider);
  const selectedModel = useAppStore(state => state.selectedModel);
  const touchConversation = useAppStore(state => state.touchConversation);

  const { messages, sendMessage, stop, status, error } = useChat({
    id: activeConversationId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // De ce: body ca funcție citește store-ul exact la momentul trimiterii și evită profilul "înghețat" de la montare.
      body: () => {
        const state = useAppStore.getState();

        return {
          selectedProvider: state.selectedProvider,
          selectedModel: state.selectedModel,
          profile: state.profile
        };
      }
    })
  });

  const isAssistantTyping = status === "submitted" || status === "streaming";
  const chatError = error
    ? "Nu am putut genera răspunsul acum. Verifică cheia ANTHROPIC_API_KEY pe server și încearcă din nou."
    : null;

  const selectedProviderLabel = useMemo(() => {
    const fullLabel = getProviderModelLabel(selectedProvider, selectedModel);
    return fullLabel.split(" · ")[0] ?? selectedProvider;
  }, [selectedModel, selectedProvider]);

  const selectedModelLabel = useMemo(() => {
    const fullLabel = getProviderModelLabel(selectedProvider, selectedModel);
    return fullLabel.split(" · ")[1] ?? selectedModel;
  }, [selectedModel, selectedProvider]);

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

  const handleStop = () => {
    stop();
  };

  const handleSubmit = async () => {
    const content = draft.trim();
    if (!content || isAssistantTyping) {
      return;
    }

    touchConversation(activeConversationId, content);
    setDraft("");

    await sendMessage({ text: content });
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
              error={chatError}
            />
            <div ref={bottomRef} />
          </ScrollArea>

          <div className="mx-auto w-full max-w-4xl px-4 pb-5">
            <ChatInput
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onStop={handleStop}
              isTyping={isAssistantTyping}
              providerLabel={selectedProviderLabel}
              modelLabel={selectedModelLabel}
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
              onStop={handleStop}
              isTyping={isAssistantTyping}
              providerLabel={selectedProviderLabel}
              modelLabel={selectedModelLabel}
              focusKey={`${activeConversationId}-${status}`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
