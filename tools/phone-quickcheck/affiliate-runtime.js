(() => {
  "use strict";

  const helper = window.NWAmazonAffiliate;
  const config = window.NWPhoneQuickCheckAffiliate;
  if (!helper || !config) return;

  helper.configure({
    enabled: config.enabled === true,
    tool: config.tool,
    targets: config.targets
  });

  let accessoryCatalog = [];

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function accessoryByVisibleLabel(label) {
    const clean = String(label || "").trim();
    if (!clean) return null;
    return accessoryCatalog.find((item) => item.labelJa === clean || item.labelEn === clean) || null;
  }

  function directChildByClass(parent, className) {
    return Array.from(parent?.children || []).find((node) => node.classList?.contains(className)) || null;
  }

  function decorateRoot(root) {
    if (!(root instanceof Element) || !accessoryCatalog.length) return;
    const recommend = root.querySelector(".recommend");
    if (!recommend) return;

    const rows = Array.from(recommend.querySelectorAll(".need"));
    const offers = [];
    const seen = new Set();

    for (const row of rows) {
      const label = row.querySelector("strong")?.textContent || "";
      const accessory = accessoryByVisibleLabel(label);
      if (!accessory || seen.has(accessory.key)) continue;
      const resolved = config.getOffer(accessory.key);
      if (!resolved) continue;
      seen.add(accessory.key);
      offers.push(resolved);
    }

    if (!offers.length) return;

    const grid = recommend.querySelector(".affiliate-grid");
    if (!grid) return;
    grid.replaceChildren();

    const placement = root.id === "sheetDetail" ? "mobile_sheet" : "desktop_detail";
    const lang = currentLang();

    for (const offer of offers) {
      const slot = document.createElement("div");
      slot.className = "affiliate-slot";
      grid.appendChild(slot);
      helper.mountUrl({
        container: slot,
        target: offer.target,
        url: offer.url,
        label: lang === "en" ? offer.labelEn : offer.labelJa,
        placement,
        className: "affiliate-btn amazon-cta"
      });
    }

    const note = directChildByClass(recommend, "detail-note");
    if (note) {
      note.textContent = lang === "en"
        ? "Amazon links are affiliate links. Confirm connector, charging standard, wattage, and cable requirements on the product page before purchase."
        : "Amazonリンクはアフィリエイトリンクです。購入前に商品ページで端子・充電規格・出力・ケーブル条件をご確認ください。";
    }

    let disclosure = directChildByClass(recommend, "amazon-disclosure");
    if (!disclosure) {
      disclosure = document.createElement("div");
      disclosure.className = "amazon-disclosure";
      recommend.appendChild(disclosure);
    }
    helper.renderDisclosure(disclosure, { includeEnglish: true });
  }

  function decorateAll() {
    decorateRoot(document.getElementById("desktopDetail"));
    decorateRoot(document.getElementById("sheetDetail"));
  }

  function observeRoot(root) {
    if (!(root instanceof Element)) return;
    const observer = new MutationObserver(() => decorateRoot(root));
    observer.observe(root, { childList: true });
  }

  async function init() {
    try {
      const response = await fetch("./data/accessories.json", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      accessoryCatalog = Array.isArray(payload.accessories) ? payload.accessories : [];
    } catch (_) {
      return;
    }

    const desktop = document.getElementById("desktopDetail");
    const sheet = document.getElementById("sheetDetail");
    observeRoot(desktop);
    observeRoot(sheet);
    decorateAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
