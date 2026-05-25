(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));
  let currentLang = "ja";
  let toastTimer = null;

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    currentLang = lang === "en" ? "en" : "ja";
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
    langButtons().forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === currentLang);
    });
    document.documentElement.lang = currentLang;
    try { localStorage.setItem("nw_lang", currentLang); } catch (_) {}
    document.dispatchEvent(new CustomEvent("nw:langchange", { detail: { lang: currentLang } }));
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);
  };

  const copyToClipboard = async (text) => {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        return document.execCommand("copy");
      } catch (error) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const downloadText = (filename, text, mime = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const showToast = (message) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  };

  window.NW = {
    applyLang,
    getLang: () => currentLang,
    copyToClipboard,
    downloadText,
    showToast
  };

  document.addEventListener("DOMContentLoaded", initLang);
})();

const initGrowthLog = () => {
  const root = document.getElementById("toolRoot");
  if (!root || !window.NW) return;

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

  const presetSelect = root.querySelector("#presetSelect");
  const presetFields = root.querySelector("#presetFields");
  const hypothesisInput = root.querySelector("#hypothesisInput");
  const learningsInput = root.querySelector("#learningsInput");
  const notesInput = root.querySelector("#notesInput");
  const anonToggle = root.querySelector("#anonToggle");
  const bilingualToggle = root.querySelector("#bilingualToggle");
  const output = root.querySelector("#logOutput");
  const generateButton = root.querySelector("#generateLog");
  const copyButton = root.querySelector("#copyLog");
  const downloadMdButton = root.querySelector("#downloadLogMd");
  const downloadTxtButton = root.querySelector("#downloadLogTxt");
  const insertExampleButton = root.querySelector("#insertExample");
  const exampleOnlyButton = root.querySelector("#exampleOnly");

  let currentPreset = presetSelect?.value || "seo";
  let hasGenerated = false;
  let lastText = "";
  let lastWasExample = false;

  const t = (ja, en) => window.NW.getLang() === "ja" ? ja : en;

  const setInitialMessage = () => {
    output.textContent = t(
      "数値とメモを入力してログ生成してください。",
      "Enter metrics and notes, then generate a log."
    );
    output.classList.add("empty");
  };

  const showToast = (ja, en) => window.NW.showToast(t(ja, en));

  const setTextareaPlaceholders = () => {
    [hypothesisInput, learningsInput, notesInput].forEach((textarea) => {
      if (!textarea) return;
      textarea.placeholder = window.NW.getLang() === "ja"
        ? textarea.dataset.placeholderJa || ""
        : textarea.dataset.placeholderEn || "";
    });
  };

  const parseNumber = (value) => {
    if (!value) return null;
    const normalized = value
      .toString()
      .trim()
      .replace(/[¥$€£,%\s]/g, "")
      .replace(/,/g, "");
    if (!/^[-+]?\d+(\.\d+)?$/.test(normalized)) return null;
    const num = parseFloat(normalized);
    return Number.isNaN(num) ? null : num;
  };

  const formatValue = (value) => {
    if (!value) return "-";
    return anonToggle.checked ? "XXX" : value;
  };

  const appendI18nText = (parent, tagName, text, lang, hidden = false) => {
    const node = document.createElement(tagName);
    node.dataset.i18n = lang;
    node.textContent = text;
    if (hidden) node.style.display = "none";
    parent.appendChild(node);
    return node;
  };

  const renderPresetFields = () => {
    const preset = PRESETS[currentPreset];
    presetFields.replaceChildren();

    preset.fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = "field";

      const label = document.createElement("label");
      label.className = "label";
      label.setAttribute("for", `field-${field.key}`);
      appendI18nText(label, "span", field.label.ja, "ja");
      appendI18nText(label, "span", field.label.en, "en", true);

      if (field.required) {
        const requiredJa = appendI18nText(label, "span", "必須", "ja");
        requiredJa.className = "required";
        const requiredEn = appendI18nText(label, "span", "Required", "en", true);
        requiredEn.className = "required";
      }

      const input = document.createElement("input");
      input.id = `field-${field.key}`;
      input.className = "input";
      input.type = "text";
      input.autocomplete = "off";
      input.dataset.key = field.key;
      input.placeholder = window.NW.getLang() === "ja" ? field.placeholder.ja : field.placeholder.en;

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      presetFields.appendChild(wrapper);
    });

    window.NW.applyLang(window.NW.getLang());
    updatePlaceholders();
  };

  const updatePlaceholders = () => {
    const preset = PRESETS[currentPreset];
    presetFields.querySelectorAll("input").forEach((input) => {
      const field = preset.fields.find((item) => item.key === input.dataset.key);
      if (!field) return;
      input.placeholder = window.NW.getLang() === "ja" ? field.placeholder.ja : field.placeholder.en;
    });
    setTextareaPlaceholders();
  };

  const getFieldValues = (source = null) => {
    const preset = PRESETS[currentPreset];
    const values = {};
    preset.fields.forEach((field) => {
      if (source && source[field.key] !== undefined) {
        values[field.key] = source[field.key];
        return;
      }
      const input = root.querySelector(`#field-${field.key}`);
      values[field.key] = input ? input.value.trim() : "";
    });
    values.hypothesis = source?.hypothesis ?? hypothesisInput.value.trim();
    values.learnings = source?.learnings ?? learningsInput.value.trim();
    values.notes = source?.notes ?? notesInput.value.trim();
    return values;
  };

  const validateRequired = (values) => {
    const missing = PRESETS[currentPreset].fields.filter((field) => {
      return field.required && !String(values[field.key] || "").trim();
    });

    if (missing.length > 0) {
      return {
        ok: false,
        message: t(
          `必須指標を入力してください: ${missing.map((field) => field.label.ja).join(" / ")}`,
          `Enter required metrics: ${missing.map((field) => field.label.en).join(" / ")}`
        )
      };
    }

    return { ok: true, message: "" };
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
        ja: "流入が少ないため、検索面の新規KW追加とSNS再配信を優先候補にする。",
        en: "Traffic is low; consider new SEO keywords and social redistribution."
      });
    }
    if (ctr !== null && ctr < 1.5) {
      actions.push({
        ja: "CTRが低めのため、タイトル/サムネ/CTAを2案以上で検証する。",
        en: "CTR looks low; test at least two headline, thumbnail, or CTA variants."
      });
    }
    if (avgPosition !== null && avgPosition > 10) {
      actions.push({
        ja: "掲載順位が低めのため、H2構成と内部リンクを見直す。",
        en: "Average position looks weak; review H2 structure and internal links."
      });
    }
    if (activationRate !== null && activationRate < 20) {
      actions.push({
        ja: "アクティベーション率が低めのため、初回価値までの導線を短縮する。",
        en: "Activation looks low; shorten the path to first value."
      });
    }
    if (retentionRate !== null && retentionRate < 30) {
      actions.push({
        ja: "継続率が低めのため、1週間以内のリマインドと価値提示を見直す。",
        en: "Retention looks low; review reminders and value messaging within one week."
      });
    }
    if (churnRate !== null && churnRate > 5) {
      actions.push({
        ja: "解約率が高めのため、解約理由の確認と対策メールを検討する。",
        en: "Churn looks high; check churn reasons and consider mitigation emails."
      });
    }
    if (leads !== null && leads < 20) {
      actions.push({
        ja: "リードが少なめのため、LPの資料DL導線とCTA配置を見直す。",
        en: "Leads look low; review lead magnet CTA placement on the landing page."
      });
    }
    if (mql !== null && leads !== null && mql / Math.max(leads, 1) < 0.3) {
      actions.push({
        ja: "MQL比率が低めのため、スコアリング条件とセグメントを再確認する。",
        en: "MQL rate looks low; revisit scoring criteria and lead segmentation."
      });
    }
    if (pipeline !== null && pipeline < 5) {
      actions.push({
        ja: "商談化が少なめのため、既存リードへの再接触を検討する。",
        en: "Opportunities look low; consider re-engaging existing leads."
      });
    }
    if (revenue !== null && revenue < 100000) {
      actions.push({
        ja: "売上が小さい場合は、アップセル/バンドル提案の検証を候補にする。",
        en: "If revenue is still small, consider testing upsells or bundles."
      });
    }
    if (pieces !== null && pieces < 4) {
      actions.push({
        ja: "公開本数が少なめのため、週次の制作枠を確保する。",
        en: "Publishing volume looks low; secure weekly production slots."
      });
    }
    if (subscribers !== null && subscribers < 50) {
      actions.push({
        ja: "購読者増が鈍い場合は、記事内の登録CTAとオファーを見直す。",
        en: "If subscriber growth is slow, review in-article signup CTA and offer."
      });
    }

    const fallback = {
      seo: [
        { ja: "上位表示できているKWの共通点を抽出して次記事に反映する。", en: "Identify patterns in top-ranking keywords and apply them to the next articles." },
        { ja: "Search Consoleのクエリ別に改善対象をピックアップする。", en: "Review Search Console queries to select optimization targets." },
        { ja: "競合記事の構成を比較して不足セクションを補強する。", en: "Compare competitor outlines and add missing sections." }
      ],
      product: [
        { ja: "主要機能の利用頻度を分解してボトルネックを特定する。", en: "Break down feature usage to find activation bottlenecks." },
        { ja: "アクティブユーザーの定性ヒアリングを2件実施する。", en: "Run two qualitative interviews with active users." },
        { ja: "最初の成功体験までの導線を1画面で説明できる形にする。", en: "Make the path to first success explainable in one screen." }
      ],
      sales: [
        { ja: "失注理由を3件レビューして改善メッセージを準備する。", en: "Review three lost-deal reasons and update messaging." },
        { ja: "商談化率が高いチャネルを優先して投入する。", en: "Prioritize channels with higher opportunity conversion." },
        { ja: "導入事例を1本追加して信頼性を補強する。", en: "Add one case study to reinforce credibility." }
      ],
      content: [
        { ja: "反応が良い記事の構成をテンプレ化する。", en: "Template the structure of high-performing posts." },
        { ja: "配信チャネルごとのCTRを比較してリライト計画を立てる。", en: "Compare CTR by channel and plan rewrites." },
        { ja: "上位3記事に内部リンクを集中させて回遊を増やす。", en: "Add internal links to the top three posts to boost recirculation." }
      ]
    };

    const unique = [];
    [...actions, ...fallback[currentPreset]].forEach((item) => {
      if (!unique.some((existing) => existing.ja === item.ja)) unique.push(item);
    });

    return unique.slice(0, 5);
  };

  const buildLogForLang = (values, lang, options = {}) => {
    const date = new Date().toISOString().slice(0, 10);
    const preset = PRESETS[currentPreset];
    const metrics = preset.fields.map((field) => ({
      label: field.label[lang],
      value: formatValue(values[field.key])
    }));
    const hypothesis = values.hypothesis || "-";
    const learnings = values.learnings || "-";
    const notes = values.notes || "-";
    const nextActions = deriveNextActions(values);
    const mainAction = nextActions[0] || {
      ja: "次回の優先候補を1つ決めて実行する。",
      en: "Pick one priority candidate and execute it."
    };

    if (lang === "ja") {
      return `${options.example ? "# サンプル成長ログ" : `# 成長ログ（${preset.label.ja}）`}
更新日: ${date}

${anonToggle.checked ? "※数値は匿名化済みです。公開前に、必要に応じて丸める・伏せる・削除する確認をしてください。\n\n" : ""}## 仮説
- ${hypothesis}

## 結果
### ${preset.resultHeading.ja}
${metrics.map((item) => `- ${item.label}: ${item.value}`).join("\n")}

## 学び
- ${learnings}

## 次のアクション
${nextActions.map((item) => `- ${item.ja}`).join("\n")}
- **優先候補**: ${mainAction.ja}

## メモ
- ${notes}

## 注意
- Next actions は簡易ルールによる案です。業種、流入元、プロダクト段階、規模、計測条件によって適切な判断は変わります。
- 公開前に、売上、CV、DAU/WAU、広告指標、顧客情報、社内施策、競合上不利な情報が含まれていないか確認してください。`;
    }

    return `${options.example ? "# Sample Growth Log" : `# Growth Log (${preset.label.en})`}
Date: ${date}

${anonToggle.checked ? "Note: numbers have been anonymized. Before publishing, check whether values should be rounded, hidden, or removed.\n\n" : ""}## Hypothesis
- ${hypothesis}

## Result
### ${preset.resultHeading.en}
${metrics.map((item) => `- ${item.label}: ${item.value}`).join("\n")}

## Learnings
- ${learnings}

## Next actions
${nextActions.map((item) => `- ${item.en}`).join("\n")}
- **Priority candidate:** ${mainAction.en}

## Notes
- ${notes}

## Caution
- Next actions are simple rule-based suggestions. The right decision depends on industry, traffic source, product stage, scale, and measurement conditions.
- Before publishing, check for revenue, conversions, DAU/WAU, ad metrics, customer information, internal initiatives, or competitive information.`;
  };

  const buildLog = (values, options = {}) => {
    if (bilingualToggle.checked) {
      return `${buildLogForLang(values, "ja", options)}\n\n---\n\n${buildLogForLang(values, "en", options)}`;
    }
    return buildLogForLang(values, window.NW.getLang(), options);
  };

  const render = (source = null, options = {}) => {
    const values = getFieldValues(source);
    const validation = options.skipValidation ? { ok: true } : validateRequired(values);
    if (!validation.ok) {
      hasGenerated = false;
      lastText = "";
      lastWasExample = false;
      setInitialMessage();
      window.NW.showToast(validation.message);
      return;
    }

    lastText = buildLog(values, options);
    lastWasExample = !!options.example;
    hasGenerated = true;
    output.textContent = lastText;
    output.classList.remove("empty");
  };

  const requireGeneratedText = () => {
    if (!hasGenerated || !lastText.trim()) {
      showToast("先にログを生成してください。", "Generate a log first.");
      return null;
    }
    return lastText;
  };

  const getDateStamp = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const getOutputLangTag = () => bilingualToggle.checked ? "both" : window.NW.getLang();
  const getFileName = (ext) => {
    const suffix = lastWasExample ? "-sample" : "";
    return `growth-log-${currentPreset}-${getOutputLangTag()}-${getDateStamp()}${suffix}.${ext}`;
  };

  generateButton.addEventListener("click", () => {
    render();
  });

  copyButton.addEventListener("click", async () => {
    const text = requireGeneratedText();
    if (!text) return;
    const ok = await window.NW.copyToClipboard(text);
    showToast(ok ? "コピーしました。" : "コピーに失敗しました。", ok ? "Copied." : "Copy failed.");
  });

  downloadMdButton.addEventListener("click", () => {
    const text = requireGeneratedText();
    if (!text) return;
    window.NW.downloadText(getFileName("md"), text, "text/markdown;charset=utf-8");
    showToast("Markdownを保存しました。", "Markdown saved.");
  });

  downloadTxtButton.addEventListener("click", () => {
    const text = requireGeneratedText();
    if (!text) return;
    window.NW.downloadText(getFileName("txt"), text);
    showToast("TXTを保存しました。", "TXT saved.");
  });

  presetSelect.addEventListener("change", (event) => {
    currentPreset = event.target.value;
    hasGenerated = false;
    lastText = "";
    lastWasExample = false;
    renderPresetFields();
    setInitialMessage();
  });

  insertExampleButton.addEventListener("click", () => {
    const example = {
      ...PRESETS[currentPreset].example,
      hypothesis: t("CTA文言変更でクリック率が上がるはず。", "Changing CTA copy may increase click-through rate."),
      learnings: t("比較軸を明示するとクリックが増えた。", "Clear comparison points increased clicks."),
      notes: t("同日のSNS投稿もクリック増に寄与。", "Same-day social posting may also have contributed.")
    };

    Object.entries(example).forEach(([key, value]) => {
      const input = root.querySelector(`#field-${key}`);
      if (input) input.value = value;
    });
    hypothesisInput.value = example.hypothesis;
    learningsInput.value = example.learnings;
    notesInput.value = example.notes;
    hasGenerated = false;
    lastText = "";
    lastWasExample = false;
    setInitialMessage();
    showToast("サンプル値を入力しました。ログ生成を押してください。", "Sample values inserted. Press Generate log.");
  });

  exampleOnlyButton.addEventListener("click", () => {
    const example = {
      ...PRESETS[currentPreset].example,
      hypothesis: t("見出し改善でCTRが上がるはず。", "Improving headlines may increase CTR."),
      learnings: t("比較表を追加すると滞在時間が伸びた。", "Adding comparison tables increased time on page."),
      notes: t("来週はFAQセクションも追加する。", "Next week, add an FAQ section as well.")
    };
    render(example, { example: true, skipValidation: true });
    showToast("サンプルログを生成しました。", "Sample log generated.");
  });

  bilingualToggle.addEventListener("change", () => {
    if (hasGenerated) render(null, { example: lastWasExample, skipValidation: false });
  });

  anonToggle.addEventListener("change", () => {
    if (hasGenerated) render(null, { example: lastWasExample, skipValidation: false });
  });

  document.addEventListener("nw:langchange", () => {
    updatePlaceholders();
    if (hasGenerated && !bilingualToggle.checked) {
      render(null, { example: lastWasExample, skipValidation: false });
    } else if (!hasGenerated) {
      setInitialMessage();
    }
  });

  renderPresetFields();
  setInitialMessage();
};

document.addEventListener("DOMContentLoaded", initGrowthLog);
