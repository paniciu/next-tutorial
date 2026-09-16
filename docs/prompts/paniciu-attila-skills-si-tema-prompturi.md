# Prompturi importante — Skills + Temă (SkillForge)

```text
Lucrează direct în aplicația Next.js existentă din acest workspace (TypeScript + Tailwind + shadcn/ui), fără să schimbi funcționalitatea principală de chat și setări.

Obiectiv:
- Îmbunătățește secțiunea de profil (skills) și tema vizuală, păstrând arhitectura existentă.

Cerințe pentru secțiunea Skills (Profilul tău):
1. Înlocuiește textarea-ul de skills cu o listă dinamică tip todo.
2. Adaugă buton „Adaugă skill” care creează un rând nou cu:
   - text field: „Nume skill”
   - select field: „Nivel” cu 3 opțiuni: „Începător”, „Intermediar”, „Avansat”.
3. Input-ul + select-ul trebuie să fie pe aceeași linie.
4. Fiecare rând de skill trebuie să aibă buton mic „X” pe aceeași linie pentru remove.
5. Textarea se mută sub secțiunea de skills și devine „Notes”.
6. Persistă datele corect în modelul de profil, fără hack-uri fragile.

Cerințe de model/date:
1. `UserProfile.skills` trebuie să fie structură tip listă de obiecte (id, name, level), nu string simplu.
2. Adaugă câmp separat `skillNotes` pentru notes.
3. Dacă există date vechi în format string, adaugă migrare în store (version + migrate) și convertește în noul format.
4. Actualizează serializarea/exportul și contextul de system prompt ca să folosească structura nouă.

Cerințe de layout pentru formularul de profil:
1. Evită overflow-ul de text/conținut din dialog.
2. Footer-ul cu butoane („Șterge profilul local”, „Salvează profilul”) trebuie să fie mereu vizibil în partea de jos a panoului Profile.
3. Footer-ul să nu aibă spații laterale artificiale (fără margin-left/right compensate) și să stea curat pe lățimea containerului.
4. Butoanele aliniate la dreapta.

Cerințe de temă:
1. Light theme: paletă crem caldă, clar vizibilă (fără suprafețe care par alb pur).
2. Dark theme: mov închis, cu contrast bun pe text, controale și focus.
3. Actualizează tokenii globali (background, card, popover, sidebar, border, input, accent etc.) centralizat.
4. Păstrează accesibilitatea (contrast, focus states).

Constrângeri:
- Nu adăuga dependențe noi fără motiv puternic.
- Nu rupe API-urile componentelor existente.
- Respectă convențiile repo-ului și separarea client/server.
- Nu muta logica provider-elor LLM în browser.

Pași de lucru:
1. Analizează fișierele existente înainte de editare.
2. Aplică schimbări mici, coerente, pe fișierele relevante.
3. Rulează verificări:
   - npm run lint
   - npm run build
4. Dacă apare eroare, rezolvă strict cauza relevantă și rulează din nou.
5. La final, oferă rezumat cu:
   - ce ai schimbat la skills
   - ce ai schimbat la model/migrare
   - ce ai schimbat la tema light/dark
   - status lint/build
```

## Variantă scurtă — prompt doar pentru Skills

```text
În Settings > Profilul tău, transformă secțiunea Skills într-o listă dinamică cu rânduri add/remove.

- Elimină textarea-ul de skills.
- Buton „Adaugă skill” adaugă rând: [Nume skill input] + [Nivel select: Începător/Intermediar/Avansat] + [X remove].
- Input + select + X pe aceeași linie.
- Textarea existentă se mută sub listă și devine „Notes”.
- Datele de profil trebuie păstrate în model structurat (`skills: ProfileSkill[]`, `skillNotes: string`), cu migrare pentru datele vechi.
- Footer-ul cu „Șterge profilul local” + „Salvează profilul” trebuie să rămână mereu vizibil în partea de jos a panoului Profile, butoane aliniate la dreapta.
- Rulează npm run lint și npm run build.
```

## Variantă scurtă — prompt doar pentru Temă

```text
Actualizează design tokens globali pentru două teme:

- Light: crem cald (nu alb), cu suprafețe coerente pe background/card/popover/sidebar/input.
- Dark: mov închis cu contrast bun.

Păstrează accesibilitatea și focus states. Nu schimba comportamentele aplicației, doar identitatea vizuală.
Verifică rezultatul cu npm run build și npm run lint.
```
