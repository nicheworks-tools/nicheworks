(() => {
  const isEnglishPath = /\/manual-finder\/en\/?/.test(window.location.pathname);
  const DATA_URL = isEnglishPath ? "../data/manuals.json" : "./data/manuals.json";
  const EXTRA_URL = isEnglishPath ? "../data/manuals.extra.js" : "./data/manuals.extra.js";

  const FALLBACK_MANUALS = [
    ["Apple", "Apple（アップル）", "Apple", "PC・スマホ", "Global", "https://support.apple.com/ja-jp/docs", "https://support.apple.com/", "iPhone 型番、MacBook モデル名、iPad 世代"],
    ["Sony", "ソニー", "Sony", "家電", "Japan", "https://www.sony.jp/support/manual.html", "https://www.sony.jp/support/", "BRAVIA 型番、ヘッドホン型番、カメラ型番"],
    ["Panasonic", "パナソニック", "Panasonic", "家電", "Japan", "https://panasonic.jp/support/manual.html", "https://panasonic.jp/support/", "洗濯機 型番、冷蔵庫 型番、LUMIX 型番"],
    ["Canon", "キヤノン", "Canon", "カメラ・映像", "Japan", "https://cam.start.canon/", "https://global.canon/en/support/", "EOS 型番、PowerShot 型番、レンズ名"],
    ["Epson", "エプソン", "Epson", "プリンター・複合機", "Japan", "https://www.epson.jp/support/manual/", "https://www.epson.jp/support/", "EP / PX / EW から始まる型番"],
    ["Brother", "ブラザー工業", "Brother", "プリンター・複合機", "Japan", "https://support.brother.co.jp/j/b/manualtop.aspx", "https://support.brother.co.jp/", "DCP / MFC / HL / PT から始まる型番"],
    ["HP", "日本HP", "HP", "PC・スマホ", "Global", "https://support.hp.com/us-en/products", "https://support.hp.com/", "ノートPC型番、プリンター型番、シリアル番号"],
    ["Dell", "デル・テクノロジーズ", "Dell", "PC・スマホ", "Global", "https://www.dell.com/support/home/en-us?app=manuals", "https://www.dell.com/support/home/", "Service Tag、Inspiron / XPS / Latitude 型番"],
    ["Lenovo", "レノボ・ジャパン", "Lenovo", "PC・スマホ", "Global", "https://support.lenovo.com/us/en/documents", "https://support.lenovo.com/", "ThinkPad 型番、IdeaPad 型番、シリアル番号"],
    ["Nintendo", "任天堂", "Nintendo", "ゲーム", "Japan", "https://www.nintendo.co.jp/support/manual/", "https://www.nintendo.co.jp/support/", "Nintendo Switch、Joy-Con、型番"]
  ].map(([brand, nameJa, nameEn, category, country, manualUrl, supportUrl, hint]) => ({
    brand, nameJa, nameEn, category, country, manualUrl, supportUrl, hint,
    note: "公式マニュアル／サポート入口です。",
    tags: String(`${brand} ${category}`).toLowerCase().split(/\s+/),
    sourceType: "official",
    linkReview: "fallback official entry"
  }));

  const state = {
    manuals: [],
    filtered: [],
    lang: isEnglishPath ? "en" : "ja",
    status: "loading",
    statusMessageJa: "データを読み込み中です...",
    statusMessageEn: "Loading manual directory..."
  };

  const els = {
    results: document.getElementById("results"),
    resultCount: document.getElementById("resultCount"),
    loadStatus: document.getElementById("loadStatus"),
    emptyJa: document.getElementById("emptyMessage"),
    emptyEn: document.getElementById("emptyMessageEn"),
    searchInput: document.getElementById("searchInput"),
    categorySelect: document.getElementById("categorySelect"),
    quickButtons: document.getElementById("quickButtons"),
    langButtons: document.querySelectorAll(".nw-lang-switch button"),
    i18nNodes: document.querySelectorAll("[data-i18n]")
  };

  const text = (ja, en) => state.lang === "ja" ? ja : en;
  const normalize = (value) => String(value || "").trim().toLowerCase();

  function loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src=\"${src}\"]`)) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  function collectSearchParts(item) {
    const parts = [item.brand, item.nameJa, item.nameEn, item.category, item.country, item.note, item.hint];
    if (Array.isArray(item.tags)) parts.push(item.tags.join(" "));
    return parts.filter(Boolean).join(" ").toLowerCase();
  }

  function getCategoryLabels(item) {
    return item.category ? [item.category] : [text("その他", "Other")];
  }

  function getHint(item) {
    if (item.hint) return item.hint;
    if (item.category === "プリンター・複合機") return `${item.brand} 型番、プリンター型番、製品名`;
    if (item.category === "カメラ・映像") return `${item.brand} 型番、カメラ型番、レンズ名`;
    if (item.category === "PC・スマホ") return `${item.brand} 型番、モデル名、シリアル番号`;
    if (item.category === "家電") return `${item.brand} 型番、製品名、シリーズ名`;
    if (item.category === "オーディオ") return `${item.brand} 型番、製品名、シリーズ名`;
    if (item.category === "ゲーム") return `${item.brand} 本体名、型番、周辺機器名`;
    if (item.category === "ネットワーク機器") return `${item.brand} ルーター型番、製品名`;
    return `${item.brand} 型番、製品名、シリーズ名`;
  }

  function setStatus(status, ja, en) {
    state.status = status;
    state.statusMessageJa = ja || "";
    state.statusMessageEn = en || "";
    updateStatusMessage();
  }

  function updateStatusMessage() {
    if (!els.loadStatus) return;
    const message = text(state.statusMessageJa, state.statusMessageEn);
    els.loadStatus.textContent = message;
    els.loadStatus.hidden = !message || state.status === "ready";
    els.loadStatus.classList.toggle("is-warning", state.status === "fallback");
    els.loadStatus.classList.toggle("is-error", state.status === "error");
  }

  function applyLang(lang) {
    state.lang = lang;
    els.i18nNodes.forEach((el) => {
      const code = el.getAttribute("data-i18n");
      if (code) el.hidden = code !== lang;
    });
    els.langButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-lang") === lang));
    updateStatusMessage();
    render();
  }

  function initLang() {
    const saved = window.localStorage ? window.localStorage.getItem("manualfinder_lang") : null;
    const navLang = (navigator.language || "").toLowerCase();
    applyLang(isEnglishPath ? "en" : (saved || (navLang.startsWith("ja") ? "ja" : "en")));
    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (!lang || lang === state.lang) return;
        applyLang(lang);
        if (window.localStorage) window.localStorage.setItem("manualfinder_lang", lang);
      });
    });
  }

  async function loadManuals() {
    setStatus("loading", "データを読み込み中です...", "Loading manual directory...");
    await loadScript(EXTRA_URL);
    fetch(DATA_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed to load manuals.json");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("manual data is not an array");
        state.manuals = data;
        setStatus("ready", "", "");
        applyFilter();
      })
      .catch((err) => {
        console.error(err);
        state.manuals = FALLBACK_MANUALS;
        setStatus("fallback", "データ読み込みに失敗しました。主要メーカーの最小リストを表示しています。", "Could not load the full directory. Showing a fallback list of major brands.");
        applyFilter();
      });
  }

  function applyFilter(forcedKeyword) {
    const keyword = normalize(forcedKeyword || (els.searchInput ? els.searchInput.value : ""));
    const category = els.categorySelect ? els.categorySelect.value : "";
    let list = state.manuals.slice();
    if (keyword) list = list.filter((item) => collectSearchParts(item).includes(keyword));
    if (category) list = list.filter((item) => getCategoryLabels(item).includes(category));
    state.filtered = list;
    render();
  }

  function makeText(tagName, className, content) {
    const el = document.createElement(tagName);
    el.className = className;
    el.textContent = content;
    return el;
  }

  function render() {
    if (!els.results || !els.resultCount) return;
    updateStatusMessage();
    const list = state.filtered || [];
    els.results.innerHTML = "";
    if (state.status === "loading") {
      els.resultCount.textContent = text("読み込み中...", "Loading...");
      if (els.emptyJa) els.emptyJa.hidden = true;
      if (els.emptyEn) els.emptyEn.hidden = true;
      return;
    }
    if (!list.length) {
      els.resultCount.textContent = text("0件", "0 records");
      if (els.emptyJa) els.emptyJa.hidden = state.lang !== "ja";
      if (els.emptyEn) els.emptyEn.hidden = state.lang !== "en";
      return;
    }
    if (els.emptyJa) els.emptyJa.hidden = true;
    if (els.emptyEn) els.emptyEn.hidden = true;
    els.resultCount.textContent = text(`全${list.length}件`, `${list.length} records`);
    const frag = document.createDocumentFragment();
    list.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";
      card.appendChild(makeText("div", "card-title", state.lang === "ja" ? (item.nameJa || item.brand) : (item.nameEn || item.brand)));
      const meta = document.createElement("div");
      meta.className = "card-meta";
      meta.appendChild(makeText("span", "card-category", item.category || text("その他", "Other")));
      if (item.country) meta.appendChild(makeText("span", "card-country", item.country));
      card.appendChild(meta);
      card.appendChild(makeText("p", "card-note", item.note || text("公式マニュアル／サポート入口です。", "Official manual/support entry.")));
      card.appendChild(makeText("p", "card-hint", text(`検索ヒント：${getHint(item)}`, `Search hint: ${getHint(item)}`)));
      if (item.linkReview) card.appendChild(makeText("p", "card-audit", text("確認：公式入口として整理済み", "Checked: official entry normalized")));
      const links = document.createElement("div");
      links.className = "card-links";
      if (item.manualUrl) {
        const a = document.createElement("a");
        a.href = item.manualUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = text("公式マニュアル", "Official manuals");
        links.appendChild(a);
      }
      if (item.supportUrl) {
        const a = document.createElement("a");
        a.href = item.supportUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = text("サポートTOP", "Support portal");
        links.appendChild(a);
      }
      links.appendChild(makeText("span", "tag-official", text("公式サイト", "Official")));
      card.appendChild(links);
      frag.appendChild(card);
    });
    els.results.appendChild(frag);
  }

  function bindEvents() {
    if (els.searchInput) els.searchInput.addEventListener("input", () => applyFilter());
    if (els.categorySelect) els.categorySelect.addEventListener("change", () => applyFilter());
    if (els.quickButtons) {
      els.quickButtons.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button");
        if (!btn) return;
        const category = btn.getAttribute("data-category");
        const keyword = btn.getAttribute("data-keyword") || btn.getAttribute("data-brand") || "";
        if (category) {
          if (els.categorySelect) els.categorySelect.value = category;
          if (els.searchInput) els.searchInput.value = "";
          applyFilter();
        } else if (keyword) {
          if (els.searchInput) els.searchInput.value = keyword;
          if (els.categorySelect) els.categorySelect.value = "";
          applyFilter(keyword);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    bindEvents();
    loadManuals();
  });
})();
