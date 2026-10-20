/** Registra PWA e pulsante «Installa app» (product design già nel bundle). */
(function () {
  const host = location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  if (isLocal && "serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  } else if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  let deferredPrompt = null;
  const banner = document.getElementById("pwa-install-banner");
  const btn = document.getElementById("btn-pwa-install");
  const dismiss = document.getElementById("btn-pwa-dismiss");
  const iosHint = document.getElementById("pwa-ios-hint");

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  function showBanner() {
    if (!banner || isStandalone) return;
    banner.classList.remove("hidden");
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  if (btn) {
    btn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        banner?.classList.add("hidden");
        return;
      }
      if (isIOS && iosHint) {
        iosHint.classList.remove("hidden");
      }
    });
  }

  dismiss?.addEventListener("click", () => banner?.classList.add("hidden"));

  if (!isStandalone && isIOS && !deferredPrompt) {
    window.setTimeout(showBanner, 800);
  }
})();
