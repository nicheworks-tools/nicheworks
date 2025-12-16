// tools/dry-meter/app.js
(() => {
  "use strict";

  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const STORAGE_KEY = "nw_drymeter_v1";

  const round1 = (n) => Math.round(n * 10) / 10;

  // ---------- elements ----------
  const langButtons = $$(".nw-lang-switch button");
  const i18nNodes = $$("[data-i18n]");

  const tempEl = $("#temp");
  const humidityEl = $("#humidity");
  const windEl = $("#wind");

  const tempOut = $("#tempOut");
  const humidityOut = $("#humidityOut");
  const windOut = $("#windOut");

  const resultCard = $("#resultCard");
  const scoreNum = $("#scoreNum");
  const statusText = $("#statusText");
  const commentText = $("#commentText");

  const targetBtns = $$(".segmented .seg[data-target]");
  const dryBtns = $$(".segmented .seg[data-dry]");

  // ---------- state ----------
  const defaultState = {
    lang: null,            // auto
    target: "laundry",     // laundry | bedding
    drying: "outdoor",     // outdoor | indoor
    temp: 22,
    humidity: 58,
    wind: 3.2
  };

  let state = { ...defaultState };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      // whitelist keys
      state = {
        ...state,
        lang: typeof parsed.lang === "string" ? parsed.lang : null,
        target: parsed.target === "bedding" ? "bedding" : "laundry",
        drying: parsed.drying === "indoor" ? "indoor" : "outdoor",
        temp: clamp(Number(parsed.temp ?? state.temp), 0, 40),
        humidity: clamp(Number(parsed.humidity ?? state.humidity), 30, 100),
        wind: clamp(Number(parsed.wind ?? state.wind), 0, 10)
      };
      // normalize wind to 0.1 step
      state.wind = round1(state.wind);
    } catch {
      // ignore
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  // ---------- i18n ----------
  function detectLang() {
    const browser = (navigator.language || "").toLowerCase();
    return browser.startsWith("ja") ? "ja" : "en";
  }

  function applyLang(lang) {
    i18nNodes.forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons.forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    state.lang = lang;
    saveState();
  }

  // ---------- segmented controls ----------
  function setActive(btns, matchFn) {
    btns.forEach((b) => {
      const on = matchFn(b);
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function applySegmentedUI() {
    setActive(targetBtns, (b) => b.dataset.target === state.target);
    setActive(dryBtns, (b) => b.dataset.dry === state.drying);
  }

  // ---------- inputs UI ----------
  function applyInputsUI() {
    tempEl.value = String(state.temp);
    humidityEl.value = String(state.humidity);
    windEl.value = String(state.wind);

    tempOut.textContent = String(state.temp);
    humidityOut.textContent = String(state.humidity);
    // keep one decimal for wind
    windOut.textContent = (Math.round(state.wind) === state.wind) ? String(state.wind) : state.wind.toFixed(1);
  }

  // ---------- scoring logic ----------
  function computeDryScore({ temp, humidity, wind, target, drying }) {
    // base scoring (0–100)
    const tempScore = clamp(((temp - 5) / 25) * 40, 0, 40);
    const humidityScore = clamp(((100 - humidity) / 70) * 40, 0, 40);
    const windScore = clamp((wind / 5) * 20, 0, 20);

    let score = tempScore + humidityScore + windScore;

    // target adjustment
    if (target === "bedding") score -= 15;

    // drying method adjustment
    if (drying === "indoor") score -= 10;

    score = Math.round(clamp(score, 0, 100));

    let band = "bad";
    if (score >= 70) band = "good";
    else if (score >= 40) band = "ok";

    return { score, band };
  }

  function labelsForBand(band, lang) {
    const ja = {
      good: { status: "よく乾く", outdoor: "今日は外干し向きです。", indoor: "部屋干しでも乾きやすいです。" },
      ok:   { status: "普通",     outdoor: "工夫すれば乾きます。",     indoor: "部屋干しは工夫が必要です。" },
      bad:  { status: "乾きにくい", outdoor: "乾燥には不向きです。",   indoor: "部屋干しは避けた方が無難です。" }
    };
    const en = {
      good: { status: "Dries well", outdoor: "Great day for outdoor drying.", indoor: "Drying indoors should be fine." },
      ok:   { status: "Average",    outdoor: "Drying is possible with care.",  indoor: "Indoor drying may need help." },
      bad:  { status: "Hard to dry",outdoor: "Not suitable for drying today.", indoor: "Indoor drying is not recommended." }
    };
    return (lang === "ja" ? ja : en)[band];
  }

  function renderResult() {
    const { score, band } = computeDryScore(state);
    scoreNum.textContent = String(score);

    // update card class
    resultCard.classList.remove("status-good", "status-ok", "status-bad");
    resultCard.classList.add(band === "good" ? "status-good" : band === "ok" ? "status-ok" : "status-bad");

    // update status & comment (keep both languages nodes structure intact)
    const lang = state.lang || detectLang();
    const pack = labelsForBand(band, lang);

    // statusText contains two spans; show/hide via i18n already, but we also set text for robustness
    const jaSpanS = $(`[data-i18n="ja"]`, statusText);
    const enSpanS = $(`[data-i18n="en"]`, statusText);
    if (jaSpanS) jaSpanS.textContent = (band === "good" ? "よく乾く" : band === "ok" ? "普通" : "乾きにくい");
    if (enSpanS) enSpanS.textContent = (band === "good" ? "Dries well" : band === "ok" ? "Average" : "Hard to dry");

    const jaSpanC = $(`[data-i18n="ja"]`, commentText);
    const enSpanC = $(`[data-i18n="en"]`, commentText);

    const key = state.drying === "indoor" ? "indoor" : "outdoor";
    if (jaSpanC) jaSpanC.textContent = labelsForBand(band, "ja")[key];
    if (enSpanC) enSpanC.textContent = labelsForBand(band, "en")[key];

    // persist
    saveState();
  }

  // ---------- events ----------
  function bindEvents() {
    // language
    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });

    // segmented: target
    targetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.target = btn.dataset.target === "bedding" ? "bedding" : "laundry";
        applySegmentedUI();
        renderResult();
      });
    });

    // segmented: drying
    dryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.drying = btn.dataset.dry === "indoor" ? "indoor" : "outdoor";
        applySegmentedUI();
        renderResult();
      });
    });

    // sliders
    tempEl.addEventListener("input", () => {
      state.temp = clamp(parseInt(tempEl.value, 10), 0, 40);
      tempOut.textContent = String(state.temp);
      renderResult();
    });

    humidityEl.addEventListener("input", () => {
      state.humidity = clamp(parseInt(humidityEl.value, 10), 30, 100);
      humidityOut.textContent = String(state.humidity);
      renderResult();
    });

    windEl.addEventListener("input", () => {
      state.wind = round1(clamp(parseFloat(windEl.value), 0, 10));
      windOut.textContent = (Math.round(state.wind) === state.wind) ? String(state.wind) : state.wind.toFixed(1);
      renderResult();
    });
  }

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded", () => {
    loadState();

    // initial lang: stored or auto
    const initialLang = (state.lang === "ja" || state.lang === "en") ? state.lang : detectLang();
    applyLang(initialLang);

    applySegmentedUI();
    applyInputsUI();
    bindEvents();
    renderResult();
  });
})();
