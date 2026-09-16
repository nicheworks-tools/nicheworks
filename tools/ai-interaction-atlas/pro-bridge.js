(function () {
  'use strict';

  var ENTITLEMENT = 'nicheworks_pro';

  var TEXT = {
    en: {
      active: 'Legacy Pro compatibility entitlement detected. Paid features are available in this browser.',
      preview: 'Paid bundle migration is not live. No purchase path is offered from this tool.',
      failed: 'Could not check legacy Pro status. Free features remain available.'
    },
    ja: {
      active: '旧Pro互換entitlementを確認しました。このブラウザでは有料機能を利用できます。',
      preview: '有料bundle移行はまだ本番化されていません。このツールから購入はできません。',
      failed: '旧Pro状態を確認できませんでした。無料機能は引き続き利用できます。'
    }
  };

  function lang() {
    return document.documentElement.lang === 'ja' ? 'ja' : 'en';
  }

  function readStatus() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== 'function') {
        return { active: false, failed: true, entitlement: '' };
      }
      var status = window.NWPro.getLocalStatus() || {};
      return {
        active: status.active === true && status.entitlement === ENTITLEMENT,
        failed: false,
        entitlement: status.entitlement || '',
        checkedAt: status.checkedAt || ''
      };
    } catch (error) {
      return { active: false, failed: true, entitlement: '' };
    }
  }

  function setHidden(nodes, hidden) {
    nodes.forEach(function (node) {
      node.hidden = hidden;
      node.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });
  }

  function retireBuyLinks() {
    document.querySelectorAll('[data-pro-buy]').forEach(function (link) {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('role', 'link');
      link.hidden = true;
    });
  }

  function apply() {
    var current = readStatus();
    var active = current.active === true;
    var failed = current.failed === true;
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
    retireBuyLinks();

    document.querySelectorAll('[data-pro-action]').forEach(function (node) {
      if ('disabled' in node) node.disabled = !active;
      node.classList.toggle('is-locked', !active);
      node.setAttribute('aria-disabled', active ? 'false' : 'true');
    });

    var detail = { active: active, failed: failed, entitlement: current.entitlement, status: current };
    window.dispatchEvent(new CustomEvent('nw-pro-status-change', { detail: detail }));
    window.dispatchEvent(new CustomEvent('nwpro:state', { detail: detail }));
  }

  window.NWAIIAProBridge = { refresh: apply };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
  window.addEventListener('storage', apply);
})();
