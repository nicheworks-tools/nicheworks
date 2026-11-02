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
        return document.execCommand("copy") === true;
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
// Tool: Newsletter Kit Generator
// ----------------------------
const initNewsletterKit = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="field">
      <label class="label">
        <span data-i18n="ja">ニュースレターのテーマ</span>
        <span data-i18n="en" style="display:none;">Newsletter theme</span>
      </label>
      <input id="themeInput" class="input" type="text" placeholder="例: 週次のSaaS運用Tips" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">読者層</span>
        <span data-i18n="en" style="display:none;">Audience</span>
      </label>
      <input id="audienceInput" class="input" type="text" placeholder="例: 個人開発者・PM" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">配信頻度</span>
        <span data-i18n="en" style="display:none;">Frequency</span>
      </label>
      <input id="frequencyInput" class="input" type="text" placeholder="例: 週1 / 月2" />
    </div>
    <div class="row">
      <button id="generateBtn" class="btn primary" type="button" data-i18n="ja">キット生成</button>
      <button id="generateBtnEn" class="btn primary" type="button" data-i18n="en" style="display:none;">Generate kit</button>
      <button id="copyBtn" class="btn" type="button" data-i18n="ja">コピー</button>
      <button id="copyBtnEn" class="btn" type="button" data-i18n="en" style="display:none;">Copy</button>
      <button id="downloadKitBtn" class="btn" type="button" data-i18n="ja">TXT保存</button>
      <button id="downloadKitBtnEn" class="btn" type="button" data-i18n="en" style="display:none;">Save TXT</button>
    </div>
    <p id="kitStatus" class="nw-note" role="status" aria-live="polite"></p>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">出力</span>
        <span data-i18n="en" style="display:none;">Output</span>
      </label>
      <div id="kitOutput" class="out" aria-live="polite"></div>
    </div>
  `;

  const themeInput = root.querySelector("#themeInput");
  const audienceInput = root.querySelector("#audienceInput");
  const frequencyInput = root.querySelector("#frequencyInput");
  const output = root.querySelector("#kitOutput");
  const generateButtons = [root.querySelector("#generateBtn"), root.querySelector("#generateBtnEn")];
  const copyButtons = [root.querySelector("#copyBtn"), root.querySelector("#copyBtnEn")];
  const downloadButtons = [root.querySelector("#downloadKitBtn"), root.querySelector("#downloadKitBtnEn")];
  const status = root.querySelector("#kitStatus");
  let generatedFor = null;
  const snapshot = () => JSON.stringify([themeInput.value, audienceInput.value, frequencyInput.value]);
  const message = (ja, en) => document.documentElement.lang === "en" ? en : ja;
  const isFresh = () => generatedFor !== null && generatedFor === snapshot() && Boolean(output.textContent.trim());
  const setStatus = (ja, en) => { status.textContent = message(ja, en); };
  const setExportEnabled = (enabled) => {
    [...copyButtons, ...downloadButtons].forEach((button) => { button.disabled = !enabled; });
  };

  const buildKit = () => {
    const theme = themeInput.value.trim() || "(テーマ未入力)";
    const audience = audienceInput.value.trim() || "(読者未入力)";
    const frequency = frequencyInput.value.trim() || "(頻度未入力)";

    const jp = `【JP】\n` +
      `■ 件名アイデア\n` +
      `1. ${theme}の要点まとめ（${frequency}）\n` +
      `2. ${audience}向け：今週の学び3選\n` +
      `3. まず押さえたい${theme}のチェックリスト\n\n` +
      `■ 構成案\n` +
      `1) 冒頭の一言（${audience}への共感）\n` +
      `2) 今週のトピック：${theme}\n` +
      `3) 実践メモ（小さな行動/手順）\n` +
      `4) 参考リンク・次回予告\n\n` +
      `■ CTA\n` +
      `・次回のテーマ希望を返信で教えてください\n` +
      `・チームの共有にもご活用ください\n\n` +
      `■ スポンサー文\n` +
      `「${theme}」に関心のある${audience}に届けたい企業/サービス募集。1枠/回、詳細は返信にて。\n`;

    const en = `【EN】\n` +
      `■ Subject ideas\n` +
      `1. ${theme} highlights (${frequency})\n` +
      `2. Three takeaways for ${audience}\n` +
      `3. ${theme} checklist to start today\n\n` +
      `■ Structure\n` +
      `1) Opening note (empathy for ${audience})\n` +
      `2) Main topic: ${theme}\n` +
      `3) Practical steps / small actions\n` +
      `4) Links + next issue preview\n\n` +
      `■ CTA\n` +
      `• Reply with next-topic requests\n` +
      `• Share with your team if helpful\n\n` +
      `■ Sponsor pitch\n` +
      `Looking for sponsors to reach ${audience} interested in ${theme}. One slot per issue.\n`;

    return `${jp}\n\n${en}`;
  };

  const render = () => {
    output.textContent = buildKit();
    generatedFor = snapshot();
    setExportEnabled(true);
    setStatus("生成しました。配信前にスポンサー・同意・表現を確認してください。", "Generated. Review sponsorship, consent and wording before sending.");
  };

  const invalidate = () => {
    generatedFor = null;
    output.textContent = "";
    setExportEnabled(false);
    setStatus("入力が変わりました。キットを再生成してください。", "Inputs changed. Generate the kit again.");
  };

  [themeInput, audienceInput, frequencyInput].forEach((input) => input.addEventListener("input", invalidate));
  generateButtons.forEach((btn) => btn.addEventListener("click", render));
  copyButtons.forEach((btn) => btn.addEventListener("click", async () => {
    if (!isFresh()) return;
    const ok = await window.NW.copyToClipboard(output.textContent);
    setStatus(ok ? "コピーしました。" : "コピーできませんでした。選択してコピーしてください。",
      ok ? "Copied." : "Copy failed. Select and copy manually.");
  }));
  downloadButtons.forEach((btn) => btn.addEventListener("click", () => {
    if (!isFresh()) return;
    try {
      window.NW.downloadText("newsletter-kit-ja-en.txt", output.textContent);
      setStatus("TXTを保存しました。", "TXT saved.");
    } catch (_) {
      setStatus("TXTの保存に失敗しました。", "TXT download failed.");
    }
  }));

  render();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initNewsletterKit);
