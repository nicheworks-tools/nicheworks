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
  return (s || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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
  if (!ocrStatus) return;
  ocrStatus.textContent = message || "";
}

function symbolSearchText(sym) {
  const ja = sym.ja ? `${sym.ja.summary} ${sym.ja.detail}` : "";
  const en = sym.en ? `${sym.en.summary} ${sym.en.detail}` : "";
  const id = sym.id || "";
  const cat = sym.cat || "";
  const code = sanitizeCode(sym.m?.code);
  const temp = sanitizeTemp(sym.m?.temp);
  return norm([id, cat, code, temp === null ? "" : temp, ja, en].join(" "));
}

function sanitizeCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[APFW]$/.test(code) ? code : "";
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
  try {
    ok = document.execCommand("copy");
  } catch (_) {
    ok = false;
  }
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
  try {
    localStorage.setItem(LANG_KEY, currentLang);
  } catch (_) {}

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
    ? "注意：この結果は一般的な洗濯表示の参考情報です。衣類タグ、メーカー表示、素材表示、クリーニング店の指示を優先してください。国・地域・年代により意味が異なる場合があります。"
    : "Note: This is general reference information for care symbols. Prioritize the garment label, maker instructions, fabric notes, and professional cleaner guidance. Meaning can vary by country, region, and era.";
}

function showResult(sym, doScroll = true) {
  lastSymbol = sym;
  const t = getSymbolText(sym);
  summaryEl.textContent = t.summary;
  detailEl.textContent = t.detail;
  result.classList.remove("hidden");
  if (doScroll) result.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ===============================
 * SVG generator (tag-like symbols)
 * =============================== */

function svgWrap(inner) {
  return `
  <svg class="symbol-ico" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
    fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    ${inner}
  </svg>`;
}

function drawCross() {
  return `<path d="M14 14 L50 50" /><path d="M50 14 L14 50" />`;
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
    allow: raw.allow === true,
    nonchlorine: raw.nonchlorine === true,
    tumble: raw.tumble === true,
    line: raw.line === true,
    drip: raw.drip === true,
    flat: raw.flat === true,
    shade: raw.shade === true,
    steamNo: raw.steamNo === true
  };
  const cat = sym.cat;

  if (cat === "wash") {
    const tub = `
      <path d="M18 26 Q20 22 24 22 H40 Q44 22 46 26" />
      <path d="M16 26 H48" />
      <path d="M18 26 L22 52 H42 L46 26" />
    `;
    const hand = m.hand ? `<path d="M26 38 q2-8 8-8 q6 0 6 8" />` : "";
    const temp = m.temp !== null
      ? `<text x="32" y="45" text-anchor="middle" font-size="16" fill="currentColor" stroke="none">${m.temp}</text>`
      : "";
    const u1 = m.underline >= 1 ? `<path d="M20 56 H44" />` : "";
    const u2 = m.underline >= 2 ? `<path d="M20 60 H44" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${tub}${hand}${temp}${u1}${u2}${cross}`);
  }

  if (cat === "bleach") {
    const tri = `<path d="M32 16 L50 50 H14 Z" />`;
    const nonCl = m.nonchlorine ? `<path d="M20 40 L44 40" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${tri}${nonCl}${cross}`);
  }

  if (cat === "dry") {
    const sq = `<rect x="14" y="14" width="36" height="36" rx="2" />`;

    if (m.tumble) {
      const circ = `<circle cx="32" cy="32" r="12" />`;
      const dots = (n) => {
        if (!n) return "";
        const xs = n === 1 ? [32] : n === 2 ? [28, 36] : [26, 32, 38];
        return xs.map(x => `<circle cx="${x}" cy="22" r="2.4" fill="currentColor" stroke="none" />`).join("");
      };
      const cross = m.no ? drawCross() : "";
      return svgWrap(`${sq}${circ}${dots(m.dots)}${cross}`);
    }

    const line = m.line ? `<path d="M32 14 V50" />` : "";
    const drip = m.drip ? `<path d="M26 30 V50" /><path d="M32 30 V50" /><path d="M38 30 V50" />` : "";
    const flat = m.flat ? `<path d="M18 40 H46" />` : "";
    const shade = m.shade ? `<path d="M14 14 L50 14 L14 50 Z" fill="currentColor" stroke="none" opacity="0.14" />` : "";
    return svgWrap(`${sq}${line}${drip}${flat}${shade}`);
  }

  if (cat === "iron") {
    const iron = `
      <path d="M18 40 H50" />
      <path d="M22 40 Q24 24 38 24 H44 Q48 24 48 28 V40" />
      <path d="M20 40 L18 48 H50" />
    `;
    const dots = (n) => {
      if (!n) return "";
      const xs = n === 1 ? [30] : n === 2 ? [26, 34] : [24, 32, 40];
      return xs.map(x => `<circle cx="${x}" cy="34" r="2.4" fill="currentColor" stroke="none" />`).join("");
    };
    const steamNo = m.steamNo ? `<path d="M52 20 q-6 6 0 12" /><path d="M50 18 L58 26" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${iron}${dots(m.dots)}${steamNo}${cross}`);
  }

  if (cat === "dryclean") {
    const circ = `<circle cx="32" cy="32" r="16" />`;
    const letter = m.code ? `<text x="32" y="38" text-anchor="middle" font-size="18" fill="currentColor" stroke="none">${m.code}</text>` : "";
    const u1 = m.underline >= 1 ? `<path d="M20 52 H44" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${circ}${letter}${u1}${cross}`);
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

/* ===============================
 * Render grid (category + search)
 * =============================== */

function renderSymbols() {
  if (!Array.isArray(window.SYMBOLS) || !grid) return;

  clearNode(grid);

  const q = norm(qEl?.value || "");
  const searchAll = !!searchAllEl?.checked;

  let list = window.SYMBOLS;
  if (!searchAll) list = list.filter(s => s.cat === currentCat);
  if (q) list = list.filter(sym => symbolSearchText(sym).includes(q));

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
    btn.appendChild(createSymbolSvgElement(sym));

    const caption = document.createElement("div");
    caption.className = "symbol-caption";
    caption.textContent = getSymbolText(sym).summary;
    btn.appendChild(caption);

    btn.addEventListener("click", () => showResult(sym));
    grid.appendChild(btn);
  });
}

/* ===============================
 * Photo candidate search: simple template matching
 * =============================== */

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
  const candidates = useAllCategories ? list : list.filter(s => s.cat === currentCat);

  if (candidates.length === 0) {
    const message = currentLang === "ja"
      ? "候補がありません。カテゴリを変えるか「全カテゴリで探す」を試してください。"
      : "No candidates. Change category or enable all categories.";
    setOcrStatus(message);
    return;
  }

  setOcrStatus(currentLang === "ja" ? "候補を比較中です…" : "Comparing candidates…");

  const inputBW = preprocessToBWCanvas(ocrPreviewImg, 96);
  const scored = [];

  try {
    for (const sym of candidates) {
      const tpl = await svgToCanvas(sym, 96);
      const score = mseCanvas(inputBW, tpl);
      scored.push({ sym, score });
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
    const message = currentLang === "ja" ? "候補が見つかりませんでした。" : "No candidates found.";
    setOcrStatus(message);
    return;
  }

  const modeText = useAllCategories
    ? (currentLang === "ja" ? "全カテゴリからの候補です。scoreは参考値です。" : "Candidates are from all categories. Scores are only reference values.")
    : (currentLang === "ja" ? "現在カテゴリ内の候補です。scoreは参考値です。" : "Candidates are from the current category. Scores are only reference values.");
  setOcrStatus(modeText);

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

/* ===============================
 * Events
 * =============================== */

document.querySelectorAll(".nw-lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});
document.querySelectorAll(".cat-tab").forEach(btn => {
  btn.addEventListener("click", () => setCategory(btn.dataset.cat));
});

qEl?.addEventListener("input", () => renderSymbols());
searchAllEl?.addEventListener("change", () => renderSymbols());

ocrFile?.addEventListener("change", (e) => {
  handleImageFile(e.target.files?.[0]);
});

ocrRun?.addEventListener("click", async () => {
  await runPhotoCandidates();
});

ocrClear?.addEventListener("click", () => {
  clearPhotoCandidateState();
});

copyBtn?.addEventListener("click", async () => {
  if (!lastSymbol) return;
  const t = getSymbolText(lastSymbol);
  const text = [
    "Laundry Code Decode",
    `ID: ${lastSymbol.id || ""}`,
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
