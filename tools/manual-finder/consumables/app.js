(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const input = $("modelQuery");
  const form = $("lookupForm");
  const results = $("lookupResults");
  const status = $("lookupStatus");
  const examples = $("exampleQueries");
  const disclosure = $("amazonDisclosure");
  const config = window.MANUALFINDER_AFFILIATE_CONFIG;
  const affiliate = window.NWAmazonAffiliate;
  let lang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  let records = [];

  const copy = (ja, en) => lang === "ja" ? ja : en;
  const normalize = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/\s+/g, "").trim();
  const validHttps = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch (_) {
      return "";
    }
  };

  function makeText(tag, value, className = "") {
    const el = document.createElement(tag);
    el.textContent = value;
    if (className) el.className = className;
    return el;
  }

  function buildRecords() {
    if (!config || !affiliate || !Array.isArray(config.printerConsumables) ||
        typeof config.getConsumableOffers !== "function") return [];
    const seen = new Set();
    const output = [];
    config.printerConsumables.forEach((row) => {
      if (!row || !row.maker || !row.model || !row.verifiedAt) return;
      const id = normalize(row.maker + "|" + row.model);
      if (seen.has(id)) return;
      seen.add(id);
      const source = validHttps(row.sourceUrl);
      if (!source) return;
      const offers = config.getConsumableOffers({
        maker: row.maker, model: row.model, category: "プリンター・複合機"
      }).filter((offer) => offer && offer.target && offer.url &&
        offer.sourceUrl && validHttps(offer.sourceUrl));
      if (offers.length) output.push({ maker: row.maker, model: row.model, source, offers, verifiedCodes: row.verifiedCodes || [] });
    });
    return output.sort((a, b) => (a.maker + a.model).localeCompare(b.maker + b.model, "ja", { numeric: true }));
  }

  function setLanguage(next) {
    lang = next === "ja" ? "ja" : "en";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.hidden = el.dataset.i18n !== lang;
    });
    document.querySelectorAll("[data-lang]").forEach((el) => {
      el.classList.toggle("active", el.dataset.lang === lang);
      el.setAttribute("aria-pressed", String(el.dataset.lang === lang));
    });
    input.placeholder = copy("例：MFC-J4440N、LC416、トナー型番", "e.g. MFC-J4440N, LC416, toner code");
    input.setAttribute("aria-label", copy("プリンター型番または消耗品型番", "Printer model or consumable code"));
    render();
  }

  function render() {
    results.replaceChildren();
    if (!records.length) {
      status.textContent = copy(
        "対応データを読み込めませんでした。ManualFinderから公式メーカーサイトを確認してください。",
        "Verified lookup data is unavailable. Use ManualFinder to check the manufacturer's official site."
      );
      disclosure.hidden = true;
      return;
    }

    const query = normalize(input.value);
    if (!query) {
      status.textContent = copy(
        "プリンター本体の型番、またはインク・トナーの型番を入力してください。",
        "Enter a printer model number or ink/toner cartridge code."
      );
      disclosure.hidden = true;
      return;
    }

    const matching = records.filter((row) => {
      const text = [row.maker, row.model, ...row.verifiedCodes, ...row.offers.flatMap(
        (offer) => [offer.key, offer.query, ...(offer.verifiedCodes || [])]
      )].join(" ");
      return normalize(text).includes(query);
    });
    status.textContent = matching.length
      ? copy("該当機種 " + matching.length + " 件（最大12件表示）", matching.length + " matching model(s), up to 12 shown")
      : copy("確認済みの対応情報が見つかりませんでした。公式メーカーサイトをご確認ください。",
             "No verified mapping found. Please check the manufacturer's official site.");
    let mountedAny = false;
    matching.slice(0, 12).forEach((row) => {
      const card = document.createElement("article");
      card.className = "result-card";
      card.appendChild(makeText("h3", row.maker + " " + row.model));
      card.appendChild(makeText("p",
        copy("対応品を探す前に、メーカー公式の消耗品情報で型番をご確認ください。",
             "Check the exact cartridge model on the manufacturer's official page before buying."),
        "hint"));
      const official = document.createElement("a");
      official.href = row.source;
      official.target = "_blank";
      official.rel = "noopener noreferrer";
      official.textContent = copy("メーカー公式の対応情報を見る", "Check official compatibility");
      official.className = "official";
      card.appendChild(official);

      const offers = document.createElement("div");
      offers.className = "offer-links";
      row.offers.slice(0, 6).forEach((offer) => {
        const slot = document.createElement("div");
        slot.className = "offer";
        offers.appendChild(slot);
        const ok = affiliate.mountUrl({
          container: slot,
          target: offer.target,
          url: offer.url,
          label: (lang === "ja" ? offer.labelJa : offer.labelEn) + " [PR]",
          placement: "consumables_lookup",
          destinationKey: "consumable:" + row.maker + ":" + row.model + ":" + (offer.key || offer.query),
          className: "amazon-link",
          language: lang
        });
        if (!ok) slot.remove();
        else mountedAny = true;
      });
      if (offers.childElementCount) card.appendChild(offers);
      results.appendChild(card);
    });
    if (mountedAny) {
      affiliate.renderDisclosure(disclosure, { includeEnglish: true });
      disclosure.querySelectorAll("[lang]").forEach((el) => {
        el.hidden = el.lang !== lang;
      });
    } else {
      disclosure.hidden = true;
    }
  }

  if (config && affiliate) {
    affiliate.configure({
      enabled: config.enabled === true,
      tool: "manual-finder-consumables",
      targets: config.targets || {}
    });
  }
  records = buildRecords();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
  input.addEventListener("input", render);
  examples.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-query]");
    if (!button) return;
    input.value = button.dataset.query;
    render();
    input.focus();
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  const params = new URLSearchParams(location.search);
  const initial = params.get("q");
  if (initial && initial.length <= 80) input.value = initial;
  const requestedLang = params.get("lang");
  if (requestedLang === "ja" || requestedLang === "en") lang = requestedLang;
  setLanguage(lang);
})();