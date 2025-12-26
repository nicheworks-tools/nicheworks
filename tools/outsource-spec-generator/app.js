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

  const toBullets = (value) => value
    .split(/\n|,|、/)
    .map((v) => v.trim())
    .filter(Boolean);

  const getValue = (id) => document.getElementById(id).value.trim();

  const buildSpec = (lang) => {
    const workType = getValue("workType") || (lang === "ja" ? "未入力" : "Not specified");
    const deliverables = toBullets(getValue("deliverables"));
    const deadline = getValue("deadline") || (lang === "ja" ? "未入力" : "Not specified");
    const budget = getValue("budget") || (lang === "ja" ? "未入力" : "Not specified");
    const mustHave = toBullets(getValue("mustHave"));
    const references = toBullets(getValue("references"));

    if (lang === "ja") {
      return [
        "【外注仕様書】",
        `作業種別: ${workType}`,
        "成果物/範囲:",
        deliverables.length ? deliverables.map((item) => `- ${item}`).join("\n") : "- 例: デザイン一式 / 記事3本 / UI実装",
        `納期: ${deadline}`,
        `予算: ${budget}`,
        "必須条件:",
        mustHave.length ? mustHave.map((item) => `- ${item}`).join("\n") : "- 例: 修正対応2回 / ガイドライン遵守",
        "参考資料:",
        references.length ? references.map((item) => `- ${item}`).join("\n") : "- 例: 参考URL / 共有ドキュメント",
        "",
        "【受入基準】",
        "- 指定された成果物がすべて揃っている",
        "- 仕様・形式・サイズが要件に合致している",
        "- 不明点は納品前に確認されている",
        "",
        "【修正ルール】",
        "- 初回提出後の軽微修正は2回まで",
        "- 大幅な方向性変更は別途相談",
        "- 最終確定後の追加修正は見積もり",
      ].join("\n");
    }

    return [
      "[Outsource Specification]",
      `Work type: ${workType}`,
      "Deliverables/Scope:",
      deliverables.length ? deliverables.map((item) => `- ${item}`).join("\n") : "- e.g. design set / 3 articles / UI implementation",
      `Deadline: ${deadline}`,
      `Budget: ${budget}`,
      "Must-have requirements:",
      mustHave.length ? mustHave.map((item) => `- ${item}`).join("\n") : "- e.g. 2 revision rounds / follow style guide",
      "References:",
      references.length ? references.map((item) => `- ${item}`).join("\n") : "- e.g. reference URLs / shared docs",
      "",
      "[Acceptance Criteria]",
      "- All listed deliverables are included",
      "- Specs, formats, and sizes match requirements",
      "- Open questions are confirmed before delivery",
      "",
      "[Revision Rules]",
      "- Up to two minor revision rounds after first delivery",
      "- Major direction changes require a new scope discussion",
      "- Additional changes after final approval are quoted",
    ].join("\n");
  };

  const buildPack = (lang, type) => {
    const packs = {
      web: {
        ja: ["サイト構成案", "ワイヤーフレーム", "UIデザイン", "実装仕様書", "検収チェックリスト"],
        en: ["Sitemap", "Wireframes", "UI design", "Implementation specs", "QA checklist"],
      },
      design: {
        ja: ["ブランドガイド", "メインビジュアル", "バナー3種", "デザインデータ一式", "納品用書き出し"],
        en: ["Brand guide", "Key visual", "3 banner sizes", "Source files", "Exported assets"],
      },
      writing: {
        ja: ["構成案", "本文", "SEOタイトル/説明", "校正メモ", "入稿用テキスト"],
        en: ["Outline", "Draft copy", "SEO title/description", "Editing notes", "Ready-to-publish text"],
      },
    };
    const selected = packs[type] || packs.web;
    const title = lang === "ja" ? "【成果物パック】" : "[Deliverable Pack]";
    const items = lang === "ja" ? selected.ja : selected.en;
    return [title, items.map((item) => `- ${item}`).join("\n")].join("\n");
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">作業種別</span>
          <span data-i18n="en" style="display:none;">Work type</span>
        </label>
        <input id="workType" class="input" type="text" placeholder="例: LP制作 / 記事執筆" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">成果物・範囲</span>
          <span data-i18n="en" style="display:none;">Deliverables / scope</span>
        </label>
        <textarea id="deliverables" class="textarea" placeholder="例: デザイン一式、HTML/CSS、記事3本"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">納期</span>
          <span data-i18n="en" style="display:none;">Deadline</span>
        </label>
        <input id="deadline" class="input" type="text" placeholder="例: 2024/09/30" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">予算</span>
          <span data-i18n="en" style="display:none;">Budget</span>
        </label>
        <input id="budget" class="input" type="text" placeholder="例: 15万円" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">必須条件</span>
          <span data-i18n="en" style="display:none;">Must-have requirements</span>
        </label>
        <textarea id="mustHave" class="textarea" placeholder="例: 修正2回まで、ガイドライン遵守"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">参考資料</span>
          <span data-i18n="en" style="display:none;">References</span>
        </label>
        <textarea id="references" class="textarea" placeholder="例: 参考URL、共有ドキュメント"></textarea>
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">仕様書を生成</span>
          <span data-i18n="en" style="display:none;">Generate spec</span>
        </button>
        <button class="btn" id="copyBtn" type="button">
          <span data-i18n="ja">コピー</span>
          <span data-i18n="en" style="display:none;">Copy</span>
        </button>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">出力</span>
          <span data-i18n="en" style="display:none;">Output</span>
        </label>
        <pre id="outputJa" class="out" data-i18n="ja"></pre>
        <pre id="outputEn" class="out" data-i18n="en" style="display:none;"></pre>
      </div>

      <hr class="hr" />

      <div class="field">
        <label class="label">
          <span data-i18n="ja">成果物パック (Pro)</span>
          <span data-i18n="en" style="display:none;">Deliverable pack (Pro)</span>
        </label>
        <select id="packType" class="select">
          <option value="web">Web / UI</option>
          <option value="design">Design</option>
          <option value="writing">Writing</option>
        </select>
        <div id="proNotice" class="nw-note" style="display:none;">
          <span data-i18n="ja">Pro機能です。無料でも仕様書の生成は利用できます。</span>
          <span data-i18n="en" style="display:none;">Pro feature. You can still generate specs for free.</span>
        </div>
      </div>

      <div class="row">
        <button class="btn" id="packBtn" type="button">
          <span data-i18n="ja">パックを生成</span>
          <span data-i18n="en" style="display:none;">Generate pack</span>
        </button>
        <button class="btn" id="exportBtn" type="button">
          <span data-i18n="ja">Markdown出力</span>
          <span data-i18n="en" style="display:none;">Export Markdown</span>
        </button>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">Pro出力</span>
          <span data-i18n="en" style="display:none;">Pro output</span>
        </label>
        <pre id="proOutputJa" class="out" data-i18n="ja"></pre>
        <pre id="proOutputEn" class="out" data-i18n="en" style="display:none;"></pre>
      </div>
    `;

    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const proOutputJa = document.getElementById("proOutputJa");
    const proOutputEn = document.getElementById("proOutputEn");
    const hasPro = window.NW.hasPro();

    const refresh = () => {
      outputJa.textContent = buildSpec("ja");
      outputEn.textContent = buildSpec("en");
    };

    const refreshPack = () => {
      const packType = document.getElementById("packType").value;
      proOutputJa.textContent = buildPack("ja", packType);
      proOutputEn.textContent = buildPack("en", packType);
    };

    document.getElementById("generateBtn").addEventListener("click", refresh);
    document.getElementById("copyBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      await window.NW.copyToClipboard(text);
    });

    document.getElementById("packBtn").addEventListener("click", () => {
      if (!hasPro) return;
      refreshPack();
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      if (!hasPro) return;
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const base = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      const pack = lang === "ja" ? proOutputJa.textContent : proOutputEn.textContent;
      const text = `${base}\n\n${pack}`.trim();
      window.NW.downloadText(`outsource-spec-${lang}.md`, text);
    });

    if (!hasPro) {
      document.getElementById("proNotice").style.display = "";
      document.getElementById("packBtn").disabled = true;
      document.getElementById("exportBtn").disabled = true;
      proOutputJa.textContent = "(Pro機能)";
      proOutputEn.textContent = "(Pro feature)";
    } else {
      refreshPack();
    }

    refresh();
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    initTool();
  });
})();
