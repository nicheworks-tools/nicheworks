(function (global) {
  'use strict';

  const DEFAULT_PRODUCT_ID = 'okj.toolkit_pro';
  const SESSION_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;
  const STORAGE_PREFIX = 'nicheworks:billing:session:';
  const stateCache = new Map();

  function productIdOf(input) {
    return String(input?.productId || DEFAULT_PRODUCT_ID).trim();
  }

  function featureIdOf(input) {
    const value = String(input?.featureId || '').trim();
    return value || null;
  }

  function inactiveState(input, state, reason) {
    return {
      productId: productIdOf(input),
      featureId: featureIdOf(input),
      state: state || 'free',
      active: false,
      source: 'server',
      reason: reason || 'not_verified',
      features: []
    };
  }

  function storageKey(productId) {
    return `${STORAGE_PREFIX}${productId}`;
  }

  function readStoredSession(productId) {
    try {
      const value = localStorage.getItem(storageKey(productId)) || '';
      return SESSION_PATTERN.test(value) ? value : '';
    } catch {
      return '';
    }
  }

  function storeVerifiedSession(productId, sessionId) {
    if (!SESSION_PATTERN.test(sessionId)) return;
    try {
      localStorage.setItem(storageKey(productId), sessionId);
    } catch {
      // Storage is only a restore convenience. Verification remains server-side.
    }
  }

  function clearProductSession(productId) {
    const normalized = String(productId || DEFAULT_PRODUCT_ID).trim();
    stateCache.delete(normalized);
    try {
      localStorage.removeItem(storageKey(normalized));
    } catch {}
  }

  function deriveFeatureState(base, featureId) {
    if (!featureId) return { ...base, featureId: null };
    const allowed = Boolean(base.active && Array.isArray(base.features) && base.features.includes(featureId));
    return {
      ...base,
      featureId,
      active: allowed,
      state: allowed ? 'pro-active' : (base.active ? 'free' : base.state),
      reason: allowed ? 'verified_entitlement' : (base.active ? 'feature_not_entitled' : base.reason)
    };
  }

  function getProductState(input) {
    const productId = productIdOf(input);
    const cached = stateCache.get(productId);
    if (cached) return { ...cached, featureId: null };
    const stored = readStoredSession(productId);
    return inactiveState({ productId }, stored ? 'checkout-pending' : 'restore-required', stored ? 'server_recheck_required' : 'missing_session');
  }

  function getFeatureState(input) {
    return deriveFeatureState(getProductState(input), featureIdOf(input));
  }

  function getProState(input) {
    return featureIdOf(input) ? getFeatureState(input) : getProductState(input);
  }

  async function refreshProState(input) {
    const productId = productIdOf(input);
    const featureId = featureIdOf(input);
    const explicitSession = String(input?.sessionId || '').trim();
    const sessionId = SESSION_PATTERN.test(explicitSession) ? explicitSession : readStoredSession(productId);

    if (!sessionId) {
      const missing = inactiveState({ productId, featureId }, 'restore-required', 'missing_session');
      stateCache.set(productId, { ...missing, featureId: null });
      return missing;
    }

    const params = new URLSearchParams({ productId, sessionId });
    let response;
    let data;
    try {
      response = await fetch(`/api/billing/entitlement?${params.toString()}`, { cache: 'no-store' });
      data = await response.json();
    } catch {
      const failed = inactiveState({ productId, featureId }, 'entitlement-error', 'entitlement_check_failed');
      stateCache.set(productId, { ...failed, featureId: null });
      return failed;
    }

    if (!response.ok || !data?.ok || !data?.active) {
      const state = data?.state === 'restore-required' ? 'restore-required' : 'entitlement-error';
      const failed = inactiveState({ productId, featureId }, state, data?.error || 'entitlement_not_active');
      stateCache.set(productId, { ...failed, featureId: null });
      return failed;
    }

    const verified = {
      productId,
      featureId: null,
      state: 'pro-active',
      active: true,
      source: 'server',
      reason: 'verified_entitlement',
      features: Array.isArray(data.features) ? data.features.slice() : []
    };
    stateCache.set(productId, verified);
    storeVerifiedSession(productId, sessionId);
    return deriveFeatureState(verified, featureId);
  }

  async function activateFromSession(input) {
    const productId = productIdOf(input);
    const sessionId = String(input?.sessionId || '').trim();
    if (!SESSION_PATTERN.test(sessionId)) {
      return inactiveState(input, 'restore-required', 'invalid_session');
    }
    return refreshProState({ ...input, productId, sessionId });
  }

  const OLD_KANJI_TOOLKIT_PAGES = new Set([
    'old-kanji-reference',
    'old-kanji-ocr-scanner',
    'old-document-kanji-highlighter',
    'unicode-kanji-checker',
    'variant-kanji-compare',
    'place-old-kanji-checker',
    'name-old-kanji-checker'
  ]);

  function oldKanjiToolSlug() {
    const parts = global.location?.pathname?.split('/').filter(Boolean) || [];
    return parts[0] === 'tools' && OLD_KANJI_TOOLKIT_PAGES.has(parts[1]) ? parts[1] : '';
  }

  function currentLanguage() {
    return String(global.document?.documentElement?.lang || 'ja').toLowerCase().startsWith('en') ? 'en' : 'ja';
  }

  function setLocalizedText(element, ja, en) {
    if (!element) return;
    const jaNode = element.querySelector?.('[data-i18n="ja"]');
    const enNode = element.querySelector?.('[data-i18n="en"]');
    if (jaNode && enNode) {
      if (jaNode.textContent !== ja) jaNode.textContent = ja;
      if (enNode.textContent !== en) enNode.textContent = en;
      return;
    }
    const text = currentLanguage() === 'en' ? en : ja;
    if (element.textContent !== text) element.textContent = text;
    element.removeAttribute?.('data-i18n');
  }

  function normalizePlannedFeatureCopy(element) {
    if (!element) return;
    const before = element.textContent || '';
    const after = before
      .replace(/は Pro 機能です/g, 'は Pro 予定です')
      .replace(/は Old Kanji Toolkit Pro で利用できます。/g, 'は Old Kanji Toolkit Pro での提供候補です。現在は利用できません。')
      .replace(/は Old Kanji Toolkit Pro で利用できます/g, 'は Old Kanji Toolkit Pro での提供候補です。現在は利用できません')
      .replace(/ are Pro features/g, ' are planned for Pro')
      .replace(/ is a Pro feature/g, ' is planned for Pro')
      .replace(/ are available in Old Kanji Toolkit Pro\./g, ' are planned for Old Kanji Toolkit Pro and are not currently available.')
      .replace(/ is available in Old Kanji Toolkit Pro\./g, ' is planned for Old Kanji Toolkit Pro and is not currently available.');
    if (after !== before) element.textContent = after;
  }

  function normalizeBillingUnavailableProUi(root) {
    if (!oldKanjiToolSlug()) return;
    const scope = root?.querySelectorAll ? root : global.document;
    const panels = scope.querySelectorAll?.('[data-okj-pro-state="billing-unavailable"], .okj-pro-state-billing-unavailable') || [];
    panels.forEach((panel) => {
      panel.dataset.okjProState = 'billing-unavailable';
      panel.classList.add('okj-pro-state-billing-unavailable');

      panel.querySelectorAll('button').forEach((button) => {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
      });

      const price = panel.querySelector('[data-okj-pro-price], .okj-pro-price, .okj-pro-panel__price');
      setLocalizedText(price, '課金未接続', 'Billing unavailable');

      const cta = panel.querySelector('[data-okj-pro-cta], #okj-pro-cta, .okj-pro-panel__cta .okj-pro-locked-button') ||
        Array.from(panel.children).find((child) => child.matches?.('button.okj-pro-locked-button'));
      setLocalizedText(cta, 'Pro は現在利用できません', 'Pro currently unavailable');

      const note = panel.querySelector('.okj-pro-panel__note');
      setLocalizedText(note, 'Pro は準備中です。課金・解放導線は接続されていません。', 'Pro is planned and not currently purchasable. Billing and unlock are not connected.');

      panel.querySelectorAll('[data-okj-feature-id] h3, [data-okj-feature-id] p').forEach(normalizePlannedFeatureCopy);
    });
  }

  function installBillingUnavailableProBoundary() {
    if (!oldKanjiToolSlug() || !global.document) return;
    const run = () => normalizeBillingUnavailableProUi(global.document);
    if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === 'childList' || mutation.type === 'characterData')) run();
    });
    const startObserver = () => {
      if (global.document.body) observer.observe(global.document.body, { childList: true, characterData: true, subtree: true });
    };
    if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    else startObserver();

    global.document.addEventListener('click', (event) => {
      if (event.target?.closest?.('[data-lang], .nw-lang-btn, #langJa, #langEn, #lang-ja, #lang-en')) queueMicrotask(run);
    });
  }

  global.NicheWorksProEntitlement = {
    DEFAULT_PRODUCT_ID,
    getProState,
    getFeatureState,
    getProductState,
    refreshProState,
    activateFromSession,
    clearProductSession,
    normalizeBillingUnavailableProUi
  };

  installBillingUnavailableProBoundary();

  const OLD_KANJI_ANALYTICS_TOOLS = OLD_KANJI_TOOLKIT_PAGES;
  const pathParts = global.location?.pathname?.split('/').filter(Boolean) || [];
  if (pathParts[0] === 'tools' && OLD_KANJI_ANALYTICS_TOOLS.has(pathParts[1]) && !global.__nicheworksOldKanjiAnalyticsLoading) {
    global.__nicheworksOldKanjiAnalyticsLoading = true;
    const script = global.document.createElement('script');
    script.src = '/assets/old-kanji-analytics.js?v=20260914-1';
    script.defer = true;
    global.document.head.appendChild(script);
  }
})(window);
