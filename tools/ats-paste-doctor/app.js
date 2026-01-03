/* ATS Paste Doctor | NicheWorks (MVP scaffold)
 * - Common Spec v3: progress + reset + red error + placeholder + ad slots kept
 * - Free flow works; Pro unlock via ?pro=1 localStorage
 */

(() => {
  const $ = (id) => document.getElementById(id);

  const inputText = $("inputText");
  const outputText = $("outputText");
  const previewBox = $("previewBox");

  const processBtn = $("processBtn");
  const copyBtn = $("copyBtn");
  const downloadBtn = $("downloadBtn");
  const resetBtn = $("resetBtn");
  const exportPdfBtn = $("exportPdfBtn");
  const proTools = $("proTools");
  const proToolsNote = $("proToolsNote");

  const progressWrap = $("progressWrap");
  const errorBox = $("errorBox");
  const toast = $("toast");

  const countsGrid = $("countsGrid");
  const warningsList = $("warningsList");

  const limitInput = $("limitInput");
  const limitMeta = $("limitMeta");
  const charMeta = $("charMeta");

  const modeBtns = {
    safe: $("modeSafe"),
    keep: $("modeKeep"),
    clean: $("modeClean"),
  };

  const proCard = $("proCard");
  const proBadge = $("proBadge");

  const langJa = $("langJa");
  const langEn = $("langEn");

  const PRO_KEY = "nw_pro_ats_paste_doctor";
  const STRIPE_LINK = "https://example.com/stripe-payment-link"; // replace later
  $("buyProLink").setAttribute("href", STRIPE_LINK);

  let currentLang = "en";
  let currentMode = "safe";
  let toastTimer = null;

  const messages = {
    en: {
      "app.title": "ATS Paste Doctor",
      "app.subtitle": "Check formatting issues and invisible characters before pasting into ATS/job forms.",
      "intro.line1": "Paste your text, pick a mode, and copy a safer version for ATS forms.",
      "intro.line2": "Runs locally in your browser. Your text is not uploaded.",
      "steps.title": "Quick steps",
      "steps.item1": "Paste your text.",
      "steps.item2": "Pick a mode, then click Generate output.",
      "steps.item3": "Copy or download, then check the 2-line preview.",
      "freepro.title": "Free vs Pro (quick)",
      "freepro.free.title": "Free",
      "freepro.free.item1": "Formatting fixes (ATS-safe / keep line breaks / clean)",
      "freepro.free.item2": "Counts + warnings for risky characters",
      "freepro.free.item3": "Copy / TXT download + 2-line preview",
      "freepro.pro.title": "Pro",
      "freepro.pro.item1": "Hide ads in the UI",
      "freepro.pro.item2": "Higher text limit",
      "freepro.pro.item3": "Templates / history / PDF export",
      "input.title": "Input",
      "input.label": "Input",
      "input.placeholder": "Paste your text here (job summary, cover letter, bullets)…",
      "input.hint": "May take up to a few seconds.",
      "options.title": "Options",
      "options.mode.label": "Output mode",
      "options.mode.safe": "ATS-safe",
      "options.mode.keep": "Keep line breaks",
      "options.mode.clean": "Clean",
      "options.limit.label": "Character limit (optional)",
      "options.limit.placeholder": "e.g. 1000",
      "actions.process": "Generate output",
      "results.counts.title": "Counts",
      "results.warnings.title": "Warnings",
      "output.title": "Output",
      "output.label": "Output",
      "actions.copy": "Copy output",
      "actions.download": "Download .txt",
      "actions.exportPdf": "Export PDF",
      "actions.reset": "Reset",
      "progress.label": "Processing…",
      "preview.title": "ATS-style preview (2-line textbox)",
      "preview.note": "Some ATS forms show only a tiny textbox. Check readability here.",
      "pro.title": "Unlock Pro ($2.99 one-time)",
      "pro.unlocked": "Pro unlocked",
      "pro.desc": "Hide ads and unlock templates, history, and PDF export (stored locally only).",
      "pro.feature.ads": "Hide ads in the UI",
      "pro.feature.limit": "Higher text limit",
      "pro.feature.presets": "Templates / history / PDF export",
      "pro.cta": "Buy Pro",
      "pro.priceNote": "$2.99 one-time",
      "pro.howto": "After payment, return to this page with ?pro=1 to enable Pro on this device.",
      "protools.title": "Pro tools",
      "protools.note": "Available with Pro",
      "protools.pdf.title": "PDF export",
      "protools.pdf.note": "Open a printable view to save as PDF.",
      "protools.templates.title": "Templates",
      "protools.templates.note": "Save the current output into a slot.",
      "protools.history.title": "History",
      "protools.history.note": "Save outputs to revisit later.",
      "templates.slot1": "Slot 1",
      "templates.slot2": "Slot 2",
      "templates.slot3": "Slot 3",
      "templates.save": "Save",
      "templates.load": "Load",
      "history.save": "Save to history",
      "history.clear": "Clear all",
      "history.empty": "No history yet.",
      "history.load": "Load",
      "history.delete": "Delete",
      "pdf.tip": "Press Ctrl/Cmd+P to save as PDF.",
      "error.noOutput": "Generate output first.",
      "error.noTemplate": "This slot is empty.",
      "privacy.note": "Runs fully in your browser. Your text is not saved or sent (only Pro status may be stored locally).",
      "donate.text": "If this tool helped, consider supporting continued development.",
      "donate.ofuse": "💌 OFUSE",
      "donate.kofi": "☕ Ko-fi",
      "faq.title": "FAQ",
      "faq.q1": "Why do line breaks or bullets break in ATS forms?",
      "faq.a1": "Many ATS/web forms strip formatting or collapse whitespace. This tool normalizes text to safer plain text.",
      "faq.q2": "Is my text uploaded or saved?",
      "faq.a2": "No. Processing runs locally in your browser; only Pro status may be stored locally.",
      "faq.q3": "What do “ATS-safe / Keep line breaks / Clean” mean?",
      "faq.a3": "ATS-safe flattens bullets/paragraphs, Keep line breaks preserves line structure, Clean removes invisible/control characters.",
      "faq.q4": "Why do I see warnings like invisible chars or mixed newlines?",
      "faq.a4": "Those hidden characters can cause paste glitches. The warnings flag risky patterns so you can fix them.",
      "faq.q5": "How do I unlock Pro ($2.99) and what persists?",
      "faq.a5": "Complete the payment, then revisit with ?pro=1. Pro status is saved on this device only.",
      "help.title": "Help links",
      "help.usage": "Usage",
      "help.howto": "How to use (guide)",
      "help.home": "NicheWorks Home",
      "footer.line1": "© NicheWorks — Small Web Tools for Boring Tasks",
      "footer.line2": "This site may contain ads. Information accuracy is not guaranteed. Always verify official sources.",
      "footer.home": "nicheworks.pages.dev",
    },
    ja: {
      "app.title": "ATS Paste Doctor",
      "app.subtitle": "応募フォーム貼り付け前に、改行崩れ・箇条書き崩壊・不可視文字をチェックして安全な形に整えます。",
      "intro.line1": "文章を貼ってモードを選び、応募フォーム向けの安全な形にしてコピーします。",
      "intro.line2": "ブラウザ内だけで動作し、入力はアップロードされません。",
      "steps.title": "クイック手順",
      "steps.item1": "文章を貼り付けます。",
      "steps.item2": "モードを選び、「出力を作る」を押します。",
      "steps.item3": "コピー/保存して、2行プレビューで確認します。",
      "freepro.title": "Free / Pro の違い（短く）",
      "freepro.free.title": "Free",
      "freepro.free.item1": "整形（ATS安全 / 改行保持 / 毒抜き）",
      "freepro.free.item2": "カウント + 警告で崩れリスクを確認",
      "freepro.free.item3": "コピー / TXT保存 + 2行プレビュー",
      "freepro.pro.title": "Pro",
      "freepro.pro.item1": "UI上の広告を非表示",
      "freepro.pro.item2": "文字数上限アップ",
      "freepro.pro.item3": "テンプレ/履歴/PDF出力",
      "input.title": "入力",
      "input.label": "入力",
      "input.placeholder": "ここに文章を貼り付け（職務要約・志望動機・箇条書きなど）…",
      "input.hint": "⏳ 端末によっては数秒かかる場合があります。",
      "options.title": "オプション",
      "options.mode.label": "出力モード",
      "options.mode.safe": "ATS安全",
      "options.mode.keep": "改行保持",
      "options.mode.clean": "毒抜き",
      "options.limit.label": "文字数上限（任意）",
      "options.limit.placeholder": "例：1000",
      "actions.process": "出力を作る",
      "results.counts.title": "カウント",
      "results.warnings.title": "警告（事故の原因になりやすい）",
      "output.title": "出力",
      "output.label": "出力",
      "actions.copy": "出力をコピー",
      "actions.download": "TXTで保存",
      "actions.exportPdf": "PDFで保存",
      "actions.reset": "リセット",
      "progress.label": "処理中…",
      "preview.title": "ATS風プレビュー（2行テキストボックス）",
      "preview.note": "実際の応募フォームでは「狭い枠＋スクロール」になることがあります。壁テキスト化していないか確認してください。",
      "pro.title": "Pro解放（買い切り $2.99）",
      "pro.unlocked": "Pro解放済み",
      "pro.desc": "広告を非表示にし、テンプレ・履歴・PDF出力を使えるようにします（端末内のみ）。",
      "pro.feature.ads": "広告をUI上で非表示",
      "pro.feature.limit": "長文の上限アップ",
      "pro.feature.presets": "テンプレ/履歴/PDF出力",
      "pro.cta": "Proを購入する",
      "pro.priceNote": "$2.99 / 買い切り",
      "pro.howto": "決済後、このページに戻る際に ?pro=1 を付けるとこの端末でProが有効になります。",
      "protools.title": "Pro機能",
      "protools.note": "Proで利用可能",
      "protools.pdf.title": "PDF出力",
      "protools.pdf.note": "印刷用の表示を開いてPDF保存します。",
      "protools.templates.title": "テンプレ",
      "protools.templates.note": "現在の出力をスロットに保存します。",
      "protools.history.title": "履歴",
      "protools.history.note": "出力を保存して後で呼び出せます。",
      "templates.slot1": "スロット1",
      "templates.slot2": "スロット2",
      "templates.slot3": "スロット3",
      "templates.save": "保存",
      "templates.load": "読込",
      "history.save": "履歴に保存",
      "history.clear": "全削除",
      "history.empty": "履歴はまだありません。",
      "history.load": "読込",
      "history.delete": "削除",
      "pdf.tip": "Ctrl/Cmd+P でPDF保存できます。",
      "error.noOutput": "先に出力を作成してください。",
      "error.noTemplate": "このスロットは空です。",
      "privacy.note": "このツールはブラウザ内だけで動作し、入力内容は保存・送信しません（Pro状態のみ端末に保存されます）。",
      "donate.text": "役に立ったら開発継続のご支援をいただけると助かります。",
      "donate.ofuse": "💌 OFUSE",
      "donate.kofi": "☕ Ko-fi",
      "faq.title": "よくある質問",
      "faq.q1": "ATSで改行や箇条書きが崩れるのはなぜ？",
      "faq.a1": "ATS/応募フォームは装飾を削除し、空白や改行を詰めることが多いためです。安全なプレーンテキストに整えます。",
      "faq.q2": "文章は送信・保存されますか？",
      "faq.a2": "いいえ。処理はブラウザ内で完結し、Pro状態のみ端末に保存されます。",
      "faq.q3": "「ATS安全 / 改行保持 / 毒抜き」の違いは？",
      "faq.a3": "ATS安全は段落/箇条書きを1行化、改行保持は行構造維持、毒抜きは不可視/制御文字を除去します。",
      "faq.q4": "不可視文字や改行混在の警告が出る理由は？",
      "faq.a4": "貼り付け事故の原因になりやすい文字が含まれるためです。注意すべき箇所を示します。",
      "faq.q5": "Pro($2.99)の解放方法と保存範囲は？",
      "faq.a5": "決済後に ?pro=1 付きで戻るとこの端末で有効になります。",
      "help.title": "ヘルプリンク",
      "help.usage": "使い方",
      "help.howto": "使い方ガイド",
      "help.home": "NicheWorks ホーム",
      "footer.line1": "© NicheWorks — Small Web Tools for Boring Tasks",
      "footer.line2": "当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。",
      "footer.home": "nicheworks.pages.dev",
    },
  };

  function setLang(lang) {
    currentLang = (lang === "ja") ? "ja" : "en";
    langJa.classList.toggle("is-active", currentLang === "ja");
    langEn.classList.toggle("is-active", currentLang === "en");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = messages[currentLang][key];
      if (typeof val === "string") el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = messages[currentLang][key];
      if (typeof val === "string") el.setAttribute("placeholder", val);
    });

    renderCountsAndWarnings(); // refresh labels if needed
    updateMeta();
    renderHistory();
  }

  function setMode(mode) {
    currentMode = (mode === "keep" || mode === "clean") ? mode : "safe";
    for (const k of Object.keys(modeBtns)) {
      const btn = modeBtns[k];
      const active = k === currentMode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    }
    // No auto-processing here; user clicks process
  }

  function showProgress(on) {
    progressWrap.hidden = !on;
    if (on) {
      processBtn.disabled = true;
      processBtn.textContent = messages[currentLang]["actions.process"] + "…";
    } else {
      processBtn.disabled = false;
      processBtn.textContent = messages[currentLang]["actions.process"];
    }
  }

  function showError(msg) {
    errorBox.hidden = false;
    errorBox.textContent = msg;
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "";
    }, 2000);
  }

  function normalizeNewlinesToLF(s) {
    return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function detectMixedNewlines(raw) {
    const hasCRLF = /\r\n/.test(raw);
    const hasLF = /(^|[^\r])\n/.test(raw); // LF not preceded by CR
    return hasCRLF && hasLF;
  }

  function detectZW(raw) {
    // ZWSP U+200B, ZWJ U+200D, ZWNJ U+200C, BOM U+FEFF
    const m = raw.match(/[\u200B\u200C\u200D\uFEFF]/g);
    return m ? m.length : 0;
  }

  function detectNBSP(raw) {
    const m = raw.match(/\u00A0/g);
    return m ? m.length : 0;
  }

  function detectControlChars(raw) {
    // exclude \n \r \t by default
    const m = raw.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g);
    return m ? m.length : 0;
  }

  function countConsecutiveSpaces(s) {
    const m = s.match(/ {2,}/g);
    return m ? m.length : 0;
  }

  function countLines(sLF) {
    if (!sLF) return 0;
    return sLF.split("\n").length;
  }

  function countParagraphs(sLF) {
    if (!sLF.trim()) return 0;
    const blocks = sLF.trim().split(/\n{2,}/);
    return blocks.filter(b => b.trim().length > 0).length;
  }

  function countBulletLines(sLF) {
    if (!sLF) return 0;
    const lines = sLF.split("\n");
    const re = /^\s*([•\-\*\u2022]|・)\s+/;
    return lines.filter(l => re.test(l)).length;
  }

  function buildATSsafe(sLF) {
    // 1) trim line ends
    let t = sLF.split("\n").map(l => l.replace(/[ \t]+$/g, "")).join("\n");
    // 2) full-width space -> normal
    t = t.replace(/\u3000/g, " ");
    // 3) tabs -> space
    t = t.replace(/\t/g, " ");
    // 4) collapse multiple spaces
    t = t.replace(/ {2,}/g, " ");
    // 5) bullet lines -> inline with " • "
    const lines = t.split("\n");
    const bulletRe = /^\s*([•\-\*\u2022]|・)\s+(.*)$/;
    let out = [];
    for (const line of lines) {
      const m = line.match(bulletRe);
      if (m) out.push("• " + (m[2] || ""));
      else if (line.trim() === "") out.push(""); // paragraph break
      else out.push(line.trim());
    }
    // 6) paragraph breaks -> " / "
    // collapse multiple blank lines to one
    const collapsed = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return collapsed.split(/\n{2,}/).map(p => p.replace(/\n+/g, " ").trim()).filter(Boolean).join(" / ");
  }

  function buildKeep(sLF) {
    let t = sLF;
    t = t.replace(/\u3000/g, " ");
    t = t.replace(/[ \t]+$/gm, "");
    t = t.replace(/\n{3,}/g, "\n\n"); // collapse blank lines
    return t.trim();
  }

  function buildClean(raw) {
    // normalize newlines, then remove invisible/control, replace nbsp
    let t = normalizeNewlinesToLF(raw);
    t = t.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
    t = t.replace(/\u00A0/g, " ");
    t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    t = t.replace(/\u3000/g, " ");
    t = t.replace(/\t/g, " ");
    t = t.replace(/ {2,}/g, " ");
    t = t.replace(/[ ]+$/gm, "");
    t = t.replace(/\n{3,}/g, "\n\n");
    return t.trim();
  }

  function buildOutput(raw) {
    const mixed = detectMixedNewlines(raw);
    const sLF = normalizeNewlinesToLF(raw);
    const out =
      currentMode === "keep" ? buildKeep(sLF) :
      currentMode === "clean" ? buildClean(raw) :
      buildATSsafe(sLF);

    return { out, sLF, mixed };
  }

  function renderCountsAndWarnings() {
    const raw = inputText.value || "";
    const sLF = normalizeNewlinesToLF(raw);

    const total = raw.length;
    const noSpaces = raw.replace(/[\s\u00A0\u3000]/g, "").length; // rough
    const noNewlines = raw.replace(/[\r\n]/g, "").length;

    const lines = countLines(sLF);
    const paragraphs = countParagraphs(sLF);
    const bullets = countBulletLines(sLF);

    const zw = detectZW(raw);
    const nbsp = detectNBSP(raw);
    const ctrl = detectControlChars(raw);
    const mixedNL = detectMixedNewlines(raw);
    const multiSpaces = countConsecutiveSpaces(raw);

    // Counts UI
    const items = [
      ["Total", total],
      ["No spaces", noSpaces],
      ["No newlines", noNewlines],
      ["Lines", lines],
      ["Paragraphs", paragraphs],
      ["Bullet lines", bullets],
    ];

    countsGrid.innerHTML = "";
    for (const [k, v] of items) {
      const div = document.createElement("div");
      div.className = "check";
      const kk = document.createElement("div");
      kk.className = "check__k";
      kk.textContent = k;
      const vv = document.createElement("div");
      vv.className = "check__v";
      vv.textContent = String(v);
      div.appendChild(kk);
      div.appendChild(vv);
      countsGrid.appendChild(div);
    }

    // Warnings UI
    const warns = [];
    if (zw > 0) warns.push({ key: "warn.invisible", msg: `Invisible chars: ${zw}` });
    if (ctrl > 0) warns.push({ key: "warn.control", msg: `Control chars: ${ctrl}` });
    if (nbsp > 0) warns.push({ key: "warn.nbsp", msg: `Non-standard spaces: ${nbsp}` });
    if (mixedNL) warns.push({ key: "warn.mixedNewlines", msg: "Mixed newline formats detected" });
    if (multiSpaces > 0) warns.push({ key: "warn.multiSpaces", msg: `Consecutive spaces blocks: ${multiSpaces}` });

    warningsList.innerHTML = "";
    if (warns.length === 0) {
      const div = document.createElement("div");
      div.className = "warn";
      div.textContent = "—";
      warningsList.appendChild(div);
    } else {
      for (const w of warns) {
        const div = document.createElement("div");
        div.className = "warn is-on";
        // keep simple: show computed msg; localized label is future improvement
        div.textContent = w.msg;
        warningsList.appendChild(div);
      }
    }

    updateMeta();
  }

  function updateMeta() {
    const raw = inputText.value || "";
    charMeta.textContent = raw ? `${raw.length.toLocaleString()} chars` : "";

    const lim = Number(limitInput.value || "0");
    if (!lim) {
      limitMeta.textContent = "";
      return;
    }
    limitMeta.textContent = raw.length > lim ? `Over by ${raw.length - lim}` : `Remaining ${lim - raw.length}`;
  }

  function isProEnabled() {
    return localStorage.getItem(PRO_KEY) === "1";
  }

  function setProControls(pro) {
    document.querySelectorAll("[data-pro-only]").forEach((el) => {
      if ("disabled" in el) el.disabled = !pro;
    });
    if (proTools) proTools.classList.toggle("is-locked", !pro);
    if (proToolsNote) proToolsNote.hidden = pro;
  }

  function applyProUI() {
    const pro = isProEnabled();
    proBadge.hidden = !pro;
    document.body.classList.toggle("is-pro", pro);
    proCard.classList.toggle("is-pro", pro);
    setProControls(pro);
  }

  function checkProQuery() {
    const url = new URL(window.location.href);
    if (url.searchParams.get("pro") === "1") {
      localStorage.setItem(PRO_KEY, "1");
      // Clean URL (optional)
      url.searchParams.delete("pro");
      window.history.replaceState({}, "", url.toString());
    }
    applyProUI();
  }

  function getMaxLen() {
    const pro = isProEnabled();
    return pro ? 200000 : 30000;
  }

  function process() {
    clearError();
    const raw = inputText.value || "";
    if (!raw.trim()) {
      showError(currentLang === "ja"
        ? "入力が空です。文章を貼り付けてから実行してください。"
        : "Input is empty. Paste your text first.");
      return;
    }
    const maxLen = getMaxLen();
    if (raw.length > maxLen) {
      showError(currentLang === "ja"
        ? "文字数が多すぎます。短く分けて試してください。"
        : "Text is too long. Please split it into smaller chunks.");
      return;
    }

    showProgress(true);

    // Make progress visible even if processing is fast
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const { out } = buildOutput(raw);
          outputText.value = out;
          previewBox.textContent = out;
          renderCountsAndWarnings();
          showProgress(false);
        } catch (e) {
          showProgress(false);
          showError(currentLang === "ja"
            ? "処理に失敗しました。入力を短くして再試行してください。"
            : "Processing failed. Try smaller input.");
        }
      }, 80);
    });
  }

  async function copyOutput() {
    clearError();
    const out = outputText.value || "";
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      showToast(currentLang === "ja" ? "コピーしました" : "Copied");
    } catch (e) {
      showError(currentLang === "ja"
        ? "コピーできませんでした。ブラウザの権限設定をご確認ください。"
        : "Copy failed. Please check browser permissions.");
    }
  }

  function downloadTxt() {
    clearError();
    const out = outputText.value || "";
    if (!out) return;
    const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ats-paste-doctor.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function buildPrintableWindow(out) {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) {
      showError(currentLang === "ja"
        ? "新しいウィンドウを開けませんでした。ポップアップ設定をご確認ください。"
        : "Could not open a new window. Please allow pop-ups.");
      return null;
    }
    const doc = win.document;
    doc.title = "ATS Paste Doctor";
    const style = doc.createElement("style");
    style.textContent = `
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #111; }
      h1 { font-size: 20px; margin: 0 0 8px; }
      .meta { color: #555; font-size: 12px; margin-bottom: 12px; }
      pre { white-space: pre-wrap; border: 1px solid #ddd; border-radius: 10px; padding: 12px; background: #fafafa; font-size: 13px; line-height: 1.5; }
      .tip { margin-top: 12px; font-size: 12px; color: #555; }
    `;
    doc.head.appendChild(style);

    const title = doc.createElement("h1");
    title.textContent = "ATS Paste Doctor";
    const meta = doc.createElement("div");
    meta.className = "meta";
    meta.textContent = new Date().toLocaleString(currentLang === "ja" ? "ja-JP" : "en-US");
    const pre = doc.createElement("pre");
    pre.textContent = out;
    const tip = doc.createElement("div");
    tip.className = "tip";
    tip.textContent = messages[currentLang]["pdf.tip"];

    doc.body.appendChild(title);
    doc.body.appendChild(meta);
    doc.body.appendChild(pre);
    doc.body.appendChild(tip);
    return win;
  }

  function exportPdf() {
    if (!isProEnabled()) return;
    clearError();
    const out = outputText.value || "";
    if (!out.trim()) {
      showError(messages[currentLang]["error.noOutput"]);
      return;
    }
    const win = buildPrintableWindow(out);
    if (!win) return;
    setTimeout(() => {
      win.focus();
      win.print();
    }, 200);
  }

  const TEMPLATE_PREFIX = "nw_ats_paste_doctor_template_";
  const HISTORY_KEY = "nw_ats_paste_doctor_history";
  const HISTORY_LIMIT = 10;

  function saveTemplate(slot) {
    if (!isProEnabled()) return;
    clearError();
    const out = outputText.value || "";
    if (!out.trim()) {
      showError(messages[currentLang]["error.noOutput"]);
      return;
    }
    localStorage.setItem(`${TEMPLATE_PREFIX}${slot}`, out);
    showToast(currentLang === "ja" ? "テンプレを保存しました" : "Template saved");
  }

  function loadTemplate(slot) {
    if (!isProEnabled()) return;
    clearError();
    const value = localStorage.getItem(`${TEMPLATE_PREFIX}${slot}`);
    if (!value) {
      showError(messages[currentLang]["error.noTemplate"]);
      return;
    }
    inputText.value = value;
    outputText.value = value;
    previewBox.textContent = value;
    renderCountsAndWarnings();
    updateMeta();
    showToast(currentLang === "ja" ? "テンプレを読み込みました" : "Template loaded");
  }

  function loadHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHistory(items) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }

  function saveToHistory() {
    if (!isProEnabled()) return;
    clearError();
    const out = outputText.value || "";
    if (!out.trim()) {
      showError(messages[currentLang]["error.noOutput"]);
      return;
    }
    const snippet = out.replace(/\s+/g, " ").trim().slice(0, 80);
    const item = {
      ts: Date.now(),
      mode: currentMode,
      snippet,
      fullText: out,
    };
    const items = loadHistory();
    items.unshift(item);
    const trimmed = items.slice(0, HISTORY_LIMIT);
    saveHistory(trimmed);
    renderHistory();
    showToast(currentLang === "ja" ? "履歴に保存しました" : "Saved to history");
  }

  function clearHistory() {
    if (!isProEnabled()) return;
    saveHistory([]);
    renderHistory();
  }

  function loadHistoryItem(index) {
    if (!isProEnabled()) return;
    const items = loadHistory();
    const item = items[index];
    if (!item) return;
    if (item.mode) setMode(item.mode);
    inputText.value = item.fullText || "";
    outputText.value = item.fullText || "";
    previewBox.textContent = item.fullText || "";
    renderCountsAndWarnings();
    updateMeta();
    showToast(currentLang === "ja" ? "履歴を読み込みました" : "History loaded");
  }

  function deleteHistoryItem(index) {
    if (!isProEnabled()) return;
    const items = loadHistory();
    items.splice(index, 1);
    saveHistory(items);
    renderHistory();
  }

  function renderHistory() {
    const historyList = $("historyList");
    if (!historyList) return;
    const items = loadHistory();
    historyList.innerHTML = "";
    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "meta";
      empty.textContent = messages[currentLang]["history.empty"];
      historyList.appendChild(empty);
      return;
    }
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "history-item";

      const meta = document.createElement("div");
      meta.className = "history-item__meta";
      const ts = document.createElement("span");
      ts.textContent = new Date(item.ts).toLocaleString(currentLang === "ja" ? "ja-JP" : "en-US");
      const mode = document.createElement("span");
      mode.textContent = item.mode ? `${item.mode}` : "";
      meta.appendChild(ts);
      if (mode.textContent) meta.appendChild(mode);

      const snippet = document.createElement("div");
      snippet.className = "history-item__snippet";
      snippet.textContent = item.snippet || "";

      const actions = document.createElement("div");
      actions.className = "row";
      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "btn btn-small";
      loadBtn.textContent = messages[currentLang]["history.load"];
      loadBtn.addEventListener("click", () => loadHistoryItem(index));
      loadBtn.dataset.proOnly = "1";
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-ghost";
      deleteBtn.textContent = messages[currentLang]["history.delete"];
      deleteBtn.addEventListener("click", () => deleteHistoryItem(index));
      deleteBtn.dataset.proOnly = "1";
      actions.appendChild(loadBtn);
      actions.appendChild(deleteBtn);

      row.appendChild(meta);
      row.appendChild(snippet);
      row.appendChild(actions);
      historyList.appendChild(row);
    });
    setProControls(isProEnabled());
  }

  function resetAll() {
    clearError();
    showProgress(false);
    inputText.value = "";
    outputText.value = "";
    previewBox.textContent = "";
    limitInput.value = "";
    setMode("safe");
    renderCountsAndWarnings();
    updateMeta();
  }

  // Events
  langJa.addEventListener("click", () => setLang("ja"));
  langEn.addEventListener("click", () => setLang("en"));

  Object.values(modeBtns).forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  processBtn.addEventListener("click", process);
  copyBtn.addEventListener("click", copyOutput);
  downloadBtn.addEventListener("click", downloadTxt);
  exportPdfBtn.addEventListener("click", exportPdf);
  resetBtn.addEventListener("click", resetAll);

  inputText.addEventListener("input", () => {
    renderCountsAndWarnings();
  });
  limitInput.addEventListener("input", updateMeta);

  document.querySelectorAll(".template-save").forEach((btn) => {
    btn.addEventListener("click", () => saveTemplate(btn.dataset.slot));
  });
  document.querySelectorAll(".template-load").forEach((btn) => {
    btn.addEventListener("click", () => loadTemplate(btn.dataset.slot));
  });

  $("historySaveBtn").addEventListener("click", saveToHistory);
  $("historyClearBtn").addEventListener("click", clearHistory);

  // Init
  const initialLang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  setLang(initialLang);
  setMode("safe");
  renderCountsAndWarnings();
  renderHistory();
  checkProQuery();
})();
