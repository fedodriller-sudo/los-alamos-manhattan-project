import { EVENTS } from "./history-data.js";
export function freshProgress() {
  return { version: 1, steps: {} };
}
export function completedCount(p) {
  return EVENTS.filter((e) => (p.steps[e.id] || 0) === e.steps.length).length;
}
export function chapterUnlocked(p, chapter) {
  return EVENTS.filter((e) => e.chapter < chapter).every(
    (e) => (p.steps[e.id] || 0) === e.steps.length,
  );
}
export function attempt(p, id, choice) {
  const e = EVENTS.find((e) => e.id === id);
  if (!e || !chapterUnlocked(p, e.chapter))
    return { ok: false, reason: "locked" };
  const n = p.steps[id] || 0;
  if (n >= e.steps.length) return { ok: false, reason: "completed" };
  const expected = e.steps[n].answer;
  const correct = Array.isArray(expected)
    ? Array.isArray(choice) &&
      choice.length === expected.length &&
      choice.every((v, i) => Number.isInteger(v) && v === expected[i])
    : Number.isInteger(choice) && choice === expected;
  if (!correct) return { ok: false, reason: "answer", hint: e.steps[n].hint };
  p.steps[id] = n + 1;
  return {
    ok: true,
    complete: n + 1 === e.steps.length,
    feedback: e.steps[n].feedback,
  };
}
export function restoreProgress(raw) {
  const p = freshProgress();
  if (raw?.version !== 1 || !raw.steps || typeof raw.steps !== "object")
    return p;
  for (const e of EVENTS) {
    const n = raw.steps[e.id];
    if (
      Number.isInteger(n) &&
      n > 0 &&
      n <= e.steps.length &&
      chapterUnlocked(p, e.chapter)
    )
      p.steps[e.id] = n;
  }
  return p;
}
