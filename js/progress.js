import { EVENTS } from "./history-data.js";
export function freshProgress() {
  return { version: 1, steps: {} };
}
export function completedCount(p, events = EVENTS) {
  return events.filter((e) => (p.steps[e.id] || 0) === e.steps.length).length;
}
export function chapterUnlocked(p, chapter, events = EVENTS) {
  return events
    .filter((e) => e.chapter < chapter)
    .every((e) => (p.steps[e.id] || 0) === e.steps.length);
}
export function attempt(p, id, choice, events = EVENTS) {
  const e = events.find((e) => e.id === id);
  if (!e || !chapterUnlocked(p, e.chapter, events))
    return { ok: false, reason: "locked" };
  const n = p.steps[id] || 0;
  if (n >= e.steps.length) return { ok: false, reason: "completed" };
  const step = e.steps[n];
  const correct = validChoice(step, choice);
  if (!correct) return { ok: false, reason: "answer", hint: e.steps[n].hint };
  p.steps[id] = n + 1;
  return {
    ok: true,
    complete: n + 1 === e.steps.length,
    feedback: e.steps[n].feedback,
  };
}
export function restoreProgress(raw, events = EVENTS) {
  const p = freshProgress();
  if (raw?.version !== 1 || !raw.steps || typeof raw.steps !== "object")
    return p;
  for (const e of events) {
    const n = raw.steps[e.id];
    if (
      Number.isInteger(n) &&
      n > 0 &&
      n <= e.steps.length &&
      chapterUnlocked(p, e.chapter, events)
    )
      p.steps[e.id] = n;
  }
  return p;
}

export function validChoice(step, choice) {
  const expected = step.answer;
  if (step.validation === "calibrate")
    return Number.isFinite(choice) && Math.abs(choice - step.target) <= 5;
  if (step.validation === "text")
    return (
      typeof choice === "string" &&
      choice.trim().replace(/\s+/g, " ").toLowerCase() ===
        expected.toLowerCase()
    );
  if (step.validation === "stamp")
    return (
      Array.isArray(choice) &&
      choice.length === 2 &&
      choice.every((v) => Number.isFinite(v) && Math.abs(v - 50) <= 5)
    );
  if (step.validation === "set")
    return (
      Array.isArray(choice) &&
      choice.length === expected.length &&
      new Set(choice).size === choice.length &&
      expected.every((v) => choice.includes(v))
    );
  if (step.validation === "route") {
    if (
      !Array.isArray(choice) ||
      choice.length < 2 ||
      choice.length > 64 ||
      choice[0] !== step.start ||
      choice.at(-1) !== step.goal
    )
      return false;
    return choice.every(
      (v, i) =>
        Number.isInteger(v) &&
        v >= 0 &&
        v < step.size ** 2 &&
        !step.blocked.includes(v) &&
        (!i ||
          Math.abs(
            Math.floor(v / step.size) - Math.floor(choice[i - 1] / step.size),
          ) +
            Math.abs((v % step.size) - (choice[i - 1] % step.size)) ===
            1),
    );
  }
  return Array.isArray(expected)
    ? Array.isArray(choice) &&
        choice.length === expected.length &&
        choice.every((v, i) => Number.isInteger(v) && v === expected[i])
    : Number.isInteger(choice) && choice === expected;
}
