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

  // Context helps visitors make an informed choice; no local disposal rules
  // or Amazon product claims are inferred from the search input.
  const CHOICE_GUIDES = Object.freeze({
    general: {
      ja: "用品の購入前に、自治体の指定袋・分別区分・収集方法を公式情報で確認してください。以下は一般用品の検索先です。",
      en: "Check official municipal rules for bag specifications, sorting categories, and collection before shopping. These are general product searches."
    },
    sorting: {
      ja: "分別容器は自治体の分別区分と指定袋のサイズを確認し、設置場所に合うものを選びます。",
      en: "Before choosing sorting bins, check your municipality's waste categories, required bags, and available space."
    },
    collection: {
      ja: "収集日・収集場所を公式情報で確認したうえで、袋の保管場所と出し入れのしやすさを考えます。",
      en: "First confirm the official pickup schedule and location, then consider bag storage and access."
    },
    cleanup: {
      ja: "粗大ごみの申込方法と料金は必ず自治体で確認してください。以下は引越し・整理に使う一般用品で、粗大ごみの処理を代行しません。",
      en: "Check the official bulky-waste application process and fees first. These are general moving and organizing supplies, not disposal services."
    }
  });

  const OFFER_GUIDES = Object.freeze({
    sorting_bin: {
      ja: "確認ポイント：必要な分別の数、設置幅、容量。",
      en: "Check: number of sorting categories, available width, and capacity."
    },
    trash_bag_storage: {
      ja: "確認ポイント：指定袋の寸法、保管場所。",
      en: "Check: approved bag size and available storage space."
    },
    compression_bag: {
      ja: "確認ポイント：収納する素材と再使用の予定。廃棄時は自治体ルールを優先。",
      en: "Check: material and reuse plans. Follow municipal rules for disposal."
    },
    packing_supplies: {
      ja: "確認ポイント：梱包する物の大きさ、必要数、運搬方法。",
      en: "Check: item size, quantity needed, and transport method."
    }
  });

  function renderChoiceGuide(section, intent, lang) {
    let guide = section.querySelector(".trashnavi-affiliate-choice-note");
    if (!guide) {
      guide = document.createElement("p");
      guide.className = "trashnavi-affiliate-choice-note";
      section.querySelector(".trashnavi-affiliate-grid")?.before(guide);
    }
    guide.textContent = (CHOICE_GUIDES[intent] || CHOICE_GUIDES.general)[lang];
    guide.lang = lang;
  }

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
    const intent = searchIntent();
    renderChoiceGuide(section, intent, lang);
    grid.replaceChildren();
    let mounted = 0;

    for (const offer of orderedOffers(intent)) {
      const slot = document.createElement("div");
      slot.className = "trashnavi-affiliate-slot";
      grid.appendChild(slot);
      const ok = helper.mount({
        container: slot,
        target: offer.key,
        label: lang === "en" ? offer.labelEn : offer.labelJa,
        placement: "municipality_supporting_supplies",
        intentBucket: intent,
        className: "trashnavi-affiliate-link"
      });
      if (ok) {
        const note = document.createElement("p");
        note.className = "trashnavi-affiliate-offer-note";
        note.lang = lang;
        note.textContent = OFFER_GUIDES[offer.key][lang];
        slot.appendChild(note);
        mounted += 1;
      }
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
