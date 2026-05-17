(() => {
  const PAYMENT_LINK = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const STATUS_TEXT = {
    ja: {
      active: 'Pro解放済み。このブラウザでは共通Proが有効です。',
      preview: 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。',
      unknown: 'Pro状態を確認できませんでした。無料機能は引き続き利用できます。',
      buy: 'NicheWorks Proを購入 — $2.99'
    },
    en: {
      active: 'Pro unlocked. Common Pro is active in this browser.',
      preview: 'Preview mode. Common Pro is not active in this browser yet.',
      unknown: 'Could not check Pro status. Free features remain available.',
      buy: 'Unlock NicheWorks Pro — $2.99'
    }
  };

  function currentLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'ja';
  }

  function table() {
    return STATUS_TEXT[currentLang()] || STATUS_TEXT.ja;
  }

  function statusText(reason, active) {
    if (active) return table().active;
    return table()[reason] || table().preview;
  }

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
        link.textContent = table().buy;
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
    const nextReason = reason || (active ? 'active' : 'preview');
    root.dataset.proActive = active ? 'true' : 'false';
    root.dataset.proStatus = nextReason;
    root.classList.toggle('nw-pro-active', active);
    root.classList.toggle('nw-pro-preview', !active);
    wireBuyButtons();
    setText('[data-pro-status]', statusText(nextReason, active));
    updateVisibility(active);
    document.dispatchEvent(new CustomEvent('nw-pro-status-change', { detail: { active, reason: nextReason } }));
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

  function init() {
    readStatus();
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.nw-lang-switch button');
      if (!button) return;
      window.setTimeout(readStatus, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
