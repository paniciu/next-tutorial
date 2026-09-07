import type { ConversationSummary } from "@/lib/types";

// De ce: păstrăm în store doar sumarul conversațiilor, ca mesajele active să fie deținute de hook-ul de chat și să evităm surse duble de adevăr.
export const mockConversations: ConversationSummary[] = [
  {
    id: "conv-1",
    title: "Plan de învățare pe 90 de zile",
    createdAt: "2026-09-01T09:12:00.000Z",
    updatedAt: "2026-09-01T09:19:00.000Z"
  },
  {
    id: "conv-2",
    title: "Gap analysis backend → AI",
    createdAt: "2026-09-03T13:05:00.000Z",
    updatedAt: "2026-09-03T13:11:00.000Z"
  }
];
