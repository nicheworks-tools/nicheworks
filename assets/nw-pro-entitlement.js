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

  global.NicheWorksProEntitlement = {
    DEFAULT_PRODUCT_ID,
    getProState,
    getFeatureState,
    getProductState,
    refreshProState,
    activateFromSession,
    clearProductSession
  };
})(window);
