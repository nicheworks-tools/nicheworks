let MUNICIPALITIES = [];

document.addEventListener("DOMContentLoaded", () => {
  const prefSelect = document.getElementById("prefSelect");
  const citySelect = document.getElementById("citySelect");
  const keywordInput = document.getElementById("keywordInput");
  const searchButton = document.getElementById("searchButton");
  const resetButton = document.getElementById("resetButton");
  const resultsEl = document.getElementById("results");
  const summaryEl = document.getElementById("resultSummary");

  initI18n();

  fetch("data/municipalities.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((data) => {
      MUNICIPALITIES = Array.isArray(data) ? data : [];
      initPrefOptions(prefSelect, MUNICIPALITIES);
      summaryEl.textContent = `登録自治体数：${MUNICIPALITIES.length}件（拡充中）`;
      renderResults(MUNICIPALITIES, resultsEl, summaryEl);
    })
    .catch((e) => {
      console.error(e);
      summaryEl.textContent = "データの読み込みに失敗しました。時間をおいて再度お試しください。";
    });

  prefSelect.addEventListener("change", () => {
    updateCityOptions(prefSelect, citySelect, MUNICIPALITIES);
  });

  searchButton.addEventListener("click", () => {
    const filtered = filterMunicipalities({
      pref: prefSelect.value,
      city: citySelect.value,
      keyword: keywordInput.value,
    });
    renderResults(filtered, resultsEl, summaryEl);
  });

  keywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchButton.click();
    }
  });

  resetButton.addEventListener("click", () => {
    prefSelect.value = "";
    citySelect.innerHTML = `<option value="">すべて / All</option>`;
    citySelect.disabled = true;
    keywordInput.value = "";
    renderResults(MUNICIPALITIES, resultsEl, summaryEl);
  });

  initDonateFloat();
});

function initI18n() {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browser = (navigator.language || "").toLowerCase();
  let current = browser.startsWith("ja") ? "ja" : "en";
  const apply = (lang) => {
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    current = lang;
  };
  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.lang)));
  apply(current);
}

function initDonateFloat() {
  const float = document.getElementById("nw-donate-float");
  if (!float) return;
  const key = "nw_donate_float_seen";
  if (localStorage.getItem(key) === "1") return;
  const showAt = 800;
  window.addEventListener("scroll", () => {
    if (window.scrollY > showAt && float.style.display !== "inline-flex") {
      float.style.display = "inline-flex";
    }
  });
  float.addEventListener("click", (e) => {
    if (e.target.classList.contains("nw-donate-close")) {
      localStorage.setItem(key, "1");
      float.style.display = "none";
      return;
    }
    const t = document.querySelector(".nw-donate");
    if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
    localStorage.setItem(key, "1");
    float.style.display = "none";
  });
}

function initPrefOptions(selectEl, data) {
  const prefs = Array.from(new Set(data.map((x) => x.pref).filter(Boolean))).sort((a,b)=>a.localeCompare(b,"ja"));
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
  const unique = Array.from(new Set(cities)).sort((a,b)=>a.localeCompare(b,"ja"));
  citySelect.innerHTML = `<option value="">すべて / All</option>`;
  if (unique.length === 0) { citySelect.disabled = true; return; }
  unique.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
  citySelect.disabled = false;
}

function filterMunicipalities({ pref, city, keyword }) {
  const kw = (keyword||"").trim().toLowerCase();
  return MUNICIPALITIES.filter((x) => {
    if (pref && x.pref !== pref) return false;
    if (city && x.city !== city) return false;
    if (!kw) return true;
    const hay = [x.pref||"",x.city||"",x.name||"",x.type||"",x.url||""].join(" ").toLowerCase();
    return hay.includes(kw);
  });
}

function renderResults(list, container, summaryEl) {
  container.innerHTML = "";
  if (!Array.isArray(list) || list.length===0) {
    summaryEl.textContent = "該当する自治体が見つかりませんでした。条件を変えてお試しください。";
    return;
  }
  summaryEl.textContent = `該当自治体：${list.length}件`;
  list.forEach((x) => {
    const card = document.createElement("div");
    card.className = "result-card";
    const title = document.createElement("p");
    title.className = "result-title";
    title.textContent = `${x.pref} ${x.city}`;
    const meta = document.createElement("p");
    meta.className = "result-meta";
    meta.textContent = x.name || "公式ごみ情報";
    const tag = document.createElement("div");
    tag.className = "result-tag";
    tag.textContent = x.type || "公式ごみ情報";
    const linkP = document.createElement("p");
    linkP.className = "result-link";
    const a = document.createElement("a");
    a.href = x.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = x.url;
    linkP.appendChild(a);
    card.appendChild(title);card.appendChild(meta);card.appendChild(tag);card.appendChild(linkP);
    container.appendChild(card);
  });
}
