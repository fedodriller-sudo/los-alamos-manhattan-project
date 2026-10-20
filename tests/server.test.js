import test from "node:test";
import assert from "node:assert/strict";
import { WebSocket } from "../server/node_modules/ws/wrapper.mjs";
import { startServer } from "../server/game-server.js";
import { EVENTS } from "../js/history-data.js";
function client(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const inbox = [];
    const waiting = [];
    ws.on("error", reject);
    ws.on("message", (raw) => {
      const m = JSON.parse(raw);
      const i = waiting.findIndex((w) => w.type === m.type);
      if (i >= 0) {
        const [w] = waiting.splice(i, 1);
        clearTimeout(w.timer);
        w.resolve(m);
      } else inbox.push(m);
    });
    ws.on("open", () =>
      resolve({
        ws,
        send: (type, p = {}) => ws.send(JSON.stringify({ type, ...p })),
        next(type) {
          const i = inbox.findIndex((m) => m.type === type);
          if (i >= 0) return Promise.resolve(inbox.splice(i, 1)[0]);
          return new Promise((resolve, reject) => {
            const w = {
              type,
              resolve,
              timer: setTimeout(
                () => reject(new Error("timeout " + type)),
                2000,
              ),
            };
            waiting.push(w);
          });
        },
      }),
    );
  });
}
test("co-op: two clients, validation, shared steps, duplicate guard, host transfer", async (t) => {
  const server = await startServer({ port: 0, host: "127.0.0.1" });
  t.after(() => server.close());
  const a = await client(server.wsUrl),
    b = await client(server.wsUrl);
  t.after(() => {
    a.ws.terminate();
    b.ws.terminate();
  });
  a.send("create_room", { name: "Ada" });
  const joined = await a.next("room_joined");
  const code = joined.room.code;
  b.send("join_room", { code, name: "Bruno" });
  const bj = await b.next("room_joined");
  await a.next("room_update");
  b.send("start_game");
  assert.match((await b.next("error")).message, /host/i);
  a.send("start_game");
  await a.next("game_start");
  await b.next("game_start");
  const e = EVENTS[0];
  a.send("answer", { eventId: e.id, step: 0, choice: 99 });
  assert.equal((await a.next("answer_result")).ok, false);
  a.send("answer", { eventId: e.id, step: 0, choice: e.steps[0].answer });
  assert.equal((await a.next("answer_result")).ok, true);
  assert.equal((await b.next("progress")).progress.steps[e.id], 1);
  await a.next("progress");
  b.send("answer", { eventId: e.id, step: 0, choice: e.steps[0].answer });
  assert.equal((await b.next("answer_result")).reason, "stale");
  b.send("answer", { eventId: e.id, step: 1, choice: e.steps[1].answer });
  assert.equal((await b.next("answer_result")).ok, true);
  assert.equal((await a.next("progress")).progress.steps[e.id], 2);
  a.ws.close();
  const update = await b.next("room_update");
  assert.equal(update.room.hostId, bj.yourId);
});
test("server serves only public assets and rejects private paths", async (t) => {
  const server = await startServer({ port: 0, host: "127.0.0.1" });
  t.after(() => server.close());
  for (const path of [
    "/server/game-server.js",
    "/.git/config",
    "/docs/REVISION-PLAN.md",
    "/%ZZ",
    "/js/../../server/package.json",
  ]) {
    const r = await fetch(server.httpUrl + path);
    assert.notEqual(r.status, 200, path);
  }
  assert.equal((await fetch(server.httpUrl + "/")).status, 200);
});
test("malformed JSON field types never crash the process or corrupt a room", async (t) => {
  const server = await startServer({ port: 0, host: "127.0.0.1" });
  t.after(() => server.close());
  const a = await client(server.wsUrl);
  t.after(() => a.ws.terminate());
  const poison = { toString: null, valueOf: null };
  a.send("create_room", { name: poison });
  assert.match((await a.next("error")).message, /nome/i);
  a.send("join_room", { code: poison });
  assert.match((await a.next("error")).message, /codice/i);
  a.send("create_room", { name: "Ada" });
  const joined = await a.next("room_joined");
  a.send("join_room", { code: joined.room.code, name: "Ada" });
  assert.equal((await a.next("room_joined")).room.code, joined.room.code);
  const b = await client(server.wsUrl);
  t.after(() => b.ws.terminate());
  b.send("join_room", { code: joined.room.code, name: "Bruno" });
  assert.equal((await b.next("room_joined")).room.players.length, 2);
});
test("a complete shared turn accepts sequence interactions and late joining", async (t) => {
  const server = await startServer({ port: 0, host: "127.0.0.1" });
  t.after(() => server.close());
  const a = await client(server.wsUrl),
    b = await client(server.wsUrl);
  t.after(() => {
    a.ws.terminate();
    b.ws.terminate();
  });
  a.send("create_room", { name: "Ada" });
  const { room } = await a.next("room_joined");
  b.send("join_room", { code: room.code, name: "Bruno" });
  await b.next("room_joined");
  await a.next("room_update");
  a.send("start_game");
  await a.next("game_start");
  await b.next("game_start");
  for (const event of EVENTS) {
    for (let i = 0; i < event.steps.length; i++) {
      a.send("answer", {
        eventId: event.id,
        step: i,
        choice: event.steps[i].answer,
      });
      assert.equal((await a.next("answer_result")).ok, true, event.id);
      await a.next("progress");
      const update = await b.next("progress");
      assert.equal(update.progress.steps[event.id], i + 1);
    }
  }
  const late = await client(server.wsUrl);
  t.after(() => late.ws.terminate());
  late.send("join_room", { code: room.code, name: "Carla" });
  const final = await late.next("game_start");
  assert.equal(Object.keys(final.room.progress.steps).length, EVENTS.length);
  assert.equal(final.room.players.length, 3);
});
