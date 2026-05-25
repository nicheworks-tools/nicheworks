const HISTORY_KEY = "unitmaster_history";
const THEME_KEY = "unitmaster_theme";
const LANG_KEY = "unitmaster_lang";
const UNIT_DATA_URL = "./data/units.json";
const LEGACY_APP_URL = "./app.js";
const MAX_ABS_VALUE = 1e100;
const HISTORY_DEBOUNCE_MS = 900;

const labels = {
  ja: {
    title: "UnitMaster",
    subtitle: "長さ・重さ・温度・体積・面積・速度・圧力の単位を相互変換するツールです。",
    howto_title: "使い方", howto_1: "カテゴリを選択します。", howto_2: "数値を入力します。", howto_3: "変換元と変換先の単位を選択します。", howto_4: "自動計算ON/OFFを切り替えます。", howto_5: "OFF時は「計算する」ボタンで実行します。",
    notice_title: "計算結果について", notice_general: "このツールは一般的な換算係数に基づく目安です。", notice_professional: "医療、工業設計、建築、契約、取引、法規制、研究用途では、公式規格・専門資料・測定条件を確認してください。", notice_traditional: "尺貫法・伝統単位は、時代・地域・用途により値が異なる場合があります。このページでは代表的な近似値として扱います。", notice_rounding: "表示桁数の都合で端数処理・丸め誤差が生じる場合があります。",
    storage_title: "保存について", storage_body: "変換履歴5件、テーマ設定、言語設定はこのブラウザのlocalStorageに保存されます。別端末には同期されず、ブラウザデータを削除すると消えます。",
    category_label: "カテゴリ", label_value: "数値", label_from: "変換元", label_to: "変換先", auto: "自動計算", btn_calc: "計算する", bulk_title: "一括変換", history_title: "履歴（5件）", history_empty: "履歴がまだありません", history_clear: "履歴をクリア",
    prompt_value: "数値を入力してください。", invalid_number: "有効な数値を入力してください。", extreme_number: "値が大きすぎます。桁数を減らして入力してください。", below_absolute_zero: "絶対零度未満の温度は変換できません。", donate_line1: "💗 このツールが役に立ったら支援お願いします",
    faq_title: "よくある質問", faq_q1: "計算結果は正確ですか？", faq_a1: "一般的な換算係数に基づく目安です。専門用途では公式規格や専門資料を確認してください。", faq_q2: "伝統単位も正確ですか？", faq_a2: "尺貫法などは時代・地域・用途で値が異なる場合があります。このツールでは代表的な近似値を使います。", faq_q3: "履歴は保存されますか？", faq_a3: "直近5件の変換履歴、テーマ設定、言語設定はこのブラウザのlocalStorageに保存されます。", faq_q4: "入力内容は送信されますか？", faq_a4: "単位変換処理はブラウザ内で行います。ただしページ表示のため広告・解析タグは読み込まれます。",
    cat_length: "長さ", cat_weight: "重さ", cat_temp: "温度", cat_volume: "体積", cat_area: "面積", cat_speed: "速度", cat_pressure: "圧力"
  },
  en: {
    title: "UnitMaster", subtitle: "Convert length, weight, temperature, volume, area, speed, and pressure units.", howto_title: "How to Use", howto_1: "Choose a category.", howto_2: "Enter a value.", howto_3: "Select the source and target units.", howto_4: "Toggle auto calculation on or off.", howto_5: "When auto calculation is off, press Calculate.",
    notice_title: "About the results", notice_general: "This tool provides estimates based on common conversion factors.", notice_professional: "For medical, industrial design, construction, contracts, trade, legal, regulatory, or research use, check official standards, specialist references, and measurement conditions.", notice_traditional: "Traditional units may vary by era, region, and use case. This page uses representative approximations.", notice_rounding: "Rounding and display precision may cause small differences.",
    storage_title: "Storage", storage_body: "The latest 5 conversion history items, theme setting, and language setting are stored in this browser's localStorage. They are not synced to other devices and disappear when browser data is deleted.", category_label: "Category", label_value: "Value", label_from: "From", label_to: "To", auto: "Auto Calc", btn_calc: "Calculate", bulk_title: "Bulk Convert", history_title: "History (5)", history_empty: "No history yet", history_clear: "Clear history",
    prompt_value: "Enter a value.", invalid_number: "Enter a valid number.", extreme_number: "The value is too large. Please reduce the number of digits.", below_absolute_zero: "Temperature below absolute zero cannot be converted.", donate_line1: "💗 If this tool helps you, please support us!", faq_title: "FAQ", faq_q1: "Are the results exact?", faq_a1: "They are estimates based on common conversion factors. For professional use, check official standards or specialist references.", faq_q2: "Are traditional units exact?", faq_a2: "Traditional units may vary by era, region, and use case. This tool uses representative approximations.", faq_q3: "Is history saved?", faq_a3: "The latest 5 conversion history items, theme setting, and language setting are stored in this browser's localStorage.", faq_q4: "Is my input sent anywhere?", faq_a4: "Conversion runs in the browser. Advertising and analytics tags may still load for page display.",
    cat_length: "Length", cat_weight: "Weight", cat_temp: "Temperature", cat_volume: "Volume", cat_area: "Area", cat_speed: "Speed", cat_pressure: "Pressure"
  }
};

const $ = (id) => document.getElementById(id);
const els = {
  categorySelect: $("categorySelect"), fromSel: $("fromUnit"), toSel: $("toUnit"), inputValue: $("inputValue"), autoCalc: $("autoCalc"), calcBtn: $("calcBtn"), resultBox: $("resultBox"), bulkBox: $("bulkBox"), historyBox: $("historyBox"), themeToggle: $("themeToggle")
};
const tabs = document.querySelectorAll(".tab");
const langBtns = document.querySelectorAll(".lang-btn");
const accordionToggles = document.querySelectorAll(".accordion-toggle");
const htmlEl = document.documentElement;
let runtimeUnits = null;
let runtimeUnitLabels = null;
let runtimeCategoryKeys = [];
let currentLang = loadSavedLang() || detectInitialLang();
let latestValidResult = null;
let historyTimer = null;

function detectInitialLang(){ return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en"; }
function loadSavedLang(){ try { const saved = localStorage.getItem(LANG_KEY) || localStorage.getItem("nw_lang"); return saved === "ja" || saved === "en" ? saved : null; } catch(e){ return null; } }
function saveLang(lang){ try { localStorage.setItem(LANG_KEY, lang); } catch(e){} }
function text(key){ return labels[currentLang]?.[key] || labels.ja[key] || key; }
function unitLabel(cat, unit){ return runtimeUnitLabels?.[currentLang]?.[cat]?.[unit] || unit; }
function categoryLabel(cat){ return text(`cat_${cat}`); }
function createTextElement(tag, className, value){ const el = document.createElement(tag); if(className) el.className = className; el.textContent = value; return el; }
function fallbackToLegacy(){ const script = document.createElement("script"); script.src = LEGACY_APP_URL; document.body.appendChild(script); }

async function loadRuntime(){
  const adapter = window.UnitMasterRuntimeAdapter;
  if(!adapter || typeof adapter.adaptUnitMasterData !== "function") throw new Error("UnitMasterRuntimeAdapter missing");
  const response = await fetch(UNIT_DATA_URL, { cache: "no-store" });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const adapted = adapter.adaptUnitMasterData(await response.json());
  if(!adapted?.units || !adapted?.unitLabels || !Array.isArray(adapted.categoryKeys)) throw new Error("Invalid adapted runtime data");
  runtimeUnits = adapted.units;
  runtimeUnitLabels = adapted.unitLabels;
  runtimeCategoryKeys = adapted.categoryKeys;
}
function applyTheme(theme){ const isDark = theme === "dark"; htmlEl.classList.toggle("dark", isDark); if(els.themeToggle){ els.themeToggle.textContent = isDark ? "☀️" : "🌙"; els.themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false"); } }
function applySavedTheme(){ let theme = "light"; try { theme = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"; } catch(e){} applyTheme(theme); }
function updateStaticText(){ const title = document.querySelector(".title"); if(title) title.textContent = text("title"); document.querySelectorAll("[data-text-key]").forEach((el)=>{ const key = el.getAttribute("data-text-key"); if(labels[currentLang]?.[key]) el.textContent = labels[currentLang][key]; }); Array.from(els.categorySelect.options).forEach((option)=>{ option.textContent = categoryLabel(option.value); }); tabs.forEach((tab)=>{ tab.textContent = categoryLabel(tab.dataset.cat); }); }
function applyLanguage(lang, persist = true){ currentLang = lang === "en" ? "en" : "ja"; htmlEl.lang = currentLang; updateStaticText(); langBtns.forEach((btn)=>btn.classList.toggle("active", btn.dataset.lang === currentLang)); if(persist) saveLang(currentLang); applyCategory(els.categorySelect.value || "length", true, false); calculate(false); loadHistory(); }
function clearOptions(select){ select.replaceChildren(); }
function addOption(select, value, label){ const option = document.createElement("option"); option.value = value; option.textContent = label; select.appendChild(option); }
function applyCategory(cat, preserveUnits = false, saveAutoHistory = true){ const safeCat = runtimeCategoryKeys.includes(cat) ? cat : "length"; const prevFrom = els.fromSel.value; const prevTo = els.toSel.value; els.categorySelect.value = safeCat; tabs.forEach((tab)=>tab.classList.toggle("active", tab.dataset.cat === safeCat)); clearOptions(els.fromSel); clearOptions(els.toSel); const keys = safeCat === "temp" ? runtimeUnits.temp : Object.keys(runtimeUnits[safeCat] || {}); keys.forEach((unit)=>{ addOption(els.fromSel, unit, unitLabel(safeCat, unit)); addOption(els.toSel, unit, unitLabel(safeCat, unit)); }); if(preserveUnits){ if(keys.includes(prevFrom)) els.fromSel.value = prevFrom; if(keys.includes(prevTo)) els.toSel.value = prevTo; } else if(keys.length > 1){ els.toSel.value = keys[1]; } calculate(false); if(saveAutoHistory && els.autoCalc.checked && latestValidResult) scheduleHistorySave(); }
function convertTemperature(value, from, to){ let c = value; if(from === "f") c = (value - 32) * 5 / 9; if(from === "k") c = value - 273.15; if(to === "f") return c * 9 / 5 + 32; if(to === "k") return c + 273.15; return c; }
function validateInput(){ const raw = els.inputValue.value.trim(); if(raw === "") return { ok:false, message:text("prompt_value"), state:"warning" }; const value = Number(raw); if(!Number.isFinite(value)) return { ok:false, message:text("invalid_number"), state:"error" }; if(Math.abs(value) > MAX_ABS_VALUE) return { ok:false, message:text("extreme_number"), state:"error" }; if(els.categorySelect.value === "temp" && ((els.fromSel.value === "k" && value < 0) || (els.fromSel.value === "c" && value < -273.15) || (els.fromSel.value === "f" && value < -459.67))) return { ok:false, message:text("below_absolute_zero"), state:"error" }; return { ok:true, value, raw }; }
function formatNumber(value){ if(!Number.isFinite(value)) return "-"; if(value === 0) return "0"; const abs = Math.abs(value); if(abs >= 1e9 || abs < 0.0001) return value.toExponential(6); return Number(value.toFixed(6)).toString(); }
function setResult(message, state){ els.resultBox.textContent = message; els.resultBox.classList.toggle("is-warning", state === "warning"); els.resultBox.classList.toggle("is-error", state === "error"); }
function buildResult(value){ const cat = els.categorySelect.value; if(cat === "temp"){ const result = convertTemperature(value, els.fromSel.value, els.toSel.value); return `${formatNumber(value)} ${unitLabel(cat, els.fromSel.value)} = ${formatNumber(result)} ${unitLabel(cat, els.toSel.value)}`; } const dict = runtimeUnits[cat]; const result = value * dict[els.fromSel.value] / dict[els.toSel.value]; return `${formatNumber(value)} ${unitLabel(cat, els.fromSel.value)} = ${formatNumber(result)} ${unitLabel(cat, els.toSel.value)}`; }
function generateBulkList(validation){ if(!validation.ok){ els.bulkBox.replaceChildren(); return; } const cat = els.categorySelect.value; const fragment = document.createDocumentFragment(); fragment.appendChild(createTextElement("div", "bulk-line bulk-source", `${formatNumber(validation.value)} ${unitLabel(cat, els.fromSel.value)}`)); if(cat === "temp"){ runtimeUnits.temp.forEach((unit)=>{ if(unit !== els.fromSel.value) fragment.appendChild(createTextElement("div", "bulk-line", `= ${formatNumber(convertTemperature(validation.value, els.fromSel.value, unit))} ${unitLabel(cat, unit)}`)); }); } else { const dict = runtimeUnits[cat]; const base = validation.value * dict[els.fromSel.value]; Object.keys(dict).forEach((unit)=>{ if(unit !== els.fromSel.value) fragment.appendChild(createTextElement("div", "bulk-line", `= ${formatNumber(base / dict[unit])} ${unitLabel(cat, unit)}`)); }); } els.bulkBox.replaceChildren(fragment); }
function hasUnit(cat, unit){ const group = runtimeUnits[cat]; if(!group) return false; return Array.isArray(group) ? group.includes(unit) : Object.prototype.hasOwnProperty.call(group, unit); }
function isKnownHistoryItem(item){ return !!item && hasUnit(item.category, item.from) && hasUnit(item.category, item.to); }
function readHistory(){ try { const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); if(!Array.isArray(list)) return []; const filtered = list.filter(isKnownHistoryItem); if(filtered.length !== list.length) localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 5))); return filtered; } catch(e){ return []; } }
function writeHistory(list){ try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 5))); } catch(e){} }
function historyKey(item){ return [item.category, item.value, item.from, item.to, item.result].join("|"); }
function saveHistory(result){ if(!latestValidResult) return; const item = { value: latestValidResult.value, from: els.fromSel.value, to: els.toSel.value, result, category: els.categorySelect.value }; const list = readHistory(); if(list[0] && historyKey(list[0]) === historyKey(item)) return; writeHistory([item, ...list.filter((old)=>historyKey(old) !== historyKey(item))]); loadHistory(); }
function scheduleHistorySave(){ clearTimeout(historyTimer); historyTimer = setTimeout(()=>latestValidResult && saveHistory(latestValidResult.result), HISTORY_DEBOUNCE_MS); }
function clearHistory(){ try { localStorage.removeItem(HISTORY_KEY); } catch(e){} loadHistory(); }
function loadHistory(){ const list = readHistory(); const fragment = document.createDocumentFragment(); if(list.length === 0){ fragment.appendChild(createTextElement("p", "history-empty", text("history_empty"))); els.historyBox.replaceChildren(fragment); return; } const actions = document.createElement("div"); actions.className = "history-actions"; const clearButton = document.createElement("button"); clearButton.type = "button"; clearButton.className = "clear-history-btn"; clearButton.textContent = text("history_clear"); clearButton.addEventListener("click", clearHistory); actions.appendChild(clearButton); fragment.appendChild(actions); list.forEach((item)=>{ const wrap = document.createElement("div"); wrap.className = "history-item"; wrap.appendChild(createTextElement("div", "", item.result || "-")); wrap.appendChild(createTextElement("div", "history-meta", `${item.value} ${unitLabel(item.category, item.from)} → ${unitLabel(item.category, item.to)} | ${categoryLabel(item.category)}`)); fragment.appendChild(wrap); }); els.historyBox.replaceChildren(fragment); }
function calculate(shouldSave){ const validation = validateInput(); if(!validation.ok){ latestValidResult = null; setResult(validation.message, validation.state); generateBulkList(validation); loadHistory(); return; } const result = buildResult(validation.value); latestValidResult = { value: validation.raw, result }; setResult(result, "neutral"); generateBulkList(validation); if(shouldSave) saveHistory(result); else loadHistory(); }
function bindEvents(){ tabs.forEach((tab)=>tab.addEventListener("click",()=>applyCategory(tab.dataset.cat))); els.categorySelect.addEventListener("change",()=>applyCategory(els.categorySelect.value)); [els.inputValue, els.fromSel, els.toSel].forEach((el)=>el.addEventListener(el === els.inputValue ? "input" : "change",()=>{ if(els.autoCalc.checked){ calculate(false); if(latestValidResult) scheduleHistorySave(); } })); els.autoCalc.addEventListener("change",()=>{ els.calcBtn.classList.toggle("hidden", els.autoCalc.checked); if(els.autoCalc.checked){ calculate(false); if(latestValidResult) scheduleHistorySave(); } else { clearTimeout(historyTimer); } }); els.calcBtn.addEventListener("click",()=>{ clearTimeout(historyTimer); calculate(true); }); accordionToggles.forEach((btn)=>btn.addEventListener("click",()=>{ const target = document.getElementById(btn.dataset.target); const next = btn.getAttribute("aria-expanded") !== "true"; btn.setAttribute("aria-expanded", next ? "true" : "false"); const icon = btn.querySelector(".accordion-icon"); if(icon) icon.textContent = next ? "−" : "+"; if(target) target.classList.toggle("open", next); })); if(els.themeToggle){ els.themeToggle.addEventListener("click",()=>{ const next = htmlEl.classList.contains("dark") ? "light" : "dark"; applyTheme(next); try { localStorage.setItem(THEME_KEY, next); } catch(e){} }); } langBtns.forEach((btn)=>btn.addEventListener("click",()=>applyLanguage(btn.dataset.lang))); }
async function initializeUnitMaster(){ try { await loadRuntime(); } catch(error) { console.warn("UnitMaster JSON runtime failed. Falling back to legacy app.js.", error); fallbackToLegacy(); return; } applySavedTheme(); bindEvents(); applyCategory("length", false, false); applyLanguage(currentLang, false); }
initializeUnitMaster();
