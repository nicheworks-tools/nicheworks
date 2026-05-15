(function () {
  const doc = document.documentElement;
  let loading = false;
  let loaded = Boolean(window.NWPro && typeof window.NWPro.getLocalStatus === 'function');
  let failed = false;

  function emit() {
    window.dispatchEvent(new CustomEvent('ui-atlas:pro-status', { detail: getStatus() }));
  }

  function readLocalStatus() {
    if (!window.NWPro || typeof window.NWPro.getLocalStatus !== 'function') return null;
    return window.NWPro.getLocalStatus();
  }

  function applyStatus() {
    try {
      const local = readLocalStatus();
      const active = Boolean(local && local.active);
      doc.dataset.proActive = active ? 'true' : 'false';
      failed = false;
      return { active, failed: false, status: local || null };
    } catch (_error) {
      doc.dataset.proActive = 'false';
      failed = true;
      return { active: false, failed: true, status: null };
    }
  }

  function loadSharedClient() {
    if (loaded || loading) return;
    loading = true;
    const script = document.createElement('script');
    script.src = '/assets/nw-pro.js';
    script.defer = true;
    script.onload = function () {
      loaded = true;
      loading = false;
      applyStatus();
      emit();
    };
    script.onerror = function () {
      loaded = false;
      loading = false;
      failed = true;
      doc.dataset.proActive = 'false';
      emit();
    };
    document.head.appendChild(script);
  }

  function getStatus() {
    if (window.NWPro && typeof window.NWPro.getLocalStatus === 'function') {
      return applyStatus();
    }
    if (!failed) loadSharedClient();
    doc.dataset.proActive = 'false';
    return { active: false, failed, status: null };
  }

  window.UIAtlasProBridge = {
    getStatus,
    refresh: function () {
      const status = getStatus();
      emit();
      return status;
    }
  };

  getStatus();
  window.addEventListener('focus', function () { window.UIAtlasProBridge.refresh(); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) window.UIAtlasProBridge.refresh();
  });
})();
