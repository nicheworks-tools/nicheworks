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

  const buildJobPost = (lang) => {
    const role = getValue("role") || (lang === "ja" ? "未入力" : "Not specified");
    const requirements = toBullets(getValue("requirements"));
    const conditions = toBullets(getValue("conditions"));
    const process = toBullets(getValue("process"));
    const location = getValue("location") || (lang === "ja" ? "未入力" : "Not specified");

    if (lang === "ja") {
      return [
        "【募集職種】",
        role,
        "",
        "【仕事内容】",
        "- 業務内容と成果物を明確化し、関係者と連携して推進",
        "",
        "【必須要件】",
        requirements.length ? requirements.map((item) => `- ${item}`).join("\n") : "- 例: 類似業務の経験 / 週10時間対応",
        "",
        "【歓迎要件】",
        "- コミュニケーションの速さ / 自走力",
        "",
        "【勤務条件】",
        conditions.length ? conditions.map((item) => `- ${item}`).join("\n") : "- 例: 時給/固定報酬、稼働時間相談",
        "",
        "【勤務地/働き方】",
        location,
        "",
        "【選考プロセス】",
        process.length ? process.map((item) => `- ${item}`).join("\n") : "- 書類選考 → 面談 → トライアル",
        "",
        "【応募方法】",
        "- ポートフォリオや実績をご共有ください",
      ].join("\n");
    }

    return [
      "[Role]",
      role,
      "",
      "[Responsibilities]",
      "- Clarify deliverables and drive tasks with stakeholders",
      "",
      "[Required Qualifications]",
      requirements.length ? requirements.map((item) => `- ${item}`).join("\n") : "- e.g. relevant experience / 10 hours per week",
      "",
      "[Preferred]",
      "- Fast communication / proactive ownership",
      "",
      "[Working Conditions]",
      conditions.length ? conditions.map((item) => `- ${item}`).join("\n") : "- e.g. hourly or fixed fee, flexible schedule",
      "",
      "[Location / Remote]",
      location,
      "",
      "[Hiring Process]",
      process.length ? process.map((item) => `- ${item}`).join("\n") : "- Resume → Interview → Trial task",
      "",
      "[How to Apply]",
      "- Share your portfolio or relevant work samples",
    ].join("\n");
  };

  const buildQuestions = (lang) => {
    const role = getValue("role") || (lang === "ja" ? "この職種" : "this role");
    if (lang === "ja") {
      return [
        "【スクリーニング質問】",
        `1. ${role}に関する直近の実績を教えてください。`,
        "2. 週あたりの稼働可能時間と連絡可能な時間帯は？",
        "3. 必須要件で不安な点があれば教えてください。",
        "4. 納期遅延のリスクがある場合の対応方針は？",
        "5. 参考になる成果物やURLを共有してください。",
      ].join("\n");
    }

    return [
      "[Screening Questions]",
      `1. What recent achievements do you have related to ${role}?`,
      "2. How many hours per week are you available, and when are you reachable?",
      "3. Are there any required qualifications you are unsure about?",
      "4. How do you handle risks of missing deadlines?",
      "5. Share relevant work samples or URLs.",
    ].join("\n");
  };

  const buildSheetColumns = (lang) => {
    if (lang === "ja") {
      return "氏名,メール,ポートフォリオ,質問1,質問2,ステータス,メモ";
    }
    return "Name,Email,Portfolio,Q1,Q2,Status,Notes";
  };

  const buildVariants = (lang) => {
    if (lang === "ja") {
      return [
        "【バリエーション例】",
        "- スピード重視: 週次で進捗共有できる方歓迎",
        "- 品質重視: レビュー・改善提案が得意な方歓迎",
        "- 長期支援: 3ヶ月以上の伴走に前向きな方",
      ].join("\n");
    }
    return [
      "[Variant Options]",
      "- Speed-focused: weekly updates and quick turnaround",
      "- Quality-focused: strong review and improvement mindset",
      "- Long-term: open to 3+ month engagement",
    ].join("\n");
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">募集職種</span>
          <span data-i18n="en" style="display:none;">Role</span>
        </label>
        <input id="role" class="input" type="text" placeholder="例: UI/UXデザイナー" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">必須要件</span>
          <span data-i18n="en" style="display:none;">Requirements</span>
        </label>
        <textarea id="requirements" class="textarea" placeholder="例: Figma経験、週10時間"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">勤務条件</span>
          <span data-i18n="en" style="display:none;">Conditions</span>
        </label>
        <textarea id="conditions" class="textarea" placeholder="例: 週2回定例、月10万円"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">選考プロセス</span>
          <span data-i18n="en" style="display:none;">Process</span>
        </label>
        <textarea id="process" class="textarea" placeholder="例: 書類選考→面談→トライアル"></textarea>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">勤務地/リモート</span>
          <span data-i18n="en" style="display:none;">Location / Remote</span>
        </label>
        <input id="location" class="input" type="text" placeholder="例: フルリモート / 東京" />
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">求人キットを生成</span>
          <span data-i18n="en" style="display:none;">Generate kit</span>
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
          <span data-i18n="ja">Pro拡張</span>
          <span data-i18n="en" style="display:none;">Pro add-ons</span>
        </label>
        <div id="proNotice" class="nw-note" style="display:none;">
          <span data-i18n="ja">Pro機能です。無料でも求人票と質問は使えます。</span>
          <span data-i18n="en" style="display:none;">Pro feature. Job post + questions remain free.</span>
        </div>
      </div>

      <div class="row">
        <button class="btn" id="exportBtn" type="button">
          <span data-i18n="ja">シート列CSV</span>
          <span data-i18n="en" style="display:none;">Sheet columns CSV</span>
        </button>
        <button class="btn" id="variantBtn" type="button">
          <span data-i18n="ja">バリエーション生成</span>
          <span data-i18n="en" style="display:none;">Generate variants</span>
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
      outputJa.textContent = `${buildJobPost("ja")}\n\n${buildQuestions("ja")}`;
      outputEn.textContent = `${buildJobPost("en")}\n\n${buildQuestions("en")}`;
    };

    document.getElementById("generateBtn").addEventListener("click", refresh);
    document.getElementById("copyBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      await window.NW.copyToClipboard(text);
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      if (!hasPro) return;
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = buildSheetColumns(lang);
      window.NW.downloadText(`job-sheet-columns-${lang}.csv`, text);
    });

    document.getElementById("variantBtn").addEventListener("click", () => {
      if (!hasPro) return;
      proOutputJa.textContent = buildVariants("ja");
      proOutputEn.textContent = buildVariants("en");
    });

    if (!hasPro) {
      document.getElementById("proNotice").style.display = "";
      document.getElementById("exportBtn").disabled = true;
      document.getElementById("variantBtn").disabled = true;
      proOutputJa.textContent = "(Pro機能)";
      proOutputEn.textContent = "(Pro feature)";
    } else {
      proOutputJa.textContent = buildVariants("ja");
      proOutputEn.textContent = buildVariants("en");
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
