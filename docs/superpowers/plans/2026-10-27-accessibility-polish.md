# Quality batch4 — quieter live regions, route cues and lobby priority

Scope from accessibility-followup.md and visual-review.md points4–5; quality window ends05:33Europe/Rome. Focus already resolved; preserve timers, host rules and approved art.

1. Instrument real activity text writes; tests first for idle duplicate announcements, active copy≤1percent update/s, immediate state changes, collection≤1time update/s and immediate clicks/errors/expiry, cleanup. Deduplicate live text; throttle only copy percentage, keep visual bar intervals unchanged.
2. Route goal always legible; available free adjacent moves carry directional glyphs and accessible labels, preserving disabled state and obstacle validation. Keyboard/mobile360/390/reduced-motion checks.
3. Lobby missing-team-specific guidance; primary copy-invite button when a team is missing, primary start when ready; QR/link remain in existing panel. Guests see no host start/invite controls. Regression-test host alone, same team, both teams, guest and re-entry.
4. Existing branch, sole author; targeted then full checks/build, browser evidence, commit/push/PR/Pages and public byte check. Independent reviewers coordinated separately. No VoiceOver certification or gameplay expansion.

### 27 ottobre — lotto qualità4: annunci, percorso e lobby
- Regioni live aggiornate solo su cambio testo. Probe riprodotto nei test: sentinella inattiva in8s80→3scritture (4,5/6/8s), copia ferma80→0, calibrazione inattiva10→0, raccolta senza clic5→1al secondo. Copia attiva: percentuale massimo1/s, barra sempre aggiornata ogni100ms. Pausa/ripresa, penalità sentinella, scadenza, oggetto raccolto e copia pronta immediati; cleanup invariato.
- OUT mantiene opacità piena e bordo doppio anche quando non cliccabile e resta nominata all’arrivo. Mosse libere adiacenti con frecce, bordo tratteggiato e nome accessibile “mossa disponibile”; ostacoli mantengono pattern e collisione. Nessuna modifica alla validazione.
- Lobby: squadra mancante nominata nel messaggio e nel pulsante invito primario. Entrambe presenti→Avvia primario; link/QR secondari. Nessun comando host per l’ospite in attesa; rientro nella partita in corso disponibile anche all’ospite.
- Browser a390×844 e360×740: host solo, due Personale, entrambe squadre, ospite, invito da tastiera, avvio da tastiera e rientro ospite. Percorso iniziale/intermedio/ostacolo, navigazione Tab che salta celle inattive, percorso completo+Consegna→passaggio2, anche con animazioni ridotte. Console pulita in tre schede locali. Screenshot `access-lobby-*` e `access-route-*`.
- RED→GREEN per annunci e stati lobby, regressione sulla scritta OUT all’arrivo. Suite75/75; check/build riusciti. Focus non rielaborato; suoni, tempi, durata minima host e regole missione invariati.
- Limiti: misurate mutazioni testuali del vero renderer con DOM/tempo controllati, non annunci vocali di VoiceOver; nessuna certificazione lettori di schermo o dispositivi fisici.

- Rilascio `5a9b6ff` verificato: CI/Pages verdi,22asset pubblici identici a dist. Due schede pubbliche via link; nuova lobby con invito specifico e avvio, percorso completo da tastiera a360px, OUT conservato al traguardo, Consegna→registro e console host senza errori/avvisi. Screenshot `access-public-invite-360.jpg` e `access-public-route-ready-360.jpg`.

- Ricontrollo indipendente regioni live: rimossi due assignment residui dopo update() che duplicavano il testo di scadenza/quinto errore raccolta. Due test dedicati riprodotti RED2→GREEN1 scrittura per evento, senza ulteriori scritture nei tick successivi. Suite finale77/77, check/build riusciti. Nessuna variazione visiva rispetto agli screenshot del lotto.
