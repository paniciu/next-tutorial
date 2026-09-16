"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";

import { Chat } from "@/components/chat/chat";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import {
  extractMessageText,
  serializeConversationExportJson,
  serializeConversationExportMarkdown
} from "@/lib/message-utils";
import { getProviderModelLabel } from "@/lib/providers";
import type { ChatMessage, ConversationSummary, ProviderId } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

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

function parseChatError(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Nu am putut genera răspunsul acum. Încearcă din nou.";
}

type ConversationSessionProps = {
  activeConversation: ConversationSummary;
};

// De ce: useChat deține doar sesiunea activă și construiește răspunsul token cu token; la final, snapshot-ul complet merge în arhiva din store.
function ConversationSession({ activeConversation }: ConversationSessionProps) {
  const lastArchivedSnapshotRef = useRef(JSON.stringify(activeConversation.messages));
  const [providerDisabledReasons, setProviderDisabledReasons] = useState<Record<ProviderId, string | null>>({
    anthropic: null,
    openai: null,
    google: null
  });

  const profile = useAppStore(state => state.profile);
  const selectedProvider = useAppStore(state => state.selectedProvider);
  const selectedModel = useAppStore(state => state.selectedModel);
  const archiveConversationMessages = useAppStore(state => state.archiveConversationMessages);
  const touchConversation = useAppStore(state => state.touchConversation);
  const startNewConversation = useAppStore(state => state.startNewConversation);

  // De ce: la montare, fetch-ez starea fiecărui provider de pe server.
  // Asta e singurul loc din app care spune UI-ului ce e configurat. Nu calculez din browser.
  useEffect(() => {
    const fetchProviderStatus = async () => {
      try {
        const response = await fetch("/api/providers");
        if (!response.ok) {
          console.error("Nu s-a putut obține starea provider-elor");
          return;
        }

        const data: Record<ProviderId, { available: boolean; reason: string | null }> = await response.json();
        const reasons: Record<ProviderId, string | null> = {
          anthropic: data.anthropic?.available ? null : (data.anthropic?.reason ?? "Neconfigurat"),
          openai: data.openai?.available ? null : (data.openai?.reason ?? "Neconfigurat"),
          google: data.google?.available ? null : (data.google?.reason ?? "Neconfigurat")
        };
        setProviderDisabledReasons(reasons);
      } catch (error) {
        console.error("Eroare la fetch provider status:", error);
      }
    };

    fetchProviderStatus();
  }, []);

  const { messages, sendMessage, stop, status, error, regenerate, setMessages } = useChat<ChatMessage>({
    id: activeConversation.id,
    messages: activeConversation.messages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // De ce: body ca funcție citește store-ul exact la momentul trimiterii și evită profilul "înghețat" de la montare.
      body: () => {
        const state = useAppStore.getState();

        return {
          providerId: state.selectedProvider,
          modelId: state.selectedModel,
          profile: state.profile
        };
      },
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        if (response.ok) {
          return response;
        }

        let serverMessage = `Cererea a eșuat (${response.status}).`;

        try {
          const payload = (await response.clone().json()) as { error?: string; retryAt?: string };
          if (payload?.error) {
            serverMessage = payload.error;
          }
        } catch {
          // Ignor: dacă răspunsul nu e JSON, păstrăm mesajul fallback.
        }

        throw new Error(serverMessage);
      }
    }),
    onFinish: ({ messages: finishedMessages }) => {
      const snapshot = JSON.stringify(finishedMessages);
      if (snapshot === lastArchivedSnapshotRef.current) {
        return;
      }

      const firstUserMessage = finishedMessages.find(message => message.role === "user");
      const titleHint = firstUserMessage ? extractMessageText(firstUserMessage) : undefined;

      // De ce: persist sincron doar când fluxul se închide; în streaming evităm scrieri per token în localStorage.
      archiveConversationMessages(activeConversation.id, finishedMessages, titleHint);
      lastArchivedSnapshotRef.current = snapshot;
    }
  });

  const isAssistantTyping = status === "submitted" || status === "streaming";
  const chatError = error ? parseChatError(error) : null;

  const selectedProviderLabel = useMemo(() => {
    const fullLabel = getProviderModelLabel(selectedProvider, selectedModel);
    return fullLabel.split(" · ")[0] ?? selectedProvider;
  }, [selectedModel, selectedProvider]);

  const selectedModelLabel = useMemo(() => {
    const fullLabel = getProviderModelLabel(selectedProvider, selectedModel);
    return fullLabel.split(" · ")[1] ?? selectedModel;
  }, [selectedModel, selectedProvider]);

  const handleSendMessage = async (content: string) => {
    touchConversation(activeConversation.id, content);
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
      touchConversation(activeConversation.id);
      await regenerate({ body: { bypassCache: true } });
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
    startNewConversation();
    toast.success("Conversație nouă pornită.");
  };

  const handleExport = (format: "json" | "markdown") => {
    const now = new Date();
    const exportedAtIso = now.toISOString();
    const fileSafeDate = toFileSafeIso(now);
    const fileBaseName = `skillforge-${fileSafeDate}`;
    const metadata = {
      conversationId: activeConversation.id,
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
          activeConversationId={activeConversation.id}
          providerLabel={selectedProviderLabel}
          modelLabel={selectedModelLabel}
          providerDisabledReasons={providerDisabledReasons}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

// De ce: store-ul are selectors și scalare bună pentru date citite din multe locuri; contextul rămâne mai simplu doar pentru valori rare, cu puțini consumatori.
export function AppShell() {
  const hasHydrated = useStoreHydrated();
  const activeConversationId = useAppStore(state => state.activeConversationId);
  const conversations = useAppStore(state => state.conversations);

  const activeConversation = useMemo(
    () => conversations.find(item => item.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations]
  );

  if (!hasHydrated || !activeConversation) {
    return (
      <section className="flex min-h-[100svh] items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">Se încarcă conversațiile salvate...</p>
      </section>
    );
  }

  return <ConversationSession key={activeConversation.id} activeConversation={activeConversation} />;
}
