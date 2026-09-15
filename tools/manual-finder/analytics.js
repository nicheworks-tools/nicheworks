(() => {
  "use strict";

  const TOOL = "manual-finder";
  const SEARCH_DEBOUNCE_MS = 900;
  let searchTimer = null;

  function currentLang() {
    const active = document.querySelector(".nw-lang-switch button.active");
    return active && active.getAttribute("data-lang") === "en" ? "en" : "ja";
  }

  function track(name, params = {}) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, {
      tool: TOOL,
      language: currentLang(),
      ...params
    });
  }

  function queryLengthBucket(value) {
    const length = String(value || "").trim().length;
    if (!length) return "0";
    if (length <= 3) return "1-3";
    if (length <= 7) return "4-7";
    if (length <= 15) return "8-15";
    return "16+";
  }

  function visibleResultCount() {
    const node = document.getElementById("resultCount");
    const text = node ? node.textContent || "" : "";
    const totalMatch = text.match(/(?:全|of\s+)(\d+)/i);
    if (totalMatch) return Number(totalMatch[1]);
    if (/^\s*0\s*(?:件|records)?\s*$/i.test(text)) return 0;
    return null;
  }

  function resultBucket(count) {
    if (count === null || Number.isNaN(count)) return "unknown";
    if (count === 0) return "0";
    if (count <= 5) return "1-5";
    if (count <= 20) return "6-20";
    if (count <= 50) return "21-50";
    if (count <= 100) return "51-100";
    return "101+";
  }

  function searchEvent(method, extra = {}) {
    const count = visibleResultCount();
    track("manualfinder_search", {
      method,
      outcome: count === 0 ? "no_results" : count === null ? "unknown" : "results",
      result_bucket: resultBucket(count),
      ...extra
    });
  }

  function bindSearchInput() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    input.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      const bucket = queryLengthBucket(input.value);
      if (bucket === "0") return;
      searchTimer = window.setTimeout(() => {
        searchEvent("text", { query_length_bucket: bucket });
      }, SEARCH_DEBOUNCE_MS);
    });
  }

  function bindCategory() {
    const select = document.getElementById("categorySelect");
    if (!select) return;
    select.addEventListener("change", () => {
      const category = String(select.value || "all");
      window.setTimeout(() => searchEvent("category", { category }), 0);
    });
  }

  function bindQuickSearch() {
    const quick = document.getElementById("quickButtons");
    if (!quick) return;
    quick.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const category = button.getAttribute("data-category");
      const keyword = button.getAttribute("data-keyword") || button.getAttribute("data-brand");
      window.setTimeout(() => {
        if (category) searchEvent("quick_category", { preset: category });
        else if (keyword) searchEvent("quick_brand", { preset: keyword });
      }, 0);
    });
  }

  function bindResultClicks() {
    const results = document.getElementById("results");
    if (!results) return;
    results.addEventListener("click", (event) => {
      const link = event.target.closest(".card-links a");
      if (!link || !results.contains(link)) return;
      const card = link.closest(".card");
      if (!card) return;
      const links = Array.from(card.querySelectorAll(".card-links a"));
      const linkIndex = links.indexOf(link);
      track("manualfinder_result_click", {
        maker: String(card.dataset.maker || "unknown"),
        category: String(card.dataset.category || "unknown"),
        model_level: card.dataset.model ? "yes" : "no",
        link_kind: linkIndex === 0 ? "primary" : "support"
      });
    });
  }

  function bindPagination() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("#mfPrev, #mfNext");
      if (!button) return;
      track("manualfinder_pagination", {
        action: button.id === "mfPrev" ? "previous" : "next"
      });
    });
    document.addEventListener("change", (event) => {
      if (!(event.target instanceof Element) || event.target.id !== "mfPer") return;
      track("manualfinder_pagination", {
        action: "page_size",
        page_size: String(event.target.value || "unknown")
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindSearchInput();
    bindCategory();
    bindQuickSearch();
    bindResultClicks();
    bindPagination();
  });
})();
