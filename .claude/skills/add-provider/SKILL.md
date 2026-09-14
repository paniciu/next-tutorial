# Skill: Add Provider

Rețeta completă pentru a adăuga un al doilea provider LLM la SkillForge.

**Poanta**: după ce completezi pașii, testul unei abstracții rele e cât de multe fișiere trebuie atinse. Dacă răspunsul e „una" (doar `providers.server.ts`), a meritat.

## Pre-condiții

- Provider-ul are o SDK public în npm (ex: `@ai-sdk/openai`).
- Ai o documentație curentă cu model IDs (ex: https://platform.openai.com/docs/models).
- Ai cheia API din provider-ul respectiv.

## Pași

### 1. Instalează SDK-ul

```bash
npm install @ai-sdk/PROVIDER
```

Exemplu pentru OpenAI: `npm install @ai-sdk/openai`.

### 2. Adaugă intrarea în registru

Editează `src/lib/providers.ts`. Adaugă provider-ul în `PROVIDER_REGISTRY` cu:

- `id`: identificator unic (ex: `"openai"`)
- `label`: nume human-readable (ex: `"OpenAI"`)
- `models`: array cu `id` și `label` din documentația curentă a provider-ului

```typescript
{
  id: "openai",
  label: "OpenAI",
  models: [{ id: "gpt-4o-mini", label: "GPT-4o Mini" }]
}
```

**Atenție**: ID-urile de modele se iau din documentație curentă, nu din memorie. Un ID inventat dă o eroare care arată ca o problemă de cod, deși e o problemă de citit.

### 3. Adaugă ramura SDK în `providers.server.ts`

Editează `src/lib/providers.server.ts`, funcția `getModelForProvider()`. Adaugă un caz în switch:

```typescript
case "openai": {
  const openai = createOpenAI({ apiKey });
  return openai(modelId);
}
```

**Atenție**: `getModel()` e singurul loc din app care instanțiază SDK-ul. Nu duplica logica asta în composer, în preferințe sau în alte rute.

### 4. Adaugă variabila în `.env.example` și Vercel

Editează `.env.example` și adaugă:

```dotenv
PROVIDER_API_KEY=
```

(Cu prefixul potrivit pentru acel provider, de obicei fără `NEXT_PUBLIC_`.)

**Vercel**:

1. Settings → Environment Variables
2. Adaugă noua variabilă
3. Apasă Save
4. Deployments → selectează ultima → Redeploy

### 5. Scrie documentația provider-ului

Creează `docs/PROVIDER/README.md` după template din `docs/_template/README.md`:

- Ce face integrarea
- Pași de configurare (account, cheie API, unde se ia)
- Model(e) disponibil(e)
- Cost (la data verificării)
- Verificare (local, fără cheie, production)
- Troubleshooting

### 6. Actualizează indexul de documentație

Editează `docs/README.md`, tabelul "Integrări externe". Adaugă un rând:

| Provider Name | Faza         | Link                                        |
| ------------- | ------------ | ------------------------------------------- |
| OpenAI        | 1D (partial) | [docs/openai/README.md](./openai/README.md) |

### 7. Actualizează `AGENTS.md`

Adaugă o regulă privind provider-ul în secția de Architecture/Design Decisions din `AGENTS.md`:

> `providers.ts` ajunge în browser — nu are voie să atingă `process.env` sau cheile. Tot ce ține de chei și SDK stă în `providers.server.ts`. `getModel()` e singurul loc care instanțiază un SDK.

### 8. Verificare

```bash
npm run build      # Compilează și type-check-ează
npm run format     # Formatează și ordoneaza clase Tailwind
```

**Test local** (cu ambele chei în `.env.local`):

1. `npm run dev`
2. Mergi la /
3. Deschide lista de provider-uri lângă caseta de scris
4. Ar trebui să Vezi ambii provider-i, amândoi activi
5. Trimite un mesaj pe fiecare → ar trebui să primești răspunsuri diferite

**Test fără cheie**:

1. Șterge noua cheie din `.env.local`
2. Restartează `npm run dev`
3. Noua opțiune ar trebui să apară dezactivată, cu motivul clar
4. Aplicația continuă pe provider-ul implicit

**Test production** (după redeploy):

1. Accesează linkul public
2. Verific din nou lista de provider-uri

## Semne de problemă

- ❌ A fost nevoie să se modifice `chat-input.tsx` sau lista de provider-uri din preferințe → abstracția a curs, repară în `providers.server.ts`
- ❌ Sunt if-uri pe `providerId` prin codebase (afară de `providers.server.ts`) → extrage în switch-ul din `getModel()`
- ❌ UI-ul trimite valori de cheie API în rețea → verifică că nu trimiti `process.env` din browser; `getModel()` trebuie să fie singura care atinge SDK
- ❌ Model ID nu e validat contra registrului → integrează validarea în `getModel()`

## Referințe

- Tutorial video/slide asupra abstracțiilor și de ce registru bate lanț de if-uri
- `src/lib/providers.ts` — registry (browser-side)
- `src/lib/providers.server.ts` — SDK instantiation (server-only)
- `src/app/api/chat/route.ts` — apelarea `getModel()`
- `docs/openai/README.md` — exemplu de documentație completă
