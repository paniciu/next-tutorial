export type ThemePreference = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export type SkillLevel = "începător" | "intermediar" | "avansat";

export type ProviderId = "openai" | "anthropic" | "google";

export type SettingsSection = "general" | "profile" | "providers";

export type ChatRole = "user" | "assistant";

export type UserProfile = {
  name: string;
  currentStack: string;
  skills: string;
  objective: string;
};

export type ProviderModelOption = {
  provider: ProviderId;
  model: string;
  label: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};
