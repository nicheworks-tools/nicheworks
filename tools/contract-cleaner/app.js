// Language + Scanner logic
let currentLang = "ja";
let RULES = [];
let rulesLoaded = false;

async function loadRules() {
  if (rulesLoaded) return;
  try {
    const res = await fetch("rules.json", { cache: "no-store" });
    if (!res.ok) throw new Error("rules.json load failed");
    RULES = await res.json();
    rulesLoaded = true;
  } catch (err) {
    console.error(err);
    const summaryBox = document.getElementById("summaryBox");
    if (summaryBox) {
      summaryBox.textContent =
        "ルール定義（rules.json）の読み込みに失敗しました。ファイル配置を確認してください。";
      summaryBox.style.color = "#f97316";
    }
  }
}

async function loadLang(lang) {
  try {
    const res = await fetch(`./lang/${lang}.json`, { cache: "no-store" });
    const data = await res.json();
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (data[key]) el.textContent = data[key];
    });
    const ta = document.getElementById("contractInput");
    if (ta && data["placeholder"]) ta.placeholder = data["placeholder"];
  } catch (e) {
    console.warn("Lang load failed:", e);
  }
}

function switchLang(lang) {
  currentLang = lang;
  document.getElementById("lang-ja").classList.toggle("active", lang === "ja");
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  loadLang(lang);
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function normalizeNewlines(str) {
  return str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function findMatches(text) {
  const matches = [];
  if (!Array.isArray(RULES) || RULES.length === 0) return matches;

  for (const rule of RULES) {
    const { id, label, category, risk, type, patterns } = rule;
    if (!patterns || patterns.length === 0) continue;
    for (const p of patterns) {
      if (!p) continue;
      if (type === "regex" || String(p).startsWith("re:")) {
        const source = String(p).replace(/^re:/, "");
        let regex;
        try { regex = new RegExp(source, "g"); } catch { continue; }
        let m;
        while ((m = regex.exec(text)) !== null) {
          const start = m.index;
          const end = start + m[0].length;
          if (m[0].trim().length === 0) { if (regex.lastIndex === start) regex.lastIndex++; continue; }
          matches.push({ start, end, text: m[0], ruleId: id, label, category, risk });
          if (m[0].length === 0) regex.lastIndex++;
        }
      } else {
        const needle = String(p).trim();
        if (!needle) continue;
        const lowerText = text.toLowerCase();
        const lowerNeedle = needle.toLowerCase();
        let index = 0;
        while (true) {
          const found = lowerText.indexOf(lowerNeedle, index);
          if (found === -1) break;
          const start = found;
          const end = start + needle.length;
          matches.push({ start, end, text: text.slice(start, end), ruleId: id, label, category, risk });
          index = end;
        }
      }
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const filtered = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start < lastEnd) continue;
    filtered.push(m);
    lastEnd = m.end;
  }
  return filtered;
}

function riskToClass(risk) {
  if (risk === "high") return "hl-high";
  if (risk === "medium") return "hl-medium";
  return "hl-low";
}

function riskLabelClass(risk) {
  if (risk === "high") return "legend-item legend-high";
  if (risk === "medium") return "legend-item legend-medium";
  return "legend-item legend-low";
}

function buildHighlightHtml(text, matches) {
  if (!matches || matches.length === 0) {
    return escapeHtml(text || "");
  }
  let html = "", cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) html += escapeHtml(text.slice(cursor, m.start));
    const frag = text.slice(m.start, m.end);
    const cls = riskToClass(m.risk);
    html += `<span class="${cls}" title="${escapeHtml(m.category||"")} / ${escapeHtml(m.label||"")}">${escapeHtml(frag)}</span>`;
    cursor = m.end;
  }
  if (cursor < text.length) html += escapeHtml(text.slice(cursor));
  return html;
}

function buildSummary(text, matches) {
  const summaryBox = document.getElementById("summaryBox");
  if (!summaryBox) return;
  if (!text.trim()) {
    summaryBox.textContent =
      currentLang === "ja"
        ? "テキストを入力して「スキャンする」を押すと、検出されたリスクの件数・内訳が表示されます。"
        : "Paste text and click “Scan” to see a summary of detected patterns here.";
    summaryBox.style.color = "#9ca3af";
    return;
  }
  if (!matches || matches.length === 0) {
    summaryBox.textContent =
      currentLang === "ja"
        ? "該当ルールに一致する典型的な危険ワードは検出されませんでした。本文全体を読み、必要に応じて専門家へご相談ください。"
        : "No typical risky patterns from our rule set were detected. Review the document and consult a professional if needed.";
    summaryBox.style.color = "#22c55e";
    return;
  }
  const counts = { high:0, medium:0, low:0 }, byCategory = {};
  for (const m of matches) {
    counts[m.risk] = (counts[m.risk] || 0) + 1;
    const key = m.category || (currentLang==="ja"?"その他":"Other");
    byCategory[key] = (byCategory[key] || 0) + 1;
  }
  const parts = [];
  if (counts.high) parts.push((currentLang==="ja"?"高リスク":"High")+`: ${counts.high}`);
  if (counts.medium) parts.push((currentLang==="ja"?"中リスク":"Medium")+`: ${counts.medium}`);
  if (counts.low) parts.push((currentLang==="ja"?"低リスク":"Low")+`: ${counts.low}`);
  const catText = Object.entries(byCategory).map(([cat,c]) => `${cat}: ${c}`).join(" / ");
  summaryBox.innerHTML = `<strong>${currentLang==="ja"?"検出結果":"Summary"}:</strong> ${parts.join(" / ")}${catText?`<br><span style="font-size:9px;color:#9ca3af">${catText}</span>`:""}`;
  summaryBox.style.color = "#f97316";
}

function buildResultList(matches, text) {
  const container = document.getElementById("resultList");
  if (!container) return;
  container.innerHTML = "";
  if (!matches || matches.length === 0) {
    const p = document.createElement("p");
    p.textContent = currentLang==="ja" ? "一致した典型パターンはありません。" : "No matches.";
    p.style.fontSize = "11px"; p.style.color = "#6b7280"; p.style.margin = "2px 2px 0";
    container.appendChild(p); return;
  }
  for (const m of matches) {
    const div = document.createElement("div");
    div.className = "result-item";
    const range = 40;
    const start = Math.max(0, m.start - range);
    const end = Math.min(text.length, m.end + range);
    const snippet = (start>0?"…":"") + text.slice(start,end).replace(/\s+/g," ").trim() + (end<text.length?"…":"");
    div.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
      <span class="${riskLabelClass(m.risk)}">${m.risk==="high"?(currentLang==="ja"?"高":"High"):m.risk==="medium"?(currentLang==="ja"?"中":"Medium"):(currentLang==="ja"?"低":"Low")}</span>
      <span class="result-category">${escapeHtml(m.category|| (currentLang==="ja"?"その他":"Other"))}</span>
      <span class="result-rule" style="color:#6b7280;font-size:10px;">${escapeHtml(m.label||"")}</span>
    </div>
    <div class="result-snippet" style="color:#9ca3af;font-size:11px;margin-top:2px;">${escapeHtml(snippet)}</div>`;
    container.appendChild(div);
  }
}

async function runScan() {
  await loadRules();
  const inputEl = document.getElementById("contractInput");
  const highlightView = document.getElementById("highlightView");
  if (!inputEl || !highlightView) return;
  const text = normalizeNewlines(inputEl.value || "");
  if (!text.trim()) {
    buildSummary("", []);
    buildResultList([], "");
    highlightView.textContent =
      currentLang==="ja"
        ? "ここに入力テキストのハイライト表示が出ます。まず左側に契約書テキストを貼り付けてください。"
        : "Highlighted view will appear here after scanning. Paste the text on the left first.";
    return;
  }
  const matches = findMatches(text);
  buildSummary(text, matches);
  buildResultList(matches, text);
  highlightView.innerHTML = buildHighlightHtml(text, matches);
}

function clearAll() {
  const inputEl = document.getElementById("contractInput");
  const highlightView = document.getElementById("highlightView");
  if (inputEl) inputEl.value = "";
  if (highlightView)
    highlightView.textContent =
      currentLang==="ja"
        ? "ここに入力テキストのハイライト表示が出ます。まず左側に契約書テキストを貼り付けてください。"
        : "Highlighted view will appear here after scanning. Paste the text on the left first.";
  buildSummary("", []);
  buildResultList([], "");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lang-ja").addEventListener("click", () => switchLang("ja"));
  document.getElementById("lang-en").addEventListener("click", () => switchLang("en"));
  switchLang("ja");

  document.getElementById("scanButton").addEventListener("click", (e) => { e.preventDefault(); runScan(); });
  document.getElementById("clearButton").addEventListener("click", (e) => { e.preventDefault(); clearAll(); });
});
