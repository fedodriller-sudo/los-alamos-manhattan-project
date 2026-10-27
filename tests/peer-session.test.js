import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PeerSession } from "../js/peer-session.js";
import { roomIdFrom, roomLink } from "../js/peer-config.js";
class Channel extends EventEmitter {
  constructor(peer) {
    super();
    this.peer = peer;
    this.open = true;
    this.sent = [];
  }
  send(m) {
    this.sent.push(JSON.parse(m));
  }
  close() {
    const wasOpen = this.open;
    this.open = false;
    if (wasOpen) this.emit("close");
  }
}
class Broker extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.destroyed = false;
    this.disconnected = false;
  }
  connect(id, options) {
    this.options = options;
    return (this.channel = new Channel(id));
  }
  destroy() {
    this.destroyed = true;
    this.emit("close");
  }
  reconnect() {
    this.reconnections = (this.reconnections || 0) + 1;
  }
}
const tick = () => new Promise((r) => setImmediate(r));
function fixture(timeoutMs = 1000) {
  let peer;
  const messages = [],
    status = [];
  const session = new PeerSession(
    "Ada",
    (m) => messages.push(m),
    (m) => status.push(m),
    { timeoutMs, peerFactory: (id) => (peer = new Broker(id)) },
  );
  return {
    session,
    messages,
    status,
    get peer() {
      return peer;
    },
  };
}
test("room URL validates random identifier and preserves Pages subpath", () => {
  const id = "la-" + crypto.randomUUID();
  const link = roomLink("https://example.org/game/?old=1#old", id);
  assert.equal(link, `https://example.org/game/#room=${id}`);
  assert.equal(roomIdFrom(link), id);
  assert.equal(roomIdFrom(id), id);
  for (const value of [
    "",
    "https://evil.test/#join=foo",
    "la-123",
    "javascript:alert(1)",
  ])
    assert.throws(() => roomIdFrom(value));
});
test("host is not ready before broker opens, same ID serves multiple guests; names only in channel", async () => {
  const f = fixture();
  const waiting = f.session.host();
  await tick();
  assert.equal(f.session.readyState, 0);
  assert.equal(f.session.room, undefined);
  f.peer.emit("open", f.peer.id);
  await waiting;
  await tick();
  assert.equal(f.session.readyState, 1);
  for (const id of ["guest-1", "guest-2"]) {
    const c = new Channel(id);
    f.peer.emit("connection", c);
    c.emit("data", JSON.stringify({ type: "hello", name: id }));
  }
  assert.equal(f.session.room.players.size, 3);
  f.session.close();
});
test("cancel before broker open rejects and never creates a room", async () => {
  const f = fixture();
  const waiting = f.session.host();
  await tick();
  const rejected = assert.rejects(waiting, /annullato/);
  f.session.close();
  await rejected;
  f.peer.emit("open", f.peer.id);
  await tick();
  assert.equal(f.session.room, undefined);
  assert.ok(f.peer.destroyed);
});
test("broker disconnect keeps live game and tries reconnect", async () => {
  const f = fixture();
  const w = f.session.host();
  await tick();
  f.peer.emit("open", f.peer.id);
  await w;
  f.peer.disconnected = true;
  f.peer.emit("disconnected");
  assert.equal(f.session.readyState, 1);
  assert.equal(f.peer.destroyed, false);
  assert.equal(f.status.length, 0);
  await new Promise((resolve) => setTimeout(resolve, 3050));
  assert.equal(f.peer.reconnections, 1);
  f.session.close();
});
test("timeout and absent host fail cleanly", async () => {
  const f = fixture(15);
  await assert.rejects(f.session.host(), /Tempo/);
  assert.ok(f.peer.destroyed);
  const g = fixture();
  const w = g.session.join("la-" + crypto.randomUUID());
  await tick();
  g.peer.emit("open", g.peer.id);
  await tick();
  g.peer.emit(
    "error",
    Object.assign(new Error(), { type: "peer-unavailable" }),
  );
  await assert.rejects(w, /host/);
  assert.ok(g.peer.destroyed);
});
test("guest waits for room admission and does not put name in broker metadata", async () => {
  const f = fixture();
  const w = f.session.join("la-" + crypto.randomUUID());
  await tick();
  f.peer.emit("open", f.peer.id);
  await tick();
  assert.equal(f.peer.options.metadata, undefined);
  f.peer.channel.emit("open");
  assert.deepEqual(f.peer.channel.sent, [{ type: "hello", name: "Ada" }]);
  assert.equal(f.session.readyState, 0);
  f.peer.channel.emit(
    "data",
    JSON.stringify({ type: "room_joined", room: {}, yourId: f.peer.id }),
  );
  await w;
  assert.equal(f.session.readyState, 1);
  f.session.close();
});
test("full room denies ninth peer with useful message; duplicate cannot evict participant", async () => {
  const f = fixture();
  const w = f.session.host();
  await tick();
  f.peer.emit("open", f.peer.id);
  await w;
  for (let i = 0; i < 7; i++) {
    const c = new Channel("g" + i);
    f.peer.emit("connection", c);
    c.emit("data", JSON.stringify({ type: "hello", name: "G" }));
  }
  const extra = new Channel("extra");
  f.peer.emit("connection", extra);
  extra.emit("data", JSON.stringify({ type: "hello", name: "G" }));
  assert.match(extra.sent[0].message, /piena/);
  assert.equal(f.session.room.players.size, 8);
  const duplicate = new Channel("g0");
  f.peer.emit("connection", duplicate);
  duplicate.close();
  assert.equal(f.session.room.players.size, 8);
  f.session.close();
});

test("late incoming channel after host closes is immediately closed", async () => {
  const f = fixture();
  const w = f.session.host();
  await tick();
  f.peer.emit("open", f.peer.id);
  await w;
  f.session.close();
  const late = new Channel("late");
  f.peer.emit("connection", late);
  assert.equal(late.open, false);
  assert.equal(f.session.peers.size, 0);
  assert.equal(f.session.timers.size, 0);
});

test("guest clears outage status when broker returns while game stays connected", async () => {
  const f = fixture();
  const statuses = [];
  f.session.onstatus = (m) => statuses.push(m);
  const w = f.session.join("la-" + crypto.randomUUID());
  await tick();
  f.peer.emit("open", f.peer.id);
  await tick();
  f.peer.channel.emit("open");
  f.peer.channel.emit(
    "data",
    JSON.stringify({ type: "room_joined", room: {}, yourId: f.peer.id }),
  );
  await w;
  f.peer.emit("disconnected");
  f.peer.emit("open", f.peer.id);
  assert.match(statuses.at(-1), /ripristinato/);
  assert.equal(f.session.readyState, 1);
  f.session.close();
});

test("unopened PeerJS channels release all technical slots on timeout", async (t) => {
  const f = fixture();
  const w = f.session.host();
  await tick();
  f.peer.emit("open", f.peer.id);
  await w;
  t.mock.timers.enable({ apis: ["setTimeout"] });
  try {
    for (let i = 0; i < 15; i++) {
      const ch = new Channel("pending" + i);
      ch.open = false;
      f.peer.emit("connection", ch);
    }
    assert.equal(f.session.peers.size, 15);
    t.mock.timers.tick(10000);
    assert.equal(f.session.peers.size, 0);
    const good = new Channel("good");
    f.peer.emit("connection", good);
    good.emit("data", JSON.stringify({ type: "hello", name: "Good" }));
    assert.equal(f.session.room.players.size, 2);
  } finally {
    f.session.close();
    t.mock.timers.reset();
  }
});
