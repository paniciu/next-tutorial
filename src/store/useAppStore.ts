"use client";

import type { UIMessage } from "ai";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockConversations } from "@/lib/mock/conversations";
import { mockProfile } from "@/lib/mock/profile";
import { DEFAULT_MODEL_ID, DEFAULT_PROVIDER_ID, providerModelOptions } from "@/lib/providers";
import type { ConversationSummary, ProfileSkill, SkillLevel, UserProfile } from "@/lib/types";

const APP_STORE_VERSION = 4;
const LEGACY_CHAT_MESSAGES_STORAGE_KEY = "skillforge-chat-messages";

type AppState = {
  profile: UserProfile;
  selectedProvider: string;
  selectedModel: string;
  hasHydrated: boolean;
  conversations: ConversationSummary[];
  activeConversationId: string;
  markHydrated: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setProviderModel: (provider: string, model: string) => void;
  setActiveConversation: (conversationId: string) => void;
  touchConversation: (conversationId: string, titleHint?: string) => void;
  archiveConversationMessages: (conversationId: string, messages: UIMessage[], titleHint?: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  startNewConversation: () => void;
};

type PersistedConversationV1 = {
  id?: unknown;
  title?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type PersistedConversationV2 = PersistedConversationV1 & {
  messages?: unknown;
};

type PersistedAppStateV1 = {
  profile?: unknown;
  selectedProvider?: unknown;
  selectedModel?: unknown;
  themePreference?: unknown;
  activeConversationId?: unknown;
  conversations?: unknown;
};

type PersistedProfileRecord = {
  name?: unknown;
  currentStack?: unknown;
  skills?: unknown;
  skillNotes?: unknown;
  objective?: unknown;
};

const nowIso = () => new Date().toISOString();

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const defaultTitle = "Conversație nouă";

const SKILL_LEVEL_ALIASES: Record<string, SkillLevel> = {
  incepator: "începător",
  începător: "începător",
  intermediar: "intermediar",
  avansat: "avansat"
};

function normalizeStringField(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseSkillLevel(rawLevel: unknown): SkillLevel | null {
  if (typeof rawLevel !== "string") {
    return null;
  }

  return SKILL_LEVEL_ALIASES[rawLevel.trim().toLowerCase()] ?? null;
}

function parseLegacySkillsString(skillsField: string) {
  const skills: ProfileSkill[] = [];
  const notes: string[] = [];

  for (const line of skillsField.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    const parts = trimmedLine.split(":");
    if (parts.length >= 2) {
      const skillName = parts.slice(0, -1).join(":").trim();
      const skillLevel = parseSkillLevel(parts[parts.length - 1]);

      if (skillName && skillLevel) {
        skills.push({
          id: makeId("skill"),
          name: skillName,
          level: skillLevel
        });
        continue;
      }
    }

    notes.push(trimmedLine);
  }

  return {
    skills,
    skillNotes: notes.join("\n")
  };
}

function normalizeProfileRecord(rawProfile: unknown): UserProfile {
  if (!rawProfile || typeof rawProfile !== "object") {
    return mockProfile;
  }

  const profileRecord = rawProfile as PersistedProfileRecord;

  if (typeof profileRecord.skills === "string") {
    const parsed = parseLegacySkillsString(profileRecord.skills);
    const existingSkillNotes = normalizeStringField(profileRecord.skillNotes).trim();

    return {
      name: normalizeStringField(profileRecord.name),
      currentStack: normalizeStringField(profileRecord.currentStack),
      skills: parsed.skills,
      skillNotes: parsed.skillNotes || existingSkillNotes,
      objective: normalizeStringField(profileRecord.objective)
    };
  }

  const normalizedSkills: ProfileSkill[] = Array.isArray(profileRecord.skills)
    ? profileRecord.skills
        .map(skill => {
          if (!skill || typeof skill !== "object") {
            return null;
          }

          const skillRecord = skill as Record<string, unknown>;
          const name = normalizeStringField(skillRecord.name).trim();
          const level = parseSkillLevel(skillRecord.level);

          if (!name || !level) {
            return null;
          }

          return {
            id:
              typeof skillRecord.id === "string" && skillRecord.id.trim().length > 0 ? skillRecord.id : makeId("skill"),
            name,
            level
          } satisfies ProfileSkill;
        })
        .filter((skill): skill is ProfileSkill => Boolean(skill))
    : [];

  return {
    name: normalizeStringField(profileRecord.name),
    currentStack: normalizeStringField(profileRecord.currentStack),
    skills: normalizedSkills,
    skillNotes: normalizeStringField(profileRecord.skillNotes),
    objective: normalizeStringField(profileRecord.objective)
  };
}

function readLegacyMessageArchive() {
  if (typeof window === "undefined") {
    return {} as Record<string, UIMessage[]>;
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_CHAT_MESSAGES_STORAGE_KEY);
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

function normalizeConversationRecord(
  conversation: PersistedConversationV2,
  legacyMessages: Record<string, UIMessage[]>
) {
  const id =
    typeof conversation.id === "string" && conversation.id.trim().length > 0 ? conversation.id : makeId("conv");
  const createdAt =
    typeof conversation.createdAt === "string" && conversation.createdAt.trim().length > 0
      ? conversation.createdAt
      : nowIso();
  const updatedAt =
    typeof conversation.updatedAt === "string" && conversation.updatedAt.trim().length > 0
      ? conversation.updatedAt
      : createdAt;
  const title =
    typeof conversation.title === "string" && conversation.title.trim().length > 0 ? conversation.title : defaultTitle;
  const messageFromV2 = Array.isArray(conversation.messages) ? (conversation.messages as UIMessage[]) : null;
  const messageFromLegacyStorage = legacyMessages[id] ?? [];

  return {
    id,
    title,
    createdAt,
    updatedAt,
    // De ce: la migrare păstrăm ce există deja în forma nouă; dacă venim din forma veche, recuperăm mesajele din cheia istorică separată.
    messages: messageFromV2 ?? messageFromLegacyStorage
  } satisfies ConversationSummary;
}

const makeConversationSummary = (title = defaultTitle): ConversationSummary => {
  const timestamp = nowIso();

  return {
    id: makeId("conv"),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: []
  };
};

const initialConversation = mockConversations[0] ?? makeConversationSummary();

// De ce: store-ul este arhiva persistentă (profil, setări, conversații + mesaje finale), iar mesajele active în timpul stream-ului rămân în useChat.
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      profile: mockProfile,
      selectedProvider: DEFAULT_PROVIDER_ID,
      selectedModel: DEFAULT_MODEL_ID,
      hasHydrated: false,
      conversations: mockConversations,
      activeConversationId: initialConversation.id,
      markHydrated: () => set({ hasHydrated: true }),
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
                updatedAt: now,
                messages: []
              };

          const conversations = [
            touchedConversation,
            ...state.conversations.filter(item => item.id !== touchedConversation.id)
          ];

          return { conversations, activeConversationId: touchedConversation.id };
        }),
      archiveConversationMessages: (conversationId, messages, titleHint) =>
        set(state => {
          const now = nowIso();
          const fallbackTitle = titleHint?.split(" ").slice(0, 5).join(" ").trim() || defaultTitle;
          const existing = state.conversations.find(item => item.id === conversationId);

          const archivedConversation: ConversationSummary = existing
            ? {
                ...existing,
                title: existing.title === defaultTitle && titleHint ? fallbackTitle : existing.title,
                updatedAt: now,
                // De ce: salvăm arhiva doar când fluxul s-a închis, ca persist să nu serializze sute de snapshot-uri intermediare.
                messages
              }
            : {
                id: conversationId,
                title: fallbackTitle,
                createdAt: now,
                updatedAt: now,
                messages
              };

          const conversations = [
            archivedConversation,
            ...state.conversations.filter(item => item.id !== archivedConversation.id)
          ];

          return {
            conversations,
            activeConversationId: archivedConversation.id
          };
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
      version: APP_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: persistedState => {
        const legacyState = (persistedState ?? {}) as PersistedAppStateV1;
        const persistedConversations = Array.isArray(legacyState.conversations)
          ? (legacyState.conversations as PersistedConversationV2[])
          : [];
        const legacyMessages = readLegacyMessageArchive();
        const migratedConversations = persistedConversations.map(conversation =>
          normalizeConversationRecord(conversation, legacyMessages)
        );
        const fallbackConversation = migratedConversations[0] ?? makeConversationSummary();

        if (typeof window !== "undefined") {
          // De ce: după ce am absorbit datele din cheia veche, o eliminăm ca să evităm divergențe la următoarele porniri.
          window.localStorage.removeItem(LEGACY_CHAT_MESSAGES_STORAGE_KEY);
        }

        return {
          profile: normalizeProfileRecord(legacyState.profile),
          selectedProvider:
            typeof legacyState.selectedProvider === "string" ? legacyState.selectedProvider : DEFAULT_PROVIDER_ID,
          selectedModel: typeof legacyState.selectedModel === "string" ? legacyState.selectedModel : DEFAULT_MODEL_ID,
          conversations: migratedConversations.length > 0 ? migratedConversations : [fallbackConversation],
          activeConversationId:
            typeof legacyState.activeConversationId === "string" &&
            migratedConversations.some(item => item.id === legacyState.activeConversationId)
              ? legacyState.activeConversationId
              : fallbackConversation.id
        };
      },
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

        state.markHydrated();
      },
      partialize: state => ({
        profile: state.profile,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId
      })
    }
  )
);
