(function () {
  'use strict';

  const PAYMENT_LINK = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const ENTITLEMENT = 'nicheworks_pro';
  const SAFE_PREVIEW = '[REDACTED PREVIEW]';
  const PRO_ACTION_SELECTOR = [
    '#profileSelect',
    '#addCustomRuleBtn',
    '[data-remove-rule]',
    '#copyAuditBtn',
    '#copyGithubBtn',
    '#copySupportBtn',
    '#copyDiscordBtn',
    '#downloadJsonBtn',
    '#downloadCsvBtn',
    '#downloadHandoffBtn'
  ].join(', ');
  const RESYNC_SELECTOR = `#redactBtn, [data-sample], ${PRO_ACTION_SELECTOR}`;

  const messages = {
    preview: {
      ja: 'Previewモードです。このブラウザでは共通Proがまだ有効ではありません。',
      en: 'Preview mode. Common Pro is not active in this browser yet.',
    },
    active: {
      ja: 'Pro解放済み。このブラウザでは共通Proが有効です。',
      en: 'Pro unlocked. Common Pro is active in this browser.',
    },
    error: {
      ja: 'Pro状態を確認できませんでした。無料機能は引き続き利用できます。',
      en: 'Could not check Pro status. Free features remain available.',
    },
  };

  const currentLang = () => {
    const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (htmlLang.startsWith('ja')) return 'ja';
    if (htmlLang.startsWith('en')) return 'en';

    const activeLangButton = document.querySelector('.nw-lang-switch button.active[data-lang]');
    const activeLang = (activeLangButton?.dataset.lang || '').toLowerCase();
    if (activeLang === 'ja' || activeLang === 'en') return activeLang;

    const browserLang = (navigator.language || '').toLowerCase();
    return browserLang.startsWith('ja') ? 'ja' : 'en';
  };

  const statusText = (state) => messages[state][currentLang()] || messages[state].en;

  const readStatus = () => {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== 'function') {
        return { active: false, entitlement: '', checkedAt: '', error: true };
      }
      const status = window.NWPro.getLocalStatus() || {};
      return {
        active: status.active === true && status.entitlement === ENTITLEMENT,
        entitlement: status.entitlement || '',
        checkedAt: status.checkedAt || '',
        error: false,
      };
    } catch (error) {
      return { active: false, entitlement: '', checkedAt: '', error: true };
    }
  };

  const applyStatus = () => {
    const status = readStatus();
    const active = status.active === true;
    document.documentElement.dataset.proActive = active ? 'true' : 'false';

    const state = status.error ? 'error' : active ? 'active' : 'preview';

    document.querySelectorAll('[data-pro-status]').forEach((node) => {
      node.textContent = statusText(state);
      node.dataset.proStatus = state;
    });

    document.querySelectorAll('[data-pro-preview]').forEach((node) => {
      node.hidden = active;
    });

    document.querySelectorAll('[data-pro-only]').forEach((node) => {
      node.hidden = !active;
    });

    document.querySelectorAll('[data-pro-buy]').forEach((node) => {
      node.setAttribute('href', PAYMENT_LINK);
    });

    window.dispatchEvent(new CustomEvent('nw-pro-status', { detail: status }));
    return status;
  };

  function guardLegacyInteraction(event) {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest(RESYNC_SELECTOR)
      : null;
    if (!target) return;

    const status = applyStatus();
    if (target.matches(PRO_ACTION_SELECTOR) && status.active !== true) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function guardLegacyProfileChange(event) {
    const target = event.target;
    if (!target || typeof target.matches !== 'function' || !target.matches('#profileSelect')) return;
    const status = applyStatus();
    if (status.active !== true) {
      event.preventDefault();
      event.stopImmediatePropagation();
      target.selectedIndex = 0;
    }
  }

  // The core detector historically generated human-readable previews that retained
  // the first/last characters of a detected credential. A redaction tool must not
  // copy those fragments into review artifacts, support templates, or downloads.
  // This bridge is loaded before app.js, so outbound browser APIs are hardened here
  // while the detector itself remains local and unchanged.
  function currentUnsafePreviews() {
    try {
      const api = window.NWApiKeyTokenRedactor;
      if (!api || typeof api.safeFindings !== 'function') return [];
      return api.safeFindings()
        .map((item) => String(item?.preview || '').trim())
        .filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function scrubPreviewText(value) {
    let output = String(value ?? '');
    currentUnsafePreviews().forEach((preview) => {
      const variants = new Set([
        preview,
        preview.replace(/\|/g, '\\|'),
        preview.replace(/"/g, '""'),
        JSON.stringify(preview).slice(1, -1),
      ]);
      variants.forEach((variant) => {
        if (variant) output = output.split(variant).join(SAFE_PREVIEW);
      });
    });
    return output;
  }

  function hardenClipboard() {
    try {
      const clipboard = navigator.clipboard;
      if (!clipboard || typeof clipboard.writeText !== 'function' || clipboard.writeText.__nwRedactorSafe) return;
      const nativeWriteText = clipboard.writeText.bind(clipboard);
      const safeWriteText = (text) => nativeWriteText(scrubPreviewText(text));
      safeWriteText.__nwRedactorSafe = true;
      clipboard.writeText = safeWriteText;
    } catch (_) {
      // Clipboard may be immutable in some browsers. UI and Blob hardening still apply.
    }
  }

  function hardenDownloads() {
    try {
      const NativeBlob = window.Blob;
      if (!NativeBlob || NativeBlob.__nwRedactorSafe) return;
      class SafeBlob extends NativeBlob {
        constructor(parts, options) {
          const safeParts = Array.from(parts || []).map((part) =>
            typeof part === 'string' ? scrubPreviewText(part) : part
          );
          super(safeParts, options);
        }
      }
      SafeBlob.__nwRedactorSafe = true;
      window.Blob = SafeBlob;
    } catch (_) {
      // If Blob cannot be wrapped, no download behavior is changed.
    }
  }

  function suppressVisibleSecretPreviews() {
    document.querySelectorAll('#findingsList code, #verificationList code').forEach((node) => {
      if (node.textContent !== SAFE_PREVIEW) node.textContent = SAFE_PREVIEW;
      node.setAttribute('aria-label', currentLang() === 'ja' ? '秘密値は非表示' : 'Secret value hidden');
    });
  }

  function installPreviewObserver() {
    suppressVisibleSecretPreviews();
    const targets = [document.getElementById('findingsList'), document.getElementById('verificationList')].filter(Boolean);
    targets.forEach((target) => {
      new MutationObserver(suppressVisibleSecretPreviews).observe(target, { childList: true, subtree: true, characterData: true });
    });
  }

  hardenClipboard();
  hardenDownloads();
  document.addEventListener('click', guardLegacyInteraction, true);
  document.addEventListener('change', guardLegacyProfileChange, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyStatus();
      installPreviewObserver();
    });
  } else {
    applyStatus();
    installPreviewObserver();
  }

  document.addEventListener('nw-lang-change', () => {
    applyStatus();
    suppressVisibleSecretPreviews();
  });
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('.nw-lang-switch button[data-lang]')) {
      window.setTimeout(() => {
        applyStatus();
        suppressVisibleSecretPreviews();
      }, 0);
    }
  });

  window.NWApiKeyTokenRedactorProBridge = {
    refresh: applyStatus,
    isActive: () => readStatus().active === true,
    paymentLink: PAYMENT_LINK,
    entitlement: ENTITLEMENT,
    scrubPreviewText,
  };
})();
