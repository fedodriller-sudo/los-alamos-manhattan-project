# Missioni storiche (idee) — Manhattan Project Los Alamos

Documento di design **non collegato al codice**: proposte di missioni ispirate alla storia reale del Project Y, una per edificio (o più), da usare per lore, presentazioni o future implementazioni.

**Gioco di riferimento:** `project-y-game` (mappa TA-1, ruoli Personale / Spia).

---

## Legenda campi

| Campo | Significato |
|--------|-------------|
| **ID luogo** | Chiave in `js/tasks-data.js` |
| **Gameplay** | Cosa fa il giocatore (minigioco suggerito) |
| **Storia** | Perché conta nel Manhattan Project |
| **Spia** | Come si lega all’intel del luogo (opzionale) |

**Tipi minigioco nel progetto:** `sequence`, `wires`, `slider`, scene dedicate (`gateIdentify`, `puShuttle`, …).

---

## Chimica e plutonio (`building-d`)

**Intel spia:** appunti metallurgia Pu e procedure di purificazione.

### 1. Alpha in the box
- **Gameplay:** checklist glove box — verifica flusso HEPA, assenza di pelucchi/statica; un errore → allarme polvere.
- **Storia:** le radiazioni **alfa** del Pu sono bloccate dalla pelle, ma **polvere inalata** è letale; i glove box erano la linea di difesa quotidiana.
- **Minigioco suggerito:** sequenza / `puShuttle` (sposta campione senza toccare bordi).

### 2. Pit on the scale
- **Gameplay:** pesa un campione **sub-grammo**; se il dosimetro sale troppo, interrompi e chiama Health.
- **Storia:** la massa del **pit** entrava nei calcoli di **criticità**; il metallo Pu **si scalda** da solo per radioattività.
- **Minigioco:** `puRadiationBalance` / slider bilancia.

### 3. L’isotopo sbagliato
- **Gameplay:** smista schede lotto: batch con **Pu-240 alto** → cartella «NON per Thin Man / cannone».
- **Storia:** il plutonio da reattore contiene **Pu-240** (neutroni spontanei) → la bomba a **cannone** per Pu fu abbandonata.
- **Minigioco:** drag documenti / symbol match.

### 4. Castello di piombo
- **Gameplay:** impila **mattoni di piombo** in geometria approvata per stoccaggio temporaneo del pit.
- **Storia:** dopo incidenti di **criticità** (Demon Core, 1945–46), le regole su geometria e schermatura divennero ferree; nel gioco si anticipa la cultura della sicurezza.
- **Minigioco:** sequence / drag blocchi.

---

## Main Technical (`building-t`)

**Intel spia:** registri esperimenti T e copia del **Los Alamos Primer**.

### 5. Primer pagina 47
- **Gameplay:** timbra e distribuisci un capitolo del **Primer** (fisica neutroni); timbro sbagliato → richiamo documenti.
- **Storia:** il Primer era il «libro di testo» classificato per i nuovi arrivati.
- **Minigioco:** sequence / drag stamp.

### 6. Clock drift
- **Gameplay:** sincronizza oscilloscopio, camera e timer per diagnostica implosione (nanosecondi contano).
- **Storia:** misure di **onda d’urto** richiedevano strumenti allineati nel tempo.
- **Minigioco:** wires / patch panel.

### 7. Pellicola annebbiata
- **Gameplay:** sviluppa film di prova; trova la **fuga di luce** in camera oscura.
- **Storia:** radiografie e flash erano centrali per vedere **lenti HE** e esperimenti.
- **Minigioco:** slider (esposizione) + sequence.

---

## Assemblaggio HE (`gamma`)

**Intel spia:** disegni giunzione lenti HE e prove **Fat Man**.

### 8. Lens kiss
- **Gameplay:** accoppia due segmenti di **lente esplosiva** sul tappeto; calibro spessore (feeler gauge).
- **Storia:** **Fat Man** usa lenti HE per un’**implosione sferica**; giunti difettosi = fallimento.
- **Minigioco:** sequence / `heTorqueBolts`.

### 9. Occhio gamma
- **Gameplay:** leggi **gammagrafia** di un giunto; individua **vuoto** interno → scarta pezzo.
- **Storia:** controllo non distruttivo prima dei test sul pad.
- **Minigioco:** slider / spot-the-defect.

### 10. Etichetta coppia
- **Gameplay:** serra bulloni a **ft·lb**; un bullone oltre coppia → incrinatura (fail).
- **Storia:** assemblaggio disciplinato come in aeronautica.
- **Minigioco:** `heTorqueBolts`.

---

## Alta energia — Composition B (`sigma`)

**Intel spia:** dati colate Composition B e stoccaggio HE.

### 11. Quench a 42 °C
- **Gameplay:** mantieni temperatura di colata al **punto di quench**; esci dalla fascia → colata a rischio.
- **Storia:** colate non uniformi creano **vuoti** nell’HE delle lenti.
- **Minigioco:** `compositionQuench` / slider.

### 12. Ventila prima di versare
- **Gameplay:** checklist pre-colata: ventilazione, niente attrezzi che scintillano, umidità OK.
- **Storia:** Sigma = ambiente **antideflagrazione**.
- **Minigioco:** wires checklist.

### 13. Lotto fantasma
- **Gameplay:** abbina etichette **lotto HE** al registro Sigma; una cassa non coincide → ferma convoglio.
- **Storia:** tracciabilità esplosivo come in munizionamento militare.
- **Minigioco:** sequence / drag crate.

---

## Supporto HE (`delta`)

**Intel spia:** manifesti trasferimento verso **S-Site**.

### 14. Regola del muro di terra
- **Gameplay:** sposta tronchetti HE solo con **barriera earth-filled** tra te e magazine.
- **Storia:** barriere in terra limitano danni da detonazione accidentale.
- **Minigioco:** wires / `truckLoad` dietro bunker.

### 15. Regola delle due persone
- **Gameplay:** trasferimento HE richiede **firma guardia + handler**; manca una firma → blocco.
- **Storia:** sicurezza fisica + procedura a due teste.
- **Minigioco:** sequence badge + drag.

---

## Ciclotrone (`building-x`)

**Intel spia:** risultati ciclotrone e misure nucleari.

### 16. Fascio sul mirino
- **Gameplay:** regola **doppio trim magnetico** finché il fascio centra il target.
- **Storia:** sezioni d’urto e dati nucleari per i modelli di bomba.
- **Minigioco:** `cyclotronDualTrim` / beam crosshair.

### 17. Panico al vuoto
- **Gameplay:** pompa camera; trova e chiudi **microfuga** prima del trip.
- **Storia:** ciclotroni inoperabili senza vuoto stabile.
- **Minigioco:** slider + wires valvole.

---

## Cockcroft–Walton (`building-z`)

**Intel spia:** parametri generatore **neutroni**.

### 18. Ora dei neutroni
- **Gameplay:** rampa **alta tensione**; tieni conteggio neutroni nella banda per esperimento di attivazione.
- **Storia:** sorgenti neutroni per test materiali e detector.
- **Minigioco:** `neutronFluxBalance` / `hvLevers`.

### 19. Interlock schermatura
- **Gameplay:** chiudi **porta schermata**; sensore OK → abilita fascio (sequenza sicurezza).
- **Storia:** corridoi acceleratore = dose alta senza schermi.
- **Minigioco:** sequence interlock.

---

## Van de Graaff (`building-w`)

**Intel spia:** calibrazioni e fasci ad alta tensione.

### 20. Cinghia logora
- **Gameplay:** ispeziona **cinghia** del generatore; sostituisci prima dell’arco al terminale.
- **Storia:** macchine HV delicate, manutenzione continua.
- **Minigioco:** wires ispezione.

### 21. Scarica controllata
- **Gameplay:** test scarica a distanza sicura; regola isolamento terminali.
- **Storia:** fisica nucleare sperimentale con tensioni estreme.
- **Minigioco:** slider spark gap.

---

## Criogenia (`building-y`)

**Intel spia:** protocolli criogenia e dati detector.

### 22. Roulette del dewar
- **Gameplay:** riempi **azoto liquido** tra tacche MIN/MAX; trabocco → allarme e pausa esperimento.
- **Storia:** detector a bassa temperatura per misure precise.
- **Minigioco:** `cryoDewarFill`.

### 23. Tenuta criostato
- **Gameplay:** test tenuta guarnizioni criostato; perdita lenta → fail sequenza.
- **Storia:** senza criogenia stabile, settimane di lavoro persi.
- **Minigioco:** sequence + slider.

---

## Laboratori chimia e fisica (`building-u`)

**Intel spia:** diari laboratorio e conteggi.

### 24. Plateau beta
- **Gameplay:** regola tensione contatore **GM** sul plateau beta corretto.
- **Storia:** tutta la radiochimia si basa su conteggi affidabili.
- **Minigioco:** slider gauge.

### 25. Acido neutro
- **Gameplay:** neutralizza acido di scarto da chimica Pu **solo** in cappa; pH fuori range → stop.
- **Storia:** scarti da Edificio D pericolosi per uomini e ambiente.
- **Minigioco:** `reagentPour` / sequence.

---

## Officine meccaniche (`building-v`)

**Intel spia:** disegni tornitura gadget, tamper, componenti.

### 26. Tornio al tamper
- **Gameplay:** torni blank in **uranio impoverito** (tamper); verifica con **calibro master**.
- **Storia:** pezzi del gadget a tolleranze estreme; **Greenglass** (rete spionaggio) era macchinista qui.
- **Minigioco:** `dragLathe` / slider precisione.

### 27. Imballo classified
- **Gameplay:** imballa pezzo tornito con sigillo e doppia firma per convoglio.
- **Storia:** catena di custodia verso S-Site / assemblaggio.
- **Minigioco:** sequence seal.

---

## Direzione Project Y (`building-a`) ★

**Intel spia:** briefing Oppenheimer–Groves e timeline **Trinity**.  
**Hub Oppenheimer** — missioni ★ critiche per vittoria crew.

### 28. ★ Funeral Thin Man
- **Gameplay:** archivia memo ufficiale: **cancella bomba a cannone per plutonio**; instrada risorse a **implosione**.
- **Storia:** svolta 1944 verso **Fat Man**.
- **Minigioco:** sequence documenti / oppenheimer star.

### 29. ★ Deadline Groves
- **Gameplay:** compila telegramma stato per **generale Groves**: verde/giallo/rosso su readiness Trinity.
- **Storia:** tensione militare vs cautela scientifica.
- **Minigioco:** wires cifratura semplificata.

### 30. ★ Finestra Trinity
- **Gameplay:** scegli slot test usando **rosa dei venti** (pioggia/vento = fallout).
- **Storia:** test **16 luglio 1945**, Alamogordo; **Gadget** = stesso design Fat Man.
- **Minigioco:** slider meteo + map.

### 31. Lista Q scrub
- **Gameplay:** aggiorna roster **clearance Q**; un nome flag FBI → non entra in TA-1.
- **Storia:** sicurezza interna (non impedì tutte le spie, ma procedura reale).
- **Minigioco:** sequence badge list.

---

## Health Group (`building-q`)

**Intel spia:** registri dose (copertura movimento spia).

### 32. Badge over limit
- **Gameplay:** leggi **film badge**; se sopra soglia → invia tecnico a doccia decon.
- **Storia:** nascita della **health physics**; limiti dose ancora primitivi vs oggi.
- **Minigioco:** `geigerSweep` / sequence.

### 33. Docce a tempo
- **Gameplay:** drill doccia decon dopo allarme **polvere Pu** simulata.
- **Storia:** routine post-incidenti criticità e cultura Pu.
- **Minigioco:** wires timer + sequence.

---

## Centrale termica n.2 (`boiler`)

**Intel spia:** schemi rete vapore (mappa sito).

### 34. Inverno sul mesa
- **Gameplay:** regola pressione **vapore** prima che i lab scendano sotto temperatura minima (notte invernale).
- **Storia:** Los Alamos a ~2200 m; senza calore, la scienza si ferma.
- **Minigioco:** slider pressione.

---

## Fonderia (`foundry`)

**Intel spia:** specifiche leghe componenti.

### 35. Sabbia incrinata
- **Gameplay:** ispeziona **forma di sabbia**; crepa capillare → non versare lega.
- **Storia:** supporti metallici per attrezzature e prove.
- **Minigioco:** slider ispezione / `flameCut` tema fonderia.

---

## Magazzini (`warehouse`)

**Intel spia:** inventario classificato e **uranio depleted**.

### 36. Conta le barre DU
- **Gameplay:** inventario barre **uranio impoverito**; un seriale mancante → lock magazzino.
- **Storia:** DU usato come **tamper** in bomb design.
- **Minigioco:** sequence numeri / wires.

### 37. Sigillo convoglio
- **Gameplay:** applica **piombo + due firme** su cassa classificata per S-Site.
- **Storia:** catena di custodia materiali sensibili.
- **Minigioco:** drag seal + stamp.

---

## Post Exchange (`px`)

**Intel spia:** liste personale autorizzato TA.

### 38. Razion Q
- **Gameplay:** eroga articolo ristretto solo con **doppio badge** valido.
- **Storia:** PX come morale + controllo accessi soft.
- **Minigioco:** `gateIdentify` variante badge.

---

## Ambulatorio (`dispensary`)

**Intel spia:** referti con nomi scienziati chiave.

### 39. TNT nelle urine
- **Gameplay:** analizza campione **TNT** da lavoratore Sigma; sopra soglia → stop turno HE.
- **Storia:** rischio **chimico** oltre al nucleare.
- **Minigioco:** wires lab sequence.

### 40. Torace esplosivisti
- **Gameplay:** archivia lastra **torace** pre-impiego in reparto HE.
- **Storia:** medicina del lavoro in ambiente industriale bellico.
- **Minigioco:** sequence archive.

---

## Parco veicoli (`motor-pool`)

**Intel spia:** orari convogli S-Site / V-Site.

### 41. Convoglio S-Site
- **Gameplay:** pre-trip: pneumatici, catene, **nessun attrezzo libero** nel cassone (scintille).
- **Storia:** lenti HE su strade sterrate del mesa.
- **Minigioco:** `truckLoad` checklist.

### 42. Percorso notturno
- **Gameplay:** traccia percorso su mappa evitando checkpoint sbagliati (OPSEC).
- **Storia:** movimenti classificati notturni verso siti di assemblaggio.
- **Minigioco:** wires route.

---

## Ufficio postale — censura (`post-office`)

**Intel spia:** lettere censurate (Trinity, implosione).

### 43. Redact 1663
- **Gameplay:** censura lettera: cancella parole **implosione**, **Trinity**, **Pu**, **Groves**.
- **Storia:** indirizzo **PO Box 1663, Santa Fe**; città invisibile sulle buste.
- **Minigioco:** drag censor / `dragCensor`.

### 44. Busta troppo spessa
- **Gameplay:** ispeziona pacco sospetto (spessore anomalo) → segnala a sicurezza (spy hook).
- **Storia:** timore microfilm e fughe di informazioni.
- **Minigioco:** slider + choice.

---

## Mensa (`commissary`)

**Intel spia:** turni mensa (chi lavora di notte).

### 45. Stufato del turno notte
- **Gameplay:** rifornisci mensa per **02:00**; headcount indica picco turno lab.
- **Storia:** vita sul Hill 24/7; pattern sociali osservabili (cover spia).
- **Minigioco:** sequence stock.

---

## Ufficio pass (`pass-p`)

**Intel spia:** registro badge e clearance Q.

### 46. Badge mismatch
- **Gameplay:** visitatore ha badge **Post** ma non **Tech Area** → nega ingresso recinto.
- **Storia:** doppio sistema accessi TA-1.
- **Minigioco:** `gateIdentify` / sequence.

### 47. VIP Groves
- **Gameplay:** registra visita ispettore; **escort** non lascia mai il visitatore solo.
- **Storia:** visite Manhattan District al Hill.
- **Minigioco:** sequence escort path.

---

## Ashley Pond (`pond`)

**Intel spia:** note sorveglianza area ricreativa.

### 48. Fantasma Ranch School
- **Gameplay:** confronta foto **pre-guerra** del lago con fence attuale; segna nuova costruzione classificata.
- **Storia:** ex **Los Alamos Ranch School**; contrasto infanzia/ricreazione vs segreto.
- **Minigioco:** slider compare / spot difference.

---

## Lavanderia (`cleaners`)

**Intel spia:** registro camici e accessi padiglioni contaminati.

### 49. Lavaggio caldo sbagliato
- **Gameplay:** separa camici **padiglione Pu**; lavaggio sbagliato → contaminazione incrociata.
- **Storia:** controllo contaminazione al di fuori dei lab.
- **Minigioco:** drag sort coats.

---

## Zia Company (`zia`)

**Intel spia:** piani elettrici padiglioni.

### 50. Blackout sul Hill
- **Gameplay:** ripristina **linea elettrica** padiglione D entro 20 minuti di backup.
- **Storia:** appalto locale per utilità; senza corrente, glove box e pompe fermi.
- **Minigioco:** wires repair.

---

## Missioni solo ruolo Spia (qualsiasi luogo con intel)

### 51. Photostat cinque minuti
- **Gameplay:** copia schema **lenti** durante rotazione guardia; timer corto.
- **Storia:** parallelo **Klaus Fuchs** / documenti implosione.
- **Luogo ideale:** Gamma, Direzione, Main T.

### 52. Dispatch Mosca
- **Gameplay:** dopo **N** intel raccolti, mini-sequence cifratura pacchetto (già in `game.js` come vittoria spy).
- **Storia:** reti che passavano informazioni all’URSS (non istantanee, ma danno enorme).

### 53. Copertura credibile
- **Gameplay:** se interrogato in riunione, scegli scusa lab plausibile; errore → sospetto / voto.
- **Storia:** spie come **scienziati credibili**, non intrusi esterni.

### 54. Microfilm nella posta
- **Missione globale spy:** `spy-micro` — estrai microfilm da posta censurata (PO Box 1663).
- **Luogo:** Ufficio postale.

### 55. Schema implosione
- **Missione globale spy:** `spy-copy` — copia schema lenti Fat Man.
- **Luogo:** Gamma o Direzione.

---

## Top 10 — luoghi e missioni «speciali» (personale)

Ordine per **importanza storica** + **missione più bella** da quel luogo. Usa questi se devi scegliere pochi pin sulla mappa o pochi episodi in presentazione.

| # | Luogo (`id`) | Perché è tra i top | Missione consigliata (n° doc) |
|---|----------------|-------------------|-------------------------------|
| 1 | **Chimica e plutonio** (`building-d`) | Cuore di **Fat Man**: Pu, pit, criticità, Demon Core; nessun altro edificio è così unico. | **#4 Castello di piombo** + **#2 Pit on the scale** |
| 2 | **Direzione Project Y** (`building-a`) | **Thin Man → Fat Man**, Groves, **Trinity**; le 3 missioni ★ sono il cuore narrativo del gioco. | **#28 Funeral Thin Man**, **#30 Finestra Trinity** |
| 3 | **Assemblaggio HE** (`gamma`) | **Lenti esplosive** e implosione; visivamente e storicamente «la bomba» più complessa. | **#8 Lens kiss** + **#9 Occhio gamma** |
| 4 | **Alta energia Sigma** (`sigma`) | Dove l’HE **nasce** (Composition B); rischio industriale reale, diverso dal Pu. | **#11 Quench a 42 °C** |
| 5 | **Main Technical** (`building-t`) | **Los Alamos Primer**, cultura scientifica del lab; ponte tra fisica e documenti. | **#5 Primer pagina 47** |
| 6 | **Ufficio postale** (`post-office`) | **PO Box 1663**, censura; simbolo della città segreta (non «fisica», ma iconico). | **#43 Redact 1663** |
| 7 | **Officine meccaniche** (`building-v`) | **Gadget** fisico + legame **Greenglass** / tornitura; terra tra scienza e spionaggio. | **#26 Tornio al tamper** |
| 8 | **Health Group** (`building-q`) | **Demon Core**, dosimetria, decon; conseguenze umane del Pu. | **#32 Badge over limit** + **#33 Docce a tempo** |
| 9 | **Parco veicoli** (`motor-pool`) | **S-Site / V-Site**; il segreto si muove su camion nel deserto. | **#41 Convoglio S-Site** |
| 10 | **Cockcroft–Walton** (`building-z`) | Neutroni e **alta tensione**; «laboratorio da film» diverso da glove box e HE. | **#18 Ora dei neutroni** |

**Honorable mention (casi speciali ma più di supporto):** Delta (barriere HE), Pass office (badge), Ashley Pond (contrasto Ranch School / guerra).

---

## Top 5 — luoghi e missioni per la **spia sovietica**

La spia vince con **intel** mirata a ciò che Mosca voleva davvero: **implosione**, **Pu**, **timeline**, **personale**. Priorità rubare / fingere qui:

| # | Luogo (`id`) | Intel in gioco | Missione / azione spy migliore |
|---|----------------|----------------|--------------------------------|
| 1 | **Direzione Project Y** (`building-a`) | Briefing Oppenheimer–Groves, **Trinity** | Rubare timeline / memo implosione (**#28** contesto); copertura in **#53** durante riunione |
| 2 | **Assemblaggio HE** (`gamma`) | Disegni **lenti Fat Man** | **#55 Schema implosione** + **#51 Photostat** sul pad |
| 3 | **Chimica e plutonio** (`building-d`) | Metallurgia **Pu**, purificazione | Intel «appunti Pu»; missione staff **#3 Isotopo sbagliato** spiega perché vale oro per Mosca |
| 4 | **Main Technical** (`building-t`) | **Los Alamos Primer**, registri T | Copia Primer durante **#5**; massimo valore «manuale della bomba» |
| 5 | **Ufficio postale** (`post-office`) | Lettere su **Trinity / implosione** | **#54 Microfilm nella posta** + **#44 Busta troppo spessa** |

**Seconda fascia spy (utili, meno decisive):** Officina V (schizzi Greenglass-style), Pass office (badge/clearance), Mensa (turni notturni = chi è al lab), Zia (piani elettrici = mappare sito).

**Regola narrativa:** la spia non deve «vincere» ovunque — **3–5 edifici** con intel forte bastano per una partita credibile; il personale deve correre su **D + Gamma + A** per le missioni ★.

---

## Riferimenti storici rapidi (per dialoghi in-game)

| Tema | Fatto |
|------|--------|
| **Thin Man → Fat Man** | Pu-240 → implosione |
| **Trinity / Gadget** | 16 lug 1945, test prima di Nagasaki |
| **Little Boy** | Uranio, cannone, Hiroshima |
| **Demon Core** | Daghlian 1945, Slotin 1946 — criticità a mano |
| **Spionaggio** | Fuchs, Hall, Greenglass / Rosenberg (dibattito storico) |
| **PO Box 1663** | Indirizzo «fantasma» Santa Fe |

---

## Note implementazione (se un giorno si aggiungono al gioco)

1. Aggiungere in `tasks-data.js` come nuovi `TaskDef` con `id` univoco.
2. Collegare scene in `task-scene-fill.js` / `minigame-scenes.js` se non è `wires`/`slider`/`sequence`.
3. Per missioni ★ usare flag `oppenheimer: true` o nuovo flag `historical: true`.
4. Testo modale: `LOCATION_DESCS` o stringhe in `mission-ui.js`.

---

*Ultimo aggiornamento: aggiunta sezione Top 10 personale + Top 5 spia. Le missioni numerate (#1–#55) sono idee; il gioco attuale usa ancora `tasks-data.js`.*
