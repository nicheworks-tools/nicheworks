const grid = document.getElementById("symbolGrid");
const result = document.getElementById("result");
const summaryEl = document.getElementById("resultSummary");
const detailEl = document.getElementById("resultDetail");
const copyBtn = document.getElementById("resultCopy");

const candGrid = document.getElementById("ocrCandidatesGrid");
const ocrFile = document.getElementById("ocrFile");
const ocrRun = document.getElementById("ocrRun");
const ocrClear = document.getElementById("ocrClear");
const ocrAllEl = document.getElementById("ocrAll");
const ocrPreviewImg = document.getElementById("ocrPreviewImg");
const ocrStatus = document.getElementById("ocrStatus");

const qEl = document.getElementById("q");
const searchAllEl = document.getElementById("searchAll");

const LANG_KEY = "nw_lang";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ja" || saved === "en") return saved;
  } catch (_) {}
  return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

let currentLang = initialLang();
let currentCat = "wash";
let lastSymbol = null;
let ocrObjectUrl = null;

function norm(s) {
  return (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
}

function clearNode(node) {
  if (!node) return;
  while (node.firstChild) node.removeChild(node.firstChild);
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "nw-toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 180);
  }, 2200);
}

function setOcrStatus(message) {
  if (ocrStatus) ocrStatus.textContent = message || "";
}

function symbolSearchText(sym) {
  const ja = sym.ja ? `${sym.ja.summary} ${sym.ja.detail}` : "";
  const en = sym.en ? `${sym.en.summary} ${sym.en.detail}` : "";
  const id = sym.id || "";
  const jis = sym.jis || "";
  const cat = sym.cat || "";
  const code = sanitizeCode(sym.m?.code);
  const temp = sanitizeTemp(sym.m?.temp);
  return norm([id, jis, cat, code, temp === null ? "" : temp, ja, en].join(" "));
}

function sanitizeCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[PFW]$/.test(code) ? code : "";
}

function sanitizeTemp(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 200) return null;
  return Math.round(n);
}

function sanitizeCount(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function copyTextFallback(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
  ta.remove();
  return ok;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }
  return copyTextFallback(text);
}

function applyLang(lang) {
  currentLang = lang === "en" ? "en" : "ja";
  try { localStorage.setItem(LANG_KEY, currentLang); } catch (_) {}
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.style.display = el.dataset.i18n === currentLang ? "" : "none";
  });
  document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === currentLang);
  });

  if (copyBtn) copyBtn.textContent = currentLang === "ja" ? "結果をコピー" : "Copy result";
  if (lastSymbol) showResult(lastSymbol, false);
  renderSymbols();
}

function setCategory(cat) {
  currentCat = cat;
  document.querySelectorAll(".cat-tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === currentCat);
  });
  renderSymbols();
}

function getSymbolText(sym) {
  return sym[currentLang] || sym.en || sym.ja || { summary: "", detail: "" };
}

function cautionText() {
  return currentLang === "ja"
    ? "注意：JIS L 0001:2024（2024年8月20日以降）の表示を基準にした参考情報です。実物の衣類タグ、メーカー表示、素材表示、クリーニング店の指示を優先してください。古い表示や海外表示は異なる場合があります。"
    : "Note: This reference follows JIS L 0001:2024 used in Japan from August 20, 2024. Prioritize the actual garment label, maker instructions, fabric notes, and professional cleaner guidance. Older and overseas labels may differ.";
}

function showResult(sym, doScroll = true) {
  if (!result || !summaryEl || !detailEl) return;
  lastSymbol = sym;
  const t = getSymbolText(sym);
  summaryEl.textContent = t.summary;
  detailEl.textContent = sym.jis ? `${t.detail} ${currentLang === "ja" ? "記号番号" : "Symbol No."}: ${sym.jis}` : t.detail;
  result.classList.remove("hidden");
  if (doScroll) result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function svgWrap(inner) {
  return `
  <svg class="symbol-ico" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
    fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    ${inner}
  </svg>`;
}

function drawCross() {
  return `<path d="M13 14 L51 50" /><path d="M51 14 L13 50" />`;
}

function drawUnderlines(count, y1 = 55, y2 = 60) {
  const first = count >= 1 ? `<path d="M20 ${y1} H44" />` : "";
  const second = count >= 2 ? `<path d="M20 ${y2} H44" />` : "";
  return first + second;
}

function renderSymbolSVG(sym) {
  const raw = sym.m || {};
  const m = {
    temp: sanitizeTemp(raw.temp),
    underline: sanitizeCount(raw.underline, 0, 2),
    dots: sanitizeCount(raw.dots, 0, 3),
    code: sanitizeCode(raw.code),
    hand: raw.hand === true,
    no: raw.no === true,
    nonchlorine: raw.nonchlorine === true,
    tumble: raw.tumble === true,
    verticalLines: sanitizeCount(raw.verticalLines, 0, 2),
    horizontalLines: sanitizeCount(raw.horizontalLines, 0, 2),
    shade: raw.shade === true,
    steamNo: raw.steamNo === true
  };

  if (sym.cat === "wash") {
    const tub = `<path d="M15 23 Q19 20 23 23 Q27 26 31 23 Q35 20 39 23 Q43 26 49 23" /><path d="M17 24 L22 49 H42 L47 24" />`;
    const hand = m.hand
      ? `<path d="M31 41 V28 M35 41 V27 M39 41 V30 M27 40 V31 M27 39 Q24 36 22 38 Q25 46 31 47 Q39 47 42 39 L43 34" />`
      : "";
    const temp = !m.hand && m.temp !== null
      ? `<text x="32" y="42" text-anchor="middle" font-size="15" fill="currentColor" stroke="none">${m.temp}</text>`
      : "";
    return svgWrap(`${tub}${hand}${temp}${drawUnderlines(m.underline)}${m.no ? drawCross() : ""}`);
  }

  if (sym.cat === "bleach") {
    const tri = `<path d="M32 14 L51 49 H13 Z" />`;
    const nonchlorine = m.nonchlorine
      ? `<path d="M22 43 L34 22" /><path d="M31 47 L43 26" />`
      : "";
    return svgWrap(`${tri}${nonchlorine}${m.no ? drawCross() : ""}`);
  }

  if (sym.cat === "dry") {
    const square = `<rect x="14" y="14" width="36" height="36" />`;
    if (m.tumble) {
      const circle = `<circle cx="32" cy="32" r="12" />`;
      const dotXs = m.dots === 1 ? [32] : m.dots === 2 ? [28, 36] : m.dots === 3 ? [26, 32, 38] : [];
      const dots = dotXs.map((x) => `<circle cx="${x}" cy="32" r="2.3" fill="currentColor" stroke="none" />`).join("");
      return svgWrap(`${square}${circle}${dots}${m.no ? drawCross() : ""}`);
    }

    const vertical = m.verticalLines === 1
      ? `<path d="M32 20 V44" />`
      : m.verticalLines === 2
        ? `<path d="M27 20 V44" /><path d="M37 20 V44" />`
        : "";
    const horizontal = m.horizontalLines === 1
      ? `<path d="M20 32 H44" />`
      : m.horizontalLines === 2
        ? `<path d="M20 27 H44" /><path d="M20 37 H44" />`
        : "";
    const shade = m.shade ? `<path d="M15 30 L30 15" />` : "";
    return svgWrap(`${square}${vertical}${horizontal}${shade}`);
  }

  if (sym.cat === "iron") {
    const iron = `<path d="M14 41 H50 L47 49 H16 Z" /><path d="M18 41 Q21 24 34 24 H43 Q47 24 47 30 V41" /><path d="M23 19 H41" />`;
    const dotXs = m.dots === 1 ? [32] : m.dots === 2 ? [28, 36] : m.dots === 3 ? [25, 32, 39] : [];
    const dots = dotXs.map((x) => `<circle cx="${x}" cy="34" r="2.2" fill="currentColor" stroke="none" />`).join("");
    const steamNo = m.steamNo
      ? `<path d="M24 52 q-4 4 0 8" /><path d="M32 52 q-4 4 0 8" /><path d="M40 52 q-4 4 0 8" /><path d="M20 51 L44 62" /><path d="M44 51 L20 62" />`
      : "";
    return svgWrap(`${iron}${dots}${steamNo}${m.no ? drawCross() : ""}`);
  }

  if (sym.cat === "dryclean") {
    const circle = `<circle cx="32" cy="30" r="16" />`;
    const letter = m.code ? `<text x="32" y="37" text-anchor="middle" font-size="22" fill="currentColor" stroke="none">${m.code}</text>` : "";
    return svgWrap(`${circle}${letter}${drawUnderlines(m.underline, 51, 58)}${m.no ? drawCross() : ""}`);
  }

  return svgWrap(`<rect x="14" y="14" width="36" height="36" rx="6" />`);
}

function createSymbolSvgElement(sym) {
  const svgStr = renderSymbolSVG(sym);
  const doc = new DOMParser().parseFromString(svgStr, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    const fallback = document.createElement("span");
    fallback.className = "symbol-ico symbol-ico-fallback";
    fallback.textContent = "□";
    return fallback;
  }
  return document.importNode(doc.documentElement, true);
}

function renderSymbols() {
  if (!Array.isArray(window.SYMBOLS) || !grid) return;
  clearNode(grid);

  const q = norm(qEl?.value || "");
  const searchAll = !!searchAllEl?.checked;
  let list = window.SYMBOLS;
  if (!searchAll) list = list.filter((s) => s.cat === currentCat);
  if (q) list = list.filter((sym) => symbolSearchText(sym).includes(q));

  if (list.length === 0) {
    const div = document.createElement("div");
    div.className = "nw-empty";
    div.textContent = currentLang === "ja"
      ? "一致する記号が見つかりません。検索語を変えるか「全カテゴリ」を試してください。"
      : "No matching symbols. Try a different query or enable “All”.";
    grid.appendChild(div);
    return;
  }

  list.forEach((sym) => {
    const btn = document.createElement("button");
    btn.className = "symbol-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", `${getSymbolText(sym).summary}${sym.jis ? ` (${sym.jis})` : ""}`);
    btn.appendChild(createSymbolSvgElement(sym));

    const caption = document.createElement("div");
    caption.className = "symbol-caption";
    caption.textContent = getSymbolText(sym).summary;
    btn.appendChild(caption);

    btn.addEventListener("click", () => showResult(sym));
    grid.appendChild(btn);
  });
}

function svgToCanvas(sym, size = 96) {
  const svgStr = renderSymbolSVG(sym);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function preprocessToBWCanvas(img, size = 96) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(size / iw, size / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  const data = ctx.getImageData(0, 0, size, size);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = g < 180 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function mseCanvas(a, b) {
  const ca = a.getContext("2d").getImageData(0, 0, a.width, a.height).data;
  const cb = b.getContext("2d").getImageData(0, 0, b.width, b.height).data;
  let sum = 0;
  for (let i = 0; i < ca.length; i += 4) {
    const diff = ca[i] - cb[i];
    sum += diff * diff;
  }
  return sum / (a.width * a.height);
}

async function runPhotoCandidates() {
  clearNode(candGrid);

  if (!ocrPreviewImg?.src || !ocrPreviewImg.complete || !ocrPreviewImg.naturalWidth) {
    const message = currentLang === "ja" ? "先に画像を選択してください。" : "Choose an image first.";
    setOcrStatus(message);
    toast(message);
    return;
  }

  const list = window.SYMBOLS || [];
  if (list.length === 0) return;
  const useAllCategories = !!ocrAllEl?.checked || !!searchAllEl?.checked;
  const candidates = useAllCategories ? list : list.filter((s) => s.cat === currentCat);

  if (candidates.length === 0) {
    setOcrStatus(currentLang === "ja" ? "候補がありません。カテゴリを変えてください。" : "No candidates. Change category.");
    return;
  }

  setOcrStatus(currentLang === "ja" ? "候補を比較中です…" : "Comparing candidates…");
  const inputBW = preprocessToBWCanvas(ocrPreviewImg, 96);
  const scored = [];

  try {
    for (const sym of candidates) {
      const tpl = await svgToCanvas(sym, 96);
      scored.push({ sym, score: mseCanvas(inputBW, tpl) });
    }
  } catch (_) {
    const message = currentLang === "ja" ? "画像比較に失敗しました。別の画像で試してください。" : "Candidate comparison failed. Try another image.";
    setOcrStatus(message);
    toast(message);
    return;
  }

  scored.sort((a, b) => a.score - b.score);
  const top = scored.slice(0, 3);
  if (top.length === 0) {
    setOcrStatus(currentLang === "ja" ? "候補が見つかりませんでした。" : "No candidates found.");
    return;
  }

  setOcrStatus(useAllCategories
    ? (currentLang === "ja" ? "全カテゴリからの候補です。scoreは参考値です。" : "Candidates are from all categories. Scores are reference values only.")
    : (currentLang === "ja" ? "現在カテゴリ内の候補です。scoreは参考値です。" : "Candidates are from the current category. Scores are reference values only."));

  top.forEach(({ sym, score }) => {
    const div = document.createElement("button");
    div.className = "ocr-cand";
    div.type = "button";
    div.appendChild(createSymbolSvgElement(sym));

    const label = document.createElement("div");
    label.className = "ocr-cand-label";
    label.textContent = getSymbolText(sym).summary;
    div.appendChild(label);

    const scoreEl = document.createElement("div");
    scoreEl.className = "ocr-score";
    scoreEl.textContent = `score: ${Math.round(score)} (${currentLang === "ja" ? "参考値" : "ref"})`;
    div.appendChild(scoreEl);

    div.addEventListener("click", () => showResult(sym));
    candGrid.appendChild(div);
  });
}

function revokeOcrObjectUrl() {
  if (!ocrObjectUrl) return;
  URL.revokeObjectURL(ocrObjectUrl);
  ocrObjectUrl = null;
}

function clearPhotoCandidateState() {
  revokeOcrObjectUrl();
  if (ocrFile) ocrFile.value = "";
  if (ocrPreviewImg) {
    ocrPreviewImg.removeAttribute("src");
    ocrPreviewImg.style.display = "none";
  }
  clearNode(candGrid);
  setOcrStatus("");
}

function handleImageFile(file) {
  clearNode(candGrid);
  setOcrStatus("");
  revokeOcrObjectUrl();
  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    const message = currentLang === "ja" ? "PNG / JPEG / WebP / GIF の画像を選択してください。" : "Choose a PNG, JPEG, WebP, or GIF image.";
    if (ocrFile) ocrFile.value = "";
    toast(message);
    setOcrStatus(message);
    return;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const message = currentLang === "ja" ? "画像が大きすぎます。10MB以下の画像を選択してください。" : "The image is too large. Choose an image under 10 MB.";
    if (ocrFile) ocrFile.value = "";
    toast(message);
    setOcrStatus(message);
    return;
  }

  const url = URL.createObjectURL(file);
  ocrObjectUrl = url;
  ocrPreviewImg.onload = () => {
    ocrPreviewImg.style.display = "block";
    revokeOcrObjectUrl();
    setOcrStatus(currentLang === "ja" ? "画像を読み込みました。候補検索を実行してください。" : "Image loaded. Run candidate search.");
  };
  ocrPreviewImg.onerror = () => {
    const message = currentLang === "ja" ? "画像を読み込めませんでした。別の画像で試してください。" : "Could not load the image. Try another file.";
    clearPhotoCandidateState();
    toast(message);
    setOcrStatus(message);
  };
  ocrPreviewImg.src = url;
}

document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});
document.querySelectorAll(".cat-tab").forEach((btn) => {
  btn.addEventListener("click", () => setCategory(btn.dataset.cat));
});

qEl?.addEventListener("input", renderSymbols);
searchAllEl?.addEventListener("change", renderSymbols);
ocrFile?.addEventListener("change", (e) => handleImageFile(e.target.files?.[0]));
ocrRun?.addEventListener("click", runPhotoCandidates);
ocrClear?.addEventListener("click", clearPhotoCandidateState);

copyBtn?.addEventListener("click", async () => {
  if (!lastSymbol) return;
  const t = getSymbolText(lastSymbol);
  const text = [
    "Laundry Code Decode",
    `JIS L 0001:2024 / ${currentLang === "ja" ? "記号番号" : "Symbol No."}: ${lastSymbol.jis || "-"}`,
    currentLang === "ja" ? `意味: ${t.summary}` : `Meaning: ${t.summary}`,
    currentLang === "ja" ? `詳細: ${t.detail}` : `Detail: ${t.detail}`,
    cautionText()
  ].join("\n");

  const ok = await copyText(text);
  toast(ok
    ? (currentLang === "ja" ? "結果をコピーしました。" : "Result copied.")
    : (currentLang === "ja" ? "コピーに失敗しました。手動で選択してください。" : "Copy failed. Select the text manually."));
});

window.addEventListener("beforeunload", revokeOcrObjectUrl);

document.addEventListener("DOMContentLoaded", () => {
  applyLang(currentLang);
  setCategory(currentCat);
  renderSymbols();
});
