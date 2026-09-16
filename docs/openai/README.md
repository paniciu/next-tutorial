# OpenAI Integration

Această pagină explică cum să setezi OpenAI în SkillForge și să treci pe GPT-4o Mini pentru răspunsuri la chat.

## Ce face

Integrarea OpenAI permite aplicației să folosească modelele LLM ale OpenAI (în particular **GPT-4o Mini**) alături de Anthropic Claude. Selectezi provider-ul la fiecare mesaj, direct din interfață, lângă caseta de scris.

- **Selecție pe moment**: nu e o setare pe care o schimbi lunar, ci o decizie pentru mesajul curent.
- **Dezactivare sigură**: dacă nu ai pus cheie, provider-ul apare în lista cu motivul clar, dar nu se prăbușește.
- **Abstracție**: adăugarea unui nou provider nu necesită modificări în composer sau preferințe.

## Pasii de configurare

### 1. Creează cont și cheie API la OpenAI

1. Accesează https://platform.openai.com/account/api-keys
2. Conectează-te sau creează un cont.
3. Apasă **"Create new secret key"** și copie cheia imediat (nu o vei mai vedea după ce închizi fereastra).
4. Memorează cheia temporar sau salvează-o sigur.

### 2. Adaugă cheia în `.env.local`

Editează (sau creează) fișierul `.env.local` din rădăcina proiectului și adaugă:

```dotenv
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

**Important**: fără prefixul `NEXT_PUBLIC_` — cheia rămâne strict pe server.

### 3. Redeploy pe Vercel (producție + preview)

1. Intră în proiectul Vercel: https://vercel.com/dashboard
2. Selectează SkillForge.
3. Mergi la **Settings** → **Environment Variables**.
4. Adaugă (sau editeaza) `OPENAI_API_KEY` cu valoarea din pasul 1.
5. Apasă **Save**.
6. Mergi la **Deployments**, selectează cea mai recentă, apasă **Redeploy**.

De obicei redeployment durează 1–2 minute.

## Model disponibil

| Model         | Descriere                         | Caz de utilizare               |
| ------------- | --------------------------------- | ------------------------------ |
| `gpt-4o-mini` | Mic, rapid, ieftin; versiune QPU. | Răspunsuri rapide, cu context. |

## Cost & limite

Prețuri verificate la **2026-09-16** (sursă: https://openai.com/api/pricing):

- Model folosit în aplicație: `gpt-4o-mini`
- **Input**: **$0.15 / 1M tokens**
- **Output**: **$0.60 / 1M tokens**

În SkillForge costul se calculează din `usage` raportat de provider (input/output), nu prin estimare locală.

Limite relevante:

- Rate limits OpenAI depind de plan și tier (vezi dashboard-ul contului).
- Aplicația mai are și o limită internă de bun-simț: **10 cereri/minut/IP** pe ruta de chat.

## Verificare

1. **Local** (cu ambele chei în `.env.local`):
   - Pornește `npm run dev`
   - Treci la /
   - Deschide lista de provider-uri (lângă caseta de scris)
   - Ar trebui să vezi **Anthropic** și **OpenAI**, amândouă active
   - Trimite un mesaj pe Anthropic, apoi pe OpenAI — ar trebui să primești două răspunsuri diferite

2. **Fără OPENAI_API_KEY** (sau goală în `.env.local`):
   - Restartează server-ul local
   - Reîncarcă pagina
   - OpenAI ar trebui să apară ca **dezactivat**, cu motivul _"Cheie OPENAI_API_KEY neconfigurată"_
   - Aplicația continuă să funcționeze doar pe Anthropic

3. **Production** (după redeploy pe Vercel):
   - Accesează linkul public al aplicației
   - Verifică din nou lista de provider-uri
   - Dacă redepoymentul s-a încheiat, OpenAI ar trebui să fie activ

## Troubleshooting

| Problemă                                  | Soluție                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| OpenAI lipsește din lista                 | Redeploy pe Vercel sau restartează `npm run dev`                                     |
| "400: Provider OpenAI nu este configurat" | OPENAI_API_KEY nu e setată sau e nevalidă. Verifica Environment Variables în Vercel. |
| "401: Invalid authentication"             | Cheia API a expirat sau e coruptă. Generează alta.                                   |
| "429: Rate limited"                       | Depășit rate limit. Așteaptă sau upgrade-aza planul.                                 |

## Pentru mai departe

- Rate limits și quotes: https://platform.openai.com/account/rate-limits
- Model capabilities: https://platform.openai.com/docs/models
- Billing: https://platform.openai.com/account/billing
