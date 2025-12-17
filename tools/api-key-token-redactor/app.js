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
// Redaction patterns (Free MVP)
// ---------------------------
// NOTE: 誤検出よりも「取りこぼし少なめ」寄り。完全保証はしない。
const PATTERNS = [
  // OpenAI
  { key: "openai", label: "OpenAI key", regex: /\bsk-[A-Za-z0-9]{20,}\b/g, mask: (m) => maskKeepEnds(m, 4, 4) },

  // Stripe (publishable / secret / restricted etc)
  { key: "stripe_secret", label: "Stripe secret", regex: /\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}\b/g, mask: (m) => maskKeepEnds(m, 4, 4) },
  { key: "stripe_pub", label: "Stripe publishable", regex: /\bpk_(live|test)_[A-Za-z0-9]{10,}\b/g, mask: (m) => maskKeepEnds(m, 4, 4) },

  // AWS access key id (AKIA / ASIA)
  { key: "aws_access_key_id", label: "AWS Access Key ID", regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g, mask: (m) => maskKeepEnds(m, 4, 4) },

  // GitHub tokens
  { key: "github_token", label: "GitHub token", regex: /\bgh[pous]_[A-Za-z0-9]{20,}\b/g, mask: (m) => maskKeepEnds(m, 4, 4) },

  // Slack
  { key: "slack_token", label: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, mask: (m) => maskKeepEnds(m, 4, 4) },

  // JWT (3 segments)
  { key: "jwt", label: "JWT", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, mask: (m) => maskJWT(m) },

  // Generic long token-ish strings (base64/hex-ish). 取りこぼし防止の最後の網。
  // ただし誤検出もあり得るので「種類」としては "Token-like" として扱う。
  { key: "token_like", label: "Token-like", regex: /\b[A-Za-z0-9_\-]{32,}\b/g, mask: (m) => maskKeepEnds(m, 3, 3) }
];

function maskKeepEnds(str, keepStart, keepEnd) {
  if (str.length <= keepStart + keepEnd + 6) return "[REDACTED]";
  const s = str.slice(0, keepStart);
  const e = str.slice(-keepEnd);
  return `${s}…${e}`;
}

function maskJWT(jwt) {
  const parts = jwt.split(".");
  if (parts.length !== 3) return "[REDACTED]";
  const head = maskKeepEnds(parts[0], 3, 3);
  const body = "[REDACTED]";
  const sig = maskKeepEnds(parts[2], 3, 3);
  return `${head}.${body}.${sig}`;
}

// ---------------------------
// UI helpers
// ---------------------------
const el = (id) => document.getElementById(id);

function showToast(msg) {
  const t = el("copyToast");
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

function setBusy(isBusy) {
  el("progress").hidden = !isBusy;
  el("analyzeBtn").disabled = isBusy;
}

// ---------------------------
// Scan & redact
// ---------------------------
function scanAndRedact(inputText) {
  // まず検出→マスキングを順次適用
  const hits = {};
  let output = inputText;

  for (const p of PATTERNS) {
    let c = 0;
    output = output.replace(p.regex, (m) => {
      c++;
      return p.mask(m);
    });
    if (c > 0) hits[p.key] = { label: p.label, count: c };
  }

  // token_like は他で既にマスクされた短い断片にも当たる可能性があるので、
  // 出力に残った "…"(ellipsis) 等がある場合の再ヒットは無視…のような細工もできるが、
  // Freeでは簡素に「当たったら当たった」でOKにする。

  const total = Object.values(hits).reduce((a, v) => a + v.count, 0);
  const types = Object.keys(hits).length;

  return { output, hits, total, types };
}

// ---------------------------
// Main
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  initLangSwitch();

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

  clearBtn.addEventListener("click", () => {
    input.value = "";
    input.focus();
  });

  analyzeBtn.addEventListener("click", () => {
    const text = input.value || "";
    setBusy(true);

    // UX：一瞬でもprogressを見せる（体感の安定）
    setTimeout(() => {
      const res = scanAndRedact(text);

      totalFound.textContent = String(res.total);
      typesFound.textContent = String(res.types);

      // Hit list
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

      maskedOutput.textContent = res.output;

      resultSection.hidden = false;
      setBusy(false);

      // モバイルで結果へスクロール
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(maskedOutput.textContent || "");
      showToast("Copied");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = maskedOutput.textContent || "";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      showToast("Copied");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const text = maskedOutput.textContent || "";
    const name = `redacted-${new Date().toISOString().slice(0,10)}.txt`;
    downloadText(name, text);
  });

  resetBtn.addEventListener("click", () => {
    input.value = "";
    maskedOutput.textContent = "";
    hitList.innerHTML = "";
    totalFound.textContent = "0";
    typesFound.textContent = "0";
    resultSection.hidden = true;
    input.focus();
  });
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
