"use client";

import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";

import { Chat } from "@/components/chat/chat";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { serializeConversationExportJson, serializeConversationExportMarkdown } from "@/lib/message-utils";
import { getProviderModelLabel } from "@/lib/providers";
import { useAppStore } from "@/store/useAppStore";

const CHAT_MESSAGES_STORAGE_KEY = "skillforge-chat-messages";

function readStoredConversationMessages() {
  if (typeof window === "undefined") {
    return {} as Record<string, UIMessage[]>;
  }

  try {
    const raw = window.localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (!raw) {
      return {} as Record<string, UIMessage[]>;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {} as Record<string, UIMessage[]>;
    }

    return parsed as Record<string, UIMessage[]>;
  } catch {
    return {} as Record<string, UIMessage[]>;
  }
}

function writeStoredConversationMessages(entries: Record<string, UIMessage[]>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(entries));
}

function toFileSafeIso(date: Date) {
  return date.toISOString().replace(/[.:]/g, "-");
}

function downloadInBrowser(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // De ce: fiecare URL temporar ține blob-ul în memorie până la revoke, deci îl eliberăm imediat după declanșarea descărcării.
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

// De ce: shell-ul unic de aplicație ține aceeași listă de mesaje pentru toate acțiunile (trimite, reluare, export, golire), fără surse paralele de adevăr.
export function AppShell() {
  const loadedConversationIdRef = useRef<string | null>(null);

  const profile = useAppStore(state => state.profile);
  const activeConversationId = useAppStore(state => state.activeConversationId);
  const conversations = useAppStore(state => state.conversations);
  const selectedProvider = useAppStore(state => state.selectedProvider);
  const selectedModel = useAppStore(state => state.selectedModel);
  const touchConversation = useAppStore(state => state.touchConversation);
  const startNewConversation = useAppStore(state => state.startNewConversation);

  const activeConversation = useMemo(
    () => conversations.find(item => item.id === activeConversationId),
    [activeConversationId, conversations]
  );

  const { messages, sendMessage, stop, status, error, regenerate, setMessages } = useChat({
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
    ? "Nu am putut genera răspunsul acum. Dacă providerul nu e configurat încă, aplicația rămâne funcțională, dar chat-ul va porni după ce setezi variabilele în platforma de deploy și faci redeploy."
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
    loadedConversationIdRef.current = null;

    const allEntries = readStoredConversationMessages();
    const nextMessages = allEntries[activeConversationId] ?? [];

    // De ce: la schimbarea conversației, reîncărcăm exact lista salvată pentru acel id ca "chat vechi" să se deschidă corect.
    setMessages(nextMessages);
    loadedConversationIdRef.current = activeConversationId;
  }, [activeConversationId, setMessages]);

  useEffect(() => {
    if (loadedConversationIdRef.current !== activeConversationId) {
      return;
    }

    const allEntries = readStoredConversationMessages();
    allEntries[activeConversationId] = messages;

    // De ce: persistăm mesajele per conversație în browser pentru a păstra istoricul între click-uri și refresh local.
    writeStoredConversationMessages(allEntries);
  }, [activeConversationId, messages]);

  const handleSendMessage = async (content: string) => {
    touchConversation(activeConversationId, content);
    await sendMessage({ text: content });
  };

  const handleRegenerateMessage = async (messageId: string) => {
    if (isAssistantTyping) {
      return;
    }

    const assistantIndex = messages.findIndex(message => message.id === messageId && message.role === "assistant");
    if (assistantIndex < 0) {
      return;
    }

    let latestUserIndex = -1;
    for (let index = assistantIndex - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "user") {
        latestUserIndex = index;
        break;
      }
    }

    if (latestUserIndex < 0) {
      toast.error("Nu există un mesaj al utilizatorului pentru reluare.");
      return;
    }

    const trimmedMessages = messages.slice(0, latestUserIndex + 1);

    // De ce: tăiem răspunsul vechi înainte de regenerate() ca noul răspuns să îl înlocuiască, nu să se adauge sub el.
    setMessages(trimmedMessages);

    try {
      touchConversation(activeConversationId);
      await regenerate();
    } catch {
      toast.error("Reluarea a eșuat. Încearcă din nou.");
    }
  };

  const handleStartNewConversation = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm("Chat nou va goli conversația curentă. Continui?");
      if (!confirmed) {
        return;
      }
    }

    stop();
    // De ce: golirea merge direct pe lista gestionată de useChat, fără copii locale paralele.
    setMessages([]);
    startNewConversation();
    toast.success("Conversație nouă pornită.");
  };

  const handleExport = (format: "json" | "markdown") => {
    const now = new Date();
    const exportedAtIso = now.toISOString();
    const fileSafeDate = toFileSafeIso(now);
    const fileBaseName = `skillforge-${fileSafeDate}`;
    const metadata = {
      conversationId: activeConversationId,
      conversationTitle: activeConversation?.title ?? "Conversație nouă",
      exportedAtIso
    };

    if (format === "json") {
      const content = serializeConversationExportJson(messages, profile, metadata);
      downloadInBrowser(`${fileBaseName}.json`, content, "application/json;charset=utf-8");
      toast.success("Export JSON descărcat.");
      return;
    }

    const content = serializeConversationExportMarkdown(messages, profile, metadata);
    downloadInBrowser(`${fileBaseName}.md`, content, "text/markdown;charset=utf-8");
    toast.success("Export Markdown descărcat.");
  };

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar onStartNewConversation={handleStartNewConversation} />
      <SidebarInset>
        <AppHeader onExportJson={() => handleExport("json")} onExportMarkdown={() => handleExport("markdown")} />
        <Chat
          messages={messages}
          status={status}
          error={chatError}
          onSendMessage={handleSendMessage}
          onStop={stop}
          onRegenerateMessage={handleRegenerateMessage}
          activeConversationId={activeConversationId}
          providerLabel={selectedProviderLabel}
          modelLabel={selectedModelLabel}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
