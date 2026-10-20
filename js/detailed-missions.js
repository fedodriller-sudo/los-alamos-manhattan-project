/** Minigiochi dettagliati (dosimetria, coppia, criogenia, ecc.) */
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

  function runPuRadiationBalance(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint ||
      "Aggiungi plutonio al nocciolo: il dosimetro deve restare nella fascia verde (mR/h sicuri). Conferma quando massa e dose sono OK.";
    const panel = document.createElement("div");
    panel.className = "mg-dose-panel";
    const meter = document.createElement("div");
    meter.className = "mg-dose-meter";
    meter.innerHTML =
      '<div class="mg-dose-scale"><span>0</span><span class="mg-dose-safe">SICURO</span><span>80</span></div>' +
      '<div class="mg-dose-needle-wrap"><div class="mg-dose-safe-band"></div><div class="mg-dose-needle"></div></div>' +
      '<p class="mg-dose-readout">0 mR/h</p>';
    const massRow = document.createElement("label");
    massRow.className = "mg-dose-mass";
    massRow.textContent = "Massa Pu aggiunta (g): ";
    const massVal = document.createElement("span");
    massVal.textContent = "0";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = "0";
    slider.className = "mg-dose-slider";
    const targetMass = 28 + (hash(ctx.taskId) % 35);
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "btn primary small";
    confirm.textContent = "Conferma carica";
    const status = document.createElement("p");
    status.className = "mg-progress";
    massRow.append(massVal, slider);
    panel.append(meter, massRow);
    wrap.append(hint, panel, confirm, status);
    const needle = meter.querySelector(".mg-dose-needle");
    const readout = meter.querySelector(".mg-dose-readout");
    function doseForMass(m) {
      return 4 + m * 0.72 + (m > 55 ? (m - 55) * 1.1 : 0);
    }
    function update() {
      const m = Number(slider.value);
      massVal.textContent = String(Math.round(m * 0.45));
      const dose = doseForMass(m);
      needle.style.left = `${Math.min(96, dose / 80 * 100)}%`;
      readout.textContent = `${dose.toFixed(1)} mR/h`;
      const okDose = dose >= 16 && dose <= 26;
      readout.classList.toggle("mg-dose-ok", okDose);
    }
    slider.addEventListener("input", update);
    update();
    confirm.addEventListener("click", () => {
      const m = Number(slider.value);
      const grams = m * 0.45;
      const dose = doseForMass(m);
      const okDose = dose >= 16 && dose <= 26;
      const okMass = Math.abs(grams - targetMass * 0.45) < 4.5;
      if (okDose && okMass) {
        status.textContent = `Carica ${grams.toFixed(1)} g registrata — dose entro limiti.`;
        setTimeout(onComplete, 500);
      } else if (!okDose) {
        status.textContent = "Dose fuori fascia: regola la massa finché il metro è verde.";
      } else {
        status.textContent = `Massa non ottimale (obiettivo ~${(targetMass * 0.45).toFixed(1)} g).`;
      }
    });
  }

  function runHeTorqueBolts(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "Serra ogni bullone della lente HE quando la coppia (ft·lb) è nella zona verde.";
    const row = document.createElement("div");
    row.className = "mg-torque-row";
    const status = document.createElement("p");
    status.className = "mg-progress";
    wrap.append(hint, row, status);
    let bolt = 0;
    const bolts = 4;
    let anim;
    let pos = 0;
    let dir = 1;
    function makeBolt(i) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mg-torque-bolt";
      b.textContent = `B${i + 1}`;
      b.disabled = i !== bolt;
      const bar = document.createElement("div");
      bar.className = "mg-torque-bar";
      bar.innerHTML = '<div class="mg-torque-green"></div><div class="mg-torque-cursor"></div>';
      const cell = document.createElement("div");
      cell.className = "mg-torque-cell";
      cell.append(b, bar);
      return { cell, bar, btn: b, cursor: bar.querySelector(".mg-torque-cursor") };
    }
    const cells = [];
    for (let i = 0; i < bolts; i++) {
      const c = makeBolt(i);
      cells.push(c);
      row.appendChild(c.cell);
    }
    function tick() {
      pos += dir * 2.2;
      if (pos >= 100) {
        pos = 100;
        dir = -1;
      }
      if (pos <= 0) {
        pos = 0;
        dir = 1;
      }
      cells[bolt].cursor.style.left = `${pos}%`;
    }
    anim = setInterval(tick, 20);
    function bindBolt() {
      const c = cells[bolt];
      c.btn.disabled = false;
      c.btn.onclick = () => {
        if (pos >= 38 && pos <= 58) {
          c.btn.classList.add("done");
          c.btn.disabled = true;
          bolt += 1;
          if (bolt >= bolts) {
            clearInterval(anim);
            status.textContent = "Giunzione HE serrata a coppia.";
            setTimeout(onComplete, 450);
          } else {
            status.textContent = `Bullone ${bolt}/${bolts} OK.`;
            bindBolt();
          }
        } else {
          status.textContent = "Coppia sbagliata — aspetta la fascia verde.";
        }
      };
    }
    bindBolt();
  }

  function runCyclotronDualTrim(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "Regola trim orizzontale e verticale finché il fascio è nel mirino centrale.";
    const pad = document.createElement("div");
    pad.className = "mg-beam-pad";
    pad.innerHTML = '<div class="mg-beam-target"></div><div class="mg-beam-dot"></div>';
    const dot = pad.querySelector(".mg-beam-dot");
    const sx = document.createElement("input");
    sx.type = "range";
    sx.min = "0";
    sx.max = "100";
    sx.value = "20";
    const sy = document.createElement("input");
    sy.type = "range";
    sy.min = "0";
    sy.max = "100";
    sy.value = "70";
    const labels = document.createElement("div");
    labels.className = "mg-beam-sliders";
    labels.innerHTML = "<label>Trim X <span></span></label><label>Trim Y <span></span></label>";
    const spans = labels.querySelectorAll("span");
    labels.insertBefore(sx, labels.children[1]);
    labels.insertBefore(sy, labels.lastElementChild.nextSibling);
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "btn primary small";
    confirm.textContent = "Blocca fascio";
    const status = document.createElement("p");
    status.className = "mg-progress";
    const tx = 48 + (hash(ctx.taskId) % 12);
    const ty = 48 + (hash(ctx.taskId >> 3) % 12);
    function upd() {
      dot.style.left = `${sx.value}%`;
      dot.style.top = `${sy.value}%`;
      spans[0].textContent = sx.value;
      spans[1].textContent = sy.value;
    }
    sx.addEventListener("input", upd);
    sy.addEventListener("input", upd);
    upd();
    wrap.append(hint, pad, labels, confirm, status);
    confirm.addEventListener("click", () => {
      const dx = Math.abs(Number(sx.value) - tx);
      const dy = Math.abs(Number(sy.value) - ty);
      if (dx < 5 && dy < 5) {
        status.textContent = "Fascio centrato sulla camera.";
        setTimeout(onComplete, 450);
      } else {
        status.textContent = "Fascio fuori centro — continua a regolare.";
      }
    });
  }

  function runCompositionQuench(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "La colata Composition B si raffredda: premi «Tratta» quando l’indicatore è sulla linea 42 °C.";
    const chart = document.createElement("div");
    chart.className = "mg-temp-chart";
    chart.innerHTML =
      '<div class="mg-temp-mark" style="top:58%">42°C</div><div class="mg-temp-line"></div>';
    const line = chart.querySelector(".mg-temp-line");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn primary small";
    btn.textContent = "Tratta colata";
    const status = document.createElement("p");
    status.className = "mg-progress";
    wrap.append(hint, chart, btn, status);
    let temp = 92;
    const iv = setInterval(() => {
      temp -= 0.35 + Math.random() * 0.15;
      line.style.top = `${Math.max(8, 100 - temp)}%`;
      if (temp < 30) {
        clearInterval(iv);
        status.textContent = "Troppo freddo — colata compromessa. Riprova la missione.";
        btn.disabled = true;
      }
    }, 80);
    btn.addEventListener("click", () => {
      clearInterval(iv);
      if (temp >= 39 && temp <= 45) {
        status.textContent = "Raffreddamento arrestato al punto giusto.";
        setTimeout(onComplete, 450);
      } else {
        status.textContent = `Temperatura ${temp.toFixed(0)}°C — serviva ~42°C.`;
      }
    });
  }

  function runCryoDewarFill(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "Apri la valvola N₂ finché il livello è tra le due tacche (non traboccare).";
    const tank = document.createElement("div");
    tank.className = "mg-dewar";
    tank.innerHTML =
      '<div class="mg-dewar-min"></div><div class="mg-dewar-max"></div><div class="mg-dewar-level"></div>';
    const level = tank.querySelector(".mg-dewar-level");
    const valve = document.createElement("button");
    valve.type = "button";
    valve.className = "btn primary small";
    valve.textContent = "Valvola N₂ (tieni premuto)";
    const status = document.createElement("p");
    status.className = "mg-progress";
    const done = document.createElement("button");
    done.type = "button";
    done.className = "btn small";
    done.textContent = "Chiudi valvola e conferma";
    wrap.append(hint, tank, valve, done, status);
    let fill = 8;
    let pouring = false;
    const targetLo = 52;
    const targetHi = 68;
    const tick = setInterval(() => {
      if (pouring) fill = Math.min(100, fill + 1.4);
      else fill = Math.max(0, fill - 0.25);
      level.style.height = `${fill}%`;
    }, 50);
    valve.addEventListener("mousedown", () => {
      pouring = true;
    });
    valve.addEventListener("mouseup", () => {
      pouring = false;
    });
    valve.addEventListener("mouseleave", () => {
      pouring = false;
    });
    valve.addEventListener("touchstart", (e) => {
      e.preventDefault();
      pouring = true;
    });
    valve.addEventListener("touchend", () => {
      pouring = false;
    });
    done.addEventListener("click", () => {
      clearInterval(tick);
      pouring = false;
      if (fill >= targetLo && fill <= targetHi) {
        status.textContent = "Dewar rifornito correttamente.";
        setTimeout(onComplete, 450);
      } else if (fill > targetHi) {
        status.textContent = "Traboccamento criogenico!";
      } else {
        status.textContent = "Livello troppo basso — aggiungi azoto.";
      }
    });
  }

  function runNeutronFluxBalance(wrap, ctx, onComplete) {
    const hint = document.createElement("p");
    hint.className = "mg-hint";
    hint.textContent =
      ctx.hint || "Bilancia tensione e corrente finché il flusso di neutroni resta nella banda.";
    const graph = document.createElement("div");
    graph.className = "mg-flux-graph";
    graph.innerHTML = '<div class="mg-flux-band"></div><div class="mg-flux-trace"></div>';
    const trace = graph.querySelector(".mg-flux-trace");
    const v = document.createElement("input");
    v.type = "range";
    v.min = "0";
    v.max = "100";
    v.value = "40";
    const c = document.createElement("input");
    c.type = "range";
    c.min = "0";
    c.max = "100";
    c.value = "60";
    const row = document.createElement("div");
    row.className = "mg-flux-controls";
    row.innerHTML = "<label>Tensione kV</label><label>Corrente mA</label>";
    row.insertBefore(v, row.children[1]);
    row.insertBefore(c, row.lastElementChild);
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "btn primary small";
    confirm.textContent = "Registra flusso";
    const status = document.createElement("p");
    status.className = "mg-progress";
    const tv = 35 + (hash(ctx.taskId) % 25);
    const tc = 50 + (hash(ctx.taskId >> 2) % 20);
    function flux() {
      const fv = Number(v.value);
      const fc = Number(c.value);
      return 100 - Math.abs(fv - tv) * 1.2 - Math.abs(fc - tc) * 1.1;
    }
    function draw() {
      const f = flux();
      trace.style.height = `${Math.max(5, f)}%`;
      trace.classList.toggle("mg-flux-good", f >= 72);
    }
    v.addEventListener("input", draw);
    c.addEventListener("input", draw);
    draw();
    wrap.append(hint, graph, row, confirm, status);
    confirm.addEventListener("click", () => {
      if (flux() >= 72) {
        status.textContent = "Flusso neutroni stabilizzato.";
        setTimeout(onComplete, 450);
      } else {
        status.textContent = "Flusso instabile — regola tensione e corrente.";
      }
    });
  }

  window.MP_DETAILED = {
    runPuRadiationBalance,
    runHeTorqueBolts,
    runCyclotronDualTrim,
    runCompositionQuench,
    runCryoDewarFill,
    runNeutronFluxBalance,
  };
})();
