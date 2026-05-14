(function () {
  'use strict';

  var BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';

  function status() {
    try {
      return window.NWPro && typeof window.NWPro.getLocalStatus === 'function'
        ? window.NWPro.getLocalStatus()
        : { active: false, entitlement: 'nicheworks_pro', checkedAt: '' };
    } catch (error) {
      return { active: false, entitlement: 'nicheworks_pro', checkedAt: '' };
    }
  }

  function apply() {
    var current = status();
    var active = Boolean(current && current.active && current.entitlement === 'nicheworks_pro');
    document.documentElement.dataset.proActive = active ? 'true' : 'false';

    document.querySelectorAll('[data-pro-buy]').forEach(function (link) {
      link.setAttribute('href', BUY_URL);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    var isEn = document.documentElement.lang === 'en';
    document.querySelectorAll('[data-pro-status]').forEach(function (node) {
      node.textContent = active
        ? (isEn ? 'Pro unlocked: NicheWorks Pro is active in this browser.' : 'Pro解放済み：このブラウザでは NicheWorks Pro が有効です。')
        : (isEn ? 'Preview mode: Pro output samples are visible. Pro-only copy/export unlocks after purchase.' : 'Previewモード：Pro出力サンプルは表示されます。Pro専用のcopy/exportは購入後に解放されます。');
    });

    document.querySelectorAll('[data-pro-only]').forEach(function (node) {
      node.hidden = !active;
      if ('disabled' in node) node.disabled = !active;
      node.setAttribute('aria-disabled', active ? 'false' : 'true');
    });

    document.querySelectorAll('[data-pro-preview]').forEach(function (node) {
      node.hidden = active;
    });

    window.dispatchEvent(new CustomEvent('nw-pro-status-change', {
      detail: { active: active, status: current }
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
  window.addEventListener('storage', apply);
  window.NWMinutesToOpsPro = { refresh: apply };
})();
