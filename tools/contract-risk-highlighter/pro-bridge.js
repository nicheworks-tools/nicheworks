(function(){
  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const root = document.documentElement;

  function normalizeStatus(status){
    if(!status) return false;
    if(typeof status === "string") return ["active", "valid", "unlocked", "true"].includes(status.toLowerCase());
    return status.active === true || status.isActive === true || status.proActive === true || status.status === "active";
  }

  function readPro(){
    try{
      if(window.NWPro && typeof window.NWPro.getLocalStatus === "function"){
        return normalizeStatus(window.NWPro.getLocalStatus());
      }
    }catch(_){
      return false;
    }
    return false;
  }

  function textFor(active){
    const isEn = root.lang === "en";
    if(active) return isEn ? "Pro unlocked" : "Pro解放済み";
    return isEn ? "Preview mode" : "Previewモード";
  }

  function apply(){
    const active = readPro();
    root.dataset.proActive = active ? "true" : "false";
    document.querySelectorAll("[data-pro-status]").forEach((el) => { el.textContent = textFor(active); });
    document.querySelectorAll("[data-pro-preview]").forEach((el) => { el.hidden = active; });
    document.querySelectorAll("[data-pro-only]").forEach((el) => { el.hidden = !active; });
    document.querySelectorAll("[data-pro-buy]").forEach((el) => {
      if(el.tagName === "A") el.href = PAYMENT_LINK;
      else el.setAttribute("data-href", PAYMENT_LINK);
    });
    window.dispatchEvent(new CustomEvent("nw-pro-status-change", { detail: { active } }));
  }

  window.NWContractRiskPro = { refresh: apply, isActive: () => root.dataset.proActive === "true" };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
  window.addEventListener("storage", apply);
})();
