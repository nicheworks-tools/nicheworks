"use strict";

/* ===============================
   Translation Data
================================= */
const translations = {
  ja: {
    page_title: "SNS改行整形・投稿テキスト補正｜LineBreak Doctor | NicheWorks",
    page_description: "X、Instagram、LINE、Facebook、LinkedIn向けに、投稿文の改行崩れや余白をブラウザ内で整形する無料ツールです。コピー前のSNS投稿テキスト調整に使えます。",
    header_subtitle: "SNSで消える・崩れる改行を、投稿前にブラウザ内で整形します。",
    intro_title: "SNS投稿前の改行チェックに",
    intro_text: "X、Instagram、LINE、Facebook、LinkedIn向けに、改行・空行・余白を調整したコピー用テキストを生成します。処理はブラウザ内で完結します。",
    intro_notice: "一部の出力には、空行維持のため見えない文字（ゼロ幅スペース）が含まれます。検索・文字数制限・コピー先アプリによって扱いが変わる場合があります。",
    howto_title: "使い方",
    howto_step1: "整形したい文章を入力欄に貼り付けます。",
    howto_step2: "「整形する」を押します。",
    howto_step3: "SNS別の結果を確認し、使いたい結果をコピーします。",
    howto_step4: "投稿前に、各SNSの投稿画面で表示を確認してください。",
    input_title: "原文テキスト",
    input_label: "整形したい文章",
    input_placeholder: "ここに整形したい文章を貼り付けてください",
    policy_label: "見えない文字（ゼロ幅スペース）の扱い",
    policy_safe: "表示崩れ防止（空行を維持）",
    policy_plain: "プレーンテキスト（見えない文字を挿入しない）",
    policy_help: "※プレーンテキスト設定では、SNSによって空行が消える場合があります。",
    char_count_label: "文字数：",
    btn_format: "整形する",
    btn_reset: "リセット",
    rules_title: "SNS別の整形内容",
    rules_notice: "SNS側の仕様変更により、表示結果が変わる場合があります。投稿前に必ず各SNSの投稿画面で確認してください。",
    faq_title: "よくある質問",
    faq_q1: "処理はどこで行われますか？",
    faq_a1: "整形処理はブラウザ内で行います。ページ表示用の広告・解析タグは別途読み込まれます。",
    faq_q2: "SNSごとの表示を完全に再現できますか？",
    faq_a2: "完全な再現はできません。各SNSの仕様変更や投稿画面の挙動により表示が変わる場合があります。",
    faq_q3: "見えない文字は入りますか？",
    faq_a3: "Instagram、Facebook、LinkedIn向けでは、空行維持のためゼロ幅スペースを入れる場合があります。",
    faq_q4: "LINE向けは何をしていますか？",
    faq_a4: "主に改行コードを統一し、コピー時の崩れを減らします。",
    diag_lines: "行数",
    diag_blanks: "空行",
    diag_zwsp: "挿入された見えない文字",
    diag_changed: "本文変更あり",
    diag_no_change: "なし",
    diag_yes: "あり",
    result_suffix: "向け",
    btn_copy: "{name}向けをコピー",
    status_generating: "SNS別の整形結果を生成しました。投稿前に各SNSの投稿画面で表示を確認してください。",
    status_input_required: "整形する文章を入力してください。",
    toast_copied: "{name}向けテキストをコピーしました。",
    toast_copy_failed: "コピーできませんでした。テキストを選択して手動でコピーしてください。",
    toast_formatted: "整形結果を生成しました。",
    toast_reset: "入力と結果をリセットしました。",
    donate_text: "このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
    footer_notice: "当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。"
  },
  en: {
    page_title: "LineBreak Doctor | SNS Line Break Formatter & Text Adjuster | NicheWorks",
    page_description: "Free browser-based tool to fix line break issues and spacing for X, Instagram, LINE, Facebook, and LinkedIn. Perfect for adjusting SNS posts before copying.",
    header_subtitle: "Fix SNS line break issues in your browser before posting.",
    intro_title: "SNS Post Preparation",
    intro_text: "Generate optimized text with adjusted line breaks and spacing for X, Instagram, LINE, Facebook, and LinkedIn. All processing happens in your browser.",
    intro_notice: "Some outputs may include invisible characters (zero-width spaces) to preserve blank lines. Handling may vary depending on search, character limits, or the app used.",
    howto_title: "How to Use",
    howto_step1: "Paste your text into the input field.",
    howto_step2: "Click \"Format\".",
    howto_step3: "Check results for each platform and copy the one you want.",
    howto_step4: "Verify the layout in the actual SNS post screen before final submission.",
    input_title: "Original Text",
    input_label: "Text to format",
    input_placeholder: "Paste your post text here",
    policy_label: "Invisible Characters (Zero-Width Space) Policy",
    policy_safe: "Platform-safe (Preserve blank lines)",
    policy_plain: "Plain text (No invisible characters inserted)",
    policy_help: "*In plain text mode, some platforms may remove blank lines.",
    char_count_label: "Characters:",
    btn_format: "Format",
    btn_reset: "Reset",
    rules_title: "Formatting by Platform",
    rules_notice: "Rendering may change due to platform updates. Always verify in the official app before posting.",
    faq_title: "FAQ",
    faq_q1: "Where is the text processed?",
    faq_a1: "Processing is done locally in your browser. Ads and analytics tags are loaded separately.",
    faq_q2: "Is the preview 100% accurate?",
    faq_a2: "We cannot guarantee 100% accuracy as platform specifications frequently change.",
    faq_q3: "Does it insert invisible characters?",
    faq_a3: "For Instagram, Facebook, and LinkedIn, zero-width spaces may be added to maintain blank lines.",
    faq_q4: "What does the LINE formatter do?",
    faq_a4: "It primarily normalizes line break codes to ensure consistency when copying.",
    diag_lines: "Lines",
    diag_blanks: "Blank Lines",
    diag_zwsp: "Inserted Invisible Chars",
    diag_changed: "Content Changed",
    diag_no_change: "None",
    diag_yes: "Yes",
    result_suffix: "",
    btn_copy: "Copy for {name}",
    status_generating: "Generated results for each platform. Please verify in the actual app.",
    status_input_required: "Please enter text to format.",
    toast_copied: "Copied text for {name}",
    toast_copy_failed: "Failed to copy. Please select and copy manually.",
    toast_formatted: "Formatting complete.",
    toast_reset: "Reset input and results.",
    donate_text: "If this tool helps you, a small donation to support development would be appreciated.",
    footer_notice: "This site may contain advertisements. Accuracy is not guaranteed; please check official information."
  }
};

/* ===============================
   SNS Profiles and Formatters
================================= */
function normalizeLineBreaks(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function trimLineEdges(text) {
  return text.replace(/^[ \t]+/gm, "").replace(/[ \t]+$/gm, "");
}

const snsProfiles = [
  {
    id: "X",
    name: "X",
    defaultZeroWidth: false,
    guide: {
      ja: "連続改行を1つにし、行頭・行末の余分な空白を削除します。短文投稿や告知文向けです。",
      en: "Reduces multiple line breaks to one and removes leading/trailing spaces. Best for short posts and announcements."
    },
    formatter: (text, policy) => {
      let output = normalizeLineBreaks(text);
      output = trimLineEdges(output);
      output = output.replace(/\n{2,}/g, "\n");
      return output.trim();
    }
  },
  {
    id: "Instagram",
    name: "Instagram",
    defaultZeroWidth: true,
    guide: {
      ja: "連続改行を最大2つに整え、行頭・行末の空白を削除します。絵文字直後の改行維持にゼロ幅スペースを使う場合があります。",
      en: "Limits multiple line breaks to a maximum of two and removes leading/trailing spaces. Uses zero-width spaces to maintain line breaks after emojis."
    },
    formatter: (text, policy) => {
      let output = normalizeLineBreaks(text);
      output = trimLineEdges(output);
      output = output.replace(/\n{3,}/g, "\n\n");
      if (policy === "platform-safe") {
        output = output.replace(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])\n/gu, "$1\u200B\n");
      }
      return output.trim();
    }
  },
  {
    id: "LINE",
    name: "LINE",
    defaultZeroWidth: false,
    guide: {
      ja: "改行コードを統一します。LINEは改行を比較的保持しやすいため、過剰な変換は行いません。",
      en: "Normalizes line break codes. LINE usually preserves line breaks well, so minimal formatting is applied."
    },
    formatter: (text, policy) => {
      return normalizeLineBreaks(text).trim();
    }
  },
  {
    id: "Facebook",
    name: "Facebook",
    defaultZeroWidth: true,
    guide: {
      ja: "連続改行を最大2つに整え、空行維持のためゼロ幅スペースを入れる場合があります。",
      en: "Limits multiple line breaks to a maximum of two and inserts zero-width spaces to maintain blank lines."
    },
    formatter: (text, policy) => {
      let output = normalizeLineBreaks(text);
      output = trimLineEdges(output);
      output = output.replace(/\n{3,}/g, "\n\n");
      if (policy === "platform-safe") {
        output = output.replace(/\n\n/g, "\n\u200B\n");
      }
      return output.trim();
    }
  },
  {
    id: "LinkedIn",
    name: "LinkedIn",
    defaultZeroWidth: true,
    guide: {
      ja: "段落が詰まりすぎないように連続改行を整理し、空行維持のためゼロ幅スペースを使う場合があります。",
      en: "Organizes multiple line breaks to prevent paragraphs from crowding. May use zero-width spaces to maintain blank lines."
    },
    formatter: (text, policy) => {
      let output = normalizeLineBreaks(text);
      output = trimLineEdges(output);
      output = output.replace(/\n{3,}/g, "\n\n");
      if (policy === "platform-safe") {
        output = output.replace(/\n\n/g, "\n\u200B\n");
        output = output.replace(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])\n/gu, "$1\u200B\n");
      }
      return output.trim();
    }
  }
];

/* ===============================
   Core UI Elements
================================= */
const inputEl = document.getElementById("input");
const formatBtn = document.getElementById("formatBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const charCountEl = document.getElementById("charCount");
const toastEl = document.getElementById("toast");
const langButtons = document.querySelectorAll(".nw-lang-switch button");
const rulesListEl = document.getElementById("rules-list");
const faqListEl = document.getElementById("faq-list");

let currentLang = "ja";
let toastTimer = null;

/* ===============================
   i18n Logic
================================= */
function initLang() {
  const savedLang = localStorage.getItem("nw_lang");
  if (savedLang && translations[savedLang]) {
    currentLang = savedLang;
  } else {
    const browserLang = (navigator.language || "").toLowerCase();
    currentLang = browserLang.startsWith("ja") ? "ja" : "en";
  }
  applyLang(currentLang);
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("nw_lang", lang);
  document.documentElement.lang = lang;

  const t = translations[lang];

  // Update data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });

  // Update page title and meta tags
  if (t.page_title) {
    document.title = t.page_title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t.page_title);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", t.page_title);
  }
  if (t.page_description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.page_description);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t.page_description);
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", t.page_description);
  }

  if (inputEl) {
    inputEl.placeholder = t.input_placeholder;
  }

  langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  renderRules();
  renderFAQ();
  if (resultsEl.children.length > 0) {
    renderResults(false); // Re-render without toast change
  } else if (statusEl.textContent.trim()) {
    // If status message exists but no results (likely empty input error), translate it
    if (statusEl.classList.contains("is-error")) {
      setStatus(t.status_input_required, true);
    }
  }
}

function renderRules() {
  if (!rulesListEl) return;
  rulesListEl.innerHTML = "";
  snsProfiles.forEach((sns) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${sns.name}：</strong>${sns.guide[currentLang]}`;
    rulesListEl.appendChild(li);
  });
}

function renderFAQ() {
  if (!faqListEl) return;
  faqListEl.innerHTML = "";
  const t = translations[currentLang];
  [1, 2, 3, 4].forEach((i) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = t[`faq_q${i}`];
    const p = document.createElement("p");
    p.textContent = t[`faq_a${i}`];
    details.append(summary, p);
    faqListEl.appendChild(details);
  });
}

/* ===============================
   Diagnostics Logic
================================= */
function getDiagnostics(input, output) {
  const normInput = normalizeLineBreaks(input);
  const normOutput = normalizeLineBreaks(output);

  // Unicode-safe line split
  const inputLines = normInput.split("\n");
  const outputLines = normOutput.split("\n");

  // A line is considered blank if it contains only whitespace or zero-width spaces
  const isEffectivelyBlank = (l) => l.replace(/[\s\u200B]/g, "") === "";
  const inputBlanks = inputLines.filter(isEffectivelyBlank).length;
  const outputBlanks = outputLines.filter(isEffectivelyBlank).length;

  // Zero-width chars count (\u200B)
  const zwspInInput = (normInput.match(/\u200B/g) || []).length;
  const zwspInOutput = (normOutput.match(/\u200B/g) || []).length;
  // Net inserted ZWSP
  const zwspCount = Math.max(0, zwspInOutput - zwspInInput);

  // Check if visible content changed (ignoring whitespace and zwsp)
  const strip = (t) => t.replace(/[\s\u200B]/g, "");
  const visibleChanged = strip(normInput) !== strip(normOutput);

  return {
    lineBefore: inputLines.length,
    lineAfter: outputLines.length,
    blankBefore: inputBlanks,
    blankAfter: outputBlanks,
    zwspCount: zwspCount,
    visibleChanged: visibleChanged
  };
}

/* ===============================
   Utility Functions
================================= */
function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

function showToast(message, isError = false) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.toggle("is-error", isError);
  toastEl.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2600);
}

function updateCharCount() {
  if (!charCountEl || !inputEl) return;
  // Unicode-aware character count using Array.from to count surrogate pairs as 1
  const count = Array.from(inputEl.value).length;
  charCountEl.textContent = String(count);
}

async function copyText(text, snsName) {
  const t = translations[currentLang];
  const successMsg = t.toast_copied.replace("{name}", snsName);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
      return true;
    }
    throw new Error("Clipboard API unavailable");
  } catch (_) {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.top = "-9999px";
    fallback.style.left = "-9999px";
    document.body.appendChild(fallback);
    fallback.focus();
    fallback.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_) {
      copied = false;
    }
    document.body.removeChild(fallback);
    if (copied) {
      showToast(successMsg);
      return true;
    }
    showToast(t.toast_copy_failed, true);
    return false;
  }
}

/* ===============================
   Result Rendering
================================= */
function buildResultCard(sns, formatted, diag) {
  const t = translations[currentLang];
  const block = document.createElement("section");
  block.className = "sns-block";

  const heading = document.createElement("h2");
  heading.textContent = `${sns.name}${t.result_suffix}`;

  const pre = document.createElement("pre");
  pre.className = "result-text";
  pre.textContent = formatted;

  const diagEl = document.createElement("div");
  diagEl.className = "diag-summary";
  diagEl.innerHTML = `
    <div class="diag-item"><span class="diag-label">${t.diag_lines}:</span> <span class="diag-value">${diag.lineBefore} → ${diag.lineAfter}</span></div>
    <div class="diag-item"><span class="diag-label">${t.diag_blanks}:</span> <span class="diag-value">${diag.blankBefore} → ${diag.blankAfter}</span></div>
    <div class="diag-item"><span class="diag-label">${t.diag_zwsp}:</span> <span class="diag-value">${diag.zwspCount}</span></div>
    <div class="diag-item"><span class="diag-label">${t.diag_changed}:</span> <span class="${diag.visibleChanged ? 'diag-warn' : 'diag-value'}">${diag.visibleChanged ? t.diag_yes : t.diag_no_change}</span></div>
  `;

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "copy-btn";
  copyButton.textContent = t.btn_copy.replace("{name}", sns.name);
  copyButton.addEventListener("click", () => copyText(formatted, sns.name));

  block.append(heading, pre, diagEl, copyButton);
  return block;
}

function renderResults(showFeedback = true) {
  const rawInput = inputEl.value || "";
  const t = translations[currentLang];
  const policy = document.querySelector('input[name="policy"]:checked').value;

  if (!rawInput.trim()) {
    if (showFeedback) {
      resultsEl.innerHTML = "";
      setStatus(t.status_input_required, true);
      inputEl.focus();
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  snsProfiles.forEach((sns) => {
    const formatted = sns.formatter(rawInput, policy);
    const diag = getDiagnostics(rawInput, formatted);
    fragment.appendChild(buildResultCard(sns, formatted, diag));
  });

  resultsEl.replaceChildren(fragment);
  if (showFeedback) {
    setStatus(t.status_generating, false);
    showToast(t.toast_formatted);
  } else {
    // If just re-rendering (e.g. language switch), refresh the status message in current language
    const currentStatus = statusEl.textContent.trim();
    const jaGen = translations.ja.status_generating;
    const enGen = translations.en.status_generating;
    if (currentStatus === jaGen || currentStatus === enGen) {
      setStatus(t.status_generating, false);
    }
  }
}

function resetTool() {
  const t = translations[currentLang];
  inputEl.value = "";
  resultsEl.replaceChildren();
  setStatus("");
  updateCharCount();
  showToast(t.toast_reset);
  inputEl.focus();
}

/* ===============================
   Initialization
================================= */
if (inputEl && formatBtn && resetBtn) {
  inputEl.addEventListener("input", updateCharCount);
  formatBtn.addEventListener("click", () => renderResults(true));
  resetBtn.addEventListener("click", resetTool);

  document.querySelectorAll('input[name="policy"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (resultsEl.children.length > 0) {
        renderResults(false);
      }
    });
  });

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  initLang();
  updateCharCount();
}
