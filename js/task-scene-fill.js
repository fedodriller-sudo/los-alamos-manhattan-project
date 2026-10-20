/** Assegna minigiochi per luogo (evita tutti uguali “scatola sinistra-destra”) */
(function () {
  const BY_LOCATION = {
    "building-d": ["puShuttle", "puRadiationBalance", "puTongsPurify", "puTongsPit", "airValves"],
    "building-t": ["dragArchive", "connect", "dragPrimer", "symbolMatch", "patchPanel"],
    foundry: ["flameCut", "compositionQuench", "dragCrucible", "timerStop"],
    "building-v": ["flameCut", "heTorqueBolts", "dragLathe", "dragTool"],
    warehouse: ["truckLoad", "dragCrateSort", "dragLabel"],
    "motor-pool": ["truckLoad", "dragFuel", "dragWrench"],
    cleaners: ["floorClean", "dragCoat", "airValves"],
    boiler: ["floorClean", "gauge", "dragCoal"],
    "pass-p": ["gateIdentify", "dragBadgeReader", "patchPanel"],
    px: ["gateIdentify", "dragPxBox", "dragMensa"],
    gamma: ["heTorqueBolts", "lensMat", "beamCrosshair", "dragHE"],
    sigma: ["compositionQuench", "flameCut", "airValves", "geigerSweep"],
    "building-x": ["cyclotronDualTrim", "beamCrosshair", "connect"],
    "building-z": ["neutronFluxBalance", "hvLevers", "geigerSweep"],
    "building-y": ["cryoDewarFill", "dragCryo", "valveWheel"],
    "building-u": ["reagentPour", "puRadiationBalance", "connect"],
    "building-q": ["puRadiationBalance", "dragMedkit", "geigerSweep"],
    "post-office": ["dragCensor", "microfilmPull", "dragBriefcase"],
    "building-a": ["dragStamp", "dragArchive", "patchPanel"],
    commissary: ["dragMensa", "gauge", "symbolMatch"],
    pond: ["dragVial", "connect", "timerStop"],
    dispensary: ["dragMedkit", "connect", "gauge"],
    delta: ["dragHE", "connect", "hvLevers"],
    "building-w": ["valveWheel", "gauge", "patchPanel"],
    zia: ["connect", "valveWheel", "patchPanel"],
  };

  const GENERIC = [
    "geigerSweep",
    "timerStop",
    "symbolMatch",
    "patchPanel",
    "airValves",
    "hvLevers",
    "valveWheel",
    "reagentPour",
  ];

  function hash(id) {
    let h = 2166136261;
    const s = String(id || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function sceneForTask(taskId, locationId) {
    const scenes = window.MG_SCENES;
    if (!scenes) return null;
    const tv = scenes.TASK_VISUAL;
    if (tv[taskId]) return tv[taskId];
    const pool = (locationId && BY_LOCATION[locationId]) || GENERIC;
    const pick = pool[hash(taskId) % pool.length];
    tv[taskId] = pick;
    return pick;
  }

  function assignAll() {
    const scenes = window.MG_SCENES;
    const data = window.MP_DATA;
    if (!scenes || !data) return;
    for (const t of data.allTasks()) {
      sceneForTask(t.id, t.locationId);
    }
  }

  window.MP_SCENE_FILL = { sceneForTask, assignAll, BY_LOCATION };

  function boot() {
    if (window.MP_ROAD?.apply) window.MP_ROAD.apply();
    assignAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
