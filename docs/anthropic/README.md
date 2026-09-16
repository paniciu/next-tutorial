<!-- De ce: documentăm integrarea Anthropic imediat ce devine activă, ca setarea locală și operarea costurilor să fie reproductibile pentru toți cursanții. -->

# Integrare Anthropic (AI SDK)

## 1. Ce face

- Numele integrării: Anthropic
- La ce ne folosește în SkillForge: generează răspunsurile agentului în chat, în streaming, prin apel server-side.
- Pasul din curs în care intră: Faza 1B — integrarea LLM server-side.

## 2. Cont & chei

- Unde se creează contul: https://console.anthropic.com/
- Unde se generează cheia / tokenul: Anthropic Console → API Keys.
- Ce tip de cheie sau permisiuni sunt necesare: API key standard pentru apeluri model.
- Ce scope-uri trebuie selectate: conform opțiunilor disponibile în Anthropic Console pentru cheia proiectului folosit.

## 3. Variabile de mediu

- Numele EXACT al variabilei: `ANTHROPIC_API_KEY`
- Fișierul în care se adaugă local: `.env.local`
- Rândul care trebuie adăugat în `.env.example`: `ANTHROPIC_API_KEY=`

> Nu scrie niciodată valori reale aici; documentează doar numele variabilelor.

## 4. Pași manuali

- Creează cheia în Anthropic Console.
- Adaugă cheia în `.env.local`.
- Repornește serverul de development după modificarea variabilelor de mediu.
- Verifică faptul că apelul modelului se face doar prin ruta server-side `src/app/api/chat/route.ts`.

## 5. Cost & limite

- Model folosit în aplicație: `claude-haiku-4-5`.
- Preț verificat la: **2026-09-16** (sursă: pagina oficială Anthropic pricing).
- Input: **$0.80 / 1M tokens**.
- Output: **$4.00 / 1M tokens**.
- Ce se plătește efectiv: tokenii de intrare + ieșire raportați de provider în `usage`.
- Rate limits relevante: depind de plan și de tier-ul contului Anthropic; în aplicație există și limită internă de bun-simț (**10 cereri/minut/IP** pe ruta de chat).
- Ce risc de cost trebuie urmărit: creșterea tokenilor de intrare din istoricul retrimis la fiecare mesaj.

Link oficial pricing: https://www.anthropic.com/pricing

## 6. Verificare

- Comanda, endpoint-ul sau ecranul care confirmă că integrarea funcționează: ecranul principal de chat din aplicație.
- Ce rezultat minim trebuie să apară: după trimiterea unui mesaj, răspunsul agentului apare progresiv (streaming). Dacă cheia lipsește, UI afișează eroare clară despre `ANTHROPIC_API_KEY`.
