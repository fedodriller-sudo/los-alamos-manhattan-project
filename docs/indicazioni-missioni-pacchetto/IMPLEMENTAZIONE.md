# Note implementazione (per sviluppatori)

Riferimento codice: `project-y-game/js/tasks-data.js`, `minigames.js`, `mission-ui.js`, `game.js` (vittoria spy).

## Nuovi TaskDef (bozza)

```javascript
// Personale — building-d
{ id: "demon-core-stabilize", locationId: "building-d", type: "minigame", minigame: "demonCoreScrewdriver", ... }
{ id: "pu-glovebox-shuttle", locationId: "building-d", type: "minigame", minigame: "puGlovebox", ... }

// Personale — Trinity / gate
{ id: "trinity-sand-cleanup", locationId: "trinity-ground", type: "minigame", minigame: "trinitySand", ... }
{ id: "gate-boolean-check", locationId: "pass-office", type: "minigame", minigame: "gateBoolean", ... }

// Spia
{ id: "spy-fuchs-fatman", locationId: "gamma", role: "spy", type: "minigame", minigame: "spyPhotostat", ... }
{ id: "spy-rosenberg-forged", locationId: "building-v", role: "spy", ... }
{ id: "spy-seborer-detonation", locationId: "building-t", role: "spy", ... }
```

Aggiungere `trinity-ground` a `LOCATIONS` con coordinate mappa e `LOCATION_DESCS`.

## Minigiochi da creare o estendere

| Chiave | Missione | Meccanica |
|--------|----------|-----------|
| `demonCoreScrewdriver` | M-P1 | Fase mattoni + slider 2D cacciavite + campionamento misure |
| `puGlovebox` | M-P2 | Estensione `puShuttle` con doppia mano e collisioni |
| `trinitySand` | M-P3 | Tile verdi, scoop, sacchi, Geiger audio |
| `gateBoolean` | M-P4 | UI scheda visitatore + espressione booleana configurabile |
| `spyPhotostat` | M-S1 | Progress bar + hide on patrol |
| `spyForgery` | M-S2 | Input nome + timbro slider + delivery point |
| `spyDetonationCopy` | M-S3 | wires/sequence + quiz bridge |

## Asset visivi

| Asset | Uso |
|-------|-----|
| Sabbia tile `#2a5c2e` + glow `#6fdc6f` | M-P3 contaminazione |
| Sprite cacciavite + mattoni tungsteno | M-P1 |
| Glove box frame + tweezers | M-P2 |
| Badge scanner UI | M-P4 |
| Documenti «FAT MAN / IMPLOSION» | M-S1 |

## Audio

- Geiger (M-P3), allarme glove box (M-P2), buzz dogana (M-P4), stampante photostat (M-S1).

## Multiplayer

- M-P4: decisioni guardia influenzano se la spia può entrare in `gamma` senza task finto.  
- M-S1/M-S3: progresso furto visibile solo allo spy; altri vedono «task generico» se implementato `fakeTaskLabel`.

## Test checklist

- [ ] M-P1 fallisce su soglia criticità; vittoria con 3 misure stabili  
- [ ] M-P2 collisione guarnizione → fail  
- [ ] M-P3 dose e soglia raccolta sabbia  
- [ ] M-P4 espressione booleana con almeno 8 casi  
- [ ] M-S2 rifiuto se nome Rosenberg errato  
- [ ] Spy vince con Fuchs + Seborer intel

## Riferimenti storici (1 riga ciascuno)

- Daghlian / Slotin — Demon Core, criticità a mano.  
- Trinity — test 16 lug 1945, Jornada del Muerto.  
- Fuchs — implosione / Fat Man verso URSS.  
- Rosenberg — rete documenti (Greenglass); processo anni ’50.  
- Seborer — declassificazioni su rete GRU e contesto armamenti.
