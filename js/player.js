/** Movimento personaggio sulla mappa (% del mondo) */
(function () {
  const SPEED = 0.22;
  const INTERACT_RADIUS = 11;

  const keys = new Set();

  const player = {
    x: 50,
    y: 65,
    el: null,
    viewport: null,
    world: null,
    active: false,
    frozen: false,
  };

  let lastNetMove = 0;

  function initPlayerMovement() {
    player.el = document.getElementById("player");
    player.viewport = document.getElementById("map-viewport");
    player.world = document.getElementById("map-world");

    player.viewport?.addEventListener("mousedown", () => {
      player.viewport?.focus({ preventScroll: true });
    });

    window.addEventListener("keydown", (e) => {
      if (!player.active || player.frozen) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D", "e", "E"].includes(e.key)) {
        e.preventDefault();
      }
      keys.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === "e" && player.active) {
        window.MP_GAME?.tryInteractNearby?.();
      }
    });
    window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

    let last = performance.now();
    function tick(now) {
      if (player.active) {
        const dt = Math.min(32, now - last) / 16;
        last = now;
        update(dt);
      } else {
        last = now;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function update(dt) {
    if (player.frozen) return;
    let dx = 0;
    let dy = 0;
    if (keys.has("arrowup") || keys.has("w")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;
    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy) || 1;
      player.x = clamp(player.x + (dx / len) * SPEED * dt, 2, 98);
      player.y = clamp(player.y + (dy / len) * SPEED * dt, 4, 96);
      syncDom();
      scrollToPlayer();
      window.MP_GAME?.onPlayerMove?.(player.x, player.y);
      if (window.MP_GAME?.isOnline?.()) {
        const now = performance.now();
        if (now - lastNetMove > 75) {
          lastNetMove = now;
          window.MP_NET?.sendMove?.(player.x, player.y);
        }
      }
    }
  }

  function syncDom() {
    if (!player.el) return;
    player.el.style.left = `${player.x}%`;
    player.el.style.top = `${player.y}%`;
  }

  function scrollToPlayer() {
    if (!player.viewport || !player.world) return;
    const wr = player.world.getBoundingClientRect();
    const vr = player.viewport.getBoundingClientRect();
    const px = (player.x / 100) * player.world.offsetWidth;
    const py = (player.y / 100) * player.world.offsetHeight;
    const targetLeft = px - vr.width / 2;
    const targetTop = py - vr.height / 2;
    player.viewport.scrollLeft = clamp(targetLeft, 0, player.world.offsetWidth - vr.width);
    player.viewport.scrollTop = clamp(targetTop, 0, player.world.offsetHeight - vr.height);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function distTo(loc) {
    return Math.hypot(player.x - loc.x, player.y - (loc.y ?? 50));
  }

  function nearestLocation(locations) {
    let best = null;
    let bestD = INTERACT_RADIUS + 1;
    for (const loc of locations) {
      const d = distTo(loc);
      if (d < bestD) {
        bestD = d;
        best = loc;
      }
    }
    return best;
  }

  function startPlayer() {
    const sp = window.MP_ROAD?.SPAWN ?? { x: 3.2, y: 54.5 };
    resumePlayer(sp.x, sp.y);
  }

  function resumePlayer(x, y) {
    player.active = true;
    player.x = typeof x === "number" ? x : 50;
    player.y = typeof y === "number" ? y : 65;
    syncDom();
    player.viewport?.focus({ preventScroll: true });
    setTimeout(scrollToPlayer, 50);
    window.MP_GAME?.onPlayerMove?.(player.x, player.y);
  }

  function stopPlayer() {
    player.active = false;
    keys.clear();
  }

  function setFrozen(on) {
    player.frozen = !!on;
    if (player.frozen) keys.clear();
  }

  window.MP_PLAYER = {
    initPlayerMovement,
    startPlayer,
    resumePlayer,
    stopPlayer,
    setFrozen,
    distTo,
    nearestLocation,
    INTERACT_RADIUS,
    getPos: () => ({ x: player.x, y: player.y }),
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlayerMovement);
  } else {
    initPlayerMovement();
  }
})();
