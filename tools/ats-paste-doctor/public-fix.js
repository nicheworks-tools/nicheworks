/* ATS Paste Doctor public hardening
 * Removes unfinished Pro surface, adds copy fallback, localizes diagnostics,
 * and weakens ATS guarantee wording without touching the MVP processor.
 */
(() => {
  const PRO_KEY = "nw_pro_ats_paste_doctor";
  const $ = (id) => document.getElementById(id);

  const texts = {
    en: {
      subtitle: "Check line breaks, bullets, invisible characters, and character counts before pasting into job forms.",
      intro1: "Paste your resume text, cover letter, or application note, then generate plain text that is easier to review before submitting.",
      intro2: "Processing runs in your browser. Ads and analytics may still load for the page itself, so redact personal details when needed.",
      noticeTitle: "Before you paste personal application text",
      noticeBody: "This tool processes text locally in your browser and does not upload the pasted content. However, page display may load ads and analytics tags. Redact names, addresses, phone numbers, email addresses, employer names, or detailed work history when needed.",
      guaranteeTitle: "Not an ATS guarantee",
      guaranteeBody: "ATS and job forms behave differently. This output is only an ATS-friendly plain-text approximation. Always check the actual form before submitting.",
      modeSafe: "ATS-friendly plain text",
      previewNote: "This is only a small-box readability preview. It does not guarantee how every ATS or job form will display the text.",
      emptyOutput: "Generate output first.",
      copied: "Copied",
      copyFailed: "Copy failed. Select the output manually and copy it.",
      downloaded: "TXT downloaded",
      faqQ1: "Will this always display correctly in every ATS?",
      faqA1: "No. ATS and job forms differ. Use this as a plain-text cleanup aid and confirm the result inside the actual form before submitting.",
      faqQ2: "Is my pasted text uploaded?",
      faqA2: "No. Formatting and checks run in your browser. The page may still load ads and analytics tags for site operation.",
      faqQ3: "Can I paste personal application details?",
      faqA3: "You can, but it is safer to redact names, addresses, phone numbers, email addresses, employer names, and detailed work history when possible.",
      faqQ4: "What is ATS-friendly plain text?",
      faqA4: "It reduces special spacing, fragile bullet formatting, and hidden characters so the text is easier to paste and review in application forms.",
      faqQ5: "Is text history saved?",
      faqA5: "The public version does not intentionally save your pasted text history. If a future history feature is added, it should be opt-in and stored only on the device.",
      relatedTitle: "Related tools",
      usage: "Usage",
      cover: "Cover Letter Lite",
      cold: "Cold Email Requirement Checker",
      redactor: "API Key Token Redactor",
      linebreak: "LineBreak Doctor",
    },
    ja: {
      subtitle: "応募フォーム貼り付け前に、改行崩れ・箇条書き・不可視文字・文字数を確認します。",
      intro1: "職務要約・志望動機・応募文を貼り付け、送信前に確認しやすいプレーンテキストへ整えます。",
      intro2: "整形処理はブラウザ内で行います。ただしページ表示のため広告・解析タグは読み込まれる場合があります。",
      noticeTitle: "応募情報を貼る前の注意",
      noticeBody: "このツールの整形処理はブラウザ内で行い、貼り付けた本文はアップロードしません。ただしページ表示のため広告・解析タグは読み込まれる場合があります。氏名、住所、電話番号、メール、応募先企業名、職歴詳細などは必要に応じて伏せてください。",
      guaranteeTitle: "ATS表示を保証するものではありません",
      guaranteeBody: "ATSや応募フォームごとに仕様は異なります。この出力は貼り付けやすいプレーンテキストに寄せるための補助です。送信前に必ず実際のフォーム上で確認してください。",
      modeSafe: "ATS向け簡易整形",
      previewNote: "この2行プレビューは狭い入力欄での見え方の参考です。すべてのATS・応募フォームでの表示を保証するものではありません。",
      emptyOutput: "先に出力を作成してください。",
      copied: "コピーしました",
      copyFailed: "コピーできませんでした。出力欄を選択して手動でコピーしてください。",
      downloaded: "TXTを保存しました",
      faqQ1: "この出力ならATSで必ず崩れませんか？",
      faqA1: "いいえ。応募フォームやATSごとに仕様が異なるため、送信前に実際のフォームで確認してください。",
      faqQ2: "入力した文章は送信されますか？",
      faqA2: "いいえ。整形とチェックはブラウザ内で行います。ただしページ表示のため広告・解析タグは読み込まれる場合があります。",
      faqQ3: "職務経歴や個人情報を貼ってよいですか？",
      faqA3: "必要に応じて氏名、住所、電話番号、メール、応募先名、職歴詳細などを伏せることを推奨します。",
      faqQ4: "ATS向け簡易整形とは何ですか？",
      faqA4: "特殊な空白、崩れやすい箇条書き、不可視文字などを減らし、応募フォームに貼りやすいプレーンテキストへ寄せる処理です。",
      faqQ5: "履歴は保存されますか？",
      faqA5: "公開初期版では本文履歴を意図的に保存しません。将来追加する場合は、初期値は保存しない設定にし、この端末内保存であることを明記します。",
      relatedTitle: "関連ツール",
      usage: "使い方",
      cover: "Cover Letter Lite",
      cold: "Cold Email Requirement Checker",
      redactor: "API Key Token Redactor",
      linebreak: "LineBreak Doctor",
    },
  };

  function lang() {
    const jaActive = $("langJa")?.classList.contains("is-active");
    const enActive = $("langEn")?.classList.contains("is-active");
    if (jaActive) return "ja";
    if (enActive) return "en";
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function t(key) {
    return texts[lang()][key] || texts.en[key] || key;
  }

  function setText(selector, key) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = t(key);
    });
  }

  function applyPublicTexts() {
    document.documentElement.lang = lang();
    setText("[data-atspd='subtitle']", "subtitle");
    setText("[data-atspd='intro1']", "intro1");
    setText("[data-atspd='intro2']", "intro2");
    setText("[data-atspd='noticeTitle']", "noticeTitle");
    setText("[data-atspd='noticeBody']", "noticeBody");
    setText("[data-atspd='guaranteeTitle']", "guaranteeTitle");
    setText("[data-atspd='guaranteeBody']", "guaranteeBody");
    setText("[data-atspd='previewNote']", "previewNote");
    setText("[data-atspd='faqQ1']", "faqQ1");
    setText("[data-atspd='faqA1']", "faqA1");
    setText("[data-atspd='faqQ2']", "faqQ2");
    setText("[data-atspd='faqA2']", "faqA2");
    setText("[data-atspd='faqQ3']", "faqQ3");
    setText("[data-atspd='faqA3']", "faqA3");
    setText("[data-atspd='faqQ4']", "faqQ4");
    setText("[data-atspd='faqA4']", "faqA4");
    setText("[data-atspd='faqQ5']", "faqQ5");
    setText("[data-atspd='faqA5']", "faqA5");
    setText("[data-atspd='relatedTitle']", "relatedTitle");
    setText("[data-atspd='usage']", "usage");
    setText("[data-atspd='cover']", "cover");
    setText("[data-atspd='cold']", "cold");
    setText("[data-atspd='redactor']", "redactor");
    setText("[data-atspd='linebreak']", "linebreak");

    const safeBtn = $("modeSafe");
    if (safeBtn) safeBtn.textContent = t("modeSafe");
    translateDiagnostics();
  }

  function removeUnfinishedProSurface() {
    try {
      localStorage.removeItem(PRO_KEY);
    } catch (_) {}

    const url = new URL(window.location.href);
    if (url.searchParams.has("pro")) {
      url.searchParams.delete("pro");
      window.history.replaceState({}, "", url.toString());
    }

    const buy = $("buyProLink");
    if (buy) {
      buy.removeAttribute("href");
      buy.setAttribute("aria-disabled", "true");
      buy.setAttribute("tabindex", "-1");
    }

    [$("proCard"), $("proTools")].forEach((el) => {
      if (!el) return;
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
    });

    document.querySelectorAll("[data-pro-only]").forEach((el) => {
      if ("disabled" in el) el.disabled = true;
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("tabindex", "-1");
    });

    document.body.classList.remove("is-pro");
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "";
    }, 2200);
  }

  function showError(message) {
    const errorBox = $("errorBox");
    if (!errorBox) {
      showToast(message);
      return;
    }
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function copyFallback(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    textarea.remove();
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        return copyFallback(text);
      }
    }
    return copyFallback(text);
  }

  function interceptCopyAndDownload() {
    const copyBtn = $("copyBtn");
    const downloadBtn = $("downloadBtn");

    copyBtn?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const out = $("outputText")?.value || "";
      if (!out.trim()) {
        showError(t("emptyOutput"));
        return;
      }
      const ok = await copyText(out);
      if (ok) showToast(t("copied"));
      else showError(t("copyFailed"));
    }, true);

    downloadBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const out = $("outputText")?.value || "";
      if (!out.trim()) {
        showError(t("emptyOutput"));
        return;
      }
      const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = "ats-paste-doctor.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      showToast(t("downloaded"));
    }, true);
  }

  function translateDiagnostics() {
    if (lang() !== "ja") return;

    const countMap = new Map([
      ["Total", "合計文字数"],
      ["No spaces", "空白除外"],
      ["No newlines", "改行除外"],
      ["Lines", "行数"],
      ["Paragraphs", "段落数"],
      ["Bullet lines", "箇条書き行"],
    ]);
    document.querySelectorAll("#countsGrid .check__k").forEach((el) => {
      const next = countMap.get(el.textContent.trim());
      if (next) el.textContent = next;
    });

    document.querySelectorAll("#warningsList .warn").forEach((el) => {
      const text = el.textContent.trim();
      let next = text;
      next = next.replace(/^Invisible chars:\s*(\d+)/, "不可視文字: $1");
      next = next.replace(/^Control chars:\s*(\d+)/, "制御文字: $1");
      next = next.replace(/^Non-standard spaces:\s*(\d+)/, "通常と異なる空白: $1");
      next = next.replace(/^Mixed newline formats detected$/, "改行コードが混在しています");
      next = next.replace(/^Consecutive spaces blocks:\s*(\d+)/, "連続スペース: $1");
      el.textContent = next;
    });

    const charMeta = $("charMeta");
    if (charMeta && /chars$/.test(charMeta.textContent)) {
      charMeta.textContent = charMeta.textContent.replace(/ chars$/, " 文字");
    }

    const limitMeta = $("limitMeta");
    if (limitMeta) {
      limitMeta.textContent = limitMeta.textContent
        .replace(/^Over by\s+(\d+)/, "$1文字超過")
        .replace(/^Remaining\s+(\d+)/, "残り$1文字");
    }
  }

  function observeDiagnostics() {
    const targets = [$("countsGrid"), $("warningsList"), $("charMeta"), $("limitMeta")].filter(Boolean);
    const observer = new MutationObserver(() => translateDiagnostics());
    targets.forEach((target) => observer.observe(target, { childList: true, subtree: true, characterData: true }));
  }

  function init() {
    removeUnfinishedProSurface();
    applyPublicTexts();
    interceptCopyAndDownload();
    observeDiagnostics();

    [$("langJa"), $("langEn")].forEach((button) => {
      button?.addEventListener("click", () => {
        window.setTimeout(() => {
          removeUnfinishedProSurface();
          applyPublicTexts();
        }, 0);
      });
    });

    document.addEventListener("input", () => window.setTimeout(translateDiagnostics, 0));
    document.addEventListener("click", () => window.setTimeout(() => {
      removeUnfinishedProSurface();
      applyPublicTexts();
    }, 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(init, 0));
  } else {
    window.setTimeout(init, 0);
  }
})();
