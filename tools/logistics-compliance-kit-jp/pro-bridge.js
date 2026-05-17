(function(){
  "use strict";

  var PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  var ENTITLEMENT = "nicheworks_pro";
  var LEGACY_KEY = "nw_pro_logistics-compliance-kit-jp";
  var ACTIVE_TEXT = "Pro解放済み。このブラウザでは共通Proが有効です。";
  var PREVIEW_TEXT = "Previewモードです。このブラウザでは共通Proがまだ有効ではありません。";

  function getCommonStatus(){
    try{
      if(window.NWPro && typeof window.NWPro.getLocalStatus === "function"){
        return window.NWPro.getLocalStatus() || { active: false, entitlement: ENTITLEMENT, checkedAt: "" };
      }
    }catch(e){}
    return { active: false, entitlement: ENTITLEMENT, checkedAt: "" };
  }

  function hasLegacyFallback(){
    try{
      return window.localStorage && localStorage.getItem(LEGACY_KEY) === "1";
    }catch(e){
      return false;
    }
  }

  function resolveActive(status){
    var commonActive = Boolean(status && status.active && (!status.entitlement || status.entitlement === ENTITLEMENT));
    return commonActive || hasLegacyFallback();
  }

  function updateBuyLinks(){
    document.querySelectorAll("[data-pro-buy]").forEach(function(link){
      if(link.tagName && link.tagName.toLowerCase() === "a"){
        link.setAttribute("href", PAYMENT_LINK);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function setCollectionState(selector, hidden, active){
    document.querySelectorAll(selector).forEach(function(node){
      node.hidden = hidden;
      node.setAttribute("aria-hidden", hidden ? "true" : "false");
      if("disabled" in node){
        node.disabled = !active;
        node.setAttribute("aria-disabled", active ? "false" : "true");
      }
    });
  }

  function applyState(active, status){
    var activeValue = active ? "true" : "false";
    document.documentElement.dataset.proActive = activeValue;
    document.documentElement.setAttribute("data-pro-active", activeValue);

    document.querySelectorAll("[data-pro-status]").forEach(function(node){
      node.textContent = active ? ACTIVE_TEXT : PREVIEW_TEXT;
    });

    setCollectionState("[data-pro-preview]", active, false);
    setCollectionState("[data-pro-only]", !active, active);
    updateBuyLinks();

    window.dispatchEvent(new CustomEvent("nw-logistics-pro-change", {
      detail: { active: active, status: status || null, entitlement: ENTITLEMENT }
    }));
  }

  function refresh(){
    var status = getCommonStatus();
    applyState(resolveActive(status), status);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", refresh);
  }else{
    refresh();
  }

  window.addEventListener("storage", refresh);
  window.NWLogisticsProBridge = {
    refresh: refresh,
    applyState: applyState,
    PAYMENT_LINK: PAYMENT_LINK,
    ENTITLEMENT: ENTITLEMENT
  };
})();
