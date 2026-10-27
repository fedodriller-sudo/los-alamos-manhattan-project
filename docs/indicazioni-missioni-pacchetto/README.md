# Indicazioni missioni — pacchetto design

**Progetto:** `project-y-game` / Los Alamos Manhattan Project  
**Data:** ottobre 2025  
**Scopo:** specifiche per implementare un set ridotto di missioni «top» (personale + spia sovietica), come richiesto in design.

## Contenuto del pacchetto

| File | Contenuto |
|------|-----------|
| `MISSIONI-PERSONALE.md` | 4 missioni personale (Demon Core, glove box, Trinity sabbia, dogana ingresso) |
| `MISSIONI-SPIA.md` | 3 missioni spia (Fuchs, Rosenberg, Seborer) |
| `IMPLEMENTAZIONE.md` | ID luoghi, minigiochi suggeriti, asset, vittoria/fallimento |

## Priorità luoghi (mappa)

- **Personale:** `building-d` (×2), sito Trinity / post-test, `pass-office` (o `building-a` ingresso Tech Area)
- **Spia:** `gamma` + `building-t` + `building-a` (documenti Fat Man), consegna narrativa Rosenberg

## Ordine narrativo consigliato (campagna corta)

1. Personale M1 — Demon Core (training sicurezza)  
2. Personale M2 — Glove box Pu  
3. Spia M1 — Fuchs / documenti Fat Man  
4. Personale M4 — Dogana ingresso (parallelo possibile in multiplayer)  
5. Personale M3 — Sabbia verde Trinity (dopo evento Trinity in lore)  
6. Spia M2–M3 — Rosenberg + Seborer (innesco)

---

*Questo ZIP è solo documentazione; non modifica `tasks-data.js` finché non si implementa in codice.*
