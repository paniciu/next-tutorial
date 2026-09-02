<!-- De ce: definim formatul înainte de prima cheie API ca pașii manuali să fie documentați când apar, nu reconstruiți ulterior din memorie. -->

# Șablon pentru documentarea unei integrări externe

> Copiază acest fișier în `docs/<integrare>/README.md` atunci când introduci un serviciu extern nou și adaugă în același commit un rând nou în [docs/README.md](../README.md).

## 1. Ce face

- Numele integrării:
- La ce ne folosește în SkillForge:
- Pasul din curs în care intră:

## 2. Cont & chei

- Unde se creează contul:
- Unde se generează cheia / tokenul:
- Ce tip de cheie sau permisiuni sunt necesare:
- Ce scope-uri trebuie selectate:

## 3. Variabile de mediu

- Numele EXACT al variabilei:
- Fișierul în care se adaugă local:
- Rândul care trebuie adăugat în `.env.example`:

> Nu scrie niciodată valori reale aici; documentează doar numele variabilelor.

## 4. Pași manuali

- Ce click-uri sau setări din dashboard nu pot fi automatizate:
- Ce migrări sau comenzi trebuie rulate manual:
- Ce domenii, redirect-uri, webhook-uri sau regiuni trebuie configurate:

## 5. Cost & limite

- Plan gratuit disponibil:
- Rate limits relevante:
- Ce se plătește efectiv:
- Ce risc de cost trebuie urmărit:

## 6. Verificare

- Comanda, endpoint-ul sau ecranul care confirmă că integrarea funcționează:
- Ce rezultat minim trebuie să apară:
