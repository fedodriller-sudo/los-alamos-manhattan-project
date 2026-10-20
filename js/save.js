/** Salvataggio partita in localStorage (stesso browser) */
(function () {
  const SAVE_KEY = "mp-los-alamos-v1";
  const SAVE_VERSION = 1;

  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== SAVE_VERSION) return null;
      return data;
    } catch {
      return null;
    }
  }

  function writeSave(payload) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }

  function hasSave() {
    return readSave() !== null;
  }

  function formatResumeSummary(data, ROLES) {
    if (!data) return "";
    const roleLabel = ROLES[data.role]?.label || data.role;
    const when = new Date(data.savedAt);
    const time = when.toLocaleString("it-IT", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (data.role === "spy") {
      return `${roleLabel} · dispatch ${data.intelCount}/${data.spyDispatchWin ?? 5} · salvato ${time}`;
    }
    const done = (data.completed || []).length;
    return `${roleLabel} · ${done} missioni completate · salvato ${time}`;
  }

  window.MP_SAVE = {
    SAVE_VERSION,
    readSave,
    writeSave,
    clearSave,
    hasSave,
    formatResumeSummary,
  };
})();
