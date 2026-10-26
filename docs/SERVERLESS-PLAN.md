# Browser-hosted LAN and animated scene

Request 2026-10-26: make the current experience feel like an animated game and publish a directly playable static website on GitHub Pages. Keep selected night cartoon art and sourced historical episodes.

Architecture: native WebRTC reliable RTCDataChannels, star topology, browser host owns authoritative progress. No signaling/STUN/TURN service: complete ICE offers/answers exchanged manually through copy/paste links. New invitation for each guest. Secure Pages origin hosts assets only. Host must stay open; host transfer is not supported by the new star topology. Guests may rejoin using a fresh invitation. Existing solo save schema remains untouched; Node implementation remains for reference/testing and local static preview, but is not shipped or needed by the deployed game.

- [x] Pure shared browser room engine: validation, host-only start, 2–8 players, duplicate/stale answer guards, movement and progress broadcast; unit tests.
- [x] WebRTC transport: bounded/validated signaling envelopes, complete ICE gathering, timeouts/cancellation, data channel lifecycle, peer cleanup; browser connection proof.
- [x] Lobby UX: host, unique invite, guest answer, host confirmation, connection states and honest network/host limitations.
- [x] Game-feel pass: animated scene/NPCs, idle and movement poses, click-to-walk, interaction/success feedback, ambient motion and reduced-motion behavior.
- [x] Static allowlisted build with relative assets, offline-cache version upgrade, GitHub Pages Actions workflow; live verification pending first deployment.
- [x] Regression suite, independent review, updated same PR/docs and deployment evidence. No merge of PR required: deploy directly from authorized feature branch.

Rollback: retained prior commit3a80eb2 and legacy Node server; restore old hosting branch/configuration if an existing deployment is found. No save data deletion. Do not reactivate the expired six-hour automation.
