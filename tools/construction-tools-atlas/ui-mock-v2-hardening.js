(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function markDetailActions() {
    const actions = $(".ctaMockDetailActions");
    if (!actions) return;
    const buttons = $$('button', actions);
    if (buttons[0]) buttons[0].dataset.ctaMockFavorite = "true";
    if (buttons[1]) buttons[1].dataset.ctaMockShare = "true";
  }

  function syncVisibleCount() {
    const count = $("#resultCount");
    if (!count) return;
    const rows = $$("#resultList .row");
    if (!rows.length) return;
    const visible = rows.filter((row) => !row.hidden).length;
    const base = count.dataset.ctaBaseCount || count.textContent || "";
    if (!count.dataset.ctaBaseCount) count.dataset.ctaBaseCount = base;
    const next = visible === rows.length
      ? base
      : (document.documentElement.lang === "en" ? `Visible: ${visible}` : `表示中: ${visible}`);
    if (count.textContent !== next) count.textContent = next;
  }

  function sync() {
    markDetailActions();
    syncVisibleCount();
  }

  document.addEventListener("click", async (event) => {
    const share = event.target.closest("[data-cta-mock-share='true']");
    if (!share) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (window.CTA_DEEP_LINK?.shareCurrentEntry) {
      await window.CTA_DEEP_LINK.shareCurrentEntry();
      return;
    }
    const canonicalShare = $("#detailShare");
    if (canonicalShare) canonicalShare.click();
  }, true);

  const observer = new MutationObserver(() => requestAnimationFrame(sync));
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      sync();
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "class"] });
    }, { once: true });
  } else {
    sync();
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "class"] });
  }

  window.addEventListener("cta:language-mode", () => requestAnimationFrame(sync));
})();
