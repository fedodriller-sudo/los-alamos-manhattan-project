/** Los Alamos co-op: one HTTP/WebSocket origin, no external services. */
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { readFileSync, statSync } from "node:fs";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { networkInterfaces } from "node:os";
import { freshProgress, attempt } from "../js/progress.js";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};
const id = () => randomBytes(8).toString("hex");
const cleanName = (n) =>
  (typeof n === "string" ? n : "Ricercatore").trim().slice(0, 24) ||
  "Ricercatore";
export async function startServer({
  port = Number(process.env.PORT) || 8765,
  host = process.env.HOST || "0.0.0.0",
} = {}) {
  const rooms = new Map();
  const send = (ws, type, payload = {}) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type, ...payload }));
  };
  const publicRoom = (r) => ({
    code: r.code,
    hostId: r.hostId,
    started: r.started,
    progress: r.progress,
    players: [...r.players.values()].map(({ ws, ...p }) => p),
  });
  const broadcast = (r, type, payload = {}) => {
    for (const p of r.players.values()) send(p.ws, type, payload);
  };
  const update = (r) => broadcast(r, "room_update", { room: publicRoom(r) });
  function leave(ws) {
    const r = rooms.get(ws.roomCode);
    if (!r) return;
    r.players.delete(ws.playerId);
    ws.roomCode = null;
    ws.playerId = null;
    if (!r.players.size) {
      rooms.delete(r.code);
      return;
    }
    if (!r.players.has(r.hostId)) r.hostId = r.players.keys().next().value;
    update(r);
  }
  function add(r, ws, name) {
    const used = new Set([...r.players.values()].map((p) => p.color));
    let color = 0;
    while (used.has(color)) color++;
    const p = {
      id: id(),
      name: cleanName(name),
      color,
      x: 49 + color * 1.5,
      y: 57,
      ws,
    };
    r.players.set(p.id, p);
    ws.roomCode = r.code;
    ws.playerId = p.id;
    if (!r.hostId) r.hostId = p.id;
    send(ws, "room_joined", { yourId: p.id, room: publicRoom(r) });
    for (const other of r.players.values())
      if (other.id !== p.id)
        send(other.ws, "room_update", { room: publicRoom(r) });
  }
  const http = createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    let path;
    try {
      path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (path === "/") path = "/index.html";
    // Explicit public surface: never expose Git, server, dependency or working files.
    if (
      !/^\/(index\.html|manifest\.webmanifest|sw\.js|(?:css|js|img|icons)\/[a-zA-Z0-9_./-]+)$/.test(
        path,
      ) ||
      path.split("/").some((s) => s === ".." || s.startsWith("."))
    ) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = resolve(ROOT, "." + path);
    try {
      if (!file.startsWith(ROOT + sep) || !statSync(file).isFile())
        throw Error();
      const data = readFileSync(file);
      res.writeHead(200, {
        "Content-Type": MIME[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "same-origin",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  const wss = new WebSocketServer({
    server: http,
    maxPayload: 4096,
    verifyClient: ({ origin, req }) =>
      !origin ||
      origin === `http://${req.headers.host}` ||
      origin === `https://${req.headers.host}`,
  });
  wss.on("error", () => {});
  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));
    let windowStart = Date.now(),
      count = 0;
    send(ws, "hello", { version: 1 });
    ws.on("message", (raw) => {
      if (Date.now() - windowStart > 1000) {
        windowStart = Date.now();
        count = 0;
      }
      if (++count > 80) {
        ws.close(1008, "Too many messages");
        return;
      }
      let m;
      try {
        m = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (!m || typeof m !== "object") return;
      const error = (message) => send(ws, "error", { message });
      if (m.type === "leave_room") {
        leave(ws);
        return;
      }
      if (
        (m.type === "create_room" || m.type === "join_room") &&
        m.name !== undefined &&
        typeof m.name !== "string"
      )
        return error("Il nome deve essere un testo.");
      if (m.type === "join_room" && typeof m.code !== "string")
        return error("Il codice deve essere un testo.");
      if (
        m.type === "answer" &&
        (typeof m.eventId !== "string" ||
          !Number.isInteger(m.step) ||
          !(
            Number.isInteger(m.choice) ||
            (Array.isArray(m.choice) &&
              m.choice.length <= 6 &&
              m.choice.every(Number.isInteger))
          ))
      )
        return error("Risposta non valida.");
      if (m.type === "create_room") {
        if (rooms.size >= 100)
          return error("Troppe stanze: riprova più tardi.");
        leave(ws);
        let code;
        do {
          code = randomBytes(3).toString("hex").toUpperCase();
        } while (rooms.has(code));
        const r = {
          code,
          hostId: null,
          started: false,
          progress: freshProgress(),
          players: new Map(),
          created: Date.now(),
        };
        rooms.set(code, r);
        add(r, ws, m.name);
        return;
      }
      if (m.type === "join_room") {
        const r = rooms.get(m.code.trim().toUpperCase());
        if (!r)
          return error(
            "Stanza non trovata. Controlla il codice e l’indirizzo del server.",
          );
        if (ws.roomCode === r.code && r.players.has(ws.playerId)) {
          send(ws, "room_joined", { yourId: ws.playerId, room: publicRoom(r) });
          if (r.started)
            send(ws, "game_start", {
              yourId: ws.playerId,
              room: publicRoom(r),
            });
          return;
        }
        if (r.players.size >= 8)
          return error("La stanza è piena (massimo 8 persone).");
        leave(ws);
        add(r, ws, m.name);
        if (r.started)
          send(ws, "game_start", { yourId: ws.playerId, room: publicRoom(r) });
        return;
      }
      const r = rooms.get(ws.roomCode),
        p = r?.players.get(ws.playerId);
      if (!p) return;
      if (m.type === "start_game") {
        if (r.hostId !== p.id)
          return error("Solo l’host può avviare il turno.");
        if (r.started) return;
        if (r.players.size < 2)
          return error(
            "Aspetta almeno un’altra persona. Puoi aprire una seconda scheda per provare.",
          );
        r.started = true;
        for (const player of r.players.values())
          send(player.ws, "game_start", {
            yourId: player.id,
            room: publicRoom(r),
          });
        return;
      }
      if (!r.started) return;
      if (m.type === "move") {
        if (!Number.isFinite(m.x) || !Number.isFinite(m.y)) return;
        p.x = Math.max(5, Math.min(95, m.x));
        p.y = Math.max(15, Math.min(88, m.y));
        broadcast(r, "player_move", { id: p.id, x: p.x, y: p.y });
        return;
      }
      if (m.type === "answer") {
        const n = r.progress.steps[m.eventId] || 0;
        if (m.step !== n) {
          send(ws, "answer_result", {
            ok: false,
            reason: "stale",
            progress: r.progress,
          });
          return;
        }
        const result = attempt(r.progress, m.eventId, m.choice);
        send(ws, "answer_result", {
          ...result,
          progress: r.progress,
          eventId: m.eventId,
        });
        if (result.ok)
          broadcast(r, "progress", {
            progress: r.progress,
            eventId: m.eventId,
            by: p.name,
          });
        return;
      }
      if (m.type === "gather") broadcast(r, "gather", { by: p.name });
    });
    ws.on("close", () => leave(ws));
    ws.on("error", () => {});
  });
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
    for (const r of rooms.values())
      if (Date.now() - r.created > 6 * 3600000) {
        for (const p of r.players.values()) p.ws.close(1000, "Session expired");
        rooms.delete(r.code);
      }
  }, 30000);
  try {
    await new Promise((yes, no) => {
      http.once("error", no);
      http.listen(port, host, yes);
    });
  } catch (error) {
    clearInterval(heartbeat);
    wss.close();
    throw error;
  }
  const bound = http.address().port;
  return {
    httpUrl: `http://127.0.0.1:${bound}`,
    wsUrl: `ws://127.0.0.1:${bound}`,
    close: () =>
      new Promise((done) => {
        clearInterval(heartbeat);
        for (const ws of wss.clients) ws.terminate();
        wss.close();
        http.close(done);
      }),
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  startServer()
    .then((server) => {
      console.log(`Los Alamos → ${server.httpUrl}`);
      for (const list of Object.values(networkInterfaces()))
        for (const net of list || [])
          if (net.family === "IPv4" && !net.internal)
            console.log(
              `Rete locale → http://${net.address}:${new URL(server.httpUrl).port}`,
            );
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
