const CACHE_NAME = "los-alamos-nightshift-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./css/nightshift.css",
  "./js/nightshift.js",
  "./js/history-data.js",
  "./js/progress.js",
  "./js/peer-config.js",
  "./js/vendor/peerjs.js",
  "./js/vendor/qrcode.js",
  "./js/vendor/THIRD-PARTY-LICENSES.txt",
  "./js/vendor/peerjs.LICENSE",
  "./js/vendor/qrcode.LICENSE",
  "./js/team-missions.js",
  "./js/task-activities.js",
  "./js/peer-room.js",
  "./js/peer-session.js",
  "./js/peer-signaling.js",
  "./img/campus-night.png",
  "./img/scientist-chibi.png",
  "./img/researcher-chibi.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
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
              (key) => key.startsWith("los-alamos-") && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (
    !ASSETS.some(
      (asset) => new URL(asset, self.location).pathname === url.pathname,
    )
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copy)),
          );
        }
        return response;
      })
      .catch(
        async () =>
          (await caches.match(event.request)) ||
          (event.request.mode === "navigate"
            ? caches.match("./index.html")
            : new Response("Offline", { status: 503 })),
      ),
  );
});
