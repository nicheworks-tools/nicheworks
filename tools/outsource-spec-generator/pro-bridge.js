(() => {
  const PAYMENT_LINK = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const ACTIVE_TEXT = 'Pro解放済み。このブラウザでは共通Proが有効です。';
  const PREVIEW_TEXT = 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。';
  const UNKNOWN_TEXT = 'Pro状態を確認できませんでした。無料機能は引き続き利用できます。';

  function setText(selector, text) {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = text;
    });
  }

  function wireBuyButtons() {
    document.querySelectorAll('[data-pro-buy]').forEach((link) => {
      if (link.tagName === 'A') {
        link.href = PAYMENT_LINK;
        link.target = '_blank';
        link.rel = 'noopener';
      }
    });
  }

  function updateVisibility(active) {
    document.querySelectorAll('[data-pro-preview]').forEach((element) => {
      element.hidden = active;
    });
    document.querySelectorAll('[data-pro-only]').forEach((element) => {
      element.hidden = !active;
    });
    document.querySelectorAll('[data-pro-action]').forEach((button) => {
      button.disabled = !active;
      button.classList.toggle('locked', !active);
      button.setAttribute('aria-disabled', active ? 'false' : 'true');
    });
    document.querySelectorAll('[data-pro-ad]').forEach((slot) => {
      slot.hidden = active;
    });
  }

  function publish(active, reason) {
    const root = document.documentElement;
    root.dataset.proActive = active ? 'true' : 'false';
    root.dataset.proStatus = reason || (active ? 'active' : 'preview');
    root.classList.toggle('nw-pro-active', active);
    root.classList.toggle('nw-pro-preview', !active);
    setText('[data-pro-status]', active ? ACTIVE_TEXT : reason === 'unknown' ? UNKNOWN_TEXT : PREVIEW_TEXT);
    updateVisibility(active);
    document.dispatchEvent(new CustomEvent('nw-pro-status-change', { detail: { active, reason: root.dataset.proStatus } }));
  }

  function readStatus() {
    wireBuyButtons();
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== 'function') {
        publish(false, 'unknown');
        return;
      }
      const status = window.NWPro.getLocalStatus();
      publish(Boolean(status && status.active), status && status.active ? 'active' : 'preview');
    } catch (error) {
      publish(false, 'unknown');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', readStatus, { once: true });
  } else {
    readStatus();
  }
})();
