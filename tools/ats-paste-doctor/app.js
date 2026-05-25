(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const FREE_LIMIT = 30000;
  const PRO_LIMIT = 200000;
  const TEMPLATE_PREFIX = "nw_ats_paste_doctor_template_";
  const HISTORY_KEY = "nw_ats_paste_doctor_history";
  const HISTORY_LIMIT = 10;

  const el = {
    input: $("inputText"),
    output: $("outputText"),
    preview: $("previewBox"),
    process: $("processBtn"),
    copy: $("copyBtn"),
    download: $("downloadBtn"),
    reset: $("resetBtn"),
    limit: $("limitInput"),
    limitMeta: $("limitMeta"),
    charMeta: $("charMeta"),
    counts: $("countsGrid"),
    warnings: $("warningsList"),
    error: $("errorBox"),
    toast: $("toast"),
    progress: $("progressWrap"),
    proTools: $("proTools"),
    proToolsNote: $("proToolsNote"),
    historyList: $("historyList"),
    langJa: $("langJa"),
    langEn: $("langEn"),
  };

  const modeButtons = {
    safe: $("modeSafe"),
    keep: $("modeKeep"),
    clean: $("modeClean"),
  };

  let currentLang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  let currentMode = "safe";
  let toastTimer = 0;

  const messages = {
    en: {
      "app.title": "ATS Paste Doctor",
      "app.subtitle": "Check line breaks, bullets, invisible characters, and character counts before pasting into job forms.",
      "intro.line1": "Paste your resume text, cover letter, or application note, then generate plain text that is easier to review before submitting.",
      "intro.line2": "Processing runs in your browser. Ads and analytics may still load for the page itself, so redact personal details when needed.",
      "notice.title": "Before you paste personal application text",
      "notice.body": "This tool processes text locally in your browser and does not upload the pasted content. However, page display may load ads and analytics tags. Redact personal details when needed.",
      "guarantee.title": "Not an ATS guarantee",
      "guarantee.body": "ATS and job forms behave differently. Always check the actual form before submitting.",
      "steps.title": "Quick steps",
      "steps.item1": "Paste your text.",
      "steps.item2": "Pick a mode, then click Generate output.",
      "steps.item3": "Copy or download, then check the 2-line preview.",
      "freepro.title": "Free vs Pro (quick)",
      "freepro.free.title": "Free",
      "freepro.free.item1": "Formatting fixes, counts, warnings, 2-line preview",
      "freepro.free.item2": "Copy output and save TXT up to 30,000 characters",
      "freepro.free.item3": "JA/EN UI, personal-info and ATS guarantee notices",
      "freepro.pro.title": "Pro",
      "freepro.pro.item1": "Hide ads and raise the limit to 200,000 characters",
      "freepro.pro.item2": "PDF, Markdown, JSON, templates, and history",
      "freepro.pro.item3": "Full ATS output pack and pre-submit checklist",
      "input.title": "Input",
      "input.label": "Input",
      "input.placeholder": "Paste your text here (job summary, cover letter, bullets)…",
      "input.hint": "May take up to a few seconds.",
      "options.title": "Options",
      "options.mode.label": "Output mode",
      "options.mode.safe": "ATS-friendly plain text",
      "options.mode.keep": "Keep line breaks",
      "options.mode.clean": "Clean",
      "options.limit.label": "Character limit (optional)",
      "options.limit.placeholder": "e.g. 1000",
      "actions.process": "Generate output",
      "actions.copy": "Copy output",
      "actions.download": "Download .txt",
      "actions.reset": "Reset",
      "actions.copyPack": "Copy full ATS pack",
      "actions.copyMarkdown": "Copy Markdown pack",
      "actions.exportJson": "Export JSON",
      "actions.copyChecklist": "Copy checklist",
      "actions.exportPdf": "Export PDF",
      "results.counts.title": "Counts",
      "results.warnings.title": "Warnings",
      "output.title": "Output",
      "output.label": "Output",
      "progress.label": "Processing…",
      "preview.title": "ATS-style preview (2-line textbox)",
      "preview.note": "This is only a small-box readability preview. It does not guarantee how every ATS or job form will display the text.",
      "pro.title": "NicheWorks Pro",
      "pro.unlocked": "Pro unlocked",
      "pro.desc": "Unlock PDF export, templates, history, Markdown/JSON exports, a full ATS output pack, and ad hiding through the shared NicheWorks Pro entitlement.",
      "pro.feature.limit": "Free limit: 30,000 characters. Pro limit: 200,000 characters.",
      "pro.feature.pack": "Pro output pack: ATS-friendly version, line-break-preserved version, Clean version, counts/warnings summary, and pre-submit memo.",
      "pro.feature.storage": "Templates Slot 1–3 and local history save/load/delete.",
      "pro.cta": "Buy Pro",
      "pro.shared": "Uses the shared NicheWorks Pro checkout and entitlement.",
      "pro.afterPurchase": "After purchase, NicheWorks Pro becomes active in this browser. It usually remains active after closing tabs or the browser. Other devices, other browsers, private browsing, or cleared site data require activation again.",
      "propreview.title": "Preview mode",
      "propreview.body": "You can keep using the free cleaner now. The samples below show what becomes available after purchase.",
      "propreview.pack.title": "Pro output pack sample",
      "propreview.pdf.title": "PDF export sample",
      "propreview.pdf.body": "A printable view opens so you can save the full output pack as PDF.",
      "propreview.storage.title": "Templates and history",
      "propreview.storage.body": "Save reusable templates in Slot 1–3 and keep local output history for later review.",
      "propreview.memo.title": "Pre-submit memo sample",
      "propreview.unlockNote": "After purchase, full copy, PDF, templates, and history are enabled.",
      "protools.title": "Pro tools",
      "protools.note": "Locked in Preview mode",
      "protools.noteActive": "Pro tools are unlocked in this browser.",
      "protools.pack.title": "Output pack",
      "protools.pack.note": "Generate full ATS, Markdown, JSON, and checklist exports.",
      "protools.pdf.title": "PDF export",
      "protools.pdf.note": "Open a printable view to save as PDF.",
      "protools.templates.title": "Templates",
      "protools.templates.note": "Save the current output into a slot.",
      "protools.history.title": "History",
      "protools.history.note": "Save outputs locally to revisit later.",
      "templates.slot1": "Slot 1",
      "templates.slot2": "Slot 2",
      "templates.slot3": "Slot 3",
      "templates.save": "Save",
      "templates.load": "Load",
      "history.save": "Save to history",
      "history.clear": "Clear all",
      "faq.title": "FAQ",
      "faq.q1": "Will this always display correctly in every ATS?",
      "faq.a1": "No. ATS and job forms differ. Use this as a plain-text cleanup aid and confirm the result inside the actual form before submitting.",
      "faq.q2": "Is my pasted text uploaded?",
      "faq.a2": "No. Formatting and checks run in your browser. The page may still load ads and analytics tags for site operation.",
      "faq.q3": "Can I paste personal application details?",
      "faq.a3": "You can, but it is safer to redact names, addresses, phone numbers, email addresses, employer names, and detailed work history when possible.",
      "faq.q4": "What is ATS-friendly plain text?",
      "faq.a4": "It reduces fragile formatting and hidden characters that can break when a form converts your text.",
      "faq.q5": "What happens after purchase?",
      "faq.a5": "After purchase, NicheWorks Pro becomes active in this browser. It usually remains active after closing tabs or the browser. Other devices, other browsers, private browsing, or cleared site data require activation again.",
      "related.title": "Related tools",
      "related.usage": "Usage",
      "related.cover": "Cover Letter Lite",
      "related.cold": "Cold Email Requirement Checker",
      "related.redactor": "API Key Token Redactor",
      "related.linebreak": "LineBreak Doctor",
      "footer.line1": "© NicheWorks — Small Web Tools for Boring Tasks",
      "footer.line2": "This site may contain ads. Information accuracy is not guaranteed.",
      "footer.home": "nicheworks.app",
      countTotal: "Total",
      countNoSpaces: "No spaces",
      countNoNewlines: "No newlines",
      countLines: "Lines",
      countParagraphs: "Paragraphs",
      countBullets: "Bullet lines",
      warnInvisible: "Invisible chars",
      warnControl: "Control chars",
      warnSpace: "Non-standard spaces",
      warnMixed: "Mixed newline formats detected",
      warnConsecutive: "Consecutive space blocks",
      noWarnings: "No risky characters detected.",
      emptyInput: "Input is empty. Paste your text first.",
      emptyOutput: "Generate output first.",
      tooLong: "Text is too long for the current plan. Free supports 30,000 characters; Pro supports 200,000 characters.",
      copied: "Copied",
      downloaded: "TXT downloaded",
      copyFailed: "Copy failed. Please check browser permissions.",
      saved: "Saved",
      loaded: "Loaded",
      cleared: "Cleared",
      deleted: "Deleted",
      noTemplate: "This slot is empty.",
      noHistory: "No history yet.",
      proLocked: "Pro feature locked. Preview mode remains available; use Buy Pro to unlock full copy, PDF, and save operations.",
      pdfTip: "Press Ctrl/Cmd+P to save as PDF.",
      storageUnavailable: "Local storage is unavailable. Free features still work, but templates/history may not be saved.",
      remaining: "Remaining",
      overBy: "Over by",
    },
    ja: {
      "app.title": "ATS Paste Doctor",
      "app.subtitle": "応募フォーム貼り付け前に、改行崩れ・箇条書き崩壊・不可視文字・文字数をチェックします。",
      "intro.line1": "職務要約、志望動機、応募メモを貼り付け、提出前に確認しやすいプレーンテキストを生成します。",
      "intro.line2": "処理はブラウザ内で動きます。ページ表示では広告や解析タグが読み込まれる場合があるため、必要に応じて個人情報を伏せてください。",
      "notice.title": "個人情報を含む応募文を貼る前に",
      "notice.body": "このツールは貼り付けた文章をブラウザ内で処理し、アップロードしません。ただしページ表示では広告や解析タグが読み込まれる場合があります。必要に応じて個人情報を伏せてください。",
      "guarantee.title": "ATS表示を保証するものではありません",
      "guarantee.body": "ATSや応募フォームの仕様はそれぞれ異なります。提出前に必ず実際のフォーム上で確認してください。",
      "steps.title": "クイック手順",
      "steps.item1": "文章を貼り付けます。",
      "steps.item2": "モードを選び、「出力を作る」を押します。",
      "steps.item3": "コピー/保存して、2行プレビューで確認します。",
      "freepro.title": "Free / Pro の違い（短く）",
      "freepro.free.title": "Free",
      "freepro.free.item1": "簡易整形、カウント、警告、2行プレビュー",
      "freepro.free.item2": "30,000文字までの出力コピーとTXT保存",
      "freepro.free.item3": "JA/EN UI、個人情報注意、ATS保証ではない注意",
      "freepro.pro.title": "Pro",
      "freepro.pro.item1": "広告非表示、上限200,000文字",
      "freepro.pro.item2": "PDF、Markdown、JSON、テンプレ、履歴",
      "freepro.pro.item3": "Pro出力パックと提出前チェックリスト",
      "input.title": "入力",
      "input.label": "入力",
      "input.placeholder": "ここに文章を貼り付け（職務要約・志望動機・箇条書きなど）…",
      "input.hint": "端末によっては数秒かかる場合があります。",
      "options.title": "オプション",
      "options.mode.label": "出力モード",
      "options.mode.safe": "ATS向け簡易整形",
      "options.mode.keep": "改行保持",
      "options.mode.clean": "毒抜き",
      "options.limit.label": "文字数上限（任意）",
      "options.limit.placeholder": "例：1000",
      "actions.process": "出力を作る",
      "actions.copy": "出力をコピー",
      "actions.download": "TXTで保存",
      "actions.reset": "リセット",
      "actions.copyPack": "Full ATS packをコピー",
      "actions.copyMarkdown": "Markdown packをコピー",
      "actions.exportJson": "JSONを書き出し",
      "actions.copyChecklist": "チェックリストをコピー",
      "actions.exportPdf": "PDFで保存",
      "results.counts.title": "カウント",
      "results.warnings.title": "警告",
      "output.title": "出力",
      "output.label": "出力",
      "progress.label": "処理中…",
      "preview.title": "ATS風プレビュー（2行テキストボックス）",
      "preview.note": "狭い入力欄での読みやすさを見るための簡易プレビューです。実際のATS表示を保証しません。",
      "pro.title": "NicheWorks Pro",
      "pro.unlocked": "Pro解放済み",
      "pro.desc": "共通NicheWorks Pro entitlementで、PDF出力、テンプレ、履歴、Markdown/JSON、Pro出力パック、広告非表示を解放します。",
      "pro.feature.limit": "Free上限: 30,000文字。Pro上限: 200,000文字。",
      "pro.feature.pack": "Pro出力パック: ATS向け整形版、改行保持版、Clean版、文字数・警告サマリー、提出前メモ。",
      "pro.feature.storage": "テンプレ Slot 1〜3 と履歴の保存/読込/削除。",
      "pro.cta": "Proを購入する",
      "pro.shared": "共通NicheWorks Proの決済リンクと権限を使います。",
      "pro.afterPurchase": "購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。",
      "propreview.title": "Previewモード",
      "propreview.body": "無料の整形機能はこのまま使えます。下のサンプルで購入後に解放される内容を確認できます。",
      "propreview.pack.title": "Pro出力パックのサンプル",
      "propreview.pdf.title": "PDF出力サンプル説明",
      "propreview.pdf.body": "印刷用ビューを開き、全文の出力パックをPDF保存できます。",
      "propreview.storage.title": "テンプレ保存と履歴保存",
      "propreview.storage.body": "よく使うテンプレをSlot 1〜3に保存し、出力履歴を後で読み込めます。",
      "propreview.memo.title": "提出前チェックメモのサンプル",
      "propreview.unlockNote": "購入後に全文コピー / PDF / 保存が有効になります。",
      "protools.title": "Pro機能",
      "protools.note": "Previewモードではロック中",
      "protools.noteActive": "このブラウザでPro機能が使えます。",
      "protools.pack.title": "出力パック",
      "protools.pack.note": "Full ATS、Markdown、JSON、チェックリストを書き出します。",
      "protools.pdf.title": "PDF出力",
      "protools.pdf.note": "印刷用の表示を開いてPDF保存します。",
      "protools.templates.title": "テンプレ",
      "protools.templates.note": "現在の出力をスロットに保存します。",
      "protools.history.title": "履歴",
      "protools.history.note": "出力を端末内に保存して後で呼び出せます。",
      "templates.slot1": "Slot 1",
      "templates.slot2": "Slot 2",
      "templates.slot3": "Slot 3",
      "templates.save": "保存",
      "templates.load": "読込",
      "history.save": "履歴に保存",
      "history.clear": "全削除",
      "faq.title": "FAQ",
      "faq.q1": "すべてのATSで正しく表示されますか？",
      "faq.a1": "いいえ。ATSや応募フォームはそれぞれ仕様が異なります。プレーンテキスト化の補助として使い、提出前に実際のフォーム内で必ず確認してください。",
      "faq.q2": "貼り付けた文章はアップロードされますか？",
      "faq.a2": "いいえ。整形とチェックはブラウザ内で実行されます。ページ運用のため広告や解析タグが読み込まれる場合はあります。",
      "faq.q3": "個人情報を含む応募文を貼ってもよいですか？",
      "faq.a3": "可能ですが、氏名、住所、電話番号、メール、勤務先名、詳細な職歴などは必要に応じて伏せる方が安全です。",
      "faq.q4": "ATS向けプレーンテキストとは何ですか？",
      "faq.a4": "フォーム変換時に崩れやすい装飾や隠れ文字を減らしたテキストです。",
      "faq.q5": "購入後はどうなりますか？",
      "faq.a5": "購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。",
      "related.title": "関連ツール",
      "related.usage": "使い方",
      "related.cover": "Cover Letter Lite",
      "related.cold": "Cold Email Requirement Checker",
      "related.redactor": "API Key Token Redactor",
      "related.linebreak": "LineBreak Doctor",
      "footer.line1": "© NicheWorks — Small Web Tools for Boring Tasks",
      "footer.line2": "このサイトには広告が含まれる場合があります。情報の正確性は保証されません。",
      "footer.home": "nicheworks.app",
      countTotal: "総文字数",
      countNoSpaces: "空白除外",
      countNoNewlines: "改行除外",
      countLines: "行数",
      countParagraphs: "段落数",
      countBullets: "箇条書き行数",
      warnInvisible: "不可視文字",
      warnControl: "制御文字",
      warnSpace: "通常と異なる空白",
      warnMixed: "改行コード混在を検出",
      warnConsecutive: "連続スペース箇所",
      noWarnings: "危険な文字は検出されませんでした。",
      emptyInput: "入力が空です。文章を貼り付けてから実行してください。",
      emptyOutput: "先に出力を作成してください。",
      tooLong: "現在のプランでは文字数が多すぎます。Freeは30,000文字、Proは200,000文字まで対応します。",
      copied: "コピーしました",
      downloaded: "TXTを保存しました",
      copyFailed: "コピーできませんでした。ブラウザの権限設定をご確認ください。",
      saved: "保存しました",
      loaded: "読み込みました",
      cleared: "削除しました",
      deleted: "削除しました",
      noTemplate: "このスロットは空です。",
      noHistory: "履歴はまだありません。",
      proLocked: "Pro限定機能です。Previewモードではサンプルのみ表示されます。Buy Proから全文コピー、PDF、保存操作を解放できます。",
      pdfTip: "Ctrl/Cmd+P でPDF保存できます。",
      storageUnavailable: "localStorageを利用できません。無料機能は使えますが、テンプレ/履歴は保存できない場合があります。",
      remaining: "残り",
      overBy: "超過",
    },
  };

  function t(key) {
    return messages[currentLang][key] || messages.en[key] || key;
  }

  function isProActive() {
    return document.documentElement.dataset.proActive === "true";
  }

  function safeStorage(action, fallback) {
    try {
      return action(window.localStorage);
    } catch (error) {
      toast(t("storageUnavailable"));
      return fallback;
    }
  }

  function setLang(lang) {
    currentLang = lang === "ja" ? "ja" : "en";
    document.documentElement.lang = currentLang;
    el.langJa?.classList.toggle("is-active", currentLang === "ja");
    el.langEn?.classList.toggle("is-active", currentLang === "en");

    $$('[data-i18n]').forEach((node) => {
      const value = t(node.getAttribute("data-i18n"));
      if (typeof value === "string") node.textContent = value;
    });
    $$('[data-i18n-placeholder]').forEach((node) => {
      const value = t(node.getAttribute("data-i18n-placeholder"));
      if (typeof value === "string") node.setAttribute("placeholder", value);
    });
    renderCountsAndWarnings();
    renderHistory();
    syncProNote();
  }

  function setMode(mode) {
    currentMode = ["safe", "keep", "clean"].includes(mode) ? mode : "safe";
    Object.entries(modeButtons).forEach(([key, button]) => {
      if (!button) return;
      const active = key === currentMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  function normalizeNewlinesToLF(value) {
    return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function detectMixedNewlines(raw) {
    return /\r\n/.test(raw) && /(^|[^\r])\n/.test(raw);
  }

  function metrics(raw) {
    const sLF = normalizeNewlinesToLF(raw);
    const lines = sLF ? sLF.split("\n") : [];
    return {
      total: raw.length,
      noSpaces: raw.replace(/[\s\u00A0\u3000]/g, "").length,
      noNewlines: raw.replace(/[\r\n]/g, "").length,
      lines: raw ? lines.length : 0,
      paragraphs: sLF.trim() ? sLF.trim().split(/\n{2,}/).filter((block) => block.trim()).length : 0,
      bullets: lines.filter((line) => /^\s*([•\-*\u2022]|・)\s+/.test(line)).length,
      invisible: (raw.match(/[\u200B\u200C\u200D\uFEFF]/g) || []).length,
      control: (raw.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g) || []).length,
      nonStandardSpaces: (raw.match(/[\u00A0\u3000]/g) || []).length,
      mixedNewlines: detectMixedNewlines(raw),
      consecutiveSpaces: (raw.match(/ {2,}/g) || []).length,
    };
  }

  function buildATSsafe(sLF) {
    let text = sLF.split("\n").map((line) => line.replace(/[ \t]+$/g, "")).join("\n");
    text = text.replace(/\u3000/g, " ").replace(/\t/g, " ").replace(/ {2,}/g, " ");
    const bulletRe = /^\s*([•\-*\u2022]|・)\s+(.*)$/;
    const lines = text.split("\n").map((line) => {
      const match = line.match(bulletRe);
      if (match) return `• ${match[2] || ""}`;
      return line.trim() === "" ? "" : line.trim();
    });
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim().split(/\n{2,}/).map((paragraph) => paragraph.replace(/\n+/g, " ").trim()).filter(Boolean).join(" / ");
  }

  function buildKeep(sLF) {
    return sLF.replace(/\u3000/g, " ").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  }

  function buildClean(raw) {
    return normalizeNewlinesToLF(raw)
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/[\u00A0\u3000]/g, " ")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\t/g, " ")
      .replace(/ {2,}/g, " ")
      .replace(/[ ]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function buildOutput(raw, mode = currentMode) {
    const sLF = normalizeNewlinesToLF(raw);
    if (mode === "keep") return buildKeep(sLF);
    if (mode === "clean") return buildClean(raw);
    return buildATSsafe(sLF);
  }

  function renderCountsAndWarnings() {
    const raw = el.input?.value || "";
    const data = metrics(raw);
    if (el.charMeta) el.charMeta.textContent = raw ? `${raw.length.toLocaleString()} chars / ${isProActive() ? PRO_LIMIT.toLocaleString() : FREE_LIMIT.toLocaleString()} max` : "";
    if (el.counts) {
      const items = [
        [t("countTotal"), data.total],
        [t("countNoSpaces"), data.noSpaces],
        [t("countNoNewlines"), data.noNewlines],
        [t("countLines"), data.lines],
        [t("countParagraphs"), data.paragraphs],
        [t("countBullets"), data.bullets],
      ];
      el.counts.innerHTML = "";
      items.forEach(([label, value]) => {
        const card = document.createElement("div");
        card.className = "check";
        const key = document.createElement("div");
        key.className = "check__k";
        key.textContent = label;
        const val = document.createElement("div");
        val.className = "check__v";
        val.textContent = String(value);
        card.append(key, val);
        el.counts.appendChild(card);
      });
    }
    if (el.warnings) {
      const warnings = [];
      if (data.invisible) warnings.push(`${t("warnInvisible")}: ${data.invisible}`);
      if (data.control) warnings.push(`${t("warnControl")}: ${data.control}`);
      if (data.nonStandardSpaces) warnings.push(`${t("warnSpace")}: ${data.nonStandardSpaces}`);
      if (data.mixedNewlines) warnings.push(t("warnMixed"));
      if (data.consecutiveSpaces) warnings.push(`${t("warnConsecutive")}: ${data.consecutiveSpaces}`);
      el.warnings.innerHTML = "";
      const list = warnings.length ? warnings : [t("noWarnings")];
      list.forEach((message) => {
        const item = document.createElement("div");
        item.className = warnings.length ? "warn is-on" : "warn";
        item.textContent = message;
        el.warnings.appendChild(item);
      });
    }
    updateLimitMeta();
  }

  function updateLimitMeta() {
    if (!el.limitMeta || !el.limit) return;
    const limit = Number(el.limit.value || "0");
    if (!limit) {
      el.limitMeta.textContent = "";
      return;
    }
    const length = (el.input?.value || "").length;
    el.limitMeta.textContent = length > limit ? `${t("overBy")} ${length - limit}` : `${t("remaining")} ${limit - length}`;
  }

  function showProgress(active) {
    if (el.progress) el.progress.hidden = !active;
    if (el.process) {
      el.process.disabled = active;
      el.process.textContent = active ? `${t("actions.process")}…` : t("actions.process");
    }
  }

  function error(message) {
    if (!el.error) return;
    el.error.hidden = false;
    el.error.textContent = message;
  }

  function clearError() {
    if (!el.error) return;
    el.error.hidden = true;
    el.error.textContent = "";
  }

  function toast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.toast.hidden = true;
      el.toast.textContent = "";
    }, 2400);
  }

  function process() {
    clearError();
    const raw = el.input?.value || "";
    if (!raw.trim()) return error(t("emptyInput"));
    const max = isProActive() ? PRO_LIMIT : FREE_LIMIT;
    if (raw.length > max) return error(t("tooLong"));
    showProgress(true);
    window.setTimeout(() => {
      try {
        const output = buildOutput(raw);
        if (el.output) el.output.value = output;
        if (el.preview) el.preview.textContent = output;
        renderCountsAndWarnings();
      } catch (processingError) {
        error(currentLang === "ja" ? "処理に失敗しました。入力を短くして再試行してください。" : "Processing failed. Try smaller input.");
      } finally {
        showProgress(false);
      }
    }, 60);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(t("copied"));
    } catch (clipboardError) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (copyError) {
        ok = false;
      }
      area.remove();
      ok ? toast(t("copied")) : error(t("copyFailed"));
    }
  }

  function downloadFile(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function copyOutput() {
    clearError();
    const output = el.output?.value || "";
    if (!output.trim()) return error(t("emptyOutput"));
    copyText(output);
  }

  function downloadTxt() {
    clearError();
    const output = el.output?.value || "";
    if (!output.trim()) return error(t("emptyOutput"));
    downloadFile("ats-paste-doctor.txt", output, "text/plain;charset=utf-8");
    toast(t("downloaded"));
  }

  function resetAll() {
    clearError();
    if (el.input) el.input.value = "";
    if (el.output) el.output.value = "";
    if (el.preview) el.preview.textContent = "";
    if (el.limit) el.limit.value = "";
    setMode("safe");
    renderCountsAndWarnings();
  }

  function summaryLines(raw) {
    const data = metrics(raw);
    const warnings = [];
    if (data.invisible) warnings.push(`${t("warnInvisible")}: ${data.invisible}`);
    if (data.control) warnings.push(`${t("warnControl")}: ${data.control}`);
    if (data.nonStandardSpaces) warnings.push(`${t("warnSpace")}: ${data.nonStandardSpaces}`);
    if (data.mixedNewlines) warnings.push(t("warnMixed"));
    if (data.consecutiveSpaces) warnings.push(`${t("warnConsecutive")}: ${data.consecutiveSpaces}`);
    return [
      `${t("countTotal")}: ${data.total}`,
      `${t("countLines")}: ${data.lines}`,
      `${t("countParagraphs")}: ${data.paragraphs}`,
      `${t("countBullets")}: ${data.bullets}`,
      `Warnings: ${warnings.length ? warnings.join("; ") : t("noWarnings")}`,
    ];
  }

  function checklist() {
    return currentLang === "ja" ? [
      "応募フォーム内で改行と箇条書きの見え方を確認する",
      "不要な個人情報が残っていないか確認する",
      "不可視文字・制御文字・通常と異なる空白の警告を確認する",
      "文字数上限が応募フォーム側の制限内か確認する",
      "提出前に実際のプレビューまたは確認画面を読む",
    ] : [
      "Check line breaks and bullets inside the actual application form",
      "Confirm unnecessary personal details are removed",
      "Review invisible/control/non-standard space warnings",
      "Confirm the text fits the job form character limit",
      "Read the final preview or confirmation screen before submitting",
    ];
  }

  function ensureOutput() {
    const raw = el.input?.value || "";
    const current = el.output?.value || "";
    if (current.trim()) return current;
    if (!raw.trim()) return "";
    const output = buildOutput(raw);
    if (el.output) el.output.value = output;
    if (el.preview) el.preview.textContent = output;
    return output;
  }

  function buildPack() {
    const raw = el.input?.value || "";
    const output = ensureOutput();
    if (!raw.trim() && !output.trim()) return "";
    const safe = buildOutput(raw || output, "safe");
    const keep = buildOutput(raw || output, "keep");
    const clean = buildOutput(raw || output, "clean");
    const lines = [
      "# ATS Paste Doctor Pro Output Pack",
      "",
      "## ATS-friendly version",
      safe,
      "",
      "## Line-break-preserved version",
      keep,
      "",
      "## Clean version",
      clean,
      "",
      "## Character and warning summary",
      ...summaryLines(raw || output).map((line) => `- ${line}`),
      "",
      "## Pre-submit checklist memo",
      ...checklist().map((item) => `- [ ] ${item}`),
      "",
      "Note: This is a preparation aid and does not guarantee ATS display.",
    ];
    return lines.join("\n");
  }

  function buildJsonExport() {
    const raw = el.input?.value || "";
    const source = raw || el.output?.value || "";
    return JSON.stringify({
      tool_id: "ats-paste-doctor",
      entitlement: "nicheworks_pro",
      generated_at: new Date().toISOString(),
      mode: currentMode,
      outputs: {
        ats_friendly: buildOutput(source, "safe"),
        line_break_preserved: buildOutput(source, "keep"),
        clean: buildOutput(source, "clean"),
      },
      summary: metrics(source),
      checklist: checklist(),
      note: "Preparation aid only. Actual ATS display is not guaranteed.",
    }, null, 2);
  }

  function requirePro() {
    if (isProActive()) return true;
    toast(t("proLocked"));
    document.querySelector("[data-pro-buy]")?.focus?.();
    return false;
  }

  function requireOutput() {
    const output = ensureOutput();
    if (!output.trim()) {
      error(t("emptyOutput"));
      return "";
    }
    return output;
  }

  function exportPdf() {
    const pack = buildPack();
    if (!pack.trim()) return error(t("emptyOutput"));
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return error(currentLang === "ja" ? "新しいウィンドウを開けませんでした。ポップアップ設定をご確認ください。" : "Could not open a new window. Please allow pop-ups.");
    const safe = pack.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]));
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ATS Paste Doctor Pro Pack</title><style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:24px;color:#111}pre{white-space:pre-wrap;border:1px solid #ddd;border-radius:10px;padding:12px;background:#fafafa;line-height:1.5}</style></head><body><h1>ATS Paste Doctor Pro Pack</h1><pre>${safe}</pre><p>${t("pdfTip")}</p></body></html>`);
    win.document.close();
    toast(t("pdfTip"));
  }

  function saveTemplate(slot) {
    const output = requireOutput();
    if (!output) return;
    safeStorage((storage) => storage.setItem(`${TEMPLATE_PREFIX}${slot}`, output));
    toast(t("saved"));
  }

  function loadTemplate(slot) {
    clearError();
    const value = safeStorage((storage) => storage.getItem(`${TEMPLATE_PREFIX}${slot}`), "");
    if (!value) return error(t("noTemplate"));
    if (el.input) el.input.value = value;
    if (el.output) el.output.value = value;
    if (el.preview) el.preview.textContent = value;
    renderCountsAndWarnings();
    toast(t("loaded"));
  }

  function getHistory() {
    return safeStorage((storage) => {
      try {
        const parsed = JSON.parse(storage.getItem(HISTORY_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }, []);
  }

  function setHistory(items) {
    safeStorage((storage) => storage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT))));
  }

  function renderHistory() {
    if (!el.historyList) return;
    const items = getHistory();
    el.historyList.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "meta";
      empty.textContent = t("noHistory");
      el.historyList.appendChild(empty);
      return;
    }
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "history-item";
      const meta = document.createElement("div");
      meta.className = "history-item__meta";
      meta.textContent = item.date || "";
      const snippet = document.createElement("div");
      snippet.className = "history-item__snippet";
      snippet.textContent = item.snippet || "";
      const actions = document.createElement("div");
      actions.className = "row";
      const load = document.createElement("button");
      load.type = "button";
      load.className = "btn btn-small";
      load.textContent = currentLang === "ja" ? "読込" : "Load";
      load.disabled = !isProActive();
      load.addEventListener("click", () => {
        if (!requirePro()) return;
        if (el.input) el.input.value = item.text || "";
        if (el.output) el.output.value = item.text || "";
        if (el.preview) el.preview.textContent = item.text || "";
        renderCountsAndWarnings();
        toast(t("loaded"));
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-small btn-ghost";
      remove.textContent = currentLang === "ja" ? "削除" : "Delete";
      remove.disabled = !isProActive();
      remove.addEventListener("click", () => {
        if (!requirePro()) return;
        setHistory(getHistory().filter((_, itemIndex) => itemIndex !== index));
        renderHistory();
        toast(t("deleted"));
      });
      actions.append(load, remove);
      row.append(meta, snippet, actions);
      el.historyList.appendChild(row);
    });
  }

  function saveHistory() {
    const output = requireOutput();
    if (!output) return;
    const next = [{
      date: new Date().toLocaleString(currentLang === "ja" ? "ja-JP" : "en-US"),
      snippet: output.replace(/\s+/g, " ").trim().slice(0, 100),
      text: output,
    }, ...getHistory()];
    setHistory(next);
    renderHistory();
    toast(t("saved"));
  }

  function clearHistory() {
    setHistory([]);
    renderHistory();
    toast(t("cleared"));
  }

  function handleProAction(action, target) {
    clearError();
    if (!requirePro()) return;
    if (action === "copy-pack") {
      const pack = buildPack();
      if (!pack.trim()) return error(t("emptyOutput"));
      copyText(pack);
    }
    if (action === "copy-markdown") {
      const pack = buildPack();
      if (!pack.trim()) return error(t("emptyOutput"));
      copyText(pack);
    }
    if (action === "export-json") {
      if (!requireOutput()) return;
      downloadFile("ats-paste-doctor-pro-pack.json", buildJsonExport(), "application/json;charset=utf-8");
      toast(t("downloaded"));
    }
    if (action === "copy-checklist") copyText(checklist().map((item) => `- [ ] ${item}`).join("\n"));
    if (action === "export-pdf") exportPdf();
    if (action === "save-template") saveTemplate(target.dataset.slot || "1");
    if (action === "load-template") loadTemplate(target.dataset.slot || "1");
    if (action === "save-history") saveHistory();
    if (action === "clear-history") clearHistory();
  }

  function syncProNote() {
    const active = isProActive();
    if (el.proTools) el.proTools.classList.toggle("is-locked", !active);
    if (el.proToolsNote) el.proToolsNote.textContent = active ? t("protools.noteActive") : t("protools.note");
    renderCountsAndWarnings();
    renderHistory();
  }

  function init() {
    setLang(currentLang);
    setMode("safe");
    renderCountsAndWarnings();
    el.langJa?.addEventListener("click", () => setLang("ja"));
    el.langEn?.addEventListener("click", () => setLang("en"));
    Object.values(modeButtons).forEach((button) => button?.addEventListener("click", () => setMode(button.dataset.mode)));
    el.input?.addEventListener("input", renderCountsAndWarnings);
    el.limit?.addEventListener("input", updateLimitMeta);
    el.process?.addEventListener("click", process);
    el.copy?.addEventListener("click", copyOutput);
    el.download?.addEventListener("click", downloadTxt);
    el.reset?.addEventListener("click", resetAll);
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-pro-action]");
      if (!action) return;
      event.preventDefault();
      handleProAction(action.dataset.proAction, action);
    });
    document.addEventListener("nw-pro-status-change", syncProNote);
    window.addEventListener("storage", syncProNote);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
