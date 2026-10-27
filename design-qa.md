# Product Design QA — Los Alamos

final result: passed

## Visual truth and evidence

- Selected direction: `docs/screenshots/selected-direction.png`, 1487×1058 pixels, one desktop concept. User then specified historical laboratory episodes and easy cooperative play, replacing the concept's social-deduction mechanics.
- Desktop implementation: `docs/screenshots/desktop-coop.jpg`, 1280×720 CSS/pixel viewport, 1:1 capture density.
- Narrow implementation: `docs/screenshots/narrow-campus.jpg`, 687×988 CSS/pixel viewport, 1:1 capture density.
- Focused interaction evidence: `calculator-workbench.jpg`, `card-sequence.jpg`, `journal-complete.jpg` in `docs/screenshots/`.
- Offline evidence: `docs/screenshots/offline-resume.jpg`.

The reference and desktop implementation were opened together in one comparison input. Their viewports and game content differ: this is a responsive translation of the selected art direction with the user's subsequent gameplay changes, not a pixel-identical clone. No density scaling or destructive screenshot normalization was applied. The source map is 3:2; the implementation preserves that ratio and letterboxes it on shorter desktop viewports to keep controls visible.

## Comparison history

### Pass 1 — blocked

- P2: map and persistent interaction controls extended below the 1280×720 viewport.
- P2: narrow layout stretched the illustrated map to 1.25 instead of its native 1.5 ratio.
- P2: the initial tall scientist illustration lost legibility at avatar scale.
- P2: closing and immediately reopening the episode dialog with reduced motion could clear the active episode.

### Pass 2 — passed

- Map constrained to available viewport height at desktop; preserved 3:2 ratio on both layouts. Browser measurements: map723×482, interaction control bottom611px, page scroll height720px in a720px viewport. Narrow layout: scrollWidth687px equals viewport687px; interaction control bottom569.5px in988px viewport.
- Replaced the tall sprite with original chibi artwork. Two fictional researcher sprites, player labels and color accents identify the team.
- Guarded delayed dialog close events when the dialog has already reopened. Browser verified immediate episode-to-episode transitions and continued answers with reduced motion enabled.
- Readable visual hierarchy, original night campus illustration, amber actions, mint supporting states and navy surfaces remain grounded in the selected direction.

## Required fidelity surfaces

- Typography: system Trebuchet/sans fallback, bold display/section hierarchy and compact supporting copy; readable at the tested viewports, no cropped title or button copy. Font family differs from the illustrated mock's inferred condensed display face; accepted system-font adaptation with offline support.
- Spacing/layout: fixed dossier beside the map on desktop; chapter/episode strip below the map on narrow screens. Native dialogs retain internal scrolling and visible close controls. Dossier is intentionally outside the map to prevent occluding illustrated locations. The desktop map is letterboxed instead of stretched.
- Colors/tokens: navy backgrounds, warm gold primary actions, mint completion/support labels and light text. Focus outlines visible. Palette is consistent with the nighttime reference.
- Images: original generated campus and chibi characters, native raster assets rather than substitute CSS drawings. Transparent character backgrounds, sharp edges and preserved map ratio. Source art's night lighting, laboratories and desert pathways retained. The map is explicitly identified as artistic, not authentic geography.
- Copy/content: Italian throughout the player flow; exact dates only where supported; fictional sample data labeled; historical facts and adaptations distinguished. The red voting/emergency control is intentionally replaced by cooperative group recall, per the user's refinement. Eight sourced historical episodes replace the concept's12 generic missions.

## Functional browser checks

- Solo start, incorrect answer -> hint/no penalty, correct answer -> next stage, episode completion -> historical note and working source link.
- Reload -> saved diary available; restore4/8 completed episodes and an unfinished step.
- Real browser co-op tabs: room creation, code/link entry, host start, visible players, one client completes step1 and another resumes step2, completion received by both.
- Full8-episode co-op walkthrough, chapter unlocks and final journal.
- Late rejoin retains room progress while another participant remains.
- Reduced-motion setting, immediate transitions, sound toggle and volume controls.
- Calculator comparison: differing result identified; card activity: wrong order -> hint, reset -> correct order -> next stage.
- Server stopped, page reloaded from service-worker cache, solo save restored. Map and avatar images confirmed complete with nonzero natural dimensions while server was offline.
- Connected browser flow console warnings/errors: none observed. Network failures during the deliberate offline test are expected.

## Residual limits / P3

- Tested desktop1280×720 and narrow687×988; an actual390px phone and physical multi-device LAN session were not available in this pass. Socket tests exercise multiple independent clients over loopback.
- Cache migration from the previous released installation and all connection-cancellation timings are not exhaustively browser-tested.
- Visual map is not a collision-accurate reconstruction of the historical campus. It is a simplified traversal surface for narrative episodes.
- Only two avatar illustrations are supplied, distinguished further by names and color markers.

No actionable P0/P1/P2 findings remain in the tested scope. GitHub CI execution is tracked separately from visual QA.

## 26 ottobre 2026 — Scena animata e browser host

Mantenuta la direzione cartoon notturna. Aggiunte comparse animate, respiro/camminata, particelle e movimento libero con un tocco, rispettando movimento ridotto. Nella precedente anteprima era attiva la preferenza di animazioni ridotte: disattivata durante la prova esplicita del movimento.

La cooperativa pubblica è ora WebRTC LAN senza server di gioco: invito univoco → risposta del collega → conferma host. Il flusso espone il requisito di tenere aperto l’host e il limite delle reti isolate. Inviti pendenti annullabili, testo copiabile e azioni asincrone protette da doppi clic.

Verifiche: due schede reali locali con progressi e movimento condivisi; due schede dalla versione GitHub Pages collegate e avviate; immagini tutte caricate e nessun errore console. Layout pubblico a 562×988 verificato. Nessuna prova su dispositivi fisici distinti o su tutte le configurazioni LAN. Contenuti storici invariati.

## 26 ottobre 2026 · Gara Personale / Spie

- Source visual truth: `docs/screenshots/selected-direction.png` (1487×1058, direction board) and `docs/screenshots/browser-host-animated.jpg` (1280×720, previous implemented campus). Both opened, then prior/current desktop captures and final victory screenshots inspected together in one comparison input. No claim of pixel-identical board fidelity: mission text, team score and new victory state are intentional additions; the board contains no victory/activity design.
- Implementation: `docs/screenshots/team-race-desktop.jpg` and `spies-victory.jpg` at 1280×720 CSS and image pixels, density 1; `team-victory-mobile.jpg` and `team-route-mobile.jpg` at 390×844 CSS and image pixels, density 1. No density scaling required for prior/current desktop. Board comparison is art direction only.
- State: connected 2-client race, one completed spy mission; completed spy victory on both host and losing guest; active mobile route. Dossier is scrolled after selecting a mission; upper content remains reachable in its independent scroll region. Map, header and controls retain the previous proportions.
- Full-view comparison: same campus asset, crisp transparent characters, navy background, mint/gold controls, responsive split between dossier and world. No replacement of source illustrations by generated CSS shapes. Victory reuses actual character assets and adds a readable outcome, counts, elapsed time and host action.
- Focused comparison: victory and route screenshots provide readable close views of headings, grid cells, labels and controls; no further crop required. Grid tap targets remain at least 44px at the tested mobile width. Long modals scroll internally.
- Typography: existing Trebuchet/system hierarchy and line heights retained; counters no longer split the numeric fraction; victory title fits desktop and mobile.
- Spacing/layout: existing map proportions retained; two score cards intentionally add dossier height. Victory actions fit the tested viewport; activity controls remain reachable through modal scrolling.
- Colors/tokens: existing navy, gold and mint retained; lavender identifies Spies; team text and counts supplement color. Outcome is readable for both winning and losing clients.
- Image quality: campus and two transparent chibi assets unchanged; no visible stretching or transparency halo in the screenshots.
- Copy/content: Personale 4 and Spie 3 missions; all required to win. Factual notes distinct from fictional puzzles. Fixed awkward plural victory copy. No competing win rule.
- Iteration 1: [P2] fraction wrapping in the narrow team card and grammatically inconsistent Spies outcome. Kept blocked; enabled heading wrapping with unbroken fraction and rewrote victory sentence.
- Iteration 2: recaptured desktop team score and desktop/mobile Spies victory above; comparison confirms readable fractions and “Hanno vinto le Spie” / “La squadra Spie…” text. No actionable P0/P1/P2 visual differences remain.
- Interaction proof: UI-only WebRTC wins for both teams; host rematch resets; wrong pass, blocked route and exposure retry; timed copy with interruption; losing client’s open activity closes at winner. Roster change updates rematch eligibility. Solo catalog and journal restored after exit, reduced-motion switch applies `reduce-motion`. No console errors/warnings on the checked tabs.
- Checklist complete: source comparison, desktop/mobile, primary actions, error/retry, shared victory, reduced motion, console review. No deferred visual findings.
- Test gaps: real separate LAN hardware, every browser/router and full assistive-technology testing remain unverified.

final result: passed

## 2026-10-27 — Motion, dossier and automatic room links

Target retained: `docs/screenshots/selected-direction.png`, existing night campus and chibi assets. The dossier now distinguishes selected/completed missions, reduces redundant headings and exposes per-step progress. Arrival, success and retry cues run on events, preserve focus, and honor both reduced-motion settings. Mobile header progress no longer wraps its counter.

Manual invite/answer UI replaced by a reusable room link and locally generated QR. Same Wi-Fi/hotspot advice plus Internet requirement are visible above entry controls. Host opens only after broker readiness; busy/cancel/error states are explicit. Names stay in the application data-channel handshake.

Evidence: `docs/screenshots/peerjs-lobby-390.jpg`, `peerjs-game-desktop.jpg`; earlier UI baseline `lobby-before-390.jpg`. Real Cloud validation on three local browser tabs: same URL admitted two guests, team selection/start synchronized, Rosenberg activity completed through all three interactions; Spies partner saw completed card and 1/3, opposing host saw only 1/3 score. Late rejoin retained room scores. Host exit returned latest guest UI to the main menu with explanation. 390px lobby/QR and game header inspected; no console errors in final local host.

Fresh review led to regression tests and fixes for solo journal preservation after host loss and late incoming channels after closure. Separate multiplayer review identified unopened PeerJS channels leaking technical slots; cleanup is now explicit/idempotent and tested against close semantics of the pinned library. Broker reconnection attempt and guest status restoration tested. Full suite: 41/41; syntax/build pass.

Limits: multi-tab validation on one computer, not physical phones or separate networks. No TURN, no guarantee for restrictive NAT/firewall/isolated Wi-Fi. PeerJS Cloud and Internet required for new room entry. Browser host must stay open; no host migration. A subsequent authorized quality batch covers additional visual and activity UX findings; this release preserves mission rules and historical content.

Public acceptance: code `9e4d52a` deployed successfully with both verification runs passing. Public HTML, game JS, session JS, CSS and both vendor bundles matched local dist byte-for-byte. Three public tabs joined the identical link, saw 3/8, started together and received the host's gather event. No warnings/errors in any of these three console logs. Local screenshot QR decoded to the same displayed room URL. Evidence: `docs/screenshots/peerjs-public-lobby.jpg`, `peerjs-public-game.jpg`, `peerjs-qr-390.jpg`. Current automated count: 41/41.

## 2026-10-27 — Quality batch2, activities and readable controls

Same visual target retained. Context disclosure removes repeated introductory text from small-screen workbenches without removing it. Route grid retains44px controls; complete action rows are visible in390x844 and360x740 initial/ready states. Error/restart checked at390. Screenshots: `feel-route-390.jpg`, `feel-route-error-390.jpg`, `feel-route-360.jpg`, `feel-route-ready-360.jpg`.

Notification now occupies its own row above the map. Evidence at1280x720,1024x768,390x844: `feel-notice-1280.jpg`, `feel-notice-1024.jpg`, `feel-notice-390.jpg`. It does not overlap movement instructions, gather or central mission controls. Central labels identify next/current team mission, immediate arrival action and campaign episode context.

Real connected browser checks: erroneous recipient preserved through rejection and unrelated roster/progress updates; corrected recipient advances. Wrong card sequence retains selections/focus, reset/correct sequence completes and synchronizes. Copy manually paused/resumed, reached100% and withdrew into next step. Focus on the new step verified. Automated regressions exercise100% retry, actual timeout callback, hidden-page intervals, duplicate gating and single sound ownership.52 tests pass, syntax/build pass. Physical audio output, VoiceOver and text zoom remain unverified; no claims of universal accessibility compliance.

- Ricontrollo indipendente: trovato e corretto il deposito raccolta inerte dopo timeout/rifiuto. Uno stato distinto conserva un deposito valido e consente il reinvio degli stessi sei contrassegni senza riavviare il timer; pending blocca duplicati e una raccolta scaduta prima del primo deposito resta non consegnabile. Riproduzione RED→GREEN; suite finale 54/54, check/build riusciti.

- Pubblicazione del lotto verificata su `63336cb`: CI e Pages riusciti; cinque asset pubblici identici byte per byte a dist. Due schede HTTPS entrate dallo stesso link, gara avviata; destinatario errato preservato dopo rifiuto e correzione avanzata al timbro. Console guest senza avvisi/errori. Prova `docs/screenshots/feel-public-retry.jpg`.

### 27 ottobre — lotto qualità3: avvio dalla cache e distribuzione
- Baseline `f36fa7b`: pacchetto5.635.110byte; nuovo pacchetto2.212.889byte (−60,73%). Immagini5.333.788→1.907.224byte (−64,24%): campus3.517.322→831.458, scientist905.828→539.316, researcher910.638→536.450. Conteggi del pacchetto statico non compresso, non misure di velocità su rete fisica.
- PNG sorgenti conservati; distribuzione solo WebP usati. Campus a1536×1024, qualità95, sharp-YUV; personaggi1254×1254 lossless/exact. ImageMagick confronto AE: zero pixel diversi per entrambi i personaggi, alpha compreso. Tutto lossless avrebbe ridotto solo del32,5%: scelta conversione campus ad alta qualità per raggiungere l’obiettivo senza ridimensionare gli artwork.
- Confronto affiancato screenshot originali/ottimizzati a1280×720 e390×844: campus, luci, contorni e trasparenze coerenti; differenze di posizione NPC/focus dovute al momento della cattura. Browser conferma risorse WebP caricate alle dimensioni native; nessun avviso/errore console. Screenshot `performance-before-campus-*` e `performance-after-campus-*`.
- Worker generato dalla build, manifest e identità derivati dai contenuti, verifica SHA-256 di ogni asset prima dell’installazione. Cache-first della sola release corrente; cache completa non aspetta mai fetch. Recupero di singoli file mancanti entro3s solo con hash corrispondente. Download in background per installazione entro60s per risorsa, separato dall’apertura cached.
- Nessun skipWaiting, claim o reload automatico. Nuova release in attesa finché tutte le schede della precedente sono chiuse; pulizia cache vecchie soltanto all’attivazione. Installazione errata/timeout/quota non elimina quella attiva. Query di navigazione normalizzate; cache di altri scope preservate.
- Riproduzione RED del network-first sospeso (nessuna risposta cache entro100ms); GREEN con cache completa e zero richieste rete. Dieci prove worker su API controllate: offline, transizione A→B e cachev6, installazione mista, timeout/abort, quota, recupero coerente e isolamento. Test distribuzione verifica tutti gli hash/riferimenti e build riproducibile. Suite65/65, sintassi/build riusciti.
- Limiti: ciclo browser e guasti rete/cache simulati nel test del vero worker; nessuna prova di router fisico o storage eviction reale. La vecchia v6 conserva il vecchio comportamento fino all’attivazione del nuovo worker. Non si garantisce apertura offline al primo accesso o dopo rimozione della cache. Nessuna modifica gameplay, nuova dipendenza runtime o servizio.

- Rilascio `6086eea` riuscito: CI e Pages verdi; tutti i22file pubblici (worker generato incluso) identici byte per byte a dist; trePNG sorgenti rispondono404 su Pages. Scheda pubblica precedente rimasta nella sua scena PNG attraverso il deploy; dopo riapertura volontaria immaginiWebP complete e console pulita. Screenshot `performance-public-desktop.jpg`. Identità del pacchetto `d0454b9b6785` (prefissoSHA-256).
