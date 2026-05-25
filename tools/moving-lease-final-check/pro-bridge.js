(() => {
  const PAYMENT_LINK = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const ACTIVE_TEXT = 'Pro解放済み。このブラウザでは共通Proが有効です。';
  const PREVIEW_TEXT = 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。';

  function loadNWPro() {
    if (window.NWPro && typeof window.NWPro.getLocalStatus === 'function') {
      return Promise.resolve(window.NWPro);
    }

    return new Promise((resolve) => {
      const existing = document.querySelector('script[src="/assets/nw-pro.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.NWPro || null), { once: true });
        existing.addEventListener('error', () => resolve(null), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = '/assets/nw-pro.js';
      script.defer = true;
      script.addEventListener('load', () => resolve(window.NWPro || null), { once: true });
      script.addEventListener('error', () => resolve(null), { once: true });
      document.head.appendChild(script);
    });
  }

  function setHidden(elements, hidden) {
    elements.forEach((element) => {
      element.hidden = hidden;
      element.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });
  }

  function updateBuyLinks() {
    document.querySelectorAll('[data-pro-buy]').forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        link.href = PAYMENT_LINK;
        link.target = '_blank';
        link.rel = 'noopener';
      }
    });
  }

  function applyState(active) {
    const activeString = active ? 'true' : 'false';
    document.documentElement.dataset.proActive = activeString;
    document.documentElement.setAttribute('data-pro-active', activeString);

    document.querySelectorAll('[data-pro-status]').forEach((element) => {
      element.textContent = active ? ACTIVE_TEXT : PREVIEW_TEXT;
    });

    setHidden(Array.from(document.querySelectorAll('[data-pro-preview]')), active);
    setHidden(Array.from(document.querySelectorAll('[data-pro-only]')), !active);
    updateBuyLinks();

    window.dispatchEvent(new CustomEvent('nw-pro-state-change', { detail: { active } }));
  }

  async function refresh() {
    try {
      const nwPro = await loadNWPro();
      const status = nwPro && typeof nwPro.getLocalStatus === 'function'
        ? nwPro.getLocalStatus()
        : { active: false };
      applyState(!!status.active);
    } catch (error) {
      applyState(false);
    }
  }

  document.addEventListener('DOMContentLoaded', refresh);
  window.NWMovingLeaseProBridge = { refresh, applyState, PAYMENT_LINK };
})();
