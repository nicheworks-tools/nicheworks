(function () {
  'use strict';

  var TOOL_ID = 'vibe-lexicon';
  var LEGACY_KEY = 'nw_pro_vibe-lexicon';
  var BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';

  function isJa() {
    return document.body && document.body.dataset.lang === 'ja';
  }

  function loadNWPro() {
    if (window.NWPro) return Promise.resolve(window.NWPro);
    return new Promise(function (resolve) {
      var existing = document.querySelector('script[src="/assets/nw-pro.js"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.NWPro || null); }, { once: true });
        existing.addEventListener('error', function () { resolve(null); }, { once: true });
        window.setTimeout(function () { resolve(window.NWPro || null); }, 1200);
        return;
      }
      var script = document.createElement('script');
      script.src = '/assets/nw-pro.js';
      script.defer = true;
      script.onload = function () { resolve(window.NWPro || null); };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
  }

  function localCommonActive(helper) {
    try {
      var status = helper && helper.getLocalStatus ? helper.getLocalStatus() : null;
      return Boolean(status && status.active);
    } catch (error) {
      return false;
    }
  }

  function legacyActive() {
    try {
      return localStorage.getItem(LEGACY_KEY) === '1' || localStorage.getItem('nw_pro_key') === '1';
    } catch (error) {
      return false;
    }
  }

  function mirrorLegacyForCurrentTool() {
    try {
      localStorage.setItem(LEGACY_KEY, '1');
      localStorage.setItem('nw_last_pro_tool', TOOL_ID);
    } catch (error) {}
  }

  function updateLinks() {
    document.querySelectorAll('[data-pro-buy], .vl-pro-actions a, a[href*="buy.stripe.com"]').forEach(function (link) {
      if (link.href && link.href.indexOf('buy.stripe.com') !== -1) {
        link.href = BUY_URL;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    document.querySelectorAll('a[href^="/pro/unlock/"]').forEach(function (link) {
      link.href = '/pro/unlock/';
    });
  }

  function applyUI(active, helperFound) {
    var ja = isJa();
    document.documentElement.dataset.proActive = active ? 'true' : 'false';

    var statusText = active
      ? (ja ? 'Pro解放済み。このブラウザでは共通Proが有効です。' : 'Pro unlocked. Common Pro is active in this browser.')
      : helperFound
        ? (ja ? 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。' : 'Preview mode. Common Pro is not active in this browser yet.')
        : (ja ? 'Pro状態を確認できませんでした。無料機能は引き続き利用できます。' : 'Could not check Pro status. Free features remain available.');

    document.querySelectorAll('[data-pro-status], #vlProStatus').forEach(function (node) {
      node.textContent = statusText;
    });

    var badge = document.getElementById('vlProBadge');
    if (badge) {
      badge.textContent = active ? 'COMMON PRO ACTIVE' : 'COMMON PRO PREVIEW';
      badge.classList.toggle('active', active);
    }

    document.querySelectorAll('[data-pro-only]').forEach(function (node) {
      node.hidden = !active;
    });
    document.querySelectorAll('[data-pro-preview]').forEach(function (node) {
      node.hidden = active;
    });
    document.querySelectorAll('[data-pro-action]').forEach(function (button) {
      button.setAttribute('aria-disabled', active ? 'false' : 'true');
    });
  }

  function boot() {
    updateLinks();
    loadNWPro().then(function (helper) {
      var active = localCommonActive(helper) || legacyActive();
      if (active) mirrorLegacyForCurrentTool();
      applyUI(active, Boolean(helper));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('storage', boot);
})();
