import test from "node:test";
import assert from "node:assert/strict";
import { BrowserRoom } from "../js/peer-room.js";
import { EVENTS } from "../js/history-data.js";
const setup = () => {
  const messages = [];
  const room = new BrowserRoom("host", "Ada", (id, m) =>
    messages.push({ id, ...m }),
  );
  return { room, messages };
};
test("browser host starts only with a colleague and rejects a guest start", () => {
  const { room, messages } = setup();
  room.handle("host", { type: "start_game" });
  assert.equal(room.started, false);
  room.add("guest", "Bruno");
  room.handle("guest", { type: "start_game" });
  assert.equal(room.started, false);
  room.handle("host", { type: "start_game" });
  assert.equal(room.started, true);
  assert.equal(messages.filter((m) => m.type === "game_start").length, 2);
});
test("browser room validates shared answers, duplicate steps and peer identities", () => {
  const { room, messages } = setup();
  room.add("guest", "Bruno");
  room.handle("host", { type: "start_game" });
  const e = EVENTS[0];
  room.handle("ghost", {
    type: "answer",
    eventId: e.id,
    step: 0,
    choice: e.steps[0].answer,
  });
  assert.equal(room.progress.steps[e.id], undefined);
  room.handle("guest", { type: "answer", eventId: e.id, step: 0, choice: 99 });
  assert.equal(room.progress.steps[e.id], undefined);
  room.handle("guest", {
    type: "answer",
    eventId: e.id,
    step: 0,
    choice: e.steps[0].answer,
  });
  assert.equal(room.progress.steps[e.id], 1);
  room.handle("host", {
    type: "answer",
    eventId: e.id,
    step: 0,
    choice: e.steps[0].answer,
  });
  assert.equal(room.progress.steps[e.id], 1);
  assert.equal(messages.at(-1).reason, "stale");
});
test("browser room caps at eight and preserves progress for late guests", () => {
  const { room } = setup();
  for (let i = 1; i < 8; i++) assert.equal(room.add("p" + i, "R" + i), true);
  assert.equal(room.add("extra", "Extra"), false);
  room.handle("host", { type: "start_game" });
  for (const e of EVENTS)
    for (let i = 0; i < e.steps.length; i++)
      room.handle("host", {
        type: "answer",
        eventId: e.id,
        step: i,
        choice: e.steps[i].answer,
      });
  room.remove("p7");
  assert.equal(room.add("late", "Carla"), true);
  assert.equal(Object.keys(room.snapshot().progress.steps).length, 8);
});
test("malformed fields and movement cannot crash or poison browser room state", () => {
  const { room } = setup();
  room.add("guest", { toString: null, valueOf: null });
  room.handle("host", { type: "start_game" });
  for (const m of [
    null,
    [],
    { type: "answer", eventId: {}, step: 0, choice: 0 },
    { type: "move", x: Infinity, y: 0 },
    { type: "answer", eventId: "__proto__", step: 0, choice: 0 },
  ])
    assert.doesNotThrow(() => room.handle("guest", m));
  assert.ok(Number.isFinite(room.snapshot().players[1].x));
});
