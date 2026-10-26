import { freshProgress, attempt } from "./progress.js";
export class BrowserRoom {
  constructor(id, name, deliver) {
    this.hostId = id;
    this.code = id;
    this.started = false;
    this.progress = freshProgress();
    this.players = new Map();
    this.deliver = deliver;
    this.add(id, name);
  }
  snapshot() {
    return structuredClone({
      code: this.code,
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
    this.broadcast({ type: "room_update", room: this.snapshot() });
  }
  add(id, name) {
    if (this.players.size >= 8 || this.players.has(id)) return false;
    this.players.set(id, {
      id,
      name:
        typeof name === "string"
          ? name.trim().slice(0, 24) || "Ricercatore"
          : "Ricercatore",
      color: this.players.size,
      x: 49 + this.players.size * 2,
      y: 57,
    });
    this.emit(id, { type: "room_joined", room: this.snapshot(), yourId: id });
    this.update();
    if (this.started)
      this.emit(id, {
        type: "game_start",
        room: this.snapshot(),
        yourId: id,
        progress: this.progress,
      });
    return true;
  }
  remove(id) {
    this.players.delete(id);
    this.update();
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
      m.type === "start_game" &&
      id === this.hostId &&
      !this.started &&
      this.players.size >= 2
    ) {
      this.started = true;
      for (const p of this.players.keys())
        this.emit(p, {
          type: "game_start",
          room: this.snapshot(),
          yourId: p,
          progress: this.progress,
        });
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
