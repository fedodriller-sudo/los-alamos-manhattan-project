# Los Alamos — Night Shift

Approved brief: option 3, cartoon night campus. Easy historical laboratory events, not social deduction. Local cooperative multiplayer. Six-hour revision window ends 2026-10-21 03:21 Europe/Rome.

## Implementation plan
- [x] Shared, sourced historical episodes and deterministic answer/progress model; tests for wrong answers, duplicate completion and chapter gating.
- [x] Accessible responsive nighttime UI, illustrated map and scientist sprite, movement and contextual missions, journal, solo save, audio/motion settings.
- [x] Authoritative cooperative server for 2–8 people, room links, synchronized progress, host handoff, safe static serving and validation; integration tests with real sockets.
- [x] Browser desktop/mobile flow verification, error review and visual comparison to selected concept.
- [x] Final source/UX review, README and reviewable contribution branch/PR where authentication permits.

Architecture: retain plain HTML/CSS/JavaScript and Node/ws. New ES module entry point uses shared event data and progression model on client/server. Legacy scripts remain unreferenced for reference. No new framework. Keep map artistic, clearly distinguished from historical geography. Fictional player and dialogue; documented historical framing. No countdown penalties, no elimination.

Review focus: stale room messages, repeat answers from two players, host departure, saved data version mismatch, mobile viewport and keyboard/modal focus.

## Verification ledger
2026-10-20 21:25 Europe/Rome: baseline repository has no automated tests. New isolated clone and contribution branch; no preexisting user changes. Existing multiplayer has spy/vote model; replacement co-op protocol required. Product Design asset agents generating map/sprite. Sources: NPS, LANL, DOE and computing history paper; avoid technical weapon construction detail.

2026-10-20 22:10 Europe/Rome: implementation, source notes, two independent code reviews and browser walkthroughs complete. Nine tests and syntax checks green. Review/CI evidence in docs/QA-ITERATIONS.md and design-qa.md. Contribution being published as a draft PR; periodic 30-minute checks remain active until 03:21.
