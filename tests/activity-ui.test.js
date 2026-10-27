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
