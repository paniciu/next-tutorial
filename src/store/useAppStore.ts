"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockAssistantReplies, mockConversations } from "@/lib/mock/conversations";
import { mockProfile, mockProviderModels } from "@/lib/mock/profile";
import type { ChatMessage, Conversation, ResolvedTheme, ThemePreference, UserProfile } from "@/lib/types";

type AppState = {
  profile: UserProfile;
  selectedProvider: string;
  selectedModel: string;
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  conversations: Conversation[];
  activeConversationId: string | null;
  isAssistantTyping: boolean;
  chatError: string | null;
  setThemePreference: (theme: ThemePreference) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setProviderModel: (provider: string, model: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  upsertConversation: (conversation: Conversation) => void;
  renameConversation: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  sendMessage: (content: string) => Conversation;
  appendAssistantMessage: (conversationId: string, content: string) => void;
  stopAssistant: () => void;
  setTyping: (typing: boolean) => void;
  setChatError: (message: string | null) => void;
  startNewConversation: () => void;
  getRandomAssistantReply: () => string;
};

const nowIso = () => new Date().toISOString();

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const initialProvider = mockProviderModels[0];

// De ce: persistăm starea locală ca fluxul complet de chat să poată fi demo-uit fără backend, dar cu experiență apropiată de produsul final.
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: mockProfile,
      selectedProvider: initialProvider.provider,
      selectedModel: initialProvider.model,
      themePreference: "system",
      resolvedTheme: "light",
      conversations: mockConversations,
      activeConversationId: mockConversations[0]?.id ?? null,
      isAssistantTyping: false,
      chatError: null,
      setThemePreference: theme => set({ themePreference: theme }),
      setResolvedTheme: theme => set({ resolvedTheme: theme }),
      updateProfile: patch => set(state => ({ profile: { ...state.profile, ...patch } })),
      setProviderModel: (provider, model) => set({ selectedProvider: provider, selectedModel: model }),
      setActiveConversation: conversationId => set({ activeConversationId: conversationId, chatError: null }),
      upsertConversation: conversation =>
        set(state => {
          const exists = state.conversations.some(item => item.id === conversation.id);
          const conversations = exists
            ? state.conversations.map(item => (item.id === conversation.id ? conversation : item))
            : [conversation, ...state.conversations];

          return { conversations };
        }),
      renameConversation: (conversationId, title) =>
        set(state => ({
          conversations: state.conversations.map(item => (item.id === conversationId ? { ...item, title } : item))
        })),
      deleteConversation: conversationId =>
        set(state => {
          const conversations = state.conversations.filter(item => item.id !== conversationId);
          const nextActive =
            state.activeConversationId === conversationId ? (conversations[0]?.id ?? null) : state.activeConversationId;

          return { conversations, activeConversationId: nextActive };
        }),
      sendMessage: content => {
        const state = get();
        const userMessage: ChatMessage = {
          id: makeId("msg"),
          role: "user",
          content,
          createdAt: nowIso()
        };

        const title = content.split(" ").slice(0, 4).join(" ").trim() || "Conversație nouă";

        const activeConversation = state.conversations.find(item => item.id === state.activeConversationId);

        const conversation: Conversation = activeConversation
          ? {
              ...activeConversation,
              updatedAt: nowIso(),
              title: activeConversation.title || title,
              messages: [...activeConversation.messages, userMessage]
            }
          : {
              id: makeId("conv"),
              title,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              messages: [userMessage]
            };

        set(current => {
          const conversations = current.conversations.filter(item => item.id !== conversation.id);
          return {
            conversations: [conversation, ...conversations],
            activeConversationId: conversation.id,
            chatError: null
          };
        });

        return conversation;
      },
      appendAssistantMessage: (conversationId, content) =>
        set(state => ({
          conversations: state.conversations.map(item =>
            item.id === conversationId
              ? {
                  ...item,
                  updatedAt: nowIso(),
                  messages: [
                    ...item.messages,
                    { id: makeId("msg"), role: "assistant", content, createdAt: nowIso() } satisfies ChatMessage
                  ]
                }
              : item
          ),
          isAssistantTyping: false
        })),
      stopAssistant: () => set({ isAssistantTyping: false }),
      setTyping: typing => set({ isAssistantTyping: typing }),
      setChatError: message => set({ chatError: message, isAssistantTyping: false }),
      startNewConversation: () => set({ activeConversationId: null, chatError: null, isAssistantTyping: false }),
      getRandomAssistantReply: () => {
        const index = Math.floor(Math.random() * mockAssistantReplies.length);
        return mockAssistantReplies[index] ?? mockAssistantReplies[0];
      }
    }),
    {
      name: "skillforge-app",
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        profile: state.profile,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        themePreference: state.themePreference,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId
      })
    }
  )
);
