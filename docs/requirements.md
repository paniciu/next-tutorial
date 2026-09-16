# SkillForge — cerințe de produs

> Ultima actualizare: 2026-09-16
>
> Faza curentă: Faza 1E — cost vizibil + protecții retrimiteri (livrată)

## 1. Rolul acestui document

Acest fișier este sursa de adevăr pentru ce construim în proiectul **SkillForge**.

Reguli:

- Orice decizie de produs, schimbare de scop sau clarificare de cerințe se actualizează **mai întâi aici**, nu doar în conversație.
- `README.md` rămâne scurt și trimite către acest document.
- Instrucțiunile pentru agenți trebuie să fie aliniate cu acest document.
- Dacă apare o contradicție între chat și acest fișier, prevalează acest fișier până la actualizarea lui explicită.

## 2. Ce este SkillForge

SkillForge este o aplicație web online pentru dezvoltare profesională asistată de AI.

Aplicația funcționează ca un **copilot personal de skills și carieră**:

- cunoaște profilul real al utilizatorului;
- răspunde în contextul acelui profil;
- propune pași concreți de învățare;
- urmărește progresul în timp;
- păstrează memorie între sesiuni.

SkillForge nu este gândit ca un simplu formular care trimite un prompt generic la un model LLM. În centrul produsului stă un **agent AI** care folosește context persistent, reguli clare și, în faze ulterioare, unelte proprii.

## 3. Pentru cine este aplicația

SkillForge este pentru persoane care vor să crească profesional și au nevoie de direcție personalizată, nu de sfaturi generale.

Exemple de utilizatori:

- developer backend care vrea să treacă spre web și AI;
- developer frontend care vrea să învețe Python, Java sau AI engineering;
- QA care vrea să treacă pe automatizare;
- junior care nu știe încă ce să aprofundeze;
- profesionist tehnic care are un obiectiv clar, dar nu are un plan clar.

Punctul comun între utilizatori nu este tehnologia curentă, ci faptul că:

- pornesc din puncte diferite;
- au skill-uri diferite;
- urmăresc obiective diferite;
- au nevoie de recomandări care țin cont de profilul lor real.

## 4. Problema pe care o rezolvă

Instrumentele de chat AI generaliste oferă adesea răspunsuri bune, dar:

- răspunsurile sunt prea generice;
- contextul despre utilizator se pierde de la o sesiune la alta;
- profilul profesional nu evoluează ca activ persistent;
- utilizatorul trebuie să repete frecvent cine este și ce urmărește.

SkillForge rezolvă această problemă prin:

- profil persistent;
- memorie între sesiuni;
- răspunsuri ancorate în obiectivul utilizatorului;
- planuri de învățare actualizabile;
- evoluție graduală spre un agent care poate acționa, nu doar răspunde.

## 5. Viziune de produs

SkillForge trebuie să devină o unealtă personală online pe termen lung, nu doar un demo de integrare cu un LLM.

Aplicația trebuie să permită utilizatorului să:

- își salveze profilul profesional;
- discute natural cu un agent AI;
- primească răspunsuri în contextul profilului său;
- obțină planuri concrete de învățare;
- marcheze progresul;
- revină mai târziu fără să piardă contextul.

## 6. Principii de produs

1. **Profilul utilizatorului este central** — nu conversația generică.
2. **Agentul este central** — nu doar apelul brut către un model.
3. **Contextul persistent este obligatoriu** — nu opțional.
4. **Providerul LLM este interschimbabil** — pentru comparații de calitate și cost.
5. **Cheile și logica sensibilă rămân pe server** — niciodată în browser.
6. **Aplicația trebuie explicată modular** — fiecare pas de implementare trebuie să poată fi înțeles separat.
7. **Documentația operațională este parte din livrare** — mai ales pentru integrări externe.

## 7. Exemple de întrebări la care aplicația trebuie să răspundă bine

- „Ce-mi lipsește ca să trec de la Java backend la AI engineer?”
- „Fă-mi un plan de 3 luni pentru Next.js + AI SDK.”
- „Ține minte că am terminat modulul de streaming — ce urmează?”
- „Ce skill-uri trebuie să consolidez înainte să încep proiecte reale cu agenți AI?”
- „Cum îmi împart următoarele 6 săptămâni dacă am doar 1 oră pe zi?”

## 8. Cerințe funcționale pe faze

### Faza 1 — fundația aplicației + deploy timpuriu + acțiuni de conversație (acum)

Obiectiv: să existe o aplicație web complet navigabilă și publicabilă înainte de orice integrare LLM reală.

Faza 1 este împărțită în patru pași de curs:

#### Faza 1A — UI complet pe date inventate

Intră în 1A:

- aplicație web cu interfață reală, structurată în trei zone (sidebar, zonă centrală, preferințe în dialog separat);
- Next.js (App Router), TypeScript, Tailwind CSS v4 și shadcn/ui;
- doar date inventate, centralizate în `src/lib/mock/`;
- stocare locală persistentă pentru profil, conversații și setări (ex: Zustand + persist);
- stări complete de UI: empty, loading/skeleton, typing, error;
- responsive corect, inclusiv comportament mobil pentru sidebar;
- fără chei API, fără SDK LLM, fără apeluri reale la modele;
- documentație clară pentru ce s-a implementat și de ce.

Rezultatul așteptat la finalul 1A:

- utilizatorul își definește profilul local;
- navighează între conversații demo;
- trimite mesaje într-un flux simulat local;
- tema se schimbă din preferințe;
- aplicația pornește pe orice laptop fără configurare suplimentară.

#### Faza 1B — integrarea LLM server-side

Intră în 1B:

- apelul către model făcut exclusiv de pe server;
- Route Handler dedicat pentru chat;
- provider/model configurat din variabile de mediu;
- răspunsuri în streaming;
- `system prompt` construit din profil + context;
- păstrarea regulii că secretele rămân doar pe server.

Stare implementare (2026-09-09):

- chat-ul folosește streaming real prin Route Handler server-side;
- integrarea LLM activă este Anthropic, prin AI SDK;
- cheia `ANTHROPIC_API_KEY` este citită doar pe server;
- clientul folosește `useChat`, fără parsare manuală de stream în UI;
- store-ul global păstrează doar shell state (profil, setări, sumar conversații);
- persona + guardrails sunt centralizate în `src/lib/system-prompt.ts` și injectate ca `system` doar pe server;
- profilul din preferințe este trimis la fiecare mesaj și influențează răspunsurile mentorului;
- datele de profil venite din browser sunt normalizate server-side înainte de intrarea în prompt (whitelist câmpuri, trim, limite de lungime);
- UI arată explicit când profilul este activ și include acțiune directă de ștergere a profilului local.

#### Faza 1C — deploy timpuriu pe Vercel

Intră în 1C:

- repository-ul este publicat pe GitHub și importat în Vercel, pe setările implicite Next.js (fără `vercel.json` cât timp nu este necesar);
- fiecare push pe branch produce Preview URL; branch-ul `main` produce versiunea publică (Production URL);
- variabilele de mediu sunt configurate în Vercel pentru ambele medii: Preview și Production;
- aplicația face build și pornește și fără chei LLM (stare normală: „provider neconfigurat”, fără crash);
- validările de variabile rulează la request, în interiorul handlerelor server-side, nu la importul modulelor;
- documentația include pașii manuali reali de deploy + o rutină pre-deploy reproductibilă.

Regulă operațională explicită în 1C:

- după orice adăugare/modificare de variabilă în Vercel, deploy-ul existent nu preia automat valoarea; este obligatoriu Redeploy.

#### Faza 1D — finisaje UX: markdown rendering stream live + indicator status + editare (livrată 2026-09-14)

Intră în 1D: răspunsuri ca Markdown cu titluri, liste, tabele, cod cu highlighting selectiv; butoane copiere pe cod; indicator din status real; mesaje utilizator instant + editabile (editare taie și retrimite de la mesaj în jos); link-uri `target="_blank"` + `rel="noopener noreferrer"`; Markdown incomplet fără eroare; ⚠️ **HTML brut din model NU se randează, `dangerouslySetInnerHTML` DOAR pe highlight.js.**

Dependențe noi: `remark`, `remark-react`, `unified`, `highlight.js`.

Fișiere noi: `src/components/chat/markdown.tsx`. Modificate: `message-item.tsx`, `message-list.tsx`, `chat.tsx`, `message-utils.ts`.

Acțiuni confirmate: „Mai încearcă" (regenerare ultimul răspuns); „Copiază" (cu context check); export JSON+Markdown.

Nu intră în 1D: export PDF; persistență server; editarea răspunsurilor asistentului.

Decizie de arhitectură adăugată în 1D (2026-09-14):

- cât timp răspunsul asistentului este în streaming, mesajele sunt deținute de `useChat` (stare tranzitorie, foarte frecvent actualizată);
- store-ul global (`Zustand` + `persist`) este arhiva conversațiilor complete, inclusiv mesajele finale;
- sincronizarea dintre `useChat` și arhivă se face la finalul stream-ului (`ready`/`error`), nu la fiecare token;
- la schimbarea conversației, sesiunea de chat se reinițializează prin remontare pe `key` legat de `conversationId`, ca hook-ul să pornească din mesajele acelei conversații;
- compromis acceptat: dacă utilizatorul dă refresh în timpul streamingului, răspunsul parțial se pierde (până la persistența server-side).

**Adăugare 2026-09-14 (parțial livrată în aceeași fază):**

Selectorul de provider și model: utilizatorul poate alege cu ce AI răspunde aplicația direct din interfață (lângă caseta de scris), nu din preferințe. Ordinea din interfață e ordinea din registru (`PROVIDER_REGISTRY`), Anthropic implicit și prim.

Intră: comutare Claude ↔ GPT-4o Mini pe mesaj; provider-ul dezactivat apare cu motiv; abstracție prin `getModel()` pe server (SDK-ul instanțiat doar acolo); validare modelId contra registrului.

Nu intră: comparație automată de calitate între modele; optimizare automată de context.

#### Faza 1E — cost vizibil + cache de protecție + rate limiting (livrată 2026-09-16)

Intră în 1E:

- citirea tokenilor reali din `usage` în `onFinish` (input/output/total), fără estimări manuale;
- afișare per răspuns a tokenilor + costului discret, cu fallback `—` când providerul nu raportează un câmp;
- prețuri per model în registrul providerelor (input/output per milion) + `checkedAt` (data verificării);
- formulă unică de cost în `src/lib/cost.ts`, reutilizată per mesaj și total conversație;
- cost salvat în metadatele mesajului împreună cu `providerId` + `modelId`;
- cache în memorie prin interfață minimă `get`/`set` în `src/lib/cache.ts`, cu TTL + limită de intrări;
- cheie cache: provider + model + system prompt + hash mesaje;
- replay de răspuns cache-uit în format streaming + marcaj UI „din cache";
- bypass cache la „Mai încearcă", astfel încât reluarea să cheme modelul real;
- rate limiting simplu în ruta de chat (cereri/minut), răspuns `429` și mesaj clar cu momentul de retry.

Limită explicită de fază:

- cache-ul de acest pas nu e mecanism principal de optimizare de cost în producție; este protecție pentru retrimiteri identice.
- pentru că profilul intră în system prompt, doi utilizatori diferiți nu împart aceeași cheie de cache.

Fișiere noi: `src/lib/providers.server.ts` (funcții server-side cu SDK); `src/components/chat/provider-selector.tsx`; `src/app/api/providers/route.ts` (status endpoint). Modificate: `chat-input.tsx`, `chat.tsx`, `app-shell.tsx`, `app.api.chat.route.ts`, `providers.ts`.

Model nou: OpenAI `gpt-4o-mini`. Documentație: [docs/openai/README.md](./openai/README.md).

Regulă nouă (arhitectură):

- `providers.ts` ajunge în browser, nu are voie să atingă `process.env` sau cheile;
- tot ce ține de chei și SDK stă în `providers.server.ts`, server-only;
- `getModel(providerId, modelId)` e singurul loc din app care instanțiază un SDK de provider;
- disponibilitatea se calculează pe server și trimis ca date de afișat la UI, niciodată ca valoare de cheie.

Decizie de arhitectură adăugată în 1D (2026-09-14, pas didactic tema):

- preferința de temă (`system` / `light` / `dark`) iese din store-ul global și este gestionată prin `createContext` + `useContext`, cu provider dedicat;
- regula de rezolvare a temei efective rămâne unică și pură (funcție exportată separat);
- la runtime, puntea spre CSS rămâne clasa `.dark` pe `html` + `color-scheme`, iar tema se aplică înainte de primul paint prin script sincron în `layout`;
- cheia de persistență pentru temă este separată (`skillforge-theme`), distinctă de cheia store-ului aplicației;
- motivație: comparație practică Store vs Context pe cod real; contextul rezolvă transmiterea stării, nu optimizarea rerender-elor.

### Faza 2 — memorie și progres mai bogate

Intră în faza 2:

- actualizarea explicită a profilului pe baza progresului utilizatorului;
- istoric de conversații mai bine structurat;
- planuri de învățare salvate și revizitabile;
- posibilitatea de a marca module sau pași ca finalizați;
- rezumate de progres;
- memorie mai selectivă și mai utilă decât simpla stocare brută a mesajelor.

### Faza 3 — agent cu unelte

Intră în faza 3:

- agentul poate folosi unelte controlate de server;
- căutare în notițe sau resurse proprii ale utilizatorului;
- actualizarea planului de învățare prin unelte dedicate;
- operații sigure și auditabile inițiate de agent;
- separare clară între ce poate face agentul automat și ce cere confirmare explicită.

### Faza 4 — produs maturizat

Poate include ulterior:

- autentificare completă;
- mai multe profile sau workspace-uri;
- monitorizare, analytics și observabilitate;
- compararea providerilor în interfață;
- cost tracking per utilizator sau per sesiune;
- export/import de profil și plan;

Notă de urmă pentru schimbarea de scope (2026-09-09):

- cerința „deployment public stabil” a fost mutată din Faza 4 în Faza 1C pentru a forța publicarea devreme;
- în Faza 4 rămân activitățile de monitorizare/observabilitate după ce aplicația este deja publică.

## 9. Ce NU intră acum

Nu intră în prima etapă, decât dacă sunt cerute explicit ulterior:

- marketplace de cursuri;
- funcții sociale;
- gamification complex;
- recomandări bazate pe scraping agresiv din surse externe;
- acțiuni autonome ale agentului fără control clar;
- expunerea cheilor API în frontend;
- dependență rigidă de un singur provider LLM.

## 10. Cerințe funcționale detaliate

### 10.1 Profilul utilizatorului

Profilul trebuie să poată include cel puțin:

- rol curent;
- stack actual;
- skill-uri ca listă structurată (nume + nivel estimat pentru fiecare);
- notițe separate pentru skill-uri (observații, lacune, priorități);
- obiectiv profesional principal;
- eventuale constrângeri relevante de timp sau ritm de învățare.

Profilul trebuie să fie:

- persistent;
- editabil;
- folosit la construirea contextului agentului;
- tratat ca sursă primară pentru personalizarea răspunsurilor.

### 10.2 Chat-ul cu agentul

Chat-ul trebuie să ofere:

- experiență de conversație naturală;
- în 1A: flux local simulat fără apel real la model;
- în 1B+: răspunsuri în streaming server-side;
- delimitare clară între mesajele utilizatorului și cele ale agentului;
- tratament robust pentru stări de încărcare și erori;
- continuitate între sesiuni, cel puțin la nivel de context și istoric de bază.

Acțiuni operaționale minime în faza curentă (1D):

- „Mai încearcă” folosește aceeași listă de mesaje și înlocuiește ultimul răspuns al asistentului;
- „Copiază” este disponibil pe mesaj și confirmă reușita prin notificarea existentă;
- „Chat nou” rămâne în sidebar și golește conversația curentă doar după confirmare;
- exportul rămâne în meniul de header și generează JSON + Markdown din aceeași structură de date intermediară.

Arhitectură de stare pentru conversații (1D):

- există un singur loc persistent pentru starea care trebuie să supraviețuiască refresh-ului: store-ul global cu conversații + mesaje;
- nu se persistă stări tranzitorii (`streaming`, `loading`, `error`) în `localStorage`;
- componentele citesc din store doar prin selectors, pentru a limita rerender-ele inutile;
- orice schimbare de formă în starea persistată cere `version` + `migrate`, pentru compatibilitate cu datele deja salvate.

Notă de comparație pentru curs (Context vs Store):

- `createContext` + `useContext` este suficient pentru valori rare, cu puțini consumatori;
- store-ul global cu selectors este preferat pentru stare citită în multe locuri și actualizată des (ex: flux de chat).
- pentru tema aplicației, frecvența mică de schimbare și numărul redus de consumatori fac contextul o alegere adecvată didactic.

Notă de curs (limitări și compromisuri):

- `localStorage` are limită practică de ordinul câtorva MB per origine, deci istoricul mare trebuie ulterior mutat server-side;
- sincronizarea la final de streaming reduce blocajele UI, dar un răspuns întrerupt de refresh înainte de `onFinish` nu este arhivat complet.

### 10.3 Construirea contextului

Contextul trimis agentului trebuie să combine:

- instrucțiuni de sistem ale aplicației;
- profilul utilizatorului;
- obiectivul utilizatorului;
- memorie relevantă din sesiuni anterioare;
- conversația curentă.

### 10.4 Recomandări și planuri

Agentul trebuie să poată genera:

- recomandări contextualizate;
- gap analysis între situația curentă și obiectiv;
- planuri de învățare pe intervale concrete;
- următorii pași clari după un progres raportat de utilizator.

## 11. Cerințe non-funcționale

### 11.1 Securitate și chei API

- Cheile API pentru provideri LLM se păstrează doar pe server.
- Cheile API nu ajung niciodată în browser.
- Documentația nu conține chei reale, doar numele variabilelor de mediu.
- Configurarea providerului trebuie să permită schimbarea ușoară a furnizorului.

### 11.2 Confidențialitatea datelor personale

Profilul utilizatorului poate conține date personale sau semi-personale despre:

- experiență;
- nivel profesional;
- planuri de carieră;
- ritm de învățare;
- eventuale note sau progres.

În implementarea curentă (Faza 1B), colectăm efectiv doar câmpurile:

- `name`;
- `currentStack`;
- `skills`;
- `objective`.

Stocare și vizibilitate în etapa curentă:

- profilul este stocat local, în browserul utilizatorului, prin `localStorage` (cheia `skillforge-app`), nu într-o bază de date server;
- profilul este vizibil utilizatorului (în UI) și este transmis către providerul LLM doar în momentul trimiterii unui mesaj;
- aplicația nu introduce în acest pas sincronizare de profil între device-uri și nici administrare centralizată de date personale.
- exportul conversației scoate profilul într-un fișier local (JSON/Markdown), deci utilizatorul trebuie să știe că poate redistribui ulterior aceste date personale.

Ștergere:

- utilizatorul poate șterge profilul din formularul de preferințe (acțiune dedicată);
- alternativ, datele locale pot fi șterse din setările browserului (site data pentru aplicație).

Limită de fază și risc acceptat (explicit):

- această strategie local-first rămâne valabilă până la introducerea autentificării + stocării server-side (planificat în Faza 4);
- riscul este considerat acceptabil temporar deoarece datele rămân pe dispozitivul utilizatorului, câmpurile sunt limitate la minimul necesar pentru personalizare, iar utilizatorul are control direct de ștergere.

### 11.3 Cost măsurat și portabilitate între provideri

- Providerul LLM trebuie să fie schimbabil.
- Costul per răspuns se calculează numai din `usage` raportat de provider (input/output), nu din estimări locale.
- Când un câmp de usage lipsește, UI afișează `—` (necunoscut), nu `0`.
- Prețurile per model sunt în registrul providerelor, ca input/output per 1.000.000 tokeni, cu data verificării (`checkedAt`).
- Formula de cost există într-un singur fișier (`src/lib/cost.ts`) și este reutilizată de toate afișările de cost.
- Costul și modelul/providerul folosit se păstrează în metadatele mesajului, pentru total corect în conversații cu provider comutat.
- Totalul conversației afișează suma costurilor facturabile pe mesaje (răspunsurile din cache au cost nou `0`).
- Cache-ul se accesează doar prin `src/lib/cache.ts`, iar cheia include toate intrările care influențează răspunsul (inclusiv system prompt).
- Rate limiting-ul din memoria procesului este doar protecție operațională de bază; în multi-instancing nu oferă garanții de securitate.
- Documentația pentru fiecare provider trebuie să păstreze prețuri + data verificării + limite relevante de cereri/minut.

### 11.4 Calitate de produs

- Aplicația trebuie construită modular.
- Fiecare pas din curs trebuie să poată fi explicat clar.
- Schimbările trebuie să fie incremental de înțeles.
- Documentația trebuie menținută la zi pe măsură ce produsul evoluează.

### 11.5 Convenții tehnice inițiale

- Proiectul folosește structură `src/` și alias de import `@/*`.
- ESLint rămâne activ din primul pas.
- Prettier este configurat din start, cu `prettier-plugin-tailwindcss`, pentru a păstra o ordine canonică a claselor și diff-uri comparabile între implementări.
- Configurația de editor comună poate fi comisă în repository atunci când reduce zgomotul dintre mediile locale ale cursanților.

## 12. Regula obligatorie pentru integrări externe

De fiecare dată când se adaugă o integrare externă, trebuie creat și actualizat un fișier:

- `docs/<integrare>/README.md`

În același commit trebuie actualizat și indexul:

- `docs/README.md`

Exemple de integrări:

- provider LLM;
- bază de date;
- autentificare;
- deploy;
- monitorizare;
- stocare fișiere;
- analytics.

Acest fișier trebuie să includă obligatoriu:

- ce serviciu este și de ce a fost ales;
- ce pași trebuie făcuți manual de utilizator;
- de unde se creează contul;
- de unde se generează cheia sau tokenul;
- în ce variabile de mediu trebuie puse valorile;
- ce trebuie configurat în dashboard-ul furnizorului;
- ce costuri trebuie urmărite;
- linkuri spre documentația oficială relevantă.

Reguli suplimentare:

- codul poate fi generat de agent;
- pașii manuali trebuie documentați explicit;
- secretele reale nu se scriu în repository sau în documentație;
- se folosesc doar nume de variabile de mediu, exemple mascate și explicații.
- documentarea unei integrări noi pornește din `docs/_template/README.md`.

## 13. Livrabile de documentație obligatorii

Structura minimă de documentație a proiectului:

- `docs/requirements.md` — sursa de adevăr pentru produs;
- `docs/README.md` — indexul documentației și locul unde apar toate integrările externe;
- `README.md` — prezentare scurtă și ghid de orientare;
- `CLAUDE.md` — instrucțiuni pentru agenți compatibili;
- `AGENTS.md` — convenții generale de lucru pentru agenți;
- `.github/copilot-instructions.md` — instrucțiuni specifice pentru Copilot;
- `docs/_template/README.md` — șablon pentru documentarea integrărilor externe.

## 14. Criterii de succes pentru documentația inițială

Documentația inițială este suficient de bună dacă:

- alt pas al cursului poate porni doar de la acest fișier;
- cerințele sunt separate clar de instrucțiunile de rulare;
- există diferențiere între ce facem acum și ce lăsăm pentru mai târziu;
- există reguli explicite pentru secrete, provideri și documentarea integrărilor;
- vocabularul folosit este consecvent.

## 15. Glosar

- **Agent** — componenta AI orientată pe obiectiv, care primește context, urmează instrucțiuni și poate ajunge ulterior să folosească unelte.
- **Provider** — serviciul extern care oferă acces la unul sau mai multe modele de limbaj.
- **Streaming** — livrarea răspunsului incremental, pe măsură ce este generat, nu doar la final.
- **Persona** — set de trăsături, ton și rol de răspuns pe care îl adoptă agentul în interacțiune.
- **Memorie** — informația persistentă relevantă pentru sesiuni viitoare, derivată din profil, istoric și progres.
- **Profil** — descrierea persistentă a utilizatorului: rol, stack, skill-uri, nivel, obiectiv și eventuale constrângeri.
- **System prompt** — instrucțiunea de nivel înalt trimisă modelului pentru a-i defini comportamentul și limitele.
- **Unealtă / tool** — capabilitate controlată de server pe care agentul o poate folosi pentru a citi, căuta sau actualiza date.

## 16. Regula de evoluție a proiectului

Pe măsură ce proiectul avansează:

- actualizăm acest document când se schimbă scopul sau designul de produs;
- păstrăm README-ul scurt;
- sincronizăm instrucțiunile agenților cu regulile de aici;
- adăugăm documentație separată pentru fiecare integrare externă;
- implementarea codului pornește din cerințe, nu invers.
