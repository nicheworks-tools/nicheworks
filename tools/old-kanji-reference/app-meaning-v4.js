(() => {
  let currentLang = "ja";
  let entriesCache = [];
  let currentFilter = "all";
  let currentQuery = "";
  let currentSearchMode = "all";
  let metaCache = { popularOrder: [], entries: {} };
  let activeDetailOldChar = "";
  let loadFailed = false;
  let recentOldChars = [];
  let favoriteOldChars = [];
  let activePreset = "";

  const recentStorageKey = "oldKanjiReference.recent.v1";
  const favoritesStorageKey = "oldKanjiReference.favorites.v1";

  const messages = {
    ja: { loading: "辞書データを読み込み中です…", loadError: "辞書データの読み込みに失敗しました。", copiedOld: "旧字体をコピーしました", copiedNew: "現代表記をコピーしました", noMatch: "該当する旧字体が見つかりませんでした。別の漢字・読み・新字体で検索してください。", showing: "表示中", searchResults: "検索結果", total: "全", pairOnly: "対応情報のみ", verified: "確認済み", showDetails: "詳細を見る", hideDetails: "詳細を閉じる", copiedPairs: "対応表をコピーしました", copiedOldFormsOnly: "旧字だけコピーしました", copiedMarkdown: "Markdown表をコピーしました", exportedCsv: "CSVを保存しました", exportedJson: "JSONを保存しました", nothingToExport: "出力できるデータがありません", noDetectorTextToSend: "変換する文章がありません" },
    en: { loading: "Loading dictionary…", loadError: "Failed to load dictionary.", copiedOld: "Copied old form", copiedNew: "Copied modern form", noMatch: "No matching entries found. Try another kanji, reading, or modern form.", showing: "Showing", searchResults: "Search results", total: "total", pairOnly: "Mapping only", verified: "Checked", showDetails: "Show details", hideDetails: "Hide details", copiedPairs: "Copied pairs", copiedOldFormsOnly: "Copied old forms only", copiedMarkdown: "Copied Markdown table", exportedCsv: "Saved CSV", exportedJson: "Saved JSON", nothingToExport: "No data to export", noDetectorTextToSend: "No text to send" }
  };
  const toConverterUrl = (value) => `../kanji-modernizer/?q=${encodeURIComponent(value)}`;

  const filters = [
    { id: "all", ja: "すべて", en: "All" },
    { id: "verified", ja: "確認済みのみ", en: "Verified only" },
    { id: "hasMeaning", ja: "読み・意味あり", en: "With reading / meaning" },
    { id: "name", ja: "人名・地名", en: "Names / Places" },
    { id: "common", ja: "旧常用漢字", en: "Common-use old forms" },
    { id: "document", ja: "文献・古文書", en: "Old documents" },
    { id: "rare", ja: "難読・参考", en: "Rare / Reference" },
    { id: "pairOnly", ja: "対応のみ", en: "Pair only" }
  ];
  const searchModes = [
    { id: "all", ja: "すべて", en: "All" },
    { id: "old", ja: "旧字", en: "Old form" },
    { id: "new", ja: "新字", en: "Modern form" },
    { id: "reading", ja: "読み", en: "Reading" },
    { id: "meaning", ja: "意味", en: "Meaning" },
    { id: "unicode", ja: "Unicode", en: "Unicode" }
  ];
  const fallbackPopularOrder = ["會", "區", "國", "壽", "學", "廣", "德", "戀", "舊", "榮", "澤", "濱", "狀", "獨", "禮", "體", "邊", "邉", "醫", "鐵", "驛", "齋", "﨑", "龍", "櫻", "實"];
  const paletteOldChars = ["國","學","體","會","舊","澤","邊","邉","齋","齊","濱","﨑","龍","櫻","實","醫","鐵","驛","應","禮","廣","德","榮","壽"];
  const schoolPresetOldChars = ["學", "國", "會", "體", "舊", "德", "龍", "禮", "實", "櫻", "廣"];
  const nameOld = new Set(["澤", "邊", "邉", "齋", "齊", "濱", "﨑", "德", "廣", "榮", "壽", "神", "祥", "福", "穗", "鄕", "國", "龍", "櫻", "實"]);
  const commonOld = new Set(["亞", "惡", "壓", "圍", "醫", "爲", "隱", "營", "驛", "應", "歐", "奧", "樂", "學", "關", "觀", "舊", "區", "徑", "輕", "藝", "儉", "劍", "嚴", "廣", "國", "齋", "參", "兒", "實", "壽", "從", "處", "敍", "將", "燒", "證", "讓", "眞", "圖", "數", "聲", "靜", "攝", "專", "戰", "淺", "爭", "總", "聰", "莊", "屬", "續", "體", "對", "臺", "擇", "澤", "擔", "團", "彈", "斷", "遲", "廳", "聽", "鐵", "點", "轉", "傳", "燈", "德", "獨", "讀", "惱", "腦", "廢", "拜", "賣", "麥", "發", "髮", "拔", "祕", "濱", "拂", "變", "邊", "寶", "豐", "滿", "藥", "豫", "餘", "譽", "樣", "謠", "來", "覽", "龍", "禮", "靈", "齡", "歷", "戀", "勞", "雜", "壞", "懷", "歡", "擴", "劑", "藏", "臟", "險", "雙", "疊", "擧", "圓", "獻", "顯"]);
  const documentOld = new Set(["舊", "學", "體", "會", "國", "縣", "營", "驛", "關", "戰", "廳", "敎", "數", "證", "讀", "觀", "嚴", "鐵", "藝", "靈", "讓", "爲", "據", "覽", "歸", "歷", "畫", "寶", "價", "傳", "圖", "團", "從", "應", "斷", "滿", "稱", "繪", "聲", "號", "譯", "轉", "輕", "驗", "黃", "黑"]);

  const getPopularOrder = () => Array.isArray(metaCache.popularOrder) && metaCache.popularOrder.length ? metaCache.popularOrder : fallbackPopularOrder;
  const getPopularSet = () => new Set(getPopularOrder());
  const getCodePoints = (text) => Array.from(String(text || "")).map(ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`).join(" ");
  const getCodePointList = (text) => Array.from(String(text || "")).map(ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
  const getHtmlHexEntity = (text) => Array.from(String(text || "")).map(ch => `&#x${ch.codePointAt(0).toString(16).toUpperCase()};`).join("");
  const hasCompatibilityIdeograph = (text) => Array.from(String(text || "")).some(ch => { const cp = ch.codePointAt(0); return cp >= 0xF900 && cp <= 0xFAFF; });
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
  function switchLang(lang){ currentLang = lang === "en" ? "en" : "ja"; document.documentElement.lang = currentLang; document.querySelectorAll("[data-i18n]").forEach(el => { el.style.display = el.dataset.i18n === currentLang ? "" : "none"; }); document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === currentLang)); const searchInput = document.getElementById("searchInput"); if (searchInput) searchInput.placeholder = getSearchHint(searchInput, currentLang); const detectorInput = document.getElementById("detectorInput"); if (detectorInput) detectorInput.placeholder = currentLang === "en" ? (detectorInput.dataset.placeholderEn || "") : (detectorInput.dataset.placeholderJa || ""); }
  function showToast(text){ const toast = document.getElementById("toast"); if (!toast) return; toast.textContent = text; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 1600); }
  async function fetchJson(path){ const res = await fetch(path, { cache: "no-store" }); if (!res.ok) throw new Error(`Failed to load ${path}`); return res.json(); }
  async function loadData(){ const [dict, meta, extra2, extra3, extra4] = await Promise.all([fetchJson("./dict.json"), fetchJson("./meta.json?v=20260503-okj-meta-3"), fetchJson("./meta-extra-2.json?v=20260503-okj-extra-3").catch(() => ({ entries: {} })), fetchJson("./meta-extra-3.json?v=20260518-okj-extra-3").catch(() => ({ entries: {} })), fetchJson("./meta-extra-4.json?v=20260519-okj-extra-4").catch(() => ({ entries: {} }))]); metaCache = { popularOrder: meta.popularOrder || [], entries: Object.assign({}, meta.entries || {}, extra2.entries || {}, extra3.entries || {}, extra4.entries || {}) }; return dict; }
  function setCounts(dict){ const oldCount = Object.keys(dict.old_to_new || {}).length; document.querySelectorAll('[data-count="old"]').forEach(el => { el.textContent = oldCount; }); }
  function setStatusText(text){ const el = document.getElementById("statusMessage"); if (el) el.textContent = text || ""; }
  function buildEntries(dict){ const popularOrder = getPopularOrder(); entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => { const meta = getMeta(oldChar); const newText = Array.isArray(newChar) ? newChar.join("、") : String(newChar || ""); return { oldChar, newText, oldCode: getCodePoints(oldChar), newCode: getCodePoints(newText), category: getCategory(oldChar), verified: Boolean(meta.verified), readingJa: meta.readingJa || "", readingEn: meta.readingEn || "", meaningJa: meta.meaningJa || "", meaningEn: meta.meaningEn || "", usageJa: meta.usageJa || "", usageEn: meta.usageEn || "" }; }); entriesCache.sort((a,b) => { const ia = popularOrder.indexOf(a.oldChar); const ib = popularOrder.indexOf(b.oldChar); if (ia >= 0 && ib >= 0) return ia - ib; if (ia >= 0) return -1; if (ib >= 0) return 1; return a.oldChar.localeCompare(b.oldChar, "ja"); }); }
  function loadStoredList(key){
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === "string" && item) : [];
    } catch (_err) {
      return [];
    }
  }
  function saveStoredList(key, values){
    localStorage.setItem(key, JSON.stringify(values));
  }
  function setRecent(oldChar){
    recentOldChars = [oldChar, ...recentOldChars.filter(ch => ch !== oldChar)].slice(0, 12);
    saveStoredList(recentStorageKey, recentOldChars);
  }
  function isFavorite(oldChar){ return favoriteOldChars.includes(oldChar); }
  function toggleFavorite(oldChar){
    favoriteOldChars = isFavorite(oldChar) ? favoriteOldChars.filter(ch => ch !== oldChar) : [oldChar, ...favoriteOldChars.filter(ch => ch !== oldChar)];
    saveStoredList(favoritesStorageKey, favoriteOldChars);
    renderAll();
  }
  function favoriteLabel(oldChar){
    return isFavorite(oldChar)
      ? (currentLang === "en" ? "Remove favorite" : "お気に入り解除")
      : (currentLang === "en" ? "Add to favorites" : "お気に入りに追加");
  }
  function openEntryFromShortcut(oldChar){
    const searchInput = document.getElementById("searchInput");
    activePreset = "";
    currentQuery = oldChar;
    if (searchInput) searchInput.value = oldChar;
    const exact = entriesCache.find(entry => entry.oldChar === oldChar);
    activeDetailOldChar = exact ? oldChar : "";
    renderAll();
    if (exact) renderDetailPanel(exact);
  }
  function applyPreset(presetId){
    const searchInput = document.getElementById("searchInput");
    activePreset = presetId;
    currentQuery = "";
    if (searchInput) searchInput.value = "";
    currentFilter = "all";
    if (presetId === "names" || presetId === "places") currentFilter = "name";
    if (presetId === "documents") currentFilter = "document";
    if (presetId === "pairOnly") currentFilter = "pairOnly";
    renderAll();
  }
  function createShortcutChip(oldChar, cls="shortcut-chip"){ const btn = document.createElement("button"); btn.type="button"; btn.className=cls; btn.textContent=oldChar; btn.addEventListener("click",()=>openEntryFromShortcut(oldChar)); return btn; }
  function renderPalette(){ const wrap=document.getElementById("paletteContainer"); if(!wrap) return; wrap.innerHTML=`<section class="shortcut-panel"><h2 class="section-title"><span data-i18n="ja">旧字体パレット</span><span data-i18n="en">Old kanji palette</span></h2><p class="section-desc"><span data-i18n="ja">よく見かける旧字体を選んで、対応する新字体・読み・意味を確認できます。</span><span data-i18n="en">Choose a common old form to check its modern form, reading, and meaning.</span></p><div class="shortcut-chip-grid"></div></section>`; const grid=wrap.querySelector('.shortcut-chip-grid'); paletteOldChars.forEach(ch=>{ const b=createShortcutChip(ch); if(currentQuery.trim()===ch) b.classList.add('active'); grid.appendChild(b); }); }
  function renderPresets(){ const wrap=document.getElementById("presetContainer"); if(!wrap) return; const defs=[{id:"names",ja:"名前で見かける字",en:"Seen in names"},{id:"places",ja:"地名で見かける字",en:"Seen in place names"},{id:"documents",ja:"古文書で見かける字",en:"Old documents"},{id:"schools",ja:"学校名・寺社名で見かける字",en:"Schools / temples / shrines"},{id:"common",ja:"よく使われる旧字体",en:"Common old forms"},{id:"pairOnly",ja:"対応のみ",en:"Pair only"}]; wrap.innerHTML='<section class="shortcut-panel"><h2 class="section-title"><span data-i18n="ja">用途別に探す</span><span data-i18n="en">Browse by use case</span></h2><div class="shortcut-chip-grid"></div></section>'; const grid=wrap.querySelector('.shortcut-chip-grid'); defs.forEach(d=>{ const b=document.createElement('button'); b.type='button'; b.className='shortcut-chip'; b.textContent=d[currentLang]; b.classList.toggle('active',activePreset===d.id); b.addEventListener('click',()=>applyPreset(d.id)); grid.appendChild(b); }); }
  function renderRecent(){ const wrap=document.getElementById("recentContainer"); if(!wrap) return; if(!recentOldChars.length){ wrap.innerHTML=''; return; } wrap.innerHTML='<section class="shortcut-panel recent-panel"><h3 class="section-title"><span data-i18n="ja">最近見た旧字体</span><span data-i18n="en">Recently viewed</span></h3><div class="shortcut-chip-grid"></div></section>'; const grid=wrap.querySelector('.shortcut-chip-grid'); recentOldChars.forEach(ch=>grid.appendChild(createShortcutChip(ch))); }
  function renderFavorites(){ const wrap=document.getElementById("favoritesContainer"); if(!wrap) return; if(!favoriteOldChars.length){ wrap.innerHTML=''; return; } wrap.innerHTML='<section class="shortcut-panel favorites-panel"><h3 class="section-title"><span data-i18n="ja">お気に入り</span><span data-i18n="en">Favorites</span></h3><div class="shortcut-chip-grid"></div></section>'; const grid=wrap.querySelector('.shortcut-chip-grid'); favoriteOldChars.forEach(ch=>grid.appendChild(createShortcutChip(ch))); }

  function createCopyButton(value, kind){ const btn = document.createElement("button"); btn.type = "button"; btn.className = "copy-btn"; btn.dataset.copyValue = value; btn.dataset.copyKind = kind; btn.innerHTML = kind === "new" ? '<span data-i18n="ja">新字をコピー</span><span data-i18n="en">Copy modern</span>' : '<span data-i18n="ja">旧字をコピー</span><span data-i18n="en">Copy old</span>'; return btn; }
  function createDetailCodeCopyButton(copyValue, toastJa, toastEn, labelJa, labelEn){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-btn";
    button.dataset.copyValue = copyValue;
    button.dataset.copyToastJa = toastJa;
    button.dataset.copyToastEn = toastEn;
    const ja = document.createElement("span");
    ja.dataset.i18n = "ja";
    ja.textContent = labelJa;
    const en = document.createElement("span");
    en.dataset.i18n = "en";
    en.textContent = labelEn;
    button.append(ja, en);
    return button;
  }
  function createEntryCard(entry, compact){
    const card = document.createElement("article");
    card.className = compact ? "kanji-card popular-card" : "kanji-card";
    card.dataset.old = entry.oldChar;
        const readingText = currentLang === "en" ? (entry.readingEn || entry.readingJa) : (entry.readingJa || entry.readingEn);
    const meaningText = currentLang === "en" ? (entry.meaningEn || entry.meaningJa) : (entry.meaningJa || entry.meaningEn);
    const pairNote = !hasMeaning(entry) ? (currentLang === "en" ? "Old/modern pair only" : "旧字と新字の対応のみ表示中") : "";
    card.innerHTML = `<div class="kanji-pair"><div class="kanji-old">${entry.oldChar}</div><div class="kanji-arrow">→</div><div class="kanji-new">${entry.newText}</div></div>
      ${readingText ? `<p class="kanji-reading">${currentLang === "en" ? `Reading: ${readingText}` : `読み：${readingText}`}</p>` : ""}
      ${meaningText ? `<p class="kanji-meaning">${currentLang === "en" ? `Meaning: ${meaningText}` : `意味：${meaningText}`}</p>` : ""}
      ${pairNote ? `<p class="kanji-pair-note">${pairNote}</p>` : ""}`;
    if (!compact) {
      const mobileToggle = document.createElement("button");
      mobileToggle.type = "button";
      mobileToggle.className = "mobile-detail-toggle";
      mobileToggle.innerHTML = `<span data-i18n="ja">${messages.ja.showDetails}</span><span data-i18n="en">${messages.en.showDetails}</span>`;
      card.appendChild(mobileToggle);
    }
    const actions = document.createElement("div"); actions.className = "copy-actions"; actions.appendChild(createCopyButton(entry.oldChar, "old")); actions.appendChild(createCopyButton(entry.newText, "new"));
    const favoriteBtn = document.createElement("button");
    favoriteBtn.type = "button";
    favoriteBtn.className = "favorite-toggle";
    favoriteBtn.dataset.old = entry.oldChar;
    favoriteBtn.setAttribute("aria-pressed", isFavorite(entry.oldChar) ? "true" : "false");
    favoriteBtn.setAttribute("aria-label", favoriteLabel(entry.oldChar));
    favoriteBtn.textContent = favoriteLabel(entry.oldChar);
    actions.appendChild(favoriteBtn);
    card.appendChild(actions);
    const converterAction = document.createElement("a");
    converterAction.className = "converter-link";
    converterAction.href = toConverterUrl(entry.oldChar);
    converterAction.innerHTML = '<span data-i18n="ja">変換ツールで使う</span><span data-i18n="en">Use in converter</span>';
    card.appendChild(converterAction);
    if (!compact && (entry.meaningJa || entry.meaningEn || entry.usageJa || entry.usageEn)) {
      const mobileDetail = document.createElement("div"); mobileDetail.className = "mobile-detail-content";
      if (entry.meaningJa || entry.meaningEn) mobileDetail.innerHTML += `<p class="kanji-meaning"><span data-i18n="ja">意味：${entry.meaningJa || ""}</span><span data-i18n="en">Meaning: ${entry.meaningEn || entry.meaningJa}</span></p>`;
      if (entry.usageJa || entry.usageEn) mobileDetail.innerHTML += `<p class="kanji-usage"><span data-i18n="ja">用途：${entry.usageJa || ""}</span><span data-i18n="en">Usage: ${entry.usageEn || entry.usageJa}</span></p>`;
      card.appendChild(mobileDetail);
    }
    card.dataset.status = entry.verified ? messages[currentLang].verified : messages[currentLang].pairOnly;
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
    const oldUnicode = getCodePointList(entry.oldChar).join(" ");
    const modernUnicode = getCodePointList(entry.newText).join(" ");
    const oldHtmlEntity = getHtmlHexEntity(entry.oldChar);
    const modernHtmlEntity = getHtmlHexEntity(entry.newText);
    const showCompatNote = hasCompatibilityIdeograph(entry.oldChar) || hasCompatibilityIdeograph(entry.newText);
    panel.classList.add("open");
    panel.innerHTML = `<h3 class="detail-heading"><span data-i18n="ja">詳細</span><span data-i18n="en">Details</span>: ${entry.oldChar} → ${entry.newText}</h3>
    <section class="glyph-compare">
      <h4><span data-i18n="ja">字形比較</span><span data-i18n="en">Glyph comparison</span></h4>
      <div class="glyph-compare-grid">
        <div class="glyph-box"><p class="glyph-label"><span data-i18n="ja">旧字体</span><span data-i18n="en">Old form</span></p><p class="glyph-large">${entry.oldChar}</p></div>
        <div class="glyph-box"><p class="glyph-label"><span data-i18n="ja">新字体</span><span data-i18n="en">Modern form</span></p><p class="glyph-large">${entry.newText}</p></div>
      </div>
    </section>
    <div class="detail-grid">
      <p class="detail-row"><strong><span data-i18n="ja">旧字体</span><span data-i18n="en">Old form</span></strong> ${entry.oldChar}</p>
      <p class="detail-row"><strong><span data-i18n="ja">新字体</span><span data-i18n="en">Modern form</span></strong> ${entry.newText}</p>
      ${entry.readingJa || entry.readingEn ? `<p class="detail-row"><strong><span data-i18n="ja">読み</span><span data-i18n="en">Reading</span></strong> ${currentLang === "en" ? (entry.readingEn || entry.readingJa) : (entry.readingJa || entry.readingEn)}</p>` : ""}
      ${entry.meaningJa || entry.meaningEn ? `<p class="detail-row"><strong><span data-i18n="ja">意味</span><span data-i18n="en">Meaning</span></strong> ${currentLang === "en" ? (entry.meaningEn || entry.meaningJa) : (entry.meaningJa || entry.meaningEn)}</p>` : ""}
      ${entry.usageJa || entry.usageEn ? `<p class="detail-row"><strong><span data-i18n="ja">用途</span><span data-i18n="en">Usage</span></strong> ${currentLang === "en" ? (entry.usageEn || entry.usageJa) : (entry.usageJa || entry.usageEn)}</p>` : ""}
      <p class="detail-row"><strong><span data-i18n="ja">分類</span><span data-i18n="en">Category</span></strong> ${labelForCategory(entry.category)}</p>
      <p class="detail-row"><strong><span data-i18n="ja">確認状態</span><span data-i18n="en">Status</span></strong> ${entry.verified ? messages[currentLang].verified : messages[currentLang].pairOnly}</p>
      ${related.length ? `<p class="detail-row"><strong><span data-i18n="ja">関連する旧字体</span><span data-i18n="en">Related old forms</span></strong> ${related.join(" / ")}</p>` : ""}
      ${!entry.verified && !hasMeaning(entry) ? `<p class="pair-only-note"><span data-i18n="ja">この項目は旧字→新字の対応情報を中心に掲載しています。</span><span data-i18n="en">This entry currently focuses on the old → modern mapping.</span></p>` : ""}
    </div>`;
    panel.innerHTML += `<section class="code-copy-grid">
      <div class="code-block">
        <h4>Unicode</h4>
        <p class="detail-row"><strong><span data-i18n="ja">旧字体</span><span data-i18n="en">Old form</span></strong> ${oldUnicode}</p>
        <p class="detail-row"><strong><span data-i18n="ja">新字体</span><span data-i18n="en">Modern form</span></strong> ${modernUnicode}</p>
      </div>
      <div class="code-block">
        <h4><span data-i18n="ja">HTMLエンティティ</span><span data-i18n="en">HTML entity</span></h4>
        <p class="detail-row detail-row-entity detail-row-entity-old"><strong><span data-i18n="ja">旧字体</span><span data-i18n="en">Old form</span></strong> <code></code></p>
        <p class="detail-row detail-row-entity detail-row-entity-modern"><strong><span data-i18n="ja">新字体</span><span data-i18n="en">Modern form</span></strong> <code></code></p>
      </div>
    </section>
    <section class="font-compare">
      <h4><span data-i18n="ja">フォント差比較</span><span data-i18n="en">Font comparison</span></h4>
      <p class="font-row font-serif"><strong>Serif</strong><span>${entry.oldChar} / ${entry.newText}</span></p>
      <p class="font-row font-sans"><strong>Sans-serif</strong><span>${entry.oldChar} / ${entry.newText}</span></p>
      <p class="font-row font-system"><strong>System</strong><span>${entry.oldChar} / ${entry.newText}</span></p>
    </section>
    <section class="compat-note">
      <p><span data-i18n="ja">表示される字形は端末・ブラウザ・フォントによって異なる場合があります。</span><span data-i18n="en">Rendered glyphs may vary by device, browser, and font.</span></p>
      ${showCompatNote ? `<p class="compat-emphasis"><span data-i18n="ja">この文字は環境やフォントによって表示差が出る場合があります。公的書類や氏名では、実際の登録字体を確認してください。</span><span data-i18n="en">This character may render differently depending on the font or environment. For names or official documents, confirm the actually registered form.</span></p>` : ""}
    </section>`;
    const oldEntityCode = panel.querySelector(".detail-row-entity-old code");
    const modernEntityCode = panel.querySelector(".detail-row-entity-modern code");
    if (oldEntityCode) oldEntityCode.textContent = oldHtmlEntity;
    if (modernEntityCode) modernEntityCode.textContent = modernHtmlEntity;
    setRecent(entry.oldChar);
    const actions = document.createElement("div"); actions.className = "detail-actions"; actions.appendChild(createCopyButton(entry.oldChar, "old")); actions.appendChild(createCopyButton(entry.newText, "new"));
    const favoriteBtn = document.createElement("button"); favoriteBtn.type = "button"; favoriteBtn.className = "favorite-toggle"; favoriteBtn.dataset.old = entry.oldChar; favoriteBtn.setAttribute("aria-pressed", isFavorite(entry.oldChar) ? "true" : "false"); favoriteBtn.setAttribute("aria-label", favoriteLabel(entry.oldChar)); favoriteBtn.textContent = favoriteLabel(entry.oldChar); actions.appendChild(favoriteBtn); panel.appendChild(actions);
    const codeActions = document.createElement("div");
    codeActions.className = "detail-actions";
    codeActions.appendChild(createDetailCodeCopyButton(oldUnicode, "旧字Unicodeをコピーしました", "Copied old Unicode", "旧字Unicodeをコピー", "Copy old Unicode"));
    codeActions.appendChild(createDetailCodeCopyButton(modernUnicode, "新字Unicodeをコピーしました", "Copied modern Unicode", "新字Unicodeをコピー", "Copy modern Unicode"));
    codeActions.appendChild(createDetailCodeCopyButton(oldHtmlEntity, "旧字HTMLをコピーしました", "Copied old HTML", "旧字HTMLをコピー", "Copy old HTML"));
    codeActions.appendChild(createDetailCodeCopyButton(modernHtmlEntity, "新字HTMLをコピーしました", "Copied modern HTML", "新字HTMLをコピー", "Copy modern HTML"));
    panel.appendChild(codeActions);
    const converterAction = document.createElement("a");
    converterAction.className = "converter-link converter-link-detail";
    converterAction.href = toConverterUrl(entry.oldChar);
    converterAction.innerHTML = '<span data-i18n="ja">この文字を変換ツールで使う</span><span data-i18n="en">Use this character in converter</span>';
    panel.appendChild(converterAction);
    switchLang(currentLang);
  }
  function renderSearchModes(){ const wrap = document.getElementById("searchModes"); if (!wrap) return; wrap.innerHTML = ""; searchModes.forEach(mode => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "search-mode-btn"; btn.dataset.mode = mode.id; btn.textContent = mode[currentLang]; btn.classList.toggle("active", mode.id === currentSearchMode); btn.addEventListener("click", () => { currentSearchMode = mode.id; renderAll(); }); wrap.appendChild(btn); }); }
  function renderFilters(){ const wrap = document.getElementById("filterButtons"); if (!wrap) return; wrap.innerHTML = ""; filters.forEach(filter => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "filter-btn"; btn.dataset.filter = filter.id; btn.textContent = filter[currentLang]; btn.classList.toggle("active", filter.id === currentFilter); btn.addEventListener("click", () => { currentFilter = filter.id; renderAll(); }); wrap.appendChild(btn); }); }
  function getFilteredEntries(){ const q = currentQuery.trim().toLowerCase(); return entriesCache.filter(entry => {
    if (activePreset === "schools" && !schoolPresetOldChars.includes(entry.oldChar)) return false;
    if (activePreset === "common" && !getPopularSet().has(entry.oldChar)) return false; const matchesFilter = currentFilter === "all" || (currentFilter === "verified" && entry.verified === true) || (currentFilter === "hasMeaning" && hasMeaning(entry)) || (currentFilter === "pairOnly" && !hasMeaning(entry)) || ((["name", "common", "document", "rare"].includes(currentFilter)) && entry.category === currentFilter); const allHaystack = `${entry.oldChar} ${entry.newText} ${entry.readingJa} ${entry.readingEn} ${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn} ${entry.oldCode} ${entry.newCode}`.toLowerCase(); const modeHaystack = { all: allHaystack, old: `${entry.oldChar}`.toLowerCase(), new: `${entry.newText}`.toLowerCase(), reading: `${entry.readingJa} ${entry.readingEn}`.toLowerCase(), meaning: `${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn}`.toLowerCase(), unicode: `${entry.oldCode} ${entry.newCode}`.toLowerCase() }; return matchesFilter && (!q || (modeHaystack[currentSearchMode] || allHaystack).includes(q)); }); }
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
  function renderGroupedByModern(){ let panel = document.getElementById("modernSummary"); const wrapper = document.querySelector(".group-wrapper"); if (!wrapper) return; if (!panel) { panel = document.createElement("section"); panel.id = "modernSummary"; panel.className = "modern-summary"; wrapper.insertBefore(panel, document.getElementById("filterButtons")); } const map = new Map(); entriesCache.forEach(entry => { if (!map.has(entry.newText)) map.set(entry.newText, []); map.get(entry.newText).push(entry.oldChar); }); const blocks = Array.from(map.entries()).filter(([, olds]) => olds.length > 1).sort((a,b)=>a[0].localeCompare(b[0],"ja")).map(([modern, olds]) => `<li><strong>${modern}</strong><div>${Array.from(new Set(olds)).join(" / ")}</div></li>`).join(""); if (!blocks) { panel.hidden = true; panel.innerHTML = ""; return; } panel.hidden = false; panel.innerHTML = `<h3><span data-i18n="ja">新字体別まとめ</span><span data-i18n="en">Grouped by modern form</span></h3><ul>${blocks}</ul>`; }
  function renderGroups(entries){ const container = document.getElementById("groupContainer"); const emptyMessage = document.getElementById("emptyMessage"); if (!container || !emptyMessage) return; container.innerHTML = ""; emptyMessage.hidden = entries.length > 0; renderReverseSummary(); if (!entries.length) return;
    const section = document.createElement("section"); section.className = "group-section"; const grid = document.createElement("div"); grid.className = "kanji-grid"; entries.forEach(entry => grid.appendChild(createEntryCard(entry, false))); section.appendChild(grid); container.appendChild(section);
    if (activeDetailOldChar) { const selected = entries.find(e => e.oldChar === activeDetailOldChar); if (selected) renderDetailPanel(selected); }
  }
  function renderPopular(){ const container = document.getElementById("popularContainer"); if (!container) return; container.innerHTML = ""; const popularSet = getPopularSet(); entriesCache.filter(entry => popularSet.has(entry.oldChar) && entry.verified).slice(0, 26).forEach(entry => container.appendChild(createEntryCard(entry, true))); }
  function updateStatus(visibleCount){ if (loadFailed) { setStatusText(messages[currentLang].loadError); return; } const total = entriesCache.length; const q = currentQuery.trim(); const filteredCount = entriesCache.filter(entry => currentFilter === "all" || (currentFilter === "verified" && entry.verified === true) || (currentFilter === "hasMeaning" && hasMeaning(entry)) || (currentFilter === "pairOnly" && !hasMeaning(entry)) || ((["name", "common", "document", "rare"].includes(currentFilter)) && entry.category === currentFilter)).length; const searchOnlyCount = q ? entriesCache.filter(entry => { const allHaystack = `${entry.oldChar} ${entry.newText} ${entry.readingJa} ${entry.readingEn} ${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn} ${entry.oldCode} ${entry.newCode}`.toLowerCase(); const modeHaystack = { all: allHaystack, old: `${entry.oldChar}`.toLowerCase(), new: `${entry.newText}`.toLowerCase(), reading: `${entry.readingJa} ${entry.readingEn}`.toLowerCase(), meaning: `${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn}`.toLowerCase(), unicode: `${entry.oldCode} ${entry.newCode}`.toLowerCase() }; return (modeHaystack[currentSearchMode] || allHaystack).includes(q.toLowerCase()); }).length : total; setStatusText(currentLang === "en" ? `Total ${total} | Visible ${visibleCount} | Search ${searchOnlyCount} | Filter ${filteredCount}` : `全件数 ${total}件｜表示中 ${visibleCount}件｜検索結果 ${searchOnlyCount}件｜フィルタ適用中 ${filteredCount}件`); }

  function escapeHtml(text){ return String(text || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
  function detectOldForms(text){
    const counts = new Map();
    Array.from(String(text || "")).forEach((ch) => { if (entriesCache.some(entry => entry.oldChar === ch)) counts.set(ch, (counts.get(ch) || 0) + 1); });
    return entriesCache.filter(entry => counts.has(entry.oldChar)).map(entry => ({ entry, count: counts.get(entry.oldChar) }));
  }
  function renderDetector(){
    const input = document.getElementById("detectorInput");
    const list = document.getElementById("detectorResults");
    const empty = document.getElementById("detectorEmpty");
    const highlight = document.getElementById("detectorHighlight");
    if (!input || !list || !empty || !highlight) return;
    const text = input.value || "";
    const detected = detectOldForms(text);
    list.innerHTML = "";
    if (!detected.length) {
      empty.hidden = !text;
      highlight.textContent = text;
      return;
    }
    empty.hidden = true;
    detected.forEach(({ entry, count }) => {
      const li = document.createElement("li");
      li.className = "detector-item";
      li.innerHTML = `<button type="button" class="detector-item-btn" data-old="${entry.oldChar}"><span class="detector-pair">${entry.oldChar} → ${entry.newText}</span><span class="detector-count">${currentLang === "en" ? `${count}` : `${count}回`}</span></button>`;
      list.appendChild(li);
    });
    const oldSet = new Set(detected.map(item => item.entry.oldChar));
    highlight.innerHTML = Array.from(text).map((ch) => oldSet.has(ch) ? `<mark>${escapeHtml(ch)}</mark>` : escapeHtml(ch)).join("");
  }
  function copyDetected(kind){
    const input = document.getElementById("detectorInput");
    if (!input) return;
    const detected = detectOldForms(input.value || "");
    if (!detected.length) return;
    const text = kind === "pairs" ? detected.map(({entry}) => `${entry.oldChar}→${entry.newText}`).join("\n") : detected.map(({entry}) => entry.oldChar).join(" ");
    copyWithFallback(text).then(() => showToast(kind === "pairs" ? messages[currentLang].copiedPairs : messages[currentLang].copiedOldFormsOnly));
  }
  function sendDetectorTextToConverter(){
    const input = document.getElementById("detectorInput");
    const text = (input?.value || "").trim();
    if (!text) {
      showToast(messages[currentLang].noDetectorTextToSend);
      return;
    }
    window.location.href = toConverterUrl(text);
  }

  function getVisibleEntries(){ return getFilteredEntries(); }
  function csvEscape(value){ const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
  function getDataStatus(entry){ return hasMeaning(entry) ? "verified" : "pair-only"; }
  function getConfidence(entry){ return entry.verified ? "high" : (hasMeaning(entry) ? "medium" : "mapping-only"); }
  function buildExportRows(entries){ return entries.map(entry => ({
    old: entry.oldChar,
    modern: entry.newText,
    readingJa: entry.readingJa || "",
    readingEn: entry.readingEn || "",
    meaningJa: entry.meaningJa || "",
    meaningEn: entry.meaningEn || "",
    category: entry.category || "",
    dataStatus: getDataStatus(entry),
    confidence: getConfidence(entry)
  })); }
  function downloadTextFile(filename, content, mimeType){
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  function formatDateStamp(){
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }
  function exportCsv(){
    const rows = buildExportRows(getVisibleEntries());
    if (!rows.length) return showToast(messages[currentLang].nothingToExport);
    const headers = ["old","modern","readingJa","readingEn","meaningJa","meaningEn","category","dataStatus","confidence"];
    const body = rows.map(row => headers.map(key => csvEscape(row[key])).join(",")).join("\n");
    downloadTextFile(`old-kanji-reference-${formatDateStamp()}.csv`, `${headers.join(",")}\n${body}`, "text/csv;charset=utf-8");
    showToast(messages[currentLang].exportedCsv);
  }
  function exportJson(){
    const rows = buildExportRows(getVisibleEntries());
    if (!rows.length) return showToast(messages[currentLang].nothingToExport);
    downloadTextFile(`old-kanji-reference-${formatDateStamp()}.json`, JSON.stringify(rows, null, 2), "application/json;charset=utf-8");
    showToast(messages[currentLang].exportedJson);
  }
  function copyMarkdownTable(){
    const entries = getVisibleEntries();
    if (!entries.length) return showToast(messages[currentLang].nothingToExport);
    const headerJa = "| 旧字体 | 新字体 | 読み | 意味 | 分類 |";
    const headerEn = "| Old form | Modern form | Reading | Meaning | Category |";
    const sep = "| --- | --- | --- | --- | --- |";
    const lines = entries.map(entry => {
      const reading = (currentLang === "en" ? (entry.readingEn || entry.readingJa) : (entry.readingJa || entry.readingEn)) || "-";
      const meaning = (currentLang === "en" ? (entry.meaningEn || entry.meaningJa) : (entry.meaningJa || entry.meaningEn)) || "-";
      const category = labelForCategory(entry.category || "rare");
      return `| ${entry.oldChar} | ${entry.newText} | ${reading.replaceAll("|", "\\|")} | ${meaning.replaceAll("|", "\\|")} | ${category.replaceAll("|", "\\|")} |`;
    });
    copyWithFallback([headerJa, headerEn, sep, ...lines].join("\n")).then(() => showToast(messages[currentLang].copiedMarkdown));
  }

  function renderAll(){ renderSearchModes(); renderFilters(); renderPalette(); renderPresets(); renderPopular(); renderFavorites(); renderRecent(); renderGroupedByModern(); const filtered = getFilteredEntries(); renderGroups(filtered); updateStatus(filtered.length); switchLang(currentLang); renderDetector(); }
  function copyWithFallback(value){ if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value); const textarea = document.createElement("textarea"); textarea.value = value; textarea.style.position = "fixed"; textarea.style.left = "-9999px"; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); return Promise.resolve(); }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => btn.addEventListener("click", () => { currentLang = btn.dataset.lang === "en" ? "en" : "ja"; switchLang(currentLang); renderAll(); switchLang(currentLang); }));
    const searchInput = document.getElementById("searchInput"); if (searchInput) searchInput.addEventListener("input", () => { currentQuery = searchInput.value || ""; renderAll(); });
    const detectorInput = document.getElementById("detectorInput"); if (detectorInput) detectorInput.addEventListener("input", renderDetector);
    const copyDetectedOld = document.getElementById("copyDetectedOld"); if (copyDetectedOld) copyDetectedOld.addEventListener("click", () => copyDetected("old"));
    const copyDetectedPairs = document.getElementById("copyDetectedPairs"); if (copyDetectedPairs) copyDetectedPairs.addEventListener("click", () => copyDetected("pairs"));
    const sendDetectorTextBtn = document.getElementById("sendDetectorTextToConverter"); if (sendDetectorTextBtn) sendDetectorTextBtn.addEventListener("click", sendDetectorTextToConverter);
    const exportCsvBtn = document.getElementById("exportCsv"); if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportCsv);
    const exportJsonBtn = document.getElementById("exportJson"); if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportJson);
    const copyMarkdownBtn = document.getElementById("copyMarkdown"); if (copyMarkdownBtn) copyMarkdownBtn.addEventListener("click", copyMarkdownTable);
    const printPageBtn = document.getElementById("printPage"); if (printPageBtn) printPageBtn.addEventListener("click", () => window.print());
    document.querySelectorAll(".panel-toggle").forEach(btn => btn.addEventListener("click", () => { const target = document.getElementById(btn.dataset.target); if (!target) return; const open = btn.getAttribute("aria-expanded") === "true"; btn.setAttribute("aria-expanded", open ? "false" : "true"); target.hidden = open; }));
    document.addEventListener("click", ev => {
      const detectorBtn = ev.target.closest(".detector-item-btn");
      if (detectorBtn) { const old = detectorBtn.dataset.old; const selected = entriesCache.find(entry => entry.oldChar === old); if (selected) { activeDetailOldChar = selected.oldChar; renderDetailPanel(selected); } return; }
      const favoriteToggle = ev.target.closest(".favorite-toggle");
      if (favoriteToggle) {
        const old = favoriteToggle.dataset.old;
        if (old) toggleFavorite(old);
        return;
      }
      const target = ev.target.closest(".copy-btn");
      if (target) { const value = target.dataset.copyValue; const kind = target.dataset.copyKind || "old"; const toast = currentLang === "en" ? target.dataset.copyToastEn : target.dataset.copyToastJa; copyWithFallback(value).then(() => showToast(toast || `${kind === "new" ? messages[currentLang].copiedNew : messages[currentLang].copiedOld}：${value}`)); }
      const toggle = ev.target.closest(".mobile-detail-toggle");
      if (toggle) { const card = toggle.closest(".kanji-card"); if (!card) return; card.classList.toggle("mobile-open"); toggle.innerHTML = card.classList.contains("mobile-open") ? `<span data-i18n="ja">${messages.ja.hideDetails}</span><span data-i18n="en">${messages.en.hideDetails}</span>` : `<span data-i18n="ja">${messages.ja.showDetails}</span><span data-i18n="en">${messages.en.showDetails}</span>`; switchLang(currentLang); renderDetector(); }
    });
    recentOldChars = loadStoredList(recentStorageKey);
    favoriteOldChars = loadStoredList(favoritesStorageKey);
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    const textParam = params.get("text");
    if (searchInput && qParam) {
      searchInput.value = qParam;
      currentQuery = qParam;
    }
    if (detectorInput && textParam) detectorInput.value = textParam;
    switchLang(currentLang); setStatusText(messages[currentLang].loading); loadData().then(dict => { loadFailed = false; setCounts(dict); buildEntries(dict); renderAll(); }).catch(() => { loadFailed = true; renderAll(); });
  });
})();
