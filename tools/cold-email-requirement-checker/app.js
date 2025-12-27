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
// Tool: Cold Email Requirement Checker (Pro-lite)
// ----------------------------
const initColdEmailChecker = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  const proEnabled = window.NW.hasPro();

  root.innerHTML = `
    <div class="field">
      <label class="label">
        <span data-i18n="ja">メール本文</span>
        <span data-i18n="en" style="display:none;">Email draft</span>
      </label>
      <textarea id="emailText" class="textarea" placeholder="例: こんにちは、◯◯の件でご連絡しました..."></textarea>
    </div>
    <div class="row">
      <button id="checkBtn" class="btn primary" type="button" data-i18n="ja">チェック</button>
      <button id="checkBtnEn" class="btn primary" type="button" data-i18n="en" style="display:none;">Check</button>
      <button id="copyResult" class="btn" type="button" data-i18n="ja">コピー</button>
      <button id="copyResultEn" class="btn" type="button" data-i18n="en" style="display:none;">Copy</button>
    </div>

    <hr class="hr" />

    <div class="field">
      <label class="label">
        <span data-i18n="ja">Pro: ドラフト比較（最大3件）</span>
        <span data-i18n="en" style="display:none;">Pro: Compare up to 3 drafts</span>
      </label>
      <textarea id="draftA" class="textarea" placeholder="Draft A" ${proEnabled ? "" : "disabled"}></textarea>
      <textarea id="draftB" class="textarea" placeholder="Draft B" ${proEnabled ? "" : "disabled"}></textarea>
      <textarea id="draftC" class="textarea" placeholder="Draft C" ${proEnabled ? "" : "disabled"}></textarea>
      <div class="row">
        <label class="label"><input type="checkbox" id="dictSaas" ${proEnabled ? "" : "disabled"} /> SaaS</label>
        <label class="label"><input type="checkbox" id="dictAgency" ${proEnabled ? "" : "disabled"} /> Agency</label>
        <label class="label"><input type="checkbox" id="dictEcom" ${proEnabled ? "" : "disabled"} /> E-commerce</label>
      </div>
      <div class="row">
        <button id="proCheck" class="btn" type="button" data-i18n="ja">Pro分析</button>
        <button id="proCheckEn" class="btn" type="button" data-i18n="en" style="display:none;">Run Pro analysis</button>
      </div>
      <div class="nw-note" data-i18n="ja" style="${proEnabled ? "display:none;" : ""}">Pro機能は有効化キーが必要です（localStorage: nw_pro_key）。</div>
      <div class="nw-note" data-i18n="en" style="${proEnabled ? "display:none;" : ""}">Pro requires a key (localStorage: nw_pro_key).</div>
    </div>

    <div class="field">
      <label class="label">
        <span data-i18n="ja">結果</span>
        <span data-i18n="en" style="display:none;">Result</span>
      </label>
      <div id="resultOutput" class="out" aria-live="polite"></div>
    </div>
  `;

  const emailText = root.querySelector("#emailText");
  const output = root.querySelector("#resultOutput");
  const checkButtons = [root.querySelector("#checkBtn"), root.querySelector("#checkBtnEn")];
  const copyButtons = [root.querySelector("#copyResult"), root.querySelector("#copyResultEn")];
  const proButtons = [root.querySelector("#proCheck"), root.querySelector("#proCheckEn")];

  const spamPhrases = [
    "無料", "今すぐ", "限定", "保証", "100%", "クリック", "稼げる", "儲かる",
    "free", "limited", "guarantee", "click", "earn", "urgent", "risk-free"
  ];

  const hasCTA = (text) => /返信|ご検討|日程|打ち合わせ|見積|相談|reply|schedule|call|meeting|book/i.test(text);
  const hasContext = (text) => /貴社|御社|ご担当|company|team|we are|弊社|当社/i.test(text);
  const hasPurpose = (text) => /目的|理由|because|reason|ご連絡|reach out/i.test(text);

  const analyzeText = (text) => {
    const warningsJa = [];
    const warningsEn = [];
    const improvementsJa = [];
    const improvementsEn = [];
    const length = text.length;

    if (length === 0) {
      warningsJa.push("本文が空です。");
      warningsEn.push("Body text is empty.");
      improvementsJa.push("短い自己紹介と目的を追記してください。");
      improvementsEn.push("Add a short intro and clear purpose.");
      return { warningsJa, warningsEn, improvementsJa, improvementsEn };
    }

    if (length < 200) {
      warningsJa.push("本文が短すぎます（目安: 200文字以上）。");
      warningsEn.push("Too short (recommended: 200+ chars).");
    }
    if (length > 1200) {
      warningsJa.push("本文が長すぎます（目安: 1200文字以内）。");
      warningsEn.push("Too long (recommended: within 1200 chars).");
    }
    if (!hasCTA(text)) {
      warningsJa.push("CTA（返信や日程確認）が明確ではありません。");
      warningsEn.push("CTA (reply/scheduling) is unclear.");
    }
    if (!hasContext(text)) {
      warningsJa.push("相手/会社文脈の言及が不足しています。");
      warningsEn.push("Recipient/company context is missing.");
    }
    if (!hasPurpose(text)) {
      warningsJa.push("連絡目的が曖昧です。");
      warningsEn.push("Purpose is unclear.");
    }

    const hitSpam = spamPhrases.filter((p) => text.toLowerCase().includes(p.toLowerCase()));
    if (hitSpam.length > 0) {
      warningsJa.push(`スパム判定されやすい語句: ${hitSpam.join(", ")}`);
      warningsEn.push(`Spammy phrases: ${hitSpam.join(", ")}`);
    }

    if (warningsJa.length === 0) {
      improvementsJa.push("リスクは低めです。件名のABテストを推奨します。");
      improvementsEn.push("Risk looks low. Consider A/B testing the subject line.");
    } else {
      improvementsJa.push("冒頭に一文の価値提案を追加する。");
      improvementsJa.push("相手の課題に触れたうえで、次アクションを明確にする。");
      improvementsJa.push("件名を短く具体的にする。");
      improvementsEn.push("Add a one-line value proposition near the start.");
      improvementsEn.push("Reference the recipient's pain point and clarify the next action.");
      improvementsEn.push("Make the subject line short and specific.");
    }

    return { warningsJa, warningsEn, improvementsJa, improvementsEn };
  };

  const scoreEmail = (text) => {
    let score = 100;
    const notes = [];
    const length = text.length;
    if (length < 200 || length > 900) {
      score -= 20;
      notes.push("Length out of recommended range (200-900 chars).");
    }
    const hitSpam = spamPhrases.filter((p) => text.toLowerCase().includes(p.toLowerCase()));
    if (hitSpam.length) {
      score -= Math.min(30, hitSpam.length * 5);
      notes.push(`Spammy phrases: ${hitSpam.join(", ")}.`);
    }
    if (!hasCTA(text)) {
      score -= 15;
      notes.push("CTA missing.");
    }
    if (!hasContext(text)) {
      score -= 10;
      notes.push("Recipient context missing.");
    }
    if (!hasPurpose(text)) {
      score -= 10;
      notes.push("Purpose unclear.");
    }
    if (score < 0) score = 0;
    return { score, notes };
  };

  const buildResult = () => {
    const { warningsJa, warningsEn, improvementsJa, improvementsEn } = analyzeText(emailText.value.trim());
    const jp = [
      "【JP】",
      "■ チェック結果",
      ...warningsJa.map((w) => `- ${w}`),
      "",
      "■ 改善ヒント",
      ...improvementsJa.map((i) => `- ${i}`)
    ].join("\n");

    const en = [
      "【EN】",
      "■ Findings",
      ...(warningsEn.length ? warningsEn.map((w) => `- ${w}`) : ["- No major risks detected."]),
      "",
      "■ Improvements",
      ...improvementsEn.map((i) => `- ${i}`)
    ].join("\n");

    return `${jp}\n\n${en}`;
  };

  const buildProResult = () => {
    if (!proEnabled) {
      return "Pro機能は未有効です。";
    }
    const drafts = [
      { label: "Draft A", text: root.querySelector("#draftA").value.trim() },
      { label: "Draft B", text: root.querySelector("#draftB").value.trim() },
      { label: "Draft C", text: root.querySelector("#draftC").value.trim() }
    ].filter((d) => d.text.length > 0);

    const dicts = [];
    if (root.querySelector("#dictSaas").checked) dicts.push("SaaS: trial, onboarding, churn");
    if (root.querySelector("#dictAgency").checked) dicts.push("Agency: proposal, retainer, case study");
    if (root.querySelector("#dictEcom").checked) dicts.push("E-commerce: conversion, cart, catalog");

    const header = "【Pro】ドラフト比較スコア";
    const list = drafts.length
      ? drafts.map((d) => {
          const scored = scoreEmail(d.text);
          const noteLine = scored.notes.length ? ` (${scored.notes.join(" ")})` : "";
          return `- ${d.label}: ${scored.score}/100${noteLine}`;
        })
      : ["- ドラフトが入力されていません。"];

    const dictLine = dicts.length ? `\n\nIndustry dictionary:\n- ${dicts.join("\n- ")}` : "";

    return `${header}\n${list.join("\n")}${dictLine}`;
  };

  const render = () => {
    output.textContent = buildResult();
  };

  checkButtons.forEach((btn) => btn.addEventListener("click", render));
  copyButtons.forEach((btn) => btn.addEventListener("click", async () => {
    const ok = await window.NW.copyToClipboard(output.textContent || "");
    if (!ok) alert("Copy failed");
  }));
  proButtons.forEach((btn) => btn.addEventListener("click", () => {
    output.textContent = `${buildResult()}\n\n${buildProResult()}`;
  }));

  render();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initColdEmailChecker);
