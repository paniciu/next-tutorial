"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockConversations } from "@/lib/mock/conversations";
import { mockProfile } from "@/lib/mock/profile";
import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID, providerModelOptions } from "@/lib/providers";
import type { ConversationSummary, ResolvedTheme, ThemePreference, UserProfile } from "@/lib/types";

type AppState = {
  profile: UserProfile;
  selectedProvider: string;
  selectedModel: string;
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  conversations: ConversationSummary[];
  activeConversationId: string;
  setThemePreference: (theme: ThemePreference) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setProviderModel: (provider: string, model: string) => void;
  setActiveConversation: (conversationId: string) => void;
  touchConversation: (conversationId: string, titleHint?: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  startNewConversation: () => void;
};

const nowIso = () => new Date().toISOString();

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const defaultTitle = "Conversație nouă";

const makeConversationSummary = (title = defaultTitle): ConversationSummary => {
  const timestamp = nowIso();

  return {
    id: makeId("conv"),
    title,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

const initialConversation = mockConversations[0] ?? makeConversationSummary();

// De ce: store-ul rămâne sursă de adevăr doar pentru shell (profil, setări, lista de conversații), iar mesajele active sunt deținute de useChat.
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      profile: mockProfile,
      selectedProvider: DEFAULT_PROVIDER_ID,
      selectedModel: DEFAULT_MODEL_ID,
      themePreference: "system",
      resolvedTheme: "light",
      conversations: mockConversations,
      activeConversationId: initialConversation.id,
      setThemePreference: theme => set({ themePreference: theme }),
      setResolvedTheme: theme => set({ resolvedTheme: theme }),
      updateProfile: patch => set(state => ({ profile: { ...state.profile, ...patch } })),
      setProviderModel: (provider, model) => set({ selectedProvider: provider, selectedModel: model }),
      setActiveConversation: conversationId => set({ activeConversationId: conversationId }),
      touchConversation: (conversationId, titleHint) =>
        set(state => {
          const now = nowIso();
          const existing = state.conversations.find(item => item.id === conversationId);
          const fallbackTitle = titleHint?.split(" ").slice(0, 5).join(" ").trim() || defaultTitle;

          const touchedConversation: ConversationSummary = existing
            ? {
                ...existing,
                title: existing.title === defaultTitle && titleHint ? fallbackTitle : existing.title,
                updatedAt: now
              }
            : {
                id: conversationId,
                title: fallbackTitle,
                createdAt: now,
                updatedAt: now
              };

          const conversations = [
            touchedConversation,
            ...state.conversations.filter(item => item.id !== touchedConversation.id)
          ];

          return { conversations, activeConversationId: touchedConversation.id };
        }),
      renameConversation: (conversationId, title) =>
        set(state => ({
          conversations: state.conversations.map(item => (item.id === conversationId ? { ...item, title } : item))
        })),
      deleteConversation: conversationId =>
        set(state => {
          const conversations = state.conversations.filter(item => item.id !== conversationId);

          if (conversations.length === 0) {
            const freshConversation = makeConversationSummary();

            return {
              conversations: [freshConversation],
              activeConversationId: freshConversation.id
            };
          }

          const nextActive =
            state.activeConversationId === conversationId ? conversations[0].id : state.activeConversationId;

          return { conversations, activeConversationId: nextActive };
        }),
      startNewConversation: () =>
        set(state => {
          const conversation = makeConversationSummary();

          return {
            conversations: [conversation, ...state.conversations],
            activeConversationId: conversation.id
          };
        })
    }),
    {
      name: "skillforge-app",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => state => {
        if (!state) {
          return;
        }

        const isValidSelection = providerModelOptions.some(
          option => option.provider === state.selectedProvider && option.model === state.selectedModel
        );

        if (!isValidSelection) {
          state.setProviderModel(DEFAULT_PROVIDER_ID, DEFAULT_MODEL_ID);
        }
      },
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
