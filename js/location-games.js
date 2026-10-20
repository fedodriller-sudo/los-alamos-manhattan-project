/** Minigiochi legati al tipo di luogo (non solo “scatola sinistra-destra”) */
(function () {
  function hash(id) {
    let h = 2166136261;
    const s = String(id || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, seed) {
    const rng = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const GATE_ROSTER = [
    { name: "Enrico Fermi", role: "Metallurgia", badge: "Q-4421", initials: "EF", hue: 208 },
    { name: "Richard Feynman", role: "Gruppo T", badge: "Q-5102", initials: "RF", hue: 42 },
    { name: "Hans Bethe", role: "Teoria", badge: "Q-3888", initials: "HB", hue: 152 },
    { name: "Niels Bohr", role: "Consultant", badge: "Q-2201", initials: "NB", hue: 268 },
    { name: "Leo Szilard", role: "Reattori", badge: "Q-3310", initials: "LS", hue: 12 },
    { name: "Eleanor J.", role: "Calcolatrici", badge: "Q-7744", initials: "EJ", hue: 320 },
    { name: "Capt. Parsons", role: "Ordnance", badge: "M-1022", initials: "CP", hue: 185 },
    { name: "Gen. Groves", role: "District", badge: "M-0001", initials: "GG", hue: 45 },
    { name: "K. Greisen", role: "Ciclotrone", badge: "Q-6190", initials: "KG", hue: 198 },
    { name: "L. Slotin", role: "Criticità", badge: "Q-5588", initials: "LS", hue: 88 },
    { name: "D. Hughes", role: "Neutroni", badge: "Q-4820", initials: "DH", hue: 225 },
    { name: "R. Wilson", role: "Protoni", badge: "Q-4933", initials: "RW", hue: 160 },
    { name: "V. Weisskopf", role: "HE", badge: "Q-5011", initials: "VW", hue: 280 },
    { name: "P. Morrison", role: "Logistica", badge: "Q-5402", initials: "PM", hue: 30 },
    { name: "E. Teller", role: "Idrogeno", badge: "Q-5701", initials: "ET", hue: 350 },
    { name: "C. Lauritsen", role: "Elettronica", badge: "Q-4555", initials: "CL", hue: 120 },
    { name: "I. Rabi", role: "Magneti", badge: "Q-4999", initials: "IR", hue: 200 },
    { name: "F. Lawrence", role: "Berkeley liaison", badge: "Q-6100", initials: "FL", hue: 55 },
  ];

  function dragPiece(piece, onDrop) {
    let drag = false;
    let ox = 0;
    let oy = 0;
    const down = (e) => {
      drag = true;
      const r = piece.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      ox = p.clientX - r.left;
      oy = p.clientY - r.top;
      piece.style.position = "fixed";
      piece.style.zIndex = "200";
      e.preventDefault();
    };
    const move = (e) => {
      if (!drag) return;
      const p = e.touches ? e.touches[0] : e;
      piece.style.left = `${p.clientX - ox}px`;
      piece.style.top = `${p.clientY - oy}px`;
    };
    const up = (e) => {
      if (!drag) return;
      drag = false;
      onDrop(piece, e.changedTouches ? e.changedTouches[0] : e);
    };
    piece.addEventListener("mousedown", down);
    piece.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
  }

  /** Plutonio: da camera A a camera B nel glove box */
  function runPuShuttle(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "Trascina il campione di plutonio dalla camera di lavoro alla camera di confezionamento (senza uscire dal glove box).";
    const box = document.createElement("div");
    box.className = "lg-glove-lane";
    box.innerHTML =
      '<div class="lg-chamber lg-chamber-from"><span>Camera lavoro</span></div>' +
      '<div class="lg-glove-mid"></div>' +
      '<div class="lg-chamber lg-chamber-to"><span>Pit / confezione</span></div>';
    const pu = document.createElement("div");
    pu.className = "lg-pu-piece";
    pu.textContent = "Pu";
    box.querySelector(".lg-chamber-from").appendChild(pu);
    const status = document.createElement("p");
    status.className = "mg-progress";
    wrap.append(hint, box, status);
    const target = box.querySelector(".lg-chamber-to");
    dragPiece(pu, (el, ev) => {
      const tr = target.getBoundingClientRect();
      if (ev.clientX >= tr.left && ev.clientX <= tr.right && ev.clientY >= tr.top && ev.clientY <= tr.bottom) {
        target.appendChild(el);
        el.style.position = "relative";
        el.style.left = "";
        el.style.top = "";
        status.textContent = "Trasferimento Pu completato.";
        setTimeout(onComplete, 450);
      } else {
        el.style.position = "relative";
        el.style.left = "";
        el.style.top = "";
        box.querySelector(".lg-chamber-from").appendChild(el);
        status.textContent = "Rilascia nella camera di destra.";
      }
    });
  }

  /** Fonderia/officina: taglio a fiamma sulla piastra */
  function runFlameCut(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "Passa la fiamma sul contorno della sagoma (tieni premuto e segui il tratteggio).";
    const plate = document.createElement("div");
    plate.className = "lg-metal-plate";
    const path = document.createElement("div");
    path.className = "lg-cut-path";
    const flame = document.createElement("div");
    flame.className = "lg-flame";
    flame.textContent = "🔥";
    plate.append(path, flame);
    const prog = document.createElement("div");
    prog.className = "lg-cut-progress";
    prog.innerHTML = '<div class="lg-cut-fill"></div>';
    const fill = prog.querySelector(".lg-cut-fill");
    const status = document.createElement("p");
    status.className = "mg-progress";
    wrap.append(hint, plate, prog, status);
    let cut = 0;
    let burning = false;
    plate.addEventListener("mousedown", () => {
      burning = true;
    });
    plate.addEventListener("mouseup", () => {
      burning = false;
    });
    plate.addEventListener("mouseleave", () => {
      burning = false;
    });
    plate.addEventListener("mousemove", (e) => {
      const r = plate.getBoundingClientRect();
      flame.style.left = `${e.clientX - r.left - 12}px`;
      flame.style.top = `${e.clientY - r.top - 12}px`;
      if (!burning) return;
      const pr = path.getBoundingClientRect();
      if (
        e.clientX >= pr.left &&
        e.clientX <= pr.right &&
        e.clientY >= pr.top &&
        e.clientY <= pr.bottom
      ) {
        cut = Math.min(100, cut + 2.2);
        fill.style.width = `${cut}%`;
        if (cut >= 100) {
          status.textContent = "Sagoma tagliata.";
          setTimeout(onComplete, 450);
        }
      }
    });
  }

  /** Magazzino / parco veicoli: carico casse sul camion */
  function runTruckLoad(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Carica tutte le casse classificate sul pianale del camion.";
    const scene = document.createElement("div");
    scene.className = "lg-truck-scene";
    scene.innerHTML =
      '<div class="lg-dock"></div><div class="lg-truck"><div class="lg-truck-bed"></div><span class="lg-truck-cab">🚛</span></div>';
    const dock = scene.querySelector(".lg-dock");
    const bed = scene.querySelector(".lg-truck-bed");
    const need = 3;
    let loaded = 0;
    for (let i = 0; i < need; i++) {
      const c = document.createElement("div");
      c.className = "lg-crate";
      c.textContent = "📦";
      c.dataset.idx = String(i);
      dock.appendChild(c);
      dragPiece(c, (el, ev) => {
        const br = bed.getBoundingClientRect();
        if (ev.clientX >= br.left && ev.clientX <= br.right && ev.clientY >= br.top && ev.clientY <= br.bottom) {
          el.style.position = "relative";
          el.style.left = "";
          el.style.top = "";
          bed.appendChild(el);
          loaded += 1;
          if (loaded >= need) setTimeout(onComplete, 450);
        } else {
          el.style.position = "relative";
          el.style.left = "";
          el.style.top = "";
          dock.appendChild(el);
        }
      });
    }
    const status = document.createElement("p");
    status.className = "mg-progress";
    status.textContent = `Caricate: ${loaded}/${need}`;
    const iv = setInterval(() => {
      status.textContent = `Caricate: ${loaded}/${need}`;
      if (loaded >= need) clearInterval(iv);
    }, 200);
    wrap.append(hint, scene, status);
  }

  /** Lavanderia / pavimenti: pulizia piastrelle */
  function runFloorClean(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent = ctx.hint || "Trascina il mocio su tutte le piastrelle sporche finché sono pulite.";
    const floor = document.createElement("div");
    floor.className = "lg-floor";
    const dirty = 10 + (hash(ctx.taskId) % 4);
    const tiles = [];
    for (let i = 0; i < 16; i++) {
      const t = document.createElement("div");
      t.className = "lg-tile" + (i < dirty ? " lg-tile-dirty" : "");
      floor.appendChild(t);
      tiles.push(t);
    }
    const mop = document.createElement("div");
    mop.className = "lg-mop";
    mop.textContent = "🧹";
    const status = document.createElement("p");
    status.className = "mg-progress";
    wrap.append(hint, floor, mop, status);
    let cleaned = 0;
    function tryClean(ev) {
      tiles.forEach((t) => {
        if (!t.classList.contains("lg-tile-dirty")) return;
        const r = t.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
          t.classList.remove("lg-tile-dirty");
          cleaned += 1;
        }
      });
      status.textContent = `Pulito: ${cleaned}/${dirty}`;
      if (cleaned >= dirty) setTimeout(onComplete, 450);
    }
    dragPiece(mop, (_el, ev) => {
      mop.style.position = "relative";
      mop.style.left = "";
      mop.style.top = "";
      tryClean(ev);
    });
    floor.addEventListener("mousemove", (e) => {
      if (mop.style.position === "fixed") tryClean(e);
    });
  }

  function avatarHtml(person, extraClass) {
    const bg = `background:hsl(${person.hue},52%,58%)`;
    return `<span class="lg-avatar ${extraClass || ""}" style="${bg}">${person.initials}</span>`;
  }

  /** Ufficio pass / PX: controllo accessi con roster variabile */
  function runGateIdentify(wrap, ctx, onComplete) {
    const seed = hash(`${ctx.taskId}|${ctx.locationId}|${ctx.theme}`);
    const rng = mulberry32(seed);
    const isPx = ctx.locationId === "px";
    const gateTitle = isPx
      ? "Post Exchange · ingresso Tech Area"
      : "Ufficio pass · cancello Q-clearance";

    const pool = shuffle(GATE_ROSTER, seed);
    const manifest = pool.slice(0, 3);
    const intruderBase = pool[3];
    const flaw = Math.floor(rng() * 3);

    const visitors = manifest.map((p) => ({
      ...p,
      displayName: p.name,
      displayBadge: p.badge,
      displayRole: p.role,
      ok: true,
      flawNote: "",
    }));

    const badSlot = Math.floor(rng() * 3);
    const intruder = { ...intruderBase };
    if (flaw === 0) {
      intruder.displayName = intruder.name;
      intruder.displayBadge = manifest[badSlot].badge;
      intruder.displayRole = intruder.role;
      intruder.flawNote = "Badge rubato / non corrisponde al nome";
    } else if (flaw === 1) {
      intruder.displayName = intruder.name;
      intruder.displayBadge = intruder.badge;
      intruder.displayRole = intruder.role;
      intruder.flawNote = "Non compare sul manifesto di oggi";
    } else {
      intruder.displayName = manifest[badSlot].name;
      intruder.displayBadge = `Q-${1000 + Math.floor(rng() * 8000)}`;
      intruder.displayRole = manifest[badSlot].role;
      intruder.initials = manifest[badSlot].initials;
      intruder.hue = manifest[badSlot].hue + 40;
      intruder.flawNote = "Numero badge errato per questo nominativo";
    }
    intruder.ok = false;
    visitors[badSlot] = intruder;

    const queue = shuffle(
      visitors.map((v, i) => ({ ...v, slot: i })),
      seed ^ 0x9e3779b9
    );

    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint ||
      "Confronta manifesto e badge: ferma chi non è autorizzato (nome, numero o assenza in lista).";

    const booth = document.createElement("div");
    booth.className = "lg-gate-booth";

    const manifestPanel = document.createElement("div");
    manifestPanel.className = "lg-manifest-panel";
    manifestPanel.innerHTML = `<h4 class="lg-gate-title">${gateTitle}</h4><p class="lg-manifest-date">Manifesto · turno odierno</p>`;
    const table = document.createElement("table");
    table.className = "lg-manifest-table";
    table.innerHTML = "<thead><tr><th>Nome</th><th>Ruolo</th><th>Badge</th></tr></thead>";
    const tbody = document.createElement("tbody");
    manifest.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${avatarHtml(p, "lg-avatar-xs")} ${p.name}</td><td>${p.role}</td><td><code>${p.badge}</code></td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    manifestPanel.append(table);

    const lane = document.createElement("div");
    lane.className = "lg-gate-lane";
    lane.innerHTML = '<p class="lg-lane-label">Corsia visitatori</p>';

    const status = document.createElement("p");
    status.className = "mg-progress";

    queue.forEach((person) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "lg-visitor-card" + (person.ok ? "" : " lg-visitor-suspect-hint");
      const stamp = person.ok
        ? '<span class="lg-stamp lg-stamp-ok">OK</span>'
        : '<span class="lg-stamp lg-stamp-warn">?</span>';
      card.innerHTML =
        `${avatarHtml(person, "lg-avatar-lg")}` +
        `<strong>${person.displayName}</strong>` +
        `<span class="lg-visitor-role">${person.displayRole}</span>` +
        `<span class="lg-visitor-badge">Badge <code>${person.displayBadge}</code></span>` +
        stamp;
      card.addEventListener("click", () => {
        if (!person.ok) {
          status.textContent = `Corretto: ${person.flawNote}. Accesso negato — allerta sicurezza.`;
          card.classList.add("lg-visitor-denied");
          setTimeout(onComplete, 650);
        } else {
          status.textContent = `${person.displayName} è sul manifesto con badge coerente. Cerca l’anomalia.`;
          card.classList.add("lg-visitor-cleared");
          setTimeout(() => card.classList.remove("lg-visitor-cleared"), 500);
        }
      });
      lane.appendChild(card);
    });

    booth.append(manifestPanel, lane);
    wrap.append(hint, booth, status);
  }

  window.MP_LOC_GAMES = {
    runPuShuttle,
    runFlameCut,
    runTruckLoad,
    runFloorClean,
    runGateIdentify,
  };
})();
