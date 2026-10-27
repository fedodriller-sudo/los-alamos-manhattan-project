// Build fills both markers from the exact distribution contents.
const RELEASE = "BUILD_RELEASE";
const ASSETS = /* BUILD_ASSETS */ [];
const CACHE_PREFIX = `los-alamos-nightshift:${self.registration.scope}:`;
const CACHE_NAME = CACHE_PREFIX + RELEASE;
const ROOT = new URL("./", self.location).pathname;
const FILES = new Map(
  ASSETS.map((asset) => [new URL(asset.path, self.location).pathname, asset]),
);

async function verifiedFetch(asset, timeout = 3000) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(new URL(asset.path, self.location).href, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Asset unavailable");
        const digest = await crypto.subtle.digest(
          "SHA-256",
          await response.clone().arrayBuffer(),
        );
        const hash = [...new Uint8Array(digest)]
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        if (hash !== asset.hash) throw new Error("Release integrity mismatch");
        return response;
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("Asset request timed out"));
        }, timeout);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      if (!ASSETS.length)
        throw new Error("Run the static build before serving");
      try {
        // Validate the entire package before publishing any cache entries.
        const responses = await Promise.all(
          ASSETS.map((asset) => verifiedFetch(asset, 60000)),
        );
        const cache = await caches.open(CACHE_NAME);
        const writes = await Promise.allSettled(
          ASSETS.map((asset, i) =>
            cache.put(new URL(asset.path, self.location).href, responses[i]),
          ),
        );
        if (writes.some((result) => result.status === "rejected"))
          throw new Error("Release cache incomplete");
      } catch (error) {
        await caches.delete(CACHE_NAME);
        throw error;
      }
      // Default waiting lifecycle: never replace a worker during an active game.
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key !== CACHE_NAME &&
                (key.startsWith(CACHE_PREFIX) ||
                  /^los-alamos-nightshift-v\d+$/.test(key)),
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  const path = url.pathname === ROOT ? ROOT + "index.html" : url.pathname;
  const asset = FILES.get(path);
  if (!asset) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const key = new URL(asset.path, self.location).href;
      const cached = await cache.match(key);
      if (cached) return cached;
      // Repair an evicted entry only with this release's exact bytes.
      try {
        const response = await verifiedFetch(asset);
        await cache.put(key, response.clone());
        return response;
      } catch {
        return new Response(
          "Gioco non disponibile offline. Riprova con la rete attiva.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          },
        );
      }
    })(),
  );
});
