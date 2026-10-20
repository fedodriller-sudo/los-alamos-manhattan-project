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
