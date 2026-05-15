(function () {
  'use strict';

  var BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  var ENTITLEMENT = 'nicheworks_pro';

  var TEXT = {
    en: {
      active: 'Pro unlocked. Common Pro is active in this browser.',
      preview: 'Preview mode. Common Pro is not active in this browser yet.',
      failed: 'Could not check Pro status. Free features remain available.'
    },
    ja: {
      active: 'Pro解放済み。このブラウザでは共通Proが有効です。',
      preview: 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。',
      failed: 'Pro状態を確認できませんでした。無料機能は引き続き利用できます。'
    }
  };

  function lang() {
    return document.documentElement.lang === 'ja' ? 'ja' : 'en';
  }

  function readStatus() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== 'function') {
        return { active: false, failed: true, entitlement: ENTITLEMENT };
      }
      var status = window.NWPro.getLocalStatus();
      return {
        active: Boolean(status && status.active && (status.entitlement || ENTITLEMENT) === ENTITLEMENT),
        failed: false,
        entitlement: status && status.entitlement ? status.entitlement : ENTITLEMENT,
        checkedAt: status && status.checkedAt ? status.checkedAt : ''
      };
    } catch (error) {
      return { active: false, failed: true, entitlement: ENTITLEMENT };
    }
  }

  function setHidden(nodes, hidden) {
    nodes.forEach(function (node) {
      node.hidden = hidden;
      node.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });
  }

  function apply() {
    var current = readStatus();
    var active = Boolean(current.active);
    var failed = Boolean(current.failed);
    var copy = TEXT[lang()];
    var statusText = failed ? copy.failed : (active ? copy.active : copy.preview);

    document.documentElement.dataset.proActive = active ? 'true' : 'false';
    document.documentElement.dataset.proStatus = failed ? 'failed' : (active ? 'active' : 'preview');
    if (document.body) document.body.dataset.proActive = active ? 'true' : 'false';

    document.querySelectorAll('[data-pro-status]').forEach(function (node) {
      node.textContent = statusText;
      node.dataset.proActive = active ? 'true' : 'false';
      node.dataset.proState = failed ? 'failed' : (active ? 'active' : 'preview');
    });

    setHidden(Array.from(document.querySelectorAll('[data-pro-preview]')), active);
    setHidden(Array.from(document.querySelectorAll('[data-pro-only]')), !active);

    document.querySelectorAll('[data-pro-buy]').forEach(function (link) {
      link.setAttribute('href', BUY_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    document.querySelectorAll('[data-pro-action]').forEach(function (node) {
      if ('disabled' in node) node.disabled = !active;
      node.classList.toggle('is-locked', !active);
      node.setAttribute('aria-disabled', active ? 'false' : 'true');
    });

    var detail = { active: active, failed: failed, entitlement: ENTITLEMENT, status: current };
    window.dispatchEvent(new CustomEvent('nw-pro-status-change', { detail: detail }));
    window.dispatchEvent(new CustomEvent('nwpro:state', { detail: detail }));
  }

  window.NWAIIAProBridge = { refresh: apply, paymentLink: BUY_URL };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
  window.addEventListener('storage', apply);
})();
