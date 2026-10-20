/** Stanze spia: cerca documenti (sposta mobili) o usa la macchinetta */
(function () {
  const DECOY_TITLES = [
    "Turni mensa",
    "Ordine cancelleria",
    "Richiesta ferie",
    "Bolletta elettrica Zia",
    "Lista laveria",
    "Modulo badge visitatori",
    "Rapporto meteo civile",
    "Inventario PX",
    "Nota parcheggio",
    "Circolare antincendio",
  ];

  /** Stanza con macchinetta (reader) vs spostare mobili (search) */
  const READER_ROOMS = new Set([
    "building-a",
    "building-t",
    "post-office",
    "warehouse",
    "pass-p",
    "px",
    "building-u",
    "dispensary",
    "commissary",
  ]);

  function pickDecoys(count, seed) {
    const pool = [...DECOY_TITLES];
    let s = seed;
    const out = [];
    for (let i = 0; i < count; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const idx = s % pool.length;
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function roomMode(loc) {
    if (loc.oppenheimerHub) return "reader";
    return READER_ROOMS.has(loc.id) ? "reader" : "search";
  }

  const LAB_THEMES = new Set(["plutonium", "chemistry", "medical", "cryo", "health", "technical"]);

  function roomVisual(loc) {
    const t = loc.theme || "office";
    if (t === "plutonium") return "lab-pu";
    if (LAB_THEMES.has(t)) return "lab";
    if (["machineShop", "foundry", "maintenance", "heAssembly", "explosives", "heTransfer"].includes(t)) {
      return "workshop";
    }
    if (loc.oppenheimerHub || t === "director") return "director";
    if (["postOffice", "passOffice", "warehouse", "px", "commissary"].includes(t)) return "archive";
    return "office";
  }

  function backdropHTML(visual) {
    if (visual === "lab" || visual === "lab-pu") {
      return `
        <div class="spy-lab-wall"></div>
        <div class="spy-lab-tiles"></div>
        <div class="spy-lab-bench"></div>
        <div class="spy-lab-rail"></div>
        <div class="spy-microscope" title="Microscopio">
          <div class="spy-micro-base"></div>
          <div class="spy-micro-pillar"></div>
          <div class="spy-micro-arm"></div>
          <div class="spy-micro-tube"></div>
          <div class="spy-micro-eyepiece"></div>
          <div class="spy-micro-stage"></div>
          <div class="spy-micro-light"></div>
        </div>
        <div class="spy-beaker spy-beaker-a"><span class="spy-liquid amber"></span><span class="spy-beaker-mark"></span></div>
        <div class="spy-beaker spy-beaker-b"><span class="spy-liquid cyan"></span><span class="spy-beaker-mark"></span></div>
        <div class="spy-erlenmeyer"><span class="spy-liquid green"></span></div>
        <div class="spy-petri"></div>
        ${visual === "lab-pu" ? '<div class="spy-glovebox"><div class="spy-glovebox-glass"></div><span class="spy-glovebox-label">Glove box</span></div>' : ""}
      `;
    }
    if (visual === "workshop") {
      return `
        <div class="spy-shop-wall"></div>
        <div class="spy-shop-bench"></div>
        <div class="spy-shop-vice"></div>
        <div class="spy-shop-tools"></div>
      `;
    }
    if (visual === "director") {
      return `
        <div class="spy-dir-wall"></div>
        <div class="spy-dir-window"></div>
        <div class="spy-dir-desk"></div>
        <div class="spy-dir-flag"></div>
      `;
    }
    if (visual === "archive") {
      return `
        <div class="spy-arch-wall"></div>
        <div class="spy-arch-shelf"></div>
        <div class="spy-arch-shelf spy-arch-shelf-2"></div>
        <div class="spy-arch-lamp"></div>
      `;
    }
    return `
      <div class="spy-off-wall"></div>
      <div class="spy-off-desk"></div>
      <div class="spy-off-lamp"></div>
      <div class="spy-off-plant"></div>
    `;
  }

  function attachBackdrop(scene, visual) {
    const deco = document.createElement("div");
    deco.className = `spy-room-deco spy-deco-${visual}`;
    deco.setAttribute("aria-hidden", "true");
    deco.innerHTML = backdropHTML(visual);
    scene.appendChild(deco);
  }

  function movablesForVisual(visual) {
    if (visual === "lab" || visual === "lab-pu") {
      return [
        { id: "drawer", label: "Cassetto banco", visual: "lab-drawer", x: 18, y: 78, reveals: "spot-a" },
        { id: "coat", label: "Camice", visual: "lab-coat", x: 78, y: 42, reveals: "spot-b" },
        { id: "cabinet", label: "Armadio reagenti", visual: "lab-cabinet", x: 48, y: 32, reveals: "spot-c" },
      ];
    }
    if (visual === "workshop") {
      return [
        { id: "cart", label: "Carrello", visual: "shop-cart", x: 12, y: 62, reveals: "spot-a" },
        { id: "crate", label: "Cassa attrezzi", visual: "shop-crate", x: 58, y: 70, reveals: "spot-b" },
        { id: "cabinet", label: "Armadietto", visual: "shop-locker", x: 40, y: 30, reveals: "spot-c" },
      ];
    }
    return [
      { id: "table", label: "Tavolo", visual: "furniture-table", x: 10, y: 58, reveals: "spot-a" },
      { id: "shoes", label: "Scarpe", visual: "furniture-shoes", x: 65, y: 72, reveals: "spot-b" },
      { id: "cabinet", label: "Armadio", visual: "furniture-cabinet", x: 38, y: 28, reveals: "spot-c" },
    ];
  }

  function buildDocList(loc) {
    const correct =
      loc.intelSteal ||
      (loc.oppenheimerHub ? "Briefing classificato Project Y" : "Documento utile a Mosca");
    const short =
      correct.length > 42 ? `${correct.slice(0, 40)}…` : correct;
    const decoys = pickDecoys(3, hashStr(loc.id));
    const docs = decoys.map((title, i) => ({
      id: `decoy-${i}`,
      title,
      correct: false,
    }));
    const insertAt = hashStr(loc.id + "x") % (docs.length + 1);
    docs.splice(insertAt, 0, { id: "target", title: short, correct: true });
    return docs;
  }

  function hubExtraDocs() {
    return [
      { id: "spy-copy", title: "Schema lenti implosione (Fat Man)", correct: true, hubTask: "spy-copy" },
      { id: "spy-micro", title: "Microfilm posta PO Box 1663", correct: true, hubTask: "spy-micro" },
      { id: "decoy-h1", title: "Menu Commissary", correct: false },
      { id: "decoy-h2", title: "Orari Motor pool", correct: false },
    ];
  }

  function renderSpyInvestigation(container, loc, spyState, onResult) {
    container.innerHTML = "";
    const visual = roomVisual(loc);
    const wrap = document.createElement("div");
    wrap.className = `spy-room spy-room-${roomMode(loc)} spy-visual-${visual}`;
    container.appendChild(wrap);

    const hint = document.createElement("p");
    hint.className = "spy-room-hint";
    hint.textContent =
      roomMode(loc) === "reader"
        ? "Esamina le pile di carta e inserisci nella macchinetta solo il documento giusto per Mosca."
        : "Sposta scarpe, tavoli o armadi: sotto potrebbe esserci qualcosa di classificato.";
    wrap.appendChild(hint);

    const status = document.createElement("p");
    status.className = "spy-room-status";
    status.textContent = "Cerca…";
    wrap.appendChild(status);

    const mode = roomMode(loc);
    if (mode === "reader") {
      runReaderRoom(wrap, loc, spyState, status, onResult, visual);
    } else {
      runSearchRoom(wrap, loc, spyState, status, onResult, visual);
    }
  }

  function runReaderRoom(wrap, loc, spyState, status, onResult, visual) {
    let docs = [];
    const hubExtras = hubExtraDocs().filter((d) => d.hubTask && !spyState.spyIntelDone.has(d.hubTask));
    if (loc.oppenheimerHub) {
      if (!spyState.stolenAt.has(loc.id)) {
        docs = [...buildDocList(loc), ...hubExtras];
      } else {
        docs = [...hubExtras];
      }
    } else {
      docs = buildDocList(loc);
    }
    if (docs.length === 0) {
      status.textContent = "Non resta nulla da rubare qui.";
      return;
    }

    const scene = document.createElement("div");
    scene.className = `spy-reader-scene spy-scene-${visual}`;
    attachBackdrop(scene, visual);

    const content = document.createElement("div");
    content.className = "spy-scene-content";

    const machine = document.createElement("div");
    machine.className = "spy-machine";
    const machineTitle =
      visual === "lab" || visual === "lab-pu"
        ? "Scanner da banco / registro lab"
        : visual === "archive"
          ? "Censura & archivio"
          : "Lettore documenti";
    machine.innerHTML = `<div class="spy-machine-top">${machineTitle}</div><div class="spy-machine-body"><div class="spy-machine-screen"></div><div class="spy-machine-slot">Inserisci documento</div></div><div class="spy-machine-light"></div>`;

    const pile = document.createElement("div");
    pile.className = "spy-doc-pile";
    const pileLabel = document.createElement("p");
    pileLabel.className = "spy-pile-label";
    pileLabel.textContent = "Materiali sul banco";
    pile.appendChild(pileLabel);

    const slot = machine.querySelector(".spy-machine-slot");
    const light = machine.querySelector(".spy-machine-light");

    docs.forEach((doc) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "spy-doc-chip";
      chip.textContent = doc.title;
      chip.draggable = true;
      chip.dataset.docId = doc.id;
      chip.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", doc.id);
        chip.classList.add("dragging");
      });
      chip.addEventListener("dragend", () => chip.classList.remove("dragging"));
      chip.addEventListener("click", () => tryInsert(doc, chip));
      pile.appendChild(chip);
    });

    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("hover");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("hover"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("hover");
      const id = e.dataTransfer.getData("text/plain");
      const doc = docs.find((d) => d.id === id);
      const chip = pile.querySelector(`[data-doc-id="${id}"]`);
      if (doc && chip) tryInsert(doc, chip);
    });

    function tryInsert(doc, chip) {
      light.classList.remove("ok", "bad");
      if (doc.correct) {
        light.classList.add("ok");
        status.textContent = "Documento giusto — copiato!";
        chip.disabled = true;
        chip.classList.add("taken");
        setTimeout(() => onResult({ ok: true, hubTask: doc.hubTask || null }), 600);
      } else {
        light.classList.add("bad");
        status.textContent = "Solo documenti innocui — prova un altro.";
        machine.classList.add("shake");
        setTimeout(() => machine.classList.remove("shake"), 400);
      }
    }

    content.append(machine, pile);
    scene.appendChild(content);
    wrap.appendChild(scene);
  }

  function runSearchRoom(wrap, loc, spyState, status, onResult, visual) {
    const docs = buildDocList(loc);
    const hiddenId = docs.find((d) => d.correct)?.id;

    const scene = document.createElement("div");
    scene.className = `spy-search-scene spy-scene-${visual}`;
    attachBackdrop(scene, visual);

    const interact = document.createElement("div");
    interact.className = "spy-scene-interact";
    scene.appendChild(interact);

    const movables = movablesForVisual(visual);

    const spots = {
      "spot-a": { x: 10, y: 72, docId: docs[0]?.id },
      "spot-b": { x: 64, y: 82, docId: docs[1]?.id },
      "spot-c": { x: 42, y: 48, docId: docs[2]?.id },
    };
    const correctSpot = ["spot-a", "spot-b", "spot-c"][hashStr(loc.id) % 3];
    spots[correctSpot].docId = hiddenId;
    for (const k of Object.keys(spots)) {
      if (k !== correctSpot) {
        const wrong = docs.find((d) => !d.correct && d.id !== hiddenId);
        spots[k].docId = wrong?.id || docs[0].id;
      }
    }

    const revealed = new Set();

    movables.forEach((m) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = `spy-movable spy-movable-${m.visual}`;
      el.style.left = `${m.x}%`;
      el.style.top = `${m.y}%`;
      el.innerHTML = `<span class="spy-movable-sprite" aria-hidden="true"></span><span class="spy-movable-label">${m.label}</span>`;
      el.title = `Trascina ${m.label}`;

      let drag = false;
      let ox = 0;
      let oy = 0;
      let startX = 0;
      let startY = 0;

      el.addEventListener("pointerdown", (e) => {
        drag = true;
        startX = e.clientX;
        startY = e.clientY;
        ox = el.offsetLeft;
        oy = el.offsetTop;
        el.setPointerCapture(e.pointerId);
        el.classList.add("dragging");
      });

      el.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.hypot(dx, dy) > 24 && !revealed.has(m.reveals)) {
          revealed.add(m.reveals);
          showSpot(m.reveals);
          status.textContent = "Hai scoperto qualcosa sotto — clicca il documento se è quello giusto.";
        }
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      el.addEventListener("pointerup", (e) => {
        if (!drag) return;
        drag = false;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove("dragging");
      });

      interact.appendChild(el);
    });

    function showSpot(spotKey) {
      const spot = spots[spotKey];
      if (!spot || interact.querySelector(`[data-spot="${spotKey}"]`)) return;
      const doc = docs.find((d) => d.id === spot.docId);
      if (!doc) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spy-hidden-doc";
      btn.dataset.spot = spotKey;
      btn.style.left = `${spot.x}%`;
      btn.style.top = `${spot.y}%`;
      btn.textContent = `📄 ${doc.title}`;
      btn.addEventListener("click", () => {
        if (doc.correct) {
          status.textContent = "Intelligence recuperata!";
          btn.classList.add("taken");
          setTimeout(() => onResult({ ok: true }), 500);
        } else {
          status.textContent = "Solo carte inutili — cerca altrove o sotto altro mobile.";
          btn.classList.add("wrong");
        }
      });
      interact.appendChild(btn);
    }

    wrap.appendChild(scene);
    status.textContent =
      visual === "lab" || visual === "lab-pu"
        ? "Sposta cassetto, camice o armadio reagenti — il documento può essere nascosto sotto."
        : "Trascina gli oggetti per cercare documenti nascosti.";
  }

  window.MP_SPY = {
    renderSpyInvestigation,
    roomMode,
  };
})();
