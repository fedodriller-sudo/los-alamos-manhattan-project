(function () {
  const {
    ROLES,
    LOCATIONS,
    allTasks,
    WIN_TASK_COUNT,
    CRITICAL_TASK_IDS,
    MEETING_QUOTES,
    criticalTasksComplete,
    SPY_INTEL_TASKS,
    SPY_DISPATCH_WIN,
  } = window.MP_DATA;

  const MAP_SRC = "img/los-alamos-site.svg";
  const { readSave, writeSave, clearSave, hasSave, formatResumeSummary } = window.MP_SAVE;

  const state = {
    completed: new Set(),
    currentTask: null,
    role: "staff",
    intelCount: 0,
    intelStash: [],
    stolenAt: new Set(),
    spyIntelDone: new Set(),
    nearbyLoc: null,
    inGame: false,
    playerX: 3.2,
    playerY: 54.5,
    online: false,
    isHost: false,
    remotePlayers: new Map(),
    alive: true,
    meetingActive: false,
    meetingVoted: false,
    onlinePlayers: [],
  };

  function resetProgress(role) {
    state.role = role;
    state.completed = new Set();
    state.currentTask = null;
    state.intelCount = 0;
    state.intelStash = [];
    state.stolenAt = new Set();
    state.spyIntelDone = new Set();
    const sp = window.MP_ROAD?.SPAWN ?? { x: 3.2, y: 54.5 };
    state.playerX = sp.x;
    state.playerY = sp.y;
    document.getElementById("win-banner")?.classList.add("hidden");
    document.getElementById("lose-banner")?.classList.add("hidden");
  }

  function snapshotForSave() {
    const pos = window.MP_PLAYER?.getPos?.() || { x: state.playerX, y: state.playerY };
    return {
      version: window.MP_SAVE.SAVE_VERSION,
      savedAt: Date.now(),
      role: state.role,
      completed: [...state.completed],
      intelCount: state.intelCount,
      intelStash: state.intelStash.slice(),
      stolenAt: [...state.stolenAt],
      spyIntelDone: [...state.spyIntelDone],
      playerX: pos.x,
      playerY: pos.y,
      spyDispatchWin: SPY_DISPATCH_WIN,
    };
  }

  function applySnapshot(data) {
    state.role = data.role;
    state.completed = new Set(data.completed || []);
    state.intelCount = data.intelCount || 0;
    state.intelStash = Array.isArray(data.intelStash) ? data.intelStash.slice() : [];
    state.stolenAt = new Set(data.stolenAt || []);
    state.spyIntelDone = new Set(data.spyIntelDone || []);
    state.playerX = data.playerX ?? 50;
    state.playerY = data.playerY ?? 65;
  }

  function persistGame() {
    if (!state.inGame || state.online) return;
    writeSave(snapshotForSave());
    updateResumePanel();
  }

  function isOnline() {
    return state.online;
  }

  const MISSION_THEME_FALLBACK = "technical";

  function setMissionTheme(theme) {
    const card = document.getElementById("task-modal-card");
    if (!card) return;
    const t = theme || MISSION_THEME_FALLBACK;
    card.dataset.missionTheme = t;
  }

  function setOnlineHud() {
    const badge = document.getElementById("online-badge");
    const codeBadge = document.getElementById("room-code-badge");
    if (badge) badge.classList.toggle("hidden", !state.online);
    if (codeBadge) {
      codeBadge.classList.toggle("hidden", !state.online);
      if (state.online) codeBadge.textContent = `Stanza ${window.MP_NET?.getRoomCode?.() || ""}`;
    }
  }

  function renderRemotePlayers() {
    const layer = document.getElementById("remote-players");
    if (!layer) return;
    layer.innerHTML = "";
    const myId = window.MP_NET?.getPlayerId?.();
    for (const [id, p] of state.remotePlayers) {
      if (id === myId) continue;
      const el = document.createElement("div");
      el.className = "remote-player";
      el.style.left = `${p.x}%`;
      el.style.top = `${p.y}%`;
      el.innerHTML = `<span class="remote-player-sprite"></span><span class="remote-player-name">${p.name}</span>`;
      layer.appendChild(el);
    }
  }

  function syncRemoteFromRoom(room) {
    const myId = window.MP_NET?.getPlayerId?.();
    state.remotePlayers.clear();
    for (const p of room.players || []) {
      if (p.id !== myId) state.remotePlayers.set(p.id, p);
    }
    renderRemotePlayers();
  }

  function applyServerCompleted(ids) {
    state.completed = new Set(ids || []);
    renderTaskList();
    renderMapZones();
    checkWin();
  }

  function showLobbyError(msg) {
    const el = document.getElementById("lobby-error");
    if (!el) return;
    if (!msg) {
      el.classList.add("hidden");
      el.textContent = "";
      return;
    }
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function showLobbyScreen() {
    document.getElementById("role-screen")?.classList.add("hidden");
    document.getElementById("game-screen")?.classList.add("hidden");
    document.getElementById("lobby-screen")?.classList.remove("hidden");
    showLobbyError("");
  }

  function hideLobbyScreen() {
    document.getElementById("lobby-screen")?.classList.add("hidden");
  }

  function updateLobbyUI(room) {
    const waiting = document.getElementById("lobby-waiting");
    const list = document.getElementById("lobby-players");
    const codeEl = document.getElementById("lobby-code-display");
    if (!waiting || !list || !room) return;
    waiting.classList.remove("hidden");
    if (codeEl) codeEl.textContent = room.code;
    list.innerHTML = "";
    const myId = window.MP_NET?.getPlayerId?.();
    for (const p of room.players) {
      const li = document.createElement("li");
      li.textContent = p.name + (p.id === room.hostId ? " (host)" : "") + (p.id === myId ? " — tu" : "");
      list.appendChild(li);
    }
    const startBtn = document.getElementById("btn-start-online");
    if (startBtn) {
      startBtn.disabled = room.hostId !== myId || room.players.length < 3;
    }
  }

  function beginOnlineGame(msg) {
    hideLobbyScreen();
    state.online = true;
    state.isHost = msg.room?.hostId === msg.yourId;
    state.alive = true;
    resetProgress(msg.role || "staff");
    if (msg.room?.completed) applyServerCompleted(msg.room.completed);
    syncRemoteFromRoom(msg.room);
    setOnlineHud();
    enterGame(false);
  }

  function initLobby() {
    const net = window.MP_NET;
    if (!net) return;

    net.on("error", (msg) => showLobbyError(msg.message || "Errore"));
    net.on("room_joined", (msg) => {
      showLobbyError("");
      updateLobbyUI(msg.room);
      const name = document.getElementById("lobby-name")?.value?.trim();
      if (name && !msg.created) net.setName(name);
      if (msg.created && name) net.setName(name);
    });
    net.on("room_update", (msg) => {
      updateLobbyUI(msg.room);
      if (state.inGame && state.online) syncRemoteFromRoom(msg.room);
    });
    net.on("game_start", (msg) => beginOnlineGame(msg));
    net.on("player_move", (msg) => {
      const p = state.remotePlayers.get(msg.id);
      if (p) {
        p.x = msg.x;
        p.y = msg.y;
      } else {
        state.remotePlayers.set(msg.id, {
          id: msg.id,
          name: msg.name || "?",
          x: msg.x,
          y: msg.y,
        });
      }
      renderRemotePlayers();
    });
    net.on("task_done", (msg) => {
      if (state.role === "staff") applyServerCompleted(msg.completed);
    });
    net.on("spy_state", (msg) => {
      const intel = msg.intel || {};
      state.stolenAt = new Set(intel.stolenAt || []);
      state.spyIntelDone = new Set(intel.hubDone || []);
      state.intelStash = (intel.stash || []).map((s) => ({ place: s.place, label: s.label }));
      state.intelCount = intel.dispatch || 0;
      renderTaskList();
      renderMapZones();
    });
    net.on("meeting_start", (msg) => openOnlineMeeting(msg));
    net.on("meeting_result", (msg) => showMeetingResult(msg));
    net.on("game_over", (msg) => {
      const banner = document.getElementById("win-banner");
      if (banner) {
        banner.classList.remove("hidden");
        banner.textContent =
          msg.winner === "crew"
            ? `Vittoria personale: ${msg.reason || "le spie sono state eliminate."}`
            : `Vittoria spie: ${msg.reason || "il personale è in minoranza."}`;
      }
      closeMeetingModal();
    });
    net.on("disconnected", () => {
      if (state.online) {
        alert("Connessione persa con il server.");
        state.online = false;
        showRoleScreen();
      }
    });

    document.getElementById("btn-go-online")?.addEventListener("click", showLobbyScreen);
    document.getElementById("btn-lobby-back")?.addEventListener("click", () => {
      hideLobbyScreen();
      document.getElementById("role-screen")?.classList.remove("hidden");
    });

    document.getElementById("btn-create-room")?.addEventListener("click", async () => {
      showLobbyError("");
      try {
        await net.createRoom();
        const name = document.getElementById("lobby-name")?.value?.trim() || "Host";
        net.setName(name);
      } catch {
        showLobbyError("Server offline. Avvia: cd server && npm install && npm start");
      }
    });

    document.getElementById("btn-join-room")?.addEventListener("click", async () => {
      showLobbyError("");
      const code = document.getElementById("lobby-code")?.value?.trim();
      const name = document.getElementById("lobby-name")?.value?.trim() || "Scienziato";
      if (!code) {
        showLobbyError("Inserisci il codice stanza.");
        return;
      }
      try {
        await net.joinRoom(code, name);
      } catch {
        showLobbyError("Server offline. Avvia: cd server && npm install && npm start");
      }
    });

    document.getElementById("btn-start-online")?.addEventListener("click", () => net.startGame());
  }

  function updateResumePanel() {
    const panel = document.getElementById("resume-panel");
    const summary = document.getElementById("resume-summary");
    const data = readSave();
    if (!panel || !summary) return;
    if (!data) {
      panel.classList.add("hidden");
      summary.textContent = "";
      return;
    }
    panel.classList.remove("hidden");
    summary.textContent = formatResumeSummary(data, ROLES);
  }

  function stealTaskFor(loc) {
    return {
      id: `steal-${loc.id}`,
      name: `Rubare: ${loc.intelSteal}`,
      type: "sequence",
      steps: 3,
      theme: "espionage",
    };
  }

  function spyHasWorkAt(loc) {
    if (state.role !== "spy") return false;
    if (loc.intelSteal && !state.stolenAt.has(loc.id)) return true;
    if (loc.oppenheimerHub) {
      return SPY_INTEL_TASKS.some((t) => !state.spyIntelDone.has(t.id));
    }
    return false;
  }

  function showRoleScreen() {
    state.inGame = false;
    state.online = false;
    state.remotePlayers.clear();
    renderRemotePlayers();
    setOnlineHud();
    window.MP_PLAYER?.stopPlayer?.();
    document.getElementById("game-screen")?.classList.add("hidden");
    document.getElementById("role-screen")?.classList.remove("hidden");
    closeTaskModal();
    document.getElementById("meeting-modal")?.classList.add("hidden");
    updateResumePanel();
  }

  function enterGame(resume) {
    const meta = ROLES[state.role];
    const blurb = document.getElementById("role-blurb");
    if (blurb && meta) blurb.textContent = meta.blurb;

    document.getElementById("role-screen")?.classList.add("hidden");
    document.getElementById("game-screen")?.classList.remove("hidden");

    const intelBtn = document.getElementById("btn-intel");
    if (intelBtn) intelBtn.classList.toggle("hidden", state.role !== "spy");

    const critProg = document.getElementById("crit-progress");
    if (critProg) critProg.classList.toggle("hidden", state.role === "spy");

    state.inGame = true;
    setOnlineHud();
    renderTaskList();
    renderMapZones();
    if (resume) {
      window.MP_PLAYER?.resumePlayer?.(state.playerX, state.playerY);
    } else {
      window.MP_PLAYER?.startPlayer?.();
    }
    checkWin();
    if (state.role === "spy" && state.intelCount >= SPY_DISPATCH_WIN) {
      const banner = document.getElementById("lose-banner");
      if (banner) {
        banner.classList.remove("hidden");
        banner.textContent =
          "Cinque dispatches ricevuti a Mosca: la rete sovietica ha abbastanza segreti sul Manhattan Project (vittoria spia, demo).";
      }
    }
    persistGame();
  }

  function pickRole(role) {
    if (hasSave()) {
      const ok = confirm(
        "Iniziare una nuova partita? Il salvataggio attuale verrà sostituito quando esci o fai progressi."
      );
      if (!ok) return;
    }
    clearSave();
    resetProgress(role);
    enterGame(false);
  }

  function resumeGame() {
    const data = readSave();
    if (!data) {
      updateResumePanel();
      return;
    }
    applySnapshot(data);
    enterGame(true);
  }

  function exitGame() {
    if (!state.inGame) {
      showRoleScreen();
      return;
    }
    persistGame();
    showRoleScreen();
  }

  function restartFromScratch() {
    const msg = state.inGame
      ? "Cancellare il salvataggio e tornare alla scelta del ruolo?"
      : "Eliminare il salvataggio e ricominciare da zero?";
    if (!confirm(msg)) return;
    clearSave();
    resetProgress("staff");
    showRoleScreen();
  }

  function openSpyInvestigation(loc) {
    const modal = document.getElementById("task-modal");
    const game = document.getElementById("task-minigame");
    const pick = document.getElementById("task-pick");
    if (!modal || !game || !pick || !window.MP_SPY) return;

    setMissionTheme(loc.theme || "espionage");
    game.innerHTML = "";
    const mode = window.MP_SPY.roomMode(loc);
    const modeNote = document.createElement("p");
    modeNote.className = "spy-note";
    modeNote.textContent =
      mode === "reader"
        ? "Modalità: banco documenti + macchinetta di lettura/censura."
        : "Modalità: ispeziona la stanza spostando mobili e oggetti.";
    pick.appendChild(modeNote);

    window.MP_SPY.renderSpyInvestigation(
      game,
      loc,
      { stolenAt: state.stolenAt, spyIntelDone: state.spyIntelDone },
      (result) => {
        if (!result?.ok) return;
        if (result.hubTask) {
          const task = SPY_INTEL_TASKS.find((t) => t.id === result.hubTask);
          state.spyIntelDone.add(result.hubTask);
          pushIntelPacket(loc.name, task?.name || result.hubTask);
          if (state.online) {
            window.MP_NET?.sendSpyIntel?.({
              action: "hub",
              taskId: result.hubTask,
              place: loc.name,
              label: task?.name,
            });
          }
        } else if (loc.intelSteal) {
          state.stolenAt.add(loc.id);
          pushIntelPacket(loc.name, loc.intelSteal);
          if (state.online) {
            window.MP_NET?.sendSpyIntel?.({
              action: "steal_site",
              locId: loc.id,
              place: loc.name,
              label: loc.intelSteal,
            });
          }
        }
        renderTaskList();
        renderMapZones();
        persistGame();
        const note = document.createElement("p");
        note.className = "spy-note";
        note.textContent = "Copia in tasca. Invia con «Dispatch a Mosca» quando vuoi.";
        game.appendChild(note);
        setTimeout(closeTaskModal, 1000);
      }
    );
  }

  function initGame() {
    const mapImg = document.getElementById("map-image");
    if (mapImg) mapImg.src = MAP_SRC;

    document.querySelectorAll("[data-role]").forEach((btn) => {
      btn.addEventListener("click", () => pickRole(btn.dataset.role));
    });

    document.getElementById("btn-resume")?.addEventListener("click", resumeGame);
    document.getElementById("btn-exit")?.addEventListener("click", exitGame);
    document.getElementById("btn-new-game")?.addEventListener("click", restartFromScratch);
    document.getElementById("btn-discard-save")?.addEventListener("click", restartFromScratch);

    initLobby();
    updateResumePanel();

    document.getElementById("close-task")?.addEventListener("click", closeTaskModal);
    document.getElementById("task-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "task-modal") closeTaskModal();
    });

    document.getElementById("btn-meeting")?.addEventListener("click", openMeeting);
    document.getElementById("close-meeting")?.addEventListener("click", closeMeetingModal);

    document.getElementById("btn-intel")?.addEventListener("click", sendIntelDispatch);

    document.getElementById("nearby-action")?.addEventListener("click", () => {
      if (state.nearbyLoc) openLocation(state.nearbyLoc);
    });

    window.addEventListener("beforeunload", () => {
      if (state.inGame) persistGame();
    });
  }

  function onPlayerMove(x, y) {
    const near = window.MP_PLAYER?.nearestLocation?.(LOCATIONS);
    state.nearbyLoc = near;
    updateNearbyPanel(near);
    highlightZones(near);
  }

  function tryInteractNearby() {
    if (state.nearbyLoc) openLocation(state.nearbyLoc);
  }

  function updateNearbyPanel(loc) {
    const panel = document.getElementById("nearby-panel");
    const title = document.getElementById("nearby-title");
    const desc = document.getElementById("nearby-desc");
    if (!panel || !title || !desc) return;
    if (!loc) {
      panel.classList.add("hidden");
      return;
    }
    panel.classList.remove("hidden");
    title.textContent = loc.name;
    desc.textContent = loc.desc || loc.blurb || "";
  }

  function highlightZones(near) {
    document.querySelectorAll(".loc-zone").forEach((el) => {
      el.classList.toggle("loc-zone-near", el.dataset.locId === near?.id);
    });
  }

  window.MP_GAME = { pickRole, initGame, tryInteractNearby, onPlayerMove, isOnline };

  function resetMeetingUi() {
    document.getElementById("meeting-quote")?.classList.add("hidden");
    document.getElementById("meeting-vote-prompt")?.classList.add("hidden");
    document.getElementById("meeting-vote-list")?.classList.add("hidden");
    document.getElementById("meeting-skip")?.classList.add("hidden");
    document.getElementById("meeting-result")?.classList.add("hidden");
    const list = document.getElementById("meeting-vote-list");
    if (list) list.innerHTML = "";
  }

  function closeMeetingModal() {
    document.getElementById("meeting-modal")?.classList.add("hidden");
    state.meetingActive = false;
    state.meetingVoted = false;
    resetMeetingUi();
    window.MP_PLAYER?.setFrozen?.(false);
  }

  function openMeeting() {
    if (state.online) {
      if (!state.alive) return;
      window.MP_NET?.callMeeting?.();
      return;
    }
    const modal = document.getElementById("meeting-modal");
    const quote = document.getElementById("meeting-quote");
    const intro = document.getElementById("meeting-intro");
    if (!modal || !quote) return;
    resetMeetingUi();
    if (intro) intro.textContent = "Briefing di sicurezza — Technical Area";
    quote.textContent = MEETING_QUOTES[Math.floor(Math.random() * MEETING_QUOTES.length)];
    quote.classList.remove("hidden");
    modal.classList.remove("hidden");
  }

  function openOnlineMeeting(msg) {
    const modal = document.getElementById("meeting-modal");
    const intro = document.getElementById("meeting-intro");
    const prompt = document.getElementById("meeting-vote-prompt");
    const list = document.getElementById("meeting-vote-list");
    const skipBtn = document.getElementById("meeting-skip");
    if (!modal || !list) return;
    resetMeetingUi();
    state.meetingActive = true;
    state.meetingVoted = false;
    window.MP_PLAYER?.setFrozen?.(true);
    const caller = msg.roster?.find((p) => p.id === msg.callerId);
    if (intro) {
      intro.textContent = caller
        ? `${caller.name} ha convocato una riunione d’emergenza.`
        : "Riunione d’emergenza convocata.";
    }
    prompt?.classList.remove("hidden");
    list.classList.remove("hidden");
    skipBtn?.classList.remove("hidden");
    const myId = window.MP_NET?.getPlayerId?.();
    for (const p of msg.roster || []) {
      if (p.id === myId) continue;
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = `Espelli: ${p.name}`;
      b.addEventListener("click", () => castMeetingVote(p.id));
      li.appendChild(b);
      list.appendChild(li);
    }
    if (skipBtn) {
      skipBtn.onclick = () => castMeetingVote("skip");
    }
    modal.classList.remove("hidden");
  }

  function castMeetingVote(targetId) {
    if (!state.meetingActive || state.meetingVoted) return;
    state.meetingVoted = true;
    window.MP_NET?.castVote?.(targetId);
    document.querySelectorAll("#meeting-vote-list button, #meeting-skip").forEach((el) => {
      el.disabled = true;
    });
    const intro = document.getElementById("meeting-intro");
    if (intro) intro.textContent = "Voto inviato. In attesa degli altri…";
  }

  function showMeetingResult(msg) {
    const box = document.getElementById("meeting-result");
    const intro = document.getElementById("meeting-intro");
    if (!box) return;
    box.classList.remove("hidden");
    if (msg.room?.players) {
      state.onlinePlayers = msg.room.players;
      for (const p of msg.room.players) {
        if (p.id === window.MP_NET?.getPlayerId?.()) state.alive = p.alive !== false;
      }
    }
    if (!msg.ejected) {
      box.textContent = "Nessuna espulsione (pareggio o voto saltato).";
    } else {
      const role =
        msg.revealedRole === "spy"
          ? "era una spia sovietica"
          : msg.revealedRole === "staff"
            ? "era personale del progetto"
            : "";
      box.textContent = `${msg.ejected.name} è stato espulso dalla Tech Area${role ? ` — ${role}` : ""}.`;
    }
    if (intro) intro.textContent = "Riunione conclusa.";
    state.meetingActive = false;
    window.MP_PLAYER?.setFrozen?.(false);
    if (!state.alive) {
      window.MP_PLAYER?.stopPlayer?.();
      const banner = document.getElementById("lose-banner");
      if (banner) {
        banner.classList.remove("hidden");
        banner.textContent = "Sei stato espulso. Osserva la partita o esci al menu.";
      }
    }
  }

  function sendIntelDispatch() {
    if (state.role !== "spy") return;
    const banner = document.getElementById("lose-banner");
    if (!banner) return;

    if (state.intelStash.length === 0) {
      banner.classList.remove("hidden");
      banner.textContent =
        "Nessun documento in tasca: ruba intelligence in un edificio, poi invia il dispatch a Mosca.";
      return;
    }

    const packet = state.intelStash.shift();
    state.intelCount += 1;
    if (state.online) window.MP_NET?.sendSpyIntel?.({ action: "dispatch" });
    banner.classList.remove("hidden");
    banner.textContent = `Dispatch a Mosca (${state.intelCount}/${SPY_DISPATCH_WIN}): «${packet.label}» — da ${packet.place}.`;
    renderTaskList();

    if (state.intelCount >= SPY_DISPATCH_WIN) {
      banner.textContent =
        "Cinque dispatches ricevuti a Mosca: la rete sovietica ha abbastanza segreti sul Manhattan Project (vittoria spia, demo).";
    }
    persistGame();
  }

  function pushIntelPacket(place, label) {
    state.intelStash.push({ place, label });
    renderTaskList();
    renderMapZones();
    persistGame();
  }

  function renderMapZones() {
    const layer = document.getElementById("map-zones");
    if (!layer) return;
    layer.innerHTML = "";

    const isSpy = state.role === "spy";

    for (const loc of LOCATIONS) {
      const pendingStaff = loc.tasks.some((t) => !state.completed.has(t.id));
      const pendingSpy = spyHasWorkAt(loc);
      const pending = isSpy ? pendingSpy : pendingStaff;
      const canSteal = isSpy && loc.intelSteal && !state.stolenAt.has(loc.id);
      const isCrit = loc.oppenheimerHub || loc.tasks.some((t) => t.oppenheimer);

      const zone = document.createElement("div");
      zone.className =
        "loc-zone" +
        (isCrit ? " loc-zone-crit" : "") +
        (pending ? "" : " loc-zone-done") +
        (isSpy && loc.intelSteal ? " loc-zone-spy" : "");
      zone.dataset.locId = loc.id;
      zone.style.left = `${loc.x}%`;
      zone.style.top = `${loc.y}%`;

      const label = document.createElement("span");
      label.className = "loc-marker-label";
      label.textContent = loc.name;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "loc-marker-btn";
      btn.setAttribute("aria-label", loc.name);
      const pulse = document.createElement("span");
      pulse.className = "loc-marker-pulse";
      const pin = document.createElement("span");
      pin.className = "loc-marker-pin";
      btn.append(pulse, pin);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openLocation(loc);
      });
      zone.append(label, btn);

      layer.appendChild(zone);
    }
  }

  function openLocation(loc) {
    if (state.online && !state.alive) return;
    if (state.meetingActive) return;
    const modal = document.getElementById("task-modal");
    const title = document.getElementById("task-modal-title");
    const pick = document.getElementById("task-pick");
    const game = document.getElementById("task-minigame");
    if (!modal || !pick || !game) return;

    setMissionTheme(loc.theme || MISSION_THEME_FALLBACK);
    title.textContent = loc.name;
    const descEl = document.createElement("p");
    descEl.className = "modal-loc-desc";
    descEl.textContent = loc.desc || "";

    pick.innerHTML = "";
    game.innerHTML = "";
    pick.appendChild(descEl);

    if (state.role === "spy") {
      const note = document.createElement("p");
      note.className = "spy-note";
      note.textContent =
        "Copertura da scienziato: nella stanza ci sono molti documenti e oggetti — trova quello giusto per Mosca.";
      pick.appendChild(note);

      if (!spyHasWorkAt(loc)) {
        const empty = document.createElement("p");
        empty.textContent = loc.intelSteal
          ? "Hai già recuperato tutto qui. Usa «Dispatch a Mosca» per inviare i pacchetti."
          : "Nessun archivio utile per Mosca in questo punto.";
        pick.appendChild(empty);
        modal.classList.remove("hidden");
        return;
      }

      modal.classList.remove("hidden");
      openSpyInvestigation(loc);
      return;
    }

    const available = loc.tasks.filter((t) => !state.completed.has(t.id));

    if (available.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Nessuna missione rimasta qui.";
      pick.appendChild(empty);
      modal.classList.remove("hidden");
      return;
    }

    available.forEach((task) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "task-pick-btn mission-card" + (task.oppenheimer ? " opp" : "");
      b.innerHTML = window.MP_MISSION_UI?.missionCardHtml?.(task, loc) || task.name;
      b.addEventListener("click", () => startTask(task, loc, "staff"));
      pick.appendChild(b);
    });

    modal.classList.remove("hidden");
  }

  function startTask(task, loc, mode) {
    const pick = document.getElementById("task-pick");
    const game = document.getElementById("task-minigame");
    if (!pick || !game) return;
    const desc = pick.querySelector(".modal-loc-desc");
    pick.innerHTML = "";
    if (desc) pick.appendChild(desc);
    state.currentTask = task;

    const h = document.createElement("h3");
    h.textContent = task.name;
    game.appendChild(h);

    const theme = task.theme || loc.theme || MISSION_THEME_FALLBACK;
    setMissionTheme(theme);
    window.renderMinigame(game, task.type, task.steps ?? 3, () => {
      if (mode === "staff") {
        if (state.online) {
          window.MP_NET?.sendTaskComplete?.(task.id);
        } else {
          state.completed.add(task.id);
          renderTaskList();
          renderMapZones();
          checkWin();
          persistGame();
        }
        const pos = window.MP_PLAYER.getPos();
        onPlayerMove(pos.x, pos.y);
      } else if (mode === "spySite") {
        state.stolenAt.add(loc.id);
        pushIntelPacket(loc.name, loc.intelSteal);
        const note = document.createElement("p");
        note.className = "spy-note";
        note.textContent = "Documenti fotocopiati e nascosti. Invia il pacco con «Dispatch a Mosca».";
        game.appendChild(note);
        persistGame();
      } else if (mode === "spyHub") {
        state.spyIntelDone.add(task.id);
        pushIntelPacket(loc.name, task.name);
        const note = document.createElement("p");
        note.className = "spy-note";
        note.textContent = "Intelligence di massima classifica in tasca. Dispatch verso Mosca.";
        game.appendChild(note);
        persistGame();
      }
      state.currentTask = null;
      const delay = mode === "staff" ? 600 : 900;
      setTimeout(closeTaskModal, delay);
    }, { theme, taskId: task.id, locationId: loc.id });
  }

  function closeTaskModal() {
    document.getElementById("task-modal")?.classList.add("hidden");
    document.getElementById("task-minigame").innerHTML = "";
    state.currentTask = null;
  }

  function renderTaskList() {
    const ul = document.getElementById("task-list");
    const total = document.getElementById("task-total");
    const critProg = document.getElementById("crit-progress");
    if (!ul) return;

    ul.innerHTML = "";

    const progressFill = document.getElementById("task-progress-fill");

    if (state.role === "spy") {
      const card = document.createElement("li");
      card.className = "spy-objective-card";
      card.innerHTML =
        `<strong>Rete Mosca</strong><br>` +
        `Dispatch: ${state.intelCount} / ${SPY_DISPATCH_WIN} · ` +
        `Pacchetti in tasca: ${state.intelStash.length}`;
      ul.appendChild(card);

      LOCATIONS.filter((l) => l.intelSteal || l.oppenheimerHub).forEach((loc) => {
        const block = document.createElement("li");
        block.className = "objective-loc-block";
        const th = window.MP_MISSION_UI?.THEME_UI?.[loc.theme] || { icon: "🕵", label: "Intel" };
        const done = loc.intelSteal && state.stolenAt.has(loc.id);
        block.innerHTML =
          `<div class="objective-loc-head" style="--loc-hue:280">` +
          `<span class="objective-loc-icon">${th.icon}</span>` +
          `<span class="objective-loc-meta"><span class="objective-loc-name">${loc.name}</span>` +
          `<span class="objective-loc-count">${done ? "Copiato" : "Da infiltrare"}</span></span></div>`;
        ul.appendChild(block);
      });

      if (progressFill) progressFill.style.width = `${Math.min(100, (state.intelCount / SPY_DISPATCH_WIN) * 100)}%`;
      if (critProg) critProg.textContent = "";
      if (total) total.textContent = `Spionaggio`;
      return;
    }

    for (const loc of LOCATIONS) {
      const locTasks = loc.tasks;
      if (!locTasks.length) continue;
      const done = locTasks.filter((t) => state.completed.has(t.id)).length;
      const pending = locTasks.filter((t) => !state.completed.has(t.id));
      if (done === locTasks.length && pending.length === 0) continue;

      const th =
        window.MP_MISSION_UI?.THEME_UI?.[loc.theme] || { icon: "⚙", label: loc.theme };
      const hue = { plutonium: 152, director: 45, espionage: 280, explosives: 28 }[loc.theme] || 210;

      const block = document.createElement("li");
      block.className = "objective-loc-block";
      block.innerHTML =
        `<div class="objective-loc-head" style="--loc-hue:${hue}">` +
        `<span class="objective-loc-icon">${th.icon}</span>` +
        `<span class="objective-loc-meta">` +
        `<span class="objective-loc-name">${loc.name}</span>` +
        `<span class="objective-loc-count">${done}/${locTasks.length} completate</span>` +
        `</span></div>` +
        `<div class="objective-loc-bar"><span style="width:${(done / locTasks.length) * 100}%"></span></div>`;

      const sub = document.createElement("ul");
      sub.className = "objective-loc-tasks";
      const show = pending.length ? pending.slice(0, 4) : locTasks.slice(-2);
      show.forEach((t) => {
        const li = document.createElement("li");
        const isDone = state.completed.has(t.id);
        li.className = isDone ? "done" : "pending";
        if (t.oppenheimer) li.classList.add("opp-task");
        const v = window.MP_MISSION_UI?.visualForTask?.(t.id, loc.id, t.theme || loc.theme);
        const icon = v?.icon || "•";
        li.innerHTML = `<span class="objective-task-icon">${icon}</span><span>${t.name}</span>`;
        sub.appendChild(li);
      });
      if (pending.length > 4) {
        const more = document.createElement("li");
        more.className = "pending";
        more.textContent = `+ altre ${pending.length - 4} missioni qui…`;
        sub.appendChild(more);
      }
      block.appendChild(sub);
      ul.appendChild(block);
    }

    const critDone = CRITICAL_TASK_IDS.filter((id) => state.completed.has(id)).length;
    const winPct = Math.min(100, (state.completed.size / WIN_TASK_COUNT) * 100);
    if (progressFill) progressFill.style.width = `${winPct}%`;
    if (critProg) critProg.textContent = `Critici: ${critDone}/${CRITICAL_TASK_IDS.length}`;
    if (total) total.textContent = `${state.completed.size} / ${WIN_TASK_COUNT}`;
  }

  function checkWin() {
    if (state.role !== "staff") return;
    const critOk = criticalTasksComplete(state.completed);
    if (state.completed.size >= WIN_TASK_COUNT && critOk) {
      const banner = document.getElementById("win-banner");
      if (banner) {
        banner.classList.remove("hidden");
        banner.textContent =
          "Manhattan Project: obiettivi completati. Los Alamos è pronta per Trinity (vittoria personale).";
      }
    } else if (state.completed.size >= WIN_TASK_COUNT && !critOk) {
      const banner = document.getElementById("win-banner");
      if (banner) {
        banner.classList.remove("hidden");
        banner.classList.add("partial");
        banner.textContent =
          `${WIN_TASK_COUNT} obiettivi fatti, ma servono ancora le 3 missioni ★ alla Direzione Project Y.`;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
  } else {
    initGame();
  }
})();
