import type { UIMessage } from "ai";

import type { UserProfile } from "@/lib/types";

type ConversationExportMetadata = {
  conversationId: string;
  conversationTitle: string;
  exportedAtIso: string;
};

export type ExportMessage = {
  id: string;
  role: UIMessage["role"];
  text: string;
};

export type ConversationExportPayload = {
  exportedAt: string;
  conversation: {
    id: string;
    title: string;
  };
  profile: UserProfile;
  messages: ExportMessage[];
};

const fallbackConversationTitle = "Conversație nouă";
const fallbackField = "—";

function normalizeField(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : fallbackField;
}

function roleToLabel(role: UIMessage["role"]) {
  if (role === "user") {
    return "Tu";
  }

  if (role === "assistant") {
    return "SkillForge";
  }

  return role;
}

// De ce: extragerea textului din mesaj există într-un singur loc ca să evităm reguli duplicate între UI și export.
export function extractMessageText(message: UIMessage) {
  const text = message.parts
    .filter(part => part.type === "text")
    .map(part => part.text)
    .join("\n")
    .trim();

  return text.length > 0 ? text : "...";
}

// De ce: această structură intermediară devine sursa comună pentru toate exporturile și păstrează aceeași semnificație a datelor.
export function buildConversationExportPayload(
  messages: UIMessage[],
  profile: UserProfile,
  metadata: ConversationExportMetadata
): ConversationExportPayload {
  return {
    exportedAt: metadata.exportedAtIso,
    conversation: {
      id: metadata.conversationId,
      title: metadata.conversationTitle.trim() || fallbackConversationTitle
    },
    profile: {
      name: normalizeField(profile.name),
      currentStack: normalizeField(profile.currentStack),
      skills: normalizeField(profile.skills),
      objective: normalizeField(profile.objective)
    },
    messages: messages.map(message => ({
      id: message.id,
      role: message.role,
      text: extractMessageText(message)
    }))
  };
}

export function serializeConversationExportJson(
  messages: UIMessage[],
  profile: UserProfile,
  metadata: ConversationExportMetadata
) {
  const payload = buildConversationExportPayload(messages, profile, metadata);

  return JSON.stringify(payload, null, 2);
}

export function serializeConversationExportMarkdown(
  messages: UIMessage[],
  profile: UserProfile,
  metadata: ConversationExportMetadata
) {
  const payload = buildConversationExportPayload(messages, profile, metadata);

  const lines = [
    "# SkillForge export",
    "",
    `- Exportat la: ${payload.exportedAt}`,
    `- Conversație: ${payload.conversation.title}`,
    `- ID conversație: ${payload.conversation.id}`,
    "",
    "## Profil",
    "",
    `- Nume: ${payload.profile.name}`,
    `- Stack curent: ${payload.profile.currentStack}`,
    `- Skills: ${payload.profile.skills}`,
    `- Obiectiv: ${payload.profile.objective}`,
    "",
    "## Mesaje",
    ""
  ];

  for (const message of payload.messages) {
    lines.push(`### ${roleToLabel(message.role)}`);
    lines.push("");
    lines.push(message.text);
    lines.push("");
  }

  return lines.join("\n");
}
