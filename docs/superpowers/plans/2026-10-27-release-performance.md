# Quality batch 3 — cached startup and image distribution

Authorized scope: release-readiness-review.md, coordinated quality window ending27October05:33Europe/Rome. Existing branch; sole repository author; independent reviewers coordinated separately. No gameplay changes or runtime dependencies.

## Plan and acceptance
1. Capture current desktop/mobile artwork. Convert existing PNGs to WebP preserving dimensions/alpha and originals. Prefer lossless; measure bytes and inspect equivalent quality if lossy needed. Target≥60% reduction for three distributed images, not a claim of physical-network time saved.
2. Generate one release manifest at build time from the distribution allowlist, with content hashes and an automatic release identity including the worker template. Precache verified complete releases; cache-first immutable resources, so complete cache works with a suspended network within3seconds. Never mix network files into a release without integrity validation.
3. Keep the default worker waiting lifecycle, no skipWaiting/claim/reload; old games finish on their old release. Activate only without old controlled clients, then remove own obsolete caches (including legacyv6). Failed install preserves old cache. Navigation query strings share canonical index. Missing cache entry may repair only from matching bytes, bounded by3seconds.
4. RED→GREEN worker tests: suspended/offline cache, coherent release through upgrade, failed/mixed installation, missing entry, bounded timeout, safe cleanup and query routing. Distribution coverage/hash tests; check/build/full suite once. Updated desktop/mobile browser images, public byte match, CI/Pages/PR, no merge.

## Decisions / limits
- Default browser lifecycle intentionally waits for every old controlled tab to close, including idle tabs. New releases are checked on navigation; there is no forced reload during a game. This follows https://web.dev/articles/service-worker-lifecycle .
- Existing v6 retains its old network-first behavior until the new worker can activate; this release cannot retroactively alter an already active worker.
- Acceptance tests use the real worker in a controlled service-worker API harness for hangs/offline/lifecycle events; physical router timing and browser storage eviction remain distinct limitations.

## Execution ledger
- Preflight: image references, build allowlist and worker manifest share paths and must change together. Worker identity includes all distributed content and template; no manually bumped cache version. Existing revisions stay active until the browser's lifecycle permits activation.

### 27 ottobre — lotto qualità3: avvio dalla cache e distribuzione
- Baseline `f36fa7b`: pacchetto5.635.110byte; nuovo pacchetto2.212.889byte (−60,73%). Immagini5.333.788→1.907.224byte (−64,24%): campus3.517.322→831.458, scientist905.828→539.316, researcher910.638→536.450. Conteggi del pacchetto statico non compresso, non misure di velocità su rete fisica.
- PNG sorgenti conservati; distribuzione solo WebP usati. Campus a1536×1024, qualità95, sharp-YUV; personaggi1254×1254 lossless/exact. ImageMagick confronto AE: zero pixel diversi per entrambi i personaggi, alpha compreso. Tutto lossless avrebbe ridotto solo del32,5%: scelta conversione campus ad alta qualità per raggiungere l’obiettivo senza ridimensionare gli artwork.
- Confronto affiancato screenshot originali/ottimizzati a1280×720 e390×844: campus, luci, contorni e trasparenze coerenti; differenze di posizione NPC/focus dovute al momento della cattura. Browser conferma risorse WebP caricate alle dimensioni native; nessun avviso/errore console. Screenshot `performance-before-campus-*` e `performance-after-campus-*`.
- Worker generato dalla build, manifest e identità derivati dai contenuti, verifica SHA-256 di ogni asset prima dell’installazione. Cache-first della sola release corrente; cache completa non aspetta mai fetch. Recupero di singoli file mancanti entro3s solo con hash corrispondente. Download in background per installazione entro60s per risorsa, separato dall’apertura cached.
- Nessun skipWaiting, claim o reload automatico. Nuova release in attesa finché tutte le schede della precedente sono chiuse; pulizia cache vecchie soltanto all’attivazione. Installazione errata/timeout/quota non elimina quella attiva. Query di navigazione normalizzate; cache di altri scope preservate.
- Riproduzione RED del network-first sospeso (nessuna risposta cache entro100ms); GREEN con cache completa e zero richieste rete. Dieci prove worker su API controllate: offline, transizione A→B e cachev6, installazione mista, timeout/abort, quota, recupero coerente e isolamento. Test distribuzione verifica tutti gli hash/riferimenti e build riproducibile. Suite65/65, sintassi/build riusciti.
- Limiti: ciclo browser e guasti rete/cache simulati nel test del vero worker; nessuna prova di router fisico o storage eviction reale. La vecchia v6 conserva il vecchio comportamento fino all’attivazione del nuovo worker. Non si garantisce apertura offline al primo accesso o dopo rimozione della cache. Nessuna modifica gameplay, nuova dipendenza runtime o servizio.
