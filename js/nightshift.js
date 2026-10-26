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
  $("toast").textContent = text;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 4500);
}
function sound(kind = "tap") {
  if (!prefs.sound) return;
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
  document.body.classList.toggle("reduce-motion", prefs.motion);
  $("sound-toggle").checked = prefs.sound;
  $("motion-toggle").checked = prefs.motion;
  $("volume").value = prefs.volume;
  if (master) master.gain.value = (prefs.volume / 100) * 0.18;
  write(PREFS, prefs);
}
applyPrefs();
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
    p.color % 2 ? "img/researcher-chibi.png" : "img/scientist-chibi.png";
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
  $("mission-list").replaceChildren();
  const missions = EVENTS.filter((e) => e.chapter === chapter);
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
    b.append(
      el(
        "small",
        "",
        isDone(e) ? "Nel diario · rileggi" : e.kind + " · " + e.duration,
      ),
    );
    b.onclick = () => selectEvent(e);
    li.append(b);
    $("mission-list").append(li);
  });
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
  if (url.hash.startsWith("#join=")) url.hash = "";
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
  if (prefs.motion) {
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
  $("nearby-name").textContent = target?.eventId
    ? "Verso " +
      PLACES.find(
        (p) => p.id === EVENTS.find((e) => e.id === target.eventId).place,
      ).name
    : near
      ? n.p.name
      : completedCount(progress) === EVENTS.length
        ? "Tutte le storie nel diario"
        : "Scegli una storia nel dossier";
  $("interact-button").textContent = target?.eventId
    ? "In cammino…"
    : near
      ? "Interagisci [E]"
      : completedCount(progress) === EVENTS.length
        ? "Apri il diario"
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
  activityCleanup();
  activityCleanup = () => {};
  const e = EVENTS.find((e) => e.id === activeEvent);
  if (!e) return;
  $("event-date").textContent = e.date;
  $("event-kind").textContent =
    e.kind + " · " + PLACES.find((p) => p.id === e.place).name;
  $("event-title").textContent = e.title;
  $("event-intro").textContent = e.intro;
  const content = $("event-content");
  content.replaceChildren();
  const n = progress.steps[e.id] || 0;
  $("event-hint").hidden = n >= e.steps.length;
  if (n >= e.steps.length) {
    content.append(
      el("span", "event-complete", "Episodio aggiunto al diario"),
      factContent(e),
    );
    const next = EVENTS.find(
      (v) => !isDone(v) && chapterUnlocked(progress, v.chapter),
    );
    const b = el(
      "button",
      "button gold full",
      next ? "Prossima storia →" : "Apri il diario completo",
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
    return;
  }
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
    renderSequence(e, n, s, content);
    if (document.activeElement === document.body)
      question.focus({ preventScroll: true });
    return;
  }
  s.options.forEach((label, i) => {
    const b = el("button", "answer");
    b.disabled = pending;
    b.append(
      el("span", "", String.fromCharCode(65 + i)),
      document.createTextNode(label),
    );
    b.onclick = () => submitAnswer(e, n, i);
    content.append(b);
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
      b.disabled = pending || order.includes(i);
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
    check.disabled = pending || order.length !== 3;
    reset.disabled = pending || order.length === 0;
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
function updateProgress(p, eventId, by) {
  const previousActiveStep = activeEvent ? progress.steps[activeEvent] : null;
  const before = completedCount(progress);
  progress = restoreProgress(p);
  persist();
  const after = completedCount(progress);
  if (after > before) {
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
    renderEvent();
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
}
function renderLobby() {
  if (!room) return;
  $("lobby-entry").hidden = true;
  $("lobby-waiting").hidden = false;
  $("code-display").textContent = room.players.length + " / 8 ricercatori";
  $("copy-invite").hidden = room.hostId !== yourId;
  $("cancel-invites").hidden = room.hostId !== yourId;
  $("accept-answer").hidden = room.hostId !== yourId;
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
  $("start-button").disabled = !host || room.players.length < 2 || !both;
  $("start-button").textContent = room.started
    ? "Rientra nel turno"
    : host
      ? "Avvia il turno"
      : "In attesa dell’host";
  $("host-help").textContent =
    room.players.length < 2 || !both
      ? "Serve almeno una persona per squadra. Scegliete Personale e Spie."
      : host
        ? "La squadra è pronta. Puoi avviare."
        : "L’host avvierà il turno per tutti.";
  $("player-name").disabled = true;
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
      "Collegato direttamente al browser host.";
    return;
  }
  if (m.type === "room_update") {
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
    clearTimeout(answerTimer);
    pending = false;
    updateProgress(m.progress, m.eventId);
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
function newSession() {
  disconnect();
  const session = new PeerSession($("player-name").value, receive, () => {
    clearTimeout(answerTimer);
    pending = false;
    renderEvent();
    toast("L’host si è scollegato. Chiedi un nuovo invito per ricominciare.");
    $("connection-status").textContent =
      "Collegamento chiuso. Crea o accetta un nuovo invito.";
  });
  ws = session;
  return session;
}
let signalingBusy = false;
async function signalAction(action) {
  if (signalingBusy) return;
  signalingBusy = true;
  const buttons = [
    "create-button",
    "join-button",
    "copy-invite",
    "accept-answer",
  ];
  for (const id of buttons) $(id).disabled = true;
  try {
    $("signal-output").value = "";
    $("connection-status").textContent = "Preparazione collegamento…";
    await action();
  } catch (e) {
    $("connection-status").textContent = e.message;
  } finally {
    signalingBusy = false;
    for (const id of buttons) $(id).disabled = false;
  }
}
$("copy-signal").onclick = async () => {
  const output = $("signal-output");
  if (!output.value) {
    toast("Genera prima un invito o una risposta.");
    return;
  }
  try {
    await navigator.clipboard.writeText(output.value);
    toast("Copiato. Condividilo con il collega.");
  } catch {
    output.focus();
    output.select();
    toast("Testo selezionato: copialo e condividilo con il collega.");
  }
};
$("coop-button").onclick = () => {
  $("player-name").disabled = false;
  $("lobby-entry").hidden = false;
  $("lobby-waiting").hidden = true;
  show("lobby-dialog");
};
$("create-button").onclick = () => {
  newSession().host();
  $("connection-status").textContent =
    "Stanza creata. Genera un invito per ogni collega.";
};
$("lobby-form").onsubmit = (e) => {
  e.preventDefault();
  signalAction(async () => {
    const session = newSession();
    const answer = await session.join($("room-code").value);
    $("signal-output").value = answer;
    $("connection-status").textContent =
      "Invia questa risposta all’host e attendi il collegamento.";
  });
};
$("accept-answer").onclick = () =>
  signalAction(async () => {
    await ws.accept($("signal-input").value);
    $("connection-status").textContent =
      "Risposta accettata. Collegamento in corso…";
  });
$("start-button").onclick = () => {
  if (room?.started) begin();
  else send("start_game");
};
async function copyInvite() {
  await signalAction(async () => {
    const token = await ws.invite();
    const url = new URL(location.href);
    url.search = "";
    url.hash = "join=" + token;
    $("signal-output").value = url.href;
    $("connection-status").textContent =
      "Invito pronto. Copialo e invialo a una sola persona; poi incolla qui la sua risposta.";
    try {
      await navigator.clipboard.writeText(url.href);
    } catch {
      /* Text remains selectable. */
    }
  });
}
$("cancel-invites").onclick = () => {
  ws?.cancelInvites();
  $("signal-output").value = "";
  $("connection-status").textContent =
    "Inviti pendenti annullati. I colleghi già collegati restano in partita.";
};
$("copy-invite").onclick = copyInvite;
$("invite-button").onclick = () => show("lobby-dialog");
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
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
const invite = location.hash.startsWith("#join=")
  ? location.hash.slice(6)
  : null;
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
  img.src = i % 2 ? "./img/researcher-chibi.png" : "./img/scientist-chibi.png";
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
  if (score.hidden) return;
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
