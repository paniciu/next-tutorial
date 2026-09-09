<!-- De ce: publicăm devreme și documentăm pașii o singură dată, ca următoarele deploy-uri să fie reproductibile pe orice calculator. -->

# Integrare Vercel (deploy Preview + Production)

## 1. Ce face

- Numele integrării: Vercel
- La ce ne folosește în SkillForge: publică aplicația Next.js online, cu URL de Preview pentru fiecare branch și URL public pentru `main`.
- Pasul din curs în care intră: Faza 1C — deploy timpuriu pe Vercel.

## 2. Cont & proiect

- Unde se creează contul: https://vercel.com/
- Cum se conectează repository-ul: Vercel Dashboard → **Add New...** → **Project** → Import din GitHub.
- Framework preset: detectat automat ca Next.js.
- Build/Output config: se lasă implicit (fără `vercel.json`) cât timp funcționează setările standard.

## 3. Variabile de mediu (fără secrete în repo)

Variabilele se configurează doar în:

- Vercel → Project → Settings → Environment Variables

Reguli:

- adaugi fiecare variabilă atât pe **Preview**, cât și pe **Production**;
- `.env.local` rămâne doar local și gitignorat;
- `.env.example` rămâne singurul fișier comis cu nume de variabile și valori placeholder;
- nu se scriu chei reale în `docs/`.

Variabile curente în proiect:

- `ANTHROPIC_API_KEY`
- `SKILLFORGE_HELLO_TARGET` (opțională)

⚠️ Important: dacă adaugi sau modifici variabile în Vercel, deploy-ul deja existent nu le preia automat. Trebuie **Redeploy**.

## 4. Pași manuali reali (prima publicare)

1. Push codul în GitHub.
2. Importă repository-ul în Vercel (o singură dată).
3. Rulează primul deploy pe setările implicite.
4. Intră în Project Settings → Environment Variables și adaugă valorile pe Preview + Production.
5. Fă **Redeploy** după orice schimbare de variabilă.
6. Verifică URL-ul public (Production) și URL-ul de Preview pe un branch separat.

## 5. Verificări înainte de fiecare publicare

Checklist minim (vezi și skill-ul `pre-deploy`):

- `npm run build` trece și fără `.env.local`;
- `npm run format:check` trece;
- `docs/requirements.md` reflectă faza/scope-ul curent;
- fiecare variabilă din `.env.example` există în Vercel pe Preview + Production;
- dacă ai introdus o variabilă nouă: variabila există în Vercel și ai făcut Redeploy.

## 6. Confirmare că setup-ul funcționează

- Un push pe branch non-`main` generează un Preview URL distinct.
- Un merge/push pe `main` actualizează URL-ul public.
- Aplicația pornește și fără `ANTHROPIC_API_KEY`; UI-ul rămâne funcțional, iar chat-ul indică explicit starea „provider neconfigurat”.
- URL-ul public se deschide și pe telefon (nu doar pe laptop).

## 7. Ce refaci pe alt calculator

1. Clonezi repository-ul.
2. Creezi `.env.local` doar pentru test local (fără commit).
3. Rulezi rutina pre-deploy înainte de push.
4. Pentru publicare, folosești proiectul deja conectat în Vercel; nu recreezi configurația din cod.

## 8. Cost & limitări în pasul actual

- Preview și Production sunt utile pentru feedback rapid, dar funcțiile server-side rulează la fiecare request.
- Route Handler-ul de chat consumă tokeni la fiecare cerere către provider.
- Domeniul propriu, monitorizarea avansată și analytics nu intră în acest pas; se tratează separat.
