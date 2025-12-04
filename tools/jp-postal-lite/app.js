const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const prefSelect = document.getElementById("prefecture");
const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results");
const resultsTitle = document.getElementById("results-title");
const outputContainer = document.getElementById("output-list");
const outputTitle = document.getElementById("output-title");
const downloadBtn = document.getElementById("download-btn");
const loadError = document.getElementById("load-error");

const dataCache = new Map();
let outputList = [];

function initPrefectures() {
  const frag = document.createDocumentFragment();
  prefSelect.appendChild(new Option("選択してください", ""));
  prefectures.forEach((pref) => {
    frag.appendChild(new Option(pref, pref));
  });
  prefSelect.appendChild(frag);
}

async function loadPrefectureData(pref) {
  if (!pref) return null;
  if (dataCache.has(pref)) return dataCache.get(pref);

  const filename = pref === "東京都" ? "tokyo" : pref; // placeholder, future files should match pref name
  const url = `./data/${filename}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("failed to load");
    const data = await res.json();
    dataCache.set(pref, data);
    return data;
  } catch (err) {
    throw err;
  }
}

function clearResults(message = "該当する住所が見つかりませんでした。入力内容をご確認ください。") {
  resultsContainer.innerHTML = message;
  resultsContainer.classList.add("empty");
  resultsTitle.textContent = "検索結果（0件）";
}

function renderResults(items) {
  resultsContainer.innerHTML = "";
  resultsContainer.classList.remove("empty");
  resultsTitle.textContent = `検索結果（${items.length}件）`;

  items.forEach((item) => {
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
    actions.style.position = "relative";

    const kebab = document.createElement("button");
    kebab.className = "kebab-btn";
    kebab.textContent = "⋯";
    kebab.setAttribute("aria-label", "操作メニュー");

    const copiedTag = document.createElement("span");
    copiedTag.className = "copied-tag";
    copiedTag.textContent = "Copied!";

    const menu = document.createElement("div");
    menu.className = "menu";

    const copyBoth = document.createElement("button");
    copyBoth.textContent = "コピー（郵便番号＋住所）";
    copyBoth.addEventListener("click", () => {
      copyText(`〒${item.postal_hyphen} ${item.full}`, copiedTag);
      closeMenu(menu);
    });

    const copyPostal = document.createElement("button");
    copyPostal.textContent = "郵便番号だけコピー";
    copyPostal.addEventListener("click", () => {
      copyText(`〒${item.postal_hyphen}`, copiedTag);
      closeMenu(menu);
    });

    const addOutput = document.createElement("button");
    addOutput.textContent = "出力リストに追加";
    addOutput.addEventListener("click", () => {
      addToOutput(item, row);
      closeMenu(menu);
    });

    menu.append(copyBoth, copyPostal, addOutput);

    kebab.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(menu);
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== kebab) {
        closeMenu(menu);
      }
    });

    actions.append(kebab, copiedTag, menu);
    row.append(meta, actions);
    resultsContainer.appendChild(row);
  });
}

function toggleMenu(menu) {
  menu.classList.toggle("open");
}

function closeMenu(menu) {
  menu.classList.remove("open");
}

function copyText(text, tag) {
  navigator.clipboard.writeText(text).then(() => {
    tag.classList.add("show");
    setTimeout(() => tag.classList.remove("show"), 1000);
  });
}

function addToOutput(item, originRow) {
  const exists = outputList.some(
    (entry) => entry.postal_hyphen === item.postal_hyphen && entry.full === item.full
  );
  if (exists) {
    showTransientMessage(originRow, "すでに出力リストに追加されています");
    return;
  }
  outputList.push({ postal_hyphen: item.postal_hyphen, full: item.full });
  renderOutput();
  showTransientMessage(originRow, "出力リストに追加しました");
}

function showTransientMessage(row, text) {
  let tag = row.querySelector(".copied-tag");
  if (!tag) {
    tag = document.createElement("span");
    tag.className = "copied-tag";
    row.appendChild(tag);
  }
  tag.textContent = text;
  tag.classList.add("show");
  setTimeout(() => tag.classList.remove("show"), 1000);
}

function renderOutput() {
  outputContainer.innerHTML = "";
  outputContainer.classList.remove("empty");

  if (outputList.length === 0) {
    outputContainer.textContent = "出力リストが空です。必要な行を追加してください。";
    outputContainer.classList.add("empty");
    outputTitle.textContent = "出力リスト（0件）";
    downloadBtn.disabled = true;
    return;
  }

  outputTitle.textContent = `出力リスト（${outputList.length}件）`;
  downloadBtn.disabled = false;

  outputList.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "output-row";

    const text = document.createElement("div");
    text.textContent = `${entry.postal_hyphen}, ${entry.full}`;

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "この行を削除");
    remove.addEventListener("click", () => {
      row.classList.add("fade-out");
      setTimeout(() => {
        outputList.splice(index, 1);
        renderOutput();
      }, 300);
    });

    row.append(text, remove);
    outputContainer.appendChild(row);
  });
}

function filterResults(data, query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const startsWith = [];
  const includes = [];

  data.forEach((item) => {
    const lower = (item.full || "").toLowerCase();
    if (lower.startsWith(q)) {
      startsWith.push(item);
    } else if (lower.includes(q)) {
      includes.push(item);
    }
  });

  return [...startsWith, ...includes].slice(0, 50);
}

async function handleSearch() {
  const pref = prefSelect.value;
  const query = queryInput.value;

  loadError.style.display = "none";
  loadError.textContent = "";

  if (!pref) {
    clearResults("都道府県を選択してください。");
    return;
  }

  if (query.trim().length < 2) {
    clearResults("2文字以上で検索できます。");
    return;
  }

  try {
    const data = await loadPrefectureData(pref);
    if (!Array.isArray(data)) throw new Error("invalid data");
    const filtered = filterResults(data, query);
    if (filtered.length === 0) {
      clearResults();
    } else {
      renderResults(filtered);
    }
  } catch (err) {
    loadError.textContent = "データの読み込みに失敗しました。再度お試しください。";
    loadError.style.display = "block";
    clearResults("データの読み込みに失敗しました。");
  }
}

function downloadCSV() {
  if (outputList.length === 0) return;
  const header = "postal_code,address";
  const lines = outputList.map((item) => `${item.postal_hyphen},${item.full}`);
  const csv = [header, ...lines].join("\n");
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
}

function bindEvents() {
  searchBtn.addEventListener("click", handleSearch);
  queryInput.addEventListener("input", () => {
    if (queryInput.value.trim().length >= 2) {
      handleSearch();
    }
  });
  prefSelect.addEventListener("change", handleSearch);
  downloadBtn.addEventListener("click", downloadCSV);
}

function init() {
  initPrefectures();
  bindEvents();
  clearResults();
}

init();
