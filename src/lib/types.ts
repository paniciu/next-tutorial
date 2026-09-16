import type { UIMessage } from "ai";

export type ThemePreference = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export type SkillLevel = "începător" | "intermediar" | "avansat";

export type ProviderId = "openai" | "anthropic" | "google";

export type SettingsSection = "general" | "profile" | "providers" | "about";

export type ChatRole = "user" | "assistant";

export type ProfileSkill = {
  id: string;
  name: string;
  level: SkillLevel;
};

export type UserProfile = {
  name: string;
  currentStack: string;
  skills: ProfileSkill[];
  skillNotes: string;
  objective: string;
};

export type ProviderModelOption = {
  provider: ProviderId;
  model: string;
  label: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: UIMessage[];
};
