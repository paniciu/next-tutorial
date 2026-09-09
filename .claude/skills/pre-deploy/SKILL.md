---
name: pre-deploy
description: Checklist standard înainte de publicare (build fără .env.local, format, documentație și validare variabile Vercel cu redeploy când se schimbă)
---

# pre-deploy

Folosește acest skill înainte de orice publicare (Preview sau Production).

## Checklist obligatoriu

1. Rulează `npm run build` fără `.env.local`.
   - Dacă `.env.local` există, mută-l temporar și rulează build-ul.
   - Build-ul trebuie să treacă; lipsa cheilor trebuie tratată ca stare normală („provider neconfigurat”), nu crash.
2. Rulează `npm run format:check`.
3. Verifică `docs/requirements.md`.
   - Faza curentă și scope-ul trebuie să fie la zi.
4. Verifică toate variabilele din `.env.example` în Vercel.
   - Fiecare variabilă există pe **Preview** și pe **Production**.
5. Dacă ai adăugat sau schimbat o variabilă în Vercel, fă **Redeploy**.
   - Deploy-ul existent nu citește automat noile valori.

## Nu face

- Nu urca niciodată `.env.local` în Git.
- Nu scrie valori reale de chei în `docs/` sau în fișiere comise.

## După checklist

- Rulează sincronizarea skill-urilor: `sh scripts/sync-skills.sh`.
- Rulează sincronizarea instrucțiunilor de agenți: `sh scripts/sync-agent-instructions.sh`.
