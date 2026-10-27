const CACHE_NAME = "los-alamos-v2-missioni-storiche";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./css/game.css",
  "./css/minigames.css",
  "./css/spy-rooms.css",
  "./css/mission-lab.css",
  "./css/detailed-missions.css",
  "./css/location-games.css",
  "./css/product-design.css",
  "./js/tasks-data.js",
  "./js/map-road.js",
  "./js/detailed-missions.js",
  "./js/location-games.js",
  "./js/save.js",
  "./js/spy-investigation.js",
  "./js/minigame-scenes.js",
  "./js/mission-ui.js",
  "./js/minigames.js",
  "./js/task-scene-fill.js",
  "./js/net-client.js",
  "./js/player.js",
  "./js/game.js",
  "./img/los-alamos-site.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.includes("/server/")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
