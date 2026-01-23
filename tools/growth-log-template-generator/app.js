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

  const PRESETS = {
    seo: {
      label: { ja: "SEO", en: "SEO" },
      resultHeading: { ja: "SEO指標", en: "SEO metrics" },
      fields: [
        { key: "pv", label: { ja: "PV", en: "PV" }, placeholder: { ja: "例: 12,000", en: "e.g. 12,000" }, required: true },
        { key: "ctr", label: { ja: "CTR", en: "CTR" }, placeholder: { ja: "例: 2.4%", en: "e.g. 2.4%" }, required: true },
        { key: "avgPosition", label: { ja: "平均掲載順位", en: "Avg position" }, placeholder: { ja: "例: 8.2", en: "e.g. 8.2" }, required: true },
        { key: "topKeyword", label: { ja: "主力キーワード", en: "Top keyword" }, placeholder: { ja: "例: 〇〇 比較", en: "e.g. keyword focus" }, required: true },
        { key: "conversions", label: { ja: "CV数", en: "Conversions" }, placeholder: { ja: "例: 45", en: "e.g. 45" }, required: false }
      ],
      example: {
        pv: "18,450",
        ctr: "2.1%",
        avgPosition: "7.8",
        topKeyword: "作業ログ テンプレ",
        conversions: "32"
      }
    },
    product: {
      label: { ja: "プロダクト", en: "Product" },
      resultHeading: { ja: "プロダクト指標", en: "Product metrics" },
      fields: [
        { key: "dau", label: { ja: "DAU", en: "DAU" }, placeholder: { ja: "例: 1,240", en: "e.g. 1,240" }, required: true },
        { key: "wau", label: { ja: "WAU", en: "WAU" }, placeholder: { ja: "例: 4,980", en: "e.g. 4,980" }, required: true },
        { key: "activationRate", label: { ja: "アクティベーション率", en: "Activation rate" }, placeholder: { ja: "例: 22%", en: "e.g. 22%" }, required: true },
        { key: "retentionRate", label: { ja: "継続率", en: "Retention rate" }, placeholder: { ja: "例: 38%", en: "e.g. 38%" }, required: true },
        { key: "churnRate", label: { ja: "解約率", en: "Churn rate" }, placeholder: { ja: "例: 4.5%", en: "e.g. 4.5%" }, required: false }
      ],
      example: {
        dau: "1,420",
        wau: "5,360",
        activationRate: "24%",
        retentionRate: "41%",
        churnRate: "3.9%"
      }
    },
    sales: {
      label: { ja: "セールス", en: "Sales" },
      resultHeading: { ja: "セールス指標", en: "Sales metrics" },
      fields: [
        { key: "leads", label: { ja: "リード数", en: "Leads" }, placeholder: { ja: "例: 48", en: "e.g. 48" }, required: true },
        { key: "mql", label: { ja: "MQL数", en: "MQLs" }, placeholder: { ja: "例: 20", en: "e.g. 20" }, required: true },
        { key: "pipeline", label: { ja: "商談化数", en: "Opportunities" }, placeholder: { ja: "例: 6", en: "e.g. 6" }, required: true },
        { key: "revenue", label: { ja: "売上", en: "Revenue" }, placeholder: { ja: "例: ¥320,000", en: "e.g. $2,400" }, required: true },
        { key: "closeRate", label: { ja: "成約率", en: "Close rate" }, placeholder: { ja: "例: 18%", en: "e.g. 18%" }, required: false }
      ],
      example: {
        leads: "52",
        mql: "24",
        pipeline: "7",
        revenue: "¥280,000",
        closeRate: "16%"
      }
    },
    content: {
      label: { ja: "コンテンツ", en: "Content" },
      resultHeading: { ja: "コンテンツ指標", en: "Content metrics" },
      fields: [
        { key: "pieces", label: { ja: "公開本数", en: "Pieces published" }, placeholder: { ja: "例: 6", en: "e.g. 6" }, required: true },
        { key: "pv", label: { ja: "PV", en: "PV" }, placeholder: { ja: "例: 9,200", en: "e.g. 9,200" }, required: true },
        { key: "ctr", label: { ja: "CTR", en: "CTR" }, placeholder: { ja: "例: 1.6%", en: "e.g. 1.6%" }, required: true },
        { key: "subscribers", label: { ja: "購読者増", en: "Subscriber growth" }, placeholder: { ja: "例: +120", en: "e.g. +120" }, required: true },
        { key: "avgTime", label: { ja: "平均読了時間", en: "Avg time on page" }, placeholder: { ja: "例: 2m 30s", en: "e.g. 2m 30s" }, required: false }
      ],
      example: {
        pieces: "5",
        pv: "9,870",
        ctr: "1.8%",
        subscribers: "+140",
        avgTime: "2m 10s"
      }
    }
  };

  let currentPreset = "seo";

  root.innerHTML = `
    <div class="field">
      <label class="label">
        <span data-i18n="ja">プリセット</span>
        <span data-i18n="en" style="display:none;">Preset</span>
      </label>
      <select id="presetSelect" class="select">
        <option value="seo">SEO</option>
        <option value="product">Product</option>
        <option value="sales">Sales</option>
        <option value="content">Content</option>
      </select>
    </div>
    <div id="presetFields" class="field-group"></div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">仮説</span>
        <span data-i18n="en" style="display:none;">Hypothesis</span>
      </label>
      <textarea id="hypothesisInput" class="textarea" placeholder="例: CTA文言を変えるとCTRが改善する"></textarea>
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">学び</span>
        <span data-i18n="en" style="display:none;">Learnings</span>
      </label>
      <textarea id="learningsInput" class="textarea" placeholder="例: 価格訴求よりも用途訴求の方が反応が良かった"></textarea>
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
      <button id="generateLog" class="btn primary" type="button">
        <span data-i18n="ja">ログ生成</span>
        <span data-i18n="en" style="display:none;">Generate log</span>
      </button>
      <button id="copyLog" class="btn" type="button">
        <span data-i18n="ja">コピー</span>
        <span data-i18n="en" style="display:none;">Copy</span>
      </button>
      <button id="downloadLogMd" class="btn" type="button">
        <span data-i18n="ja">Markdown保存</span>
        <span data-i18n="en" style="display:none;">Download MD</span>
      </button>
      <button id="downloadLogTxt" class="btn" type="button">
        <span data-i18n="ja">TXT保存</span>
        <span data-i18n="en" style="display:none;">Download TXT</span>
      </button>
      <button id="insertExample" class="btn" type="button">
        <span data-i18n="ja">例を挿入</span>
        <span data-i18n="en" style="display:none;">Insert example</span>
      </button>
      <button id="exampleOnly" class="btn" type="button">
        <span data-i18n="ja">例ログのみ生成</span>
        <span data-i18n="en" style="display:none;">Generate example log only</span>
      </button>
    </div>
    <div class="field">
      <label class="label">
        <span data-i18n="ja">出力</span>
        <span data-i18n="en" style="display:none;">Output</span>
      </label>
      <div id="logOutput" class="out" aria-live="polite"></div>
    </div>
  `;

  const presetSelect = root.querySelector("#presetSelect");
  const presetFields = root.querySelector("#presetFields");
  const hypothesisInput = root.querySelector("#hypothesisInput");
  const learningsInput = root.querySelector("#learningsInput");
  const notesInput = root.querySelector("#notesInput");
  const anonToggle = root.querySelector("#anonToggle");
  const output = root.querySelector("#logOutput");
  const insertExampleButton = root.querySelector("#insertExample");
  const exampleOnlyButton = root.querySelector("#exampleOnly");

  const parseNumber = (value) => {
    if (!value) return null;
    const cleaned = value.toString().replace(/[%¥$,+=]/g, "").replace(/,/g, "").trim();
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? null : num;
  };

  const formatValue = (value) => {
    if (!value) return "-";
    return anonToggle.checked ? "XXX" : value;
  };

  const renderPresetFields = () => {
    const preset = PRESETS[currentPreset];
    presetFields.innerHTML = preset.fields.map((field) => `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">${field.label.ja}</span>
          <span data-i18n="en" style="display:none;">${field.label.en}</span>
          ${field.required ? `<span class="required" data-i18n="ja">必須</span><span class="required" data-i18n="en" style="display:none;">Required</span>` : ""}
        </label>
        <input id="field-${field.key}" class="input" type="text" placeholder="${field.placeholder.ja}" data-placeholder-en="${field.placeholder.en}" />
      </div>
    `).join("");

    window.NW.applyLang(document.documentElement.lang || "ja");
    updatePlaceholders();
  };

  const updatePlaceholders = () => {
    const preset = PRESETS[currentPreset];
    const lang = document.documentElement.lang || "ja";
    presetFields.querySelectorAll("input").forEach((input) => {
      const field = preset.fields.find((item) => `field-${item.key}` === input.id);
      if (!field) return;
      input.placeholder = lang === "ja" ? field.placeholder.ja : field.placeholder.en;
    });
  };

  const getFieldValues = (source) => {
    const preset = PRESETS[currentPreset];
    const values = {};
    preset.fields.forEach((field) => {
      const key = field.key;
      if (source && source[key] !== undefined) {
        values[key] = source[key];
        return;
      }
      const input = root.querySelector(`#field-${key}`);
      values[key] = input ? input.value.trim() : "";
    });
    values.hypothesis = source?.hypothesis ?? hypothesisInput.value.trim();
    values.learnings = source?.learnings ?? learningsInput.value.trim();
    values.notes = source?.notes ?? notesInput.value.trim();
    return values;
  };

  const deriveNextActions = (values) => {
    const actions = [];
    const pv = parseNumber(values.pv);
    const ctr = parseNumber(values.ctr);
    const revenue = parseNumber(values.revenue);
    const avgPosition = parseNumber(values.avgPosition);
    const activationRate = parseNumber(values.activationRate);
    const retentionRate = parseNumber(values.retentionRate);
    const churnRate = parseNumber(values.churnRate);
    const leads = parseNumber(values.leads);
    const mql = parseNumber(values.mql);
    const pipeline = parseNumber(values.pipeline);
    const pieces = parseNumber(values.pieces);
    const subscribers = parseNumber(values.subscribers);

    if (pv !== null && pv < 1000) {
      actions.push({
        ja: "流入が少ないため、検索面の新規KW追加とSNS再配信を優先。",
        en: "Traffic is low; prioritize new SEO keywords and re-distribution on socials."
      });
    }
    if (ctr !== null && ctr < 1.5) {
      actions.push({
        ja: "CTRが低いため、タイトル/サムネ/CTAを2案以上でABテスト。",
        en: "CTR is low; A/B test at least 2 headline/thumbnail/CTA variants."
      });
    }
    if (avgPosition !== null && avgPosition > 10) {
      actions.push({
        ja: "掲載順位が低いので、H2構成と内部リンクを改善し順位改善を狙う。",
        en: "Average position is low; improve H2 structure and internal links."
      });
    }
    if (activationRate !== null && activationRate < 20) {
      actions.push({
        ja: "アクティベーション率が低いため、オンボーディングの初期導線を短縮。",
        en: "Activation rate is low; shorten onboarding steps to first value."
      });
    }
    if (retentionRate !== null && retentionRate < 30) {
      actions.push({
        ja: "継続率が低いので、1週間以内のリマインドと価値提示を強化。",
        en: "Retention is low; reinforce reminders and value messaging within 1 week."
      });
    }
    if (churnRate !== null && churnRate > 5) {
      actions.push({
        ja: "解約率が高いので、解約理由のヒアリングと対策メールを実施。",
        en: "Churn is high; collect churn reasons and send mitigation emails."
      });
    }
    if (leads !== null && leads < 20) {
      actions.push({
        ja: "リードが少ないので、LPの資料DL導線とCTA配置を見直す。",
        en: "Leads are low; review lead magnet CTA placement on the landing page."
      });
    }
    if (mql !== null && leads !== null && mql / Math.max(leads, 1) < 0.3) {
      actions.push({
        ja: "MQL比率が低いため、スコアリング条件とセグメントを再設計。",
        en: "MQL rate is low; revisit scoring criteria and lead segmentation."
      });
    }
    if (pipeline !== null && pipeline < 5) {
      actions.push({
        ja: "商談化が不足しているため、既存リードへの再接触を強化。",
        en: "Opportunities are low; re-engage existing leads with targeted outreach."
      });
    }
    if (revenue !== null && revenue < 100000) {
      actions.push({
        ja: "売上が伸び悩むため、アップセル/バンドル提案をテスト。",
        en: "Revenue is soft; test upsell or bundle offers."
      });
    }
    if (pieces !== null && pieces < 4) {
      actions.push({
        ja: "公開本数が少ないため、週次の制作枠を確保して更新頻度を増やす。",
        en: "Publishing volume is low; secure weekly production slots."
      });
    }
    if (subscribers !== null && subscribers < 50) {
      actions.push({
        ja: "購読者増が鈍いので、記事内の登録CTAとオファーを強化。",
        en: "Subscriber growth is slow; strengthen in-article signup CTA and offer."
      });
    }

    const fallback = {
      seo: [
        { ja: "上位表示できているKWの共通点を抽出して次記事に反映。", en: "Identify patterns in top-ranking keywords and apply to next articles." },
        { ja: "Search Consoleのクエリ別に改善対象をピックアップ。", en: "Review Search Console queries to select optimization targets." },
        { ja: "競合記事の構成を比較して不足セクションを補強。", en: "Compare competitor outlines and add missing sections." }
      ],
      product: [
        { ja: "主要機能の利用頻度を分解してボトルネックを特定。", en: "Break down feature usage to find activation bottlenecks." },
        { ja: "アクティブユーザーの定性ヒアリングを2件実施。", en: "Run 2 qualitative interviews with active users." },
        { ja: "最初の成功体験までの導線を1画面で完結させる。", en: "Make the path to first success fit in a single screen." }
      ],
      sales: [
        { ja: "失注理由を3件レビューして改善メッセージを準備。", en: "Review 3 lost-deal reasons and update messaging." },
        { ja: "商談化率が高いチャネルを優先して投入。", en: "Prioritize channels with higher opportunity conversion." },
        { ja: "導入事例を1本追加して信頼性を補強。", en: "Add one case study to reinforce credibility." }
      ],
      content: [
        { ja: "反応が良い記事の構成をテンプレ化。", en: "Template the structure of high-performing posts." },
        { ja: "配信チャネルごとのCTRを比較してリライト計画を立てる。", en: "Compare CTR by channel and plan rewrites." },
        { ja: "上位3記事に内部リンクを集中させて回遊を増やす。", en: "Add internal links to top 3 posts to boost recirculation." }
      ]
    };

    const combined = [...actions];
    fallback[currentPreset].forEach((item) => combined.push(item));

    const unique = [];
    combined.forEach((item) => {
      if (!unique.some((existing) => existing.ja === item.ja)) {
        unique.push(item);
      }
    });

    return unique.slice(0, 5);
  };

  const buildLog = (values) => {
    const date = new Date().toISOString().slice(0, 10);
    const preset = PRESETS[currentPreset];
    const metrics = preset.fields.map((field) => ({
      label: field.label,
      value: formatValue(values[field.key])
    }));

    const hypothesis = values.hypothesis || "-";
    const learnings = values.learnings || "-";
    const notes = values.notes || "-";
    const nextActions = deriveNextActions(values);
    const mainAction = nextActions[0] || {
      ja: "次回の最優先施策を1つ決めて実行する。",
      en: "Pick one highest-priority action and execute it."
    };

    const jp = `# 成長ログ（${preset.label.ja}）
` +
      `更新日: ${date}
` +
      `
## 仮説
` +
      `- ${hypothesis}
` +
      `
## 結果
` +
      `### ${preset.resultHeading.ja}
` +
      metrics.map((item) => `- ${item.label.ja}: ${item.value}`).join("
") + "
" +
      `
## 学び
` +
      `- ${learnings}
` +
      `
## 次のアクション
` +
      nextActions.map((item) => `- ${item.ja}`).join("
") + "
" +
      `- **もし1つだけやるなら**: ${mainAction.ja}
` +
      `
## メモ
` +
      `- ${notes}
`;

    const en = `# Growth Log (${preset.label.en})
` +
      `Date: ${date}
` +
      `
## Hypothesis
` +
      `- ${hypothesis}
` +
      `
## Result
` +
      `### ${preset.resultHeading.en}
` +
      metrics.map((item) => `- ${item.label.en}: ${item.value}`).join("
") + "
" +
      `
## Learnings
` +
      `- ${learnings}
` +
      `
## Next actions
` +
      nextActions.map((item) => `- ${item.en}`).join("
") + "
" +
      `- **If you do only 1 thing:** ${mainAction.en}
` +
      `
## Notes
` +
      `- ${notes}
`;

    return `${jp}

${en}`;
  };

  const render = (source) => {
    const values = getFieldValues(source);
    output.textContent = buildLog(values);
  };

  const generateButton = root.querySelector("#generateLog");
  const copyButton = root.querySelector("#copyLog");
  const downloadMdButton = root.querySelector("#downloadLogMd");
  const downloadTxtButton = root.querySelector("#downloadLogTxt");

  generateButton.addEventListener("click", () => render());
  copyButton.addEventListener("click", async () => {
    const ok = await window.NW.copyToClipboard(output.textContent || "");
    if (!ok) alert("Copy failed");
  });
  downloadMdButton.addEventListener("click", () => {
    const text = output.textContent || buildLog(getFieldValues());
    window.NW.downloadText("growth-log.md", text);
  });
  downloadTxtButton.addEventListener("click", () => {
    const text = output.textContent || buildLog(getFieldValues());
    window.NW.downloadText("growth-log.txt", text);
  });

  presetSelect.addEventListener("change", (event) => {
    currentPreset = event.target.value;
    renderPresetFields();
    render();
  });

  document.querySelectorAll(".nw-lang-switch button").forEach((button) => {
    button.addEventListener("click", updatePlaceholders);
  });

  insertExampleButton.addEventListener("click", () => {
    const example = {
      ...PRESETS[currentPreset].example,
      hypothesis: "CTA文言変更でクリック率が上がるはず。",
      learnings: "比較軸を明示するとクリックが増えた。",
      notes: "同日のSNS投稿もクリック増に寄与。"
    };
    renderPresetFields();
    Object.entries(example).forEach(([key, value]) => {
      const input = root.querySelector(`#field-${key}`);
      if (input) input.value = value;
    });
    hypothesisInput.value = example.hypothesis;
    learningsInput.value = example.learnings;
    notesInput.value = example.notes;
    render();
  });

  exampleOnlyButton.addEventListener("click", () => {
    const example = {
      ...PRESETS[currentPreset].example,
      hypothesis: "見出し改善でCTRが上がるはず。",
      learnings: "比較表を追加すると滞在時間が伸びた。",
      notes: "来週はFAQセクションも追加する。"
    };
    output.textContent = buildLog(example);
  });

  renderPresetFields();
  render();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initGrowthLog);
