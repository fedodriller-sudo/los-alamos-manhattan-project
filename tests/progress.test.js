import test from "node:test";
import assert from "node:assert/strict";
import { EVENTS, CHAPTERS } from "../js/history-data.js";
import {
  freshProgress,
  attempt,
  chapterUnlocked,
  completedCount,
  restoreProgress,
} from "../js/progress.js";
test("wrong answers never advance, correct steps finish once", () => {
  const p = freshProgress();
  const e = EVENTS[0];
  assert.equal(attempt(p, e.id, 99).ok, false);
  assert.equal(p.steps[e.id], undefined);
  for (const s of e.steps) assert.equal(attempt(p, e.id, s.answer).ok, true);
  assert.equal(completedCount(p), 1);
  assert.equal(attempt(p, e.id, 0).ok, false);
  assert.equal(completedCount(p), 1);
});
test("chapters unlock only after all earlier episodes", () => {
  const p = freshProgress();
  assert.equal(chapterUnlocked(p, 1), false);
  assert.equal(attempt(p, EVENTS.find((e) => e.chapter === 1).id, 0).ok, false);
  for (const e of EVENTS.filter((e) => e.chapter === 0))
    for (const s of e.steps) attempt(p, e.id, s.answer);
  assert.equal(chapterUnlocked(p, 1), true);
  assert.equal(chapterUnlocked(p, 2), false);
});
test("all sourced episodes can be completed without a penalty", () => {
  const p = freshProgress();
  assert.equal(CHAPTERS.length, 3);
  for (const e of EVENTS) {
    assert.ok(e.source.url.startsWith("https://"));
    assert.ok(e.adaptation);
    for (const s of e.steps) assert.equal(attempt(p, e.id, s.answer).ok, true);
  }
  assert.equal(completedCount(p), EVENTS.length);
});
test("saved progress validates counts, ids and chronological chapter gates", () => {
  const p = restoreProgress({
    version: 1,
    steps: { [EVENTS[0].id]: 99, ghost: 2, [EVENTS.at(-1).id]: 2 },
  });
  assert.equal(p.steps[EVENTS[0].id], undefined);
  assert.equal(p.steps.ghost, undefined);
  assert.equal(p.steps[EVENTS.at(-1).id], undefined);
  assert.deepEqual(
    restoreProgress({ version: 999, steps: {} }),
    freshProgress(),
  );
});
test("the card workflow requires a complete correct sequence, not a scalar or duplicate", () => {
  const p = freshProgress();
  for (const e of EVENTS.filter((e) => e.chapter === 0))
    for (const s of e.steps) attempt(p, e.id, s.answer);
  assert.equal(attempt(p, "cards", [1, 0, 2]).ok, false);
  assert.equal(attempt(p, "cards", 0).ok, false);
  assert.equal(attempt(p, "cards", [0, 0, 2]).ok, false);
  assert.equal(attempt(p, "cards", [0, 1, 2]).ok, true);
  assert.equal(p.steps.cards, 1);
});
