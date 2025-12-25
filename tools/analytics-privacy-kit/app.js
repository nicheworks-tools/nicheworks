/* ================================
 * NicheWorks tool template app.js
 * - JP/EN toggle (data-i18n)
 * - Utilities: copy, downloadText, debounce
 * ================================ */

(() => {
  "use strict";

  // ----------------------------
  // i18n (required)
  // ----------------------------
  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  // ----------------------------
  // Utilities
  // ----------------------------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Expose minimal helpers for tool scripts (Codex can reuse)
  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText,
    debounce,
    hasPro: () => {
      try { return !!localStorage.getItem("nw_pro_key"); } catch (_) { return false; }
    }
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    // Example:
    // initTool();
  });
})();

(() => {
  "use strict";

  const buildCopy = () => {
    const siteType = document.getElementById("siteType").value;
    const analyticsTool = document.getElementById("analyticsTool").value;
    const region = document.getElementById("region").value;
    const cookieUse = document.getElementById("cookieUse").value;
    const contact = document.getElementById("contact").value.trim();

    const cookieJa = cookieUse === "yes"
      ? "Cookieを使用して利用状況を分析します。"
      : cookieUse === "no"
        ? "Cookieを使用せずに利用状況を分析します。"
        : "Cookie使用の有無はツール設定に準じます。";

    const cookieEn = cookieUse === "yes"
      ? "We use cookies to analyze usage."
      : cookieUse === "no"
        ? "We do not use cookies for analytics."
        : "Cookie usage depends on the analytics configuration.";

    const regionJa = region === "EU"
      ? "EU圏の訪問者向けに、必要に応じて同意バナーを表示します。"
      : region === "GLOBAL"
        ? "地域ごとの規制に合わせた同意取得を行います。"
        : "日本向けの規制に基づいて対応します。";

    const regionEn = region === "EU"
      ? "For EU visitors, we show consent banners as required."
      : region === "GLOBAL"
        ? "We collect consent in line with regional regulations."
        : "We comply with Japanese privacy regulations.";

    const contactJa = contact ? `お問い合わせ: ${contact}` : "問い合わせ窓口はサイト内の連絡先をご確認ください。";
    const contactEn = contact ? `Contact: ${contact}` : "Please refer to our contact page for inquiries.";

    const jaBlock = [
      `当サイト（${siteType}）では${analyticsTool}を利用してアクセス解析を行っています。`,
      cookieJa,
      regionJa,
      "解析結果はサイト改善のためにのみ利用します。",
      contactJa
    ].join("\n");

    const enBlock = [
      `This ${siteType} uses ${analyticsTool} for analytics.`,
      cookieEn,
      regionEn,
      "Analytics data is used only to improve the site.",
      contactEn
    ].join("\n");

    const checklist = [
      "プライバシーポリシーに解析ツール名を記載",
      "Cookie使用の有無を明記",
      "同意バナー/オプトアウト導線を確認",
      "お問い合わせ先を明記",
      "実際の設定と文面の一致を確認"
    ].join("\n");

    return { jaBlock, enBlock, checklist };
  };

  const initTool = () => {
    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const outputChecklist = document.getElementById("outputChecklist");

    const render = () => {
      const { jaBlock, enBlock, checklist } = buildCopy();
      outputJa.value = jaBlock;
      outputEn.value = enBlock;
      outputChecklist.value = checklist;
    };

    document.getElementById("generate").addEventListener("click", render);
    document.getElementById("copyJa").addEventListener("click", () => window.NW.copyToClipboard(outputJa.value));
    document.getElementById("copyEn").addEventListener("click", () => window.NW.copyToClipboard(outputEn.value));
    document.getElementById("copyChecklist").addEventListener("click", () => window.NW.copyToClipboard(outputChecklist.value));

    render();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
