let MUNICIPALITIES = [];
let currentLang = "ja";

const TEXT = {
  ja: {
    searchButton: "検索する",
    resetButton: "条件クリア",
    placeholder: "例：分別、カレンダー、粗大ごみ",
    allOption: "すべて / All",
    loading: "読み込み中",
    count: (n) => `登録自治体数：${n}件（拡充中）`,
    found: (n) => `該当自治体：${n}件`,
    noResult: "該当する自治体が見つかりませんでした。都道府県のみ、またはキーワードなしで再検索してください。",
    loadError: "データの読み込みに失敗しました。時間をおいて再度お試しください。",
    conditionAll: "現在の条件：すべて",
    condition: ({ pref, city, keyword }) => {
      const parts = [];
      if (pref) parts.push(`都道府県：${pref}`);
      if (city) parts.push(`市区町村：${city}`);
      if (keyword) parts.push(`キーワード：${keyword}`);
      return parts.length ? `現在の条件：${parts.join(" / ")}` : "現在の条件：すべて";
    },
    openOfficial: "公式ページを開く",
    external: "外部サイト",
    officialNote: "最新の分別ルール・収集日・粗大ごみ情報はリンク先の自治体公式サイトで確認してください。",
    urlLabel: "URL",
    emptyTitle: "見つかりませんでした",
    emptyHint: "都道府県だけを選ぶ、またはキーワードを空にして再検索してください。"
  },
  en: {
    searchButton: "Search",
    resetButton: "Reset",
    placeholder: "e.g. sorting, calendar, bulky waste",
    allOption: "All",
    loading: "Loading",
    count: (n) => `Registered municipalities: ${n} (expanding)`,
    found: (n) => `${n} results`,
    noResult: "No matching municipality found. Try selecting only a prefecture or removing the keyword.",
    loadError: "Failed to load data. Please try again later.",
    conditionAll: "Current filters: All",
    condition: ({ pref, city, keyword }) => {
      const parts = [];
      if (pref) parts.push(`Prefecture: ${pref}`);
      if (city) parts.push(`Municipality: ${city}`);
      if (keyword) parts.push(`Keyword: ${keyword}`);
      return parts.length ? `Current filters: ${parts.join(" / ")}` : "Current filters: All";
    },
    openOfficial: "Open official page",
    external: "External site",
    officialNote: "Confirm the latest sorting rules, pickup dates, and bulky waste information on the official municipal site.",
    urlLabel: "URL",
    emptyTitle: "No results found",
    emptyHint: "Try selecting only a prefecture or clearing the keyword."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const prefSelect = document.getElementById("prefSelect");
  const citySelect = document.getElementById("citySelect");
  const keywordInput = document.getElementById("keywordInput");
  const searchButton = document.getElementById("searchButton");
  const resetButton = document.getElementById("resetButton");
  const resultsEl = document.getElementById("results");
  const summaryEl = document.getElementById("resultSummary");
  const conditionEl = document.getElementById("currentConditions");
  const municipalityCount = document.getElementById("municipalityCount");
  const municipalityCountEn = document.getElementById("municipalityCountEn");

  initI18n({ keywordInput, searchButton, resetButton, resultsEl, summaryEl, conditionEl });

  loadMunicipalities()
    .then((data) => {
      MUNICIPALITIES = normalizeMunicipalities(data);
      initPrefOptions(prefSelect, MUNICIPALITIES);
      if (municipalityCount) municipalityCount.textContent = `${MUNICIPALITIES.length}件（拡充中）`;
      if (municipalityCountEn) municipalityCountEn.textContent = `${MUNICIPALITIES.length} (expanding)`;
      updateConditions({ prefSelect, citySelect, keywordInput, conditionEl });
      renderResults(MUNICIPALITIES, resultsEl, summaryEl);
    })
    .catch((e) => {
      console.error(e);
      summaryEl.textContent = TEXT[currentLang].loadError;
      resultsEl.innerHTML = "";
    });

  prefSelect.addEventListener("change", () => {
    updateCityOptions(prefSelect, citySelect, MUNICIPALITIES);
    runSearch({ prefSelect, citySelect, keywordInput, resultsEl, summaryEl, conditionEl });
  });

  citySelect.addEventListener("change", () => {
    runSearch({ prefSelect, citySelect, keywordInput, resultsEl, summaryEl, conditionEl });
  });

  searchButton.addEventListener("click", () => {
    runSearch({ prefSelect, citySelect, keywordInput, resultsEl, summaryEl, conditionEl });
  });

  keywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchButton.click();
    }
  });

  resetButton.addEventListener("click", () => {
    prefSelect.value = "";
    citySelect.innerHTML = `<option value="">${TEXT[currentLang].allOption}</option>`;
    citySelect.disabled = true;
    keywordInput.value = "";
    updateConditions({ prefSelect, citySelect, keywordInput, conditionEl });
    renderResults(MUNICIPALITIES, resultsEl, summaryEl);
  });

  document.querySelectorAll(".quick-pref").forEach((button) => {
    button.addEventListener("click", () => {
      const pref = button.dataset.pref || "";
      prefSelect.value = pref;
      updateCityOptions(prefSelect, citySelect, MUNICIPALITIES);
      citySelect.value = "";
      runSearch({ prefSelect, citySelect, keywordInput, resultsEl, summaryEl, conditionEl });
    });
  });
});

function loadMunicipalities() {
  const fetchJson = (path, required = false) => fetch(path, { cache: "no-store" }).then((r) => {
    if (!r.ok) {
      if (required) throw new Error(`${path}: HTTP ${r.status}`);
      return [];
    }
    return r.json();
  }).then((data) => Array.isArray(data) ? data : []);

  return Promise.all([
    fetchJson("data/municipalities.json", true),
    fetchJson("data/municipalities-extra.json", false)
  ]).then(([base, extra]) => base.concat(extra));
}

function normalizeMunicipalities(data) {
  const seen = new Set();
  const prefOrder = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];
  const prefRank = new Map(prefOrder.map((pref, index) => [pref, index]));

  return data
    .filter((x) => x && x.pref && x.city && x.url)
    .filter((x) => {
      const key = `${x.pref}::${x.city}::${x.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const prefDiff = (prefRank.get(a.pref) ?? 999) - (prefRank.get(b.pref) ?? 999);
      if (prefDiff !== 0) return prefDiff;
      return String(a.city).localeCompare(String(b.city), "ja");
    });
}

function initI18n(elements) {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const keyedNodes = document.querySelectorAll("[data-i18n-key]");
  const browser = (navigator.language || "").toLowerCase();
  currentLang = browser.startsWith("ja") ? "ja" : "en";

  const apply = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;

    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    keyedNodes.forEach((el) => {
      const key = el.dataset.i18nKey;
      if (TEXT[lang][key]) el.textContent = TEXT[lang][key];
    });

    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));

    if (elements.keywordInput) elements.keywordInput.placeholder = TEXT[lang].placeholder;
    if (elements.conditionEl) elements.conditionEl.textContent = TEXT[lang].conditionAll;

    if (MUNICIPALITIES.length && elements.resultsEl && elements.summaryEl) {
      const prefSelect = document.getElementById("prefSelect");
      const citySelect = document.getElementById("citySelect");
      const keywordInput = document.getElementById("keywordInput");
      updateSelectPlaceholders(prefSelect, citySelect);
      runSearch({ prefSelect, citySelect, keywordInput, resultsEl: elements.resultsEl, summaryEl: elements.summaryEl, conditionEl: elements.conditionEl });
    }
  };

  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.lang)));
  apply(currentLang);
}

function updateSelectPlaceholders(prefSelect, citySelect) {
  if (prefSelect && prefSelect.options.length) prefSelect.options[0].textContent = TEXT[currentLang].allOption;
  if (citySelect && citySelect.options.length) citySelect.options[0].textContent = TEXT[currentLang].allOption;
}

function initPrefOptions(selectEl, data) {
  selectEl.innerHTML = `<option value="">${TEXT[currentLang].allOption}</option>`;
  const prefs = Array.from(new Set(data.map((x) => x.pref).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ja"));
  prefs.forEach((pref) => {
    const opt = document.createElement("option");
    opt.value = pref;
    opt.textContent = pref;
    selectEl.appendChild(opt);
  });
}

function updateCityOptions(prefSelect, citySelect, data) {
  const pref = prefSelect.value;
  const cities = data.filter((x) => !pref || x.pref === pref).map((x) => x.city).filter(Boolean);
  const unique = Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, "ja"));
  citySelect.innerHTML = `<option value="">${TEXT[currentLang].allOption}</option>`;
  if (unique.length === 0) {
    citySelect.disabled = true;
    return;
  }
  unique.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
  citySelect.disabled = false;
}

function runSearch({ prefSelect, citySelect, keywordInput, resultsEl, summaryEl, conditionEl }) {
  const filtered = filterMunicipalities({ pref: prefSelect.value, city: citySelect.value, keyword: keywordInput.value });
  updateConditions({ prefSelect, citySelect, keywordInput, conditionEl });
  renderResults(filtered, resultsEl, summaryEl);
}

function updateConditions({ prefSelect, citySelect, keywordInput, conditionEl }) {
  if (!conditionEl) return;
  conditionEl.textContent = TEXT[currentLang].condition({ pref: prefSelect.value, city: citySelect.value, keyword: keywordInput.value.trim() });
}

function filterMunicipalities({ pref, city, keyword }) {
  const kw = (keyword || "").trim().toLowerCase();
  return MUNICIPALITIES.filter((x) => {
    if (pref && x.pref !== pref) return false;
    if (city && x.city !== city) return false;
    if (!kw) return true;
    const hay = [x.pref || "", x.city || "", x.name || "", x.type || "", x.url || ""].join(" ").toLowerCase();
    return hay.includes(kw);
  });
}

function getTypeLabel(type, lang) {
  const value = String(type || "").toLowerCase();
  if (value.includes("calendar") || value.includes("カレンダー")) return lang === "ja" ? "収集カレンダー" : "Pickup calendar";
  if (value.includes("bulky") || value.includes("粗大")) return lang === "ja" ? "粗大ごみ" : "Bulky waste";
  if (value.includes("search") || value.includes("検索")) return lang === "ja" ? "検索ページ" : "Search page";
  if (value.includes("top") || value.includes("トップ")) return lang === "ja" ? "自治体トップ" : "Municipal top page";
  return lang === "ja" ? "自治体公式ページ" : "Official municipal page";
}

function renderResults(list, container, summaryEl) {
  container.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    summaryEl.textContent = TEXT[currentLang].noResult;
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const title = document.createElement("p");
    title.className = "empty-title";
    title.textContent = TEXT[currentLang].emptyTitle;
    const hint = document.createElement("p");
    hint.className = "empty-hint";
    hint.textContent = TEXT[currentLang].emptyHint;
    empty.appendChild(title);
    empty.appendChild(hint);
    container.appendChild(empty);
    return;
  }

  summaryEl.textContent = TEXT[currentLang].found(list.length);

  list.forEach((x) => {
    const card = document.createElement("div");
    card.className = "result-card";
    const title = document.createElement("p");
    title.className = "result-title";
    title.textContent = `${x.pref || ""} ${x.city || ""}`.trim();
    const meta = document.createElement("p");
    meta.className = "result-meta";
    meta.textContent = x.name || getTypeLabel(x.type, currentLang);
    const tag = document.createElement("span");
    tag.className = "result-tag";
    tag.textContent = getTypeLabel(x.type, currentLang);
    const note = document.createElement("p");
    note.className = "result-note";
    note.textContent = TEXT[currentLang].officialNote;
    const link = document.createElement("a");
    link.className = "result-button";
    link.href = x.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = TEXT[currentLang].openOfficial;
    const external = document.createElement("span");
    external.className = "external-label";
    external.textContent = TEXT[currentLang].external;
    link.appendChild(external);
    const url = document.createElement("p");
    url.className = "result-url";
    url.textContent = `${TEXT[currentLang].urlLabel}: ${x.url || ""}`;
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(tag);
    card.appendChild(note);
    card.appendChild(link);
    card.appendChild(url);
    container.appendChild(card);
  });
}
