(function () {
  'use strict';

  function isJa() {
    return document.documentElement.lang === 'ja' || (document.body && document.body.dataset.lang === 'ja');
  }

  function setFreeActive() {
    document.documentElement.dataset.proActive = 'true';
    if (document.body) document.body.dataset.proActive = 'true';
  }

  function setHidden(nodes, hidden) {
    Array.from(nodes).forEach(function (node) {
      node.hidden = hidden;
      node.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    });
  }

  function removePurchaseSurface() {
    document.querySelectorAll('[data-pro-buy]').forEach(function (node) {
      node.remove();
    });
  }

  function applyUI() {
    var ja = isJa();
    setFreeActive();

    var statusText = ja
      ? '全copy/export機能を無料で利用できます。'
      : 'All copy/export features are available for free.';

    document.querySelectorAll('[data-pro-status], #vlProStatus').forEach(function (node) {
      node.textContent = statusText;
    });

    var badge = document.getElementById('vlProBadge');
    if (badge) {
      badge.textContent = ja ? '無料で利用可能' : 'Available for free';
      badge.classList.add('active');
    }

    setHidden(document.querySelectorAll('[data-pro-only]'), false);
    setHidden(document.querySelectorAll('[data-pro-preview]'), true);

    document.querySelectorAll('[data-pro-action]').forEach(function (button) {
      if ('disabled' in button) button.disabled = false;
      button.setAttribute('aria-disabled', 'false');
      button.classList.remove('is-locked');
    });

    removePurchaseSurface();
    window.dispatchEvent(new CustomEvent('nw-pro-status-change', {
      detail: { active: true, free: true, entitlement: 'free', source: 'ads_donation' }
    }));
  }

  // Set the flag immediately so app.js sees the free state during initialization.
  setFreeActive();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUI, { once: true });
  } else {
    applyUI();
  }

  window.addEventListener('storage', applyUI);
  window.NWVibeLexiconProBridge = Object.freeze({ render: applyUI, mode: 'free' });
})();
