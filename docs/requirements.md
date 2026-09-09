# SkillForge — cerințe de produs

> Ultima actualizare: 2026-09-09
>
> Faza curentă: Faza 1B — persona + profil contextual în chat (livrată)

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

### Faza 1 — fundația aplicației (acum)

Obiectiv: să existe o aplicație web complet navigabilă și publicabilă înainte de orice integrare LLM reală.

Faza 1 este împărțită în doi pași de curs:

#### Faza 1A — UI complet pe date inventate (pasul curent)

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

#### Faza 1B — integrarea LLM server-side (pasul curent)

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
- analytics și observabilitate;
- compararea providerilor în interfață;
- cost tracking per utilizator sau per sesiune;
- export/import de profil și plan;
- deployment public stabil.

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
- skill-uri și nivel estimat pentru fiecare;
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

Ștergere:

- utilizatorul poate șterge profilul din formularul de preferințe (acțiune dedicată);
- alternativ, datele locale pot fi șterse din setările browserului (site data pentru aplicație).

Limită de fază și risc acceptat (explicit):

- această strategie local-first rămâne valabilă până la introducerea autentificării + stocării server-side (planificat în Faza 4);
- riscul este considerat acceptabil temporar deoarece datele rămân pe dispozitivul utilizatorului, câmpurile sunt limitate la minimul necesar pentru personalizare, iar utilizatorul are control direct de ștergere.

### 11.3 Cost și portabilitate între provideri

- Providerul LLM trebuie să fie schimbabil.
- Trebuie să existe loc în documentație pentru costurile fiecărei integrări externe.
- Când se adaugă un provider, trebuie documentate: modelul de tarifare, unitatea de cost relevantă, eventualele limite gratuite și linkul spre pagina oficială de pricing.
- Nu se hardcodează dependența conceptuală de un singur furnizor.

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
