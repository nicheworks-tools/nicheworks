(() => {
  let currentLang = "ja";
  let entriesCache = [];
  let currentFilter = "all";
  let currentQuery = "";

  const messages = {
    ja: {
      loading: "辞書データを読み込み中です…",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。",
      copiedOld: "旧字体をコピーしました",
      copiedNew: "現代表記をコピーしました",
      placeholder: "旧字体・現代表記どちらでも検索できます",
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
      placeholder: "Search by old or modern form",
      noMatch: "No matching entries found. Try another kanji or modern form.",
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
    { id: "reference", ja: "参考", en: "Reference" }
  ];

  const popularOld = new Set(["國", "體", "舊", "學", "會", "廣", "澤", "邊", "邉", "齋", "龍", "櫻", "實", "濱", "﨑", "髙", "德", "榮", "壽", "區"]);
  const nameOld = new Set(["澤", "邊", "邉", "齋", "齊", "濱", "﨑", "髙", "德", "廣", "榮", "壽", "神", "祥", "福", "穗", "鄕", "國", "嶋", "龍"]);
  const commonOld = new Set(["亞", "惡", "壓", "圍", "醫", "爲", "隱", "營", "驛", "應", "歐", "奧", "樂", "學", "關", "觀", "氣", "歸", "犧", "舊", "據", "擧", "區", "徑", "輕", "經", "藝", "儉", "劍", "檢", "權", "嚴", "廣", "國", "齋", "劑", "雜", "參", "慘", "殘", "兒", "實", "寫", "舍", "壽", "收", "從", "澁", "獸", "縱", "肅", "處", "敍", "將", "燒", "證", "條", "乘", "淨", "剩", "疊", "孃", "讓", "釀", "眞", "寢", "愼", "盡", "圖", "粹", "醉", "穗", "數", "聲", "靜", "齊", "攝", "專", "戰", "淺", "潛", "纖", "踐", "錢", "禪", "曾", "雙", "壯", "搜", "插", "巢", "爭", "總", "聰", "莊", "裝", "騷", "藏", "屬", "續", "墮", "體", "對", "帶", "滯", "臺", "瀧", "擇", "澤", "擔", "單", "膽", "團", "彈", "斷", "癡", "遲", "晝", "蟲", "鑄", "廳", "聽", "敕", "鎭", "遞", "鐵", "點", "轉", "傳", "黨", "盜", "燈", "當", "鬪", "德", "獨", "讀", "惱", "腦", "廢", "拜", "賣", "麥", "發", "髮", "拔", "蠻", "祕", "濱", "拂", "佛", "變", "邊", "辨", "瓣", "辯", "舖", "步", "寶", "豐", "沒", "飜", "每", "萬", "滿", "默", "藥", "與", "豫", "餘", "譽", "搖", "樣", "謠", "來", "覽", "龍", "兩", "獵", "綠", "壘", "禮", "勵", "靈", "齡", "曆", "歷", "戀", "爐", "勞", "樓", "灣"]);

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

  function getBlockName(char) {
    const code = char.codePointAt(0);
    const found = blockRanges.find(range => code >= range.start && code <= range.end);
    return found ? found.name : { ja: "その他", en: "Other" };
  }

  function getCategory(oldChar) {
    if (popularOld.has(oldChar)) return "popular";
    if (nameOld.has(oldChar)) return "name";
    if (commonOld.has(oldChar)) return "common";
    return "reference";
  }

  function getNewText(newChar) {
    return Array.isArray(newChar) ? newChar.join("、") : String(newChar || "");
  }

  function labelForCategory(category) {
    const found = filters.find(item => item.id === category);
    return found ? found[currentLang] : filters[filters.length - 1][currentLang];
  }

  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });

    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      const ja = searchInput.dataset.placeholderJa || messages.ja.placeholder;
      const en = searchInput.dataset.placeholderEn || messages.en.placeholder;
      searchInput.placeholder = currentLang === "en" ? en : ja;
    }
  }

  function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function loadDict() {
    const res = await fetch("./dict.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load dict.json");
    return res.json();
  }

  function setCounts(dict) {
    const oldCount = Object.keys(dict.old_to_new || {}).length;
    document.querySelectorAll('[data-count="old"]').forEach(el => {
      el.textContent = oldCount;
    });
  }

  function setStatusText(text) {
    const el = document.getElementById("statusMessage");
    if (el) el.textContent = text || "";
  }

  function setStatus(messageKey) {
    const text = messageKey ? (messages[currentLang][messageKey] || "") : "";
    setStatusText(text);
  }

  function buildEntries(dict) {
    entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => {
      const block = getBlockName(oldChar);
      return {
        oldChar,
        newText: getNewText(newChar),
        block,
        category: getCategory(oldChar)
      };
    });
    entriesCache.sort((a, b) => a.oldChar.localeCompare(b.oldChar, "ja"));
    return entriesCache;
  }

  function createCopyButton(value, kind) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.dataset.copyValue = value;
    btn.dataset.copyKind = kind;

    const ja = document.createElement("span");
    ja.dataset.i18n = "ja";
    ja.textContent = kind === "new" ? "新字をコピー" : "旧字をコピー";

    const en = document.createElement("span");
    en.dataset.i18n = "en";
    en.textContent = kind === "new" ? "Copy modern" : "Copy old";

    btn.appendChild(ja);
    btn.appendChild(en);
    return btn;
  }

  function createEntryCard(entry, compact) {
    const card = document.createElement("article");
    card.className = compact ? "kanji-card popular-card" : "kanji-card";
    card.dataset.old = entry.oldChar;
    card.dataset.new = entry.newText;
    card.dataset.category = entry.category;

    const pair = document.createElement("div");
    pair.className = "kanji-pair";

    const oldEl = document.createElement("div");
    oldEl.className = "kanji-old";
    oldEl.textContent = entry.oldChar;

    const arrow = document.createElement("div");
    arrow.className = "kanji-arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");

    const newEl = document.createElement("div");
    newEl.className = "kanji-new";
    newEl.textContent = entry.newText;

    pair.appendChild(oldEl);
    pair.appendChild(arrow);
    pair.appendChild(newEl);

    const note = document.createElement("p");
    note.className = "kanji-meaning";
    note.innerHTML = `
      <span data-i18n="ja">対応：旧字体「${entry.oldChar}」は現代表記「${entry.newText}」に対応します。</span>
      <span data-i18n="en">Pair: old form ${entry.oldChar} corresponds to modern form ${entry.newText}.</span>
    `;

    const meta = document.createElement("p");
    meta.className = "kanji-meta";
    meta.innerHTML = `
      <span data-i18n="ja">分類：${labelForCategory(entry.category)}</span>
      <span data-i18n="en">Category: ${labelForCategory(entry.category)}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "copy-actions";
    actions.appendChild(createCopyButton(entry.oldChar, "old"));
    actions.appendChild(createCopyButton(entry.newText, "new"));

    card.appendChild(pair);
    if (!compact) card.appendChild(note);
    card.appendChild(meta);
    card.appendChild(actions);
    return card;
  }

  function renderFilters() {
    const wrap = document.getElementById("filterButtons");
    if (!wrap) return;
    wrap.innerHTML = "";
    filters.forEach(filter => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.dataset.filter = filter.id;
      btn.textContent = filter[currentLang];
      btn.classList.toggle("active", filter.id === currentFilter);
      btn.addEventListener("click", () => {
        currentFilter = filter.id;
        renderAll();
      });
      wrap.appendChild(btn);
    });
  }

  function renderPopular() {
    const container = document.getElementById("popularContainer");
    if (!container) return;
    container.innerHTML = "";
    const popularEntries = entriesCache.filter(entry => popularOld.has(entry.oldChar)).slice(0, 20);
    popularEntries.forEach(entry => container.appendChild(createEntryCard(entry, true)));
  }

  function getFilteredEntries() {
    const q = currentQuery.trim();
    return entriesCache.filter(entry => {
      const matchesFilter = currentFilter === "all" || entry.category === currentFilter || (currentFilter === "popular" && popularOld.has(entry.oldChar));
      const matchesQuery = !q || entry.oldChar.includes(q) || entry.newText.includes(q) || labelForCategory(entry.category).includes(q);
      return matchesFilter && matchesQuery;
    });
  }

  function renderGroups(entries) {
    const container = document.getElementById("groupContainer");
    const emptyMessage = document.getElementById("emptyMessage");
    if (!container || !emptyMessage) return;

    container.innerHTML = "";
    emptyMessage.hidden = entries.length > 0;

    if (!entries.length) {
      emptyMessage.querySelector('[data-i18n="ja"]').textContent = messages.ja.noMatch;
      emptyMessage.querySelector('[data-i18n="en"]').textContent = messages.en.noMatch;
      return;
    }

    const grouped = new Map();
    entries.forEach(entry => {
      const key = currentLang === "en" ? entry.block.en : entry.block.ja;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(entry);
    });

    Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "ja")).forEach(key => {
      const groupSection = document.createElement("section");
      groupSection.className = "group-section";

      const heading = document.createElement("h3");
      heading.className = "group-heading";
      heading.innerHTML = `${key} <span class="badge">${grouped.get(key).length}</span>`;
      groupSection.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "kanji-grid";
      grouped.get(key).forEach(entry => grid.appendChild(createEntryCard(entry, false)));

      groupSection.appendChild(grid);
      container.appendChild(groupSection);
    });
  }

  function updateStatus(visibleCount) {
    const total = entriesCache.length;
    const isSearch = currentQuery.trim().length > 0 || currentFilter !== "all";
    if (currentLang === "en") {
      setStatusText(`${isSearch ? messages.en.searchResults : messages.en.showing}: ${visibleCount} / ${total}`);
    } else {
      setStatusText(`${isSearch ? messages.ja.searchResults : messages.ja.showing}：${visibleCount}件 / ${messages.ja.total}${total}件`);
    }
  }

  function renderAll() {
    renderFilters();
    renderPopular();
    const filtered = getFilteredEntries();
    renderGroups(filtered);
    updateStatus(filtered.length);
    switchLang(currentLang);
  }

  function handleCopy(target) {
    const value = target.dataset.copyValue;
    const kind = target.dataset.copyKind || "old";
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      const label = kind === "new" ? messages[currentLang].copiedNew : messages[currentLang].copiedOld;
      showToast(`${label}：${value}`);
    }).catch(() => {
      showToast(value);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentLang = btn.dataset.lang === "en" ? "en" : "ja";
        renderAll();
      });
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        currentQuery = searchInput.value || "";
        renderAll();
      });
    }

    document.addEventListener("click", ev => {
      const target = ev.target.closest(".copy-btn");
      if (target) handleCopy(target);
    });

    switchLang(currentLang);
    setStatus("loading");

    loadDict()
      .then(dict => {
        setCounts(dict);
        buildEntries(dict);
        renderAll();
      })
      .catch(() => setStatus("loadError"));
  });
})();
