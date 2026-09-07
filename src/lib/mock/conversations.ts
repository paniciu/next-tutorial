import type { Conversation } from "@/lib/types";

// De ce: conversațiile demo sunt centralizate aici ca întreaga aplicație să ruleze local fără API, dar cu flux realist de navigare.
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Plan de învățare pe 90 de zile",
    createdAt: "2026-09-01T09:12:00.000Z",
    updatedAt: "2026-09-01T09:19:00.000Z",
    messages: [
      {
        id: "m-1",
        role: "user",
        content: "Poți să-mi faci un plan de învățare pe 90 de zile pentru tranziția spre AI Engineer?",
        createdAt: "2026-09-01T09:12:00.000Z"
      },
      {
        id: "m-2",
        role: "assistant",
        content:
          "Sigur. Îl împart în 3 sprinturi: fundație Python + ML basics, practică LLM + RAG, apoi proiect capstone public. Începem cu primele 2 săptămâni?",
        createdAt: "2026-09-01T09:13:00.000Z"
      },
      {
        id: "m-3",
        role: "user",
        content: "Da, vreau task-uri zilnice de 60 de minute.",
        createdAt: "2026-09-01T09:18:00.000Z"
      },
      {
        id: "m-4",
        role: "assistant",
        content:
          "Perfect. Pentru zilele 1-14: 20 min teorie, 30 min cod, 10 min notițe de progres. Îți pot genera și checklist pe fiecare zi.",
        createdAt: "2026-09-01T09:19:00.000Z"
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
        id: "m-5",
        role: "user",
        content: "Care sunt cele mai mari gap-uri dintre profilul meu actual și rolul de AI Engineer?",
        createdAt: "2026-09-03T13:05:00.000Z"
      },
      {
        id: "m-6",
        role: "assistant",
        content:
          "Ai bază solidă pe backend, dar lipsește partea de Python pentru data tooling, evaluare de modele și practică de prompt/system design. Hai să prioritizăm primele 3 gap-uri.",
        createdAt: "2026-09-03T13:11:00.000Z"
      }
    ]
  }
];

// De ce: replicile automate locale ne permit să testăm starea "scrie..." și fluxul send/stop fără integrare LLM în această fază.
export const mockAssistantReplies = [
  "Bun context. Următorul pas logic este să alegem 2 skill-uri critice și să le mapăm în task-uri săptămânale.",
  "Putem transforma obiectivul în milestone-uri: fundație, proiect intermediar, proiect final public.",
  "Dacă ai doar 1 oră pe zi, ritmul optim este 5 zile/săptămână + recap în weekend.",
  "Îți propun un mini-plan pe 14 zile și apoi facem ajustări pe baza progresului tău."
];
