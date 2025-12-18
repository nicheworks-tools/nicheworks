// ===========================
// API Key & Token Redactor (NicheWorks)
// app.js (MVP + Stripe lightweight Pro unlock)
// ===========================

import { DEFAULT_PRO_RULES, scanAndRedact } from "./src/core.js";

// Stripe Payment Link（あなたが作成したURL）
const PRO_PAYMENT_URL = "https://buy.stripe.com/28E5kFezD0HXcO98wvcV205";

// Pro unlock flag（静的サイト用：軽量解除）
const PRO_FLAG_KEY = "nw_api_key_redactor_pro_v1";
const PRO_RULES_KEY = "nw_api_key_redactor_rules_v1";

// ---------------------------
// i18n (JP/EN) switch
// ---------------------------
function initLangSwitch() {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");

  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

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

// ---------------------------
// Pro helpers
// ---------------------------
function isProEnabled() {
  return localStorage.getItem(PRO_FLAG_KEY) === "1";
}
function enablePro() {
  localStorage.setItem(PRO_FLAG_KEY, "1");
}

function getProRules() {
  try {
    const raw = localStorage.getItem(PRO_RULES_KEY);
    if (!raw) return { ...DEFAULT_PRO_RULES };
    const obj = JSON.parse(raw);
    return {
      mode: obj.mode === "replace_all" ? "replace_all" : "keep_last",
      keepLastN: Number.isFinite(Number(obj.keepLastN))
        ? Math.max(0, Number(obj.keepLastN))
        : DEFAULT_PRO_RULES.keepLastN,
      replaceText:
        typeof obj.replaceText === "string" && obj.replaceText.length
          ? obj.replaceText
          : DEFAULT_PRO_RULES.replaceText,
    };
  } catch {
    return { ...DEFAULT_PRO_RULES };
  }
}
function setProRules(rules) {
  localStorage.setItem(PRO_RULES_KEY, JSON.stringify(rules));
}

// Stripe success_url で戻ってきた時に ?pro=1 を消費してPro化（URLも綺麗にする）
function consumeProQueryParam() {
  const url = new URL(location.href);
  if (url.searchParams.get("pro") === "1") {
    enablePro();
    url.searchParams.delete("pro");
    history.replaceState({}, "", url.toString());
    return true;
  }
  return false;
}

// ---------------------------
// UI helpers
// ---------------------------
const el = (id) => document.getElementById(id);

function setBusy(isBusy) {
  const p = el("progress");
  if (p) p.hidden = !isBusy;
  const b = el("analyzeBtn");
  if (b) b.disabled = isBusy;
}

function showToast(msg) {
  const t = el("copyToast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => (t.hidden = true), 1200);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------------------------

// ---------------------------
// Main
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  initLangSwitch();

  // 初期表示で「検出中」を絶対に消す
  setBusy(false);

  // Stripe success_url から戻った時に Pro化
  const activatedNow = consumeProQueryParam();

  const input = el("inputText");
  const analyzeBtn = el("analyzeBtn");
  const clearBtn = el("clearBtn");

  const resultSection = el("resultSection");
  const totalFound = el("totalFound");
  const typesFound = el("typesFound");
  const hitList = el("hitList");
  const maskedOutput = el("maskedOutput");

  const copyBtn = el("copyBtn");
  const downloadBtn = el("downloadBtn");
  const resetBtn = el("resetBtn");

  // Pro badge（index.html 側は id="proBadge" / 通常hidden）
  const proBadge = el("proBadge");

  function refreshProBadge() {
    if (!proBadge) return;
    const on = isProEnabled();
    proBadge.hidden = !on;          // Proのときだけ表示
    proBadge.classList.toggle("is-pro", on);
  }

  refreshProBadge();
  if (activatedNow) {
    refreshProBadge();
    showToast("Pro enabled");
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (input) input.value = "";
      if (input) input.focus();
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      const text = (input && input.value) ? input.value : "";

      setBusy(true);
      try {
        const pro = isProEnabled();
        const rules = getProRules();
        const res = scanAndRedact(text, pro, rules);

        if (totalFound) totalFound.textContent = String(res.total);
        if (typesFound) typesFound.textContent = String(res.types);

        if (hitList) {
          hitList.innerHTML = "";
          const entries = Object.values(res.hits).sort((a, b) => b.count - a.count);

          if (entries.length === 0) {
            const div = document.createElement("div");
            div.className = "hit-item";
            div.innerHTML = `<span class="hit-name">No obvious secrets found</span><span class="hit-count">0</span>`;
            hitList.appendChild(div);
          } else {
            for (const h of entries) {
              const div = document.createElement("div");
              div.className = "hit-item";
              div.innerHTML = `<span class="hit-name">${escapeHtml(h.label)}</span><span class="hit-count">${h.count}</span>`;
              hitList.appendChild(div);
            }
          }
        }

        if (maskedOutput) maskedOutput.textContent = res.output;
        if (resultSection) resultSection.hidden = false;
        if (resultSection) resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } finally {
        setBusy(false);
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = maskedOutput ? (maskedOutput.textContent || "") : "";
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied");
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast("Copied");
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const text = maskedOutput ? (maskedOutput.textContent || "") : "";
      const name = `redacted-${new Date().toISOString().slice(0, 10)}.txt`;
      downloadText(name, text);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (input) input.value = "";
      if (maskedOutput) maskedOutput.textContent = "";
      if (hitList) hitList.innerHTML = "";
      if (totalFound) totalFound.textContent = "0";
      if (typesFound) typesFound.textContent = "0";
      if (resultSection) resultSection.hidden = true;
      if (input) input.focus();
      setBusy(false);
    });
  }

  // ---------------------------
  // Pro modal (Stripe unlock + rules)
  // ---------------------------
  const proBackdrop = el("proModalBackdrop");
  const proModal = el("proModal");
  const openProBtn = el("openProBtn");
  const learnProBtn = el("learnProBtn");
  const closeProModalBtn = el("closeProModalBtn");
  const proLaterBtn = el("proLaterBtn");
  const proBuyBtn = el("proBuyBtn");

  const ruleMode = el("ruleMode");
  const keepLastN = el("keepLastN");
  const replaceText = el("replaceText");

  function openPro() {
    if (!proBackdrop || !proModal) return;
    proBackdrop.hidden = false;
    proModal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closePro() {
    if (!proBackdrop || !proModal) return;
    proBackdrop.hidden = true;
    proModal.hidden = true;
    document.body.style.overflow = "";
  }

  const r = getProRules();
  if (ruleMode) ruleMode.value = r.mode;
  if (keepLastN) keepLastN.value = String(r.keepLastN);
  if (replaceText) replaceText.value = r.replaceText;

  function readRulesFromUI() {
    const mode = ruleMode && ruleMode.value === "replace_all" ? "replace_all" : "keep_last";
    const n = keepLastN ? Math.max(0, Number(keepLastN.value || 0)) : DEFAULT_PRO_RULES.keepLastN;
    const rt = replaceText ? String(replaceText.value || "[REDACTED]") : "[REDACTED]";
    const next = { mode, keepLastN: n, replaceText: rt };
    setProRules(next);
    return next;
  }

  if (ruleMode) ruleMode.addEventListener("change", readRulesFromUI);
  if (keepLastN) keepLastN.addEventListener("input", readRulesFromUI);
  if (replaceText) replaceText.addEventListener("input", readRulesFromUI);

  if (openProBtn) openProBtn.addEventListener("click", openPro);
  if (learnProBtn) learnProBtn.addEventListener("click", openPro);
  if (closeProModalBtn) closeProModalBtn.addEventListener("click", closePro);
  if (proLaterBtn) proLaterBtn.addEventListener("click", closePro);
  if (proBackdrop) proBackdrop.addEventListener("click", closePro);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && proModal && !proModal.hidden) closePro();
  });

  function refreshProBuyButton() {
    if (!proBuyBtn) return;
    if (isProEnabled()) {
      proBuyBtn.textContent = "Pro enabled";
      proBuyBtn.disabled = true;
    } else {
      proBuyBtn.textContent = "Pay with Stripe (¥200)";
      proBuyBtn.disabled = false;
    }
  }

  refreshProBuyButton();

  if (proBuyBtn) {
    proBuyBtn.addEventListener("click", () => {
      if (isProEnabled()) return;
      readRulesFromUI();
      window.location.href = PRO_PAYMENT_URL;
    });
  }
});
