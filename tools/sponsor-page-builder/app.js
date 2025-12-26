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

  const buildTiers = (lang, count) => {
    const tiers = lang === "ja"
      ? [
        { name: "サポーター", price: "¥500/月", desc: "活動の継続支援" },
        { name: "スポンサー", price: "¥2,000/月", desc: "新機能の優先検討" },
        { name: "パートナー", price: "¥10,000/月", desc: "READMEにロゴ掲載" },
        { name: "ゴールド", price: "¥30,000/月", desc: "優先サポート" },
        { name: "プラチナ", price: "¥50,000/月", desc: "共同施策の相談" },
      ]
      : [
        { name: "Supporter", price: "$5/mo", desc: "Keep the project running" },
        { name: "Sponsor", price: "$20/mo", desc: "Prioritized roadmap consideration" },
        { name: "Partner", price: "$100/mo", desc: "Logo placement in README" },
        { name: "Gold", price: "$300/mo", desc: "Priority support" },
        { name: "Platinum", price: "$500/mo", desc: "Collaboration options" },
      ];

    return tiers.slice(0, count).map((tier, index) => {
      return `${index + 1}. ${tier.name} (${tier.price}) - ${tier.desc}`;
    }).join("\n");
  };

  const buildCopy = (lang) => {
    const summary = getValue("summary") || (lang === "ja" ? "未入力" : "Not specified");
    const benefits = toBullets(getValue("benefits"));
    const tierCount = Number(document.getElementById("tierCount").value || 3);
    const corpSupport = document.getElementById("corpSupport").value === "yes";

    if (lang === "ja") {
      return [
        "【プロジェクト概要】",
        summary,
        "",
        "【支援でできること】",
        benefits.length ? benefits.map((item) => `- ${item}`).join("\n") : "- 例: 開発時間の確保 / ドキュメント整備",
        "",
        "【支援ティア】",
        buildTiers("ja", tierCount),
        "",
        "【FAQ】",
        "Q. 支援金の使い道は？\nA. 開発時間やインフラ費用に充当します。",
        "Q. いつでもキャンセルできますか？\nA. はい、いつでも停止できます。",
        corpSupport ? "Q. 法人支援は可能ですか？\nA. 可能です。請求書対応もご相談ください。" : "",
      ].filter(Boolean).join("\n");
    }

    return [
      "[Project Summary]",
      summary,
      "",
      "[How your support helps]",
      benefits.length ? benefits.map((item) => `- ${item}`).join("\n") : "- e.g. allocate dev time / improve documentation",
      "",
      "[Sponsorship Tiers]",
      buildTiers("en", tierCount),
      "",
      "[FAQ]",
      "Q. How will the funds be used?\nA. To support development time and infrastructure costs.",
      "Q. Can I cancel anytime?\nA. Yes, you can stop at any time.",
      corpSupport ? "Q. Do you support corporate sponsors?\nA. Yes, invoicing options are available on request." : "",
    ].filter(Boolean).join("\n");
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">OSS概要</span>
          <span data-i18n="en" style="display:none;">OSS summary</span>
        </label>
        <textarea id="summary" class="textarea" placeholder="例: 〇〇向けの無料ツールをOSSで提供"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">支援メリット</span>
          <span data-i18n="en" style="display:none;">Benefits</span>
        </label>
        <textarea id="benefits" class="textarea" placeholder="例: 開発継続、バグ修正、ドキュメント追加"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">ティア数</span>
          <span data-i18n="en" style="display:none;">Tier count</span>
        </label>
        <select id="tierCount" class="select">
          <option value="3" selected>3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">法人支援対応</span>
          <span data-i18n="en" style="display:none;">Corporate support</span>
        </label>
        <select id="corpSupport" class="select">
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">コピーを生成</span>
          <span data-i18n="en" style="display:none;">Generate copy</span>
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

      <div class="row">
        <button class="btn" id="downloadBtn" type="button">
          <span data-i18n="ja">テキスト保存</span>
          <span data-i18n="en" style="display:none;">Download text</span>
        </button>
      </div>
    `;

    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");

    const refresh = () => {
      outputJa.textContent = buildCopy("ja");
      outputEn.textContent = buildCopy("en");
    };

    document.getElementById("generateBtn").addEventListener("click", refresh);
    document.getElementById("copyBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      await window.NW.copyToClipboard(text);
    });

    document.getElementById("downloadBtn").addEventListener("click", () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      window.NW.downloadText(`sponsor-page-${lang}.txt`, text);
    });

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
