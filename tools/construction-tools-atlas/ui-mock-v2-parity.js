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
  let scheduled = false;
  let affiliateRenderKey = "";
  let lastSelectedId = "";

  const LABELS = {
    tool:["工具","Tool"], tools:["工具","Tool"], material:["材料","Material"], materials:["材料","Material"],
    component:["部材","Component"], accessory:["付属品","Accessory"], equipment:["機器","Equipment"], safety:["安全用品","Safety"],
    consumable:["消耗品","Consumable"], fastener:["締結材","Fastener"], hardware:["金物","Hardware"], fixture:["器具","Fixture"],
    inspection:["検査","Inspection"], process:["作業・工程","Process"], rigging:["玉掛け・揚重","Rigging"], temporary:["仮設","Temporary"],
    structure:["構造","Structure"], defect:["不具合","Defect"], document:["書類","Document"], test:["試験","Test"], site:["現場","Site"],
    power_tool:["電動工具","Power tool"], hand_tool:["手工具","Hand tool"], measuring:["測定","Measuring"], measuring_tool:["測定工具","Measuring tool"],
    fastening:["締結","Fastening"], drilling:["穴あけ","Drilling"], cutting:["切断","Cutting"], grinding:["研削","Grinding"], sanding:["研磨","Sanding"],
    high_torque:["高トルク","High torque"], carpentry:["大工","Carpentry"], interior:["内装","Interior"], exterior:["外装","Exterior"],
    electrical:["電気","Electrical"], plumbing:["配管","Plumbing"], hvac:["空調","HVAC"], mep:["設備","MEP"], concrete:["コンクリート","Concrete"],
    masonry:["石工・組積","Masonry"], formwork:["型枠","Formwork"], rebar:["鉄筋","Rebar"], roofing:["屋根","Roofing"], waterproofing:["防水","Waterproofing"],
    painting:["塗装","Painting"], flooring:["床","Flooring"], ceiling:["天井","Ceiling"], wall:["壁","Wall"], surveying:["測量","Surveying"],
    layout:["墨出し","Layout"], install:["取付","Installation"], installation:["取付","Installation"], repair:["補修","Repair"], demolition:["解体","Demolition"],
    earthwork:["土工","Earthwork"], drainage:["排水","Drainage"], joint:["目地","Joint"], sealant:["シーリング","Sealant"], scaffold:["足場","Scaffold"], scaffolding:["足場","Scaffolding"]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const langMode = () => localStorage.getItem(MODE_KEY) || (document.documentElement.lang === "en" ? "en" : "ja");
  const isEnglish = () => langMode() === "en";
  const labelIndex = () => isEnglish() ? 1 : 0;
  const setText = (node, value) => { if (node && node.textContent !== value) node.textContent = value; };

  function cleanKey(value) {
    return String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  }

  function humanize(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const key = cleanKey(raw);
    if (LABELS[key]) return LABELS[key][labelIndex()];
    return "";
  }

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

  function resolveId(id) {
    const value = String(id || "").trim();
    if (!value) return "";
    try { return window.CTA_DATA_LOADER?.resolveCanonicalId?.(value) || value; }
    catch (_) { return value; }
  }

  function ensureBrand() {
    const row = $(".topbar__row");
    const brand = $("#brandTitle");
    if (!row || !brand) return;
    let wrap = $(".ctaMockBrand", row);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "ctaMockBrand";
      const copy = document.createElement("div");
      copy.className = "ctaMockBrandCopy";
      const subtitle = document.createElement("p");
      subtitle.className = "ctaMockSubtitle";
      brand.parentNode.insertBefore(wrap, brand);
      copy.appendChild(brand);
      copy.appendChild(subtitle);
      wrap.appendChild(copy);
    }
    $(".ctaMockHome", wrap)?.remove();
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
      button.addEventListener("click", () => { typeFilter = value; applyTypeFilter(); });
      row.appendChild(button);
    });
    card.appendChild(row);
    applyTypeFilter();
  }

  function normalizedType(value) {
    const raw = cleanKey(value);
    if (["tool","tools"].includes(raw)) return "tool";
    if (["material","materials"].includes(raw)) return "material";
    if (["task","work","process"].includes(raw)) return "task";
    if (["term","slang"].includes(raw)) return "term";
    return raw;
  }

  function decorateTaxonomy(row) {
    const chips = $$(".row__meta .chip", row);
    chips.forEach((chip) => {
      if (!chip.dataset.taxonomyKey) chip.dataset.taxonomyKey = chip.textContent.trim();
      const label = humanize(chip.dataset.taxonomyKey);
      if (chip.hidden !== !label) chip.hidden = !label;
      if (label) setText(chip, label);
    });
    if (chips[0]) row.dataset.entryType = normalizedType(chips[0].dataset.taxonomyKey);
  }

  function applyTypeFilter() {
    $$("[data-type-filter]").forEach((button) => {
      const active = button.dataset.typeFilter === typeFilter;
      if (button.classList.contains("is-active") !== active) button.classList.toggle("is-active", active);
      setText(button, isEnglish() ? button.dataset.labelEn : button.dataset.labelJa);
    });
    $$("#resultList .row").forEach((row) => {
      decorateTaxonomy(row);
      const shouldHide = typeFilter !== "all" && row.dataset.entryType !== typeFilter;
      if (row.hidden !== shouldHide) row.hidden = shouldHide;
    });
  }

  function decorateResultRows() {
    $$("#resultList .row[data-entry-id]").forEach((row) => {
      decorateTaxonomy(row);
      if (!$(".ctaResultThumb", row)) {
        const holder = document.createElement("div");
        holder.className = "ctaResultThumb";
        const image = imageById.get(resolveId(row.dataset.entryId)) || imageById.get(row.dataset.entryId);
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
    if (selected?.dataset.entryId) return resolveId(selected.dataset.entryId);
    const urlId = new URL(location.href).searchParams.get("entry");
    if (urlId) return resolveId(urlId);
    return resolveId(lastSelectedId);
  }

  function ensureDetailActions() {
    const body = $("#detailSheet .sheet__body");
    const term = $("#detailSheet .termblock");
    if (!body || !term) return;
    let actions = $(".ctaMockDetailActions", body);
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "ctaMockDetailActions";
      const fav = document.createElement("button");
      fav.type = "button";
      fav.dataset.ctaMockFavorite = "true";
      fav.addEventListener("click", () => $("#detailStar")?.click());
      const share = document.createElement("button");
      share.type = "button";
      share.dataset.ctaMockShare = "true";
      share.addEventListener("click", async () => {
        if (window.CTA_DEEP_LINK?.shareCurrentEntry) await window.CTA_DEEP_LINK.shareCurrentEntry();
        else navigator.clipboard?.writeText(location.href).catch(() => {});
      });
      actions.append(fav, share);
      term.insertAdjacentElement("afterend", actions);
    }
    const buttons = $$('button', actions);
    setText(buttons[0], isEnglish() ? "☆ Favorite" : "☆ お気に入り");
    setText(buttons[1], isEnglish() ? "Share ↗" : "共有 ↗");
  }

  function ensureDetailTaxonomy() {
    const body = $("#detailSheet .sheet__body");
    const actions = $(".ctaMockDetailActions", body);
    if (!body || !actions) return;
    let section = $("#ctaDetailTaxonomy", body);
    if (!section) {
      section = document.createElement("div");
      section.id = "ctaDetailTaxonomy";
      section.className = "ctaDetailTaxonomy";
      actions.insertAdjacentElement("afterend", section);
    }
    const id = selectedEntryId();
    const row = id ? $$("#resultList .row[data-entry-id]").find((item) => resolveId(item.dataset.entryId) === id) : null;
    if (!row) { if (!section.hidden) section.hidden = true; return; }
    const sources = $$(".row__meta .chip", row).slice(0, 6).filter((source) => humanize(source.dataset.taxonomyKey || source.textContent));
    const signature = `${id}|${langMode()}|${sources.map((source) => source.dataset.taxonomyKey || source.textContent).join("|")}`;
    if (section.dataset.signature !== signature) {
      section.replaceChildren();
      sources.forEach((source) => {
        const chip = document.createElement("span");
        chip.className = "ctaDetailTaxonomy__chip";
        const raw = source.dataset.taxonomyKey || source.textContent;
        const label = humanize(raw);
        if (!label) return;
        chip.dataset.taxonomyKey = raw;
        chip.textContent = label;
        section.appendChild(chip);
      });
      section.dataset.signature = signature;
    }
    const shouldHide = section.children.length === 0;
    if (section.hidden !== shouldHide) section.hidden = shouldHide;
  }

  function removeLegacyDetailSupport() {
    $("#detailSheet .supportInline")?.remove();
    $("#supportInlineBtn")?.remove();
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
    box.innerHTML = '<h3 class="ctaAffiliateBox__title"></h3><p class="ctaAffiliateBox__copy"></p><div id="ctaAffiliateMount" class="ctaAffiliateMount"></div><div id="ctaAffiliateDisclosure" class="ctaAffiliateDisclosure"></div>';
    body.appendChild(box);
    return box;
  }

  async function renderAffiliate() {
    const box = ensureAffiliateBox();
    if (!box) return;
    const id = selectedEntryId();
    const offer = offerById.get(id);
    const renderKey = `${id}|${langMode()}|${offer?.offer_id || "none"}`;
    if (affiliateRenderKey === renderKey) return;
    affiliateRenderKey = renderKey;
    const mount = $("#ctaAffiliateMount", box);
    const disclosure = $("#ctaAffiliateDisclosure", box);
    if (!offer) {
      if (!box.hidden) box.hidden = true;
      mount?.replaceChildren();
      disclosure?.replaceChildren();
      return;
    }
    setText($(".ctaAffiliateBox__title", box), isEnglish() ? "Related tools / materials" : "関連する工具・材料");
    setText($(".ctaAffiliateBox__copy", box), isEnglish() ? "Amazon Japan handoff for this maintained dictionary entry." : "この辞典項目に対応するAmazon.co.jpの固定リンクです。");
    mount?.replaceChildren();
    disclosure?.replaceChildren();
    sharedAffiliatePromise ||= loadScript(SHARED_AFFILIATE, "data-nw-amazon-affiliate");
    const helper = await sharedAffiliatePromise;
    if (!helper) { box.hidden = true; return; }
    helper.configure({ enabled: true, tool: "construction-tools-atlas", targets: { canonical_entry: offer.amazon_url } });
    const mounted = helper.mount({
      container: mount,
      target: "canonical_entry",
      label: isEnglish() ? (offer.label_en || "Find on Amazon") : (offer.label_ja || "Amazonで探す"),
      placement: "detail_related_tools"
    });
    helper.renderDisclosure(disclosure, { includeEnglish: langMode() === "both" });
    if (box.hidden === Boolean(mounted)) box.hidden = !mounted;
  }

  function flattenDetail() {
    const tabs = $("#detailTabs");
    if (tabs && !tabs.hidden) tabs.hidden = true;
    ["tabMeaning","tabExamples","tabAliases"].forEach((id) => {
      const panel = document.getElementById(id);
      if (panel?.hidden) panel.hidden = false;
    });
    const meta = $("#tabMeta");
    if (meta && !meta.hidden) meta.hidden = true;
    removeLegacyDetailSupport();
    ensureDetailActions();
    ensureDetailTaxonomy();
    renderAffiliate();
  }

  function localizeStatic() {
    const subtitle = $(".ctaMockSubtitle");
    setText(subtitle, isEnglish() ? "Find tools and jobsite terms by name, purpose, appearance, or task." : "名前が分からなくても、用途・見た目・作業から探せます。");
    const fav = $("#ctaFavOnlyTop");
    setText(fav, `${$("#favsOnly")?.checked ? "★" : "☆"} ${isEnglish() ? "Favorites" : "お気に入り"}`);
    $$("[data-type-filter]").forEach((button) => setText(button, isEnglish() ? button.dataset.labelEn : button.dataset.labelJa));
    $$("[data-taxonomy-key]").forEach((chip) => {
      const label = humanize(chip.dataset.taxonomyKey);
      if (chip.hidden !== !label) chip.hidden = !label;
      if (label) setText(chip, label);
    });
    ensureDetailActions();
  }

  function apply() {
    if (applying) return;
    applying = true;
    try {
      ensureBrand();
      ensureFavoriteProxy();
      ensureSearchCard();
      decorateResultRows();
      flattenDetail();
      localizeStatic();
    } finally { applying = false; }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  }

  function isOwnedMutationTarget(target) {
    const element = target?.nodeType === 1 ? target : target?.parentElement;
    return Boolean(element?.closest?.(".ctaMockBrand,.ctaMockTypeFilters,.ctaResultThumb,.ctaDetailTaxonomy,.ctaMockDetailActions,.ctaAffiliateBox"));
  }

  async function init() {
    await loadData();
    apply();
    document.addEventListener("click", (event) => {
      const row = event.target.closest("#resultList .row[data-entry-id]");
      if (!row) return;
      lastSelectedId = row.dataset.entryId || "";
      setTimeout(() => { ensureDetailTaxonomy(); renderAffiliate(); }, 0);
      setTimeout(() => { ensureDetailTaxonomy(); renderAffiliate(); }, 90);
    }, true);
    const observer = new MutationObserver((mutations) => {
      if (mutations.every((mutation) => isOwnedMutationTarget(mutation.target))) return;
      scheduleApply();
    });
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["hidden","class"] });
    window.addEventListener("cta:language-mode", scheduleApply);
    window.addEventListener("popstate", scheduleApply);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
