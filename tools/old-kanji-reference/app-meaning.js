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
      placeholder: "旧字体・現代表記・読み・意味で検索できます",
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
      placeholder: "Search by old form, modern form, reading, or meaning",
      noMatch: "No matching entries found. Try another kanji, reading, or modern form.",
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

  const popularOrder = ["會", "區", "國", "壽", "學", "廣", "德", "戀", "舊", "榮", "澤", "濱", "狀", "獨", "禮", "體", "邊", "邉", "醫", "鐵", "驛", "齋", "﨑"];
  const popularOld = new Set(popularOrder);
  const nameOld = new Set(["澤", "邊", "邉", "齋", "齊", "濱", "﨑", "德", "廣", "榮", "壽", "神", "祥", "福", "穗", "鄕", "國", "龍", "櫻", "實"]);
  const commonOld = new Set(["亞", "惡", "壓", "圍", "醫", "爲", "隱", "營", "驛", "應", "歐", "奧", "樂", "學", "關", "觀", "舊", "區", "徑", "輕", "藝", "儉", "劍", "嚴", "廣", "國", "齋", "參", "兒", "實", "壽", "從", "處", "敍", "將", "燒", "證", "讓", "眞", "圖", "數", "聲", "靜", "攝", "專", "戰", "淺", "爭", "總", "聰", "莊", "屬", "續", "體", "對", "臺", "擇", "澤", "擔", "團", "彈", "斷", "遲", "廳", "聽", "鐵", "點", "轉", "傳", "燈", "德", "獨", "讀", "惱", "腦", "廢", "拜", "賣", "麥", "發", "髮", "拔", "祕", "濱", "拂", "變", "邊", "寶", "豐", "滿", "藥", "豫", "餘", "譽", "樣", "謠", "來", "覽", "龍", "禮", "靈", "齡", "歷", "戀", "勞"]);
  const documentOld = new Set(["舊", "學", "體", "會", "國", "縣", "營", "驛", "關", "戰", "廳", "敎", "數", "證", "讀", "觀", "嚴", "鐵", "藝", "靈", "讓", "爲", "據", "覽", "歸", "歷", "畫", "寶", "價", "傳", "圖", "團", "從", "應", "斷", "滿", "稱", "繪", "聲", "號", "譯", "轉", "輕", "驗", "黃", "黑"]);

  const metadata = {
    "會": { readingJa: "かい・あう", readingEn: "kai / au", meaningJa: "集まる・出会う・会合する。", meaningEn: "to meet, gather, assemble.", category: "popular", usageJa: "会社名・団体名・古い文書で見かけます。", usageEn: "Seen in company names, associations, and older documents." },
    "區": { readingJa: "く", readingEn: "ku", meaningJa: "区切る・区域・行政区画。", meaningEn: "district, section, division.", category: "popular", usageJa: "行政・地名・古い資料で見かけます。", usageEn: "Seen in administrative, place-name, and older records." },
    "國": { readingJa: "こく・くに", readingEn: "koku / kuni", meaningJa: "国・国家・土地。", meaningEn: "country, nation, land.", category: "popular", usageJa: "古い文書・団体名・地名表記で見かけます。", usageEn: "Seen in older documents, organization names, and place names." },
    "壽": { readingJa: "じゅ・ことぶき", readingEn: "ju / kotobuki", meaningJa: "長生き・祝い・めでたいこと。", meaningEn: "longevity, celebration, felicity.", category: "popular", usageJa: "人名・祝い事・屋号などで見かけます。", usageEn: "Seen in names, celebratory contexts, and shop names." },
    "學": { readingJa: "がく・まなぶ", readingEn: "gaku / manabu", meaningJa: "学ぶこと・知識・学問。", meaningEn: "learning, study, scholarship.", category: "popular", usageJa: "学校名・記念碑・古い文献で見かけます。", usageEn: "Seen in school names, monuments, and older texts." },
    "廣": { readingJa: "こう・ひろい", readingEn: "ko / hiroi", meaningJa: "広い・範囲が大きい。", meaningEn: "wide, broad, spacious.", category: "popular", usageJa: "人名・地名・屋号で見かけます。", usageEn: "Seen in names, places, and shop names." },
    "德": { readingJa: "とく", readingEn: "toku", meaningJa: "徳・人としてのよさ・道徳的な力。", meaningEn: "virtue, moral excellence.", category: "popular", usageJa: "人名・寺社名・古い文書で見かけます。", usageEn: "Seen in names, shrine or temple names, and older documents." },
    "戀": { readingJa: "れん・こい", readingEn: "ren / koi", meaningJa: "恋・慕う気持ち。", meaningEn: "love, longing.", category: "popular", usageJa: "文学作品・古い歌詞・装飾的な表記で見かけます。", usageEn: "Seen in literature, older lyrics, and decorative writing." },
    "舊": { readingJa: "きゅう", readingEn: "kyu", meaningJa: "古い・以前の・昔の。", meaningEn: "old, former, previous.", category: "popular", usageJa: "『舊字』『舊字体』などの表記で見かけます。", usageEn: "Seen in old-style words such as 舊字." },
    "榮": { readingJa: "えい・さかえる", readingEn: "ei / sakaeru", meaningJa: "栄える・名誉・繁栄。", meaningEn: "prosperity, glory, flourishing.", category: "popular", usageJa: "人名・屋号・古い表記で見かけます。", usageEn: "Seen in names, shop names, and older writing." },
    "澤": { readingJa: "たく・さわ", readingEn: "taku / sawa", meaningJa: "沢・水が集まる低地・うるおい。", meaningEn: "marsh, stream valley, abundance or moisture.", category: "popular", usageJa: "人名・地名で現在も見かけます。", usageEn: "Still seen in personal and place names." },
    "濱": { readingJa: "ひん・はま", readingEn: "hin / hama", meaningJa: "浜・水辺・海岸。", meaningEn: "beach, shore, waterside.", category: "popular", usageJa: "人名・地名で見かけます。", usageEn: "Seen in personal and place names." },
    "狀": { readingJa: "じょう・かたち", readingEn: "jo / katachi", meaningJa: "状態・ありさま・形。", meaningEn: "condition, state, form.", category: "popular", usageJa: "古い文書や旧字表記で見かけます。", usageEn: "Seen in older documents and old-style writing." },
    "獨": { readingJa: "どく・ひとり", readingEn: "doku / hitori", meaningJa: "独り・単独・ひとつだけ。", meaningEn: "alone, independent, single.", category: "popular", usageJa: "古い文書・文学・地名表記で見かけることがあります。", usageEn: "Seen in older documents, literature, and place-name contexts." },
    "禮": { readingJa: "れい", readingEn: "rei", meaningJa: "礼・作法・敬意。", meaningEn: "courtesy, ritual, respect.", category: "popular", usageJa: "儀礼・寺社・古い表記で見かけます。", usageEn: "Seen in ritual, shrine/temple, and older writing contexts." },
    "體": { readingJa: "たい・からだ", readingEn: "tai / karada", meaningJa: "体・からだ・形。", meaningEn: "body, form, substance.", category: "popular", usageJa: "古い書籍や旧字表記で見かけます。", usageEn: "Seen in older books and old-style writing." },
    "邊": { readingJa: "へん・べ・あたり", readingEn: "hen / be / atari", meaningJa: "あたり・周辺・端。", meaningEn: "edge, vicinity, side.", category: "popular", usageJa: "人名で見かけます。", usageEn: "Seen in personal names." },
    "邉": { readingJa: "へん・べ・あたり", readingEn: "hen / be / atari", meaningJa: "あたり・周辺・端。", meaningEn: "edge, vicinity, side.", category: "popular", usageJa: "辺の異体字・旧字系表記。人名で見かけます。", usageEn: "Variant old-style form related to 辺. Seen in personal names." },
    "醫": { readingJa: "い", readingEn: "i", meaningJa: "病気を治すこと・医療。", meaningEn: "medicine; medical treatment.", category: "popular", usageJa: "病院名・古い医学文献で見かけます。", usageEn: "Seen in hospital names and older medical texts." },
    "鐵": { readingJa: "てつ", readingEn: "tetsu", meaningJa: "鉄・金属の鉄。", meaningEn: "iron, steel.", category: "popular", usageJa: "鉄道・会社名・古い表記で見かけます。", usageEn: "Seen in railway, company, and older writing contexts." },
    "驛": { readingJa: "えき", readingEn: "eki", meaningJa: "駅・交通や宿駅の拠点。", meaningEn: "station; transport post.", category: "popular", usageJa: "古い地図・駅名標・文献で見かけます。", usageEn: "Seen in older maps, station signs, and documents." },
    "齋": { readingJa: "さい・いつき", readingEn: "sai / itsuki", meaningJa: "斎む・清める・斎場や名に使われる字。", meaningEn: "purification; ritual abstinence; used in names.", category: "popular", usageJa: "人名・屋号・寺社名などで見かけます。", usageEn: "Seen in names, shop names, and shrine or temple names." },
    "﨑": { readingJa: "さき", readingEn: "saki", meaningJa: "崎・岬や山の突き出たところ。", meaningEn: "cape, promontory, projecting landform.", category: "popular", usageJa: "人名・地名で見かけます。", usageEn: "Seen in personal and place names." },
    "應": { readingJa: "おう・こたえる", readingEn: "o / kotaeru", meaningJa: "応じる・こたえる・ふさわしく合わせる。", meaningEn: "to respond, answer, correspond to.", category: "common", usageJa: "古い文書・団体名・学校名などで見かけることがあります。", usageEn: "Seen in older documents, organization names, and school names." },
    "樂": { readingJa: "がく・らく・たのしい", readingEn: "gaku / raku / tanoshii", meaningJa: "音楽・楽しむ・楽であること。", meaningEn: "music; enjoyment; ease.", category: "common" },
    "關": { readingJa: "かん・せき", readingEn: "kan / seki", meaningJa: "関所・関係する・かかわる。", meaningEn: "barrier; relation; to be connected.", category: "common" },
    "讀": { readingJa: "どく・よむ", readingEn: "doku / yomu", meaningJa: "読む・読み取る。", meaningEn: "to read.", category: "common" },
    "轉": { readingJa: "てん・ころがる", readingEn: "ten / korogaru", meaningJa: "転がる・移る・変わる。", meaningEn: "to roll, transfer, change.", category: "common" },
    "傳": { readingJa: "でん・つたえる", readingEn: "den / tsutaeru", meaningJa: "伝える・受け継ぐ。", meaningEn: "to transmit, convey, inherit.", category: "common" },
    "變": { readingJa: "へん・かわる", readingEn: "hen / kawaru", meaningJa: "変わる・変える。", meaningEn: "to change; unusual.", category: "common" },
    "來": { readingJa: "らい・くる", readingEn: "rai / kuru", meaningJa: "来る・これから。", meaningEn: "to come; future.", category: "common" }
  };

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
  function getNewText(newChar) { return Array.isArray(newChar) ? newChar.join("、") : String(newChar || ""); }
  function labelForCategory(category) {
    const found = filters.find(item => item.id === category);
    return found ? found[currentLang] : filters[filters.length - 1][currentLang];
  }
  function getCategory(oldChar) {
    if (metadata[oldChar]?.category) return metadata[oldChar].category;
    if (popularOld.has(oldChar)) return "popular";
    if (nameOld.has(oldChar)) return "name";
    if (commonOld.has(oldChar)) return "common";
    if (documentOld.has(oldChar)) return "document";
    return "rare";
  }
  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.style.display = el.dataset.i18n === currentLang ? "" : "none"; });
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => { btn.classList.toggle("active", btn.dataset.lang === currentLang); });
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
    document.querySelectorAll('[data-count="old"]').forEach(el => { el.textContent = oldCount; });
  }
  function setStatusText(text) {
    const el = document.getElementById("statusMessage");
    if (el) el.textContent = text || "";
  }
  function buildEntries(dict) {
    entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => {
      const meta = metadata[oldChar] || {};
      return {
        oldChar,
        newText: getNewText(newChar),
        block: getBlockName(oldChar),
        category: getCategory(oldChar),
        readingJa: meta.readingJa || "",
        readingEn: meta.readingEn || "",
        meaningJa: meta.meaningJa || "",
        meaningEn: meta.meaningEn || "",
        usageJa: meta.usageJa || "",
        usageEn: meta.usageEn || ""
      };
    });
    entriesCache.sort((a, b) => {
      const ia = popularOrder.indexOf(a.oldChar);
      const ib = popularOrder.indexOf(b.oldChar);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.oldChar.localeCompare(b.oldChar, "ja");
    });
    return entriesCache;
  }
  function addI18nLine(parent, className, jaLabel, enLabel, jaText, enText) {
    if (!jaText && !enText) return;
    const p = document.createElement("p");
    p.className = className;
    p.innerHTML = `<span data-i18n="ja">${jaLabel}：${jaText}</span><span data-i18n="en">${enLabel}: ${enText || jaText}</span>`;
    parent.appendChild(p);
  }
  function createCopyButton(value, kind) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.dataset.copyValue = value;
    btn.dataset.copyKind = kind;
    btn.innerHTML = kind === "new" ? '<span data-i18n="ja">新字をコピー</span><span data-i18n="en">Copy modern</span>' : '<span data-i18n="ja">旧字をコピー</span><span data-i18n="en">Copy old</span>';
    return btn;
  }
  function createEntryCard(entry, compact) {
    const card = document.createElement("article");
    card.className = compact ? "kanji-card popular-card" : "kanji-card";
    card.dataset.old = entry.oldChar;
    card.dataset.new = entry.newText;
    card.dataset.reading = `${entry.readingJa} ${entry.readingEn}`;
    card.dataset.category = entry.category;
    const pair = document.createElement("div");
    pair.className = "kanji-pair";
    pair.innerHTML = `<div class="kanji-old">${entry.oldChar}</div><div class="kanji-arrow" aria-hidden="true">→</div><div class="kanji-new">${entry.newText}</div>`;
    card.appendChild(pair);
    addI18nLine(card, "kanji-reading", "読み", "Reading", entry.readingJa, entry.readingEn);
    addI18nLine(card, "kanji-meaning", "意味", "Meaning", entry.meaningJa, entry.meaningEn);
    if (!compact) addI18nLine(card, "kanji-usage", "用途", "Usage", entry.usageJa, entry.usageEn);
    const meta = document.createElement("p");
    meta.className = "kanji-meta";
    meta.innerHTML = `<span data-i18n="ja">分類：${labelForCategory(entry.category)}</span><span data-i18n="en">Category: ${labelForCategory(entry.category)}</span>`;
    card.appendChild(meta);
    const actions = document.createElement("div");
    actions.className = "copy-actions";
    actions.appendChild(createCopyButton(entry.oldChar, "old"));
    actions.appendChild(createCopyButton(entry.newText, "new"));
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
      btn.addEventListener("click", () => { currentFilter = filter.id; renderAll(); });
      wrap.appendChild(btn);
    });
  }
  function renderPopular() {
    const container = document.getElementById("popularContainer");
    if (!container) return;
    container.innerHTML = "";
    entriesCache.filter(entry => popularOld.has(entry.oldChar)).slice(0, 20).forEach(entry => container.appendChild(createEntryCard(entry, true)));
  }
  function getFilteredEntries() {
    const q = currentQuery.trim().toLowerCase();
    return entriesCache.filter(entry => {
      const matchesFilter = currentFilter === "all" || entry.category === currentFilter || (currentFilter === "popular" && popularOld.has(entry.oldChar));
      const haystack = `${entry.oldChar} ${entry.newText} ${entry.readingJa} ${entry.readingEn} ${entry.meaningJa} ${entry.meaningEn} ${entry.usageJa} ${entry.usageEn} ${labelForCategory(entry.category)}`.toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
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
      const grid = document.createElement("div");
      grid.className = "kanji-grid";
      grouped.get(key).forEach(entry => grid.appendChild(createEntryCard(entry, false)));
      groupSection.appendChild(heading);
      groupSection.appendChild(grid);
      container.appendChild(groupSection);
    });
  }
  function updateStatus(visibleCount) {
    const total = entriesCache.length;
    const isSearch = currentQuery.trim().length > 0 || currentFilter !== "all";
    setStatusText(currentLang === "en" ? `${isSearch ? messages.en.searchResults : messages.en.showing}: ${visibleCount} / ${total}` : `${isSearch ? messages.ja.searchResults : messages.ja.showing}：${visibleCount}件 / ${messages.ja.total}${total}件`);
  }
  function renderAll() {
    renderFilters();
    renderPopular();
    const filtered = getFilteredEntries();
    renderGroups(filtered);
    updateStatus(filtered.length);
    switchLang(currentLang);
  }
  function copyWithFallback(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value);
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }
  function handleCopy(target) {
    const value = target.dataset.copyValue;
    const kind = target.dataset.copyKind || "old";
    if (!value) return;
    copyWithFallback(value).then(() => {
      const label = kind === "new" ? messages[currentLang].copiedNew : messages[currentLang].copiedOld;
      showToast(`${label}：${value}`);
    }).catch(() => showToast(value));
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => { btn.addEventListener("click", () => { currentLang = btn.dataset.lang === "en" ? "en" : "ja"; renderAll(); }); });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", () => { currentQuery = searchInput.value || ""; renderAll(); });
    document.addEventListener("click", ev => { const target = ev.target.closest(".copy-btn"); if (target) handleCopy(target); });
    switchLang(currentLang);
    setStatusText(messages[currentLang].loading);
    loadDict().then(dict => { setCounts(dict); buildEntries(dict); renderAll(); }).catch(() => setStatusText(messages[currentLang].loadError));
  });
})();
