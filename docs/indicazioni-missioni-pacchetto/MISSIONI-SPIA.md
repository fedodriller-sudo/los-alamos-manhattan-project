# Missioni spia sovietica (3)

Ruolo: **Spia** (rete URSS / GRU-style nel fiction del gioco).  
Obiettivo: rubare intel, falsificare o consegnare documenti, senza essere scoperti in riunione o alla dogana (M-P4).

**Nota storica:** Klaus Fuchs, Julius Rosenberg e Oscar Seborer sono figure reali legate a spionaggio nucleare; il gioco usa **versione semplificata** senza claim legali su colpevolezza oltre quanto serve al fiction educativo.

---

## M-S1 — Klaus Fuchs: documenti Fat Man

| Campo | Valore |
|--------|--------|
| **Luogo primario** | `gamma` (disegni lenti HE / Fat Man) + `building-t` o `building-a` (copia classificata) |
| **ID task** | `spy-fuchs-fatman` |
| **Collegamento intel** | `intelSteal` gamma: «Disegni giunzione lenti HE e prove Fat Man»; A: briefing Trinity |
| **Durata** | 75–120 s (con fasi furto + uscita) |

### Premessa storica

**Klaus Fuchs** (fisico britannico-tedesco, Los Alamos) confessò di aver passato all’URSS informazioni su **implosione** e progetto della bomba a plutonio (**Fat Man**), tra il 1944 e il 1945.

### Gameplay

1. **Copertura:** il giocatore spia ha un task finto visibile agli altri (es. «restituire Primer») mentre è in `gamma`.  
2. **Fase furto:**  
   - mini-mappa ufficio: cassetti con etichette (`LENS ARRAY`, `IMPLOSION TIMING`, `Pu PIT NOTES`).  
   - puzzle **memoria / sequence**: apri la combinazione giusta (3 indizi nel locale — numeri su lavagna, timbro del giorno).  
   - **Photostat / copia:** barra progresso «copia in corso»; se un NPC guardia passa (timer casuale), premi **NASCONDI** o perdi progresso.  
3. **Loot:** oggetto inventario `intel_fatman_packet` (+1 verso vittoria spy globale).  
4. **Fallimento:** sospetto massimo o blocco dogana senza badge aggiornato.

### Dialogo / flavor

- Nome in UI: «Operazione Fuchs» o solo «Copia schema implosione» per evitare spoiler nome in tutorial.  
- Opzione lore: scheda personaggio **Klaus F.** come skin narrativa in single-player.

### Collegamento missioni esistenti (idee doc)

- Allinea a **#55 Schema implosione**, **#51 Photostat**.

---

## M-S2 — Documento finto per Julius Rosenberg

| Campo | Valore |
|--------|--------|
| **Luogo** | `building-v` (officina / disegni) o `post-office` (consegna) |
| **ID task** | `spy-rosenberg-forged` |
| **Durata** | 60–90 s |

### Premessa storica

**Julius Rosenberg** fu condannato (1951) nel contesto della rete di spionaggio atomico legata a **Greenglass** e documenti sul progetto; il processo è storicamente controverso. Nel gioco: missione di **falsificazione** per alimentare una **catena di consegna** (fiction), non simulazione del processo legale.

### Gameplay

1. **Scrivania:** template modulo «Rapporto componenti non nucleari» (copertura) o «Scheda tornitura».  
2. Il giocatore deve **digitare o selezionare** il nome destinatario: **`Julius Rosenberg`** (controllo esatto spelling — 1 errore = documento rifiutato dal contatto).  
3. **Forgery minigioco:**  
   - allinea **firma** o **timbro Q** (slider 2D);  
   - scegli **data** coerente con turno notturno (calendario in-game).  
4. **Consegna:** porta il documento a **punto di drop** (cestino mensa, locker `post-office`, o NPC «contatto» al parcheggio).  
5. **Vittoria:** consegna entro tempo senza essere visto da due testimoni (meccanica «linea di vista» semplificata).  
6. **Intel:** non dà packet Fat Man ma **`intel_cover_chain`** (sblocca riduzione sospetto o secondo canale verso Mosca).

### Etica / tono

- Messaggio post-missione neutro: «Reti di spionaggio usarono documenti e familiari; la storia giudicò questi casi in tribunale.»

---

## M-S3 — Oscar Seborer: innesco e sistema di detonazione

| Campo | Valore |
|--------|--------|
| **Luogo** | `building-t` (elettronica / timing) + `gamma` (pad assemblaggio) |
| **ID task** | `spy-seborer-detonation` |
| **Durata** | 90 s |

### Premessa storica

**Oscar Seborer** (declassificato in documenti successivi) è associato alla rete sovietica e a conoscenze su **armamenti e innesco**; nel Manhattan Project l’**innesco** e la **sincronizzazione** delle lenti HE erano segreti tanto quanto il pit.

### Gameplay

1. **Obiettivo intel:** rubare schema **detonator network** + tabella **tempi di detonazione** (es. 32 punti sferici).  
2. **Fase A — Schemi:** puzzle wires / `sequence` per «fotografare» pannello senza staccare cavi (solo copia ottica — mini-game mirror).  
3. **Fase B — Innesco:**  
   - scegli quale **bridge wire** e quale **cap** corrispondono al diagramma (quiz a tempo);  
   - errore → allarme silenzioso (sospetto +10).  
4. **Loot:** `intel_detonation_system` — conta doppio per vittoria spy se già possiedi `intel_fatman_packet` (combo «bomba completa»).  
5. **Flavor:** scheda «O. Seborer» come tecnico elettricista con accesso pad.

### Collegamento personale

- Se il personale completa **M-P4** male, la spia ha più tempo in `building-t`.

---

## Tabella riepilogo spia

| # | Personaggio storico (fiction) | Focus intel | Luogo |
|---|------------------------------|-------------|--------|
| M-S1 | Klaus Fuchs | Fat Man / implosione | `gamma`, `building-a` |
| M-S2 | Julius Rosenberg | Documento falso + consegna | `building-v` → `post-office` |
| M-S3 | Oscar Seborer | Innesco e detonazione | `building-t`, `gamma` |

## Vittoria spy (suggerimento)

- Richiedi **almeno 2** tra: `intel_fatman_packet`, `intel_detonation_system`, più eventuale `intel_cover_chain` da M-S2.  
- Poi sequenza esistente **Dispatch Mosca** (#52 nel doc idee).
