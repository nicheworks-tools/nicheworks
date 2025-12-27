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
// Tool: Growth Log Template Generator
// ----------------------------
const initGrowthLog = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="field">
      <label class="label">PV</label>
      <input id="pvInput" class="input" type="text" placeholder="例: 12,000" />
    </div>
    <div class="field">
      <label class="label">CTR</label>
      <input id="ctrInput" class="input" type="text" placeholder="例: 2.4%" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">売上</span>
        <span data-i18n="en" style="display:none;">Revenue</span>
      </label>
      <input id="revInput" class="input" type="text" placeholder="例: ¥45,000" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">メモ</span>
        <span data-i18n="en" style="display:none;">Notes</span>
      </label>
      <textarea id="notesInput" class="textarea" placeholder="例: トップページのCTAを改善"></textarea>
    </div>
    <div class="row">
      <label class="label">
        <input id="anonToggle" type="checkbox" />
        <span data-i18n="ja">数値を匿名化</span>
        <span data-i18n="en" style="display:none;">Anonymize numbers</span>
      </label>
    </div>
    <div class="row">
      <button id="generateLog" class="btn primary" type="button" data-i18n="ja">ログ生成</button>
      <button id="generateLogEn" class="btn primary" type="button" data-i18n="en" style="display:none;">Generate log</button>
      <button id="copyLog" class="btn" type="button" data-i18n="ja">コピー</button>
      <button id="copyLogEn" class="btn" type="button" data-i18n="en" style="display:none;">Copy</button>
      <button id="downloadLog" class="btn" type="button" data-i18n="ja">Markdown保存</button>
      <button id="downloadLogEn" class="btn" type="button" data-i18n="en" style="display:none;">Download MD</button>
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">出力</span>
        <span data-i18n="en" style="display:none;">Output</span>
      </label>
      <div id="logOutput" class="out" aria-live="polite"></div>
    </div>
  `;

  const pvInput = root.querySelector("#pvInput");
  const ctrInput = root.querySelector("#ctrInput");
  const revInput = root.querySelector("#revInput");
  const notesInput = root.querySelector("#notesInput");
  const anonToggle = root.querySelector("#anonToggle");
  const output = root.querySelector("#logOutput");

  const buildValue = (value) => {
    if (!value) return "-";
    return anonToggle.checked ? "XXX" : value;
  };

  const buildLog = () => {
    const pv = buildValue(pvInput.value.trim());
    const ctr = buildValue(ctrInput.value.trim());
    const rev = buildValue(revInput.value.trim());
    const notes = notesInput.value.trim() || "-";
    const date = new Date().toISOString().slice(0, 10);

    const jp = `# 成長ログ\n` +
      `更新日: ${date}\n` +
      `- PV: ${pv}\n` +
      `- CTR: ${ctr}\n` +
      `- 売上: ${rev}\n` +
      `- メモ: ${notes}\n`;

    const en = `# Growth Log\n` +
      `Date: ${date}\n` +
      `- PV: ${pv}\n` +
      `- CTR: ${ctr}\n` +
      `- Revenue: ${rev}\n` +
      `- Notes: ${notes}\n`;

    return `${jp}\n\n${en}`;
  };

  const render = () => {
    output.textContent = buildLog();
  };

  const generateButtons = [root.querySelector("#generateLog"), root.querySelector("#generateLogEn")];
  const copyButtons = [root.querySelector("#copyLog"), root.querySelector("#copyLogEn")];
  const downloadButtons = [root.querySelector("#downloadLog"), root.querySelector("#downloadLogEn")];

  generateButtons.forEach((btn) => btn.addEventListener("click", render));
  copyButtons.forEach((btn) => btn.addEventListener("click", async () => {
    const ok = await window.NW.copyToClipboard(output.textContent || "");
    if (!ok) alert("Copy failed");
  }));
  downloadButtons.forEach((btn) => btn.addEventListener("click", () => {
    const text = output.textContent || buildLog();
    window.NW.downloadText("growth-log.md", text);
  }));

  render();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initGrowthLog);
