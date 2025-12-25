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

  const buildGuide = () => {
    const platform = document.getElementById("platform").value;
    const sourceType = document.getElementById("sourceType").value;
    const customDomain = document.getElementById("customDomain").value === "yes";
    const outputFolder = document.getElementById("outputFolder").value;

    const checklist = [
      `1. ${platform} の新規プロジェクトを作成`,
      `2. ソースは${sourceType === "folder" ? "フォルダ" : "ZIP"}を選択`,
      `3. 公開フォルダは ${outputFolder === "root" ? "/ (root)" : outputFolder} を指定`,
      customDomain ? "4. カスタムドメインを追加しDNSを設定" : "4. 既定ドメインで動作確認",
      "5. ビルド/公開ログを確認",
      "6. 公開後に404やアセットパスをチェック"
    ].join("\n");

    const errors = [
      "- 404: 公開フォルダ指定ミス (dist/public) を確認",
      "- CSS/JSが読み込めない: 先頭スラッシュや相対パスを確認",
      "- カスタムドメインが反映されない: DNSのTTL/SSL設定を確認"
    ].join("\n");

    const diagnosis = [
      "症状: トップが404",
      "- 公開フォルダ設定が正しいか",
      "- SPAならリダイレクト設定が必要",
      "\n症状: アセットが読み込めない",
      "- ルートパスが / か確認",
      "- ビルド後のパスと一致させる"
    ].join("\n");

    const markdown = [
      `# ${platform} Deploy Guide`,
      "## Checklist",
      checklist.split("\n").map((line) => `- ${line}`).join("\n"),
      "\n## Common Errors",
      errors,
      "\n## Diagnosis",
      diagnosis
    ].join("\n");

    return { checklist, errors, diagnosis, markdown };
  };

  const initTool = () => {
    const output = document.getElementById("output");
    const errors = document.getElementById("errors");
    const diagnosis = document.getElementById("diagnosis");

    const generate = () => {
      const data = buildGuide();
      output.value = data.checklist;
      errors.value = data.errors;
      if (diagnosis) diagnosis.value = data.diagnosis;
    };

    const refreshPro = () => {
      const hasPro = window.NW.hasPro();
      document.querySelectorAll("[data-pro-only]").forEach((el) => {
        el.style.display = hasPro ? "" : "none";
      });
      document.querySelectorAll("[data-pro-lock]").forEach((el) => {
        el.style.display = hasPro ? "none" : "";
      });
    };

    document.getElementById("generate").addEventListener("click", generate);
    document.getElementById("copyAll").addEventListener("click", () => window.NW.copyToClipboard(output.value));

    document.getElementById("downloadMd").addEventListener("click", () => {
      if (!window.NW.hasPro()) return;
      const { markdown } = buildGuide();
      window.NW.downloadText("pages-deploy-guide.md", markdown);
    });

    refreshPro();
    generate();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
