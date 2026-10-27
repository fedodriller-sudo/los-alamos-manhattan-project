# Missioni personale (4)

Ruolo: **Personale** (scienziati / tecnici Project Y).  
Obiettivo tipico: completare task senza allarmi, senza dose eccessiva, senza far entrare persone non autorizzate.

---

## M-P1 — Demon Core: i due incidenti (stabilizzare con il cacciavite)

| Campo | Valore |
|--------|--------|
| **Luogo mappa** | `building-d` (Chimica e plutonio) |
| **ID task suggerito** | `demon-core-stabilize` |
| **Critica?** | Sì (sicurezza / lore Demon Core) |
| **Durata** | 90–120 s |

### Premessa storica

- **21 agosto 1945 — Harry Daghlian:** core di plutonio (il futuro «Demon Core») supera la criticità mentre aggiunge mattoni di tungsteno; muore 25 giorni dopo.
- **21 maggio 1946 — Louis Slotin:** dimostra la stessa configurazione con un **cacciavite** per tenere separati i mattoni; il cacciavite scivola → flash di neutroni; Slotin muore in pochi giorni.

Nel gioco **non** si riproduce la morte: si insegna la **geometria critica** e la stabilizzazione manuale come minigioco di precisione.

### Gameplay

1. **Fase A — Daghlian (mattoni):**  
   - Vista top-down o laterale: core al centro, slot per **mattoni di tungsteno/carburo**.  
   - Il giocatore aggiunge mattoni uno a uno; un **indicatore di criticità** (barra o contatore neutroni simulato) sale.  
   - Obiettivo: avvicinarsi al target di misura **senza** superare la soglia rossa.  
   - Se superi → «flash» (schermo bianco), missione **fallita**, dosimetro critico (respawn task).

2. **Fase B — Slotin (cacciavite):**  
   - Stessa geometria ma con **un solo punto instabile**: due mezzi mattoni tenuti da un cacciavite (leva).  
   - Input: **mouse / stick** o tasti fine per **micro-regolare** l’angolo del cacciavite (simula tenere la separazione).  
   - Contemporaneamente: strumento chiede **letture stabili** (es. tre campioni di conteggio neutroni in verde).  
   - Il giocatore deve **tenere il cacciavite nella zona verde** (slider 2D o bilancia) per **N secondi** mentre il contatore acquisisce le misure.  
   - Oscillazione lenta del core (drift) → devi correggere continuamente (come tenere la leva).

3. **Vittoria:** tutte e tre le misure acquisite con criticità sotto soglia.  
4. **UI:** dosimetro HUD, avviso testuale «Non usare una sola mano / non dimostrare a colleghi» (eco regole post-incidente).

### Feedback didattico (opzionale)

- Fine missione: 2 righe su perché **la geometria** e non solo la massa decide la criticità.

### Collegamento spia

- Intel `building-d` (metallurgia Pu) resta separata; questa missione è **solo personale** (la spia non deve fare il minigioco Demon Core in pubblico — o lo fa come copertura con rischio sospetto alto).

---

## M-P2 — Trasferimento plutonio nel glove box

| Campo | Valore |
|--------|--------|
| **Luogo** | `building-d` |
| **ID task** | `pu-glovebox-shuttle` |
| **Critica?** | Media |
| **Durata** | 60–90 s |

### Premessa storica

Il plutonio si manipola in **glove box** (aria filtrata, guanti incorporati): spostare campioni tra stazione di pesata, contenitore e «castello» di piombo senza graffi, polvere o urto.

### Gameplay

1. Vista **frontale** del glove box: due vasche (sinistra: bilancia / destra: contenitore approvato).  
2. Il giocatore controlla le **mani** (due cursori o WASD + mano attiva) per afferrare il **tweezers** e il **campione**.  
3. Vincoli:  
   - non toccare **pareti** o **guarnizioni** (collisione = allarme polvere);  
   - non **rovesciare** il campione;  
   - tempo limite prima che il dosimetro personale (fuori box) salga troppo se resti in posizione scomoda.  
4. **Vittoria:** campione depositato nel contenitore corretto + coperchio chiuso + checklist HEPA (3 tap conferma).  
5. **Minigioco esistente da estendere:** `puShuttle` in `minigames.js` / scene dedicate.

### Variante difficile

- Percorso con **angolo** (da bilancia a slot nel castello di piombo).

---

## M-P3 — Decontaminazione sabbia post-Trinity (verde)

| Campo | Valore |
|--------|--------|
| **Luogo** | Nuovo pin consigliato: `trinity-ground` **oppure** missione globale legata a `opp-trinity` / motor pool convoglio ritorno |
| **ID task** | `trinity-sand-cleanup` |
| **Critica?** | Sì (narrativa Trinity) |
| **Durata** | 75–105 s |

### Premessa storica

Dopo il test **Trinity** (16 luglio 1945), il deserto intorno al detonatore restò **radioattivo**; team raccolsero e seppellirono materiali (trinitite, detriti). Nel gioco la sabbia contaminata è resa **visivamente verde** (fosforescenza / colorazione didattica, non realismo fisico).

### Gameplay

1. Area isometrica o top-down: zone di **sabbia verde** (shader o tile `#3d8b40` / glow).  
2. Equipaggiamento: **scoop**, sacchi plombati, contatore Geiger (audio clic).  
3. Il giocatore:  
   - cammina solo su sentieri sicuri;  
   - riempie sacchi dove il Geiger è più forte;  
   - porta i sacchi al **camion blindato** o al punto di stoccaggio (marker).  
4. **Barra dose:** esposizione personale; ombrello / distanza riducono dose.  
5. **Vittoria:** % sabbia verde raccolta ≥ soglia (es. 85%) entro il tempo.  
6. **Fallimento:** dose personale oltre limite → evacuazione forzata.

### Lore UI

- Brief: «Campagna Jumbo / recupero detriti — non calpestare la cratite.»  
- Colore verde = **indicatore di contaminazione** per il giocatore, non affermazione storica sul colore reale della sabbia.

---

## M-P4 — Sorveglianza ingresso (dogana booleana)

| Campo | Valore |
|--------|--------|
| **Luogo** | `pass-office` (Pass office / badge) **oppure** cancello Tech Area adiacente a `building-a` |
| **ID task** | `gate-boolean-check` |
| **Critica?** | Sì in multiplayer (anti-infiltrazione) |
| **Durata** | Loop 2–3 min o fino a N visitatori |

### Premessa storica

Los Alamos era una **città con badge e Q-clearance**; guardie controllavano pass, visitatori, camion. Nel gioco è una **dogana logica**: entrata sì/no come circuito booleano.

### Gameplay

1. Il giocatore è alla **guardiola**: arrivano NPC (o **avatar altri giocatori** in online) uno alla volta.  
2. Per ogni visitatore vedi **scheda** con 3–5 attributi booleani, es.:  
   - `badge_valido`  
   - `q_clearance_ok`  
   - `visita_autorizzata_oggi`  
   - `veicolo_ispezionato`  
   - `non_in_lista_nera`  
3. Regola del turno (esempio configurabile):  
   - **ENTRA** se `(badge_valido AND q_clearance_ok AND visita_autorizzata_oggi) AND NOT lista_nera`  
   - **VEICOLO** aggiunge `veicolo_ispezionato`  
4. Due pulsanti grandi: **PASS** / **DENY**; errore → allarme + sospetto su spia (se multiplayer).  
5. **Difficoltà:** visitatori con documenti quasi giusti (un solo flag falso); stress timer.  
6. **Vittoria:** ≥ 90% decisioni corrette su 8 visitatori, zero intrusioni «critiche» (spy senza badge che passa).

### Collegamento minigioco esistente

- Estendere `gateIdentify` / logica badge se già presente in `task-scene-fill.js`.

---

## Tabella riepilogo personale

| # | Nome corto | Luogo | Meccanica chiave |
|---|------------|--------|------------------|
| M-P1 | Demon Core | `building-d` | 2 fasi: mattoni + cacciavite per misure stabili |
| M-P2 | Glove box Pu | `building-d` | Trasferimento campione senza collisioni |
| M-P3 | Sabbia verde Trinity | `trinity-ground` | Raccolta contaminazione + dose |
| M-P4 | Dogana booleana | `pass-office` | AND/OR su flag visitatore |
