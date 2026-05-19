(() => {
  let currentLang = "ja";
  let entriesCache = [];
  let currentFilter = "all";
  let currentQuery = "";
  let metaCache = { popularOrder: [], entries: {} };
  let activeDetailOldChar = "";

  const messages = {
    ja: { loading: "辞書データを読み込み中です…", loadError: "辞書データの読み込みに失敗しました。", copiedOld: "旧字体をコピーしました", copiedNew: "現代表記をコピーしました", noMatch: "該当する旧字体が見つかりませんでした。別の漢字・読み・新字体で検索してください。", showing: "表示中", searchResults: "検索結果", total: "全", pairOnly: "対応のみ", verified: "確認済み", showDetails: "詳細を見る", hideDetails: "詳細を閉じる" },
    en: { loading: "Loading dictionary…", loadError: "Failed to load dictionary.", copiedOld: "Copied old form", copiedNew: "Copied modern form", noMatch: "No matching entries found. Try another kanji, reading, or modern form.", showing: "Showing", searchResults: "Search results", total: "total", pairOnly: "Pair only", verified: "Verified", showDetails: "Show details", hideDetails: "Hide details" }
  };

  const filters = [
    { id: "all", ja: "すべて", en: "All" },
    { id: "verified", ja: "確認済みのみ", en: "Verified only" },
    { id: "hasMeaning", ja: "読み・意味あり", en: "With reading / meaning" },
    { id: "popular", ja: "よく使う", en: "Common" },
    { id: "name", ja: "人名・地名", en: "Names / Places" },
    { id: "common", ja: "旧常用漢字", en: "Common-use old forms" },
    { id: "document", ja: "文献・古文書", en: "Old documents" },
    { id: "rare", ja: "難読・参考", en: "Rare / Reference" }
  ];
  const fallbackPopularOrder = ["會", "區", "國", "壽", "學", "廣", "德", "戀", "舊", "榮", "澤", "濱", "狀", "獨", "禮", "體", "邊", "邉", "醫", "鐵", "驛", "齋", "﨑", "龍", "櫻", "實"];
  const nameOld = new Set(["澤", "邊", "邉", "齋", "齊", "濱", "﨑", "德", "廣", "榮", "壽", "神", "祥", "福", "穗", "鄕", "國", "龍", "櫻", "實"]);
  const commonOld = new Set(["亞", "惡", "壓", "圍", "醫", "爲", "隱", "營", "驛", "應", "歐", "奧", "樂", "學", "關", "觀", "舊", "區", "徑", "輕", "藝", "儉", "劍", "嚴", "廣", "國", "齋", "參", "兒", "實", "壽", "從", "處", "敍", "將", "燒", "證", "讓", "眞", "圖", "數", "聲", "靜", "攝", "專", "戰", "淺", "爭", "總", "聰", "莊", "屬", "續", "體", "對", "臺", "擇", "澤", "擔", "團", "彈", "斷", "遲", "廳", "聽", "鐵", "點", "轉", "傳", "燈", "德", "獨", "讀", "惱", "腦", "廢", "拜", "賣", "麥", "發", "髮", "拔", "祕", "濱", "拂", "變", "邊", "寶", "豐", "滿", "藥", "豫", "餘", "譽", "樣", "謠", "來", "覽", "龍", "禮", "靈", "齡", "歷", "戀", "勞", "雜", "壞", "懷", "歡", "擴", "劑", "藏", "臟", "險", "雙", "疊", "擧", "圓", "獻", "顯"]);
  const documentOld = new Set(["舊", "學", "體", "會", "國", "縣", "營", "驛", "關", "戰", "廳", "敎", "數", "證", "讀", "觀", "嚴", "鐵", "藝", "靈", "讓", "爲", "據", "覽", "歸", "歷", "畫", "寶", "價", "傳", "圖", "團", "從", "應", "斷", "滿", "稱", "繪", "聲", "號", "譯", "轉", "輕", "驗", "黃", "黑"]);

  const getPopularOrder = () => Array.isArray(metaCache.popularOrder) && metaCache.popularOrder.length ? metaCache.popularOrder : fallbackPopularOrder;
  const getPopularSet = () => new Set(getPopularOrder());
  const getCodePoints = (text) => Array.from(String(text || "")).map(ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`).join(" ");
  const getMeta = (oldChar) => (metaCache.entries && metaCache.entries[oldChar]) || {};
  const getCategory = (oldChar) => { const meta = getMeta(oldChar); if (meta.category) return meta.category; if (getPopularSet().has(oldChar)) return "popular"; if (nameOld.has(oldChar)) return "name"; if (commonOld.has(oldChar)) return "common"; if (documentOld.has(oldChar)) return "document"; return "rare"; };
  const labelForCategory = (category) => (filters.find(item => item.id === category) || filters[filters.length - 1])[currentLang];
  const hasMeaning = (entry) => Boolean(entry.readingJa || entry.readingEn || entry.meaningJa || entry.meaningEn);
  const getRelatedOldForms = (entry) => entriesCache.filter(e => e.newText === entry.newText && e.oldChar !== entry.oldChar).map(e => e.oldChar);

  function getSearchHint(input, lang) {
    if (!input) return "";
    if (lang === "en") {
      return input.dataset.searchHintEn || input.dataset.placeholderEn || "Search by old form, modern form, reading, meaning, or Unicode";
    }
    return input.dataset.searchHintJa || input.dataset.placeholderJa || "旧字体・現代表記・読み・意味・Unicodeで検索できます";
  }
  function switchLang(lang){ currentLang = lang === "en" ? "en" : "ja"; document.documentElement.lang = currentLang; document.querySelectorAll("[data-i18n]").forEach(el => { el.style.display = el.dataset.i18n === currentLang ? "" : "none"; }); document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === currentLang)); const searchInput = document.getElementById("searchInput"); if (searchInput) searchInput.placeholder = getSearchHint(searchInput, currentLang); }
  function showToast(text){ const toast = document.getElementById("toast"); if (!toast) return; toast.textContent = text; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 1600); }
  async function fetchJson(path){ const res = await fetch(path, { cache: "no-store" }); if (!res.ok) throw new Error(`Failed to load ${path}`); return res.json(); }
  async function loadData(){ const [dict, meta, extra2, extra3] = await Promise.all([fetchJson("./dict.json"), fetchJson("./meta.json?v=20260503-okj-meta-3"), fetchJson("./meta-extra-2.json?v=20260503-okj-extra-3").catch(() => ({ entries: {} })), fetchJson("./meta-extra-3.json?v=20260518-okj-extra-3").catch(() => ({ entries: {} }))]); metaCache = { popularOrder: meta.popularOrder || [], entries: Object.assign({}, meta.entries || {}, extra2.entries || {}, extra3.entries || {}) }; return dict; }
  function setCounts(dict){ const oldCount = Object.keys(dict.old_to_new || {}).length; document.querySelectorAll('[data-count="old"]').forEach(el => { el.textContent = oldCount; }); }
  function setStatusText(text){ const el = document.getElementById("statusMessage"); if (el) el.textContent = text || ""; }
  function buildEntries(dict){ const popularOrder = getPopularOrder(); entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => { const meta = getMeta(oldChar); const newText = Array.isArray(newChar) ? newChar.join("、") : String(newChar || ""); return { oldChar, newText, oldCode: getCodePoints(oldChar), newCode: getCodePoints(newText), category: getCategory(oldChar), verified: Boolean(meta.verified), readingJa: meta.readingJa || "", readingEn: meta.readingEn || "", meaningJa: meta.meaningJa || "", meaningEn: meta.meaningEn || "", usageJa: meta.usageJa || "", usageEn: meta.usageEn || "" }; }); entriesCache.sort((a,b) => { const ia = popularOrder.indexOf(a.oldChar); const ib = popularOrder.indexOf(b.oldChar); if (ia >= 0 && ib >= 0) return ia - ib; if (ia >= 0) return -1; if (ib >= 0) return 1; return a.oldChar.localeCompare(b.oldChar, "ja"); }); }
  function createCopyButton(value, kind){ const btn = document.createElement("button"); btn.type = "button"; btn.className = "copy-btn"; btn.dataset.copyValue = value; btn.dataset.copyKind = kind; btn.innerHTML = kind === "new" ? '<span data-i18n="ja">新字をコピー</span><span data-i18n="en">Copy modern</span>' : '<span data-i18n="ja">旧字をコピー</span><span data-i18n="en">Copy old</span>'; return btn; }
  function createEntryCard(entry, compact){
    const card = document.createElement("article");
    card.className = compact ? "kanji-card popular-card" : "kanji-card";
    card.dataset.old = entry.oldChar;
    const statusText = entry.verified ? `${messages.ja.verified} / ${messages.en.verified}` : `${messages.ja.pairOnly} / ${messages.en.pairOnly}`;
    card.innerHTML = `<div class="kanji-pair"><div class="kanji-old">${entry.oldChar}</div><div class="kanji-arrow">→</div><div class="kanji-new">${entry.newText}</div></div>
      ${entry.readingJa || entry.readingEn ? `<p class="kanji-reading"><span data-i18n="ja">読み：${entry.readingJa || "-"}</span><span data-i18n="en">Reading: ${entry.readingEn || entry.readingJa}</span></p>` : ""}
      <p class="kanji-meta"><span data-i18n="ja">分類：${labelForCategory(entry.category)} / 確認状態：${entry.verified ? messages.ja.verified : messages.ja.pairOnly}</span><span data-i18n="en">Category: ${labelForCategory(entry.category)} / Status: ${entry.verified ? messages.en.verified : messages.en.pairOnly}</span></p>
      <p class="codepoint-line"><span data-i18n="ja">Unicode：旧字 ${entry.oldCode} / 新字 ${entry.newCode}</span><span data-i18n="en">Unicode: Old ${entry.oldCode} / Modern ${entry.newCode}</span></p>`;
    if (!compact) {
      const mobileToggle = document.createElement("button");
      mobileToggle.type = "button";
      mobileToggle.className = "mobile-detail-toggle";
      mobileToggle.innerHTML = `<span data-i18n="ja">${messages.ja.showDetails}</span><span data-i18n="en">${messages.en.showDetails}</span>`;
      card.appendChild(mobileToggle);
    }
    const actions = document.createElement("div"); actions.className = "copy-actions"; actions.appendChild(createCopyButton(entry.oldChar, "old")); actions.appendChild(createCopyButton(entry.newText, "new")); card.appendChild(actions);
    if (!compact && (entry.meaningJa || entry.meaningEn || entry.usageJa || entry.usageEn)) {
      const mobileDetail = document.createElement("div"); mobileDetail.className = "mobile-detail-content";
      if (entry.meaningJa || entry.meaningEn) mobileDetail.innerHTML += `<p class="kanji-meaning"><span data-i18n="ja">意味：${entry.meaningJa || ""}</span><span data-i18n="en">Meaning: ${entry.meaningEn || entry.meaningJa}</span></p>`;
      if (entry.usageJa || entry.usageEn) mobileDetail.innerHTML += `<p class="kanji-usage"><span data-i18n="ja">用途：${entry.usageJa || ""}</span><span data-i18n="en">Usage: ${entry.usageEn || entry.usageJa}</span></p>`;
      card.appendChild(mobileDetail);
    }
    card.dataset.status = statusText;
    card.addEventListener("click", (ev) => {
      if (ev.target.closest(".copy-btn") || ev.target.closest(".mobile-detail-toggle")) return;
      activeDetailOldChar = entry.oldChar;
      renderDetailPanel(entry);
    });
    return card;
  }
  function renderDetailPanel(entry){
    let panel = document.getElementById("detailPanel");
    const wrapper = document.querySelector(".group-wrapper");
    if (!wrapper) return;
    if (!panel) { panel = document.createElement("section"); panel.id = "detailPanel"; panel.className = "detail-panel"; wrapper.insertBefore(panel, document.getElementById("groupContainer")); }
    const related = getRelatedOldForms(entry);
    panel.classList.add("open");
    panel.innerHTML = `<h3 class="detail-heading"><span data-i18n="ja">詳細</span><span data-i18n="en">Details</span>: ${entry.oldChar} → ${entry.newText}</h3>
    <div class="detail-grid">
      <p class="detail-row"><strong><span data-i18n="ja">旧字体</span><span data-i18n="en">Old form</span></strong> ${entry.oldChar}</p>
      <p class="detail-row"><strong><span data-i18n="ja">新字体</span><span data-i18n="en">Modern form</span></strong> ${entry.newText}</p>
      ${entry.readingJa || entry.readingEn ? `<p class="detail-row"><strong><span data-i18n="ja">読み</span><span data-i18n="en">Reading</span></strong> ${currentLang === "en" ? (entry.readingEn || entry.readingJa) : (entry.readingJa || entry.readingEn)}</p>` : ""}
      ${entry.meaningJa || entry.meaningEn ? `<p class="detail-row"><strong><span data-i18n="ja">意味</span><span data-i18n="en">Meaning</span></strong> ${currentLang === "en" ? (entry.meaningEn || entry.meaningJa) : (entry.meaningJa || entry.meaningEn)}</p>` : ""}
      ${entry.usageJa || entry.usageEn ? `<p class="detail-row"><strong><span data-i18n="ja">用途</span><span data-i18n="en">Usage</span></strong> ${currentLang === "en" ? (entry.usageEn || entry.usageJa) : (entry.usageJa || entry.usageEn)}</p>` : ""}
      <p class="detail-row"><strong><span data-i18n="ja">分類</span><span data-i18n="en">Category</span></strong> ${labelForCategory(entry.category)}</p>
      <p class="detail-row"><strong><span data-i18n="ja">確認状態</span><span data-i18n="en">Status</span></strong> ${entry.verified ? messages[currentLang].verified : messages[currentLang].pairOnly}</p>
      <p class="detail-row"><strong>Unicode</strong> <span data-i18n="ja">旧字 ${entry.oldCode} / 新字 ${entry.newCode}</span><span data-i18n="en">Old ${entry.oldCode} / Modern ${entry.newCode}</span></p>
      ${related.length ? `<p class="detail-row"><strong><span data-i18n="ja">関連する旧字体</span><span data-i18n="en">Related old forms</span></strong> ${related.join(" / ")}</p>` : ""}
      ${!entry.verified && !hasMeaning(entry) ? `<p class="pair-only-note"><span data-i18n="ja">この項目は現在、旧字と新字の対応のみを表示しています。</span><span data-i18n="en">This entry currently shows the old/modern pair only.</span></p>` : ""}
    </div>`;
    const actions = document.createElement("div"); actions.className = "detail-actions"; actions.appendChild(createCopyButton(entry.oldChar, "old")); actions.appendChild(createCopyButton(entry.newText, "new")); panel.appendChild(actions);
    switchLang(currentLang);
  }
  function renderFilters(){ const wrap = document.getElementById("filterButtons"); if (!wrap) return; wrap.innerHTML = ""; filters.forEach(filter => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "filter-btn"; btn.dataset.filter = filter.id; btn.textContent = filter[currentLang]; btn.classList.toggle("active", filter.id === currentFilter); btn.addEventListener("click", () => { currentFilter = filter.id; renderAll(); }); wrap.appendChild(btn); }); }
  function getFilteredEntries(){ const q = currentQuery.trim().toLowerCase(); const popularSet = getPopularSet(); return entriesCache.filter(entry => { const matchesFilter = currentFilter === "all" || (currentFilter === "verified" && entry.verified === true) || (currentFilter === "hasMeaning" && hasMeaning(entry)) || (currentFilter === "popular" && (popularSet.has(entry.oldChar) || entry.category === "popular")) || ((["name", "common", "document", "rare"].includes(currentFilter)) && entry.category === currentFilter); const haystack = `${entry.oldChar} ${entry.newText} ${entry.readingJa} ${entry.readingEn} ${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn} ${entry.oldCode} ${entry.newCode}`.toLowerCase(); return matchesFilter && (!q || haystack.includes(q)); }); }
  function renderReverseSummary(){ let panel = document.getElementById("reverseSummary"); const groupWrapper = document.querySelector(".group-wrapper"); if (!groupWrapper) return; if (!panel) { panel = document.createElement("div"); panel.id = "reverseSummary"; panel.className = "reverse-summary"; groupWrapper.insertBefore(panel, document.getElementById("groupContainer")); }
    const q = currentQuery.trim();
    const oldMatch = entriesCache.find(e => e.oldChar === q);
    const modernMatches = entriesCache.filter(e => e.newText === q);
    if (!q || (!oldMatch && !modernMatches.length)) { panel.hidden = true; panel.innerHTML = ""; return; }
    const lines = [];
    if (modernMatches.length) lines.push(`<p><span data-i18n="ja">逆引き：${q} ← ${modernMatches.map(e => e.oldChar).join(" / ")}</span><span data-i18n="en">Reverse lookup: ${q} ← ${modernMatches.map(e => e.oldChar).join(" / ")}</span></p>`);
    if (oldMatch) { const related = getRelatedOldForms(oldMatch); lines.push(`<p><span data-i18n="ja">${oldMatch.oldChar} → ${oldMatch.newText}${related.length ? ` / 関連する旧字体：${related.join(" / ")}` : ""}</span><span data-i18n="en">${oldMatch.oldChar} → ${oldMatch.newText}${related.length ? ` / Related old forms: ${related.join(" / ")}` : ""}</span></p>`); }
    panel.hidden = false; panel.innerHTML = lines.join("");
  }
  function renderGroups(entries){ const container = document.getElementById("groupContainer"); const emptyMessage = document.getElementById("emptyMessage"); if (!container || !emptyMessage) return; container.innerHTML = ""; emptyMessage.hidden = entries.length > 0; renderReverseSummary(); if (!entries.length) return;
    const section = document.createElement("section"); section.className = "group-section"; const grid = document.createElement("div"); grid.className = "kanji-grid"; entries.forEach(entry => grid.appendChild(createEntryCard(entry, false))); section.appendChild(grid); container.appendChild(section);
    if (activeDetailOldChar) { const selected = entries.find(e => e.oldChar === activeDetailOldChar); if (selected) renderDetailPanel(selected); }
  }
  function renderPopular(){ const container = document.getElementById("popularContainer"); if (!container) return; container.innerHTML = ""; const popularSet = getPopularSet(); entriesCache.filter(entry => popularSet.has(entry.oldChar) && entry.verified).slice(0, 26).forEach(entry => container.appendChild(createEntryCard(entry, true))); }
  function updateStatus(visibleCount){ const total = entriesCache.length; const isSearch = currentQuery.trim().length > 0 || currentFilter !== "all"; setStatusText(currentLang === "en" ? `${isSearch ? messages.en.searchResults : messages.en.showing}: ${visibleCount} / ${total}` : `${isSearch ? messages.ja.searchResults : messages.ja.showing}：${visibleCount}件 / ${messages.ja.total}${total}件`); }
  function renderAll(){ renderFilters(); renderPopular(); const filtered = getFilteredEntries(); renderGroups(filtered); updateStatus(filtered.length); switchLang(currentLang); }
  function copyWithFallback(value){ if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value); const textarea = document.createElement("textarea"); textarea.value = value; textarea.style.position = "fixed"; textarea.style.left = "-9999px"; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); return Promise.resolve(); }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => btn.addEventListener("click", () => { currentLang = btn.dataset.lang === "en" ? "en" : "ja"; renderAll(); }));
    const searchInput = document.getElementById("searchInput"); if (searchInput) searchInput.addEventListener("input", () => { currentQuery = searchInput.value || ""; renderAll(); });
    document.addEventListener("click", ev => {
      const target = ev.target.closest(".copy-btn");
      if (target) { const value = target.dataset.copyValue; const kind = target.dataset.copyKind || "old"; copyWithFallback(value).then(() => showToast(`${kind === "new" ? messages[currentLang].copiedNew : messages[currentLang].copiedOld}：${value}`)); }
      const toggle = ev.target.closest(".mobile-detail-toggle");
      if (toggle) { const card = toggle.closest(".kanji-card"); if (!card) return; card.classList.toggle("mobile-open"); toggle.innerHTML = card.classList.contains("mobile-open") ? `<span data-i18n="ja">${messages.ja.hideDetails}</span><span data-i18n="en">${messages.en.hideDetails}</span>` : `<span data-i18n="ja">${messages.ja.showDetails}</span><span data-i18n="en">${messages.en.showDetails}</span>`; switchLang(currentLang); }
    });
    switchLang(currentLang); setStatusText(messages[currentLang].loading); loadData().then(dict => { setCounts(dict); buildEntries(dict); renderAll(); }).catch(() => setStatusText(messages[currentLang].loadError));
  });
})();
