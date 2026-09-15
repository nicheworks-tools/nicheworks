(() => {
  "use strict";

  const REGISTRY_URL = "./data/image-registry-v2.3.json";
  const OFFER_URL = "./data/affiliate-offers-v2.3.json";
  const SHARED_AFFILIATE = "/assets/amazon-affiliate.js";
  const MODE_KEY = "cta_lang_mode";
  const imageById = new Map();
  const offerById = new Map();
  let typeFilter = "all";
  let sharedAffiliatePromise = null;
  let applying = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const langMode = () => localStorage.getItem(MODE_KEY) || (document.documentElement.lang === "en" ? "en" : "ja");
  const isEnglish = () => langMode() === "en";

  function loadScript(src, marker) {
    if (window.NWAmazonAffiliate) return Promise.resolve(window.NWAmazonAffiliate);
    const existing = document.querySelector(`script[${marker}]`);
    if (existing) return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(window.NWAmazonAffiliate), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
    });
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.setAttribute(marker, "v2.3");
      script.addEventListener("load", () => resolve(window.NWAmazonAffiliate), { once: true });
      script.addEventListener("error", () => resolve(null), { once: true });
      document.head.appendChild(script);
    });
  }

  async function loadJson(url) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) { return null; }
  }

  async function loadData() {
    const [registry, offers] = await Promise.all([loadJson(REGISTRY_URL), loadJson(OFFER_URL)]);
    (Array.isArray(registry?.entries) ? registry.entries : []).forEach((entry) => {
      if (!entry?.entry_id) return;
      const display = entry?.primary?.display || "";
      const thumbnail = entry?.primary?.thumbnail || display;
      if (!thumbnail && !display) return;
      imageById.set(entry.entry_id, { thumbnail, display, altJa: entry.alt_ja || "", altEn: entry.alt_en || "" });
    });
    (Array.isArray(offers?.offers) ? offers.offers : []).forEach((offer) => {
      if (offer?.entry_id && offer?.status === "active" && offer?.amazon_url) offerById.set(offer.entry_id, offer);
    });
  }

  function ensureBrand() {
    const row = $(".topbar__row");
    const brand = $("#brandTitle");
    if (!row || !brand || $(".ctaMockBrand", row)) return;
    const wrap = document.createElement("div");
    wrap.className = "ctaMockBrand";
    const home = document.createElement("a");
    home.className = "ctaMockHome";
    home.href = "https://nicheworks.app/";
    home.textContent = "NicheWorks";
    const copy = document.createElement("div");
    copy.className = "ctaMockBrandCopy";
    const subtitle = document.createElement("p");
    subtitle.className = "ctaMockSubtitle";
    subtitle.textContent = isEnglish() ? "Find tools and jobsite terms by name, purpose, appearance, or task." : "名前が分からなくても、用途・見た目・作業から探せます。";
    brand.parentNode.insertBefore(wrap, brand);
    copy.appendChild(brand);
    copy.appendChild(subtitle);
    wrap.appendChild(home);
    wrap.appendChild(copy);
  }

  function ensureFavoriteProxy() {
    const actions = $(".topbar__right");
    if (!actions || $("#ctaFavOnlyTop")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "ctaFavOnlyTop";
    const sync = () => {
      const active = Boolean($("#favsOnly")?.checked);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.textContent = `${active ? "★" : "☆"} ${isEnglish() ? "Favorites" : "お気に入り"}`;
    };
    button.addEventListener("click", () => { $("#favsOnly")?.click(); sync(); });
    actions.appendChild(button);
    sync();
  }

  function ensureSearchCard() {
    const search = $(".search");
    const filters = $(".filters");
    if (!search || !filters) return;
    let card = $("#ctaMockSearchCard");
    if (!card) {
      card = document.createElement("section");
      card.id = "ctaMockSearchCard";
      card.className = "ctaMockSearchCard";
      search.parentNode.insertBefore(card, search);
      const line = document.createElement("div");
      line.className = "ctaMockSearchLine";
      card.appendChild(line);
      line.appendChild(search);
      const filterButton = $("#filterOpenBtn");
      if (filterButton) line.appendChild(filterButton);
      card.appendChild(filters);
    }
    const interpretation = $("#interpretationBar");
    if (interpretation && interpretation.parentElement !== card) card.insertBefore(interpretation, $(".filters", card) || null);
    ensureTypeFilters(card);
  }

  function ensureTypeFilters(card) {
    if (!card || $("#ctaMockTypeFilters")) return;
    const row = document.createElement("div");
    row.id = "ctaMockTypeFilters";
    row.className = "ctaMockTypeFilters";
    [["all","すべて","All"],["tool","工具","Tools"],["material","材料","Materials"],["task","作業","Tasks"],["term","現場用語","Terms"]].forEach(([value, ja, en]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ctaMockTypeFilter";
      button.dataset.typeFilter = value;
      button.dataset.labelJa = ja;
      button.dataset.labelEn = en;
      button.textContent = isEnglish() ? en : ja;
      button.addEventListener("click", () => { typeFilter = value; applyTypeFilter(); });
      row.appendChild(button);
    });
    card.appendChild(row);
    applyTypeFilter();
  }

  function normalizedType(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (["tool","tools","工具"].includes(raw)) return "tool";
    if (["material","materials","材料","資材"].includes(raw)) return "material";
    if (["task","work","作業","工法"].includes(raw)) return "task";
    if (["term","slang","現場用語","用語"].includes(raw)) return "term";
    return raw;
  }

  function applyTypeFilter() {
    $$("[data-type-filter]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.typeFilter === typeFilter);
      button.textContent = isEnglish() ? button.dataset.labelEn : button.dataset.labelJa;
    });
    $$("#resultList .row").forEach((row) => {
      const rowType = normalizedType($(".row__meta .chip", row)?.textContent);
      row.hidden = typeFilter !== "all" && rowType !== typeFilter;
    });
  }

  function decorateResultRows() {
    $$("#resultList .row[data-entry-id]").forEach((row) => {
      if (!$(".ctaResultThumb", row)) {
        const holder = document.createElement("div");
        holder.className = "ctaResultThumb";
        const image = imageById.get(row.dataset.entryId);
        if (image?.thumbnail) {
          const img = document.createElement("img");
          img.src = image.thumbnail;
          img.alt = isEnglish() ? (image.altEn || "Representative image") : (image.altJa || "代表画像");
          img.loading = "lazy";
          holder.appendChild(img);
        } else holder.textContent = isEnglish() ? "No image" : "画像未整備";
        row.insertBefore(holder, row.firstChild);
      }
    });
    applyTypeFilter();
  }

  function selectedEntryId() {
    const selected = $("#resultList .row--selected[data-entry-id]");
    if (selected?.dataset.entryId) return selected.dataset.entryId;
    const urlId = new URL(location.href).searchParams.get("entry");
    if (urlId) return urlId;
    const match = ($("#tabMeta")?.textContent || "").match(/id:\s*([^\s,]+)/i);
    return match ? match[1].trim() : "";
  }

  function ensureDetailActions() {
    const body = $("#detailSheet .sheet__body");
    if (!body || $(".ctaMockDetailActions", body)) return;
    const actions = document.createElement("div");
    actions.className = "ctaMockDetailActions";
    const fav = document.createElement("button");
    fav.type = "button";
    fav.textContent = isEnglish() ? "☆ Favorite" : "☆ お気に入り";
    fav.addEventListener("click", () => $("#detailStar")?.click());
    const share = document.createElement("button");
    share.type = "button";
    share.textContent = isEnglish() ? "Share ↗" : "共有 ↗";
    share.addEventListener("click", () => {
      const button = $("#detailSheet [data-cta-share], #detailSheet .ctaShareButton, #detailSheet [data-share-entry]");
      if (button) button.click();
      else navigator.clipboard?.writeText(location.href).catch(() => {});
    });
    actions.append(fav, share);
    body.insertBefore(actions, body.firstChild);
  }

  function ensureAffiliateBox() {
    const body = $("#detailSheet .sheet__body");
    if (!body) return null;
    let box = $("#ctaAffiliateBox", body);
    if (box) return box;
    box = document.createElement("aside");
    box.id = "ctaAffiliateBox";
    box.className = "ctaAffiliateBox";
    box.hidden = true;
    box.innerHTML = '<h3 class="ctaAffiliateBox__title">Amazon</h3><p class="ctaAffiliateBox__copy">関連する工具・材料</p><div id="ctaAffiliateMount" class="ctaAffiliateMount"></div><div id="ctaAffiliateDisclosure" class="ctaAffiliateDisclosure"></div>';
    body.appendChild(box);
    return box;
  }

  async function renderAffiliate() {
    const box = ensureAffiliateBox();
    if (!box) return;
    const offer = offerById.get(selectedEntryId());
    const mount = $("#ctaAffiliateMount", box);
    const disclosure = $("#ctaAffiliateDisclosure", box);
    if (!offer) {
      box.hidden = true;
      mount?.replaceChildren();
      disclosure?.replaceChildren();
      return;
    }
    sharedAffiliatePromise ||= loadScript(SHARED_AFFILIATE, "data-nw-amazon-affiliate");
    const helper = await sharedAffiliatePromise;
    if (!helper) { box.hidden = true; return; }
    helper.configure({ enabled: true, tool: "construction-tools-atlas", targets: { canonical_entry: offer.amazon_url } });
    const mounted = helper.mount({ container: mount, target: "canonical_entry", label: isEnglish() ? (offer.label_en || "Find on Amazon") : (offer.label_ja || "Amazonで探す"), placement: "detail_related_tools" });
    helper.renderDisclosure(disclosure, { includeEnglish: langMode() === "both" });
    box.hidden = !mounted;
  }

  function flattenDetail() {
    const tabs = $("#detailTabs");
    if (tabs) tabs.hidden = true;
    ["tabMeaning","tabExamples","tabAliases","tabMeta"].forEach((id) => { const panel = document.getElementById(id); if (panel) panel.hidden = false; });
    ensureDetailActions();
    renderAffiliate();
  }

  function localizeStatic() {
    const subtitle = $(".ctaMockSubtitle");
    if (subtitle) subtitle.textContent = isEnglish() ? "Find tools and jobsite terms by name, purpose, appearance, or task." : "名前が分からなくても、用途・見た目・作業から探せます。";
    const fav = $("#ctaFavOnlyTop");
    if (fav) fav.textContent = `${$("#favsOnly")?.checked ? "★" : "☆"} ${isEnglish() ? "Favorites" : "お気に入り"}`;
    $$("[data-type-filter]").forEach((button) => { button.textContent = isEnglish() ? button.dataset.labelEn : button.dataset.labelJa; });
  }

  function apply() {
    if (applying) return;
    applying = true;
    try { ensureBrand(); ensureFavoriteProxy(); ensureSearchCard(); decorateResultRows(); flattenDetail(); localizeStatic(); }
    finally { applying = false; }
  }

  async function init() {
    await loadData();
    apply();
    const observer = new MutationObserver(() => requestAnimationFrame(apply));
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["hidden","class"] });
    window.addEventListener("cta:language-mode", () => requestAnimationFrame(apply));
    window.addEventListener("popstate", () => requestAnimationFrame(apply));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
