(() => {
  "use strict";

  const helper = window.NWAmazonAffiliate;
  const config = window.NWTrashNaviAffiliate;
  if (!helper || !config) return;

  helper.configure({
    enabled: config.enabled === true,
    tool: config.tool,
    targets: config.targets
  });

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  // Rank a closed set of pre-approved tagged searches by a broad, local-only
  // topic. Never put the municipality, user's words, or a product claim in a URL.
  function searchIntent() {
    if (!document.getElementById("results")) return "general";
    const linkType = String(document.getElementById("typeSelect")?.value || "");
    const keyword = String(document.getElementById("keywordInput")?.value || "").trim().slice(0, 80);
    const topic = `${linkType} ${keyword}`;
    if (/粗大|大型|処分|片付|引.?越|bulky|moving|cleanup|declutter/i.test(topic)) return "cleanup";
    if (/収集|カレンダー|日程|pickup|calendar|schedule/i.test(topic)) return "collection";
    if (/分別|リサイクル|資源|ごみ|ゴミ|sorting|recycl|waste|trash/i.test(topic)) return "sorting";
    return "general";
  }

  const ORDER = Object.freeze({
    general: ["sorting_bin", "trash_bag_storage", "compression_bag", "packing_supplies"],
    sorting: ["sorting_bin", "trash_bag_storage", "compression_bag", "packing_supplies"],
    collection: ["trash_bag_storage", "sorting_bin", "compression_bag", "packing_supplies"],
    cleanup: ["packing_supplies", "compression_bag", "trash_bag_storage", "sorting_bin"]
  });

  function orderedOffers(intent) {
    const preferred = ORDER[intent] || ORDER.general;
    return [...config.offers].sort((a, b) => preferred.indexOf(a.key) - preferred.indexOf(b.key));
  }

  let observedView = false;
  function observeAffiliate(section) {
    if (observedView || !("IntersectionObserver" in window)) return;
    observedView = true;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      if (section.hidden || typeof window.gtag !== "function") return;
      helper.trackImpression({
        container: section,
        placement: "municipality_supporting_supplies",
        offerCount: section.querySelectorAll(".trashnavi-affiliate-link").length,
        intentBucket: searchIntent()
      });
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(section);
  }

  function render() {
    const section = document.getElementById("trashnaviAmazonAffiliate");
    const grid = document.getElementById("trashnaviAmazonAffiliateLinks");
    const disclosure = document.getElementById("trashnaviAmazonDisclosure");
    if (!section || !grid || !disclosure) return;

    const lang = currentLang();
    grid.replaceChildren();
    let mounted = 0;

    for (const offer of orderedOffers(searchIntent())) {
      const slot = document.createElement("div");
      slot.className = "trashnavi-affiliate-slot";
      grid.appendChild(slot);
      const ok = helper.mount({
        container: slot,
        target: offer.key,
        label: lang === "en" ? offer.labelEn : offer.labelJa,
        placement: "municipality_supporting_supplies",
        className: "trashnavi-affiliate-link"
      });
      if (ok) mounted += 1;
    }

    helper.renderDisclosure(disclosure, { includeEnglish: true });
    disclosure.querySelectorAll("[lang]").forEach((node) => {
      node.hidden = node.lang !== lang;
    });
    section.hidden = mounted === 0;
    if (mounted) observeAffiliate(section);
  }

  function init() {
    render();
    document.getElementById("typeSelect")?.addEventListener("change", render);
    document.getElementById("keywordInput")?.addEventListener("change", render);
    document.querySelectorAll(".nw-lang-switch button").forEach((button) => {
      button.addEventListener("click", () => setTimeout(render, 0));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
