/*
  NicheWorks｜API Key & Token Redactor
  Free MVP: detect + preview masking (non-guaranteed)
  Note: Pro features (full safe output, rules, history, download) are not implemented in this MVP.
*/

const patterns = [
  // OpenAI keys (best-effort)
  { name: "OpenAI API Key", regex: /sk-[A-Za-z0-9]{20,}/g },

  // Stripe
  { name: "Stripe Secret Key", regex: /sk_live_[A-Za-z0-9]{20,}/g },
  { name: "Stripe Restricted Key", regex: /rk_live_[A-Za-z0-9]{20,}/g },

  // AWS Access Key ID
  { name: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/g },

  // GitHub tokens
  { name: "GitHub Token", regex: /gh[pous]_[A-Za-z0-9]{36,}/g },

  // JWT (3 segments)
  { name: "JWT", regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },

  // Generic long bearer-ish token (very loose, keep last 4)
  { name: "Token-like", regex: /(?:bearer\s+)?[A-Za-z0-9_\-]{32,}\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}/gi }
];

const input = document.getElementById("inputText");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultSection = document.getElementById("resultSection");
const summary = document.getElementById("summary");
const output = document.getElementById("maskedOutput");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");
const copyStatus = document.getElementById("copyStatus");

// Language switch (Common Spec v2)
(function initLangSwitch(){
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    current = lang;
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(current);
})();

function maskPreview(str) {
  // Preview mask: keep first 4, last 4 if long enough
  const s = String(str);
  if (s.length <= 10) return "[REDACTED]";
  const head = s.slice(0, 4);
  const tail = s.slice(-4);
  return `${head}…${tail}`;
}

function scanAndMask(text) {
  let masked = text;
  const hits = [];

  patterns.forEach((p) => {
    masked = masked.replace(p.regex, (m) => {
      hits.push({ type: p.name, sample: maskPreview(m) });
      return maskPreview(m);
    });
  });

  return { masked, hits };
}

function renderSummary(hits) {
  if (hits.length === 0) {
    summary.textContent = "検出件数：0（よくあるパターンは見つかりませんでした）";
    return;
  }
  const byType = new Map();
  for (const h of hits) {
    byType.set(h.type, (byType.get(h.type) || 0) + 1);
  }
  const parts = Array.from(byType.entries()).map(([k, v]) => `${k}: ${v}`);
  summary.textContent = `検出件数：${hits.length}（${parts.join(" / ")}）`;
}

analyzeBtn.addEventListener("click", () => {
  copyStatus.textContent = "";
  const text = input.value || "";
  const { masked, hits } = scanAndMask(text);

  renderSummary(hits);
  output.textContent = masked;
  resultSection.hidden = false;

  // Scroll into results for mobile
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

resetBtn.addEventListener("click", () => {
  input.value = "";
  output.textContent = "";
  summary.textContent = "";
  copyStatus.textContent = "";
  resultSection.hidden = true;
  input.focus();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.textContent || "");
    copyStatus.textContent = "コピーしました";
  } catch (e) {
    copyStatus.textContent = "コピーに失敗しました（ブラウザの権限設定をご確認ください）";
  }
});
