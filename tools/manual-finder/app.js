(function () {
  const state = {
    manuals: [],
    filtered: [],
    lang: "ja",
  };

  const els = {
    results: document.getElementById("results"),
    resultCount: document.getElementById("resultCount"),
    emptyJa: document.getElementById("emptyMessage"),
    emptyEn: document.getElementById("emptyMessageEn"),
    searchInput: document.getElementById("searchInput"),
    categorySelect: document.getElementById("categorySelect"),
    quickButtons: document.getElementById("quickButtons"),
    langButtons: document.querySelectorAll(".nw-lang-switch button"),
    i18nNodes: document.querySelectorAll("[data-i18n]"),
  };

  // ==============================
  // 言語切替
  // ==============================
  function applyLang(lang) {
    state.lang = lang;

    // data-i18n の表示切替
    els.i18nNodes.forEach((el) => {
      const code = el.getAttribute("data-i18n");
      if (!code) return;
      el.style.display = code === lang ? "" : "none";
    });

    // ボタンのアクティブ状態
    els.langButtons.forEach((btn) => {
      const code = btn.getAttribute("data-lang");
      btn.classList.toggle("active", code === lang);
    });

    // 再描画（リンク文言などを言語に合わせる）
    render();
  }

  function initLang() {
    // ブラウザの設定から初期言語をざっくり決める
    const navLang = (navigator.language || "").toLowerCase();
    const initial = navLang.startsWith("ja") ? "ja" : "en";

    applyLang(initial);

    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (!lang || lang === state.lang) return;
        applyLang(lang);
      });
    });
  }

  // ==============================
  // データ読み込み
  // ==============================
  function loadManuals() {
    fetch("./data/manuals.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed to load manuals.json");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("manuals.json is not an array");
        }
        state.manuals = data;
        applyFilter();
      })
      .catch((err) => {
        console.error(err);
        if (els.results) {
          els.results.innerHTML =
            '<div class="empty-message">manuals.json の読み込みに失敗しました。パスまたはJSON構造を確認してください。</div>';
        }
        if (els.resultCount) els.resultCount.textContent = "0";
      });
  }

  // ==============================
  // フィルタ処理
  // ==============================
  function applyFilter(quickBrand) {
    const keywordRaw = (els.searchInput.value || "").trim().toLowerCase();
    const keyword = quickBrand
      ? String(quickBrand).trim().toLowerCase()
      : keywordRaw;
    const category = els.categorySelect.value;

    let list = state.manuals.slice();

    if (keyword) {
      list = list.filter((item) => {
        const parts = [
          item.brand || "",
          item.nameJa || "",
          item.nameEn || "",
          item.category || "",
          item.country || "",
        ];
        if (Array.isArray(item.tags)) {
          parts.push(item.tags.join(" "));
        }
        const haystack = parts.join(" ").toLowerCase();
        return haystack.includes(keyword);
      });
    }

    if (category) {
      list = list.filter((item) => item.category === category);
    }

    state.filtered = list;
    render();
  }

  // ==============================
  // 描画
  // ==============================
  function render() {
    if (!els.results || !els.resultCount) return;

    const list = state.filtered || [];
    els.results.innerHTML = "";

    // 空メッセージ切り替え
    if (!list.length) {
      if (els.emptyJa) els.emptyJa.hidden = state.lang !== "ja";
      if (els.emptyEn) els.emptyEn.hidden = state.lang !== "en";
      els.resultCount.textContent = "0";
      return;
    } else {
      if (els.emptyJa) els.emptyJa.hidden = true;
      if (els.emptyEn) els.emptyEn.hidden = true;
    }

    // 件数は数値のみ
    els.resultCount.textContent = String(list.length);

    const frag = document.createDocumentFragment();

    list.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      // タイトル：言語に応じて nameJa / nameEn / brand を出し分け
      const title = document.createElement("div");
      title.className = "card-title";

      if (state.lang === "ja") {
        title.textContent =
          item.nameJa ||
          item.brand ||
          item.nameEn ||
          ""; /* 日本語があれば優先 */
      } else {
        title.textContent =
          item.nameEn ||
          item.brand ||
          item.nameJa ||
          ""; /* 英語があれば優先 */
      }

      card.appendChild(title);

      // カテゴリ＋国
      const metaLine = document.createElement("div");

      if (item.category) {
        const cat = document.createElement("span");
        cat.className = "card-category";
        cat.textContent = item.category;
        metaLine.appendChild(cat);
      }

      if (item.country) {
        const country = document.createElement("span");
        country.style.marginLeft = "8px";
        country.style.fontSize = "0.8rem";
        country.style.opacity = "0.7";
        country.textContent = item.country;
        metaLine.appendChild(country);
      }

      card.appendChild(metaLine);

      // 補足テキスト
      if (item.note) {
        const note = document.createElement("p");
        note.style.fontSize = "0.85rem";
        note.style.marginTop = "6px";
        note.style.marginBottom = "6px";
        note.style.opacity = "0.9";
        note.textContent = item.note;
        card.appendChild(note);
      }

      // リンク
      const links = document.createElement("div");
      links.className = "card-links";

      if (item.manualUrl) {
        const aManual = document.createElement("a");
        aManual.href = item.manualUrl;
        aManual.target = "_blank";
        aManual.rel = "noopener noreferrer";
        aManual.textContent =
          state.lang === "ja" ? "マニュアル" : "Manuals";
        links.appendChild(aManual);
      }

      if (item.supportUrl) {
        const aSupport = document.createElement("a");
        aSupport.href = item.supportUrl;
        aSupport.target = "_blank";
        aSupport.rel = "noopener noreferrer";
        aSupport.textContent =
          state.lang === "ja" ? "サポートTOP" : "Support";
        links.appendChild(aSupport);
      }

      card.appendChild(links);

      frag.appendChild(card);
    });

    els.results.appendChild(frag);
  }

  // ==============================
  // イベント設定
  // ==============================
  function bindEvents() {
    if (els.searchInput) {
      els.searchInput.addEventListener("input", () => applyFilter());
    }
    if (els.categorySelect) {
      els.categorySelect.addEventListener("change", () => applyFilter());
    }
    if (els.quickButtons) {
      els.quickButtons.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-brand]");
        if (!btn) return;
        const brand = btn.getAttribute("data-brand") || "";
        els.searchInput.value = brand;
        applyFilter(brand);
      });
    }
  }

  // ==============================
  // init
  // ==============================
  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    bindEvents();
    loadManuals();
  });
})();
