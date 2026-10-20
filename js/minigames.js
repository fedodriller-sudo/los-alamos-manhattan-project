/** Minigiochi visivi tematici per edificio */

const MG_THEMES = {
  plutonium: {
    sequence: "Nel glove box: tocca gli strumenti nell’ordine mostrato (guanti → campione → sigillo)",
    wires: "Collega i tubi del lavaggio d’aria: stesso colore a sinistra e destra",
    slider: "Trascina il campione di plutonio nel nocciolo (pit)",
  },
  technical: {
    sequence: "Ripeti la sequenza sul pannello del registro esperimenti",
    wires: "Ricollega i cavi degli strumenti (stesso simbolo)",
    slider: "Regola il manometro finché la lancetta resta nella zona verde",
  },
  heAssembly: {
    sequence: "Allinea le lenti HE: ripeti l’ordine sul tappeto",
    wires: "Collega i sensori della gammagrafia",
    slider: "Trascina la lente nella sede di prova",
  },
  explosives: {
    sequence: "Etichetta i carichi HE nell’ordine corretto",
    wires: "Collega i sensori della colata Composition B",
    slider: "Tieni la temperatura di raffreddamento nella zona verde",
  },
  heTransfer: {
    sequence: "Conferma i passaggi del trasferimento HE",
    wires: "Collega il carrello di trasporto",
    slider: "Trascina il tronchetto HE dietro la barriera",
  },
  cyclotron: {
    sequence: "Sequenza avviamento ciclotrone: magnete → fascio → camera",
    wires: "Collega l’alimentazione del ciclotrone",
    slider: "Stabilizza l’alimentazione del magnete (manometro)",
  },
  neutrons: {
    sequence: "Sequenza Cockcroft-Walton: carica → scarica → fascio",
    wires: "Collega i cavi dell’acceleratore di neutroni",
    slider: "Regola il potenziale nella zona verde",
  },
  vandegraaff: {
    sequence: "Ispezione Van de Graaff nell’ordine indicato",
    wires: "Collega i cavi del generatore",
    slider: "Mantieni la tensione nella zona verde",
  },
  cryo: {
    sequence: "Rifornimento azoto: valvola → criostato → prova",
    wires: "Collega i sensori criogenici",
    slider: "Trascina il dewar verso il rifornimento N₂",
  },
  chemistry: {
    sequence: "Versa i reagenti nell’ordine della scheda",
    wires: "Ripara il cablaggio del banco conteggi",
    slider: "Stabilizza il segnale del detector",
  },
  machineShop: {
    sequence: "Passi del tornio nell’ordine corretto",
    wires: "Collega il banco utensili",
    slider: "Trascina il pezzo sul mandrino del tornio",
  },
  director: {
    sequence: "Ordina i punti del briefing classificato",
    wires: "Collega la linea cifrata verso Washington",
    slider: "Allinea la finestra meteo (manometro)",
  },
  health: {
    sequence: "Procedura dose: badge → misura → registro",
    wires: "Collega i sensori del dosimetro",
    slider: "Centra la lettura dose nella zona verde",
  },
  boiler: {
    sequence: "Turno centrale: carbone → pressione → vapore",
    wires: "Collega i sensori della caldaia",
    slider: "Regola la pressione del vapore",
  },
  foundry: {
    sequence: "Colata: riscaldamento → versamento → raffreddamento",
    wires: "Collega le termocoppie",
    slider: "Trascina il crogiolo verso la forma",
  },
  warehouse: {
    sequence: "Smista le casse nell’ordine del manifesto",
    wires: "Collega i terminali inventario",
    slider: "Trascina la cassa classificata sullo scaffale",
  },
  px: {
    sequence: "Rifornimento PX nell’ordine indicato",
    wires: "Collega il registratore",
    slider: "Regola la temperatura frigo",
  },
  medical: {
    sequence: "Analisi campione nell’ordine corretto",
    wires: "Collega il laboratorio medico",
    slider: "Regola il flusso della doccia emergenza",
  },
  motorPool: {
    sequence: "Check convoglio nell’ordine indicato",
    wires: "Collega i cavi del camion",
    slider: "Trascina la pompa benzina al serbatoio",
  },
  postOffice: {
    sequence: "Censura posta: apri → verifica → timbro",
    wires: "Collega il banco censura",
    slider: "Allinea il nastro della franking machine",
  },
  commissary: {
    sequence: "Turno mensa nell’ordine indicato",
    wires: "Collega la cella frigo",
    slider: "Regola la temperatura dispensa",
  },
  passOffice: {
    sequence: "Controllo badge nell’ordine indicato",
    wires: "Collega il lettore badge",
    slider: "Trascina il badge sul lettore",
  },
  pond: {
    sequence: "Campione acqua nell’ordine indicato",
    wires: "Collega i sensori di qualità",
    slider: "Trascina la provetta al rack campioni",
  },
  laundry: {
    sequence: "Lavanderia nell’ordine indicato",
    wires: "Collega le lavatrici",
    slider: "Regola il ciclo di centrifuga",
  },
  maintenance: {
    sequence: "Riparazione elettrica nell’ordine indicato",
    wires: "Collega i cavi del padiglione",
    slider: "Trascina il fusibile nel quadro",
  },
  espionage: {
    sequence: "Copia segreta: estrai → fotocopia → ripristina",
    wires: "Collega il microfilm (copertura)",
    slider: "Trascina il microfilm nella valigetta",
  },
};

const SEQ_ICONS = {
  plutonium: ["🧤", "☢️", "🔒", "📋"],
  technical: ["📊", "⏱️", "🔬", "📁"],
  heAssembly: ["💣", "◎", "📐", "✓"],
  explosives: ["🔥", "🧨", "❄️", "🏷️"],
  heTransfer: ["📦", "🚧", "➡️", "✓"],
  cyclotron: ["🧲", "⚡", "◎", "📡"],
  neutrons: ["⚡", "🔋", "◎", "📈"],
  vandegraaff: ["🔌", "⚡", "🌐", "✓"],
  cryo: ["🧊", "❄️", "🔵", "✓"],
  chemistry: ["🧪", "💧", "⚗️", "📋"],
  machineShop: ["⚙️", "🔧", "📏", "✓"],
  director: ["★", "📜", "🌩️", "✈️"],
  health: ["🪪", "📟", "💚", "📋"],
  boiler: ["🪨", "🔥", "💨", "✓"],
  foundry: ["🔥", "🫗", "❄️", "✓"],
  warehouse: ["📦", "🏷️", "🚚", "✓"],
  px: ["🛒", "📦", "✏️", "✓"],
  medical: ["🩸", "🔬", "🚿", "✓"],
  motorPool: ["⛽", "🛞", "🚛", "✓"],
  postOffice: ["✉️", "🔍", "📮", "✓"],
  commissary: ["🍞", "🥫", "🌙", "✓"],
  passOffice: ["🪪", "🚪", "✓", "📋"],
  pond: ["🌊", "🧪", "🏷️", "✓"],
  laundry: ["👕", "🫧", "✨", "✓"],
  maintenance: ["🔌", "🔧", "💡", "✓"],
  espionage: ["📂", "📷", "📁", "🕵️"],
};

const WIRE_PORTS = {
  plutonium: [
    { color: "#4ecdc4", icon: "💨", label: "Aria" },
    { color: "#e85d4f", icon: "🔴", label: "Filtro A" },
    { color: "#f5c211", icon: "🟡", label: "Filtro B" },
  ],
  technical: [
    { color: "#1c71d8", icon: "📡", label: "Sensore" },
    { color: "#e01b24", icon: "⚡", label: "Alim." },
    { color: "#33d17a", icon: "📟", label: "Log" },
  ],
  heAssembly: [
    { color: "#ff7800", icon: "📷", label: "Gamma" },
    { color: "#9141ac", icon: "◎", label: "Lente" },
    { color: "#f5c211", icon: "⚡", label: "Sync" },
  ],
  cyclotron: [
    { color: "#6ec8ff", icon: "🧲", label: "Magnete" },
    { color: "#f5c211", icon: "⚡", label: "RF" },
    { color: "#e01b24", icon: "🔌", label: "HV" },
  ],
  espionage: [
    { color: "#8b5cf6", icon: "🎞️", label: "Film" },
    { color: "#1c71d8", icon: "📻", label: "Radio" },
    { color: "#c9a227", icon: "🔐", label: "Codice" },
  ],
};

const DEFAULT_PORTS = [
  { color: "#e01b24", icon: "●", label: "A" },
  { color: "#1c71d8", icon: "●", label: "B" },
  { color: "#f5c211", icon: "●", label: "C" },
];

const DRAG_SLIDER = {
  plutonium: { scene: "pit", piece: "pu", pieceLabel: "Pu", target: "pit", targetLabel: "Nocciolo (pit)" },
  heAssembly: { scene: "he", piece: "lens", pieceLabel: "", target: "socket", targetLabel: "Sede lente" },
  heTransfer: { scene: "he", piece: "he", pieceLabel: "HE", target: "glove-slot", targetLabel: "Barriera" },
  cryo: { scene: "lab", piece: "n2", pieceLabel: "N₂", target: "glove-slot", targetLabel: "Criostato" },
  machineShop: { scene: "lab", piece: "part", pieceLabel: "", target: "socket", targetLabel: "Tornio" },
  motorPool: { scene: "lab", piece: "part", pieceLabel: "⛽", target: "glove-slot", targetLabel: "Serbatoio" },
  foundry: { scene: "lab", piece: "part", pieceLabel: "🫗", target: "pit", targetLabel: "Forma" },
  warehouse: { scene: "lab", piece: "crate", pieceLabel: "📦", target: "glove-slot", targetLabel: "Scaffale" },
  passOffice: { scene: "lab", piece: "badge", pieceLabel: "", target: "socket", targetLabel: "Lettore" },
  pond: { scene: "lab", piece: "vial", pieceLabel: "", target: "glove-slot", targetLabel: "Rack" },
  maintenance: { scene: "lab", piece: "part", pieceLabel: "⚡", target: "socket", targetLabel: "Quadro" },
  espionage: { scene: "lab", piece: "film", pieceLabel: "FILM", target: "glove-slot", targetLabel: "Valigetta" },
};

function themeHint(theme, type) {
  const t = MG_THEMES[theme] || MG_THEMES.technical;
  return t[type] || "Completa l’operazione";
}

function renderMinigame(container, type, steps, onComplete, options) {
  const opts = options || {};
  const theme = opts.theme || "technical";
  const hint = opts.hint || themeHint(theme, type);
  const taskId = opts.taskId;
  const locationId = opts.locationId;
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = `minigame minigame-${type} minigame-theme-${theme}`;
  container.appendChild(wrap);

  const easySteps = Math.min(steps ?? 3, 4);
  const ctx = { theme, hint, steps: easySteps, type, taskId, locationId };

  const sceneId = window.MG_SCENES?.sceneForTask?.(taskId, locationId);
  if (sceneId && window.MG_SCENES?.runScene?.(wrap, sceneId, ctx, onComplete, window.MG_HELPERS)) {
    window.MP_MISSION_UI?.decorateMinigame?.(wrap, ctx);
    return;
  }

  if (type === "wires") {
    runVisualConnect(wrap, theme, Math.min(easySteps, 3), hint, onComplete);
  } else if (type === "slider") {
    runVisualGauge(wrap, theme, hint, onComplete);
  } else {
    runDragDrop(wrap, {
      hint,
      scene: "lab",
      piece: "doc",
      pieceLabel: "📋",
      target: "glove-slot",
      targetLabel: "Obiettivo",
    }, onComplete);
  }
  window.MP_MISSION_UI?.decorateMinigame?.(wrap, ctx);
}

function runDragDrop(wrap, cfg, onComplete) {
  const hintEl = document.createElement("p");
  hintEl.className = "mg-hint";
  hintEl.textContent = cfg.hint;
  wrap.appendChild(hintEl);

  const scene = document.createElement("div");
  scene.className = `mg-scene mg-scene-${cfg.scene}`;

  const bench = document.createElement("div");
  bench.className = "mg-bench";

  const origin = document.createElement("div");
  origin.className = "mg-origin";

  const piece = document.createElement("div");
  piece.className = `mg-piece mg-piece-${cfg.piece}`;
  if (cfg.pieceLabel) piece.textContent = cfg.pieceLabel;
  origin.appendChild(piece);

  const arrow = document.createElement("div");
  arrow.className = "mg-arrow-hint";
  arrow.textContent = "→";
  arrow.setAttribute("aria-hidden", "true");

  const target = document.createElement("div");
  target.className = `mg-target mg-target-${cfg.target}`;
  const targetLabel = document.createElement("span");
  targetLabel.className = "mg-target-label";
  targetLabel.textContent = cfg.targetLabel || "";
  target.appendChild(targetLabel);

  bench.append(origin, arrow, target);
  scene.appendChild(bench);
  wrap.appendChild(scene);

  const status = document.createElement("p");
  status.className = "mg-progress";
  status.textContent = "Trascina nell’area di destinazione (o tocca pezzo, poi destinazione)";
  wrap.appendChild(status);

  let selected = false;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  const homeParent = origin;

  function placeInOrigin() {
    piece.style.position = "";
    piece.style.left = "";
    piece.style.top = "";
    piece.style.transform = "";
    if (!origin.contains(piece)) origin.appendChild(piece);
    selected = false;
    piece.classList.remove("mg-dragging");
  }

  function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function tryDrop() {
    const pr = piece.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const pad = 12;
    const expanded = {
      left: tr.left - pad,
      right: tr.right + pad,
      top: tr.top - pad,
      bottom: tr.bottom + pad,
    };
    if (
      rectsOverlap(pr, expanded) ||
      (pr.left >= expanded.left &&
        pr.right <= expanded.right &&
        pr.top >= expanded.top &&
        pr.bottom <= expanded.bottom)
    ) {
      target.classList.add("mg-target-done");
      piece.style.position = "absolute";
      target.appendChild(piece);
      piece.style.left = "50%";
      piece.style.top = "50%";
      piece.style.transform = "translate(-50%, -50%)";
      status.textContent = "Completato!";
      setTimeout(onComplete, 400);
      return true;
    }
    return false;
  }

  piece.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    selected = true;
    piece.classList.add("mg-dragging");
    if (piece.parentElement !== wrap) {
      const r = piece.getBoundingClientRect();
      wrap.appendChild(piece);
      piece.style.position = "fixed";
      piece.style.left = `${r.left}px`;
      piece.style.top = `${r.top}px`;
      piece.style.transform = "";
    }
    offsetX = e.clientX - piece.getBoundingClientRect().left - piece.offsetWidth / 2;
    offsetY = e.clientY - piece.getBoundingClientRect().top - piece.offsetHeight / 2;
    piece.setPointerCapture(e.pointerId);
  });

  piece.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    piece.style.left = `${e.clientX - offsetX - piece.offsetWidth / 2}px`;
    piece.style.top = `${e.clientY - offsetY - piece.offsetHeight / 2}px`;
    const pr = piece.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    target.classList.toggle("mg-target-hover", rectsOverlap(pr, tr));
  });

  piece.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    piece.releasePointerCapture(e.pointerId);
    target.classList.remove("mg-target-hover");
    if (!tryDrop()) {
      status.textContent = "Non ancora — prova a centrare sul bersaglio";
      piece.classList.remove("mg-dragging");
      origin.appendChild(piece);
      piece.style.position = "";
      piece.style.left = "";
      piece.style.top = "";
      piece.style.transform = "";
      selected = false;
    }
  });

  target.addEventListener("click", () => {
    if (selected && !dragging) {
      piece.style.position = "fixed";
      const tr = target.getBoundingClientRect();
      piece.style.left = `${tr.left + tr.width / 2 - piece.offsetWidth / 2}px`;
      piece.style.top = `${tr.top + tr.height / 2 - piece.offsetHeight / 2}px`;
      if (wrap.contains(piece) || document.body.contains(piece)) tryDrop();
    }
  });

  piece.addEventListener("click", (e) => {
    e.stopPropagation();
    selected = true;
    status.textContent = "Ora trascina o tocca la destinazione";
  });
}

function runVisualConnect(wrap, theme, count, hint, onComplete) {
  const hintEl = document.createElement("p");
  hintEl.className = "mg-hint";
  hintEl.textContent = hint;
  wrap.appendChild(hintEl);

  const pool = (WIRE_PORTS[theme] || DEFAULT_PORTS).slice(0, count);
  const left = [...pool].sort(() => Math.random() - 0.5);
  const right = [...pool].sort(() => Math.random() - 0.5);

  const board = document.createElement("div");
  board.className = "mg-connect-board";
  const colL = document.createElement("div");
  colL.className = "mg-connect-col";
  const mid = document.createElement("div");
  mid.className = "mg-connect-mid";
  const colR = document.createElement("div");
  colR.className = "mg-connect-col";
  board.append(colL, mid, colR);
  wrap.appendChild(board);

  let selectedLeft = null;
  const paired = new Set();

  function makePort(side, item, index) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mg-port";
    const dot = document.createElement("span");
    dot.className = "mg-port-dot";
    dot.style.background = item.color;
    const icon = document.createElement("span");
    icon.className = "mg-port-icon";
    icon.textContent = item.icon;
    const label = document.createElement("span");
    label.textContent = item.label;
    btn.append(dot, icon, label);
    btn.dataset.color = item.color;

    btn.addEventListener("click", () => {
      if (btn.classList.contains("done")) return;
      if (side === "L") {
        board.querySelectorAll(".mg-port.selected").forEach((n) => n.classList.remove("selected"));
        selectedLeft = { item, index, el: btn };
        btn.classList.add("selected");
      } else if (selectedLeft && selectedLeft.item.color === item.color) {
        paired.add(`L${selectedLeft.index}`);
        paired.add(`R${index}`);
        selectedLeft.el.classList.remove("selected");
        selectedLeft.el.classList.add("done");
        btn.classList.add("done");
        selectedLeft = null;
        if (paired.size === count * 2) onComplete();
      } else if (selectedLeft) {
        selectedLeft.el.classList.remove("selected");
        selectedLeft = null;
      }
    });
    return btn;
  }

  left.forEach((item, i) => colL.appendChild(makePort("L", item, i)));
  right.forEach((item, i) => colR.appendChild(makePort("R", item, i)));
}

function runVisualGauge(wrap, theme, hint, onComplete) {
  const hintEl = document.createElement("p");
  hintEl.className = "mg-hint";
  hintEl.textContent = hint;
  wrap.appendChild(hintEl);

  const gaugeWrap = document.createElement("div");
  gaugeWrap.className = `mg-gauge-wrap mg-gauge-theme-${theme}`;

  const target = 38 + Math.random() * 24;
  const zoneHalf = 14;

  const face = document.createElement("div");
  face.className = "mg-gauge-face";
  const zone = document.createElement("div");
  zone.className = "mg-gauge-zone";
  zone.style.left = `${target - zoneHalf}%`;
  zone.style.width = `${zoneHalf * 2}%`;
  const needle = document.createElement("div");
  needle.className = "mg-gauge-needle";
  face.append(zone, needle);

  const range = document.createElement("input");
  range.type = "range";
  range.min = 0;
  range.max = 100;
  range.value = 50;
  range.className = "mg-gauge-input";

  const labels = document.createElement("div");
  labels.className = "mg-gauge-labels";
  labels.innerHTML = "<span>Min</span><span>OK</span><span>Max</span>";

  gaugeWrap.append(face, range, labels);
  wrap.appendChild(gaugeWrap);

  const progress = document.createElement("p");
  progress.className = "mg-progress";
  progress.textContent = "Muovi il cursore nella zona verde e tieni fermo";
  wrap.appendChild(progress);

  function updateNeedle() {
    const v = Number(range.value);
    const deg = -90 + (v / 100) * 180;
    needle.style.transform = `translateX(-50%) rotate(${deg}deg)`;
  }
  range.addEventListener("input", updateNeedle);
  updateNeedle();

  let hold = 0;
  const need = 20;
  const tick = setInterval(() => {
    const v = Number(range.value);
    if (v >= target - zoneHalf && v <= target + zoneHalf) {
      hold += 1;
      progress.textContent = `Stabile… ${Math.min(100, Math.round((hold / need) * 100))}%`;
      if (hold >= need) {
        clearInterval(tick);
        progress.textContent = "Completato!";
        onComplete();
      }
    } else {
      hold = Math.max(0, hold - 1);
      progress.textContent = "Muovi il cursore nella zona verde e tieni fermo";
    }
  }, 50);
}

function runIconSequence(wrap, theme, steps, hint, onComplete) {
  const icons = SEQ_ICONS[theme] || SEQ_ICONS.technical;
  const hintEl = document.createElement("p");
  hintEl.className = "mg-hint";
  hintEl.textContent = hint;
  wrap.appendChild(hintEl);

  const panel = document.createElement("div");
  panel.className = `mg-panel-lab mg-panel-${theme}`;
  const grid = document.createElement("div");
  grid.className = "mg-icon-grid";

  const seqLen = Math.max(2, Math.min(steps, 4));
  const seq = [];
  for (let i = 0; i < seqLen; i++) {
    seq.push(i % icons.length);
  }

  const buttons = icons.map((icon, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mg-icon-btn";
    b.textContent = icon;
    b.disabled = true;
    b.addEventListener("click", () => onIconTap(idx));
    grid.appendChild(b);
    return b;
  });
  panel.appendChild(grid);
  wrap.appendChild(panel);

  const progress = document.createElement("p");
  progress.className = "mg-progress";
  wrap.appendChild(progress);

  let input = 0;
  let showing = true;

  async function flashSequence() {
    showing = true;
    buttons.forEach((b) => (b.disabled = true));
    input = 0;
    progress.textContent = "Guarda il pannello…";
    for (const idx of seq) {
      buttons[idx].classList.add("lit");
      await sleep(500);
      buttons[idx].classList.remove("lit");
      await sleep(160);
    }
    showing = false;
    buttons.forEach((b) => (b.disabled = false));
    progress.textContent = "Ripeti toccando le icone";
  }

  function onIconTap(idx) {
    if (showing) return;
    if (idx !== seq[input]) {
      progress.textContent = "Ordine sbagliato — riprova";
      flashSequence();
      return;
    }
    input++;
    buttons[idx].classList.add("lit");
    setTimeout(() => buttons[idx].classList.remove("lit"), 140);
    if (input >= seq.length) {
      progress.textContent = "Completato!";
      onComplete();
    }
  }

  flashSequence();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function makeDraggableToTarget(piece, target, onSuccess) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  const root = piece.closest(".minigame") || document.body;

  function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function tryDrop() {
    if (rectsOverlap(piece.getBoundingClientRect(), target.getBoundingClientRect())) {
      onSuccess();
      return true;
    }
    return false;
  }

  piece.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    piece.classList.add("mg-dragging");
    const r = piece.getBoundingClientRect();
    root.appendChild(piece);
    piece.style.position = "fixed";
    piece.style.left = `${r.left}px`;
    piece.style.top = `${r.top}px`;
    offsetX = e.clientX - r.left - r.width / 2;
    offsetY = e.clientY - r.top - r.height / 2;
    piece.setPointerCapture(e.pointerId);
  });

  piece.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    piece.style.left = `${e.clientX - offsetX - piece.offsetWidth / 2}px`;
    piece.style.top = `${e.clientY - offsetY - piece.offsetHeight / 2}px`;
    target.classList.toggle("mg-target-hover", rectsOverlap(piece.getBoundingClientRect(), target.getBoundingClientRect()));
  });

  piece.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    piece.classList.remove("mg-dragging");
    target.classList.remove("mg-target-hover");
    if (!tryDrop()) {
      piece.style.position = "absolute";
      piece.style.left = piece.dataset.homeLeft || "10%";
      piece.style.top = piece.dataset.homeTop || "8%";
      piece.style.transform = "";
      piece.closest(".mg-lens-mat")?.appendChild(piece);
    }
  });
}

window.MG_HELPERS = {
  runDragDrop,
  runVisualConnect,
  runVisualGauge,
  makeDraggableToTarget,
};

window.renderMinigame = renderMinigame;
