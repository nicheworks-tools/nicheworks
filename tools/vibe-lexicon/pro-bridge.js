(function () {
  'use strict';

  var TOOL_ID = 'vibe-lexicon';
  var LEGACY_KEY = 'nw_pro_' + TOOL_ID;
  var BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';

  function isJa() {
    return document.body && document.body.dataset.lang === 'ja';
  }

  function localCommonActive() {
    try {
      var status = window.NWPro && typeof window.NWPro.getLocalStatus === 'function' ? window.NWPro.getLocalStatus() : null;
      return Boolean(status && status.active);
    } catch (error) {
      return false;
    }
  }

  function legacyActive() {
    try {
      return localStorage.getItem(LEGACY_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function updateBuyLinks() {
    document.querySelectorAll('[data-pro-buy]').forEach(function (link) {
      link.href = BUY_URL;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function setHidden(nodes, hidden) {
    nodes.forEach(function (node) {
      node.hidden = hidden;
      node.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });
  }

  function applyUI(active) {
    var ja = isJa();
    document.documentElement.dataset.proActive = active ? 'true' : 'false';

    var statusText = active
      ? (ja ? 'Pro解放済み。このブラウザではNicheWorks Proが有効です。' : 'Pro unlocked. NicheWorks Pro is active in this browser.')
      : (ja ? 'Previewモードです。Proで解放されるcopy/export機能のサンプルを表示しています。' : 'Preview mode. Samples show the copy/export features unlocked with Pro.');

    document.querySelectorAll('[data-pro-status], #vlProStatus').forEach(function (node) {
      node.textContent = statusText;
    });

    var badge = document.getElementById('vlProBadge');
    if (badge) {
      badge.textContent = active ? (ja ? 'Pro解放済み' : 'Pro unlocked') : (ja ? 'Previewモード' : 'Preview mode');
      badge.classList.toggle('active', active);
    }

    setHidden(document.querySelectorAll('[data-pro-only]'), !active);
    setHidden(document.querySelectorAll('[data-pro-preview]'), active);

    document.querySelectorAll('[data-pro-action]').forEach(function (button) {
      button.setAttribute('aria-disabled', active ? 'false' : 'true');
      button.classList.toggle('is-locked', !active);
    });

    updateBuyLinks();
    window.dispatchEvent(new CustomEvent('nw-pro-status-change', { detail: { active: active, entitlement: 'nicheworks_pro' } }));
  }

  function boot() {
    updateBuyLinks();
    var active = localCommonActive() || legacyActive();
    applyUI(active);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('storage', boot);
})();
