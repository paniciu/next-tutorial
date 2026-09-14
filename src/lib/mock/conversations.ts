import type { ConversationSummary } from "@/lib/types";

// De ce: conversațiile mock folosesc aceeași formă ca arhiva reală din store (inclusiv mesaje), ca migrarea spre date persistate să rămână predictibilă.
export const mockConversations: ConversationSummary[] = [
  {
    id: "conv-1",
    title: "Plan de învățare pe 90 de zile",
    createdAt: "2026-09-01T09:12:00.000Z",
    updatedAt: "2026-09-01T09:19:00.000Z",
    messages: [
      {
        id: "conv-1-user-1",
        role: "user",
        parts: [{ type: "text", text: "Vreau un plan de învățare pe 90 de zile pentru trecerea spre AI engineering." }]
      },
      {
        id: "conv-1-assistant-1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Sigur. Împărțim cele 90 de zile în trei sprinturi: fundații Python + date, aplicații cu LLM și proiect capstone cu evaluare săptămânală."
          }
        ]
      }
    ]
  },
  {
    id: "conv-2",
    title: "Gap analysis backend → AI",
    createdAt: "2026-09-03T13:05:00.000Z",
    updatedAt: "2026-09-03T13:11:00.000Z",
    messages: [
      {
        id: "conv-2-user-1",
        role: "user",
        parts: [{ type: "text", text: "Ce îmi lipsește ca să fac tranziția de la backend clasic la AI apps?" }]
      },
      {
        id: "conv-2-assistant-1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Ai bază bună pe arhitectură, dar îți mai trebuie practică pe prompt design, evaluare de output și observabilitate pentru fluxuri cu modele."
          }
        ]
      }
    ]
  }
];
