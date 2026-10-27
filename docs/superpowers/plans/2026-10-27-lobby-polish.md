# Lobby, motion and automatic room links

Authorized continuation: retain selected cartoon night visual target and Personnel/Spies rules; polish dossier, activities, lobby and meaningful animations. User then explicitly authorized PeerJS Cloud signaling and asked for one reusable room link/QR, with shared Wi-Fi/hotspot guidance.

## Implementation and validation
1. Polish existing surfaces and event-triggered motion, honoring system and user reduced motion. Compare desktop/mobile screenshots to selected direction and earlier UI.
2. Replace manual SDP exchange with pinned locally bundled PeerJS 1.5.5, QRCode 1.5.4. Random room UUID; host browser owns BrowserRoom, guests use one link. Name only in data-channel hello. Broker config isolated. No TURN or game server deployment.
3. Test host readiness, multiple participants, cancellation, timeout, unavailable host, full room, duplicate connection and broker interruption. Preserve all 29 prior game tests.
4. Verify real Cloud connection with host + two guests sharing the same link, team selection/start/progress; inspect 390px and desktop. Review source, publish existing branch/PR without merge, verify public deployment.

## Review focus
Late asynchronous callbacks after cancellation/close or another attempt; host broker disconnect versus game disconnect; room admission and ninth participant; malformed messages; duplicate IDs; guest retry after errors; no personal names in broker metadata; correct Pages subpath links; stale manual UI or documentation; reduced motion and focus behavior. Do not change mission rules or historical facts.

## Evidence ledger
- Existing UI review found stale manual invite fields on closing/reopening lobby. Automatic transport replacement now clears shared output/QR and invalidates pending UI work in disconnect().
- Transport tests RED: missing peer-config module before implementation. GREEN: 7 transport tests; full suite 36/36.
- Real Cloud initial validation: host + two guests connected via identical URL, roster 3/8 and separate teams. Further activity/public checks pending.
- Final review: independent Astra; two Important findings fixed with RED→GREEN tests (host-loss diary isolation; late channel after cancellation).
- Separate authorized multiplayer review: unopened channel timeout leaked technical slots under real PeerJS close semantics. Regression reproduced 15 retained slots; cleanup fixed, test GREEN.
- Guest stale outage message treated as incorrect connection state, fixed with RED→GREEN status test. Reconnect test now waits and asserts actual attempt. No deferred findings in current transport scope.
- Final suite 41/41; real host + two guests, shared link, team choice/start, three-step Rosenberg completion mirrored to teammate/opponent. Latest guest returned to menu after host exit. Mobile390 and desktop inspected. Public deployment validation follows.
- Release code 9e4d52a: CI and Pages successful; six public assets match dist byte-for-byte. Host + two real public tabs joined same link and started; gather synchronized, all consoles clear. Mobile screenshot QR independently decoded to same URL. Closed-lobby ready message regression added; final suite 41/41.
- Current release complete. Additional authorized five-hour quality-session reports are queued for next batch: visual-review.md and game-feel-review.md under the coordinator's quality-session directory. No expansion included in this release.
