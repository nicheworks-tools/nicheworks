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
// Tool: Membership Offer Builder
// ----------------------------
const initMembershipOffer = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="field">
      <label class="label">
        <span data-i18n="ja">テーマ/専門分野</span>
        <span data-i18n="en" style="display:none;">Topic / Expertise</span>
      </label>
      <input id="topicInput" class="input" type="text" placeholder="例: B2Bマーケ/デザイン/開発" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">提供内容</span>
        <span data-i18n="en" style="display:none;">Deliverables</span>
      </label>
      <input id="deliverablesInput" class="input" type="text" placeholder="例: 月次相談会/限定記事/レビュー" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">提供頻度</span>
        <span data-i18n="en" style="display:none;">Frequency</span>
      </label>
      <input id="frequencyInput" class="input" type="text" placeholder="例: 月2回/週1回" />
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">確保できる時間</span>
        <span data-i18n="en" style="display:none;">Time available</span>
      </label>
      <input id="timeInput" class="input" type="text" placeholder="例: 週3時間" />
    </div>
    <div class="row">
      <button id="buildOffer" class="btn primary" type="button" data-i18n="ja">提案を作成</button>
      <button id="buildOfferEn" class="btn primary" type="button" data-i18n="en" style="display:none;">Build offer</button>
      <button id="copyOffer" class="btn" type="button" data-i18n="ja">コピー</button>
      <button id="copyOfferEn" class="btn" type="button" data-i18n="en" style="display:none;">Copy</button>
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">出力</span>
        <span data-i18n="en" style="display:none;">Output</span>
      </label>
      <div id="offerOutput" class="out" aria-live="polite"></div>
    </div>
  `;

  const topicInput = root.querySelector("#topicInput");
  const deliverablesInput = root.querySelector("#deliverablesInput");
  const frequencyInput = root.querySelector("#frequencyInput");
  const timeInput = root.querySelector("#timeInput");
  const output = root.querySelector("#offerOutput");
  const buildButtons = [root.querySelector("#buildOffer"), root.querySelector("#buildOfferEn")];
  const copyButtons = [root.querySelector("#copyOffer"), root.querySelector("#copyOfferEn")];

  const estimateRange = (time) => {
    if (!time) return "¥3,000 - ¥12,000";
    if (time.includes("10") || time.includes("15")) return "¥12,000 - ¥30,000";
    if (time.includes("5") || time.includes("6") || time.includes("7")) return "¥6,000 - ¥18,000";
    return "¥3,000 - ¥12,000";
  };

  const buildOffer = () => {
    const topic = topicInput.value.trim() || "(テーマ未入力)";
    const deliverables = deliverablesInput.value.trim() || "(提供内容未入力)";
    const frequency = frequencyInput.value.trim() || "(頻度未入力)";
    const time = timeInput.value.trim() || "(時間未入力)";
    const priceRange = estimateRange(time);

    const jp = `【JP】\n` +
      `■ 提案概要\n${topic}に関するメンバーシップ。${deliverables}を${frequency}で提供。\n\n` +
      `■ 価格帯（目安）\n${priceRange}/月\n\n` +
      `■ オンボーディング\n` +
      `- 参加直後に目標ヒアリング\n- 初回ガイド（${topic}の基礎）\n\n` +
      `■ 継続施策\n` +
      `- 月次まとめレポート\n- 参加者の成果共有\n- 次月テーマの投票\n`;

    const en = `【EN】\n` +
      `■ Offer summary\nMembership about ${topic}. Provide ${deliverables} at ${frequency}.\n\n` +
      `■ Pricing range (estimate)\n${priceRange}/month\n\n` +
      `■ Onboarding\n` +
      `- Quick goal survey after joining\n- Starter guide for ${topic}\n\n` +
      `■ Retention ideas\n` +
      `- Monthly recap report\n- Share member wins\n- Vote on next topics\n`;

    return `${jp}\n\n${en}`;
  };

  const render = () => {
    output.textContent = buildOffer();
  };

  buildButtons.forEach((btn) => btn.addEventListener("click", render));
  copyButtons.forEach((btn) => btn.addEventListener("click", async () => {
    const ok = await window.NW.copyToClipboard(output.textContent || "");
    if (!ok) alert("Copy failed");
  }));

  render();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initMembershipOffer);
