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

// ----------------------------
// Tool: Microtool Launch Checklist
// ----------------------------
const initMicrotoolChecklist = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="field">
      <label class="label">
        <span data-i18n="ja">ツール種別</span>
        <span data-i18n="en" style="display:none;">Tool type</span>
      </label>
      <select id="toolType" class="select">
        <option value="converter">Converter / 変換系</option>
        <option value="checker">Checker / 判定系</option>
        <option value="generator">Generator / 生成系</option>
        <option value="directory">Directory / 一覧系</option>
      </select>
    </div>
    <div class="row">
      <button id="generateChecklist" class="btn primary" type="button" data-i18n="ja">チェックリスト生成</button>
      <button id="generateChecklistEn" class="btn primary" type="button" data-i18n="en" style="display:none;">Generate checklist</button>
      <button id="copyChecklist" class="btn" type="button" data-i18n="ja">コピー</button>
      <button id="copyChecklistEn" class="btn" type="button" data-i18n="en" style="display:none;">Copy</button>
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">出力</span>
        <span data-i18n="en" style="display:none;">Output</span>
      </label>
      <div id="checklistOutput" class="out" aria-live="polite"></div>
    </div>
  `;

  const toolType = root.querySelector("#toolType");
  const output = root.querySelector("#checklistOutput");
  const generateButtons = [root.querySelector("#generateChecklist"), root.querySelector("#generateChecklistEn")];
  const copyButtons = [root.querySelector("#copyChecklist"), root.querySelector("#copyChecklistEn")];

  const getTypeLabel = (value) => {
    switch (value) {
      case "converter":
        return { ja: "変換系", en: "Converter" };
      case "checker":
        return { ja: "判定系", en: "Checker" };
      case "generator":
        return { ja: "生成系", en: "Generator" };
      case "directory":
        return { ja: "一覧系", en: "Directory" };
      default:
        return { ja: "ツール", en: "Tool" };
    }
  };

  const buildChecklist = () => {
    const label = getTypeLabel(toolType.value);
    const jp = `【JP｜${label.ja}】\n` +
      `- タイトル/説明文/OGPが${label.ja}向けに最適化されている\n` +
      `- 入力〜出力の流れが360px幅で確認済み\n` +
      `- エラー時のメッセージが明確\n` +
      `- AdSenseのad-top/ad-bottomが配置済み\n` +
      `- 寄付リンク（OFUSE/Ko-fi）設置済み\n` +
      `- canonical/JSON-LD/OGP/ファビコン確認\n` +
      `- 主要ブラウザで動作確認\n`;

    const en = `【EN｜${label.en}】\n` +
      `- Title/description/OGP are optimized for this ${label.en} tool\n` +
      `- Flow works on 360px width (mobile-first)\n` +
      `- Clear error and empty-state messages\n` +
      `- ad-top/ad-bottom placeholders are present\n` +
      `- Donation links (OFUSE/Ko-fi) are in place\n` +
      `- canonical/JSON-LD/OGP/favicon verified\n` +
      `- Tested on major browsers\n`;

    return `${jp}\n\n${en}`;
  };

  const render = () => {
    output.textContent = buildChecklist();
  };

  generateButtons.forEach((btn) => btn.addEventListener("click", render));
  copyButtons.forEach((btn) => btn.addEventListener("click", async () => {
    const ok = await window.NW.copyToClipboard(output.textContent || "");
    if (!ok) alert("Copy failed");
  }));

  render();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initMicrotoolChecklist);
