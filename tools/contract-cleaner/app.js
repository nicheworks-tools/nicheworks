/* ============================================================
 * Contract Cleaner – app.js
 * 多言語 / テーマ切替 / スキャンロジック / ハイライト
 * ============================================================ */

/* ------------------------------
 * 状態
 * ------------------------------ */
let CURRENT_LANG = "ja";
let RULES = [];
let RULES_LOADED = false;

/* ------------------------------
 * i18n 辞書（HTML data-i18n-* と同期）
 * ------------------------------ */
const I18N = {
  ja: {
    title_main_ja: "契約書リスク検出ツール（Contract Cleaner）",
    subtitle_ja: "よくある危険条文・リスクワードをブラウザ内でスキャンします（AI不使用）。",

    donate_hdr_ja: "このツールが役に立ったら、開発継続のご支援をいただけると嬉しいです。",
    donate_ftr_ja: "開発継続のためのご支援をいただけると嬉しいです。",

    input_title_ja: "契約書・規約の本文",
    input_desc_ja: "本文をテキストのまま貼り付けてください。PDFはOCR後に貼ってください。入力内容はブラウザ内のみで処理されます。",
    scan_btn_ja: "スキャンする",
    clear_btn_ja: "クリア",

    disclaimer_ja: "本ツールは注意喚起目的の補助ツールであり、法的助言ではありません。",

    result_title_ja: "検出結果",
    result_summary_ja: "テキストを入力して「スキャンする」を押すと概要が表示されます。",
    highlight_title_ja: "ハイライト表示",
    highlight_desc_ja: "入力テキスト中の該当箇所を色付きで表示します。",
    footer_disclaimer_ja: "当サイトには広告が含まれる場合があります。情報の正確性は保証されません。",

    placeholder_ja: "ここに本文を貼り付けてください（PDFはOCRしてから）。",
    no_match_ja: "一致した典型的な危険ワードはありません。",

    risk_high_ja: "高",
    risk_medium_ja: "中",
    risk_low_ja: "低",
  },

  en: {
    title_main_en: "Contract Risk Highlighter (Contract Cleaner)",
    subtitle_en: "Detect red-flag clauses and risky phrases locally (no AI, no logging).",

    donate_hdr_en: "If this tool helps, you can support future development.",
    donate_ftr_en: "We appreciate your support for continued development.",

    input_title_en: "Contract / Terms text",
    input_desc_en: "Paste the contract text here. OCR your PDF first. All processing is done locally.",
    scan_btn_en: "Scan now",
    clear_btn_en: "Clear",

    disclaimer_en: "This tool is for educational alert only and not legal advice.",

    result_title_en: "Findings",
    result_summary_en: "Paste text and click “Scan” to show findings.",
    highlight_title_en: "Highlighted view",
    highlight_desc_en: "Highlighted risky parts appear here.",
    footer_disclaimer_en: "This site may contain ads. No guarantee of accuracy.",

    placeholder_en: "Paste the contract text here (OCR your PDF first).",
    no_match_en: "No typical risky patterns found.",

    risk_high_en: "High",
    risk_medium_en: "Medium",
    risk_low_en: "Low",
  },
};

/* ------------------------------
 * 言語適用
 * ------------------------------ */
function applyI18n() {
  const dict = I18N[CURRENT_LANG];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute(`data-i18n-${CURRENT_LANG}`);
    if (key && dict[key]) el.textContent = dict[key];
  });

  // placeholder 切り替え
  const ta = document.getElementById("inputText");
  if (ta) {
    ta.placeholder = dict[`placeholder_${CURRENT_LANG}`] || "";
  }

  // summary 初期テキスト
  const sb = document.getElementById("summaryBox");
  if (sb) {
    const init = dict[`result_summary_${CURRENT_LANG}`];
    if (init) sb.textContent = init;
  }

  // ハイライト初期
  const hb = document.getElementById("highlightBox");
  if (hb) hb.textContent = "";
}

/* ------------------------------
 * 言語切替
 * ------------------------------ */
function setLang(lang) {
  CURRENT_LANG = lang;
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  applyI18n();
}

/* ------------------------------
 * テーマ切替
 * ------------------------------ */
function applyTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("theme-dark", saved === "dark");
}

function toggleTheme() {
  const saved = localStorage.getItem("theme") || "light";
  const next = saved === "light" ? "dark" : "light";
  localStorage.setItem("theme", next);
  applyTheme();
}

/* ------------------------------
 * utils
 * ------------------------------ */
function normalize(str) {
  return str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ------------------------------
 * rules.json 読み込み
 * ------------------------------ */
async function loadRules() {
  if (RULES_LOADED) return;

  try {
    const res = await fetch("rules.json", { cache: "no-store" });
    RULES = await res.json();
    RULES_LOADED = true;
  } catch (e) {
    console.error("rules.json load failed", e);
    const sb = document.getElementById("summaryBox");
    if (sb) sb.textContent = "rules.json の読み込みに失敗しました。";
  }
}

/* ------------------------------
 * スキャン（ルール照合）
 * ------------------------------ */
function findMatches(text) {
  if (!RULES.length) return [];

  const result = [];
  for (const rule of RULES) {
    const { id, category, label, risk, patterns, type } = rule;

    if (!patterns || !patterns.length) continue;

    for (const p of patterns) {
      if (type === "regex" || String(p).startsWith("re:")) {
        const src = String(p).replace(/^re:/,"");
        let re;
        try { re = new RegExp(src, "g"); } catch { continue; }

        let m;
        while ((m = re.exec(text)) !== null) {
          const s = m.index;
          const e = s + m[0].length;
          if (m[0].trim().length === 0) {
            if (re.lastIndex === s) re.lastIndex++;
            continue;
          }
          result.push({ start:s, end:e, frag:m[0], id, category, label, risk });
          if (m[0].length === 0) re.lastIndex++;
        }

      } else {
        const needle = String(p).trim();
        if (!needle) continue;

        const lowerText = text.toLowerCase();
        const lowerNeedle = needle.toLowerCase();
        let idx = 0;

        while (true) {
          const pos = lowerText.indexOf(lowerNeedle, idx);
          if (pos === -1) break;

          result.push({
            start: pos,
            end: pos + needle.length,
            frag: text.slice(pos, pos + needle.length),
            id, category, label, risk
          });
          idx = pos + needle.length;
        }
      }
    }
  }

  // ネスト除去（重複・包含を除く）
  result.sort((a,b)=> a.start - b.start || b.end - a.end);
  const out = [];
  let last = -1;

  for (const m of result) {
    if (m.start < last) continue;
    out.push(m);
    last = m.end;
  }
  return out;
}

/* ------------------------------
 * summary 作成
 * ------------------------------ */
function updateSummary(text, matches) {
  const sb = document.getElementById("summaryBox");
  const dict = I18N[CURRENT_LANG];

  if (!text.trim()) {
    sb.textContent = dict[`result_summary_${CURRENT_LANG}`];
    return;
  }

  if (!matches.length) {
    sb.textContent = dict[`no_match_${CURRENT_LANG}`];
    sb.style.color = "var(--text-soft)";
    return;
  }

  const count = { high:0, medium:0, low:0 };
  for (const m of matches) {
    count[m.risk] = (count[m.risk]||0) + 1;
  }

  const rH = dict[`risk_high_${CURRENT_LANG}`];
  const rM = dict[`risk_medium_${CURRENT_LANG}`];
  const rL = dict[`risk_low_${CURRENT_LANG}`];

  sb.innerHTML =
    `${rH}: ${count.high} / ${rM}: ${count.medium} / ${rL}: ${count.low}`;
  sb.style.color = "var(--danger)";
}

/* ------------------------------
 * 結果リスト
 * ------------------------------ */
function updateResultList(txt, matches) {
  const box = document.getElementById("resultList");
  box.innerHTML = "";

  if (!matches.length) {
    const p = document.createElement("p");
    p.textContent = I18N[CURRENT_LANG][`no_match_${CURRENT_LANG}`];
    p.style.color = "var(--text-soft)";
    p.style.fontSize = "12px";
    box.appendChild(p);
    return;
  }

  for (const m of matches) {
    const item = document.createElement("div");
    item.className = "result-item";

    const rH = I18N[CURRENT_LANG][`risk_high_${CURRENT_LANG}`];
    const rM = I18N[CURRENT_LANG][`risk_medium_${CURRENT_LANG}`];
    const rL = I18N[CURRENT_LANG][`risk_low_${CURRENT_LANG}`];

    const risk =
      m.risk === "high" ? rH :
      m.risk === "medium" ? rM : rL;

    const start = Math.max(0, m.start - 30);
    const end   = Math.min(txt.length, m.end + 30);
    const snip  = txt.slice(start,end).replace(/\s+/g," ").trim();

    item.innerHTML = `
      <div class="result-label">${esc(risk)} / ${esc(m.category)} / ${esc(m.label)}</div>
      <div class="result-snippet">…${esc(snip)}…</div>
    `;
    box.appendChild(item);
  }
}

/* ------------------------------
 * ハイライトビュー
 * ------------------------------ */
function updateHighlight(txt, matches) {
  const box = document.getElementById("highlightBox");
  if (!matches.length) {
    box.textContent = "";
    return;
  }

  let out = "";
  let cursor = 0;

  for (const m of matches) {
    if (m.start > cursor) {
      out += esc(txt.slice(cursor, m.start));
    }
    const frag = esc(txt.slice(m.start, m.end));

    const cls =
      m.risk === "high" ? "hl-high" :
      m.risk === "medium" ? "hl-medium" :
      "hl-low";

    out += `<span class="${cls}">${frag}</span>`;
    cursor = m.end;
  }
  if (cursor < txt.length) out += esc(txt.slice(cursor));

  box.innerHTML = out;
}

/* ------------------------------
 * スキャン開始
 * ------------------------------ */
async function runScan() {
  await loadRules();

  const ta = document.getElementById("inputText");
  const txt = normalize(ta.value || "");

  const matches = findMatches(txt);

  updateSummary(txt, matches);
  updateResultList(txt, matches);
  updateHighlight(txt, matches);
}

/* ------------------------------
 * クリア
 * ------------------------------ */
function clearInput() {
  const ta = document.getElementById("inputText");
  ta.value = "";

  applyI18n();

  document.getElementById("resultList").innerHTML = "";
  document.getElementById("highlightBox").textContent = "";
}

/* ------------------------------
 * 初期化
 * ------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // 言語初期化
  const nav = (navigator.language || "ja").toLowerCase();
  CURRENT_LANG = nav.startsWith("en") ? "en" : "ja";
  setLang(CURRENT_LANG);

  // テーマ初期
  applyTheme();

  // イベント
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  document.getElementById("scanBtn").addEventListener("click", runScan);
  document.getElementById("clearBtn").addEventListener("click", clearInput);

  // テーマ切替ボタン（後のバージョンで追加するならここに紐づけ）
  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});
