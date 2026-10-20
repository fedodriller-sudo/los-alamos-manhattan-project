/** Centri edificio (%). Ogni voce = rettangolo in los-alamos-site.svg (x,y,w,h in px su 4200×2800). */
(function () {
  const BUILDINGS = [
    { id: "motor-pool", x: 70, y: 1492, w: 208, h: 88 },
    { id: "px", x: 248, y: 1228, w: 178, h: 86 },
    { id: "pond", x: 418, y: 1490, w: 172, h: 90 },
    { id: "dispensary", x: 588, y: 1225, w: 180, h: 88 },
    { id: "building-a", x: 758, y: 1222, w: 198, h: 92 },
    { id: "post-office", x: 928, y: 1488, w: 168, h: 88 },
    { id: "commissary", x: 1098, y: 1228, w: 175, h: 86 },
    { id: "cleaners", x: 1268, y: 1492, w: 165, h: 86 },
    { id: "warehouse", x: 1438, y: 1225, w: 188, h: 90 },
    { id: "foundry", x: 1608, y: 1488, w: 192, h: 90 },
    { id: "sigma", x: 1778, y: 1228, w: 182, h: 88 },
    { id: "delta", x: 1948, y: 1490, w: 175, h: 88 },
    { id: "gamma", x: 2118, y: 1222, w: 195, h: 92 },
    { id: "building-x", x: 2288, y: 1488, w: 185, h: 90 },
    { id: "building-z", x: 2458, y: 1225, w: 180, h: 88 },
    { id: "building-w", x: 2628, y: 1490, w: 170, h: 88 },
    { id: "building-y", x: 2798, y: 1228, w: 172, h: 86 },
    { id: "building-u", x: 2968, y: 1488, w: 178, h: 90 },
    { id: "building-v", x: 3138, y: 1222, w: 190, h: 92 },
    { id: "building-d", x: 3308, y: 1485, w: 200, h: 92 },
    { id: "building-t", x: 3478, y: 1225, w: 182, h: 88 },
    { id: "pass-p", x: 3648, y: 1490, w: 162, h: 86 },
    { id: "building-q", x: 3818, y: 1228, w: 175, h: 86 },
    { id: "boiler", x: 3988, y: 1488, w: 168, h: 88 },
    { id: "zia", x: 3668, y: 1588, w: 165, h: 82 },
  ];

  const W = 4200;
  const H = 2800;

  const LAYOUT = {};
  for (const b of BUILDINGS) {
    LAYOUT[b.id] = {
      x: ((b.x + b.w / 2) / W) * 100,
      y: ((b.y + b.h / 2) / H) * 100,
      side: b.y < 1350 ? "north" : "south",
      rect: b,
    };
  }

  const SPAWN = { x: 3.2, y: 54.5 };

  function applyToLocations(locations) {
    if (!locations) return;
    for (const loc of locations) {
      const cfg = LAYOUT[loc.id];
      if (!cfg) continue;
      loc.x = cfg.x;
      loc.y = cfg.y;
      loc.side = cfg.side;
    }
  }

  function apply() {
    applyToLocations(window.MP_DATA?.LOCATIONS);
  }

  window.MP_ROAD = {
    SPAWN,
    BUILDINGS,
    MAP_W: W,
    MAP_H: H,
    applyToLocations,
    apply,
  };

  apply();
})();
