window.NWPro = (function () {
  const KEY_ACTIVE = 'nicheworks:pro';
  const KEY_ENTITLEMENT = 'nicheworks:pro:entitlement';
  const KEY_CHECKED_AT = 'nicheworks:pro:checkedAt';
  const DEFAULT_ENTITLEMENT = 'nicheworks_pro';

  function getLocalStatus() {
    try {
      return {
        active: localStorage.getItem(KEY_ACTIVE) === 'true',
        entitlement: localStorage.getItem(KEY_ENTITLEMENT) || DEFAULT_ENTITLEMENT,
        checkedAt: localStorage.getItem(KEY_CHECKED_AT) || ''
      };
    } catch (error) {
      return { active: false, entitlement: DEFAULT_ENTITLEMENT, checkedAt: '' };
    }
  }

  function markLocalActive(data) {
    try {
      localStorage.setItem(KEY_ACTIVE, 'true');
      localStorage.setItem(KEY_ENTITLEMENT, data?.entitlement || DEFAULT_ENTITLEMENT);
      localStorage.setItem(KEY_CHECKED_AT, new Date().toISOString());
    } catch (error) {
      // localStorage is only a helper. Ignore failures.
    }
  }

  function clearLocal() {
    try {
      localStorage.removeItem(KEY_ACTIVE);
      localStorage.removeItem(KEY_ENTITLEMENT);
      localStorage.removeItem(KEY_CHECKED_AT);
    } catch (error) {}
  }

  async function checkStatus(options) {
    const opts = options || {};
    const params = new URLSearchParams();
    if (opts.session_id) params.set('session_id', opts.session_id);
    if (opts.email) params.set('email', opts.email);
    if (opts.entitlement) params.set('entitlement', opts.entitlement);
    if (opts.tool_id) params.set('tool_id', opts.tool_id);

    if (!params.toString()) {
      const local = getLocalStatus();
      return { ok: local.active, status: local.active ? 'cached_active' : 'missing_identifier', local: true, entitlement: local.entitlement };
    }

    const response = await fetch('/api/pro/status?' + params.toString(), { cache: 'no-store' });
    const data = await response.json().catch(function () { return { ok: false, status: 'bad_json' }; });
    if (response.ok && data && data.ok) markLocalActive(data);
    return data;
  }

  function renderGate(element, options) {
    if (!element) return;
    const opts = options || {};
    const local = getLocalStatus();
    element.dataset.proActive = local.active ? 'true' : 'false';
    element.classList.toggle('nw-pro-active', local.active);
    element.classList.toggle('nw-pro-inactive', !local.active);
    if (!local.active && opts.inactiveText) element.textContent = opts.inactiveText;
    if (local.active && opts.activeText) element.textContent = opts.activeText;
  }

  return {
    DEFAULT_ENTITLEMENT,
    getLocalStatus,
    isCachedActive: function () { return getLocalStatus().active; },
    markLocalActive,
    clearLocal,
    checkStatus,
    renderGate
  };
})();
