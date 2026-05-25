(() => {
  let currentLang = "ja";
  let entriesCache = [];
  let currentFilter = "all";
  let currentQuery = "";
  let metaCache = { popularOrder: [], entries: {} };

  const messages = {
    ja: {
      loading: "辞書データを読み込み中です…",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。",
      copiedOld: "旧字体をコピーしました",
      copiedNew: "現代表記をコピーしました",
      placeholder: "旧字体・現代表記・一部の読み/意味で検索できます",
      noMatch: "該当する旧字体が見つかりませんでした。別の漢字・読み・新字体で検索してください。",
      showing: "表示中",
      searchResults: "検索結果",
      total: "全"
    },
    en: {
      loading: "Loading dictionary…",
      loadError: "Failed to load dictionary. Please try again later.",
      copiedOld: "Copied old form",
      copiedNew: "Copied modern form",
      placeholder: "Search by old form, modern form, or selected readings/meanings",
      noMatch: "No matching entries found. Try another kanji, selected reading, or modern form.",
      showing: "Showing",
      searchResults: "Search results",
      total: "total"
    }
  };

  const filters = [
    { id: "all", ja: "すべて", en: "All" },
    { id: "popular", ja: "よく使う", en: "Common" },
    { id: "name", ja: "人名・地名", en: "Names / Places" },
    { id: "common", ja: "旧常用漢字", en: "Common-use old forms" },
    { id: "document", ja: "文献・古文書", en: "Old documents" },
    { id: "rare", ja: "難読・参考", en: "Rare / Reference" }
  ];

  const fallbackPopularOrder = ["會", "區", "國", "壽", "學", "廣", "德", "戀", "舊", "榮", "澤", "濱", "狀", "獨", "禮", "體", "邊", "邉", "醫", "鐵", "驛", "齋", "﨑", "龍", "櫻", "實"];
  const nameOld = new Set(["澤", "邊", "邉", "齋", "齊", "濱", "﨑", "德", "廣", "榮", "壽", "神", "祥", "福", "穗", "鄕", "國", "龍", "櫻", "實"]);
  const commonOld = new Set(["亞", "惡", "壓", "圍", "醫", "爲", "隱", "營", "驛", "應", "歐", "奧", "樂", "學", "關", "觀", "舊", "區", "徑", "輕", "藝", "儉", "劍", "嚴", "廣", "國", "齋", "參", "兒", "實", "壽", "從", "處", "敍", "將", "燒", "證", "讓", "眞", "圖", "數", "聲", "靜", "攝", "專", "戰", "淺", "爭", "總", "聰", "莊", "屬", "續", "體", "對", "臺", "擇", "澤", "擔", "團", "彈", "斷", "遲", "廳", "聽", "鐵", "點", "轉", "傳", "燈", "德", "獨", "讀", "惱", "腦", "廢", "拜", "賣", "麥", "發", "髮", "拔", "祕", "濱", "拂", "變", "邊", "寶", "豐", "滿", "藥", "豫", "餘", "譽", "樣", "謠", "來", "覽", "龍", "禮", "靈", "齡", "歷", "戀", "勞"]);
  const documentOld = new Set(["舊", "學", "體", "會", "國", "縣", "營", "驛", "關", "戰", "廳", "敎", "數", "證", "讀", "觀", "嚴", "鐵", "藝", "靈", "讓", "爲", "據", "覽", "歸", "歷", "畫", "寶", "價", "傳", "圖", "團", "從", "應", "斷", "滿", "稱", "繪", "聲", "號", "譯", "轉", "輕", "驗", "黃", "黑"]);

  const blockRanges = [
    { name: { ja: "CJK統合漢字拡張A", en: "CJK Unified Ideographs Extension A" }, start: 0x3400, end: 0x4dbf },
    { name: { ja: "CJK統合漢字", en: "CJK Unified Ideographs" }, start: 0x4e00, end: 0x9fff },
    { name: { ja: "CJK互換漢字", en: "CJK Compatibility Ideographs" }, start: 0xf900, end: 0xfaff },
    { name: { ja: "康熙部首", en: "Kangxi Radicals" }, start: 0x2f00, end: 0x2fdf },
    { name: { ja: "CJK統合漢字拡張B", en: "CJK Unified Ideographs Extension B" }, start: 0x20000, end: 0x2a6df },
    { name: { ja: "CJK統合漢字拡張C", en: "CJK Unified Ideographs Extension C" }, start: 0x2a700, end: 0x2b73f },
    { name: { ja: "CJK統合漢字拡張D", en: "CJK Unified Ideographs Extension D" }, start: 0x2b740, end: 0x2b81f },
    { name: { ja: "CJK統合漢字拡張E", en: "CJK Unified Ideographs Extension E" }, start: 0x2b820, end: 0x2ceaf },
    { name: { ja: "CJK統合漢字拡張F", en: "CJK Unified Ideographs Extension F" }, start: 0x2ceb0, end: 0x2ebef },
    { name: { ja: "CJK統合漢字拡張G", en: "CJK Unified Ideographs Extension G" }, start: 0x30000, end: 0x3134f },
    { name: { ja: "記号など", en: "Symbols & Others" }, start: 0, end: 0x10ffff }
  ];

  function getPopularOrder(){ return Array.isArray(metaCache.popularOrder) && metaCache.popularOrder.length ? metaCache.popularOrder : fallbackPopularOrder; }
  function getPopularSet(){ return new Set(getPopularOrder()); }
  function getBlockName(char){ const code = char.codePointAt(0); const found = blockRanges.find(r => code >= r.start && code <= r.end); return found ? found.name : { ja: "その他", en: "Other" }; }
  function getNewText(newChar){ return Array.isArray(newChar) ? newChar.join("、") : String(newChar || ""); }
  function labelForCategory(category){ const found = filters.find(item => item.id === category); return found ? found[currentLang] : filters[filters.length - 1][currentLang]; }
  function getMeta(oldChar){ return (metaCache.entries && metaCache.entries[oldChar]) || {}; }
  function getCategory(oldChar){ const meta = getMeta(oldChar); if (meta.category) return meta.category; if (getPopularSet().has(oldChar)) return "popular"; if (nameOld.has(oldChar)) return "name"; if (commonOld.has(oldChar)) return "common"; if (documentOld.has(oldChar)) return "document"; return "rare"; }

  function switchLang(lang){
    currentLang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.style.display = el.dataset.i18n === currentLang ? "" : "none"; });
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => { btn.classList.toggle("active", btn.dataset.lang === currentLang); });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.placeholder = currentLang === "en" ? (searchInput.dataset.placeholderEn || messages.en.placeholder) : (searchInput.dataset.placeholderJa || messages.ja.placeholder);
  }

  function showToast(text){ const toast = document.getElementById("toast"); if (!toast) return; toast.textContent = text; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 1600); }
  async function fetchJson(path){ const res = await fetch(path, { cache: "no-store" }); if (!res.ok) throw new Error(`Failed to load ${path}`); return res.json(); }
  async function loadData(){
    const [dict, meta, extra2] = await Promise.all([
      fetchJson("./dict.json"),
      fetchJson("./meta.json?v=20260503-okj-meta-3"),
      fetchJson("./meta-extra-2.json?v=20260503-okj-extra-3").catch(() => ({ entries: {} }))
    ]);
    metaCache = {
      popularOrder: meta.popularOrder || [],
      entries: Object.assign({}, meta.entries || {}, extra2.entries || {})
    };
    return dict;
  }
  function setCounts(dict){ const oldCount = Object.keys(dict.old_to_new || {}).length; document.querySelectorAll('[data-count="old"]').forEach(el => { el.textContent = oldCount; }); }
  function setStatusText(text){ const el = document.getElementById("statusMessage"); if (el) el.textContent = text || ""; }
  function buildEntries(dict){
    const popularOrder = getPopularOrder();
    entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => {
      const meta = getMeta(oldChar);
      return { oldChar, newText: getNewText(newChar), block: getBlockName(oldChar), category: getCategory(oldChar), verified: Boolean(meta.verified), readingJa: meta.readingJa || "", readingEn: meta.readingEn || "", meaningJa: meta.meaningJa || "", meaningEn: meta.meaningEn || "", usageJa: meta.usageJa || "", usageEn: meta.usageEn || "" };
    });
    entriesCache.sort((a,b) => { const ia = popularOrder.indexOf(a.oldChar); const ib = popularOrder.indexOf(b.oldChar); if (ia >= 0 && ib >= 0) return ia - ib; if (ia >= 0) return -1; if (ib >= 0) return 1; return a.oldChar.localeCompare(b.oldChar, "ja"); });
    return entriesCache;
  }
  function addI18nLine(parent, className, jaLabel, enLabel, jaText, enText){ if (!jaText && !enText) return; const p = document.createElement("p"); p.className = className; p.innerHTML = `<span data-i18n="ja">${jaLabel}：${jaText}</span><span data-i18n="en">${enLabel}: ${enText || jaText}</span>`; parent.appendChild(p); }
  function createCopyButton(value, kind){ const btn = document.createElement("button"); btn.type = "button"; btn.className = "copy-btn"; btn.dataset.copyValue = value; btn.dataset.copyKind = kind; btn.innerHTML = kind === "new" ? '<span data-i18n="ja">新字をコピー</span><span data-i18n="en">Copy modern</span>' : '<span data-i18n="ja">旧字をコピー</span><span data-i18n="en">Copy old</span>'; return btn; }
  function createEntryCard(entry, compact){
    const card = document.createElement("article"); card.className = compact ? "kanji-card popular-card" : "kanji-card"; card.dataset.old = entry.oldChar; card.dataset.new = entry.newText; card.dataset.reading = `${entry.readingJa} ${entry.readingEn}`; card.dataset.category = entry.category;
    const pair = document.createElement("div"); pair.className = "kanji-pair"; pair.innerHTML = `<div class="kanji-old">${entry.oldChar}</div><div class="kanji-arrow" aria-hidden="true">→</div><div class="kanji-new">${entry.newText}</div>`; card.appendChild(pair);
    addI18nLine(card, "kanji-reading", "読み", "Reading", entry.readingJa, entry.readingEn);
    addI18nLine(card, "kanji-meaning", "意味", "Meaning", entry.meaningJa, entry.meaningEn);
    if (!compact) addI18nLine(card, "kanji-usage", "用途", "Usage", entry.usageJa, entry.usageEn);
    const meta = document.createElement("p"); meta.className = "kanji-meta"; meta.innerHTML = `<span data-i18n="ja">分類：${labelForCategory(entry.category)}${entry.verified ? " / 確認済み" : ""}</span><span data-i18n="en">Category: ${labelForCategory(entry.category)}${entry.verified ? " / verified" : ""}</span>`; card.appendChild(meta);
    const actions = document.createElement("div"); actions.className = "copy-actions"; actions.appendChild(createCopyButton(entry.oldChar, "old")); actions.appendChild(createCopyButton(entry.newText, "new")); card.appendChild(actions); return card;
  }
  function renderFilters(){ const wrap = document.getElementById("filterButtons"); if (!wrap) return; wrap.innerHTML = ""; filters.forEach(filter => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "filter-btn"; btn.dataset.filter = filter.id; btn.textContent = filter[currentLang]; btn.classList.toggle("active", filter.id === currentFilter); btn.addEventListener("click", () => { currentFilter = filter.id; renderAll(); }); wrap.appendChild(btn); }); }
  function renderPopular(){ const container = document.getElementById("popularContainer"); if (!container) return; container.innerHTML = ""; const popularSet = getPopularSet(); entriesCache.filter(entry => popularSet.has(entry.oldChar) && entry.verified).slice(0, 26).forEach(entry => container.appendChild(createEntryCard(entry, true))); }
  function getFilteredEntries(){ const q = currentQuery.trim().toLowerCase(); const popularSet = getPopularSet(); return entriesCache.filter(entry => { const matchesFilter = currentFilter === "all" || entry.category === currentFilter || (currentFilter === "popular" && popularSet.has(entry.oldChar)); const haystack = `${entry.oldChar} ${entry.newText} ${entry.readingJa} ${entry.readingEn} ${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn} ${labelForCategory(entry.category)}`.toLowerCase(); return matchesFilter && (!q || haystack.includes(q)); }); }
  function renderGroups(entries){
    const container = document.getElementById("groupContainer"); const emptyMessage = document.getElementById("emptyMessage"); if (!container || !emptyMessage) return; container.innerHTML = ""; emptyMessage.hidden = entries.length > 0;
    if (!entries.length) { emptyMessage.querySelector('[data-i18n="ja"]').textContent = messages.ja.noMatch; emptyMessage.querySelector('[data-i18n="en"]').textContent = messages.en.noMatch; return; }
    const grouped = new Map(); entries.forEach(entry => { const key = currentLang === "en" ? entry.block.en : entry.block.ja; if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(entry); });
    Array.from(grouped.keys()).sort((a,b) => a.localeCompare(b, "ja")).forEach(key => { const groupSection = document.createElement("section"); groupSection.className = "group-section"; const heading = document.createElement("h3"); heading.className = "group-heading"; heading.innerHTML = `${key} <span class="badge">${grouped.get(key).length}</span>`; const grid = document.createElement("div"); grid.className = "kanji-grid"; grouped.get(key).forEach(entry => grid.appendChild(createEntryCard(entry, false))); groupSection.appendChild(heading); groupSection.appendChild(grid); container.appendChild(groupSection); });
  }
  function updateStatus(visibleCount){ const total = entriesCache.length; const isSearch = currentQuery.trim().length > 0 || currentFilter !== "all"; setStatusText(currentLang === "en" ? `${isSearch ? messages.en.searchResults : messages.en.showing}: ${visibleCount} / ${total}` : `${isSearch ? messages.ja.searchResults : messages.ja.showing}：${visibleCount}件 / ${messages.ja.total}${total}件`); }
  function renderAll(){ renderFilters(); renderPopular(); const filtered = getFilteredEntries(); renderGroups(filtered); updateStatus(filtered.length); switchLang(currentLang); }
  function copyWithFallback(value){ if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value); const textarea = document.createElement("textarea"); textarea.value = value; textarea.setAttribute("readonly", ""); textarea.style.position = "fixed"; textarea.style.left = "-9999px"; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); return Promise.resolve(); }
  function handleCopy(target){ const value = target.dataset.copyValue; const kind = target.dataset.copyKind || "old"; if (!value) return; copyWithFallback(value).then(() => { const label = kind === "new" ? messages[currentLang].copiedNew : messages[currentLang].copiedOld; showToast(`${label}：${value}`); }).catch(() => showToast(value)); }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => { btn.addEventListener("click", () => { currentLang = btn.dataset.lang === "en" ? "en" : "ja"; renderAll(); }); });
    const searchInput = document.getElementById("searchInput"); if (searchInput) searchInput.addEventListener("input", () => { currentQuery = searchInput.value || ""; renderAll(); });
    document.addEventListener("click", ev => { const target = ev.target.closest(".copy-btn"); if (target) handleCopy(target); });
    switchLang(currentLang); setStatusText(messages[currentLang].loading); loadData().then(dict => { setCounts(dict); buildEntries(dict); renderAll(); }).catch(() => setStatusText(messages[currentLang].loadError));
  });
})();
