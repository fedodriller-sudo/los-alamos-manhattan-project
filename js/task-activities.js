const node = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const button = (text, action, cls = "button") => {
  const b = node("button", cls, text);
  b.type = "button";
  b.onclick = action;
  return b;
};
const range = (label, value) => {
  const wrap = node("label", "activity-range"),
    caption = node("span", "", label),
    input = node("input");
  input.type = "range";
  input.min = 0;
  input.max = 100;
  input.step = 1;
  input.value = value;
  input.setAttribute("aria-label", label);
  wrap.append(caption, input);
  return { wrap, input };
};
export function renderActivity(
  parent,
  step,
  { submit, sound, begin, pending = false },
) {
  if (!step.activity) return null;
  const playSound = sound;
  sound = (kind) => {
    if (!document.hidden) playSound(kind);
  };
  let onVisibility = () => {};
  const root = node("fieldset", "activity " + step.activity);
  root.disabled = pending;
  root.append(node("legend", "sr-only", step.prompt));
  parent.append(root);
  const status = node("p", "activity-status");
  status.setAttribute("role", "status");
  let timer = null,
    disposed = false;
  const finish = (choice) => {
    if (!disposed && !pending) submit(choice);
  };
  if (step.activity === "calibrate") {
    root.append(
      node("div", "instrument-label", "BANCO DIDATTICO · CAMPIONE STABILE"),
    );
    const display = node("div", "calibration-display"),
      readout = node("strong", "calibration-value", "20"),
      target = node(
        "span",
        "calibration-target",
        "Fascia " + (step.target - 5) + "–" + (step.target + 5),
      );
    display.append(readout, target);
    root.append(display);
    const control = range("Regolazione del segnale", 20);
    root.append(control.wrap);
    let drift = 0,
      holding = false,
      stable = 0,
      failed = false;
    const meter = node("progress");
    meter.max = 3;
    meter.value = 0;
    meter.setAttribute("aria-label", "Secondi di stabilità");
    const confirm = button(
      "Avvia misura",
      () => {
        holding = true;
        failed = false;
        stable = 0;
        confirm.disabled = true;
      },
      "button gold full",
    );
    const update = (elapsed = 0) => {
      const value = Math.max(
        0,
        Math.min(100, Number(control.input.value) + drift),
      );
      readout.textContent = value.toFixed(1);
      const ready = Math.abs(value - step.target) <= 5;
      display.classList.toggle("ready", ready);
      if (holding) {
        if (!ready) {
          holding = false;
          failed = true;
          stable = 0;
          sound("wrong");
        } else {
          stable += elapsed;
          if (stable >= 3) {
            holding = false;
            finish(value);
          }
        }
      }
      root.dataset.state = failed ? "error" : "active";
      meter.value = stable;
      confirm.disabled = holding || !ready;
      confirm.textContent = holding
        ? "Mantieni il segnale…"
        : failed
          ? "Riprova la misura"
          : "Avvia misura";
      status.textContent = holding
        ? "Mantieni la fascia per 3 secondi. Correggi il cursore se serve."
        : failed
          ? "Misura interrotta: il segnale è uscito dalla fascia. Regola e riprova."
          : "Porta il segnale nella fascia, poi avvia la misura.";
    };
    control.input.oninput = () => update();
    root.append(meter, status, confirm);
    update();
    let phase = 0;
    timer = setInterval(() => {
      if (pending) return;
      phase += 0.1;
      drift = Math.sin(phase) * 3;
      update(0.1);
    }, 100);
  }
  if (step.activity === "stamp") {
    const paper = node("div", "stamp-paper");
    paper.append(
      node("span", "paper-heading", "MODULO DI COPERTURA"),
      node("span", "stamp-cross", "CENTRO"),
    );
    const seal = node("span", "stamp-seal", "ARCHIVIO");
    paper.append(seal);
    root.append(paper);
    const x = range("Posizione orizzontale del timbro", 20),
      y = range("Posizione verticale del timbro", 80);
    root.append(x.wrap, y.wrap);
    const confirm = button(
      "Apponi il timbro",
      () => finish([Number(x.input.value), Number(y.input.value)]),
      "button gold full",
    );
    const update = () => {
      seal.style.left = x.input.value + "%";
      seal.style.top = y.input.value + "%";
      const ready =
        Math.abs(Number(x.input.value) - 50) <= 5 &&
        Math.abs(Number(y.input.value) - 50) <= 5;
      confirm.disabled = !ready;
      status.textContent = ready
        ? "Timbro centrato. Pronto per la consegna."
        : "Allinea i due cursori al centro: 50 / 50.";
    };
    x.input.oninput = update;
    y.input.oninput = update;
    update();
    root.append(status, confirm);
  }
  if (step.activity === "form") {
    root.append(
      node("div", "document-label", "DESTINATARIO · " + step.recipient),
    );
    const label = node("label", "form-label", "Nome sul documento"),
      input = node("input");
    input.type = "text";
    input.autocomplete = "off";
    input.maxLength = 60;
    input.setAttribute("aria-label", "Destinatario del documento");
    label.append(input);
    root.append(label);
    const confirm = button(
      "Conferma destinatario",
      () => finish(input.value),
      "button gold full",
    );
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finish(input.value);
      }
    };
    root.append(confirm);
  }
  if (step.activity === "route") {
    let path = [step.start],
      failed = false;
    const grid = node("div", "activity-grid");
    grid.style.setProperty("--grid-size", step.size);
    grid.setAttribute("aria-label", "Percorso: tocca una casella adiacente");
    root.append(
      node(
        "p",
        "activity-instruction",
        "Tocca una casella libera accanto al segnalino. IN → OUT.",
      ),
      grid,
    );
    const cells = [];
    const adjacent = (a, b) =>
      Math.abs(Math.floor(a / step.size) - Math.floor(b / step.size)) +
        Math.abs((a % step.size) - (b % step.size)) ===
      1;
    const confirm = button("Consegna", () => finish(path), "button gold");
    const paint = () => {
      root.dataset.state = failed ? "error" : "active";
      const pos = path.at(-1);
      for (const [i, b] of cells.entries()) {
        b.className =
          "route-cell" +
          (step.blocked.includes(i) ? " blocked" : "") +
          (i === pos ? " current" : "") +
          (i === step.goal ? " goal" : "") +
          (path.includes(i) ? " visited" : "");
        b.textContent =
          i === pos
            ? "●"
            : i === step.goal
              ? "OUT"
              : i === step.start
                ? "IN"
                : step.blocked.includes(i)
                  ? "×"
                  : "";
        b.disabled = failed || !adjacent(pos, i);
        b.setAttribute(
          "aria-label",
          `Casella ${i + 1}${i === pos ? ", segnalino" : i === step.goal ? ", uscita" : step.blocked.includes(i) ? ", ostacolo" : ""}`,
        );
      }
      confirm.disabled = failed || pos !== step.goal;
      status.textContent = failed
        ? "Hai urtato un ostacolo. Ricomincia il percorso."
        : pos === step.goal
          ? "Percorso completato. Conferma la consegna."
          : `Passi: ${path.length - 1} · raggiungi OUT.`;
    };
    for (let i = 0; i < step.size ** 2; i++) {
      const b = button(
        "",
        () => {
          if (step.blocked.includes(i)) {
            failed = true;
            sound("wrong");
          } else {
            path.push(i);
            sound("step");
          }
          paint();
        },
        "route-cell",
      );
      cells.push(b);
      grid.append(b);
    }
    const reset = button(
      "Ricomincia percorso",
      () => {
        path = [step.start];
        failed = false;
        paint();
      },
      "text-button",
    );
    paint();
    const actions = node("div", "activity-actions");
    actions.append(reset, confirm);
    root.append(status, actions);
  }
  if (step.activity === "collect") {
    const selected = new Set(),
      grid = node("div", "activity-grid");
    grid.style.setProperty("--grid-size", step.size);
    root.append(
      node(
        "p",
        "activity-instruction",
        "Raccogli i 6 contrassegni luminosi e depositali entro 20 secondi. I settori vuoti aumentano l’esposizione simbolica.",
      ),
      grid,
    );
    let active = false,
      deposited = false,
      remaining = 20,
      exposure = 0,
      deadline = 0;
    const cells = [],
      meter = node("progress");
    meter.max = 5;
    meter.value = 0;
    meter.setAttribute("aria-label", "Esposizione simbolica");
    const confirm = button(
      "Deposita raccolta",
      () => {
        if (pending || disposed) return;
        if (
          selected.size === step.targets.length &&
          (deposited || (active && performance.now() < deadline))
        ) {
          deposited = true;
          active = false;
          update();
          finish([...selected]);
        }
      },
      "button gold full",
    );
    const start = button(
      "Avvia raccolta",
      () => {
        selected.clear();
        deposited = false;
        exposure = 0;
        remaining = 20;
        deadline = performance.now() + 20000;
        active = true;
        start.textContent = "Ricomincia raccolta";
        update();
      },
      "button full",
    );
    const update = () => {
      confirm.disabled =
        (!active && !deposited) || selected.size !== step.targets.length;
      root.dataset.state =
        exposure >= 5 || remaining === 0 ? "error" : "active";
      meter.value = exposure;
      status.textContent = `${selected.size} / ${step.targets.length} raccolti · ${Math.ceil(remaining)} s · esposizione ${exposure} / 5`;
      cells.forEach((b, i) => {
        b.disabled = !active || selected.has(i);
        b.classList.toggle("collected", selected.has(i));
        b.setAttribute("aria-pressed", String(selected.has(i)));
      });
    };
    for (let i = 0; i < step.size ** 2; i++) {
      const target = step.targets.includes(i),
        b = button(
          target ? "✦" : "·",
          () => {
            if (!active) return;
            if (target) {
              selected.add(i);
              sound("step");
            } else {
              exposure++;
              sound("wrong");
            }
            if (exposure >= 5) active = false;
            update();
            if (!active)
              status.textContent =
                "Esposizione simbolica al limite. Ricomincia la raccolta.";
          },
          "collect-cell" + (target ? " marked" : ""),
        );
      b.setAttribute(
        "aria-label",
        (target ? "Contrassegno " : "Settore vuoto ") + (i + 1),
      );
      cells.push(b);
      grid.append(b);
    }
    root.append(meter, status, start, confirm);
    update();
    timer = setInterval(() => {
      if (!active) return;
      remaining = Math.max(0, (deadline - performance.now()) / 1000);
      if (!remaining) {
        active = false;
        sound("wrong");
      }
      update();
      if (!active)
        status.textContent =
          "Tempo scaduto. Ricomincia e deposita prima del limite.";
    }, 200);
  }
  if (step.activity === "gate") {
    const card = node("div", "visitor-card");
    card.append(
      node("span", "document-label", "UFFICIO PASS"),
      node("h4", "", step.visitor),
    );
    const list = node("dl", "pass-flags");
    ["Badge valido", "Visita autorizzata", "Blocco sul registro"].forEach(
      (label, i) => {
        list.append(
          node("dt", "", label),
          node("dd", step.flags[i] ? "yes" : "no", step.flags[i] ? "SÌ" : "NO"),
        );
      },
    );
    card.append(list);
    root.append(
      card,
      node(
        "p",
        "gate-rule",
        "PASSA = badge valido + visita autorizzata + nessun blocco",
      ),
    );
    const actions = node("div", "activity-actions");
    actions.append(
      button("PASSA", () => finish(0), "button mint"),
      button("FERMA", () => finish(1), "button"),
    );
    root.append(actions);
  }
  if (step.activity === "copy") {
    begin();
    let progress = 0,
      copying = false,
      phase = 0,
      last = performance.now(),
      started = last;
    const machine = node("div", "copy-machine");
    machine.append(
      node("div", "document-label", "FASCICOLO DI COPERTURA · PROJECT Y"),
    );
    const sheet = node("div", "copy-sheet", "PROJECT Y / ARCHIVIO"),
      bar = node("progress");
    bar.max = 100;
    bar.value = 0;
    bar.setAttribute("aria-label", "Copia del fascicolo");
    const watch = node("p", "patrol-status");
    watch.setAttribute("role", "status");
    machine.append(sheet, bar, watch);
    root.append(machine);
    const toggle = button(
      "Avvia copia",
      () => {
        copying = !copying;
        toggle.textContent = copying ? "Nascondi" : "Riprendi copia";
        sound();
      },
      "button gold full",
    );
    const confirm = button(
      "Ritira la copia",
      () => finish(0),
      "button gold full",
    );
    confirm.hidden = true;
    root.append(status, toggle, confirm);
    onVisibility = () => {
      last = performance.now();
      if (document.hidden && progress < 100) {
        copying = false;
        toggle.textContent = "Riprendi copia";
        machine.classList.remove("copying");
        status.textContent = `Copia ${Math.floor(progress)}% · al riparo. Riprendi quando sei pronto.`;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const tick = () => {
      const now = performance.now(),
        dt = Math.min(now - last, 300);
      last = now;
      if (document.hidden) {
        onVisibility();
        return;
      }
      phase = ((now - started) % 8000) / 1000;
      const danger = phase >= 6,
        warning = phase >= 4.5 && phase < 6;
      watch.textContent = danger
        ? "Sentinella nel corridoio · nascondi la copia"
        : warning
          ? "Passi in avvicinamento · preparati a nascondere"
          : "Corridoio libero";
      machine.classList.toggle("alert", danger);
      machine.classList.toggle("copying", copying && !danger);
      if (copying && !pending && !document.hidden) {
        if (danger) {
          progress = Math.max(0, progress - 18);
          copying = false;
          toggle.textContent = "Riprendi copia";
          sound("wrong");
        } else progress = Math.min(100, progress + dt / 90);
      }
      bar.value = progress;
      status.textContent = `Copia ${Math.floor(progress)}% · puoi nasconderla senza perdere il lavoro`;
      if (progress >= 100) {
        copying = false;
        const moveFocus = document.activeElement === toggle;
        toggle.hidden = true;
        confirm.hidden = false;
        status.textContent = "Fascicolo pronto. Ritira la copia.";
        clearInterval(timer);
        if (moveFocus) confirm.focus();
      }
    };
    tick();
    timer = setInterval(tick, 100);
  }
  const cleanup = () => {
    disposed = true;
    if (timer) clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisibility);
  };
  cleanup.isActive = () => !disposed;
  let pendingFocus = null;
  cleanup.setPending = (value) => {
    if (value && root.contains(document.activeElement))
      pendingFocus = document.activeElement;
    pending = value;
    root.disabled = value;
    root.setAttribute("aria-busy", String(value));
    if (!value && pendingFocus && document.activeElement === document.body) {
      pendingFocus.focus({ preventScroll: true });
      pendingFocus = null;
    }
  };
  return cleanup;
}
