(function (global) {
  'use strict';

  const DEFAULT_PRODUCT_ID = 'okj.toolkit_pro';
  const DEFAULT_STATE = 'billing-unavailable';

  function buildState(input) {
    const safeInput = input && typeof input === 'object' ? input : {};
    return {
      productId: safeInput.productId || DEFAULT_PRODUCT_ID,
      featureId: safeInput.featureId || null,
      state: DEFAULT_STATE,
      active: false,
      source: 'disabled',
      reason: 'billing_not_connected'
    };
  }

  function getProState(input) {
    return buildState(input);
  }

  function getFeatureState(input) {
    return buildState(input);
  }

  function getProductState(input) {
    return buildState(input);
  }

  global.NicheWorksProEntitlement = {
    getProState,
    getFeatureState,
    getProductState
  };
})(window);
