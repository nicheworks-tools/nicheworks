const HISTORY_KEY = "unitmaster_history";
const THEME_KEY = "unitmaster_theme";
const LANG_KEY = "unitmaster_lang";
const MAX_ABS_VALUE = 1e100;
const HISTORY_DEBOUNCE_MS = 900;

const labels = {
  ja: {
    title: "UnitMaster",
    subtitle: "長さ・重さ・温度・体積・面積・速度・圧力の単位を相互変換するツールです。",
    howto_title: "使い方",
    howto_1: "カテゴリを選択します。",
    howto_2: "数値を入力します。",
    howto_3: "変換元と変換先の単位を選択します。",
    howto_4: "自動計算ON/OFFを切り替えます。",
    howto_5: "OFF時は「計算する」ボタンで実行します。",
    notice_title: "計算結果について",
    notice_general: "このツールは一般的な換算係数に基づく目安です。",
    notice_professional: "医療、工業設計、建築、契約、取引、法規制、研究用途では、公式規格・専門資料・測定条件を確認してください。",
    notice_traditional: "尺貫法・伝統単位は、時代・地域・用途により値が異なる場合があります。このページでは代表的な近似値として扱います。",
    notice_rounding: "表示桁数の都合で端数処理・丸め誤差が生じる場合があります。",
    storage_title: "保存について",
    storage_body: "変換履歴5件、テーマ設定、言語設定はこのブラウザのlocalStorageに保存されます。別端末には同期されず、ブラウザデータを削除すると消えます。",
    category_label: "カテゴリ",
    label_value: "数値",
    label_from: "変換元",
    label_to: "変換先",
    auto: "自動計算",
    btn_calc: "計算する",
    bulk_title: "一括変換",
    history_title: "履歴（5件）",
    history_empty: "履歴がまだありません",
    history_clear: "履歴をクリア",
    prompt_value: "数値を入力してください。",
    invalid_number: "有効な数値を入力してください。",
    extreme_number: "値が大きすぎます。桁数を減らして入力してください。",
    below_absolute_zero: "絶対零度未満の温度は変換できません。",
    donate_line1: "💗 このツールが役に立ったら支援お願いします",
    faq_title: "よくある質問",
    faq_q1: "計算結果は正確ですか？",
    faq_a1: "一般的な換算係数に基づく目安です。専門用途では公式規格や専門資料を確認してください。",
    faq_q2: "伝統単位も正確ですか？",
    faq_a2: "尺貫法などは時代・地域・用途で値が異なる場合があります。このツールでは代表的な近似値を使います。",
    faq_q3: "履歴は保存されますか？",
    faq_a3: "直近5件の変換履歴、テーマ設定、言語設定はこのブラウザのlocalStorageに保存されます。",
    faq_q4: "入力内容は送信されますか？",
    faq_a4: "単位変換処理はブラウザ内で行います。ただしページ表示のため広告・解析タグは読み込まれます。",
    cat_length: "長さ", cat_weight: "重さ", cat_temp: "温度", cat_volume: "体積", cat_area: "面積", cat_speed: "速度", cat_pressure: "圧力"
  },
  en: {
    title: "UnitMaster",
    subtitle: "Convert length, weight, temperature, volume, area, speed, and pressure units.",
    howto_title: "How to Use",
    howto_1: "Choose a category.",
    howto_2: "Enter a value.",
    howto_3: "Select the source and target units.",
    howto_4: "Toggle auto calculation on or off.",
    howto_5: "When auto calculation is off, press Calculate.",
    notice_title: "About the results",
    notice_general: "This tool provides estimates based on common conversion factors.",
    notice_professional: "For medical, industrial design, construction, contracts, trade, legal, regulatory, or research use, check official standards, specialist references, and measurement conditions.",
    notice_traditional: "Traditional units may vary by era, region, and use case. This page uses representative approximations.",
    notice_rounding: "Rounding and display precision may cause small differences.",
    storage_title: "Storage",
    storage_body: "The latest 5 conversion history items, theme setting, and language setting are stored in this browser's localStorage. They are not synced to other devices and disappear when browser data is deleted.",
    category_label: "Category",
    label_value: "Value",
    label_from: "From",
    label_to: "To",
    auto: "Auto Calc",
    btn_calc: "Calculate",
    bulk_title: "Bulk Convert",
    history_title: "History (5)",
    history_empty: "No history yet",
    history_clear: "Clear history",
    prompt_value: "Enter a value.",
    invalid_number: "Enter a valid number.",
    extreme_number: "The value is too large. Please reduce the number of digits.",
    below_absolute_zero: "Temperature below absolute zero cannot be converted.",
    donate_line1: "💗 If this tool helps you, please support us!",
    faq_title: "FAQ",
    faq_q1: "Are the results exact?",
    faq_a1: "They are estimates based on common conversion factors. For professional use, check official standards or specialist references.",
    faq_q2: "Are traditional units exact?",
    faq_a2: "Traditional units may vary by era, region, and use case. This tool uses representative approximations.",
    faq_q3: "Is history saved?",
    faq_a3: "The latest 5 conversion history items, theme setting, and language setting are stored in this browser's localStorage.",
    faq_q4: "Is my input sent anywhere?",
    faq_a4: "Conversion runs in the browser. Advertising and analytics tags may still load for page display.",
    cat_length: "Length", cat_weight: "Weight", cat_temp: "Temperature", cat_volume: "Volume", cat_area: "Area", cat_speed: "Speed", cat_pressure: "Pressure"
  }
};

const unitLabels = {
  ja: {
    length: { shaku: "尺", sun: "寸", bu_length: "分", ken: "間", ri: "里", tsubo_length: "坪", furlong: "ハロン (furlong)", chain: "チェーン (chain)", league: "リーグ (league)", angstrom: "オングストローム (angstrom)", micrometer: "マイクロメートル (micrometer)", parsec: "パーセク (parsec)", lightyear: "光年 (lightyear)" },
    weight: { monme: "匁", kin: "斤", kan: "貫", dram: "ドラム (dram)", grain: "グレイン (grain)" },
    volume: { gou: "合", shou: "升", to: "斗" },
    area: { tsubo_area: "坪", tan: "反", se: "畝", cho: "町" },
    speed: { knot: "ノット (knot)", league_per_hour: "リーグ毎時 (league/h)" },
    pressure: { torr: "トル (torr)", psi: "psi" }
  },
  en: {
    length: { shaku: "Shaku", sun: "Sun", bu_length: "Bu", ken: "Ken", ri: "Ri", tsubo_length: "Tsubo", furlong: "Furlong", chain: "Chain", league: "League", angstrom: "Angstrom", micrometer: "Micrometer", parsec: "Parsec", lightyear: "Light-year" },
    weight: { monme: "Monme", kin: "Kin", kan: "Kan", dram: "Dram", grain: "Grain" },
    volume: { gou: "Gou", shou: "Shou", to: "To" },
    area: { tsubo_area: "Tsubo", tan: "Tan", se: "Se", cho: "Cho" },
    speed: { knot: "Knot", league_per_hour: "League/h" },
    pressure: { torr: "Torr", psi: "psi" }
  }
};

const units = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, yard: 0.9144, mile: 1609.344, shaku: 0.303, sun: 0.0303, bu_length: 0.00303, ken: 1.818, ri: 3927, tsubo_length: 3.306, furlong: 201.168, chain: 20.1168, league: 4828.032, angstrom: 1e-10, micrometer: 1e-6, parsec: 3.0857e16, lightyear: 9.4607e15 },
  weight: { g: 1, kg: 1000, lb: 453.59237, oz: 28.3495231, monme: 3.75, kin: 600, kan: 3750, dram: 1.771845, grain: 0.06479891 },
  temp: ["c", "f", "k"],
  volume: { ml: 0.001, l: 1, cup: 0.24, gou: 0.18039, shou: 1.8039, to: 18.039 },
  area: { mm2: 1e-6, cm2: 1e-4, m2: 1, km2: 1e6, tsubo_area: 3.305785, tan: 991.736, se: 99.1736, cho: 9917.36 },
  speed: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444, league_per_hour: 1.34112 },
  pressure: { pa: 1, hpa: 100, bar: 100000, atm: 101325, torr: 133.322, psi: 6894.76 }
};

const categoryKeys = ["length", "weight", "temp", "volume", "area", "speed", "pressure"];
const $ = (id) => document.getElementById(id);
const categorySelect = $("categorySelect");
const fromSel = $("fromUnit");
const toSel = $("toUnit");
const inputValue = $("inputValue");
const autoCalc = $("autoCalc");
const calcBtn = $("calcBtn");
const resultBox = $("resultBox");
const bulkBox = $("bulkBox");
const historyBox = $("historyBox");
const themeToggle = $("themeToggle");
const tabs = document.querySelectorAll(".tab");
const langBtns = document.querySelectorAll(".lang-btn");
const accordionToggles = document.querySelectorAll(".accordion-toggle");
const htmlEl = document.documentElement;
let currentLang = loadSavedLang() || detectInitialLang();
let latestValidResult = null;
let historyTimer = null;

function detectInitialLang() {
  return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

function loadSavedLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY) || localStorage.getItem("nw_lang");
    return saved === "ja" || saved === "en" ? saved : null;
  } catch (e) {
    return null;
  }
}

function saveLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
}

function text(key) {
  return (labels[currentLang] && labels[currentLang][key]) || labels.ja[key] || key;
}

function unitLabel(cat, unit) {
  if (cat === "temp") return unit.toUpperCase();
  return (unitLabels[currentLang][cat] && unitLabels[currentLang][cat][unit]) || unit;
}

function categoryLabel(cat) {
  return text(`cat_${cat}`);
}

function createTextElement(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value;
  return el;
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  htmlEl.classList.toggle("dark", isDark);
  if (themeToggle) {
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  }
}

function applySavedTheme() {
  let theme = "light";
  try { theme = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"; } catch (e) {}
  applyTheme(theme);
}

function updateStaticText() {
  const title = document.querySelector(".title");
  if (title) title.textContent = text("title");
  document.querySelectorAll("[data-text-key]").forEach((el) => {
    const key = el.getAttribute("data-text-key");
    if (labels[currentLang][key]) el.textContent = labels[currentLang][key];
  });
  Array.from(categorySelect.options).forEach((option) => {
    option.textContent = categoryLabel(option.value);
  });
  tabs.forEach((tab) => {
    tab.textContent = categoryLabel(tab.dataset.cat);
  });
}

function applyLanguage(lang, persist = true) {
  currentLang = lang === "en" ? "en" : "ja";
  htmlEl.lang = currentLang;
  updateStaticText();
  langBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === currentLang));
  if (persist) saveLang(currentLang);
  applyCategory(categorySelect.value || "length", true, false);
  calculate(false);
  loadHistory();
}

function clearOptions(select) {
  select.replaceChildren();
}

function addOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

function applyCategory(cat, preserveUnits = false, saveAutoHistory = true) {
  const safeCat = categoryKeys.includes(cat) ? cat : "length";
  const prevFrom = fromSel.value;
  const prevTo = toSel.value;
  categorySelect.value = safeCat;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.cat === safeCat));
  clearOptions(fromSel);
  clearOptions(toSel);
  const keys = safeCat === "temp" ? units.temp : Object.keys(units[safeCat]);
  keys.forEach((unit) => {
    addOption(fromSel, unit, unitLabel(safeCat, unit));
    addOption(toSel, unit, unitLabel(safeCat, unit));
  });
  if (preserveUnits) {
    if (keys.includes(prevFrom)) fromSel.value = prevFrom;
    if (keys.includes(prevTo)) toSel.value = prevTo;
  } else if (keys.length > 1) {
    toSel.value = keys[1];
  }
  calculate(false);
  if (saveAutoHistory && autoCalc.checked && latestValidResult) scheduleHistorySave();
}

function convertTemperature(value, from, to) {
  let c = value;
  if (from === "f") c = (value - 32) * 5 / 9;
  if (from === "k") c = value - 273.15;
  if (to === "f") return c * 9 / 5 + 32;
  if (to === "k") return c + 273.15;
  return c;
}

function validateInput() {
  const raw = inputValue.value.trim();
  if (raw === "") return { ok: false, message: text("prompt_value"), state: "warning" };
  const value = Number(raw);
  if (!Number.isFinite(value)) return { ok: false, message: text("invalid_number"), state: "error" };
  if (Math.abs(value) > MAX_ABS_VALUE) return { ok: false, message: text("extreme_number"), state: "error" };
  if (categorySelect.value === "temp") {
    if ((fromSel.value === "k" && value < 0) || (fromSel.value === "c" && value < -273.15) || (fromSel.value === "f" && value < -459.67)) {
      return { ok: false, message: text("below_absolute_zero"), state: "error" };
    }
  }
  return { ok: true, value, raw };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e9 || abs < 0.0001) return value.toExponential(6);
  return Number(value.toFixed(6)).toString();
}

function setResult(message, state) {
  resultBox.textContent = message;
  resultBox.classList.toggle("is-warning", state === "warning");
  resultBox.classList.toggle("is-error", state === "error");
}

function buildResult(value) {
  const cat = categorySelect.value;
  if (cat === "temp") {
    const result = convertTemperature(value, fromSel.value, toSel.value);
    return labels[currentLang].result
      ? labels[currentLang].result(formatNumber(value), unitLabel(cat, fromSel.value), formatNumber(result), unitLabel(cat, toSel.value))
      : `${formatNumber(value)} ${unitLabel(cat, fromSel.value)} = ${formatNumber(result)} ${unitLabel(cat, toSel.value)}`;
  }
  const dict = units[cat];
  const result = value * dict[fromSel.value] / dict[toSel.value];
  return `${formatNumber(value)} ${unitLabel(cat, fromSel.value)} = ${formatNumber(result)} ${unitLabel(cat, toSel.value)}`;
}

function generateBulkList(validation) {
  if (!validation.ok) {
    bulkBox.replaceChildren();
    return;
  }
  const cat = categorySelect.value;
  const fragment = document.createDocumentFragment();
  fragment.appendChild(createTextElement("div", "bulk-line bulk-source", `${formatNumber(validation.value)} ${unitLabel(cat, fromSel.value)}`));
  if (cat === "temp") {
    units.temp.forEach((unit) => {
      if (unit !== fromSel.value) fragment.appendChild(createTextElement("div", "bulk-line", `= ${formatNumber(convertTemperature(validation.value, fromSel.value, unit))} ${unitLabel(cat, unit)}`));
    });
  } else {
    const dict = units[cat];
    const base = validation.value * dict[fromSel.value];
    Object.keys(dict).forEach((unit) => {
      if (unit !== fromSel.value) fragment.appendChild(createTextElement("div", "bulk-line", `= ${formatNumber(base / dict[unit])} ${unitLabel(cat, unit)}`));
    });
  }
  bulkBox.replaceChildren(fragment);
}

function readHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function writeHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 5))); } catch (e) {}
}

function historyKey(item) {
  return [item.category, item.value, item.from, item.to, item.result].join("|");
}

function saveHistory(result) {
  if (!latestValidResult) return;
  const item = { value: latestValidResult.value, from: fromSel.value, to: toSel.value, result, category: categorySelect.value };
  const list = readHistory();
  if (list[0] && historyKey(list[0]) === historyKey(item)) return;
  writeHistory([item, ...list.filter((old) => historyKey(old) !== historyKey(item))]);
  loadHistory();
}

function scheduleHistorySave() {
  clearTimeout(historyTimer);
  historyTimer = setTimeout(() => latestValidResult && saveHistory(latestValidResult.result), HISTORY_DEBOUNCE_MS);
}

function clearHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
  loadHistory();
}

function loadHistory() {
  const list = readHistory();
  const fragment = document.createDocumentFragment();
  if (list.length === 0) {
    fragment.appendChild(createTextElement("p", "history-empty", text("history_empty")));
    historyBox.replaceChildren(fragment);
    return;
  }
  const actions = document.createElement("div");
  actions.className = "history-actions";
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "clear-history-btn";
  clearButton.textContent = text("history_clear");
  clearButton.addEventListener("click", clearHistory);
  actions.appendChild(clearButton);
  fragment.appendChild(actions);
  list.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "history-item";
    wrap.appendChild(createTextElement("div", "", item.result || "-"));
    wrap.appendChild(createTextElement("div", "history-meta", `${item.value} ${unitLabel(item.category, item.from)} → ${unitLabel(item.category, item.to)} | ${categoryLabel(item.category)}`));
    fragment.appendChild(wrap);
  });
  historyBox.replaceChildren(fragment);
}

function calculate(shouldSave) {
  const validation = validateInput();
  if (!validation.ok) {
    latestValidResult = null;
    setResult(validation.message, validation.state);
    generateBulkList(validation);
    loadHistory();
    return;
  }
  const result = buildResult(validation.value);
  latestValidResult = { value: validation.raw, result };
  setResult(result, "neutral");
  generateBulkList(validation);
  if (shouldSave) saveHistory(result);
  else loadHistory();
}

tabs.forEach((tab) => tab.addEventListener("click", () => applyCategory(tab.dataset.cat)));
categorySelect.addEventListener("change", () => applyCategory(categorySelect.value));
[inputValue, fromSel, toSel].forEach((el) => {
  el.addEventListener(el === inputValue ? "input" : "change", () => {
    if (autoCalc.checked) {
      calculate(false);
      if (latestValidResult) scheduleHistorySave();
    }
  });
});
autoCalc.addEventListener("change", () => {
  calcBtn.classList.toggle("hidden", autoCalc.checked);
  if (autoCalc.checked) {
    calculate(false);
    if (latestValidResult) scheduleHistorySave();
  } else {
    clearTimeout(historyTimer);
  }
});
calcBtn.addEventListener("click", () => {
  clearTimeout(historyTimer);
  calculate(true);
});
accordionToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const next = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", next ? "true" : "false");
    const icon = btn.querySelector(".accordion-icon");
    if (icon) icon.textContent = next ? "−" : "+";
    if (target) target.classList.toggle("open", next);
  });
});
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = htmlEl.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });
}
langBtns.forEach((btn) => btn.addEventListener("click", () => applyLanguage(btn.dataset.lang)));

applySavedTheme();
applyCategory("length", false, false);
applyLanguage(currentLang, false);
