import test from "node:test";
import assert from "node:assert/strict";
import { TEAM_MISSIONS } from "../js/team-missions.js";
import { validChoice } from "../js/progress.js";
import { BrowserRoom } from "../js/peer-room.js";
test("all seven missions have a valid canonical solution and a historical source", () => {
  assert.equal(TEAM_MISSIONS.length, 7);
  for (const e of TEAM_MISSIONS) {
    assert.match(e.source.url, /^https:\/\//);
    for (const s of e.steps) assert.equal(validChoice(s, s.answer), true, e.id);
  }
});
test("route rejects jumps, walls, wrapping rows and incomplete deliveries", () => {
  const s = TEAM_MISSIONS[1].steps[0];
  for (const p of [
    [0, 15],
    [0, 1, 2, 3, 7, 11, 15],
    [0, 4, 8],
    [0, 1, 4, 8, 9, 10, 11, 15],
    null,
  ])
    assert.equal(validChoice(s, p), false);
});
test("collection requires each target once; stamp and calibration reject invalid coordinates", () => {
  const s = TEAM_MISSIONS[2].steps[0];
  assert.equal(validChoice(s, [1, 1, 3, 6, 8, 10]), false);
  assert.equal(validChoice(s, [1, 3, 6, 8, 10, 15]), false);
  assert.equal(validChoice(TEAM_MISSIONS[0].steps[0], Infinity), false);
  assert.equal(validChoice(TEAM_MISSIONS[5].steps[1], [50, 100]), false);
});
test("host enforces copy duration and rejects stale answers from a previous round", () => {
  let now = 0;
  const room = new BrowserRoom("h", "Host", () => {}, {
    mode: "race",
    clock: () => now,
  });
  room.add("g", "Guest");
  room.handle("h", { type: "start_game" });
  const e = TEAM_MISSIONS.find((e) => e.id === "spy-fuchs-fatman");
  const answer = {
    type: "answer",
    eventId: e.id,
    step: 0,
    choice: 0,
    round: room.round,
  };
  room.handle("g", answer);
  assert.equal(room.teamProgress.spies.steps[e.id], undefined);
  room.handle("g", {
    type: "activity_begin",
    eventId: e.id,
    step: 0,
    round: room.round,
  });
  now = 7999;
  room.handle("g", answer);
  assert.equal(room.teamProgress.spies.steps[e.id], undefined);
  now = 8000;
  room.handle("g", answer);
  assert.equal(room.teamProgress.spies.steps[e.id], 1);
  const personnel = TEAM_MISSIONS[0];
  room.handle("h", {
    type: "answer",
    eventId: personnel.id,
    step: 0,
    choice: personnel.steps[0].answer,
    round: room.round - 1,
  });
  assert.equal(room.teamProgress.personnel.steps[personnel.id], undefined);
});
