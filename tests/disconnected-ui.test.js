import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(
  new URL("../js/nightshift.js", import.meta.url),
  "utf8",
);
// Execute the actual UI teardown and session callback with storage/DOM boundaries stubbed.
const functions =
  source.slice(
    source.indexOf("function exit()"),
    source.indexOf('$("exit-button").onclick'),
  ) +
  "\n" +
  source.slice(
    source.indexOf("function newSession()"),
    source.indexOf("async function signalAction"),
  );
test("unexpected host loss exits race without saving over solo journal", () => {
  let onclose;
  let saves = 0;
  const nodes = new Map();
  const solo = { steps: { fence: 1 } };
  const context = {
    online: true,
    playing: true,
    room: { mode: "race" },
    progress: { steps: { "spy-copy": 2 } },
    ws: null,
    keys: new Set(),
    activeEvent: "spy-copy",
    target: null,
    signalGeneration: 0,
    signalingBusy: false,
    SAVE: "save",
    pending: false,
    $: (id) => {
      if (!nodes.has(id)) nodes.set(id, { value: "Guest", focus() {} });
      return nodes.get(id);
    },
    PeerSession: class {
      constructor(name, receive, close) {
        onclose = close;
      }
    },
    disconnect() {
      context.ws = null;
      context.room = null;
    },
    clearInvite() {},
    persist() {
      saves++;
    },
    useSoloCatalog() {},
    restoreProgress: (p) => p,
    read: () => solo,
    completedCount: () => 0,
    updateResume() {},
    document: { querySelectorAll: () => [] },
    toast() {},
    renderSignaling() {},
    renderEvent() {},
    receive() {},
  };
  vm.runInNewContext(functions + "\nnewSession();", context);
  onclose("Host chiuso");
  assert.equal(context.playing, false);
  assert.equal(saves, 0);
  assert.deepEqual(context.progress, solo);
});

test("closing a room clears the link, QR and stale ready message", () => {
  const nodes = new Map(
    ["signal-output", "connection-status", "room-qr"].map((id) => [
      id,
      {
        value: "old link",
        textContent: "Stanza aperta",
        hidden: false,
        removeAttribute() {},
      },
    ]),
  );
  const context = {
    answerTimer: null,
    clearTimeout,
    pending: true,
    connecting: null,
    ws: { close() {} },
    room: {},
    yourId: "old",
    signalingBusy: true,
    signalGeneration: 0,
    $: (id) => nodes.get(id),
  };
  const disconnect = source.slice(
    source.indexOf("function disconnect()"),
    source.indexOf("function renderLobby()"),
  );
  vm.runInNewContext(disconnect + "\ndisconnect();", context);
  assert.equal(nodes.get("signal-output").value, "");
  assert.equal(nodes.get("connection-status").textContent, "");
  assert.equal(nodes.get("room-qr").hidden, true);
  assert.equal(context.signalingBusy, false);
});
