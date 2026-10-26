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
