/** Identità visiva missioni e minigiochi (product design in-game) */
(function () {
  const SCENE_UI = {
    puShuttle: { icon: "☢", type: "Glove box", hue: 152 },
    puRadiationBalance: { icon: "📟", type: "Dosimetria", hue: 152 },
    puTongsPurify: { icon: "🧪", type: "Purificazione", hue: 152 },
    puTongsPit: { icon: "◎", type: "Nocciolo Pu", hue: 152 },
    flameCut: { icon: "🔥", type: "Taglio plasma", hue: 28 },
    compositionQuench: { icon: "🌡", type: "Quench HE", hue: 28 },
    truckLoad: { icon: "🚛", type: "Carico", hue: 42 },
    floorClean: { icon: "🧹", type: "Decontaminazione", hue: 198 },
    gateIdentify: { icon: "🛂", type: "Controllo accessi", hue: 45 },
    heTorqueBolts: { icon: "🔩", type: "Coppia HE", hue: 28 },
    cyclotronDualTrim: { icon: "⚛", type: "Ciclotrone", hue: 268 },
    cryoDewarFill: { icon: "❄", type: "Criogenia", hue: 200 },
    neutronFluxBalance: { icon: "📊", type: "Neutroni", hue: 268 },
    geigerSweep: { icon: "📻", type: "Geiger", hue: 152 },
    timerStop: { icon: "⏱", type: "Sincronia", hue: 210 },
    symbolMatch: { icon: "⌁", type: "Sequenza", hue: 210 },
    patchPanel: { icon: "🔌", type: "Pannello", hue: 210 },
    airValves: { icon: "🌀", type: "Valvole aria", hue: 198 },
    lensMat: { icon: "◈", type: "Lenti HE", hue: 28 },
    beamCrosshair: { icon: "⊕", type: "Fascio", hue: 268 },
    hvLevers: { icon: "⇅", type: "Alta tensione", hue: 268 },
    valveWheel: { icon: "◎", type: "Valvola", hue: 198 },
    reagentPour: { icon: "⚗", type: "Reagenti", hue: 165 },
    microfilmPull: { icon: "🎞", type: "Microfilm", hue: 280 },
    connect: { icon: "⎔", type: "Collegamenti", hue: 210 },
    gauge: { icon: "◐", type: "Strumentazione", hue: 210 },
    dragArchive: { icon: "📁", type: "Archivio", hue: 45 },
    dragBriefcase: { icon: "💼", type: "Intelligence", hue: 280 },
    dragHE: { icon: "💥", type: "Esplosivo", hue: 28 },
    dragCrucible: { icon: "🫗", type: "Fonderia", hue: 28 },
    dragCrateSort: { icon: "📦", type: "Magazzino", hue: 42 },
    dragFuel: { icon: "⛽", type: "Convoglio", hue: 42 },
    dragBadgeReader: { icon: "🪪", type: "Badge", hue: 45 },
    dragCoat: { icon: "🥼", type: "Lavanderia", hue: 198 },
    dragCensor: { icon: "✉", type: "Censura", hue: 45 },
    dragLathe: { icon: "⚙", type: "Tornio", hue: 35 },
    dragMedkit: { icon: "🏥", type: "Sanità", hue: 165 },
    dragPxBox: { icon: "🛒", type: "PX", hue: 45 },
    dragStamp: { icon: "📋", type: "Classificato", hue: 45 },
    dragVial: { icon: "🧫", type: "Campione", hue: 165 },
    dragWrench: { icon: "🔧", type: "Officina", hue: 35 },
    dragCoal: { icon: "♨", type: "Centrale", hue: 25 },
    dragCryo: { icon: "❄", type: "Azoto", hue: 200 },
    dragLabel: { icon: "🏷", type: "Etichetta", hue: 42 },
    dragMensa: { icon: "🍽", type: "Mensa", hue: 42 },
    dragPrimer: { icon: "📘", type: "Primer", hue: 45 },
    dragTool: { icon: "🛠", type: "Utensili", hue: 35 },
    dragBadges: { icon: "🪪", type: "Clearance", hue: 45 },
  };

  const THEME_UI = {
    plutonium: { icon: "☢", label: "Plutonio" },
    technical: { icon: "⚙", label: "Technical" },
    director: { icon: "★", label: "Direzione" },
    espionage: { icon: "🕵", label: "Spionaggio" },
    heAssembly: { icon: "💥", label: "HE" },
    explosives: { icon: "🧨", label: "Sigma" },
    machineShop: { icon: "🔧", label: "Officina" },
    foundry: { icon: "🔥", label: "Fonderia" },
    warehouse: { icon: "📦", label: "Magazzino" },
    motorPool: { icon: "🚛", label: "Veicoli" },
    passOffice: { icon: "🛂", label: "Pass" },
    px: { icon: "🛒", label: "PX" },
    laundry: { icon: "🥼", label: "Lavanderia" },
    chemistry: { icon: "⚗", label: "Chimica" },
    cryo: { icon: "❄", label: "Criogenia" },
    cyclotron: { icon: "⚛", label: "Ciclotrone" },
    neutrons: { icon: "◎", label: "Neutroni" },
    health: { icon: "🏥", label: "Health" },
    boiler: { icon: "♨", label: "Centrale" },
  };

  function sceneForTask(taskId, locationId) {
    return window.MG_SCENES?.sceneForTask?.(taskId, locationId) || null;
  }

  function visualForTask(taskId, locationId, theme) {
    const sid = sceneForTask(taskId, locationId);
    if (sid && SCENE_UI[sid]) return { ...SCENE_UI[sid], sceneId: sid };
    const th = THEME_UI[theme] || THEME_UI.technical;
    return { icon: th.icon, type: th.label, hue: 210, sceneId: sid };
  }

  function decorateMinigame(wrap, ctx) {
    const v = visualForTask(ctx.taskId, ctx.locationId, ctx.theme);
    wrap.classList.add("mg-product-shell");
    wrap.style.setProperty("--mg-accent-hue", String(v.hue));
    const chrome = document.createElement("div");
    chrome.className = "mg-product-chrome";
    chrome.innerHTML =
      `<span class="mg-product-icon" aria-hidden="true">${v.icon}</span>` +
      `<div class="mg-product-titles">` +
      `<span class="mg-product-type">${v.type}</span>` +
      `<span class="mg-product-scene">${v.sceneId ? v.sceneId.replace(/([A-Z])/g, " $1").trim() : "Missione"}</span>` +
      `</div>`;
    const body = document.createElement("div");
    body.className = "mg-product-body";
    while (wrap.firstChild) body.appendChild(wrap.firstChild);
    wrap.append(chrome, body);
  }

  function missionCardHtml(task, loc) {
    const v = visualForTask(task.id, loc.id, task.theme || loc.theme);
    const crit = task.oppenheimer ? '<span class="mission-card-crit">Critico</span>' : "";
    return (
      `<span class="mission-card-icon" style="--card-hue:${v.hue}">${v.icon}</span>` +
      `<span class="mission-card-text">` +
      `<span class="mission-card-type">${v.type}${crit}</span>` +
      `<span class="mission-card-name">${task.name}</span>` +
      `</span>`
    );
  }

  window.MP_MISSION_UI = {
    visualForTask,
    decorateMinigame,
    missionCardHtml,
    SCENE_UI,
    THEME_UI,
  };
})();
