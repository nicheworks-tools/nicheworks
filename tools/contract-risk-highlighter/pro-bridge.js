(function(){
  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const EXPECTED_ENTITLEMENT = "nicheworks_pro";
  const MAX_FREE_FINDINGS = 3;
  const PRO_ONLY_ACTION_IDS = new Set([
    "showAllBtn",
    "copyFullBtn",
    "copyConsultBtn",
    "copyQuestionsBtn",
    "copyMissingBtn",
    "downloadMdBtn",
    "downloadPdfBtn"
  ]);
  const PRO_OUTPUT_IDS = [
    "fullReview",
    "consultMemo",
    "counterpartyQuestions",
    "missingChecklist",
    "nextAction"
  ];
  const root = document.documentElement;
  let cleanupQueued = false;
  let toastTimer = null;

  function readPro(){
    try{
      if(window.NWPro && typeof window.NWPro.getLocalStatus === "function"){
        const status = window.NWPro.getLocalStatus() || {};
        return status.active === true && status.entitlement === EXPECTED_ENTITLEMENT;
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

  function showLockedMessage(){
    const toast = document.getElementById("toast");
    if(!toast) return;
    toast.textContent = root.lang === "en"
      ? "Pro feature locked. Activate the expected NicheWorks Pro entitlement first."
      : "Pro限定機能です。対象のNicheWorks Proを有効化してください。";
    toast.style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.display = "none"; }, 2200);
  }

  function clearProOutputs(){
    PRO_OUTPUT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if(!el) return;
      if("value" in el) el.value = "";
      else el.textContent = "";
    });
  }

  function enforceFreeFindingLimit(){
    const container = document.getElementById("findings");
    if(!container) return;
    const items = Array.from(container.children).filter((el) => el.classList.contains("finding") && !el.classList.contains("finding--locked"));
    if(items.length <= MAX_FREE_FINDINGS) return;

    const remaining = items.length - MAX_FREE_FINDINGS;
    items.slice(MAX_FREE_FINDINGS).forEach((el) => el.remove());
    container.querySelectorAll(".finding--locked").forEach((el) => el.remove());

    const lock = document.createElement("div");
    lock.className = "finding finding--locked";
    lock.textContent = root.lang === "en"
      ? `Pro shows all findings. (${remaining} more)`
      : `Proで全Findingsを表示できます。 (${remaining} more)`;
    container.appendChild(lock);
  }

  function cleanupInactiveState(){
    cleanupQueued = false;
    if(readPro()) return;
    root.dataset.proActive = "false";
    clearProOutputs();
    enforceFreeFindingLimit();
  }

  function scheduleCleanup(){
    if(cleanupQueued || readPro()) return;
    cleanupQueued = true;
    if(typeof queueMicrotask === "function") queueMicrotask(cleanupInactiveState);
    else Promise.resolve().then(cleanupInactiveState);
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
    if(!active) scheduleCleanup();
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("button,a") : null;
    const active = readPro();
    if(!active) root.dataset.proActive = "false";
    if(!target || active) return;

    const proOnly = PRO_ONLY_ACTION_IDS.has(target.id) || Boolean(target.closest("[data-pro-only]"));
    if(!proOnly) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showLockedMessage();
    scheduleCleanup();
  }, true);

  document.addEventListener("click", () => {
    if(!readPro()) scheduleCleanup();
  });
  window.addEventListener("nw-pro-status-change", () => scheduleCleanup());

  window.NWContractRiskPro = { refresh: apply, isActive: readPro };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
  window.addEventListener("storage", apply);
})();
