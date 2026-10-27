import test from "node:test";
import assert from "node:assert/strict";
import { BrowserRoom } from "../js/peer-room.js";
import { TEAM_MISSIONS } from "../js/team-missions.js";
const setup = () => {
  const messages = [];
  let now = 0;
  const room = new BrowserRoom(
    "h",
    "Ada",
    (id, m) => messages.push({ recipient: id, ...m }),
    { mode: "race", clock: () => now },
  );
  room.tick = () => (now += 10000);
  room.add("g", "Bruno");
  return { room, messages };
};
function finish(room, id, team) {
  for (const e of TEAM_MISSIONS.filter((e) => e.team === team))
    for (let n = 0; n < e.steps.length; n++) {
      room.handle(id, {
        type: "activity_begin",
        round: room.round,
        eventId: e.id,
        step: n,
      });
      room.tick();
      room.handle(id, {
        type: "answer",
        round: room.round,
        eventId: e.id,
        step: n,
        choice: e.steps[n].answer,
      });
    }
}
test("race needs both teams and locks team choices after start", () => {
  const { room } = setup();
  room.handle("g", { type: "choose_team", team: "personnel" });
  room.handle("h", { type: "start_game" });
  assert.equal(room.started, false);
  room.handle("g", { type: "choose_team", team: "spies" });
  room.handle("h", { type: "start_game" });
  assert.equal(room.started, true);
  room.handle("g", { type: "choose_team", team: "personnel" });
  assert.equal(room.players.get("g").team, "spies");
});
for (const team of ["personnel", "spies"])
  test(team + " wins once and every peer sees identical result", () => {
    const { room, messages } = setup();
    room.handle("h", { type: "start_game" });
    finish(room, team === "personnel" ? "h" : "g", team);
    assert.equal(room.winner.team, team);
    const result = messages.filter((m) => m.type === "game_over");
    assert.equal(result.length, 2);
    assert.deepEqual(result[0].winner, result[1].winner);
    const before = structuredClone(room.teamProgress);
    finish(
      room,
      team === "personnel" ? "g" : "h",
      team === "personnel" ? "spies" : "personnel",
    );
    assert.deepEqual(room.teamProgress, before);
    assert.equal(messages.filter((m) => m.type === "game_over").length, 2);
  });
test("enemy, unknown, wrong and duplicate answers cannot advance unauthorized progress", () => {
  const { room } = setup();
  room.handle("h", { type: "start_game" });
  const e = TEAM_MISSIONS.find((e) => e.team === "personnel");
  for (const [id, choice] of [
    ["g", e.steps[0].answer],
    ["ghost", e.steps[0].answer],
    ["h", null],
  ])
    room.handle(id, {
      type: "answer",
      round: room.round,
      eventId: e.id,
      step: 0,
      choice,
    });
  assert.equal(room.teamProgress.personnel.steps[e.id], undefined);
  room.handle("h", {
    type: "answer",
    round: room.round,
    eventId: e.id,
    step: 0,
    choice: e.steps[0].answer,
  });
  room.handle("h", {
    type: "answer",
    round: room.round,
    eventId: e.id,
    step: 0,
    choice: e.steps[0].answer,
  });
  assert.equal(room.teamProgress.personnel.steps[e.id], 1);
  assert.equal(room.winner, null);
});
test("late joins see winner and only host can reset both ledgers for rematch", () => {
  const { room, messages } = setup();
  room.handle("h", { type: "start_game" });
  finish(room, "g", "spies");
  room.add("late", "Carla");
  assert.equal(
    messages
      .filter((m) => m.recipient === "late" && m.type === "game_start")
      .at(-1).room.winner.team,
    "spies",
  );
  room.handle("g", { type: "rematch" });
  assert.equal(room.winner.team, "spies");
  room.handle("h", { type: "rematch" });
  assert.equal(room.winner, null);
  assert.deepEqual(room.teamProgress.personnel.steps, {});
  assert.deepEqual(room.teamProgress.spies.steps, {});
  assert.equal(room.started, true);
});
test("disconnect never awards victory; invalid team choice cannot corrupt a roster", () => {
  const { room } = setup();
  room.handle("h", { type: "choose_team", team: "__proto__" });
  assert.equal(room.players.get("h").team, "personnel");
  room.handle("h", { type: "start_game" });
  room.remove("g");
  assert.equal(room.winner, null);
});

test("opponent gets public totals without mission ids, steps, mistakes or actor names", () => {
  const { room, messages } = setup();
  room.handle("h", { type: "start_game" });
  messages.length = 0;
  const e = TEAM_MISSIONS.find((e) => e.team === "personnel");
  room.handle("h", {
    type: "answer",
    round: room.round,
    eventId: e.id,
    step: 0,
    choice: e.steps[0].answer,
  });
  room.update();
  for (const m of messages.filter((m) => m.recipient === "g")) {
    assert.equal(m.eventId, undefined);
    assert.equal(m.by, undefined);
    if (m.room) {
      assert.deepEqual(Object.keys(m.room.teamProgress), ["spies"]);
      assert.equal(JSON.stringify(m).includes(e.id), false);
      assert.equal(m.room.scores.personnel.total, 4);
    }
  }
  const own = messages.find(
    (m) => m.recipient === "h" && m.type === "race_progress",
  );
  assert.equal(own.room.teamProgress.personnel.steps[e.id], 1);
});

test("two teammates cannot double-complete a step and a missing opposing team blocks rematch", () => {
  const { room } = setup();
  room.add("ally", "Carla");
  room.handle("h", { type: "start_game" });
  const e = TEAM_MISSIONS.find((e) => e.team === "personnel");
  for (const id of ["h", "ally"])
    room.handle(id, {
      type: "answer",
      round: room.round,
      eventId: e.id,
      step: 0,
      choice: e.steps[0].answer,
    });
  assert.equal(room.teamProgress.personnel.steps[e.id], 1);
  finish(room, "g", "spies");
  room.remove("g");
  const round = room.round;
  room.handle("h", { type: "rematch" });
  assert.equal(room.round, round);
  assert.equal(room.winner.team, "spies");
});
