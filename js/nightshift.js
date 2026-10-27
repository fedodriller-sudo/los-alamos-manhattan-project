import { roomLink } from "./peer-config.js";
import { PeerSession } from "./peer-session.js";
import { TEAMS, missionsFor } from "./team-missions.js";
import { renderActivity } from "./task-activities.js";
import {
  CHAPTERS as SOLO_CHAPTERS,
  EVENTS as SOLO_EVENTS,
  PLACES,
} from "./history-data.js";
import {
  freshProgress,
  attempt as attemptFor,
  chapterUnlocked as unlockedFor,
  completedCount as countFor,
  restoreProgress as restoreFor,
} from "./progress.js";
let EVENTS = SOLO_EVENTS,
  CHAPTERS = SOLO_CHAPTERS;
const attempt = (p, id, choice) => attemptFor(p, id, choice, EVENTS);
const chapterUnlocked = (p, c) => unlockedFor(p, c, EVENTS);
const completedCount = (p) => countFor(p, EVENTS);
const restoreProgress = (p) => restoreFor(p, EVENTS);
let pendingEventId = null;
let activityCleanup = () => {},
  shownWinnerRound = null;
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
const SAVE = "los-alamos-nightshift-v1",
  PREFS = "los-alamos-preferences-v1";
let progress = freshProgress(),
  chapter = 0,
  selected = null,
  activeEvent = null,
  playing = false,
  online = false,
  room = null,
  yourId = null;
let player = { x: 49, y: 57, name: "Tu", color: 0 },
  target = null,
  ws = null,
  connecting = null,
  pending = false,
  answerTimer = null;
let toastTimer,
  rafTime = 0,
  lastSent = 0,
  lastStepSound = 0,
  audio = null,
  master = null;
const keys = new Set(),
  avatarNodes = new Map();
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const activeCues = new Set();
const reducedMotion = () => prefs.motion || motionQuery.matches;
const stored = read(PREFS) || {};
const prefs = {
  sound: stored.sound !== false,
  volume: Number.isFinite(stored.volume)
    ? Math.min(100, Math.max(0, stored.volume))
    : 35,
  motion:
    typeof stored.motion === "boolean"
      ? stored.motion
      : matchMedia("(prefers-reduced-motion: reduce)").matches,
};
function toast(text) {
  const destination = playing ? $("game-notice") : document.body;
  if ($("toast").parentElement !== destination) destination.append($("toast"));
  $("toast").textContent = text;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 4500);
}
function sound(kind = "tap") {
  if (!prefs.sound || document.hidden) return;
  try {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      master = audio.createGain();
      master.connect(audio.destination);
    }
    if (audio.state === "suspended") audio.resume();
    master.gain.value = (prefs.volume / 100) * 0.18;
    const tones =
      kind === "success"
        ? [440, 554, 660]
        : kind === "step"
          ? [110]
          : kind === "wrong"
            ? [220, 196]
            : [360];
    tones.forEach((f, i) => {
      const o = audio.createOscillator(),
        g = audio.createGain(),
        t = audio.currentTime + i * 0.09;
      o.type = kind === "step" ? "triangle" : "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(kind === "step" ? 0.12 : 0.5, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.14);
    });
  } catch {
    /* Audio is optional; gameplay never depends on availability. */
  }
}
function applyPrefs() {
  document.body.classList.toggle("reduce-motion", reducedMotion());
  if (reducedMotion()) {
    for (const a of activeCues) a.cancel();
    activeCues.clear();
    target = null;
  }
  $("sound-toggle").checked = prefs.sound;
  $("motion-toggle").checked = prefs.motion;
  $("volume").value = prefs.volume;
  if (master) master.gain.value = (prefs.volume / 100) * 0.18;
  write(PREFS, prefs);
}
applyPrefs();
motionQuery.addEventListener("change", applyPrefs);
$("sound-toggle").onchange = (e) => {
  prefs.sound = e.target.checked;
  applyPrefs();
  sound("success");
};
$("motion-toggle").onchange = (e) => {
  prefs.motion = e.target.checked;
  applyPrefs();
};
$("volume").oninput = (e) => {
  prefs.volume = Number(e.target.value);
  applyPrefs();
};
function show(id) {
  keys.clear();
  target = null;
  const d = $(id);
  if (!d.open) d.showModal();
}
for (const d of document.querySelectorAll("dialog")) {
  d.querySelectorAll("[data-close]").forEach(
    (b) => (b.onclick = () => d.close()),
  );
  d.addEventListener("click", (e) => {
    if (e.target === d && d.id !== "victory-dialog") {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  });
  d.addEventListener("close", () => {
    keys.clear();
    if (d.id === "event-dialog" && !d.open) {
      activityCleanup();
      activeEvent = null;
      pending = false;
      clearTimeout(answerTimer);
    }
    if (d.id === "lobby-dialog" && !playing) disconnect();
  });
}
$("settings-button").onclick = () => show("settings-dialog");
$("help-button").onclick = () => show("help-dialog");
$("settings-help").onclick = () => {
  $("settings-dialog").close();
  show("help-dialog");
};
$("journal-button").onclick = () => {
  renderJournal();
  show("journal-dialog");
};
$("journal-dialog").addEventListener("close", () => {
  if (playing) $("map").focus({ preventScroll: true });
});
function isDone(e) {
  return (progress.steps[e.id] || 0) >= e.steps.length;
}
function highestChapter() {
  let c = 0;
  for (let i = 0; i < CHAPTERS.length; i++)
    if (chapterUnlocked(progress, i)) c = i;
  return c;
}
function persist() {
  if (!online && !write(SAVE, progress))
    toast(
      "Il browser non consente il salvataggio. Puoi continuare questo turno.",
    );
  updateResume();
}
function updateResume() {
  const p = restoreFor(read(SAVE), SOLO_EVENTS);
  $("resume-button").hidden = !Object.keys(p.steps).length;
}
updateResume();
progress = restoreProgress(read(SAVE));
$("journal-count").textContent = completedCount(progress);
function makeAvatar(p, self) {
  const n = el("div", "avatar " + (self ? "self" : "remote"));
  const img = el("img");
  img.src =
    p.color % 2 ? "img/researcher-chibi.webp" : "img/scientist-chibi.webp";
  img.alt = "";
  // An outline/name color identifies people without recoloring the historical white coats.
  const colors = [
    "#f6bc57",
    "#8bd5c2",
    "#ed9aa2",
    "#9fafff",
    "#a4d482",
    "#e8b8ef",
    "#f49a65",
    "#8dd3ec",
  ];
  const label = el(
    "span",
    "",
    self ? (online ? p.name + " · tu" : "Tu") : p.name,
  );
  label.style.borderColor = colors[p.color % colors.length];
  n.append(img, label);
  $("avatars").append(n);
  avatarNodes.set(p.id || "self", n);
  return n;
}
function placeAvatar(p, n) {
  n.style.left = p.x + "%";
  n.style.top = p.y + "%";
}
function renderAvatars() {
  const roster = online && room ? room.players : [{ ...player, id: "self" }];
  const ids = new Set(roster.map((p) => p.id));
  for (const [id, n] of avatarNodes)
    if (!ids.has(id)) {
      n.remove();
      avatarNodes.delete(id);
    }
  for (const p of roster) {
    const self = !online || p.id === yourId;
    const n = avatarNodes.get(p.id) || makeAvatar(p, self);
    placeAvatar(self ? player : p, n);
  }
}
function render() {
  const count = completedCount(progress);
  $("progress-label").textContent =
    room?.mode === "race" ? "Missioni della tua squadra" : "Il nostro diario";
  $("total-progress").max = EVENTS.length;
  $("total-progress").value = count;
  $("progress-count").textContent = count + " / " + EVENTS.length;
  $("journal-count").textContent = count;
  $("chapters").replaceChildren();
  CHAPTERS.forEach((c, i) => {
    const b = el(
      "button",
      "chapter-button" + (i === chapter ? " active" : ""),
      c.year,
    );
    b.disabled = !chapterUnlocked(progress, i);
    b.setAttribute("aria-pressed", i === chapter ? "true" : "false");
    if (b.disabled) b.title = "Completa il capitolo precedente";
    b.onclick = () => {
      chapter = i;
      selected = null;
      target = null;
      render();
    };
    $("chapters").append(b);
  });
  const c = CHAPTERS[chapter];
  $("chapter-year").textContent = c.year;
  $("chapter-title").textContent = c.title;
  $("chapter-subtitle").textContent = c.subtitle;
  const missionFocus = document.activeElement?.dataset.mission;
  const missionSignature = JSON.stringify([
    chapter,
    selected,
    EVENTS.map((e) => [e.id, progress.steps[e.id] || 0]),
  ]);
  const list = $("mission-list");
  const missions = EVENTS.filter((e) => e.chapter === chapter);
  if (list.dataset.signature !== missionSignature) {
    list.dataset.signature = missionSignature;
    list.replaceChildren();
    missions.forEach((e, i) => {
      const li = el("li"),
        b = el(
          "button",
          "mission-button" +
            (isDone(e) ? " done" : "") +
            (selected === e.id ? " selected" : ""),
          e.title,
        );
      b.dataset.number = String(i + 1).padStart(2, "0");
      b.dataset.mission = e.id;
      if (selected === e.id) b.setAttribute("aria-current", "true");
      b.append(
        el(
          "small",
          "",
          isDone(e) ? "Nel diario · rileggi" : e.kind + " · " + e.duration,
        ),
      );
      const stepCount = progress.steps[e.id] || 0;
      const meter = el("span", "mission-meter");
      meter.setAttribute("aria-hidden", "true");
      meter.style.setProperty(
        "--done",
        (stepCount / e.steps.length) * 100 + "%",
      );
      b.append(meter);
      if (stepCount > 0 && !isDone(e))
        b.append(
          el(
            "span",
            "mission-state",
            stepCount + " / " + e.steps.length + " passaggi",
          ),
        );
      if (isDone(e)) b.append(el("span", "mission-state", "Completata"));
      b.onclick = () => selectEvent(e);
      li.append(b);
      $("mission-list").append(li);
    });
    if (missionFocus)
      list
        .querySelector(`[data-mission="${missionFocus}"]`)
        ?.focus({ preventScroll: true });
  }
  if ($("markers").dataset.signature !== missionSignature) {
    $("markers").dataset.signature = missionSignature;
    $("markers").replaceChildren();
    for (const p of PLACES) {
      const events = missions.filter((e) => e.place === p.id);
      const available = events.some((e) => !isDone(e));
      const b = el(
        "button",
        "place-marker" +
          (available ? " active" : "") +
          (EVENTS.find((e) => e.id === selected)?.place === p.id
            ? " selected"
            : ""),
      );
      b.style.left = p.x + "%";
      b.style.top = p.y + "%";
      b.append(
        el("span", "marker-number", p.number),
        document.createTextNode(p.name),
      );
      b.setAttribute(
        "aria-label",
        p.name + (available ? ", episodio disponibile" : ""),
      );
      b.onclick = () => {
        const e = events.find((e) => !isDone(e)) || events[0];
        if (e) selectEvent(e);
        else
          toast("Nessun episodio in questo luogo nel capitolo " + c.year + ".");
      };
      $("markers").append(b);
    }
  }
  $("session-label").textContent = online
    ? room?.mode === "race"
      ? TEAMS[ownTeam()]?.name || "Squadra"
      : "Squadra cooperativa"
    : "In solitaria";
  $("room-label").textContent =
    online && room
      ? "SQUADRA · " + room.players.length + "/8"
      : "TURNO PERSONALE";
  $("invite-button").hidden = !online;
  $("gather-button").hidden = !online;
  $("presence").textContent =
    online && room
      ? room.players.length +
        " giocatori · " +
        (room.mode === "race" ? "Personale contro Spie" : "progressi condivisi")
      : count === EVENTS.length
        ? "Il diario è completo. Grazie per aver esplorato."
        : "Esplora con calma. Ogni storia conta.";
  renderRaceScore();
  renderAvatars();
  updateNearby();
  if ($("journal-dialog").open) renderJournal();
}
function clearInvite() {
  const url = new URL(location.href);
  url.searchParams.delete("room");
  if (url.hash.startsWith("#room=")) url.hash = "";
  history.replaceState(null, "", url);
}
function startSolo(resume = false) {
  useSoloCatalog();
  clearInvite();
  disconnect();
  online = false;
  room = null;
  yourId = null;
  progress = resume ? restoreProgress(read(SAVE)) : freshProgress();
  chapter = highestChapter();
  player = { x: 49, y: 57, name: "Tu", color: 0 };
  begin();
  if (!resume)
    toast("Scegli il primo episodio nel dossier o tocca un luogo illuminato.");
}
function begin() {
  playing = true;
  selected = null;
  target = null;
  avatarNodes.forEach((n) => n.remove());
  avatarNodes.clear();
  $("welcome").hidden = true;
  $("play").hidden = false;
  $("header-progress").hidden = false;
  for (const d of document.querySelectorAll("dialog[open]")) d.close();
  render();
  cue(document.querySelector(".campus-column"), "arrival");
  cue(document.querySelector(".dossier"), "enter");
  $("map").focus({ preventScroll: true });
  sound("success");
}
$("solo-button").onclick = () => startSolo(false);
$("resume-button").onclick = () => startSolo(true);
function exit() {
  clearInvite();
  if (!online) persist();
  playing = false;
  activeEvent = null;
  target = null;
  keys.clear();
  disconnect();
  online = false;
  room = null;
  useSoloCatalog();
  progress = restoreProgress(read(SAVE));
  $("journal-count").textContent = completedCount(progress);
  for (const d of document.querySelectorAll("dialog[open]")) d.close();
  $("play").hidden = true;
  $("header-progress").hidden = true;
  $("welcome").hidden = false;
  updateResume();
  $("solo-button").focus();
}
$("exit-button").onclick = exit;
document.querySelector(".brand").onclick = (e) => {
  e.preventDefault();
  if (playing) exit();
};
function selectEvent(e) {
  sound();
  selected = e.id;
  render();
  if (isDone(e)) {
    openEvent(e);
    return;
  }
  const p = PLACES.find((p) => p.id === e.place);
  if (reducedMotion()) {
    player.x = p.x;
    player.y = Math.min(88, p.y + 6);
    renderAvatars();
    sendMove();
    openEvent(e);
    return;
  }
  target = { x: p.x, y: Math.min(88, p.y + 6), eventId: e.id };
  $("map").focus({ preventScroll: true });
  toast("In cammino verso " + p.name + "…");
}
function nearestEvent() {
  const events = EVENTS.filter((e) => e.chapter === chapter && !isDone(e));
  return events
    .map((e) => ({ e, p: PLACES.find((p) => p.id === e.place) }))
    .sort((a, b) => distance(a.p) - distance(b.p))[0];
}
function distance(p) {
  return Math.hypot(p.x - player.x, p.y + 6 - player.y);
}
function updateNearby() {
  if (!playing) return;
  const n = nearestEvent();
  const near = n && distance(n.p) < 12;
  const race = room?.mode === "race";
  const destination =
    target?.eventId && EVENTS.find((e) => e.id === target.eventId);
  const complete = completedCount(progress) === EVENTS.length;
  $("nearby-name").textContent = destination
    ? race
      ? destination.title
      : "Verso " + PLACES.find((p) => p.id === destination.place).name
    : near
      ? race
        ? n.e.title
        : n.p.name
      : complete
        ? race
          ? "Missioni della squadra completate"
          : "Tutte le storie nel diario"
        : race && n
          ? n.e.title
          : "Scegli una storia nel dossier";
  $("interact-button").textContent = destination
    ? "Raggiungi ora"
    : near
      ? race
        ? "Apri missione [E]"
        : "Interagisci [E]"
      : complete
        ? "Apri il diario"
        : race
          ? "Prossima missione"
          : "Prossimo episodio";
}
$("interact-button").onclick = () => {
  if (target?.eventId) {
    const e = EVENTS.find((e) => e.id === target.eventId);
    player.x = target.x;
    player.y = target.y;
    target = null;
    sendMove();
    renderAvatars();
    openEvent(e);
    return;
  }
  const n = nearestEvent();
  if (n) {
    if (distance(n.p) < 12) openEvent(n.e);
    else selectEvent(n.e);
  } else {
    renderJournal();
    show("journal-dialog");
  }
};
function appendSources(parent, e) {
  for (const s of [e.source, ...(e.additionalSources || [])]) {
    const a = el("a", "source-link", s.name + " ↗");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    parent.append(a);
  }
}
function factContent(e) {
  const box = el("div");
  box.append(
    el("span", "fact-label", "IL FATTO DOCUMENTATO"),
    el("p", "", e.fact),
    el("p", "adaptation", "Nel gioco: " + e.adaptation),
  );
  appendSources(box, e);
  return box;
}
function openEvent(e) {
  activeEvent = e.id;
  selected = e.id;
  target = null;
  keys.clear();
  render();
  show("event-dialog");
  renderEvent();
  $("event-feedback").textContent = "";
}
function renderEvent() {
  const e = EVENTS.find((e) => e.id === activeEvent);
  if (!e) return;
  const n = progress.steps[e.id] || 0;
  const stepKey = e.id + ":" + n;
  if (activityCleanup.key === stepKey && activityCleanup.isActive?.()) {
    activityCleanup.setPending(pending);
    return;
  }
  activityCleanup();
  activityCleanup = () => {};
  $("event-date").textContent = e.date;
  $("event-kind").textContent =
    e.kind + " · " + PLACES.find((p) => p.id === e.place).name;
  $("event-title").textContent = e.title;
  $("event-intro").textContent = e.intro;
  $("event-context").open = !matchMedia("(max-width: 600px)").matches;
  $("event-context-label").textContent =
    room?.mode === "race"
      ? "Contesto della missione"
      : "La storia di questo episodio";
  const content = $("event-content");
  content.replaceChildren();
  if (content.dataset.step !== stepKey) {
    content.dataset.step = stepKey;
    cue(content, "enter");
  }
  const stepMeter = el("progress", "activity-step-meter");
  stepMeter.max = e.steps.length;
  stepMeter.value = n;
  stepMeter.setAttribute("aria-label", "Passaggi completati");
  content.append(stepMeter);
  $("event-hint").hidden = n >= e.steps.length;
  if (n >= e.steps.length) {
    content.append(
      el(
        "span",
        "event-complete",
        room?.mode === "race"
          ? "Missione completata · nel diario"
          : "Episodio aggiunto al diario",
      ),
      factContent(e),
    );
    const next = EVENTS.find(
      (v) => !isDone(v) && chapterUnlocked(progress, v.chapter),
    );
    const b = el(
      "button",
      "button gold full",
      next
        ? room?.mode === "race"
          ? "Prossima missione →"
          : "Prossima storia →"
        : "Apri il diario completo",
    );
    b.onclick = () => {
      if (next) {
        $("event-dialog").close();
        chapter = next.chapter;
        selectEvent(next);
      } else {
        $("event-dialog").close();
        renderJournal();
        show("journal-dialog");
      }
    };
    content.append(b);
    if (document.activeElement === document.body)
      b.focus({ preventScroll: true });
    return;
  }
  const s = e.steps[n];
  content.append(
    el("div", "event-step", "PASSAGGIO " + (n + 1) + " DI " + e.steps.length),
    el("h3", "event-question", s.prompt),
  );
  const question = content.querySelector("h3");
  question.tabIndex = -1;
  if (s.activity) {
    activityCleanup =
      renderActivity(content, s, {
        pending,
        sound,
        submit: (choice) => submitAnswer(e, n, choice),
        begin: () => send("activity_begin", { eventId: e.id, step: n }),
      }) || (() => {});
    activityCleanup.key = stepKey;
    if ($("event-dialog").open && document.activeElement === document.body)
      question.focus({ preventScroll: true });
    return;
  }
  // Keep sequence selections and ordinary answers mounted during host acknowledgement too.
  const controls = el("fieldset", "event-controls");
  controls.setAttribute("aria-label", s.prompt);
  controls.disabled = pending;
  content.append(controls);
  let mounted = true,
    pendingFocus = null;
  activityCleanup = () => {
    mounted = false;
  };
  activityCleanup.key = stepKey;
  activityCleanup.isActive = () => mounted;
  activityCleanup.setPending = (value) => {
    if (value && controls.contains(document.activeElement))
      pendingFocus = document.activeElement;
    controls.disabled = value;
    if (!value && pendingFocus && document.activeElement === document.body) {
      pendingFocus.focus({ preventScroll: true });
      pendingFocus = null;
    }
  };
  if (s.interaction === "compare") {
    const table = el("table", "comparison-table");
    const caption = el("caption", "", "Dati inventati · prova di confronto");
    table.append(caption);
    const head = el("thead"),
      hr = el("tr");
    for (const label of ["Conto", "Funzionante", "In prova"]) {
      const th = el("th", "", label);
      th.scope = "col";
      hr.append(th);
    }
    head.append(hr);
    table.append(head);
    const body = el("tbody");
    for (const row of s.rows) {
      const tr = el("tr");
      for (const value of row) tr.append(el("td", "", value));
      body.append(tr);
    }
    table.append(body);
    content.append(table);
  }
  if (s.interaction === "sequence") {
    renderSequence(e, n, s, controls);
    if (document.activeElement === document.body)
      question.focus({ preventScroll: true });
    return;
  }
  s.options.forEach((label, i) => {
    const b = el("button", "answer");
    b.append(
      el("span", "", String.fromCharCode(65 + i)),
      document.createTextNode(label),
    );
    b.onclick = () => submitAnswer(e, n, i);
    controls.append(b);
  });
  if ($("event-dialog").open && document.activeElement === document.body)
    question.focus({ preventScroll: true });
}
function renderSequence(e, n, s, content) {
  let order = [];
  const picked = el("ol", "sequence-picked");
  picked.setAttribute("aria-label", "Ordine scelto");
  const choices = el("div", "sequence-choices");
  const status = el(
    "p",
    "sequence-status",
    "Seleziona le tre schede nell’ordine giusto.",
  );
  status.setAttribute("role", "status");
  const actions = el("div", "sequence-actions"),
    reset = el("button", "button small", "Ricomincia"),
    check = el("button", "button gold", "Controlla ordine");
  const refresh = () => {
    picked.replaceChildren();
    for (const i of order) picked.append(el("li", "", s.options[i]));
    choices.replaceChildren();
    for (const i of [2, 0, 1]) {
      const b = el("button", "answer", s.options[i]);
      b.disabled = order.includes(i);
      b.onclick = () => {
        order.push(i);
        sound();
        refresh();
        status.textContent = order.length + " di 3 schede selezionate.";
        if (order.length === 3) check.focus();
        else choices.querySelector("button:not(:disabled)")?.focus();
      };
      choices.append(b);
    }
    check.disabled = order.length !== 3;
    reset.disabled = order.length === 0;
  };
  reset.onclick = () => {
    $("event-feedback").textContent = "";
    order = [];
    refresh();
    status.textContent = "Seleziona le tre schede nell’ordine giusto.";
    choices.querySelector("button")?.focus();
  };
  check.onclick = () => submitAnswer(e, n, order);
  actions.append(reset, check);
  content.append(picked, choices, status, actions);
  refresh();
}
function updateProgress(p, eventId, by, audible = true) {
  const previousActiveStep = activeEvent ? progress.steps[activeEvent] : null;
  const before = completedCount(progress);
  progress = restoreProgress(p);
  persist();
  const after = completedCount(progress);
  if (after > before) {
    if (audible && !(room?.mode === "race" && after === EVENTS.length))
      sound("success");
    const e = EVENTS.find((e) => e.id === eventId);
    toast((by ? by + ": " : "") + (e ? e.title : "Episodio") + " · nel diario");
    if (
      chapterUnlocked(progress, chapter + 1) &&
      chapter < CHAPTERS.length - 1 &&
      EVENTS.filter((e) => e.chapter === chapter).every(isDone)
    ) {
      chapter++;
      toast(
        "Nuovo capitolo: " +
          CHAPTERS[chapter].year +
          " · " +
          CHAPTERS[chapter].title,
      );
    }
  }
  render();
  if (after > before)
    cue(document.querySelector(`[data-mission="${eventId}"]`), "success");
  if (
    activeEvent &&
    $("event-dialog").open &&
    previousActiveStep !== progress.steps[activeEvent]
  ) {
    renderEvent();
    if (by && by !== player.name && eventId === activeEvent)
      $("event-feedback").textContent = by + " ha aggiornato questo episodio.";
  }
}
function submitAnswer(e, n, i) {
  if (pending || room?.winner) return;
  sound();
  $("event-feedback").textContent = "";
  if (online) {
    if (ws?.readyState !== 1) {
      $("event-feedback").textContent =
        "Connessione interrotta. Torna al menu per rientrare nella stanza.";
      return;
    }
    pending = true;
    pendingEventId = e.id;
    renderEvent();
    $("event-feedback").textContent = "Invio all’host…";
    clearTimeout(answerTimer);
    answerTimer = setTimeout(() => {
      pending = false;
      renderEvent();
      $("event-feedback").textContent =
        "L’host non risponde. Controlla la connessione e riprova.";
    }, 4000);
    send("answer", { eventId: e.id, step: n, choice: i });
    return;
  }
  const result = attempt(progress, e.id, i);
  cue($("event-dialog"), result.ok ? "success" : "error");
  $("event-feedback").dataset.kind = result.ok ? "success" : "error";
  if (result.ok) {
    sound("success");
    persist();
    render();
    renderEvent();
    $("event-feedback").textContent = result.feedback;
    if (result.complete) {
      const next = highestChapter();
      if (next > chapter) toast("Sbloccato il capitolo " + CHAPTERS[next].year);
      if (completedCount(progress) === EVENTS.length)
        toast("Diario completo: otto storie, una memoria condivisa.");
    }
  } else {
    sound("wrong");
    $("event-feedback").textContent = "Riprova con calma. " + result.hint;
  }
}
$("event-hint").onclick = () => {
  const e = EVENTS.find((e) => e.id === activeEvent);
  if (e) {
    const s = e.steps[progress.steps[e.id] || 0];
    if (s) $("event-feedback").textContent = s.hint;
  }
};
function renderJournal() {
  const root = $("journal-content");
  root.replaceChildren();
  const done = EVENTS.filter(isDone);
  if (!done.length)
    root.append(
      el(
        "p",
        "journal-empty",
        "Il diario è ancora vuoto. Completa un episodio per raccogliere la sua storia e le fonti.",
      ),
    );
  for (const e of done) {
    const d = el("details", "journal-entry"),
      summary = el("summary", "", e.title);
    summary.append(el("span", "", e.date + " · apri"));
    d.append(summary, factContent(e));
    root.append(d);
  }
}
function send(type, data = {}) {
  if (ws?.readyState === 1)
    ws.send(
      JSON.stringify({
        type,
        ...data,
        ...(room?.mode === "race" ? { round: room.round } : {}),
      }),
    );
}
function disconnect() {
  clearTimeout(answerTimer);
  pending = false;
  connecting = null;
  if (ws) {
    const old = ws;
    ws = null;
    old.close();
  }
  room = null;
  yourId = null;
  signalingBusy = false;
  signalGeneration++;
  $("signal-output").value = "";
  $("connection-status").textContent = "";
  $("room-qr").hidden = true;
  $("room-qr").removeAttribute("src");
}
function renderLobby() {
  if (!room) return;
  $("lobby-entry").hidden = true;
  $("lobby-waiting").hidden = false;
  $("code-display").textContent = room.players.length + " / 8 collegati";
  $("player-name").hidden = true;
  $("name-label").hidden = true;
  $("copy-invite").hidden = room.hostId !== yourId;
  $("roster").replaceChildren();
  for (const p of room.players) {
    const li = el("li", "", p.name + (p.id === yourId ? " · tu" : ""));
    li.append(
      el(
        "small",
        "",
        (TEAMS[p.team]?.name || "ricercatore") +
          (p.id === room.hostId ? " · host" : ""),
      ),
    );
    $("roster").append(li);
  }
  const host = room.hostId === yourId;
  const both =
    room.mode !== "race" ||
    ["personnel", "spies"].every((t) => room.players.some((p) => p.team === t));
  $("rematch-button").disabled = !both;
  $("team-picker").hidden = room.mode !== "race";
  for (const b of $("team-picker").querySelectorAll("button")) {
    b.disabled = room.started;
    b.setAttribute("aria-pressed", String(b.dataset.team === ownTeam()));
  }
  const missing = ["personnel", "spies"].find(
    (team) => !room.players.some((player) => player.team === team),
  );
  const needsInvite = host && !room.started && !both;
  $("copy-invite").className = needsInvite ? "button gold full" : "button full";
  $("copy-invite").textContent = needsInvite
    ? `Copia link: invita ${missing === "spies" ? "le Spie" : "il Personale"}`
    : "Copia link stanza";
  $("copy-signal").className = "button full";
  $("signal-panel").dataset.priority = needsInvite ? "invite" : "secondary";
  $("signal-heading").textContent = needsInvite
    ? `Invita ${missing === "spies" ? "le Spie" : "il Personale"}.`
    : "Invita i tuoi amici.";
  $("start-button").hidden = !host && !room.started;
  $("start-button").disabled =
    !room.started && (!host || room.players.length < 2 || !both);
  $("start-button").className =
    both || room.started ? "button gold full" : "button full";
  $("start-button").textContent = room.started
    ? "Rientra nel turno"
    : "Avvia il turno";
  const help = room.started
    ? "La gara è in corso. Rientra quando sei pronto."
    : !both
      ? `Manca un giocatore ${missing === "spies" ? "nelle Spie" : "nel Personale"}. ${host ? "Condividi il link o il QR con un amico." : "Puoi scegliere questa squadra qui sopra."}`
      : host
        ? "Entrambe le squadre sono pronte. Puoi avviare."
        : "L’host avvierà il turno per tutti.";
  if ($("host-help").textContent !== help) $("host-help").textContent = help;
  $("player-name").disabled = true;
  renderSignaling();
}
function receive(m) {
  if (m.type === "error") {
    $("connection-status").textContent = m.message;
    toast(m.message);
    return;
  }
  if (m.type === "room_joined") {
    room = m.room;
    yourId = m.yourId;
    online = true;
    syncRoomProgress();
    renderLobby();
    $("connection-status").textContent =
      yourId === room.hostId
        ? "Stanza aperta su questo browser."
        : "Collegato alla stanza. Scegli la tua squadra.";
    return;
  }
  if (m.type === "room_update") {
    if (m.room.players.length > (room?.players.length || 0)) {
      $("connection-status").textContent =
        "Giocatore collegato. Puoi invitare altre persone.";
    }
    room = m.room;
    if (!room.players.some((p) => p.id === yourId)) return;
    syncRoomProgress();
    if (playing) {
      render();
    }
    if ($("lobby-dialog").open) renderLobby();
    if ($("victory-dialog").open) {
      const both = ["personnel", "spies"].every((t) =>
        room.players.some((p) => p.team === t),
      );
      $("rematch-button").disabled = !both;
      if (yourId === room.hostId)
        $("victory-host-note").textContent = both
          ? "La rivincita mantiene le squadre e azzera le missioni."
          : "Serve almeno una persona per squadra per la rivincita.";
    }
    return;
  }
  if (m.type === "game_start") {
    room = m.room;
    yourId = m.yourId;
    online = true;
    syncRoomProgress();
    chapter = highestChapter();
    const p = room.players.find((p) => p.id === yourId);
    player = { ...p };
    shownWinnerRound = null;
    activityCleanup();
    activeEvent = null;
    pending = false;
    clearTimeout(answerTimer);
    begin();
    if (room.winner) showVictory();
    else
      toast(
        room.mode === "race"
          ? "La gara è iniziata. Completa tutte le missioni della tua squadra."
          : "Il turno è iniziato. Le storie si completano insieme.",
      );
    return;
  }
  if (m.type === "player_move") {
    const p = room?.players.find((p) => p.id === m.id);
    if (p) {
      p.x = m.x;
      p.y = m.y;
      if (p.id !== yourId) {
        const n = avatarNodes.get(p.id);
        if (n) placeAvatar(p, n);
      }
    }
    return;
  }
  if (m.type === "answer_result") {
    if (!pending || pendingEventId === m.eventId) clearTimeout(answerTimer);
    const relevant = !pending || pendingEventId === m.eventId;
    if (relevant) {
      pending = false;
      pendingEventId = null;
    }
    updateProgress(m.progress, m.eventId, undefined, false);
    if (activeEvent && activeEvent !== m.eventId) return;
    if (!m.ok) renderEvent();
    if (activeEvent) {
      $("event-feedback").textContent = m.ok
        ? m.feedback
        : m.reason === "stale"
          ? "Un collega ha già completato questo passaggio. Continua da qui."
          : m.hint
            ? "Riprova con calma. " + m.hint
            : "Questo episodio non è ancora disponibile.";
    }
    cue($("event-dialog"), m.ok ? "success" : "error");
    $("event-feedback").dataset.kind = m.ok ? "success" : "error";
    if (
      !(
        m.ok &&
        room?.mode === "race" &&
        completedCount(progress) === EVENTS.length
      )
    )
      sound(m.ok ? "success" : "wrong");
    return;
  }
  if (m.type === "progress") {
    updateProgress(m.progress, m.eventId, m.by);
    return;
  }
  if (m.type === "race_progress") {
    const previous = progress;
    room = m.room;
    useRoomCatalog();
    if (m.team === ownTeam()) {
      progress = previous;
      updateProgress(room.teamProgress[ownTeam()], m.eventId, m.by);
    } else renderRaceScore();
    return;
  }
  if (m.type === "game_over") {
    room = m.room;
    syncRoomProgress();
    render();
    showVictory();
    return;
  }
  if (m.type === "gather")
    toast(
      m.by +
        " richiama il gruppo alla sala riunioni. Potete raggiungerla sulla mappa.",
    );
}
let signalingBusy = false;
let signalGeneration = 0;
function newSession() {
  disconnect();
  const session = new PeerSession(
    $("player-name").value,
    (m) => {
      if (ws === session) receive(m);
    },
    (message) => {
      if (ws !== session) return;
      // Exit while still multiplayer: never persist race progress into the solo diary.
      if (playing) exit();
      else {
        disconnect();
        online = false;
      }
      toast(message);
      $("connection-status").textContent = message;
      renderSignaling();
    },
    {
      onstatus: (message) => {
        if (ws === session) $("connection-status").textContent = message;
      },
    },
  );
  ws = session;
  return session;
}
async function signalAction(action) {
  if (signalingBusy) return;
  const session = newSession();
  const generation = signalGeneration;
  signalingBusy = true;
  renderSignaling();
  $("connection-status").textContent = "Collegamento alla stanza…";
  try {
    await action(session);
    if (ws !== session || generation !== signalGeneration) return;
    if (session.room) {
      const link = roomLink(location.href, session.id);
      $("signal-output").value = link;
      const { toDataURL } = await import("./vendor/qrcode.js");
      const qr = await toDataURL(link, {
        width: 180,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      if (ws !== session || generation !== signalGeneration) return;
      $("room-qr").src = qr;
      $("room-qr").hidden = false;
    }
  } catch (e) {
    if (ws !== session || generation !== signalGeneration) return;
    if (!session.readyState) {
      session.close();
      ws = null;
    }
    $("connection-status").textContent = e.message;
  } finally {
    if (generation === signalGeneration) {
      signalingBusy = false;
      renderSignaling();
    }
  }
}
async function copyInvite() {
  const output = $("signal-output");
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    toast("Link copiato. Condividi lo stesso link con tutti gli amici.");
  } catch {
    output.focus();
    output.select();
    toast("Link selezionato: copialo e condividilo con gli amici.");
  }
}
$("copy-signal").onclick = copyInvite;
$("copy-invite").onclick = copyInvite;
$("coop-button").onclick = () => {
  if (room) renderLobby();
  else renderSignaling();
  show("lobby-dialog");
};
$("create-button").onclick = () => signalAction((session) => session.host());
$("lobby-form").onsubmit = (e) => {
  e.preventDefault();
  const invite = $("room-code").value;
  signalAction((session) => session.join(invite));
};
$("start-button").onclick = () => {
  if (room?.started) begin();
  else send("start_game");
};
$("invite-button").onclick = () => {
  renderLobby();
  show("lobby-dialog");
};
$("gather-button").onclick = () => {
  send("gather");
  sound();
};
function sendMove() {
  if (online) send("move", { x: player.x, y: player.y });
}
window.addEventListener("keydown", (e) => {
  if (
    !playing ||
    document.querySelector("dialog[open]") ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  )
    return;
  const k = e.key.toLowerCase();
  if (
    [
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowleft",
      "arrowdown",
      "arrowright",
      "e",
    ].includes(k)
  ) {
    e.preventDefault();
    if (k === "e" && !e.repeat) $("interact-button").click();
    else if (k !== "e") {
      keys.add(k);
      target = null;
    }
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
document.addEventListener("visibilitychange", () => keys.clear());
function frame(time) {
  const dt = Math.min((time - rafTime) / 1000, 0.05);
  rafTime = time;
  if (playing && !document.hidden && !document.querySelector("dialog[open]")) {
    let dx =
        (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
        (keys.has("a") || keys.has("arrowleft") ? 1 : 0),
      dy =
        (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
        (keys.has("w") || keys.has("arrowup") ? 1 : 0);
    if (target) {
      dx = target.x - player.x;
      dy = target.y - player.y;
      if (Math.hypot(dx, dy) < 0.8) {
        const e = EVENTS.find((e) => e.id === target.eventId);
        target = null;
        if (e) openEvent(e);
        dx = dy = 0;
      }
    }
    const len = Math.hypot(dx, dy);
    const n = avatarNodes.get(online ? yourId : "self");
    if (len) {
      const speed = target ? 19 : 15;
      player.x = Math.max(5, Math.min(95, player.x + (dx / len) * dt * speed));
      player.y = Math.max(15, Math.min(88, player.y + (dy / len) * dt * speed));
      if (n) {
        placeAvatar(player, n);
        n.classList.add("walking");
      }
      if (time - lastSent > 65) {
        sendMove();
        lastSent = time;
      }
      if (time - lastStepSound > 370) {
        sound("step");
        lastStepSound = time;
      }
      updateNearby();
    } else n?.classList.remove("walking");
  } else avatarNodes.get(online ? yourId : "self")?.classList.remove("walking");
  const destination = $("destination");
  destination.hidden =
    !playing || !target || !!document.querySelector("dialog[open]");
  if (target) {
    destination.style.left = target.x + "%";
    destination.style.top = target.y + "%";
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
const invite = location.hash.startsWith("#room=") ? location.href : null;
if (invite) {
  $("room-code").value = invite;
  show("lobby-dialog");
}
if ("serviceWorker" in navigator && window.isSecureContext)
  navigator.serviceWorker.register("./sw.js").catch(() => {});
// Animated scenery stays decorative; historical episodes remain unchanged.
const scenery = document.createElement("div");
scenery.className = "living-campus";
scenery.setAttribute("aria-hidden", "true");
for (let i = 0; i < 22; i++) {
  const star = document.createElement("i");
  star.className = "night-mote";
  star.style.cssText = `--x:${(i * 37) % 100}%;--y:${(i * 23) % 95}%;--delay:${-i * 0.73}s;--duration:${5 + (i % 5)}s`;
  scenery.append(star);
}
for (let i = 0; i < 3; i++) {
  const npc = document.createElement("div");
  npc.className = "campus-colleague colleague-" + i;
  const img = document.createElement("img");
  img.src =
    i % 2 ? "./img/researcher-chibi.webp" : "./img/scientist-chibi.webp";
  img.alt = "";
  npc.append(img);
  scenery.append(npc);
}
document.querySelector(".campus").append(scenery);
document.querySelector(".campus").addEventListener("click", (e) => {
  if (
    e.target.closest("button") ||
    !playing ||
    document.querySelector("dialog[open]")
  )
    return;
  const r = e.currentTarget.getBoundingClientRect();
  target = {
    x: Math.max(5, Math.min(95, ((e.clientX - r.left) / r.width) * 100)),
    y: Math.max(15, Math.min(88, ((e.clientY - r.top) / r.height) * 100)),
  };
  if (reducedMotion()) {
    player.x = target.x;
    player.y = target.y;
    target = null;
    renderAvatars();
    sendMove();
    updateNearby();
  }
});

function ownTeam() {
  return room?.players.find((p) => p.id === yourId)?.team;
}
function useSoloCatalog() {
  EVENTS = SOLO_EVENTS;
  CHAPTERS = SOLO_CHAPTERS;
  document.body.classList.remove("race-mode");
  $("race-score").hidden = true;
}
function useRoomCatalog() {
  if (room?.mode !== "race") {
    EVENTS = SOLO_EVENTS;
    CHAPTERS = SOLO_CHAPTERS;
    return;
  }
  const team = ownTeam();
  if (!TEAMS[team]) return;
  EVENTS = missionsFor(team);
  CHAPTERS = [
    {
      year: TEAMS[team].name,
      title: "Le tue missioni",
      subtitle: TEAMS[team].subtitle,
    },
  ];
  chapter = 0;
  document.body.classList.add("race-mode");
  document.body.dataset.team = team;
}
function syncRoomProgress() {
  useRoomCatalog();
  progress = restoreProgress(
    room?.mode === "race" ? room.teamProgress[ownTeam()] : room?.progress,
  );
}
function renderRaceScore() {
  const score = $("race-score");
  score.hidden = room?.mode !== "race";
  if (score.hidden) {
    score.dataset.version = "";
    return;
  }
  const version = JSON.stringify([room.round, ownTeam(), room.scores]);
  if (score.dataset.version === version) return;
  score.dataset.version = version;
  score.replaceChildren();
  for (const team of ["personnel", "spies"]) {
    const state = room.scores[team],
      card = el(
        "div",
        "team-score " + team + (team === ownTeam() ? " yours" : ""),
      ),
      head = el("div", "score-heading"),
      bar = el("progress");
    head.append(
      el("strong", "", TEAMS[team].name + (team === ownTeam() ? " · tu" : "")),
      el("span", "", state.done + " / " + state.total),
    );
    bar.max = state.total;
    bar.value = state.done;
    bar.setAttribute("aria-label", "Missioni " + TEAMS[team].name);
    card.append(head, bar);
    score.append(card);
  }
}
function showVictory() {
  if (!room?.winner) return;
  const key = room.code + ":" + room.winner.round;
  if (shownWinnerRound === key) return;
  shownWinnerRound = key;
  activityCleanup();
  activeEvent = null;
  pending = false;
  clearTimeout(answerTimer);
  keys.clear();
  target = null;
  for (const d of document.querySelectorAll("dialog[open]")) d.close();
  const team = room.winner.team,
    own = ownTeam() === team;
  $("victory-title").textContent =
    team === "personnel" ? "Ha vinto il Personale" : "Hanno vinto le Spie";
  $("victory-dialog").dataset.winner = team;
  $("victory-kicker").textContent = own
    ? "VITTORIA DELLA TUA SQUADRA"
    : "PARTITA CONCLUSA";
  $("victory-copy").textContent =
    "La squadra " +
    TEAMS[team].name +
    " ha completato tutte le proprie missioni per prima. Il risultato è condiviso con tutti i giocatori.";
  const sec = Math.floor(room.winner.elapsedMs / 1000);
  $("victory-time").textContent =
    Math.floor(sec / 60) + " min " + String(sec % 60).padStart(2, "0") + " s";
  $("victory-scores").replaceChildren();
  for (const t of ["personnel", "spies"]) {
    const state = room.scores[t];
    $("victory-scores").append(
      el(
        "p",
        "",
        TEAMS[t].name + " · " + state.done + " / " + state.total + " missioni",
      ),
    );
  }
  $("rematch-button").hidden = yourId !== room.hostId;
  $("rematch-button").disabled = !["personnel", "spies"].every((t) =>
    room.players.some((p) => p.team === t),
  );
  $("victory-host-note").textContent =
    yourId === room.hostId
      ? "La rivincita mantiene le squadre e azzera le missioni."
      : "L’host può avviare una rivincita per tutti.";
  show("victory-dialog");
  sound("success");
}
$("victory-dialog").addEventListener("cancel", (e) => e.preventDefault());
$("rematch-button").onclick = () => send("rematch");
$("victory-menu").onclick = exit;
for (const b of $("team-picker").querySelectorAll("button"))
  b.onclick = () => send("choose_team", { team: b.dataset.team });

function renderSignaling() {
  const hosting = !!room && room.hostId === yourId;
  $("lobby-entry").hidden = !!room;
  $("lobby-waiting").hidden = !room;
  $("name-label").hidden = !!room;
  $("player-name").hidden = !!room;
  $("player-name").disabled = signalingBusy || !!room;
  $("room-code").disabled = signalingBusy;
  $("create-button").disabled = signalingBusy;
  $("join-button").disabled = signalingBusy;
  $("signal-panel").hidden = !hosting || !$("signal-output").value;
  $("copy-invite").hidden = !hosting;
  $("copy-invite").disabled = !$("signal-output").value;
  $("cancel-join").hidden = !signalingBusy;
  $("connection-status").dataset.busy = String(signalingBusy);
  const both = ["personnel", "spies"].every((t) =>
    room?.players.some((p) => p.team === t),
  );
  const step = signalingBusy ? "link" : both ? "ready" : "team";
  for (const item of document.querySelectorAll(".lobby-steps li")) {
    if (item.dataset.stage === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  }
}

function cue(node, kind) {
  if (!node || reducedMotion() || !node.animate) return;
  const frames = {
    enter: [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    arrival: [
      { opacity: 0.25, transform: "translateY(14px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    success: [
      { boxShadow: "0 0 0 0 #8bd5c200" },
      { boxShadow: "0 0 0 3px #8bd5c299", offset: 0.4 },
      { boxShadow: "0 0 0 0 #8bd5c200" },
    ],
    error: [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" },
    ],
  };
  const animation = node.animate(frames[kind], {
    duration: kind === "arrival" ? 650 : kind === "error" ? 220 : 420,
    easing: "ease-out",
  });
  activeCues.add(animation);
  animation.finished
    .catch(() => {})
    .finally(() => activeCues.delete(animation));
}

$("cancel-join").onclick = () => {
  disconnect();
  online = false;
  $("connection-status").textContent =
    "Collegamento annullato. Puoi riprovare.";
  renderSignaling();
  $("room-code").focus();
};
