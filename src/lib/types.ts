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

export type ModelPricing = {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
  checkedAt: string;
};

export type UsageSnapshot = {
  inputTokens: number | undefined;
  outputTokens: number | undefined;
  totalTokens: number | undefined;
};

export type MessageCostSnapshot = {
  inputCostUsd: number | undefined;
  outputCostUsd: number | undefined;
  totalCostUsd: number | undefined;
  billedCostUsd: number | undefined;
  pricingCheckedAt: string | undefined;
};

export type ChatMessageMetadata = {
  providerId: ProviderId;
  modelId: string;
  fromCache: boolean;
  usage: UsageSnapshot;
  // De ce: input tokenii includ atât întrebarea nouă, cât și istoricul retrimis modelului.
  // Marcăm explicit acest fapt ca utilizatorul să vadă unde se duce costul.
  inputIncludesHistory: true;
  cost: MessageCostSnapshot;
  retryAfterIso?: string;
};

export type ChatMessage = UIMessage<ChatMessageMetadata>;

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};
