/** WebSocket multigiocatore (richiede server Node: cd server && npm start) */
(function () {
  let ws = null;
  let connected = false;
  let roomCode = null;
  let playerId = null;
  const handlers = {};

  function wsUrl() {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${location.host}`;
  }

  function on(type, fn) {
    handlers[type] = fn;
  }

  function emit(type, data) {
    handlers[type]?.(data);
  }

  function send(type, payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type, ...payload }));
  }

  function connect() {
    return new Promise((resolve, reject) => {
      if (ws && connected) {
        resolve();
        return;
      }
      ws = new WebSocket(wsUrl());
      ws.addEventListener("open", () => {
        connected = true;
        resolve();
      });
      ws.addEventListener("error", () => {
        reject(new Error("Connessione fallita"));
      });
      ws.addEventListener("close", () => {
        connected = false;
        roomCode = null;
        emit("disconnected", {});
      });
      ws.addEventListener("message", (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        const t = msg.type;
        if (t === "room_joined") {
          roomCode = msg.room?.code;
          playerId = msg.yourId;
        }
        if (t === "game_start") {
          playerId = msg.yourId || playerId;
        }
        emit(t, msg);
      });
    });
  }

  function createRoom() {
    return connect().then(() => send("create_room", {}));
  }

  function joinRoom(code, name) {
    return connect().then(() => send("join_room", { code, name }));
  }

  function setName(name) {
    send("set_name", { name });
  }

  function startGame() {
    send("start_game", {});
  }

  function sendMove(x, y) {
    send("move", { x, y });
  }

  function sendTaskComplete(taskId) {
    send("complete_task", { taskId });
  }

  function sendSpyIntel(payload) {
    send("spy_intel", payload);
  }

  function callMeeting() {
    send("call_meeting", {});
  }

  function castVote(targetId) {
    send("cast_vote", { targetId });
  }

  window.MP_NET = {
    on,
    connect,
    createRoom,
    joinRoom,
    setName,
    startGame,
    sendMove,
    sendTaskComplete,
    sendSpyIntel,
    callMeeting,
    castVote,
    getPlayerId: () => playerId,
    getRoomCode: () => roomCode,
    isConnected: () => connected,
  };
})();
