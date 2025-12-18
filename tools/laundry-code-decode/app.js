const grid = document.getElementById("symbolGrid");
const result = document.getElementById("result");
const summaryEl = document.getElementById("resultSummary");
const detailEl = document.getElementById("resultDetail");

const candGrid = document.getElementById("ocrCandidatesGrid");
const ocrFile = document.getElementById("ocrFile");
const ocrRun = document.getElementById("ocrRun");
const ocrPreviewImg = document.getElementById("ocrPreviewImg");

let currentLang = (navigator.language || "").startsWith("ja") ? "ja" : "en";
let currentCat = "wash";
let lastSymbol = null;

function applyLang(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.style.display = el.dataset.i18n === currentLang ? "" : "none";
  });
  document.querySelectorAll(".nw-lang-switch button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === currentLang);
  });

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

function showResult(sym, doScroll = true) {
  lastSymbol = sym;
  const t = sym[currentLang] || sym.en || sym.ja;
  summaryEl.textContent = t.summary;
  detailEl.textContent = t.detail;
  result.classList.remove("hidden");
  if (doScroll) result.scrollIntoView({ behavior: "smooth" });
}

// ===============================
// SVG generator (tag-like symbols)
// ===============================
function svgWrap(inner) {
  return `
  <svg class="symbol-ico" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"
    fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
    ${inner}
  </svg>`;
}

function drawCross() {
  return `<path d="M14 14 L50 50" /><path d="M50 14 L14 50" />`;
}

function renderSymbolSVG(sym) {
  const m = sym.m || {};
  const cat = sym.cat;

  // WASH = tub
  if (cat === "wash") {
    const tub = `
      <path d="M18 26 Q20 22 24 22 H40 Q44 22 46 26" />
      <path d="M16 26 H48" />
      <path d="M18 26 L22 52 H42 L46 26" />
    `;
    const hand = m.hand ? `<path d="M26 38 q2-8 8-8 q6 0 6 8" />` : "";
    const temp = (typeof m.temp === "number") ? `<text x="32" y="45" text-anchor="middle" font-size="16" fill="currentColor" stroke="none">${m.temp}</text>` : "";
    const u1 = m.underline >= 1 ? `<path d="M20 56 H44" />` : "";
    const u2 = m.underline >= 2 ? `<path d="M20 60 H44" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${tub}${hand}${temp}${u1}${u2}${cross}`);
  }

  // BLEACH = triangle
  if (cat === "bleach") {
    const tri = `<path d="M32 16 L50 50 H14 Z" />`;
    const nonCl = m.nonchlorine ? `<path d="M20 40 L44 40" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${tri}${nonCl}${cross}`);
  }

  // DRY = tumble (square + circle) OR natural dry (square + lines)
  if (cat === "dry") {
    const sq = `<rect x="14" y="14" width="36" height="36" rx="2" />`;

    // tumble
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

    // natural
    const line = m.line ? `<path d="M32 14 V50" />` : "";
    const drip = m.drip ? `<path d="M26 30 V50" /><path d="M32 30 V50" /><path d="M38 30 V50" />` : "";
    const flat = m.flat ? `<path d="M18 40 H46" />` : "";
    const shade = m.shade ? `<path d="M14 14 L50 14 L14 50 Z" opacity="0.25" />` : "";
    return svgWrap(`${sq}${line}${drip}${flat}${shade}`);
  }

  // IRON
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

  // DRY CLEAN = circle + letter
  if (cat === "dryclean") {
    const circ = `<circle cx="32" cy="32" r="16" />`;
    const letter = m.code ? `<text x="32" y="38" text-anchor="middle" font-size="18" fill="currentColor" stroke="none">${m.code}</text>` : "";
    const u1 = m.underline >= 1 ? `<path d="M20 52 H44" />` : "";
    const cross = m.no ? drawCross() : "";
    return svgWrap(`${circ}${letter}${u1}${cross}`);
  }

  // fallback
  return svgWrap(`<rect x="14" y="14" width="36" height="36" rx="6" />`);
}

// ===============================
// Render grid
// ===============================
function renderSymbols() {
  if (!Array.isArray(window.SYMBOLS)) return;

  grid.innerHTML = "";
  const list = window.SYMBOLS.filter(s => s.cat === currentCat);

  list.forEach((sym) => {
    const btn = document.createElement("button");
    btn.className = "symbol-btn";
    btn.type = "button";
    btn.innerHTML = `
      ${renderSymbolSVG(sym)}
      <div class="symbol-caption">${(sym[currentLang] || sym.en || sym.ja).summary}</div>
    `;
    btn.addEventListener("click", () => showResult(sym));
    grid.appendChild(btn);
  });
}

// ===============================
// OCR Beta: template matching (top3)
// ===============================
function svgToCanvas(sym, size = 96) {
  const svgStr = renderSymbolSVG(sym)
    .replace('class="symbol-ico"', '')
    .replace('width="44"', '')
    .replace('height="44"', '');

  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d");
      ctx.clearRect(0,0,size,size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function preprocessToBWCanvas(img, size = 96) {
  // center-crop-ish: draw cover
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
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

  // grayscale + threshold
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
    const v = g < 180 ? 0 : 255; // rough threshold
    d[i] = d[i+1] = d[i+2] = v;
    d[i+3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function mseCanvas(a, b) {
  const ca = a.getContext("2d").getImageData(0,0,a.width,a.height).data;
  const cb = b.getContext("2d").getImageData(0,0,b.width,b.height).data;
  let sum = 0;
  for (let i = 0; i < ca.length; i += 4) {
    const da = ca[i]; // BWなので1chでOK
    const db = cb[i];
    const diff = da - db;
    sum += diff * diff;
  }
  return sum / (a.width * a.height);
}

async function runOCRCandidates() {
  candGrid.innerHTML = "";
  if (!ocrPreviewImg.src) return;

  const list = window.SYMBOLS || [];
  if (list.length === 0) return;

  // 画像をBW化
  const inputBW = preprocessToBWCanvas(ocrPreviewImg, 96);

  // 現カテゴリだけ比較（まずは使いやすい）
  const candidates = list.filter(s => s.cat === currentCat);

  // テンプレ生成→比較
  const scored = [];
  for (const sym of candidates) {
    const tpl = await svgToCanvas(sym, 96);
    const score = mseCanvas(inputBW, tpl);
    scored.push({ sym, score });
  }

  scored.sort((a,b) => a.score - b.score);
  const top = scored.slice(0, 3);

  top.forEach(({ sym, score }) => {
    const div = document.createElement("div");
    div.className = "ocr-cand";
    div.innerHTML = `
      ${renderSymbolSVG(sym)}
      <div class="ocr-score">score: ${Math.round(score)}</div>
    `;
    div.addEventListener("click", () => showResult(sym));
    candGrid.appendChild(div);
  });
}

// ===============================
// Events
// ===============================
document.querySelectorAll(".nw-lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});
document.querySelectorAll(".cat-tab").forEach(btn => {
  btn.addEventListener("click", () => setCategory(btn.dataset.cat));
});

ocrFile?.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  ocrPreviewImg.src = url;
  ocrPreviewImg.style.display = "block";
});

ocrRun?.addEventListener("click", async () => {
  await runOCRCandidates();
});

document.addEventListener("DOMContentLoaded", () => {
  applyLang(currentLang);
  setCategory(currentCat);
  renderSymbols();
});
