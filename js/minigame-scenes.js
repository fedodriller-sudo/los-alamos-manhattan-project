/** Minigioco unico per ID missione (no sequenze generiche) */
(function () {
  const TASK_VISUAL = {
    "d-glove": "puShuttle",
    "d-sample": "puShuttle",
    "d-filter": "airValves",
    "t-log": "dragArchive",
    "t-cal": "connect",
    "t-opp-sign": "dragPrimer",
    "gm-mat": "heTorqueBolts",
    "gm-torque": "heTorqueBolts",
    "gm-xray": "beamCrosshair",
    "sg-mold": "gauge",
    "sg-store": "dragLabel",
    "dl-transfer": "dragHE",
    "x-beam": "connect",
    "x-power": "gauge",
    "z-hv": "hvLevers",
    "w-belt": "connect",
    "y-n2": "dragCryo",
    "y-seal": "valveWheel",
    "u-mix": "reagentPour",
    "u-wires": "connect",
    "v-lathe": "dragLathe",
    "v-tools": "dragTool",
    "opp-brief": "dragStamp",
    "opp-groves": "connect",
    "opp-trinity": "gauge",
    "a-clear": "dragBadges",
    "q-scan": "puRadiationBalance",
    "q-kit": "dragMedkit",
    "bo-pressure": "gauge",
    "bo-coal": "dragCoal",
    "fo-pour": "flameCut",
    "fo-mold": "flameCut",
    "fo-cool": "flameCut",
    "wh-sort": "truckLoad",
    "wh-crane": "truckLoad",
    "wh-inventory": "connect",
    "px-stock": "gateIdentify",
    "px-order": "gateIdentify",
    "med-lab": "connect",
    "med-shower": "gauge",
    "mp-fuel": "truckLoad",
    "mp-tire": "truckLoad",
    "po-mail": "dragCensor",
    "co-stock": "dragMensa",
    "p-badge": "gateIdentify",
    "p-visitor": "gateIdentify",
    "p-revoke": "gateIdentify",
    "a-visitor": "gateIdentify",
    "pond-water": "dragVial",
    "cl-laundry": "floorClean",
    "cl-count": "floorClean",
    "cl-acid": "floorClean",
    "zia-fix": "connect",
    "demon-core-stabilize": "demonCoreStabilize",
    "pu-glovebox-shuttle": "puShuttle",
    "trinity-sand-cleanup": "trinitySand",
    "gate-boolean-check": "gateBoolean",
    "spy-fuchs-fatman": "spyPhotostat",
    "spy-rosenberg-forged": "spyForgery",
    "spy-seborer-detonation": "spyDetonation",
    "spy-copy": "spyPhotostat",
    "spy-micro": "microfilmPull",
    "d-decon": "airValves",
    "d-scale": "gauge",
    "d-lead": "dragCoal",
    "t-film": "gauge",
    "t-shield": "connect",
    "t-ledger": "dragArchive",
    "gm-tape": "connect",
    "gm-safety": "hvLevers",
    "gm-log": "dragLabel",
    "sg-scale": "gauge",
    "sg-vent": "airValves",
    "dl-log": "dragArchive",
    "dl-guard": "connect",
    "x-target": "beamCrosshair",
    "x-vac": "gauge",
    "x-log": "connect",
    "z-count": "connect",
    "z-shield": "gauge",
    "w-spark": "gauge",
    "w-insulate": "hvLevers",
    "y-transfer": "connect",
    "y-alarm": "gauge",
    "u-plate": "gauge",
    "u-acid": "connect",
    "u-log": "dragArchive",
    "v-cal": "connect",
    "v-safety": "dragTool",
    "v-ship": "dragCrateSort",
    "a-mail": "dragCensor",
    "a-meeting": "dragArchive",
    "q-badge": "dragBadgeReader",
    "q-decon": "connect",
    "bo-water": "connect",
    "bo-log": "dragArchive",
    "wh-seal": "gauge",
    "px-ration": "connect",
    "med-xray": "dragArchive",
    "med-ttl": "connect",
    "mp-route": "connect",
    "mp-chain": "dragWrench",
    "po-stamp": "dragCensor",
    "po-pouch": "dragBriefcase",
    "co-milk": "gauge",
    "co-mess": "connect",
    "pond-ph": "connect",
    "pond-trash": "dragCoat",
    "zia-pipe": "valveWheel",
    "zia-meter": "gauge",
    "d-pu-balance": "puRadiationBalance",
    "gm-torque": "heTorqueBolts",
    "x-trim": "cyclotronDualTrim",
    "sg-quench": "compositionQuench",
    "y-dewar-fill": "cryoDewarFill",
    "z-flux": "neutronFluxBalance",
  };

  /** Rubare intelligence: trascina documento nella valigetta */
  const STEAL_VISUAL = "dragBriefcase";

  function sceneForTask(taskId, locationId) {
    if (taskId && taskId.startsWith("steal-")) return STEAL_VISUAL;
    if (TASK_VISUAL[taskId]) return TASK_VISUAL[taskId];
    if (window.MP_SCENE_FILL?.sceneForTask) {
      return window.MP_SCENE_FILL.sceneForTask(taskId, locationId);
    }
    return null;
  }

  function runScene(wrap, sceneId, ctx, onComplete, helpers) {
    const fn = SCENES[sceneId];
    if (!fn) return false;
    fn(wrap, ctx, onComplete, helpers);
    return true;
  }

  /** Pinze nel glove box: afferra Pu e depone in purificazione o pit */
  function runPuTongs(wrap, ctx, onComplete) {
    const mode = ctx.mode || "purify";
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint ||
      (mode === "purify"
        ? "Muovi le pinze, clicca sul plutonio per afferrarlo, rilascia nella camera di purificazione"
        : "Con le pinze sposta il plutonio nel nocciolo (pit)");

    const status = document.createElement("p");
    status.className = "mg-progress";
    status.textContent = "Clicca sul campione Pu per afferrarlo";

    const box = document.createElement("div");
    box.className = "mg-glovebox";
    box.setAttribute("tabindex", "0");

    const windowFrame = document.createElement("div");
    windowFrame.className = "mg-glove-window";

    const pellet = document.createElement("div");
    pellet.className = "mg-pu-pellet";
    pellet.textContent = "Pu";
    pellet.setAttribute("role", "button");
    pellet.title = "Campione plutonio";

    const zone = document.createElement("div");
    zone.className = mode === "purify" ? "mg-zone-purify" : "mg-zone-pit-target";
    const zl = document.createElement("span");
    zl.className = "mg-zone-title";
    zl.textContent = mode === "purify" ? "Purificazione" : "Pit";
    zone.appendChild(zl);

    const tongs = document.createElement("div");
    tongs.className = "mg-tongs";
    tongs.innerHTML =
      '<div class="mg-tongs-stick"></div><div class="mg-tongs-jaws"><span></span><span></span></div>';

    windowFrame.append(pellet, zone, tongs);
    box.appendChild(windowFrame);
    wrap.append(hint, box, status);

    const GRAB = 36;
    let holding = false;
    let px = 55;
    let py = 58;
    let pelletX = 22;
    let pelletY = 62;

    function layout() {
      tongs.style.left = `${px}%`;
      tongs.style.top = `${py}%`;
      pellet.style.left = `${pelletX}%`;
      pellet.style.top = `${pelletY}%`;
    }

    function tipPos() {
      const r = box.getBoundingClientRect();
      return {
        x: r.left + (px / 100) * r.width,
        y: r.top + (py / 100) * r.height + 8,
      };
    }

    function pelletPos() {
      const r = box.getBoundingClientRect();
      return {
        x: r.left + (pelletX / 100) * r.width,
        y: r.top + (pelletY / 100) * r.height,
      };
    }

    function zoneRect() {
      return zone.getBoundingClientRect();
    }

    function dist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function pointerToPercent(clientX, clientY) {
      const r = box.getBoundingClientRect();
      return {
        x: Math.max(8, Math.min(92, ((clientX - r.left) / r.width) * 100)),
        y: Math.max(12, Math.min(88, ((clientY - r.top) / r.height) * 100)),
      };
    }

    function tryComplete() {
      const pr = pellet.getBoundingClientRect();
      const zr = zoneRect();
      const cx = (pr.left + pr.right) / 2;
      const cy = (pr.top + pr.bottom) / 2;
      if (cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom) {
        zone.classList.add("mg-zone-ok");
        pellet.classList.add("mg-pu-placed");
        status.textContent = "Completato!";
        box.style.pointerEvents = "none";
        setTimeout(onComplete, 500);
        return true;
      }
      return false;
    }

    windowFrame.addEventListener("pointermove", (e) => {
      const p = pointerToPercent(e.clientX, e.clientY);
      px = p.x;
      py = p.y;
      if (holding) {
        pelletX = px - 4;
        pelletY = py - 2;
        tongs.classList.add("mg-tongs-grab");
      }
      layout();
      zone.classList.toggle("mg-zone-hover", holding);
    });

    windowFrame.addEventListener("pointerdown", (e) => {
      windowFrame.setPointerCapture(e.pointerId);
      const tip = tipPos();
      const pp = pelletPos();
      if (!holding && dist(tip, pp) < GRAB + 20) {
        holding = true;
        tongs.classList.add("mg-tongs-grab");
        status.textContent = "Trascina sopra la zona e rilascia";
      }
    });

    windowFrame.addEventListener("pointerup", () => {
      if (holding) {
        holding = false;
        tongs.classList.remove("mg-tongs-grab");
        zone.classList.remove("mg-zone-hover");
        if (!tryComplete()) {
          status.textContent = "Deposita il campione dentro il cerchio evidenziato";
        }
      }
    });

    pellet.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!holding && dist(tipPos(), pelletPos()) < GRAB + 28) {
        holding = true;
        status.textContent = "Trascina sopra la zona e rilascia";
      }
    });

    layout();
  }

  function runAirValves(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Ruota le valvole (clic) finché tutte sono nella zona verde";
    wrap.appendChild(hint);

    const panel = document.createElement("div");
    panel.className = "mg-valve-panel";

    const targetLevel = 1;
    const states = [2, 0, 2];
    const labels = ["Ingresso aria", "Filtro A", "Filtro B"];

    labels.forEach((label, i) => {
      const row = document.createElement("div");
      row.className = "mg-valve-row";
      const name = document.createElement("span");
      name.textContent = label;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mg-valve";
      btn.textContent = "↻";
      btn.dataset.level = String(states[i]);
      btn.classList.toggle("mg-valve-ok", states[i] === targetLevel);
      btn.addEventListener("click", () => {
        states[i] = (states[i] + 1) % 3;
        btn.dataset.level = String(states[i]);
        btn.classList.toggle("mg-valve-ok", states[i] === targetLevel);
        if (states.every((s) => s === targetLevel)) {
          setTimeout(onComplete, 350);
        }
      });
      row.append(name, btn);
      panel.appendChild(row);
    });

    wrap.appendChild(panel);
  }

  function runDragMission(wrap, cfg, onComplete, helpers) {
    if (!helpers?.runDragDrop) return;
    helpers.runDragDrop(
      wrap,
      {
        hint: cfg.hint,
        scene: cfg.scene || "lab",
        piece: cfg.piece || "doc",
        pieceLabel: cfg.pieceText || cfg.pieceLabel || "",
        target: cfg.target || "glove-slot",
        targetLabel: cfg.targetLabel || "",
      },
      onComplete
    );
  }

  function runLensMat(wrap, ctx, onComplete, helpers) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Trascina ogni lente nella sede corrispondente sul tappeto";
    wrap.appendChild(hint);

    const mat = document.createElement("div");
    mat.className = "mg-lens-mat";
    const slots = [];
    let placed = 0;

    for (let i = 0; i < 3; i++) {
      const slot = document.createElement("div");
      slot.className = "mg-lens-slot";
      mat.appendChild(slot);
      slots.push(slot);
    }

    for (let i = 0; i < 3; i++) {
      const lens = document.createElement("div");
      lens.className = "mg-piece mg-piece-lens";
      lens.style.position = "absolute";
      const homeLeft = `${6 + i * 30}%`;
      lens.style.left = homeLeft;
      lens.style.top = "10%";
      lens.dataset.homeLeft = homeLeft;
      lens.dataset.homeTop = "10%";
      mat.appendChild(lens);

      helpers.makeDraggableToTarget(lens, slots[i], () => {
        placed++;
        lens.style.position = "absolute";
        lens.style.left = "50%";
        lens.style.top = "50%";
        lens.style.transform = "translate(-50%,-50%)";
        slots[i].appendChild(lens);
        slots[i].classList.add("mg-lens-filled");
        if (placed >= 3) setTimeout(onComplete, 400);
      });
    }
    wrap.appendChild(mat);
  }

  function runBeamCrosshair(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Muovi il mirino e clicca quando è centrato sul bersaglio";
    const pad = document.createElement("div");
    pad.className = "mg-crosshair-pad";
    const target = document.createElement("div");
    target.className = "mg-crosshair-target";
    const cross = document.createElement("div");
    cross.className = "mg-crosshair";
    cross.textContent = "+";
    pad.append(target, cross);
    wrap.append(hint, pad);

    const status = document.createElement("p");
    status.className = "mg-progress";
    status.textContent = "Centra il + sul cerchio e clicca";
    wrap.appendChild(status);

    pad.addEventListener("pointermove", (e) => {
      const r = pad.getBoundingClientRect();
      cross.style.left = `${e.clientX - r.left}px`;
      cross.style.top = `${e.clientY - r.top}px`;
    });

    pad.addEventListener("click", (e) => {
      const r = pad.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      const cx = e.clientX;
      const cy = e.clientY;
      const tx = (tr.left + tr.right) / 2;
      const ty = (tr.top + tr.bottom) / 2;
      if (Math.hypot(cx - tx, cy - ty) < 28) {
        target.classList.add("mg-hit");
        status.textContent = "Giunzione OK!";
        setTimeout(onComplete, 400);
      } else {
        status.textContent = "Più al centro del cerchio…";
      }
    });
  }

  function runHvLevers(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Tira su i tre interruttori HV (clic) per armare l’acceleratore";
    wrap.appendChild(hint);
    const row = document.createElement("div");
    row.className = "mg-lever-row";
    let up = 0;
    ["Carica", "HV", "Fascio"].forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mg-lever";
      b.innerHTML = `<span>${label}</span><div class="mg-lever-handle"></div>`;
      b.addEventListener("click", () => {
        if (b.classList.contains("up")) return;
        b.classList.add("up");
        up++;
        if (up >= 3) setTimeout(onComplete, 400);
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
  }

  function runValveWheel(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Clicca la valvola finché l’indicatore non entra nel verde";
    wrap.appendChild(hint);
    let clicks = 0;
    const need = 6;
    const wheel = document.createElement("button");
    wheel.type = "button";
    wheel.className = "mg-big-valve";
    wheel.textContent = "◎";
    const meter = document.createElement("div");
    meter.className = "mg-valve-meter";
    const fill = document.createElement("div");
    fill.className = "mg-valve-meter-fill";
    meter.appendChild(fill);
    wrap.append(wheel, meter);

    wheel.addEventListener("click", () => {
      clicks++;
      wheel.style.transform = `rotate(${clicks * 45}deg)`;
      const pct = Math.min(100, (clicks / need) * 100);
      fill.style.width = `${pct}%`;
      if (clicks >= need) {
        fill.classList.add("ok");
        setTimeout(onComplete, 400);
      }
    });
  }

  function runReagentPour(wrap, ctx, onComplete, helpers) {
    const flasks = ["A", "B", "C"];
    let step = 0;
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Versa i reagenti A, poi B, poi C nel mixer";
    wrap.appendChild(hint);
    const inner = document.createElement("div");
    wrap.appendChild(inner);

    function next() {
      if (step >= flasks.length) {
        onComplete();
        return;
      }
      inner.innerHTML = "";
      runDragMission(
        inner,
        {
          hint: `Trascina il reagente ${flasks[step]} nel mixer`,
          piece: "vial",
          pieceText: flasks[step],
          targetLabel: "Mixer",
          target: "socket",
        },
        () => {
          step++;
          next();
        },
        helpers
      );
    }
    next();
  }

  function runMicrofilmPull(wrap, ctx, onComplete, helpers) {
    runDragMission(
      wrap,
      {
        hint: ctx.hint || "Estrai il microfilm dal cassetto e mettilo nella valigetta",
        piece: "film",
        pieceText: "🎞",
        targetLabel: "Valigetta",
        scene: "lab",
        target: "glove-slot",
      },
      onComplete,
      helpers
    );
  }

  const DRAG_CFG = {
    dragArchive: {
      hint: "Archivia il registro nel fascicolo «Primo esperimento»",
      piece: "doc",
      pieceText: "📋",
      targetLabel: "Archivio",
    },
    dragPrimer: {
      hint: "Distribuisci il Los Alamos Primer sul banco uscita",
      piece: "doc",
      pieceText: "Primer",
      targetLabel: "Uscita T",
    },
    dragLabel: {
      hint: "Applica l’etichetta HE sul carico",
      piece: "doc",
      pieceText: "HE",
      targetLabel: "Carico Sigma",
    },
    dragHE: { hint: "Sposta il tronchetto HE dietro la barriera", piece: "he", pieceText: "HE", targetLabel: "Barriera", scene: "he" },
    dragCryo: { hint: "Collega il dewar al rifornimento N₂", piece: "n2", pieceText: "N₂", targetLabel: "Criostato" },
    dragLathe: { hint: "Monta il pezzo sul mandrino", piece: "part", targetLabel: "Tornio" },
    dragTool: { hint: "Riponi la fresa sul banco utensili", piece: "part", pieceText: "🔧", targetLabel: "Banco V" },
    dragStamp: {
      hint: "Applica il timbro CLASSIFIED sul briefing implosione",
      piece: "doc",
      pieceText: "★",
      targetLabel: "Documento",
    },
    dragBadges: { hint: "Aggiorna il tabellone clearance Q", piece: "badge", targetLabel: "Tabellone A" },
    dragMedkit: { hint: "Riponi i materiali nel kit urgenze", piece: "doc", pieceText: "🧰", targetLabel: "Kit Q" },
    dragCoal: { hint: "Sposta il carbone nella caldaia n.2", piece: "coal", targetLabel: "Caldaia" },
    dragCrucible: { hint: "Versa il crogiolo nella forma", piece: "part", pieceText: "🫗", targetLabel: "Forma" },
    dragCrateSort: {
      hint: "Smista la cassa classificata verso plutonio/officine",
      piece: "crate",
      pieceText: "📦",
      targetLabel: "Baia corretta",
    },
    dragPxBox: { hint: "Rifornisci lo scaffale PX", piece: "crate", pieceText: "📦", targetLabel: "Scaffale PX" },
    dragFuel: { hint: "Inserisci la pompa nel serbatoio del convoglio", piece: "part", pieceText: "⛽", targetLabel: "Camion" },
    dragWrench: { hint: "Controlla la gomma con la chiave dinamometrica", piece: "part", pieceText: "🔧", targetLabel: "Ruota" },
    dragCensor: { hint: "Sposta la lettera sul banco censura", piece: "doc", pieceText: "✉️", targetLabel: "Censura" },
    dragMensa: { hint: "Porta le scorte al banco mensa notturna", piece: "crate", pieceText: "🍞", targetLabel: "Mensa" },
    dragBadgeReader: { hint: "Passa il badge sul lettore doppio", piece: "badge", targetLabel: "Lettore P" },
    dragVial: { hint: "Metti la provetta d’acqua sul rack", piece: "vial", targetLabel: "Rack Pond" },
    dragCoat: { hint: "Carica i camici puliti sul carrello per il plutonio", piece: "doc", pieceText: "👕", targetLabel: "Carrello" },
    dragBriefcase: {
      hint: "Nascondi i documenti copiati nella valigetta",
      piece: "film",
      pieceText: "📁",
      targetLabel: "Valigetta",
    },
  };

  function hashTaskId(id) {
    let h = 2166136261;
    const s = String(id || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function runGeigerSweep(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Clicca quando il contatore Geiger è nella zona verde (bassa dose).";
    const bar = document.createElement("div");
    bar.className = "mg-geiger-bar";
    const needle = document.createElement("div");
    needle.className = "mg-geiger-needle";
    const zone = document.createElement("div");
    zone.className = "mg-geiger-green";
    bar.append(zone, needle);
    const status = document.createElement("p");
    status.className = "mg-progress";
    status.textContent = "Osserva il display…";
    wrap.append(hint, bar, status);
    let t = 0;
    let hits = 0;
    const need = 2 + (hashTaskId(ctx.taskId) % 2);
    const phase = hashTaskId(ctx.taskId) * 0.001;
    const tick = () => {
      t += 0.04;
      const v = 50 + Math.sin(t + phase) * 38 + Math.sin(t * 2.3) * 12;
      needle.style.left = `${v}%`;
    };
    const iv = setInterval(tick, 40);
    bar.addEventListener("click", () => {
      const v = parseFloat(needle.style.left) || 0;
      if (v > 38 && v < 62) {
        hits += 1;
        status.textContent = `Lettura OK (${hits}/${need})`;
        if (hits >= need) {
          clearInterval(iv);
          status.textContent = "Dose registrata.";
          setTimeout(onComplete, 400);
        }
      } else {
        status.textContent = "Troppo alta! Aspetta la zona verde.";
      }
    });
  }

  function runTimerStop(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Ferma la barra quando entra nella fascia verde.";
    const track = document.createElement("div");
    track.className = "mg-timer-track";
    const green = document.createElement("div");
    green.className = "mg-timer-green";
    green.style.left = `${30 + (hashTaskId(ctx.taskId) % 25)}%`;
    const cursor = document.createElement("div");
    cursor.className = "mg-timer-cursor";
    track.append(green, cursor);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn primary small";
    btn.textContent = "Stop";
    const status = document.createElement("p");
    status.className = "mg-progress";
    wrap.append(hint, track, btn, status);
    let x = 0;
    let dir = 1;
    const spd = 1.2 + (hashTaskId(ctx.taskId) % 5) * 0.15;
    const loop = setInterval(() => {
      x += dir * spd;
      if (x >= 100) {
        x = 100;
        dir = -1;
      }
      if (x <= 0) {
        x = 0;
        dir = 1;
      }
      cursor.style.left = `${x}%`;
    }, 16);
    btn.addEventListener("click", () => {
      const gL = parseFloat(green.style.left) || 30;
      if (x >= gL && x <= gL + 18) {
        clearInterval(loop);
        status.textContent = "Tempo perfetto.";
        setTimeout(onComplete, 450);
      } else {
        status.textContent = "Fuori fascia — aspetta il verde e riprova.";
      }
    });
  }

  function runSymbolMatch(wrap, ctx, onComplete) {
    const symbols = ["α", "β", "γ", "n", "Pu", "U", "He", "N₂"];
    const h = hashTaskId(ctx.taskId);
    const seq = [];
    for (let i = 0; i < 3; i++) seq.push(symbols[(h + i * 7) % symbols.length]);
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || `Ripeti la sequenza sul pannello: ${seq.join(" → ")}`;
    const panel = document.createElement("div");
    panel.className = "mg-symbol-panel";
    let step = 0;
    const status = document.createElement("p");
    status.className = "mg-progress";
    symbols.slice(0, 6).forEach((sym) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mg-symbol-btn";
      b.textContent = sym;
      b.addEventListener("click", () => {
        if (sym === seq[step]) {
          step += 1;
          b.classList.add("lit");
          status.textContent = step >= seq.length ? "Sequenza corretta." : `Passo ${step}/${seq.length}`;
          if (step >= seq.length) setTimeout(onComplete, 400);
        } else {
          status.textContent = "Errore — ricomincia.";
          step = 0;
          panel.querySelectorAll(".lit").forEach((el) => el.classList.remove("lit"));
        }
      });
      panel.appendChild(b);
    });
    wrap.append(hint, panel, status);
  }

  function runPatchPanel(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Collega i jack nell’ordine numerato.";
    const panel = document.createElement("div");
    panel.className = "mg-patch-panel";
    const order = [1, 3, 2, 4].map((n, i) => ((hashTaskId(ctx.taskId) + i) % 4) + 1);
    const uniq = [...new Set(order)];
    let idx = 0;
    const status = document.createElement("p");
    status.className = "mg-progress";
    for (let n = 1; n <= 4; n++) {
      const jack = document.createElement("button");
      jack.type = "button";
      jack.className = "mg-patch-jack";
      jack.textContent = String(n);
      jack.addEventListener("click", () => {
        if (n === uniq[idx]) {
          jack.classList.add("lit");
          idx += 1;
          if (idx >= uniq.length) {
            status.textContent = "Pannello collegato.";
            setTimeout(onComplete, 400);
          }
        } else {
          status.textContent = "Ordine sbagliato.";
          idx = 0;
          panel.querySelectorAll(".lit").forEach((el) => el.classList.remove("lit"));
        }
      });
      panel.appendChild(jack);
    }
    wrap.append(hint, panel, status);
  }

  const SCENES = {
    geigerSweep: runGeigerSweep,
    timerStop: runTimerStop,
    symbolMatch: runSymbolMatch,
    patchPanel: runPatchPanel,
    puShuttle: (w, c, d) => window.MP_LOC_GAMES?.runPuShuttle(w, c, d),
    flameCut: (w, c, d) => window.MP_LOC_GAMES?.runFlameCut(w, c, d),
    truckLoad: (w, c, d) => window.MP_LOC_GAMES?.runTruckLoad(w, c, d),
    floorClean: (w, c, d) => window.MP_LOC_GAMES?.runFloorClean(w, c, d),
    gateIdentify: (w, c, d) => window.MP_LOC_GAMES?.runGateIdentify(w, c, d),
    demonCoreStabilize: (w, c, d) => window.MP_LOC_GAMES?.runDemonCoreStabilize(w, c, d),
    trinitySand: (w, c, d) => window.MP_LOC_GAMES?.runTrinitySand(w, c, d),
    gateBoolean: (w, c, d) => window.MP_LOC_GAMES?.runGateBoolean(w, c, d),
    spyPhotostat: (w, c, d) => window.MP_LOC_GAMES?.runSpyPhotostat(w, c, d),
    spyForgery: (w, c, d) => window.MP_LOC_GAMES?.runSpyForgery(w, c, d),
    spyDetonation: (w, c, d) => window.MP_LOC_GAMES?.runSpyDetonation(w, c, d),
    puRadiationBalance: (w, c, d) => window.MP_DETAILED?.runPuRadiationBalance(w, c, d),
    heTorqueBolts: (w, c, d) => window.MP_DETAILED?.runHeTorqueBolts(w, c, d),
    cyclotronDualTrim: (w, c, d) => window.MP_DETAILED?.runCyclotronDualTrim(w, c, d),
    compositionQuench: (w, c, d) => window.MP_DETAILED?.runCompositionQuench(w, c, d),
    cryoDewarFill: (w, c, d) => window.MP_DETAILED?.runCryoDewarFill(w, c, d),
    neutronFluxBalance: (w, c, d) => window.MP_DETAILED?.runNeutronFluxBalance(w, c, d),
    puTongsPurify: (w, c, d) => runPuTongs(w, { ...c, mode: "purify" }, d),
    puTongsPit: (w, c, d) => runPuTongs(w, { ...c, mode: "pit" }, d),
    airValves: runAirValves,
    lensMat: runLensMat,
    beamCrosshair: runBeamCrosshair,
    hvLevers: runHvLevers,
    valveWheel: runValveWheel,
    reagentPour: runReagentPour,
    microfilmPull: runMicrofilmPull,
    connect: (w, c, d, h) => {
      h.runVisualConnect(w, c.theme, Math.min(c.steps || 3, 3), c.hint, d);
    },
    gauge: (w, c, d, h) => {
      h.runVisualGauge(w, c.theme, c.hint, d);
    },
    dragHE: (w, c, d, h) => runDragMission(w, { ...DRAG_CFG.dragHE, scene: "he", target: "glove-slot" }, d, h),
    dragArchive: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragArchive, d, h),
    dragPrimer: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragPrimer, d, h),
    dragLabel: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragLabel, d, h),
    dragCryo: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragCryo, d, h),
    dragLathe: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragLathe, d, h),
    dragTool: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragTool, d, h),
    dragStamp: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragStamp, d, h),
    dragBadges: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragBadges, d, h),
    dragMedkit: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragMedkit, d, h),
    dragCoal: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragCoal, d, h),
    dragCrucible: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragCrucible, d, h),
    dragCrateSort: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragCrateSort, d, h),
    dragPxBox: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragPxBox, d, h),
    dragFuel: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragFuel, d, h),
    dragWrench: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragWrench, d, h),
    dragCensor: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragCensor, d, h),
    dragMensa: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragMensa, d, h),
    dragBadgeReader: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragBadgeReader, d, h),
    dragVial: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragVial, d, h),
    dragCoat: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragCoat, d, h),
    dragBriefcase: (w, c, d, h) => runDragMission(w, DRAG_CFG.dragBriefcase, d, h),
  };

  window.MG_SCENES = {
    sceneForTask,
    runScene,
    TASK_VISUAL,
  };
})();
