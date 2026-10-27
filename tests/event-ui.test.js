import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const src = readFileSync(
  new URL("../js/nightshift.js", import.meta.url),
  "utf8",
);
const update = src.slice(
  src.indexOf("function updateProgress("),
  src.indexOf("function submitAnswer("),
);
const receive = src.slice(
  src.indexOf("function receive("),
  src.indexOf("let signalingBusy"),
);
function context() {
  const calls = [];
  const ctx = {
    activeEvent: null,
    progress: { steps: {} },
    chapter: 0,
    CHAPTERS: [{}],
    EVENTS: [
      { id: "e", title: "Missione", steps: [{}] },
      { id: "other", steps: [{}] },
    ],
    room: { mode: "race" },
    answerTimer: null,
    pending: false,
    clearTimeout() {},
    completedCount: (p) => Object.values(p.steps).filter((v) => v === 1).length,
    restoreProgress: (p) => p,
    persist() {},
    sound: (k) => calls.push(k),
    toast() {},
    chapterUnlocked: () => false,
    render() {},
    renderEvent() {},
    cue() {},
    document: { querySelector: () => null },
    $: () => ({ dataset: {} }),
    syncRoomProgress() {},
    showVictory() {
      calls.push("success");
    },
  };
  vm.createContext(ctx);
  vm.runInContext(update + "\n" + receive, ctx);
  return { ctx, calls };
}
test("one successful result and its repeated broadcast play one success cue", () => {
  const { ctx, calls } = context();
  vm.runInContext(
    'receive({type:"answer_result",ok:true,eventId:"e",progress:{steps:{e:1}}}); receive({type:"progress",eventId:"e",progress:{steps:{e:1}}});',
    ctx,
  );
  assert.deepEqual(calls, ["success"]);
});
test("winning result gives priority to victory cue", () => {
  const { ctx, calls } = context();
  vm.runInContext(
    'receive({type:"answer_result",ok:true,eventId:"other",progress:{steps:{e:1,other:1}}}); receive({type:"game_over",room:{mode:"race",winner:{team:"spies"}}});',
    ctx,
  );
  assert.deepEqual(calls, ["success"]);
});
test("result for a different mission does not clear pending or replace active feedback", () => {
  const { ctx } = context();
  ctx.pending = true;
  ctx.pendingEventId = "other";
  ctx.activeEvent = "other";
  const feedback = { textContent: "In attesa", dataset: {} };
  ctx.$ = () => feedback;
  vm.runInContext(
    'receive({type:"answer_result",ok:false,eventId:"e",progress:{steps:{}}});',
    ctx,
  );
  assert.equal(ctx.pending, true);
  assert.equal(feedback.textContent, "In attesa");
});
test("rendering pending or retry preserves the mounted activity", () => {
  let cleaned = 0,
    mounted = 0;
  const states = [];
  const cleanup = () => cleaned++;
  cleanup.key = "e:0";
  cleanup.isActive = () => true;
  cleanup.setPending = (value) => states.push(value);
  const content = {
    dataset: {},
    replaceChildren() {},
    append() {},
    querySelector: () => ({}),
  };
  const ctx = {
    activityCleanup: cleanup,
    activeEvent: "e",
    EVENTS: [{ id: "e", place: "p", steps: [{ activity: "form" }] }],
    PLACES: [{ id: "p", name: "P" }],
    progress: { steps: {} },
    pending: true,
    $: () => content,
    cue() {},
    el: () => ({ setAttribute() {}, append() {} }),
    renderActivity: () => {
      mounted++;
      return () => {};
    },
    send() {},
    sound() {},
    document: { activeElement: null, body: {} },
  };
  const fn = src.slice(
    src.indexOf("function renderEvent()"),
    src.indexOf("function renderSequence("),
  );
  vm.createContext(ctx);
  vm.runInContext(fn + "\nrenderEvent();pending=false;renderEvent();", ctx);
  assert.equal(cleaned, 0);
  assert.equal(mounted, 0);
  assert.deepEqual(states, [true, false]);
});

test("online timeout unlocks the same mounted activity and blocks a duplicate send", () => {
  let timer,
    sent = 0,
    mounts = 0;
  const states = [];
  const controls = { dataset: {}, textContent: "" };
  const cleanup = () => {
    mounts++;
  };
  cleanup.key = "e:0";
  cleanup.isActive = () => true;
  cleanup.setPending = (value) => states.push(value);
  const event = { id: "e", steps: [{ activity: "copy" }] };
  const ctx = {
    pending: false,
    pendingEventId: null,
    room: { mode: "race" },
    sound() {},
    $: () => controls,
    online: true,
    ws: { readyState: 1 },
    activityCleanup: cleanup,
    activeEvent: "e",
    EVENTS: [event],
    progress: { steps: {} },
    clearTimeout() {},
    setTimeout: (fn) => {
      timer = fn;
    },
    answerTimer: null,
    send() {
      sent++;
    },
  };
  const render = src.slice(
    src.indexOf("function renderEvent()"),
    src.indexOf("function renderSequence("),
  );
  const submit = src.slice(
    src.indexOf("function submitAnswer("),
    src.indexOf('$("event-hint").onclick'),
  );
  vm.createContext(ctx);
  vm.runInContext(
    render +
      "\n" +
      submit +
      "\nsubmitAnswer(EVENTS[0],0,0);submitAnswer(EVENTS[0],0,0);",
    ctx,
  );
  assert.equal(sent, 1);
  timer();
  assert.equal(ctx.pending, false);
  assert.deepEqual(states, [true, false]);
  assert.equal(mounts, 0);
  assert.match(controls.textContent, /non risponde/);
});
