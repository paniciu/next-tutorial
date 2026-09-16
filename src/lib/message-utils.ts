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

function normalizeProfileSkills(skills: UserProfile["skills"]) {
  return skills
    .map(skill => ({
      id: skill.id,
      name: skill.name.trim(),
      level: skill.level
    }))
    .filter(skill => skill.name.length > 0);
}

function formatProfileSkills(skills: UserProfile["skills"]) {
  if (skills.length === 0) {
    return fallbackField;
  }

  return skills.map(skill => `${skill.name}: ${skill.level}`).join(" | ");
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
  // De ce: `parts` poate fi undefined dacă mesajul e creat fără el.
  // Cădem înapoi la proprietate `text` care s-ar putea afla pe mesaj.
  if (!message.parts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textField = (message as any).text as string | undefined;
    return (textField || "").trim() || "...";
  }

  const text = message.parts
    .filter(part => part.type === "text")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(part => (part as any).text || "")
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
      skills: normalizeProfileSkills(profile.skills),
      skillNotes: normalizeField(profile.skillNotes),
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
    `- Skills: ${formatProfileSkills(payload.profile.skills)}`,
    `- Notes: ${payload.profile.skillNotes}`,
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

// De ce: când utilizatorul editează un mesaj, tăiem conversația de la acel mesaj în jos.
// Aceasta previne contradicțiile istorice și asigură că modelul primește un context coerent.
export function trimMessagesAfterIndex(messages: UIMessage[], messageId: string): UIMessage[] {
  const index = messages.findIndex(m => m.id === messageId);
  if (index === -1) {
    return messages;
  }

  // Ștergem mesajul editat și orice apare după el.
  return messages.slice(0, index);
}
