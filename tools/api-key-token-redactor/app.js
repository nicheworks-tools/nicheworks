// ===========================
// API Key & Token Redactor (NicheWorks)
// app.js (MVP + Stripe lightweight Pro unlock)
// ===========================

import { DEFAULT_PRO_RULES, scanAndRedact } from "./src/core.js";

// Stripe Payment Link
const PRO_PAYMENT_URL = "https://buy.stripe.com/eVq14p1MRfCR3dzdQPcV207";

// Pro unlock flag (static site)
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

// Stripe success_url -> ?pro=1
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
// Main
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  initLangSwitch();

  // Ensure spinner hidden on boot
  setBusy(false);

  // Pro activation from Stripe success_url
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

  // Pro badge
  const proBadge = el("proBadge");
  function refreshProBadge() {
    if (!proBadge) return;
    const on = isProEnabled();
    // 通常時は非表示、Pro時のみ表示（分かりやすい）
    proBadge.hidden = !on;
    proBadge.classList.toggle("is-pro", on);
  }
  refreshProBadge();
  if (activatedNow) {
    refreshProBadge();
    showToast("Pro enabled");
  }

  // Clear input
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (input) input.value = "";
      if (input) input.focus();
    });
  }

  // Analyze
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      const text = input?.value ? input.value : "";

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

        resultSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      } finally {
        setBusy(false);
      }
    });
  }

  // Copy
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = maskedOutput?.textContent || "";
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

  // Download
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const text = maskedOutput?.textContent || "";
      const name = `redacted-${new Date().toISOString().slice(0, 10)}.txt`;
      downloadText(name, text);
    });
  }

  // Reset
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

  // init rules UI
  const r = getProRules();
  if (ruleMode) ruleMode.value = r.mode;
  if (keepLastN) keepLastN.value = String(r.keepLastN);
  if (replaceText) replaceText.value = r.replaceText;

  function readRulesFromUI() {
    const mode = ruleMode?.value === "replace_all" ? "replace_all" : "keep_last";
    const n = keepLastN ? Math.max(0, Number(keepLastN.value || 0)) : DEFAULT_PRO_RULES.keepLastN;
    const rt = replaceText ? String(replaceText.value || "[REDACTED]") : "[REDACTED]";
    const next = { mode, keepLastN: n, replaceText: rt };
    setProRules(next);
    return next;
  }

  ruleMode?.addEventListener("change", readRulesFromUI);
  keepLastN?.addEventListener("input", readRulesFromUI);
  replaceText?.addEventListener("input", readRulesFromUI);

  openProBtn?.addEventListener("click", openPro);
  learnProBtn?.addEventListener("click", openPro);
  closeProModalBtn?.addEventListener("click", closePro);
  proLaterBtn?.addEventListener("click", closePro);
  proBackdrop?.addEventListener("click", closePro);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && proModal && !proModal.hidden) closePro();
  });

  function refreshProBuyButton() {
    if (!proBuyBtn) return;
    if (isProEnabled()) {
      proBuyBtn.textContent = "Pro enabled";
      proBuyBtn.disabled = true;
    } else {
      proBuyBtn.textContent = "Buy ($2.99)";
      proBuyBtn.disabled = false;
    }
  }

  refreshProBuyButton();

  proBuyBtn?.addEventListener("click", () => {
    if (isProEnabled()) return;
    readRulesFromUI();
    window.location.href = PRO_PAYMENT_URL;
  });
});
