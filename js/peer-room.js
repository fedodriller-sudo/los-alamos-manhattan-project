import { TEAMS, missionsFor } from "./team-missions.js";
import { freshProgress, attempt, completedCount } from "./progress.js";
export class BrowserRoom {
  constructor(id, name, deliver, { mode = "coop", clock = Date.now } = {}) {
    this.mode = mode;
    this.clock = clock;
    this.round = 0;
    this.winner = null;
    this.startedAt = null;
    this.teamProgress = { personnel: freshProgress(), spies: freshProgress() };
    this.activities = new Map();
    this.hostId = id;
    this.code = id;
    this.started = false;
    this.progress = freshProgress();
    this.players = new Map();
    this.deliver = deliver;
    this.add(id, name);
  }
  snapshot(viewerId) {
    const team = this.players.get(viewerId)?.team;
    const scores = Object.fromEntries(
      ["personnel", "spies"].map((t) => [
        t,
        {
          done: completedCount(this.teamProgress[t], missionsFor(t)),
          total: missionsFor(t).length,
        },
      ]),
    );
    return structuredClone({
      code: this.code,
      mode: this.mode,
      round: this.round,
      winner: this.winner,
      teamProgress: team ? { [team]: this.teamProgress[team] } : {},
      scores,
      hostId: this.hostId,
      started: this.started,
      progress: this.progress,
      players: [...this.players.values()],
    });
  }
  emit(id, message) {
    this.deliver(id, structuredClone(message));
  }
  broadcast(message) {
    for (const id of this.players.keys()) this.emit(id, message);
  }
  update() {
    for (const id of this.players.keys())
      this.emit(id, { type: "room_update", room: this.snapshot(id) });
  }
  add(id, name) {
    if (this.players.size >= 8 || this.players.has(id)) return false;
    this.players.set(id, {
      id,
      name:
        typeof name === "string"
          ? name.trim().slice(0, 24) || "Ricercatore"
          : "Ricercatore",
      team: this.mode === "race" ? this.nextTeam() : null,
      color: this.players.size,
      x: 49 + this.players.size * 2,
      y: 57,
    });
    this.emit(id, { type: "room_joined", room: this.snapshot(id), yourId: id });
    this.update();
    if (this.started)
      this.emit(id, {
        type: "game_start",
        room: this.snapshot(id),
        yourId: id,
        progress: this.progress,
      });
    return true;
  }
  remove(id) {
    this.players.delete(id);
    this.update();
  }
  nextTeam() {
    const counts = { personnel: 0, spies: 0 };
    for (const p of this.players.values()) if (p.team) counts[p.team]++;
    return counts.personnel <= counts.spies ? "personnel" : "spies";
  }
  bothTeams() {
    return ["personnel", "spies"].every((t) =>
      [...this.players.values()].some((p) => p.team === t),
    );
  }
  startRound() {
    this.started = true;
    this.round++;
    this.startedAt = this.clock();
    for (const id of this.players.keys())
      this.emit(id, {
        type: "game_start",
        room: this.snapshot(id),
        yourId: id,
        progress: this.progress,
      });
  }
  raceAnswer(id, m) {
    if (m.round !== this.round) return;
    const team = this.players.get(id).team,
      events = missionsFor(team),
      p = this.teamProgress[team];
    const event = events.find((e) => e.id === m.eventId);
    if (!event || this.winner) return;
    const n = p.steps[event.id] || 0;
    let result;
    const key = team + ":" + event.id + ":" + n;
    const step = event.steps[n];
    if (m.step !== n) result = { ok: false, reason: "stale" };
    else if (
      step?.minDuration &&
      (!this.activities.has(key) ||
        this.clock() - this.activities.get(key) < step.minDuration)
    )
      result = {
        ok: false,
        reason: "activity",
        hint: "Completa prima l’attività sul banco.",
      };
    else result = attempt(p, event.id, m.choice, events);
    this.emit(id, {
      type: "answer_result",
      eventId: event.id,
      team,
      progress: p,
      ...result,
    });
    if (!result.ok) return;
    this.activities.delete(key);
    if (completedCount(p, events) === events.length) {
      this.winner = {
        team,
        round: this.round,
        elapsedMs: Math.max(0, this.clock() - this.startedAt),
      };
    }
    for (const viewer of this.players.keys()) {
      const same = this.players.get(viewer).team === team;
      this.emit(viewer, {
        type: "race_progress",
        ...(same
          ? { team, eventId: event.id, by: this.players.get(id).name }
          : {}),
        room: this.snapshot(viewer),
      });
    }
    if (this.winner)
      for (const viewer of this.players.keys())
        this.emit(viewer, {
          type: "game_over",
          winner: this.winner,
          room: this.snapshot(viewer),
        });
  }
  handle(id, m) {
    if (
      !this.players.has(id) ||
      !m ||
      typeof m !== "object" ||
      Array.isArray(m)
    )
      return;
    if (
      this.mode === "race" &&
      m.type === "choose_team" &&
      !this.started &&
      typeof m.team === "string" &&
      Object.hasOwn(TEAMS, m.team)
    ) {
      this.players.get(id).team = m.team;
      this.update();
      return;
    }
    if (
      m.type === "rematch" &&
      this.mode === "race" &&
      id === this.hostId &&
      this.winner &&
      this.bothTeams()
    ) {
      this.teamProgress = {
        personnel: freshProgress(),
        spies: freshProgress(),
      };
      this.winner = null;
      this.activities.clear();
      this.startRound();
      return;
    }
    if (
      m.type === "start_game" &&
      id === this.hostId &&
      !this.started &&
      this.players.size >= 2 &&
      (this.mode !== "race" || this.bothTeams())
    )
      this.startRound();
    if (
      this.mode === "race" &&
      m.type === "activity_begin" &&
      m.round === this.round &&
      typeof m.eventId === "string" &&
      this.started &&
      !this.winner
    ) {
      const team = this.players.get(id).team,
        p = this.teamProgress[team],
        event = missionsFor(team).find((e) => e.id === m.eventId),
        n = p.steps[m.eventId] || 0;
      if (event && m.step === n && event.steps[n]?.minDuration) {
        const key = team + ":" + event.id + ":" + n;
        if (!this.activities.has(key)) this.activities.set(key, this.clock());
      }
      return;
    }
    if (this.mode === "race" && m.type === "answer" && this.started) {
      this.raceAnswer(id, m);
      return;
    }
    if (
      m.type === "move" &&
      this.started &&
      Number.isFinite(m.x) &&
      Number.isFinite(m.y)
    ) {
      const p = this.players.get(id);
      p.x = Math.max(5, Math.min(95, m.x));
      p.y = Math.max(15, Math.min(88, m.y));
      this.broadcast({ type: "player_move", id, x: p.x, y: p.y });
    }
    if (m.type === "answer" && this.started && typeof m.eventId === "string") {
      if (m.step !== (this.progress.steps[m.eventId] || 0)) {
        this.emit(id, {
          type: "answer_result",
          eventId: m.eventId,
          ok: false,
          reason: "stale",
          progress: this.progress,
        });
        return;
      }
      const result = attempt(this.progress, m.eventId, m.choice);
      this.emit(id, {
        type: "answer_result",
        eventId: m.eventId,
        ...result,
        progress: this.progress,
      });
      if (result.ok)
        this.broadcast({
          type: "progress",
          eventId: m.eventId,
          by: this.players.get(id).name,
          progress: this.progress,
        });
    }
    if (m.type === "gather" && this.started)
      this.broadcast({ type: "gather", by: this.players.get(id).name });
  }
}
