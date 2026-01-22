/* ============================================================
 * Contract Cleaner – app.js
 * Deterministic rule-based risk highlighter (no AI, local-only)
 * ============================================================ */

const MAX_HIGHLIGHTS = 200;
const SNIPPET_CONTEXT = 30;

let CURRENT_LANG = "ja";

const I18N = {
  ja: {
    title_main_ja: "契約書リスク検出ツール（Contract Cleaner）",
    subtitle_ja: "よくある注意語・リスクワードをブラウザ内で可視化します（AI不使用）。",

    donate_hdr_ja: "このツールが役に立ったら、開発継続のご支援をいただけると嬉しいです。",
    donate_ftr_ja: "開発継続のためのご支援をいただけると嬉しいです。",

    input_title_ja: "契約書・規約の本文",
    input_desc_ja: "本文をテキストのまま貼り付けてください。PDFはOCR後に貼ってください。",
    local_only_ja: "このツールはブラウザ内で処理します。テキストは送信されません。",
    scan_btn_ja: "スキャンする",
    clear_btn_ja: "クリア",
    example_btn_ja: "例文",
    copy_summary_ja: "要約をコピー",
    copy_questions_ja: "質問テンプレをコピー",
    download_btn_ja: "txtを保存",

    disclaimer_ja: "本ツールは注意喚起目的の補助ツールであり、法的助言ではありません。",

    result_title_ja: "検出結果",
    total_hits_ja: "合計ヒット",
    category_hits_ja: "カテゴリ数",
    only_matched_ja: "該当カテゴリのみ表示",
    summary_hint_ja: "カテゴリ別に確認ポイントと該当箇所を表示します。",

    questions_title_ja: "確認したい点（プレビュー）",
    questions_header_ja: "確認したい点（質問テンプレ）",

    highlight_title_ja: "ハイライト表示",
    highlight_desc_ja: "入力テキスト中の該当箇所を色付きで表示します。",
    footer_disclaimer_ja: "当サイトには広告が含まれる場合があります。情報の正確性は保証されません。",

    placeholder_ja: "ここに本文を貼り付けてください（PDFはOCRしてから）。",
    no_match_ja: "該当しそうなキーワードは見つかりませんでした。",
    no_category_ja: "該当なし",
    more_hits_ja: "さらに {count} 件あります。",
    toast_copy_ja: "コピーしました",
    toast_empty_ja: "コピーする内容がありません",
    toast_download_ja: "txtを保存しました",
    category_label_ja: "カテゴリ",
    hits_label_ja: "ヒット数",
    confirmation_label_ja: "確認ポイント",
    term_label_ja: "該当語",
  },
  en: {
    title_main_en: "Contract Risk Highlighter (Contract Cleaner)",
    subtitle_en: "Highlight common risk terms locally in your browser (no AI, no logging).",

    donate_hdr_en: "If this tool helps, you can support future development.",
    donate_ftr_en: "We appreciate your support for continued development.",

    input_title_en: "Contract / Terms text",
    input_desc_en: "Paste the contract text here. OCR your PDF first.",
    local_only_en: "Runs in your browser. No text is uploaded.",
    scan_btn_en: "Analyze",
    clear_btn_en: "Clear",
    example_btn_en: "Example",
    copy_summary_en: "Copy summary",
    copy_questions_en: "Copy questions",
    download_btn_en: "Download txt",

    disclaimer_en: "This tool is for general awareness only and not legal advice.",

    result_title_en: "Findings",
    total_hits_en: "Total hits",
    category_hits_en: "Categories hit",
    only_matched_en: "Show only matched categories",
    summary_hint_en: "Each category shows a confirmation point and snippets.",

    questions_title_en: "Questions to ask (preview)",
    questions_header_en: "Questions to ask (template)",

    highlight_title_en: "Highlighted view",
    highlight_desc_en: "Matched terms are highlighted in the text below.",
    footer_disclaimer_en: "This site may contain ads. No guarantee of accuracy.",

    placeholder_en: "Paste the contract text here (OCR your PDF first).",
    no_match_en: "No typical risky patterns found.",
    no_category_en: "No matches",
    more_hits_en: "+ {count} more",
    toast_copy_en: "Copied",
    toast_empty_en: "Nothing to copy",
    toast_download_en: "Downloaded",
    category_label_en: "Category",
    hits_label_en: "Hits",
    confirmation_label_en: "Confirmation point",
    term_label_en: "Matched term",
  },
};

const RULES = [
  {
    id: "liability",
    name: { ja: "損害賠償・責任", en: "Liability" },
    keywords: [
      "損害賠償",
      "賠償責任",
      "責任",
      "免責",
      "責任の上限",
      "責任制限",
      "上限",
      "間接損害",
    ],
    confirmationPoint: {
      ja: "責任範囲や上限の記載に偏りがないか確認したい。",
      en: "Check whether liability scope or caps are balanced.",
    },
    questionTemplates: {
      ja: [
        "損害賠償の上限は妥当な金額か？",
        "免責の範囲や例外条件は明確か？",
        "間接損害の扱いはどう定義されているか？",
      ],
      en: [
        "Is the liability cap reasonable for this deal?",
        "Are disclaimers and exceptions clearly defined?",
        "How are indirect damages handled?",
      ],
    },
  },
  {
    id: "termination",
    name: { ja: "解除・中途解約", en: "Termination" },
    keywords: [
      "解除",
      "中途解約",
      "解約",
      "違約金",
      "解約金",
      "契約終了",
      "終了事由",
    ],
    confirmationPoint: {
      ja: "解約条件や違約金の条件が一方的でないか確認したい。",
      en: "Review termination conditions and any penalties.",
    },
    questionTemplates: {
      ja: [
        "解除できる条件は双方で対称か？",
        "中途解約の違約金・精算条件は明確か？",
        "通知期限や手続きが現実的か？",
      ],
      en: [
        "Are termination rights balanced for both parties?",
        "Are penalties or fees for early termination clear?",
        "Is the notice period realistic?",
      ],
    },
  },
  {
    id: "payment",
    name: { ja: "支払・料金", en: "Payment" },
    keywords: [
      "支払",
      "支払い",
      "遅延",
      "遅延損害金",
      "手数料",
      "相殺",
      "振込手数料",
      "請求",
    ],
    confirmationPoint: {
      ja: "支払条件や遅延時の扱いを確認したい。",
      en: "Confirm payment terms and late-fee handling.",
    },
    questionTemplates: {
      ja: [
        "支払期限・支払方法は現実的か？",
        "遅延損害金や手数料の条件は妥当か？",
        "相殺条項の有無を確認したい。",
      ],
      en: [
        "Are payment terms and methods acceptable?",
        "How are late fees or penalties applied?",
        "Is there a set-off clause to be aware of?",
      ],
    },
  },
  {
    id: "ip",
    name: { ja: "知財・成果物", en: "IP & Deliverables" },
    keywords: [
      "知的財産",
      "知財",
      "著作権",
      "成果物",
      "所有権",
      "利用許諾",
      "使用許諾",
      "ライセンス",
    ],
    confirmationPoint: {
      ja: "成果物の権利帰属・利用範囲を確認したい。",
      en: "Confirm IP ownership and license scope.",
    },
    questionTemplates: {
      ja: [
        "成果物の権利帰属はどちらか？",
        "利用許諾の範囲と期間は明確か？",
        "二次利用や改変の可否を確認したい。",
      ],
      en: [
        "Who owns the deliverables and IP?",
        "Is the license scope and term clearly defined?",
        "Are reuse or modifications permitted?",
      ],
    },
  },
  {
    id: "confidentiality",
    name: { ja: "秘密保持", en: "Confidentiality" },
    keywords: [
      "秘密保持",
      "機密",
      "秘密情報",
      "開示",
      "例外",
      "第三者開示",
    ],
    confirmationPoint: {
      ja: "秘密情報の範囲と例外条件を確認したい。",
      en: "Check scope and exceptions for confidentiality.",
    },
    questionTemplates: {
      ja: [
        "秘密情報の定義は広すぎないか？",
        "開示可能な例外や通知義務はあるか？",
        "秘密保持期間は妥当か？",
      ],
      en: [
        "Is the definition of confidential info reasonable?",
        "Are disclosure exceptions and notices clear?",
        "Is the confidentiality term appropriate?",
      ],
    },
  },
  {
    id: "subcontracting",
    name: { ja: "再委託・外注", en: "Subcontracting" },
    keywords: [
      "再委託",
      "再委任",
      "外注",
      "委託先",
      "下請",
    ],
    confirmationPoint: {
      ja: "再委託の可否や条件を確認したい。",
      en: "Verify subcontracting permissions and conditions.",
    },
    questionTemplates: {
      ja: [
        "再委託に事前承諾が必要か？",
        "再委託先への責任分担は明確か？",
      ],
      en: [
        "Is prior consent required for subcontracting?",
        "Are responsibilities for subcontractors defined?",
      ],
    },
  },
  {
    id: "warranty",
    name: { ja: "保証・補償", en: "Warranty & Indemnity" },
    keywords: [
      "保証",
      "補償",
      "瑕疵",
      "瑕疵担保",
      "非侵害保証",
    ],
    confirmationPoint: {
      ja: "保証範囲や補償条件に抜けがないか確認したい。",
      en: "Review warranty coverage and indemnity conditions.",
    },
    questionTemplates: {
      ja: [
        "保証内容・期間は妥当か？",
        "補償範囲や免責条件は明確か？",
        "瑕疵対応の手続きは定義されているか？",
      ],
      en: [
        "Are warranty terms and duration reasonable?",
        "Are indemnity scope and exclusions clear?",
        "Is the defect remediation process defined?",
      ],
    },
  },
  {
    id: "jurisdiction",
    name: { ja: "準拠法・管轄", en: "Jurisdiction" },
    keywords: [
      "準拠法",
      "管轄",
      "裁判所",
      "合意管轄",
      "専属的合意管轄",
    ],
    confirmationPoint: {
      ja: "準拠法や管轄地が実務上問題ないか確認したい。",
      en: "Confirm governing law and venue are acceptable.",
    },
    questionTemplates: {
      ja: [
        "準拠法・管轄は自社に不利でないか？",
        "専属的合意管轄の記載があるか？",
      ],
      en: [
        "Is the governing law/venue acceptable?",
        "Is there an exclusive jurisdiction clause?",
      ],
    },
  },
];

function applyI18n() {
  const dict = I18N[CURRENT_LANG];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute(`data-i18n-${CURRENT_LANG}`) || (CURRENT_LANG === "ja" ? el.getAttribute("data-i18n") : null);
    if (key && dict[key]) el.textContent = dict[key];
  });

  const ta = document.getElementById("contractText");
  if (ta) {
    const placeholder = ta.getAttribute(`data-i18n-placeholder-${CURRENT_LANG}`) || ta.getAttribute("data-i18n-placeholder");
    ta.placeholder = placeholder || dict[`placeholder_${CURRENT_LANG}`] || "";
  }
}

function setLang(lang) {
  CURRENT_LANG = lang;
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  applyI18n();
  renderAll();
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isEnglishKeyword(keyword) {
  return /[A-Za-z]/.test(keyword);
}

function buildEnglishRegex(keyword) {
  const escaped = escapeRegExp(keyword);
  let pattern = escaped;
  if (/^[A-Za-z0-9]/.test(keyword)) {
    pattern = `\\b${pattern}`;
  }
  if (/[A-Za-z0-9]$/.test(keyword)) {
    pattern = `${pattern}\\b`;
  }
  return new RegExp(pattern, "gi");
}

function collectMatches(text) {
  const candidates = [];
  const normalized = text;

  const keywords = RULES.flatMap(rule =>
    rule.keywords.map(keyword => ({
      keyword,
      rule,
      isEnglish: isEnglishKeyword(keyword),
    }))
  ).sort((a, b) => b.keyword.length - a.keyword.length);

  for (const item of keywords) {
    if (!item.keyword) continue;

    if (item.isEnglish) {
      const re = buildEnglishRegex(item.keyword);
      let match;
      while ((match = re.exec(normalized)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        candidates.push({
          start,
          end,
          term: match[0],
          rule: item.rule,
        });
      }
    } else {
      let idx = 0;
      while (true) {
        const pos = normalized.indexOf(item.keyword, idx);
        if (pos === -1) break;
        candidates.push({
          start: pos,
          end: pos + item.keyword.length,
          term: item.keyword,
          rule: item.rule,
        });
        idx = pos + item.keyword.length;
      }
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.end - a.end);

  const filtered = [];
  let lastEnd = -1;
  for (const match of candidates) {
    if (match.start < lastEnd) continue;
    filtered.push(match);
    lastEnd = match.end;
  }

  return filtered;
}

function buildSnippet(text, start, end) {
  const before = Math.max(0, start - SNIPPET_CONTEXT);
  const after = Math.min(text.length, end + SNIPPET_CONTEXT);
  const snippet = text.slice(before, after).replace(/\s+/g, " ").trim();
  return {
    snippet,
    prefix: before > 0 ? "…" : "",
    suffix: after < text.length ? "…" : "",
  };
}

function groupByCategory(matches) {
  const groups = new Map();
  for (const rule of RULES) {
    groups.set(rule.id, {
      rule,
      matches: [],
    });
  }

  for (const match of matches) {
    const group = groups.get(match.rule.id);
    if (group) group.matches.push(match);
  }

  return Array.from(groups.values());
}

function updateCounters(matches, groups) {
  const totalHits = document.getElementById("totalHits");
  const categoryCount = document.getElementById("categoryCount");
  if (!totalHits || !categoryCount) return;

  const matchedCategories = groups.filter(group => group.matches.length > 0).length;
  totalHits.textContent = String(matches.length);
  categoryCount.textContent = String(matchedCategories);
}

function updateCategoryList(text, groups) {
  const list = document.getElementById("categoryList");
  const onlyMatched = document.getElementById("onlyMatchedToggle");
  if (!list) return;

  list.innerHTML = "";
  const dict = I18N[CURRENT_LANG];
  const showOnlyMatched = onlyMatched ? onlyMatched.checked : true;

  groups.forEach(group => {
    const hasMatches = group.matches.length > 0;
    if (showOnlyMatched && !hasMatches) return;

    const card = document.createElement("details");
    card.className = "category-card";
    card.open = hasMatches;

    const summary = document.createElement("summary");
    summary.className = "category-summary";
    summary.innerHTML = `
      <span class="category-name">${escapeHtml(group.rule.name[CURRENT_LANG])}</span>
      <span class="category-count">${dict[`hits_label_${CURRENT_LANG}`]}: ${group.matches.length}</span>
    `;
    card.appendChild(summary);

    const body = document.createElement("div");
    body.className = "category-body";

    const confirmation = document.createElement("p");
    confirmation.className = "category-confirmation";
    confirmation.innerHTML = `<strong>${dict[`confirmation_label_${CURRENT_LANG}`]}:</strong> ${escapeHtml(group.rule.confirmationPoint[CURRENT_LANG])}`;
    body.appendChild(confirmation);

    if (!hasMatches) {
      const empty = document.createElement("p");
      empty.className = "category-empty";
      empty.textContent = dict[`no_category_${CURRENT_LANG}`];
      body.appendChild(empty);
    } else {
      const listEl = document.createElement("ul");
      listEl.className = "match-list";
      group.matches.forEach(match => {
        const { snippet, prefix, suffix } = buildSnippet(text, match.start, match.end);
        const item = document.createElement("li");
        item.innerHTML = `
          <span class="match-term">${escapeHtml(match.term)}</span>
          <span class="match-snippet">${escapeHtml(prefix + snippet + suffix)}</span>
        `;
        listEl.appendChild(item);
      });
      body.appendChild(listEl);
    }

    card.appendChild(body);
    list.appendChild(card);
  });
}

function updateHighlight(text, matches) {
  const preview = document.getElementById("highlightPreview");
  const note = document.getElementById("highlightNote");
  if (!preview) return;

  if (!matches.length) {
    preview.textContent = text;
    if (note) {
      const dict = I18N[CURRENT_LANG];
      note.textContent = text.trim() ? dict[`no_match_${CURRENT_LANG}`] : "";
    }
    return;
  }

  const renderMatches = matches.slice(0, MAX_HIGHLIGHTS);

  let output = "";
  let cursor = 0;

  for (const match of renderMatches) {
    if (match.start > cursor) {
      output += escapeHtml(text.slice(cursor, match.start));
    }
    const fragment = escapeHtml(text.slice(match.start, match.end));
    output += `<mark data-cat="${escapeHtml(match.rule.name[CURRENT_LANG])}">${fragment}</mark>`;
    cursor = match.end;
  }
  if (cursor < text.length) output += escapeHtml(text.slice(cursor));

  preview.innerHTML = output;

  if (note) {
    if (matches.length > MAX_HIGHLIGHTS) {
      const dict = I18N[CURRENT_LANG];
      note.textContent = dict[`more_hits_${CURRENT_LANG}`].replace("{count}", String(matches.length - MAX_HIGHLIGHTS));
    } else {
      note.textContent = "";
    }
  }
}

function buildSummaryText(matches, groups) {
  const dict = I18N[CURRENT_LANG];
  const matchedGroups = groups.filter(group => group.matches.length > 0);

  const lines = [
    `${dict[`total_hits_${CURRENT_LANG}`]}: ${matches.length}`,
    `${dict[`category_hits_${CURRENT_LANG}`]}: ${matchedGroups.length}`,
    "",
  ];

  matchedGroups.forEach(group => {
    lines.push(`${group.rule.name[CURRENT_LANG]}（${group.matches.length}）: ${group.rule.confirmationPoint[CURRENT_LANG]}`);
  });

  return lines.join("\n");
}

function buildQuestionsText(groups) {
  const matchedGroups = groups.filter(group => group.matches.length > 0);
  if (!matchedGroups.length) return "";
  const dict = I18N[CURRENT_LANG];
  const header = dict[`questions_header_${CURRENT_LANG}`];
  const lines = [header, ""];

  matchedGroups.forEach(group => {
    lines.push(`■ ${group.rule.name[CURRENT_LANG]}`);
    group.rule.questionTemplates[CURRENT_LANG].forEach(item => {
      lines.push(`- ${item}`);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
}

function updateQuestionsPreview(groups) {
  const preview = document.getElementById("questionsPreview");
  if (!preview) return;
  preview.textContent = buildQuestionsText(groups);
}

function renderAll() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;

  const text = normalize(textArea.value || "");
  const matches = text.trim() ? collectMatches(text) : [];
  const groups = groupByCategory(matches);

  updateCounters(matches, groups);
  updateCategoryList(text, groups);
  updateHighlight(text, matches);
  updateQuestionsPreview(groups);
}

function clearInput() {
  const textArea = document.getElementById("contractText");
  if (textArea) textArea.value = "";
  renderAll();
}

function applyExample() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;

  textArea.value = `本契約に基づく損害賠償責任は、当社の責任の上限を月額料金の6か月分とします。\n\n当社は理由の如何を問わず本契約を解除でき、ユーザーは中途解約の場合に違約金を支払うものとします。\n\n成果物の知的財産権は当社に帰属し、利用許諾の範囲は当社が定めるものとします。\n\n秘密保持義務の例外は事前承諾のない第三者開示には適用されません。\n\n準拠法は日本法とし、東京地方裁判所を第一審の専属的合意管轄とします。`;
  renderAll();
}

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}

function showToast(message) {
  const toast = document.getElementById("copyToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

async function handleCopySummary() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;
  const text = normalize(textArea.value || "");
  const matches = text.trim() ? collectMatches(text) : [];
  const groups = groupByCategory(matches);
  const summary = buildSummaryText(matches, groups);
  const dict = I18N[CURRENT_LANG];

  if (!summary.trim()) {
    showToast(dict[`toast_empty_${CURRENT_LANG}`]);
    return;
  }

  const ok = await copyText(summary);
  showToast(ok ? dict[`toast_copy_${CURRENT_LANG}`] : dict[`toast_empty_${CURRENT_LANG}`]);
}

async function handleCopyQuestions() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;
  const text = normalize(textArea.value || "");
  const matches = text.trim() ? collectMatches(text) : [];
  const groups = groupByCategory(matches);
  const questions = buildQuestionsText(groups);
  const dict = I18N[CURRENT_LANG];

  if (!questions.trim()) {
    showToast(dict[`toast_empty_${CURRENT_LANG}`]);
    return;
  }

  const ok = await copyText(questions);
  showToast(ok ? dict[`toast_copy_${CURRENT_LANG}`] : dict[`toast_empty_${CURRENT_LANG}`]);
}

function handleDownload() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;
  const text = normalize(textArea.value || "");
  const matches = text.trim() ? collectMatches(text) : [];
  const groups = groupByCategory(matches);
  const summary = buildSummaryText(matches, groups);
  const questions = buildQuestionsText(groups);
  const output = `${summary}\n\n${questions}`.trim();
  const dict = I18N[CURRENT_LANG];

  if (!output) {
    showToast(dict[`toast_empty_${CURRENT_LANG}`]);
    return;
  }

  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `contract-cleaner-${date}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(dict[`toast_download_${CURRENT_LANG}`]);
}

function bindEvents() {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const exampleBtn = document.getElementById("exampleBtn");
  const copySummaryBtn = document.getElementById("copySummaryBtn");
  const copyQuestionsBtn = document.getElementById("copyQuestionsBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const onlyMatchedToggle = document.getElementById("onlyMatchedToggle");
  const textArea = document.getElementById("contractText");

  if (analyzeBtn) analyzeBtn.addEventListener("click", renderAll);
  if (clearBtn) clearBtn.addEventListener("click", clearInput);
  if (exampleBtn) exampleBtn.addEventListener("click", applyExample);
  if (copySummaryBtn) copySummaryBtn.addEventListener("click", handleCopySummary);
  if (copyQuestionsBtn) copyQuestionsBtn.addEventListener("click", handleCopyQuestions);
  if (downloadBtn) downloadBtn.addEventListener("click", handleDownload);
  if (onlyMatchedToggle) onlyMatchedToggle.addEventListener("change", renderAll);
  if (textArea) textArea.addEventListener("input", () => {
    if (!textArea.value.trim()) {
      renderAll();
    }
  });
}

function init() {
  const nav = (navigator.language || "ja").toLowerCase();
  CURRENT_LANG = nav.startsWith("en") ? "en" : "ja";
  setLang(CURRENT_LANG);
  bindEvents();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
