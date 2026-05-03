const PREFS = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const DATA_FILES = Object.fromEntries(PREFS.map((pref) => [pref, `${pref}.json`]));
const DATA_CHECKED_DATE = "2026-05-03";
const OFFICIAL_REFERENCE_DATE = "2026-04-30";
const LIMIT = 50;

const $ = (id) => document.getElementById(id);
const prefSelect = $("prefecture");
const queryInput = $("query");
const searchBtn = $("search-btn");
const results = $("results");
const resultsTitle = $("results-title");
const resultLimitNote = $("result-limit-note");
const outputListEl = $("output-list");
const outputTitle = $("output-title");
const outputCount = $("output-count");
const downloadBtn = $("download-btn");
const clearOutputBtn = $("clear-output-btn");
const loadError = $("load-error");
const exampleChips = $("example-chips");
const supportedPrefList = $("supported-pref-list");
const supportedPrefCount = $("supported-pref-count");
const dataCheckedDate = $("data-checked-date");
const officialReferenceDate = $("official-reference-date");
const toast = $("toast");

const cache = new Map();
let outputRows = [];
let activeMenu = null;
let toastTimer = null;
let searchRun = 0;

const examples = [
  ["北海道", "札幌市中央区"],
  ["東京都", "渋谷区"],
  ["東京都", "新宿区西新宿"],
  ["神奈川県", "横浜市中区"],
  ["千葉県", "千葉市中央区"],
  ["大阪府", "大阪市北区"],
  ["福岡県", "福岡市博多区"]
];

function initPrefs() {
  prefSelect.appendChild(new Option("選択してください", ""));
  const frag = document.createDocumentFragment();
  PREFS.forEach((pref) => frag.appendChild(new Option(pref, pref)));
  prefSelect.appendChild(frag);
}

function initInfo() {
  if (supportedPrefCount) supportedPrefCount.textContent = "47都道府県";
  if (supportedPrefList) supportedPrefList.textContent = "全国47都道府県のJSONファイルを読み込み対象にしています。";
  if (dataCheckedDate) dataCheckedDate.textContent = DATA_CHECKED_DATE;
  if (officialReferenceDate) officialReferenceDate.textContent = OFFICIAL_REFERENCE_DATE;
}

function initExamples() {
  if (!exampleChips) return;
  examples.forEach(([pref, query]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = `${pref}：${query}`;
    btn.addEventListener("click", () => {
      prefSelect.value = pref;
      queryInput.value = query;
      handleSearch();
    });
    exampleChips.appendChild(btn);
  });
}

async function loadData(pref) {
  const file = DATA_FILES[pref];
  if (!file) throw new Error("unsupported");
  if (cache.has(pref)) return cache.get(pref);

  const response = await fetch(`./data/${encodeURIComponent(file)}`);
  if (!response.ok) throw new Error("missing_file");

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("invalid_json");
  }

  if (!Array.isArray(data) || data.length === 0) throw new Error("empty_data");
  cache.set(pref, data);
  return data;
}

function setAlert(message, kind = "error") {
  if (!loadError) return;
  loadError.textContent = message;
  loadError.dataset.type = kind;
  loadError.style.display = message ? "block" : "none";
}

function setEmpty(message) {
  results.textContent = message;
  results.classList.add("empty");
  resultsTitle.textContent = "検索結果（0件）";
  if (resultLimitNote) resultLimitNote.hidden = true;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function filterData(data, query) {
  const q = normalize(query);
  if (q.length < 2) return { total: 0, rows: [] };
  const first = [];
  const rest = [];
  data.forEach((item) => {
    const full = normalize(item.full);
    const city = normalize(item.city);
    const town = normalize(item.town);
    const joined = `${full}${city}${town}`;
    if (full.startsWith(q) || city.startsWith(q) || town.startsWith(q)) first.push(item);
    else if (joined.includes(q)) rest.push(item);
  });
  const all = [...first, ...rest];
  return { total: all.length, rows: all.slice(0, LIMIT) };
}

function renderResults(rows, total) {
  results.innerHTML = "";
  results.classList.remove("empty");
  resultsTitle.textContent = `検索結果（${rows.length}件）`;
  if (resultLimitNote) resultLimitNote.hidden = total <= rows.length;
  rows.forEach((item) => results.appendChild(resultRow(item)));
}

function resultRow(item) {
  const row = document.createElement("div");
  row.className = "result-row";
  const meta = document.createElement("div");
  meta.className = "result-meta";
  const postal = document.createElement("div");
  postal.className = "postal";
  postal.textContent = `〒${item.postal_hyphen}`;
  const address = document.createElement("div");
  address.className = "address";
  address.textContent = item.full;
  meta.append(postal, address);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  const kebab = document.createElement("button");
  kebab.type = "button";
  kebab.className = "kebab-btn";
  kebab.textContent = "⋯";
  kebab.setAttribute("aria-label", "操作メニュー");
  const tag = document.createElement("span");
  tag.className = "copied-tag";
  tag.textContent = "Copied!";
  const menu = document.createElement("div");
  menu.className = "menu";
  menu.append(
    menuButton("コピー（郵便番号＋住所）", () => copyText(`〒${item.postal_hyphen} ${item.full}`, tag)),
    menuButton("郵便番号だけコピー", () => copyText(`〒${item.postal_hyphen}`, tag)),
    menuButton("出力リストに追加", () => addOutput(item, tag))
  );
  kebab.addEventListener("click", (event) => {
    event.stopPropagation();
    if (activeMenu && activeMenu !== menu) activeMenu.classList.remove("open");
    menu.classList.toggle("open");
    activeMenu = menu.classList.contains("open") ? menu : null;
  });
  actions.append(kebab, tag, menu);
  row.append(meta, actions);
  return row;
}

function menuButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", () => {
    onClick();
    closeMenu();
  });
  return btn;
}

function closeMenu() {
  if (activeMenu) activeMenu.classList.remove("open");
  activeMenu = null;
}

async function copyText(text, tag) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error("fallback");
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  flash(tag, "Copied!");
}

function flash(tag, text) {
  tag.textContent = text;
  tag.classList.add("show");
  setTimeout(() => tag.classList.remove("show"), 1200);
}

function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function addOutput(item, tag) {
  const exists = outputRows.some((row) => row.postal_hyphen === item.postal_hyphen && row.full === item.full);
  if (exists) {
    flash(tag, "追加済みです");
    showToast("すでに出力リストにあります");
    return;
  }
  outputRows.push({ postal_hyphen: item.postal_hyphen, full: item.full });
  renderOutput();
  flash(tag, "追加しました");
  showToast("出力リストに追加しました");
}

function renderOutput() {
  outputListEl.innerHTML = "";
  outputListEl.classList.remove("empty");
  if (outputCount) outputCount.textContent = `${outputRows.length}件`;
  outputTitle.textContent = `出力リスト（${outputRows.length}件）`;
  downloadBtn.disabled = outputRows.length === 0;
  if (clearOutputBtn) clearOutputBtn.disabled = outputRows.length === 0;
  if (outputRows.length === 0) {
    outputListEl.textContent = "出力リストが空です。必要な行を追加してください。";
    outputListEl.classList.add("empty");
    return;
  }
  outputRows.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "output-row";
    const text = document.createElement("div");
    text.textContent = `${item.postal_hyphen}, ${item.full}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-btn";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "この行を削除");
    remove.addEventListener("click", () => {
      row.classList.add("fade-out");
      setTimeout(() => {
        outputRows.splice(index, 1);
        renderOutput();
        showToast("出力リストから削除しました");
      }, 240);
    });
    row.append(text, remove);
    outputListEl.appendChild(row);
  });
}

async function handleSearch() {
  const currentRun = ++searchRun;
  const pref = prefSelect.value;
  const query = queryInput.value;
  setAlert("");
  if (!pref) return setEmpty("都道府県を選択してください。");
  if (query.trim().length < 2) return setEmpty("2文字以上で検索できます。例：札幌市 / 渋谷区 / 西新宿 / 丸の内");
  setEmpty(`${pref}のデータを読み込み中...`);
  try {
    const data = await loadData(pref);
    if (currentRun !== searchRun) return;
    const found = filterData(data, query);
    if (found.total === 0) setEmpty("該当する住所が見つかりませんでした。短い地名にするか、市区町村名から検索してください。");
    else renderResults(found.rows, found.total);
  } catch (error) {
    if (currentRun !== searchRun) return;
    const reason = error.message === "empty_data"
      ? "この都道府県のデータファイルが空です。データ生成をやり直してください。"
      : "データファイルの読み込みに失敗しました。ファイル名・配置・JSON形式を確認してください。";
    setAlert(reason, "error");
    setEmpty("データの読み込みに失敗しました。");
  }
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV() {
  if (outputRows.length === 0) return;
  const header = ["postal_code", "address"].map(csvCell).join(",");
  const lines = outputRows.map((item) => [item.postal_hyphen, item.full].map(csvCell).join(","));
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  link.download = `jp_postal_export_${y}${m}${d}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("CSVを保存しました");
}

function clearOutput() {
  outputRows = [];
  renderOutput();
  showToast("出力リストを全削除しました");
}

function bindEvents() {
  searchBtn.addEventListener("click", handleSearch);
  queryInput.addEventListener("input", () => {
    if (queryInput.value.trim().length >= 2) handleSearch();
  });
  prefSelect.addEventListener("change", handleSearch);
  downloadBtn.addEventListener("click", downloadCSV);
  if (clearOutputBtn) clearOutputBtn.addEventListener("click", clearOutput);
  document.addEventListener("click", closeMenu);
}

function init() {
  initPrefs();
  initInfo();
  initExamples();
  bindEvents();
  setEmpty("都道府県を選択し、住所の一部を2文字以上入力してください。");
  renderOutput();
}

init();
