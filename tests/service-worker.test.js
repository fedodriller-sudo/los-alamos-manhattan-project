import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { createHash, webcrypto } from "node:crypto";
const template = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const base = "https://example.test/game/";
const digest = (body) => createHash("sha256").update(body).digest("hex");
const entries = (version) => [
  { path: "index.html", hash: digest(`HTML ${version}`) },
  { path: "js/app.js", hash: digest(`MODULE ${version}`) },
];
function storage() {
  const stores = new Map();
  return {
    stores,
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const map = stores.get(name);
      const key = (request) =>
        new URL(typeof request === "string" ? request : request.url, base).href;
      return {
        async match(request) {
          return map.get(key(request))?.clone();
        },
        async put(request, response) {
          map.set(key(request), response.clone());
        },
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
    async match(request) {
      for (const name of stores.keys()) {
        const response = await (await this.open(name)).match(request);
        if (response) return response;
      }
    },
  };
}
function worker(version = "A", shared = storage()) {
  const handlers = {},
    timers = new Map(),
    calls = [];
  let timerId = 0,
    skips = 0,
    claims = 0;
  const self = {
    location: new URL(base + "sw.js"),
    registration: { scope: base },
    addEventListener: (name, handler) => {
      handlers[name] = handler;
    },
    skipWaiting: () => {
      skips++;
    },
    clients: {
      claim: () => {
        claims++;
      },
    },
  };
  const state = {
    fetch: async (request) =>
      new Response(
        new URL(request.url || request).pathname.endsWith("index.html")
          ? `HTML ${version}`
          : `MODULE ${version}`,
      ),
  };
  const context = vm.createContext({
    self,
    caches: shared,
    URL,
    Request,
    Response,
    AbortController,
    crypto: webcrypto,
    Uint8Array,
    console,
    setTimeout(fn, delay) {
      const id = ++timerId;
      timers.set(id, { fn, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    fetch: (...args) => {
      calls.push(args);
      return state.fetch(...args);
    },
  });
  const code = template
    .replace('"BUILD_RELEASE"', JSON.stringify(version))
    .replace("/* BUILD_ASSETS */ []", JSON.stringify(entries(version)));
  vm.runInContext(code, context);
  async function lifecycle(name) {
    let promise;
    handlers[name]({
      waitUntil(p) {
        promise = p;
      },
    });
    return promise;
  }
  return {
    storage: shared,
    calls,
    state,
    timers,
    get skips() {
      return skips;
    },
    get claims() {
      return claims;
    },
    install: () => lifecycle("install"),
    activate: () => lifecycle("activate"),
    name: () => vm.runInContext("CACHE_NAME", context),
    request(path = "", { method = "GET", mode = "navigate" } = {}) {
      let answer;
      handlers.fetch({
        request: { url: new URL(path, base).href, method, mode },
        respondWith(p) {
          answer = p;
        },
        waitUntil() {},
      });
      return answer;
    },
    expire() {
      for (const { fn } of [...timers.values()]) fn();
    },
  };
}
const within = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Cached response waited for network")),
        100,
      );
    }),
  ]);
test("complete release serves HTML and module immediately even with suspended network", async () => {
  const w = worker();
  // Seed the real cache so this reproduces the original hanging network-first bug.
  const cache = await w.storage.open(w.name());
  await cache.put(base, new Response("HTML A"));
  await cache.put(base + "index.html", new Response("HTML A"));
  await cache.put(base + "js/app.js", new Response("MODULE A"));
  w.state.fetch = () => new Promise(() => {});
  assert.equal(await (await within(w.request())).text(), "HTML A");
  assert.equal(await (await within(w.request("js/app.js"))).text(), "MODULE A");
  assert.equal(w.calls.length, 0);
});
test("install validates full release, offline query navigation uses canonical index", async () => {
  const w = worker();
  await w.install();
  w.state.fetch = async () => {
    throw new Error("offline");
  };
  assert.equal(await (await w.request("?invite=abc")).text(), "HTML A");
  assert.equal(await (await w.request("index.html?launch=1")).text(), "HTML A");
  assert.equal(await (await w.request("js/app.js?x=1")).text(), "MODULE A");
});
test("new release waits without claiming games; old cache survives install and is removed only at activation", async () => {
  const a = worker();
  await a.install();
  await a.storage.open("los-alamos-nightshift-v6");
  await a.storage.open("unrelated-site");
  const b = worker("B", a.storage);
  await b.install();
  assert.equal(b.skips, 0);
  assert.equal(b.claims, 0);
  assert.equal(await (await a.request()).text(), "HTML A");
  assert.equal(await (await a.request("js/app.js")).text(), "MODULE A");
  assert.ok((await a.storage.keys()).includes(a.name()));
  await b.activate();
  assert.equal(await (await b.request()).text(), "HTML B");
  assert.equal(await (await b.request("js/app.js")).text(), "MODULE B");
  assert.deepEqual(
    (await a.storage.keys()).sort(),
    [b.name(), "unrelated-site"].sort(),
  );
  assert.equal(b.claims, 0);
});
test("mixed or failed release install cannot replace previous usable package", async () => {
  const a = worker();
  await a.install();
  const b = worker("B", a.storage);
  b.state.fetch = async () => new Response("HTML A");
  await assert.rejects(b.install());
  assert.equal((await a.storage.keys()).includes(b.name()), false);
  assert.equal(await (await a.request()).text(), "HTML A");
});
test("missing asset can only be repaired with bytes matching its own release", async () => {
  const w = worker();
  await w.install();
  w.storage.stores.get(w.name()).delete(base + "js/app.js");
  w.state.fetch = async () => new Response("MODULE B");
  assert.equal((await w.request("js/app.js")).status, 503);
  assert.equal(w.storage.stores.get(w.name()).has(base + "js/app.js"), false);
  w.state.fetch = async () => new Response("MODULE A");
  assert.equal(await (await w.request("js/app.js")).text(), "MODULE A");
  assert.equal(w.storage.stores.get(w.name()).has(base + "js/app.js"), true);
});
test("missing asset suspended fetch has bounded timeout and aborts request", async () => {
  const w = worker();
  await w.install();
  w.storage.stores.get(w.name()).delete(base + "js/app.js");
  let signal;
  w.state.fetch = (_request, options) => {
    signal = options.signal;
    return new Promise(() => {});
  };
  const response = w.request("js/app.js");
  await new Promise((resolve) => setImmediate(resolve));
  assert.ok([...w.timers.values()].every(({ delay }) => delay <= 3000));
  assert.equal(w.timers.size, 1);
  w.expire();
  assert.equal((await response).status, 503);
  assert.equal(signal.aborted, true);
});
test("unrelated requests and non-GET requests are not intercepted", () => {
  const w = worker();
  assert.equal(w.request("https://another.test/index.html"), undefined);
  assert.equal(w.request("not-a-game-asset"), undefined);
  assert.equal(w.request("", { method: "POST" }), undefined);
});

test("suspended installation aborts without touching a previous release", async () => {
  const a = worker();
  await a.install();
  const b = worker("B", a.storage),
    signals = [];
  b.state.fetch = (_url, options) => {
    signals.push(options.signal);
    return new Promise(() => {});
  };
  const install = b.install();
  const rejected = assert.rejects(install, /timed out/);
  b.expire();
  await rejected;
  assert.equal(signals.length, 2);
  assert.ok(signals.every((signal) => signal.aborted));
  assert.equal((await a.storage.keys()).includes(b.name()), false);
  assert.equal(await (await a.request()).text(), "HTML A");
});
test("failed cache write discards partial installation and preserves other scopes", async () => {
  const a = worker();
  await a.install();
  const other = "los-alamos-nightshift:https://example.test/other/:C";
  await a.storage.open(other);
  const b = worker("B", a.storage),
    originalOpen = a.storage.open.bind(a.storage);
  a.storage.open = async (name) => {
    const cache = await originalOpen(name);
    if (name === b.name()) {
      const put = cache.put;
      cache.put = async (key, response) => {
        if (key.endsWith("app.js")) throw new Error("quota");
        await put(key, response);
      };
    }
    return cache;
  };
  await assert.rejects(b.install(), /incomplete/);
  assert.equal((await a.storage.keys()).includes(b.name()), false);
  assert.equal(await (await a.request()).text(), "HTML A");
  await a.activate();
  assert.ok((await a.storage.keys()).includes(other));
});
test("a missing cache entry offline returns explicit503 without serving an older release", async () => {
  const a = worker();
  await a.install();
  const b = worker("B", a.storage);
  await b.install();
  b.storage.stores.get(b.name()).delete(base + "index.html");
  b.state.fetch = async () => {
    throw new Error("offline");
  };
  assert.equal((await b.request()).status, 503);
});
