/**
 * Server statico + WebSocket per multigiocatore (stanze con codice).
 * Avvio: cd server && npm install && npm start
 */
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { readFileSync, existsSync, statSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { randomBytes, randomInt } from "crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 8765;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

/** @type {Map<string, Room>} */
const rooms = new Map();

function genCode() {
  let code;
  do {
    code = randomBytes(3).toString("hex").toUpperCase();
  } while (rooms.has(code));
  return code;
}

function genId() {
  return randomBytes(8).toString("hex");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createRoom(hostWs) {
  const code = genCode();
  const hostId = genId();
  const room = {
    code,
    hostId,
    started: false,
    completed: new Set(),
    players: new Map(),
    meeting: null,
    gameOver: null,
  };
  rooms.set(code, room);
  addPlayer(room, hostWs, hostId, "Host", true);
  return room;
}

function addPlayer(room, ws, id, name, isHost) {
  const player = {
    id,
    ws,
    name: name.slice(0, 24) || "Scienziato",
    x: 45 + randomInt(10),
    y: 60 + randomInt(8),
    role: null,
    isHost: !!isHost,
    intel: { stolenAt: [], stash: [], dispatch: 0, hubDone: [] },
    alive: true,
  };
  room.players.set(id, player);
  ws.roomCode = room.code;
  ws.playerId = id;
  return player;
}

function roomPublic(room) {
  return {
    code: room.code,
    started: room.started,
    hostId: room.hostId,
    completed: [...room.completed],
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      isHost: p.isHost,
      alive: p.alive !== false,
    })),
    gameOver: room.gameOver,
  };
}

function alivePlayers(room) {
  return [...room.players.values()].filter((p) => p.alive);
}

function computeSpyCount(n) {
  if (n < 3) return 0;
  const spies = Math.round(n * 0.3);
  return Math.min(n - 1, Math.max(1, spies));
}

function checkWinCondition(room) {
  const alive = alivePlayers(room);
  const spies = alive.filter((p) => p.role === "spy").length;
  const staff = alive.length - spies;
  if (spies === 0 && room.started) {
    return { winner: "crew", reason: "Tutte le spie sono state eliminate." };
  }
  if (staff === 0 && spies > 0) {
    return { winner: "spy", reason: "Le spie controllano la stanza." };
  }
  return null;
}

function endGame(room, result) {
  room.gameOver = result;
  for (const [, p] of room.players) {
    send(p.ws, "game_over", { ...result, room: roomPublic(room) });
  }
}

function startMeeting(room, callerId) {
  if (room.meeting || room.gameOver) return false;
  const alive = alivePlayers(room);
  if (alive.length < 2) return false;
  room.meeting = { callerId, votes: new Map() };
  const roster = alive.map((p) => ({ id: p.id, name: p.name }));
  for (const p of alive) {
    send(p.ws, "meeting_start", { roster, callerId, yourId: p.id });
  }
  return true;
}

function resolveMeeting(room) {
  const meeting = room.meeting;
  if (!meeting) return;
  const tally = new Map();
  for (const [, target] of meeting.votes) {
    const key = target || "skip";
    tally.set(key, (tally.get(key) || 0) + 1);
  }
  let best = "skip";
  let bestN = 0;
  let tie = false;
  for (const [k, n] of tally) {
    if (n > bestN) {
      bestN = n;
      best = k;
      tie = false;
    } else if (n === bestN && n > 0) {
      tie = true;
    }
  }
  let ejected = null;
  let revealedRole = null;
  if (!tie && best !== "skip" && bestN > 0) {
    const p = room.players.get(best);
    if (p && p.alive) {
      p.alive = false;
      ejected = { id: p.id, name: p.name };
      revealedRole = p.role;
    }
  }
  room.meeting = null;
  const payload = {
    ejected,
    revealedRole,
    tally: Object.fromEntries(tally),
    room: roomPublic(room),
  };
  for (const [, p] of room.players) {
    send(p.ws, "meeting_result", payload);
  }
  const win = checkWinCondition(room);
  if (win) endGame(room, win);
}

function send(ws, type, payload) {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify({ type, ...payload }));
}

function broadcastRoom(room, type, payload, exceptId) {
  for (const [id, p] of room.players) {
    if (id !== exceptId) send(p.ws, type, payload);
  }
}

function removePlayer(ws) {
  const code = ws.roomCode;
  const id = ws.playerId;
  if (!code || !rooms.has(code)) return;
  const room = rooms.get(code);
  room.players.delete(id);
  if (room.players.size === 0) {
    rooms.delete(code);
    return;
  }
  if (room.hostId === id) {
    const next = room.players.values().next().value;
    if (next) {
      room.hostId = next.id;
      next.isHost = true;
    }
  }
  broadcastRoom(room, "room_update", { room: roomPublic(room) });
}

function assignRoles(room) {
  const ids = shuffle([...room.players.keys()]);
  const n = ids.length;
  const spyCount = computeSpyCount(n);
  ids.forEach((pid, i) => {
    const p = room.players.get(pid);
    p.role = i < spyCount ? "spy" : "staff";
    p.alive = true;
  });
}

function startGame(room) {
  if (room.started || room.players.size < 3) return false;
  assignRoles(room);
  room.started = true;
  for (const [id, p] of room.players) {
    send(p.ws, "game_start", {
      role: p.role,
      room: roomPublic(room),
      yourId: id,
    });
  }
  return true;
}

function staticHandler(req, res) {
  let path = req.url?.split("?")[0] || "/";
  if (path === "/") path = "/index.html";
  const filePath = join(ROOT, path);
  if (!filePath.startsWith(ROOT) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = extname(filePath);
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(readFileSync(filePath));
}

const httpServer = createServer(staticHandler);
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  send(ws, "hello", { ok: true });

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    const type = msg.type;

    if (type === "create_room") {
      const room = createRoom(ws);
      send(ws, "room_joined", { room: roomPublic(room), yourId: ws.playerId, created: true });
      return;
    }

    if (type === "join_room") {
      const code = String(msg.code || "").toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) {
        send(ws, "error", { message: "Stanza non trovata. Controlla il codice." });
        return;
      }
      if (room.started) {
        send(ws, "error", { message: "Partita già iniziata. Crea una nuova stanza." });
        return;
      }
      const id = genId();
      const name = String(msg.name || "Scienziato");
      addPlayer(room, ws, id, name, false);
      send(ws, "room_joined", { room: roomPublic(room), yourId: id, created: false });
      broadcastRoom(room, "room_update", { room: roomPublic(room) }, id);
      return;
    }

    const room = rooms.get(ws.roomCode);
    if (!room) return;
    const player = room.players.get(ws.playerId);
    if (!player) return;

    if (type === "set_name") {
      player.name = String(msg.name || player.name).slice(0, 24);
      broadcastRoom(room, "room_update", { room: roomPublic(room) });
      return;
    }

    if (type === "start_game") {
      if (room.hostId !== ws.playerId) {
        send(ws, "error", { message: "Solo l'host può avviare la partita." });
        return;
      }
      if (!startGame(room)) {
        send(ws, "error", { message: "Servono almeno 3 giocatori (30% spie, voti in riunione)." });
      }
      return;
    }

    if (!room.started) return;

    if (type === "call_meeting") {
      if (!player.alive) return;
      if (!startMeeting(room, player.id)) {
        send(ws, "error", { message: "Riunione non disponibile ora." });
      }
      return;
    }

    if (type === "cast_vote") {
      if (!room.meeting || !player.alive) return;
      const targetId = msg.targetId === "skip" ? "skip" : String(msg.targetId || "skip");
      room.meeting.votes.set(player.id, targetId);
      if (room.meeting.votes.size >= alivePlayers(room).length) {
        resolveMeeting(room);
      }
      return;
    }

    if (type === "move") {
      if (!player.alive || room.meeting) return;
      player.x = Math.max(3, Math.min(97, Number(msg.x) || player.x));
      player.y = Math.max(3, Math.min(97, Number(msg.y) || player.y));
      broadcastRoom(
        room,
        "player_move",
        { id: player.id, x: player.x, y: player.y },
        player.id
      );
      return;
    }

    if (type === "complete_task") {
      if (player.role !== "staff") return;
      const taskId = String(msg.taskId || "");
      if (!taskId) return;
      room.completed.add(taskId);
      broadcastRoom(room, "task_done", { taskId, completed: [...room.completed] });
      return;
    }

    if (type === "spy_intel") {
      if (player.role !== "spy") return;
      const action = msg.action;
      if (action === "steal_site" && msg.locId) {
        if (!player.intel.stolenAt.includes(msg.locId)) player.intel.stolenAt.push(msg.locId);
        if (msg.label) player.intel.stash.push({ place: msg.place, label: msg.label });
      }
      if (action === "hub" && msg.taskId) {
        if (!player.intel.hubDone.includes(msg.taskId)) player.intel.hubDone.push(msg.taskId);
        if (msg.label) player.intel.stash.push({ place: msg.place, label: msg.label });
      }
      if (action === "dispatch" && player.intel.stash.length > 0) {
        player.intel.stash.shift();
        player.intel.dispatch += 1;
      }
      send(ws, "spy_state", { intel: player.intel });
      return;
    }
  });

  ws.on("close", () => removePlayer(ws));
});

httpServer.listen(PORT, () => {
  console.log(`Manhattan Project — online: http://127.0.0.1:${PORT}`);
  console.log("Multigiocatore WebSocket sulla stessa porta.");
});
