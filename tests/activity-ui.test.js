import test from "node:test";
import assert from "node:assert/strict";
import { renderActivity } from "../js/task-activities.js";
class Node {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.attrs = {};
    this.style = { setProperty() {} };
    this.classList = { toggle() {}, remove() {} };
    this.value = "";
  }
  set textContent(value) {
    (this.writes ||= []).push({ value, at: performance.now() });
    this._text = value;
  }
  get textContent() {
    return this._text || "";
  }
  set hidden(value) {
    this._hidden = value;
    if (value && globalThis.document?.activeElement === this)
      document.activeElement = document.body;
  }
  get hidden() {
    return this._hidden;
  }
  contains(value) {
    return all(this).includes(value);
  }
  append(...nodes) {
    this.children.push(...nodes);
  }
  setAttribute(k, v) {
    this.attrs[k] = v;
  }
  focus() {
    document.activeElement = this;
  }
}
const all = (n) => [n, ...n.children.flatMap(all)];
function fixture(t, step) {
  let now = 0,
    seq = 0;
  const timers = new Map(),
    listeners = new Map(),
    sounds = [],
    submitted = [];
  const doc = {
    hidden: false,
    activeElement: null,
    body: new Node("body"),
    createElement: (tag) => new Node(tag),
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: (event) => listeners.delete(event),
  };
  t.mock.method(globalThis, "setInterval", (fn) => {
    timers.set(++seq, fn);
    return seq;
  });
  t.mock.method(globalThis, "clearInterval", (id) => timers.delete(id));
  t.mock.method(performance, "now", () => now);
  const previous = globalThis.document;
  globalThis.document = doc;
  const root = new Node("root");
  const clean = renderActivity(root, step, {
    submit: (x) => submitted.push(x),
    sound: (x) => sounds.push(x),
    begin() {},
  });
  t.after(() => {
    clean();
    globalThis.document = previous;
  });
  return {
    root,
    clean,
    sounds,
    submitted,
    find: (fn) => all(root).find(fn),
    tick(time) {
      now = time;
      for (const fn of [...timers.values()]) fn();
    },
    hidden(value) {
      doc.hidden = value;
      listeners.get("visibilitychange")?.();
    },
    timers,
  };
}
test("pending and rejection keep form text and block duplicate submit", (t) => {
  const f = fixture(t, { activity: "form", recipient: "Julius Rosenberg" });
  const input = f.find((n) => n.tagName === "input"),
    button = f.find((n) => n.textContent === "Conferma destinatario");
  input.value = "Julius Rosemberg";
  button.onclick();
  f.clean.setPending(true);
  button.onclick();
  assert.equal(f.submitted.length, 1);
  assert.equal(input.value, "Julius Rosemberg");
  f.clean.setPending(false);
  button.onclick();
  assert.equal(f.submitted.length, 2);
  assert.equal(input.value, "Julius Rosemberg");
});
for (const time of [1000, 6500, 20000])
  test(`copy stays safe after ${time}ms hidden until explicit resume`, (t) => {
    const f = fixture(t, { activity: "copy" }),
      bar = f.find((n) => n.tagName === "progress");
    f.find((n) => n.textContent === "Avvia copia").onclick();
    for (let n = 100; n <= 1000; n += 100) f.tick(n);
    const before = bar.value;
    f.hidden(true);
    f.tick(1000 + time);
    f.hidden(false);
    f.tick(1100 + time);
    assert.equal(bar.value, before);
    assert.ok(f.find((n) => n.textContent === "Riprendi copia"));
    assert.equal(f.sounds.includes("wrong"), false);
  });
test("complete copy remains ready after pending and retry", (t) => {
  const f = fixture(t, { activity: "copy" }),
    bar = f.find((n) => n.tagName === "progress");
  const toggle = f.find((n) => n.textContent === "Avvia copia");
  toggle.onclick();
  for (let n = 100; n <= 4400; n += 100) f.tick(n);
  toggle.onclick();
  f.tick(8000);
  toggle.onclick();
  for (let n = 8100; n <= 12400; n += 100) f.tick(n);
  toggle.onclick();
  f.tick(16000);
  toggle.onclick();
  toggle.focus();
  for (let n = 16100; n <= 17000; n += 100) f.tick(n);
  assert.equal(bar.value, 100);
  const confirm = f.find((n) => n.textContent === "Ritira la copia");
  assert.equal(document.activeElement, confirm);
  confirm.onclick();
  f.clean.setPending(true);
  confirm.onclick();
  assert.equal(f.submitted.length, 1);
  f.clean.setPending(false);
  assert.equal(bar.value, 100);
  confirm.onclick();
  assert.equal(f.submitted.length, 2);
});
test("hidden collection expiry requests no audio and offers restart", (t) => {
  const f = fixture(t, {
    activity: "collect",
    size: 4,
    targets: [1, 3, 6, 8, 10, 14],
  });
  f.find((n) => n.textContent === "Avvia raccolta").onclick();
  f.hidden(true);
  f.tick(21000);
  assert.equal(f.sounds.length, 0);
  assert.match(
    f.find((n) => n.className === "activity-status").textContent,
    /Tempo scaduto/,
  );
  assert.ok(f.find((n) => n.textContent === "Ricomincia raccolta"));
});

const collectionStep = {
  activity: "collect",
  size: 4,
  targets: [1, 3, 6, 8, 10, 14],
};
function collectAll(f) {
  f.find((n) => n.textContent === "Avvia raccolta").onclick();
  for (const i of collectionStep.targets)
    f.find((n) => n.attrs["aria-label"] === `Contrassegno ${i + 1}`).onclick();
  return f.find((n) => n.textContent === "Deposita raccolta");
}
test("valid collection deposit retries unchanged after timeout without restarting timer", (t) => {
  const f = fixture(t, collectionStep),
    confirm = collectAll(f);
  f.tick(1000);
  confirm.onclick();
  f.clean.setPending(true);
  confirm.onclick();
  assert.equal(f.submitted.length, 1);
  const status = f.find((n) => n.className === "activity-status").textContent;
  f.tick(25000);
  f.clean.setPending(false);
  assert.equal(confirm.disabled, false);
  confirm.onclick();
  assert.equal(f.submitted.length, 2);
  assert.deepEqual(f.submitted[0], collectionStep.targets);
  assert.deepEqual(f.submitted[1], f.submitted[0]);
  assert.equal(
    f.find((n) => n.className === "activity-status").textContent,
    status,
  );
});
test("collection expired before first deposit cannot submit completed selection", (t) => {
  const f = fixture(t, collectionStep),
    confirm = collectAll(f);
  f.tick(21000);
  f.clean.setPending(false);
  confirm.onclick();
  assert.equal(confirm.disabled, true);
  assert.equal(f.submitted.length, 0);
});

test("idle live regions write only changed patrol warnings", (t) => {
  const f = fixture(t, { activity: "copy" });
  const patrol = f.find((n) => n.className === "patrol-status"),
    status = f.find((n) => n.className === "activity-status");
  patrol.writes = [];
  status.writes = [];
  for (let time = 100; time <= 8000; time += 100) f.tick(time);
  assert.equal(patrol.writes.length, 3);
  assert.deepEqual(
    patrol.writes.map((w) => w.at),
    [4500, 6000, 8000],
  );
  assert.equal(status.writes.length, 0);
  f.clean();
  f.tick(9000);
  assert.equal(patrol.writes.length, 3);
});
test("idle calibration does not repeat its live instruction", (t) => {
  const f = fixture(t, { activity: "calibrate", target: 50 }),
    status = f.find((n) => n.className === "activity-status");
  status.writes = [];
  for (let time = 100; time <= 1000; time += 100) f.tick(time);
  assert.equal(status.writes.length, 0);
});
test("copy percentage is limited to once per second while pause and resume are immediate", (t) => {
  const f = fixture(t, { activity: "copy" }),
    status = f.find((n) => n.className === "activity-status");
  const toggle = f.find((n) => n.textContent === "Avvia copia"),
    bar = f.find((n) => n.tagName === "progress");
  toggle.onclick();
  status.writes = [];
  for (let time = 100; time <= 4400; time += 100) f.tick(time);
  assert.equal(status.writes.length, 4);
  assert.ok(
    status.writes.every((w, i, a) => i === 0 || w.at - a[i - 1].at >= 1000),
  );
  assert.ok(bar.value > 48); // Visual progress still runs at100ms.
  toggle.onclick();
  assert.match(status.textContent, /al riparo/i);
  assert.equal(status.writes.at(-1).at, 4400);
  f.tick(4500);
  toggle.onclick();
  assert.match(status.textContent, /in corso/i);
  assert.equal(status.writes.at(-1).at, 4500);
  f.tick(6000);
  assert.match(status.textContent, /interrotta/i);
  assert.equal(status.writes.at(-1).at, 6000);
});
test("collection deduplicates timer text but announces pickup and expiry immediately", (t) => {
  const f = fixture(t, collectionStep),
    status = f.find((n) => n.className === "activity-status");
  f.find((n) => n.textContent === "Avvia raccolta").onclick();
  status.writes = [];
  for (let time = 200; time <= 1000; time += 200) f.tick(time);
  assert.equal(status.writes.length, 1);
  f.find((n) => n.attrs["aria-label"] === "Contrassegno 2").onclick();
  assert.match(status.textContent, /1 \/ 6 raccolti/);
  assert.equal(status.writes.at(-1).at, 1000);
  f.tick(20000);
  assert.match(status.textContent, /Tempo scaduto/);
});
test("route distinguishes free adjacent moves and preserves distant goal/obstacle rules", (t) => {
  const f = fixture(t, {
      activity: "route",
      size: 4,
      start: 0,
      goal: 15,
      blocked: [1],
    }),
    cell = (i) =>
      f.find(
        (n) => n.attrs["aria-label"]?.split(",")[0] === `Casella ${i + 1}`,
      );
  assert.equal(cell(15).textContent, "OUT");
  assert.equal(cell(15).disabled, true);
  assert.match(cell(4).className, /available/);
  assert.equal(cell(4).textContent, "↓");
  assert.match(cell(4).attrs["aria-label"], /mossa disponibile/);
  assert.equal(cell(1).textContent, "×");
  assert.doesNotMatch(cell(1).className, /available/);
  assert.equal(cell(1).disabled, false); // Collision remains a playable error.
  cell(4).onclick();
  assert.equal(cell(0).textContent, "IN");
  assert.match(cell(5).className, /available/);
  for (const i of [5, 9, 10, 11, 15]) cell(i).onclick();
  assert.equal(cell(15).textContent, "OUT");
  assert.match(cell(15).attrs["aria-label"], /segnalino, uscita/);
});

for (const failure of ["expiry", "exposure"])
  test(`collection ${failure} announces its terminal error exactly once`, (t) => {
    const f = fixture(t, collectionStep),
      status = f.find((n) => n.className === "activity-status");
    f.find((n) => n.textContent === "Avvia raccolta").onclick();
    if (failure === "exposure")
      for (let i = 0; i < 4; i++)
        f.find((n) => n.attrs["aria-label"] === "Settore vuoto 1").onclick();
    status.writes = [];
    if (failure === "expiry") f.tick(20000);
    else f.find((n) => n.attrs["aria-label"] === "Settore vuoto 1").onclick();
    assert.equal(status.writes.length, 1);
    assert.match(
      status.textContent,
      failure === "expiry"
        ? /Tempo scaduto/
        : /Esposizione simbolica al limite/,
    );
    f.tick(21000);
    assert.equal(status.writes.length, 1);
  });
