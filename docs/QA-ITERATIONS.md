# Revision ledger

## 2026-10-20, pass 1
- Shared progression tests: wrong choice never advances; all chapters gate correctly; duplicate completion blocked; malformed saves sanitized. Passed.
- Socket integration tests: shared steps with two players; host-only start; host transfer; private paths not served. Passed.
- Independent review found malformed field crash and same-room orphaning. Added failing regression, fixed both, 7/7 tests passed.
- Browser: solo start, wrong choice -> hint without penalty, success -> next step, completion -> historical fact/source, reload -> resume visible. No console errors.
- Browser: two real browser tabs, room create/join, host start, avatars present, first client step 1, second client resumes step 2, second client completes, first client receives completion. Passed.

## Design QA pass 1
- Source: selected third generated concept (nighttime campus). User refinement: historical cooperative work, no social deduction.
- Desktop viewport 1280x720, narrow viewport 687x988.
- P2: bottom persistent interaction controls below fold at 1280x720. Fix: constrain the map to available height without stretching the raster; preserve 3:2 ratio.
- P2: mobile map used 1.25 ratio and stretched the source asset. Fixed to source 3:2 ratio.
- P2: full-height human sprite illegible at small size. Replaced by original chibi sprite and added second researcher sprite.
- P2 interaction: modal close/reopen can clear active event on next episode with reduced motion; fix lifecycle guard and verify reduced-motion flow.
- Intentional changes: notebook replaces task checkboxes; no red emergency vote button because user chose historical co-op; map expands four lab scene into navigable artistic campus.

## Pass 2
- Complete browser co-op walkthrough: eight episodes, final journal, chapter unlocks, late rejoin with preserved shared progress. Passed.
- Reduced-motion immediate transition between episodes reproduced and verified after lifecycle guard fix.
- Native map aspect restored on narrow layout; at 1280x720 all persistent controls now fit: map 723x482, bottom control at y611, page scroll height720. No stretched map art.
- Original chibi avatars now legible; two sprite variants, player names and color identifiers.
- Added calculator comparison and ordered-card workbench, invented sample data explicitly labeled.
- Browser workbench checks: wrong card order -> hint; reset -> correct order -> next step; calculator comparison -> success. Passed.
- Partial solo save restored at 4/8 episodes with the unfinished card step preserved. Passed.
- Nine tests pass including complete co-op turn and array-based sequence validation.
- GitHub CLI authentication verified with network access: WRITE permission on target repository. Initial authentication failure came from restricted networking.
- Added read-only GitHub Actions checks for Node20/22/24 on push and PR.

## Pass 3
- Independent whole-branch review: no actionable P1/P2 findings. Nine tests and syntax checks confirmed by reviewer.
- Offline browser test: stopped Node server, reloaded the application from cache, restored partial solo progress; map, icon and sprite images all loaded. Server restarted with final dataset afterward.
- Design QA evidence and explicit viewport/state differences saved in root design-qa.md.
- Residual limits: no physical phone/LAN hardware pass; no exhaustive legacy-cache migration or connection-cancellation timing matrix.

## Additional multiplayer verification
- Expanded the real-socket suite to 11 passing tests.
- Eight participants admitted; ninth rejected; departed participant frees a seat.
- Switching rooms preserves independent progress and transfers the old room's host role correctly.
- No production change needed for these cases.

## Six-hour window closed — 2026-10-21 03:22 Europe/Rome
- Scheduled window ended at03:21; final scheduler check ran at03:22.
- Application commit23a0666 remains unchanged, with a clean worktree and matching PR head.
- PR1 remains OPEN/DRAFT. All push and PR CI checks succeeded on Node20,22,24, including the11-test suite.
- Every periodic preview health check returned HTTP200, including the final check. No regression was observed during monitoring; unchanged code was not repeatedly reworked or retested locally.
- Delivered scope: night cartoon UI, eight sourced historical episodes, two workbench interactions, cooperative localhost/LAN rooms for2–8 players, solo persistence, offline exploration, adjustable audio/motion, source notes and QA evidence.
- Historical facts and fictional adaptations remain explicitly distinguished; source and editorial notes are in docs/HISTORY.md. No additional historical claims were introduced during monitoring.
- Remaining limits: no physical-phone or separate-device LAN test; no exhaustive legacy-cache upgrade or cancellation-timing matrix; the map is artistic rather than collision-accurate historical geography; two avatar illustrations.
- No merge or deployment performed. Scheduled monitor disabled after recording this closeout; the local preview server is left available.

## 2026-10-26 — Browser host and animated scene

- Replaced active WebSocket client with native WebRTC DataChannels. Browser host uses the same historical progress rules; 2–8 seats, identity validation, duplicate-step protection and late join remain.
- No external signaling or ICE service: distinct complete-ICE offer/answer per guest, copy/paste exchange, cancellation of pending invites. Host tab must remain open; no automatic host migration.
- Added patrolling decorative colleagues, night motes, breathing/stride animation, dialog entrances and click-to-walk; reduced motion remains respected. Historical source content unchanged.
- Independent review found and fixed free-walk target crash, Unicode signaling and exhausted pending invites. Added signaling regression tests.
- Two real browser tabs connected, both received game start without a game server. Final visual/shared-answer proof recorded below after final checks.
- Pages API returned 404 with contributor account (`push=true`, `admin=false`, `maintain=false`): owner activation required. No merge performed.

- Final local checks: 17/17 tests pass; syntax checks and static build pass. Real-browser proof includes Unicode guest name, synchronized free walking, host first answer and guest second answer, both diaries at 1/8, no console errors. NPC transform samples changed across observations, confirming ongoing animation. Screenshot: `docs/screenshots/browser-host-animated.jpg`.
- Owner enabled Pages with GitHub Actions and agreed to allow the feature branch in the github-pages deployment environment. Added gated publish workflow; live result pending first run.
- Public deployment succeeded via Actions run 40388493709: https://fedodriller-sudo.github.io/los-alamos-manhattan-project/ . Two tabs on this HTTPS origin completed offer/answer and reached the same two-player game. All images loaded, three animated colleagues present, no browser console errors. A narrow 562×988 viewport also rendered the map and episode controls without clipping.
- Added explicit copy control for invitation/answer and disabled concurrent signaling actions to prevent copying an obsolete output during ICE preparation.

## 26 ottobre 2026 · Personale contro Spie

- Quattro missioni Personale e tre Spie, progressi per squadra, fine gara autorevole al primo completamento totale.
- 29 test automatici verdi: vincitori alternativi, blocco risposte successive, gruppi obbligatori, risposte avversarie/duplicate, turno obsoleto, privacy, late join e rivincita.
- Prova reale WebRTC su due schede: Personale 4/4 → stesso vincitore e tempo su tutti; rivincita → entrambe a zero; Spie 3/3 → stesso risultato su tutti. Provati errore pass, collisione percorso, esposizione al limite, copia interrotta dalla sentinella e ripartenza.
- Revisione indipendente: corretto aggiornamento di Rivincita quando l’ultimo avversario esce. Riproduzione prima della modifica e nuova gara dopo: pulsante disabilitato e motivo visibile.
- Mobile 390×844, desktop 1280×720, movimento ridotto, campagna singola dopo gara e console senza errori. La vittoria chiude un’attività aperta anche sul client perdente.
- Fonti specifiche nei sette dossier; Slotin distinto da Daghlian e datato 1946, Trinity distinto da Los Alamos, Rosenberg non presentato come dipendente del laboratorio. Attività scientifiche astratte e inventate.
- Prove visive in `docs/screenshots/team-race-desktop.jpg`, `spies-victory.jpg`, `team-victory-mobile.jpg`, `team-route-mobile.jpg`.
- Limiti: nessun test tra dispositivi fisici diversi o su ogni router/browser; host obbligatoriamente presente, nessuna migrazione né anticheat forte.

### 27 ottobre — PeerJS + rifinitura UI
- Collegamento automatico con unico link stanza e QR locale (PeerJS 1.5.5, QRCode 1.5.4 vendorizzati, licenze incluse). Indicazione Wi-Fi/hotspot e Internet visibile nella lobby.
- Tre schede reali collegate tramite lo stesso invito: squadre, avvio, intera missione Rosenberg e conteggi verificati. Rientro tardivo e uscita host verificati. Layout 390px e desktop controllati.
- Corretti salvataggio solo dopo perdita host, canali tardivi, posti tecnici bloccati da connessioni mai aperte, messaggio di ripristino broker. Test di regressione RED→GREEN, suite 41/41, check/build riusciti.
- Pubblicazione del lotto in corso sul ramo esistente; nessun merge. Nessun test su hardware/reti fisiche distinti. Revisioni aggiuntive già registrate dal coordinamento per il lotto successivo.
- Rilascio verificato: codice `9e4d52a`, CI e Pages riusciti. Sei asset principali pubblici confrontati byte per byte con dist: identici. Tre schede del sito pubblico entrate dallo stesso link, roster 3/8, avvio e richiamo sincronizzati; console senza errori in tutte e tre. Screenshot `peerjs-public-lobby.jpg` e `peerjs-public-game.jpg`.
- Il QR nello screenshot mobile è stato decodificato localmente e restituisce esattamente il link della stanza. Corretto anche il messaggio di stanza aperta residuo dopo chiusura/riapertura; regressione coperta. La prima CI aveva rilevato il nome minuscolo `qrcode/license` su Linux: corretto, bundle riproducibili e licenze incluse.
