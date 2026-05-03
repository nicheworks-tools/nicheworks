(function () {
  const isEnglishPath = /\/manual-finder\/en\/?/.test(window.location.pathname);
  const DATA_URL = isEnglishPath ? "../data/manuals.json" : "./data/manuals.json";

  const FALLBACK_MANUALS = [
    {
      brand: "Apple",
      nameJa: "Apple（アップル）",
      nameEn: "Apple",
      category: "PC・スマホ",
      country: "Global",
      manualUrl: "https://support.apple.com/ja-jp/docs",
      supportUrl: "https://support.apple.com/",
      note: "Mac / iPhone / iPad の公式マニュアル・仕様・サポート文書を確認できます。",
      hint: "iPhone 型番、MacBook モデル名、iPad 世代",
      tags: ["iphone", "ipad", "mac", "pc", "smartphone"]
    },
    {
      brand: "Sony",
      nameJa: "ソニー",
      nameEn: "Sony",
      category: "家電",
      country: "Japan",
      manualUrl: "https://www.sony.jp/support/manual.html",
      supportUrl: "https://www.sony.jp/support/",
      note: "テレビ・オーディオ・カメラなどの日本向け製品マニュアルを検索できます。",
      hint: "BRAVIA 型番、ヘッドホン型番、カメラ型番",
      tags: ["tv", "audio", "camera", "headphone"]
    },
    {
      brand: "Panasonic",
      nameJa: "パナソニック",
      nameEn: "Panasonic",
      category: "家電",
      country: "Japan",
      manualUrl: "https://panasonic.jp/support/manual.html",
      supportUrl: "https://panasonic.jp/support/",
      note: "生活家電・キッチン家電・AV機器などの取扱説明書を探せます。",
      hint: "洗濯機 型番、冷蔵庫 型番、LUMIX 型番",
      tags: ["home appliance", "camera", "washing machine"]
    },
    {
      brand: "Canon",
      nameJa: "キヤノン",
      nameEn: "Canon",
      category: "カメラ・映像",
      country: "Japan",
      manualUrl: "https://cam.start.canon/",
      supportUrl: "https://global.canon/en/support/",
      note: "EOS / PowerShot / ビデオカメラ等のオンラインマニュアルを確認できます。",
      hint: "EOS 型番、PowerShot 型番、レンズ名",
      tags: ["camera", "printer", "eos", "powershot"]
    },
    {
      brand: "Nikon",
      nameJa: "ニコン",
      nameEn: "Nikon",
      category: "カメラ・映像",
      country: "Japan",
      manualUrl: "https://downloadcenter.nikonimglib.com/",
      supportUrl: "https://www.nikonimgsupport.com/",
      note: "カメラ・レンズ・アクセサリーの説明書やファームウェアを検索できます。",
      hint: "Zシリーズ型番、Dシリーズ型番、レンズ名",
      tags: ["camera", "lens", "firmware"]
    },
    {
      brand: "Epson",
      nameJa: "エプソン",
      nameEn: "Epson",
      category: "プリンター・複合機",
      country: "Japan",
      manualUrl: "https://www.epson.jp/support/manual/",
      supportUrl: "https://www.epson.jp/support/",
      note: "プリンター・複合機の取扱説明書やユーザーズガイドを探せます。",
      hint: "EP / PX / EW から始まる型番",
      tags: ["printer", "scanner"]
    },
    {
      brand: "Brother",
      nameJa: "ブラザー工業",
      nameEn: "Brother",
      category: "プリンター・複合機",
      country: "Japan",
      manualUrl: "https://support.brother.co.jp/j/b/manualtop.aspx",
      supportUrl: "https://support.brother.co.jp/",
      note: "プリンター・複合機・ラベルライター等のマニュアルを検索できます。",
      hint: "DCP / MFC / HL / PT から始まる型番",
      tags: ["printer", "label", "scanner"]
    },
    {
      brand: "HP",
      nameJa: "日本HP",
      nameEn: "HP",
      category: "PC・スマホ",
      country: "Global",
      manualUrl: "https://support.hp.com/us-en/products",
      supportUrl: "https://support.hp.com/",
      note: "PC・プリンター製品ごとにマニュアル／ドキュメントを検索できます。",
      hint: "ノートPC型番、プリンター型番、シリアル番号",
      tags: ["pc", "printer", "laptop"]
    },
    {
      brand: "Dell",
      nameJa: "デル・テクノロジーズ",
      nameEn: "Dell",
      category: "PC・スマホ",
      country: "Global",
      manualUrl: "https://www.dell.com/support/home/en-us?app=manuals",
      supportUrl: "https://www.dell.com/support/home/",
      note: "サービスタグや製品名からマニュアル・仕様書を検索できます。",
      hint: "Service Tag、Inspiron / XPS / Latitude 型番",
      tags: ["pc", "laptop", "monitor"]
    },
    {
      brand: "Lenovo",
      nameJa: "レノボ・ジャパン",
      nameEn: "Lenovo",
      category: "PC・スマホ",
      country: "Global",
      manualUrl: "https://support.lenovo.com/us/en/documents",
      supportUrl: "https://support.lenovo.com/",
      note: "ThinkPad などPC／タブレット向けのマニュアル・ドキュメントを探せます。",
      hint: "ThinkPad 型番、IdeaPad 型番、シリアル番号",
      tags: ["pc", "laptop", "tablet"]
    }
  ];

  const CATEGORY_DERIVATION = [
    {
      category: "オーディオ",
      words: ["audio", "headphone", "speaker", "yamaha", "pioneer", "denon", "marantz", "bose", "jbl", "sennheiser", "audio-technica", "shure", "オーディオ", "ヘッドホン", "スピーカー", "マイク"]
    },
    {
      category: "ゲーム",
      words: ["game", "nintendo", "playstation", "xbox", "switch", "ゲーム", "任天堂", "プレイステーション"]
    },
    {
      category: "ネットワーク機器",
      words: ["router", "wi-fi", "wifi", "network", "tp-link", "netgear", "buffalo", "ルーター", "ネットワーク", "無線lan"]
    }
  ];

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

  function text(ja, en) {
    return state.lang === "ja" ? ja : en;
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function collectSearchParts(item) {
    const parts = [
      item.brand,
      item.nameJa,
      item.nameEn,
      item.category,
      item.country,
      item.note,
      item.hint
    ];
    if (Array.isArray(item.tags)) parts.push(item.tags.join(" "));
    return parts.filter(Boolean).join(" ").toLowerCase();
  }

  function getDerivedCategory(item) {
    const haystack = collectSearchParts(item);
    const found = CATEGORY_DERIVATION.find((rule) =>
      rule.words.some((word) => haystack.includes(word.toLowerCase()))
    );
    return found ? found.category : "";
  }

  function getCategoryLabels(item) {
    const labels = [];
    if (item.category) labels.push(item.category);
    const derived = getDerivedCategory(item);
    if (derived && !labels.includes(derived)) labels.push(derived);
    return labels;
  }

  function getDisplayCategory(item) {
    const labels = getCategoryLabels(item);
    if (!labels.length) return text("その他", "Other");
    return labels.join(" / ");
  }

  function getHint(item) {
    if (item.hint) return item.hint;
    const brand = item.brand || item.nameJa || item.nameEn || "";
    const category = getDerivedCategory(item) || item.category || "";
    if (category === "プリンター・複合機") return `${brand} 型番、プリンター型番、製品名`;
    if (category === "カメラ・映像") return `${brand} 型番、カメラ型番、レンズ名`;
    if (category === "PC・スマホ") return `${brand} 型番、モデル名、シリアル番号`;
    if (category === "家電") return `${brand} 型番、製品名、シリーズ名`;
    if (category === "オーディオ") return `${brand} 型番、製品名、シリーズ名`;
    if (category === "ゲーム") return `${brand} 本体名、型番、周辺機器名`;
    if (category === "ネットワーク機器") return `${brand} ルーター型番、製品名`;
    return `${brand} 型番、製品名、シリーズ名`;
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
      if (!code) return;
      el.hidden = code !== lang;
    });

    els.langButtons.forEach((btn) => {
      const code = btn.getAttribute("data-lang");
      btn.classList.toggle("active", code === lang);
    });

    updateStatusMessage();
    render();
  }

  function initLang() {
    const saved = window.localStorage
      ? window.localStorage.getItem("manualfinder_lang")
      : null;

    const navLang = (navigator.language || "").toLowerCase();
    const initial = isEnglishPath ? "en" : (saved || (navLang.startsWith("ja") ? "ja" : "en"));

    applyLang(initial);

    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (!lang || lang === state.lang) return;
        applyLang(lang);
        if (window.localStorage) {
          window.localStorage.setItem("manualfinder_lang", lang);
        }
      });
    });
  }

  function loadManuals() {
    setStatus("loading", "データを読み込み中です...", "Loading manual directory...");

    fetch(DATA_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed to load manuals.json");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("manuals.json is not an array");
        }
        state.manuals = data;
        setStatus("ready", "", "");
        applyFilter();
      })
      .catch((err) => {
        console.error(err);
        state.manuals = FALLBACK_MANUALS;
        setStatus(
          "fallback",
          "データ読み込みに失敗しました。主要メーカーの最小リストを表示しています。",
          "Could not load the full directory. Showing a fallback list of major brands."
        );
        applyFilter();
      });
  }

  function applyFilter(forcedKeyword) {
    const keywordRaw = normalizeText(els.searchInput ? els.searchInput.value : "");
    const keyword = forcedKeyword ? normalizeText(forcedKeyword) : keywordRaw;
    const category = els.categorySelect ? els.categorySelect.value : "";

    let list = state.manuals.slice();

    if (keyword) {
      list = list.filter((item) => collectSearchParts(item).includes(keyword));
    }

    if (category) {
      list = list.filter((item) => getCategoryLabels(item).includes(category));
    }

    state.filtered = list;
    render();
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

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = state.lang === "ja"
        ? (item.nameJa || item.brand || item.nameEn || "")
        : (item.nameEn || item.brand || item.nameJa || "");
      card.appendChild(title);

      const metaLine = document.createElement("div");
      metaLine.className = "card-meta";

      const cat = document.createElement("span");
      cat.className = "card-category";
      cat.textContent = getDisplayCategory(item);
      metaLine.appendChild(cat);

      if (item.country) {
        const country = document.createElement("span");
        country.className = "card-country";
        country.textContent = item.country;
        metaLine.appendChild(country);
      }
      card.appendChild(metaLine);

      if (item.note) {
        const note = document.createElement("p");
        note.className = "card-note";
        note.textContent = item.note;
        card.appendChild(note);
      }

      const hint = document.createElement("p");
      hint.className = "card-hint";
      hint.textContent = text(`検索ヒント：${getHint(item)}`, `Search hint: ${getHint(item)}`);
      card.appendChild(hint);

      const links = document.createElement("div");
      links.className = "card-links";

      if (item.manualUrl) {
        const aManual = document.createElement("a");
        aManual.href = item.manualUrl;
        aManual.target = "_blank";
        aManual.rel = "noopener noreferrer";
        aManual.textContent = text("公式マニュアル", "Official manuals");
        links.appendChild(aManual);
      }

      if (item.supportUrl) {
        const aSupport = document.createElement("a");
        aSupport.href = item.supportUrl;
        aSupport.target = "_blank";
        aSupport.rel = "noopener noreferrer";
        aSupport.textContent = text("サポートTOP", "Support portal");
        links.appendChild(aSupport);
      }

      const tag = document.createElement("span");
      tag.className = "tag-official";
      tag.textContent = text("公式サイト", "Official");
      links.appendChild(tag);

      card.appendChild(links);
      frag.appendChild(card);
    });

    els.results.appendChild(frag);
  }

  function bindEvents() {
    if (els.searchInput) {
      els.searchInput.addEventListener("input", () => applyFilter());
    }
    if (els.categorySelect) {
      els.categorySelect.addEventListener("change", () => applyFilter());
    }
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
          return;
        }

        if (keyword) {
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
