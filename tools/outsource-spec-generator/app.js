(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const nodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));
  const langNow = () => (document.documentElement.lang === "en" ? "en" : "ja");

  const msg = {
    ja: {
      initial: "入力後に「仕様書を生成」を押してください。",
      packInitial: "必要に応じて成果物パックを生成できます。",
      required: "必須項目を入力してください: ",
      generated: "仕様書を生成しました。",
      generateFirst: "先に仕様書を生成してください。",
      copied: "コピーしました。",
      copyFailed: "コピーに失敗しました。手動で選択してください。",
      packGenerated: "成果物パックを生成しました。",
      saved: "Markdownを保存しました。",
      none: "未指定"
    },
    en: {
      initial: "Fill in the fields, then press Generate spec.",
      packInitial: "Generate a deliverable pack if needed.",
      required: "Fill in required fields: ",
      generated: "Spec generated.",
      generateFirst: "Generate the spec first.",
      copied: "Copied.",
      copyFailed: "Copy failed. Please select the text manually.",
      packGenerated: "Deliverable pack generated.",
      saved: "Markdown saved.",
      none: "Not specified"
    }
  };

  const required = ["workType", "deliverables", "deadline", "budget", "acceptanceMethod"];
  const labels = {
    ja: { workType: "作業種別", deliverables: "成果物・範囲", deadline: "納期", budget: "予算", acceptanceMethod: "検収方法" },
    en: { workType: "Work type", deliverables: "Deliverables / scope", deadline: "Deadline", budget: "Budget", acceptanceMethod: "Acceptance method" }
  };
  let hasGenerated = false;

  function applyLang(lang) {
    nodes().forEach((el) => { el.style.display = el.dataset.i18n === lang ? "" : "none"; });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  }

  function initLang() {
    let lang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((button) => button.addEventListener("click", () => applyLang(button.dataset.lang)));
    applyLang(lang);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { return document.execCommand("copy"); }
      catch (e) { return false; }
      finally { document.body.removeChild(ta); }
    }
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  window.NW = { applyLang, copyToClipboard: copyText, downloadText: download };

  function value(id) { return ($(id)?.value || "").trim(); }
  function none(v, lang) { return v || msg[lang].none; }
  function list(text) { return text.split(/\n|,|、/).map((v) => v.trim()).filter(Boolean); }
  function bullets(items, fallback) { return items.length ? items.map((v) => `- ${v}`).join("\n") : `- ${fallback}`; }

  function toast(text) {
    const el = $("toast");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.hidden = true; }, 2400);
  }

  function setRequiredHint(missing, lang) {
    const el = $("requiredHint");
    if (!el) return;
    if (!missing.length) { el.hidden = true; el.textContent = ""; return; }
    el.textContent = msg[lang].required + missing.map((id) => labels[lang][id]).join(" / ");
    el.hidden = false;
  }

  function validate(lang) {
    const missing = required.filter((id) => !value(id));
    setRequiredHint(missing, lang);
    if (missing.length) toast(msg[lang].required + missing.map((id) => labels[lang][id]).join(" / "));
    return missing.length === 0;
  }

  function form() {
    return {
      workType: value("workType"), purpose: value("purpose"), deliverables: list(value("deliverables")),
      outOfScope: list(value("outOfScope")), deadline: value("deadline"), budget: value("budget"),
      deliveryFormat: value("deliveryFormat"), acceptanceMethod: value("acceptanceMethod"), acceptancePeriod: value("acceptancePeriod"),
      communication: value("communication"), revisionRounds: value("revisionRounds"), paymentTerms: value("paymentTerms"),
      rightsUsage: value("rightsUsage"), portfolioPermission: value("portfolioPermission"), confidentiality: value("confidentiality"),
      mustHave: list(value("mustHave")), references: list(value("references"))
    };
  }

  function buildSpec(lang) {
    const d = form();
    if (lang === "ja") {
      return [
        "# 外注仕様書ドラフト", "",
        "## 1. 基本情報",
        `- 作業種別: ${none(d.workType, lang)}`,
        `- 目的: ${none(d.purpose, lang)}`,
        `- 納期: ${none(d.deadline, lang)}`,
        `- 予算: ${none(d.budget, lang)}`,
        `- 連絡方法: ${none(d.communication, lang)}`, "",
        "## 2. 成果物・作業範囲", bullets(d.deliverables, "成果物を入力してください"), "",
        "## 3. 対象外範囲", bullets(d.outOfScope, "未指定。必要に応じて対象外範囲を明記してください"), "",
        "## 4. 納品形式", `- ${none(d.deliveryFormat, lang)}`, "",
        "## 5. 必須条件", bullets(d.mustHave, "未指定"), "",
        "## 6. 参考資料", bullets(d.references, "未指定。機密URLや共有URLは必要に応じて伏せてください"), "",
        "## 7. 受入基準・検収方法",
        d.deliverables.length ? d.deliverables.map((item) => `- 「${item}」が納品物に含まれている`).join("\n") : "- 指定された成果物がすべて揃っている",
        `- 納品形式が「${none(d.deliveryFormat, lang)}」に合っている`,
        `- 検収方法: ${none(d.acceptanceMethod, lang)}`,
        `- 検収期間: ${none(d.acceptancePeriod, lang)}`,
        d.outOfScope.length ? `- 対象外範囲（${d.outOfScope.join("、")}）が追加作業として混入していない` : "- 対象外範囲がある場合は、追加作業として別途確認する", "",
        "## 8. 修正ルール",
        `- 修正回数: ${none(d.revisionRounds, lang)}`,
        "- 大幅な方向性変更、成果物追加、対象外作業は別途相談する",
        `- 追加費用・支払い条件: ${none(d.paymentTerms, lang)}`, "",
        "## 9. 権利・公開・秘密保持",
        `- 権利/利用範囲: ${none(d.rightsUsage, lang)}`,
        `- 実績公開可否: ${none(d.portfolioPermission, lang)}`,
        `- 秘密保持: ${none(d.confidentiality, lang)}`, "",
        "## 10. 注意",
        "- この出力は契約書ではありません。",
        "- 修正回数、追加費用、権利、秘密保持、検収条件は、契約書や発注書で別途合意してください。"
      ].join("\n");
    }
    return [
      "# Outsourcing Specification Draft", "",
      "## 1. Basic information",
      `- Work type: ${none(d.workType, lang)}`,
      `- Purpose: ${none(d.purpose, lang)}`,
      `- Deadline: ${none(d.deadline, lang)}`,
      `- Budget: ${none(d.budget, lang)}`,
      `- Communication: ${none(d.communication, lang)}`, "",
      "## 2. Deliverables and scope", bullets(d.deliverables, "Enter the deliverables"), "",
      "## 3. Out of scope", bullets(d.outOfScope, "Not specified. Add exclusions if needed"), "",
      "## 4. Delivery format", `- ${none(d.deliveryFormat, lang)}`, "",
      "## 5. Must-have requirements", bullets(d.mustHave, "Not specified"), "",
      "## 6. References", bullets(d.references, "Not specified. Mask private URLs as needed"), "",
      "## 7. Acceptance criteria and method",
      d.deliverables.length ? d.deliverables.map((item) => `- “${item}” is included in the delivery`).join("\n") : "- All listed deliverables are included",
      `- Delivery format matches “${none(d.deliveryFormat, lang)}”`,
      `- Acceptance method: ${none(d.acceptanceMethod, lang)}`,
      `- Acceptance period: ${none(d.acceptancePeriod, lang)}`,
      d.outOfScope.length ? `- Out-of-scope items (${d.outOfScope.join(", ")}) are not included as unapproved extra work` : "- Any out-of-scope work is confirmed separately", "",
      "## 8. Revision rules",
      `- Revision rounds: ${none(d.revisionRounds, lang)}`,
      "- Major direction changes, added deliverables, or out-of-scope work require a separate discussion",
      `- Additional fees / payment terms: ${none(d.paymentTerms, lang)}`, "",
      "## 9. Rights, portfolio use, and confidentiality",
      `- Rights / usage scope: ${none(d.rightsUsage, lang)}`,
      `- Portfolio permission: ${none(d.portfolioPermission, lang)}`,
      `- Confidentiality: ${none(d.confidentiality, lang)}`, "",
      "## 10. Notice",
      "- This output is not a contract.",
      "- Revision limits, additional fees, rights, confidentiality, and acceptance conditions should be agreed separately in a contract or purchase order."
    ].join("\n");
  }

  function buildPack(lang, type) {
    const packs = {
      web: { ja: ["サイト構成案", "ワイヤーフレーム", "UIデザイン", "実装仕様書", "検収チェックリスト", "納品データ一式"], en: ["Sitemap", "Wireframes", "UI design", "Implementation notes", "QA checklist", "Delivery assets"] },
      design: { ja: ["ブランドガイド", "メインビジュアル", "バナー3種", "編集可能デザインデータ", "納品用書き出し", "利用範囲メモ"], en: ["Brand guide", "Key visual", "3 banner sizes", "Editable source files", "Exported assets", "Usage scope notes"] },
      writing: { ja: ["構成案", "本文", "SEOタイトル/説明", "校正メモ", "入稿用テキスト", "参考資料リスト"], en: ["Outline", "Draft copy", "SEO title/description", "Editing notes", "Ready-to-publish text", "Reference list"] }
    };
    const p = packs[type] || packs.web;
    const items = lang === "ja" ? p.ja : p.en;
    return [lang === "ja" ? "# 成果物パック" : "# Deliverable Pack", "", items.map((item) => `- ${item}`).join("\n")].join("\n");
  }

  function stamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  }

  function initTool() {
    $("outputJa").textContent = msg.ja.initial;
    $("outputEn").textContent = msg.en.initial;
    $("proOutputJa").textContent = msg.ja.packInitial;
    $("proOutputEn").textContent = msg.en.packInitial;

    $("generateBtn").addEventListener("click", () => {
      const lang = langNow();
      if (!validate(lang)) return;
      $("outputJa").textContent = buildSpec("ja");
      $("outputEn").textContent = buildSpec("en");
      hasGenerated = true;
      setRequiredHint([], lang);
      toast(msg[lang].generated);
    });

    $("copyBtn").addEventListener("click", async () => {
      const lang = langNow();
      if (!hasGenerated) return toast(msg[lang].generateFirst);
      const text = lang === "ja" ? $("outputJa").textContent : $("outputEn").textContent;
      toast(await copyText(text) ? msg[lang].copied : msg[lang].copyFailed);
    });

    $("packBtn").addEventListener("click", () => {
      const type = $("packType").value;
      $("proOutputJa").textContent = buildPack("ja", type);
      $("proOutputEn").textContent = buildPack("en", type);
      toast(msg[langNow()].packGenerated);
    });

    $("exportBtn").addEventListener("click", () => {
      const lang = langNow();
      if (!hasGenerated) return toast(msg[lang].generateFirst);
      const spec = lang === "ja" ? $("outputJa").textContent : $("outputEn").textContent;
      const pack = lang === "ja" ? $("proOutputJa").textContent : $("proOutputEn").textContent;
      const withPack = pack && pack !== msg[lang].packInitial;
      download(`outsource-spec-${lang}-${stamp()}.md`, withPack ? `${spec}\n\n${pack}` : spec);
      toast(msg[lang].saved);
    });
  }

  document.addEventListener("DOMContentLoaded", () => { initLang(); initTool(); });
})();
