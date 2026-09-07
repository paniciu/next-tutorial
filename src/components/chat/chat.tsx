"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/chat-input";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockProviderModels } from "@/lib/mock/profile";
import { useAppStore } from "@/store/useAppStore";

// De ce: orchestratorul de chat ține împreună fluxul mesajelor și stările tranzitorii, ca subcomponentele să rămână mici și explicabile.
export function Chat() {
  const timerRef = useRef<number | null>(null);

  const [draft, setDraft] = useState("");
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const profile = useAppStore(state => state.profile);
  const conversations = useAppStore(state => state.conversations);
  const activeConversationId = useAppStore(state => state.activeConversationId);
  const selectedProvider = useAppStore(state => state.selectedProvider);
  const selectedModel = useAppStore(state => state.selectedModel);
  const isAssistantTyping = useAppStore(state => state.isAssistantTyping);
  const chatError = useAppStore(state => state.chatError);
  const sendMessage = useAppStore(state => state.sendMessage);
  const setTyping = useAppStore(state => state.setTyping);
  const appendAssistantMessage = useAppStore(state => state.appendAssistantMessage);
  const stopAssistant = useAppStore(state => state.stopAssistant);
  const setChatError = useAppStore(state => state.setChatError);
  const getRandomAssistantReply = useAppStore(state => state.getRandomAssistantReply);

  const activeConversation = conversations.find(item => item.id === activeConversationId) ?? null;

  const selectedProviderLabel = useMemo(() => {
    const match = mockProviderModels.find(item => item.provider === selectedProvider && item.model === selectedModel);
    return match?.provider ?? selectedProvider;
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
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleStop = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    stopAssistant();
  };

  const handleSubmit = () => {
    const content = draft.trim();
    if (!content || isAssistantTyping) {
      return;
    }

    setChatError(null);
    const conversation = sendMessage(content);
    setDraft("");
    setTyping(true);

    timerRef.current = window.setTimeout(() => {
      const latest = useAppStore.getState();
      if (!latest.isAssistantTyping) {
        return;
      }

      if (/eroare/i.test(content)) {
        latest.setChatError("Simulare eroare locală: răspunsul nu a putut fi generat. Încearcă din nou.");
        return;
      }

      appendAssistantMessage(conversation.id, getRandomAssistantReply());
      timerRef.current = null;
    }, 1200);
  };

  return (
    <section className="flex min-h-[calc(100svh-56px)] flex-col">
      {activeConversation ? (
        <>
          <ScrollArea className="flex-1">
            <MessageList
              messages={activeConversation.messages}
              isTyping={isAssistantTyping}
              isLoading={isLoadingConversation}
              error={chatError}
            />
          </ScrollArea>

          <div className="mx-auto w-full max-w-4xl px-4 pb-5">
            <ChatInput
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onStop={handleStop}
              isTyping={isAssistantTyping}
              providerLabel={selectedProviderLabel}
              modelLabel={selectedModel}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-3xl space-y-6">
            <EmptyState name={profile.name} onUseSuggestion={setDraft} />
            <ChatInput
              value={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onStop={handleStop}
              isTyping={isAssistantTyping}
              providerLabel={selectedProviderLabel}
              modelLabel={selectedModel}
            />
          </div>
        </div>
      )}
    </section>
  );
}
