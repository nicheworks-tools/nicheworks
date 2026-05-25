(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));
  const exampleNodes = () => Array.from(document.querySelectorAll("[data-example-ja][data-example-en]"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    exampleNodes().forEach((el) => {
      const example = lang === "ja" ? el.dataset.exampleJa : el.dataset.exampleEn;
      const label = lang === "ja" ? el.dataset.labelJa : el.dataset.labelEn;
      if (example) el.placeholder = example;
      if (label) el.setAttribute("aria-label", label);
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

  const copyToClipboard = async (text) => {
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
      try {
        return document.execCommand("copy");
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const downloadText = (filename, text, mime = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  window.NW = { applyLang, copyToClipboard, downloadText };

  document.addEventListener("DOMContentLoaded", initLang);
})();

(() => {
  "use strict";

  const REQUIRED_OUTPUT_JA = "入力後にチェックしてください。";
  const REQUIRED_OUTPUT_EN = "Enter values and click Check.";
  const STALE_OUTPUT_JA = "入力が変更されました。再チェックしてください。\n前回結果は古くなったため、再チェックするまでコピー/保存できません。";
  const STALE_OUTPUT_EN = "Inputs have changed. Run Check again.\nThe previous result is outdated, so copy/export is disabled until you re-check.";
  const NOTICE_JA = "この結果は一般的な家計整理の目安です。金融助言、投資助言、税務助言、債務整理、保険見直し、生活設計の専門判断ではありません。重要な判断は専門家や公式情報を確認してください。";
  const NOTICE_EN = "This result is a general household budget organization reference. It is not financial, investment, tax, debt, insurance, or life-planning advice. Check official information or consult a qualified professional for important decisions.";
  const MAX_AMOUNT = 999999999;

  const money = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  });

  const formatYen = (value) => money.format(Math.round(value));

  const getLang = () => (document.documentElement.lang === "en" ? "en" : "ja");

  const todayStamp = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const generatedAt = () => new Date().toISOString();

  const showToast = (message) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const parseMoneyInput = (el, label, required) => {
    const raw = String(el.value || "").trim();
    if (raw === "") {
      if (required) return { ok: false, value: 0, error: `${label}: 未入力です。` };
      return { ok: true, value: 0, empty: true };
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, value: 0, error: `${label}: 数値を入力してください。` };
    if (value < 0) return { ok: false, value: 0, error: `${label}: 負数は使えません。` };
    if (value > MAX_AMOUNT) return { ok: false, value: 0, error: `${label}: ${MAX_AMOUNT.toLocaleString("ja-JP")}円以下で入力してください。` };
    return { ok: true, value };
  };

  const parseMoneyInputEn = (el, label, required) => {
    const raw = String(el.value || "").trim();
    if (raw === "") {
      if (required) return { ok: false, value: 0, error: `${label}: required.` };
      return { ok: true, value: 0, empty: true };
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, value: 0, error: `${label}: enter a number.` };
    if (value < 0) return { ok: false, value: 0, error: `${label}: negative values are not allowed.` };
    if (value > MAX_AMOUNT) return { ok: false, value: 0, error: `${label}: enter ${MAX_AMOUNT.toLocaleString("en-US")} JPY or less.` };
    return { ok: true, value };
  };

  const buildWarnings = (lang, summary) => {
    const warnings = [];
    if (summary.remaining < 0) {
      warnings.push(lang === "ja" ? "支出と貯蓄目標の合計が月収を超えています。" : "Expenses plus savings target exceed income.");
    }
    if (!summary.canJudgeRatios) {
      warnings.push(lang === "ja"
        ? "収入が0のため割合判定はできません。残額の確認のみ行ってください。"
        : "Income is 0, so percentage-based checks are unavailable. Use the remaining balance check only.");
    }
    if (summary.canJudgeRatios && summary.fixedRatio > 0.6) {
      warnings.push(lang === "ja" ? "固定費が月収の60%を超えています。見直し候補を確認してください。" : "Fixed costs exceed 60% of income. Review possible reductions.");
    }
    if (summary.canJudgeRatios && summary.variableRatio > 0.5) {
      warnings.push(lang === "ja" ? "変動費が月収の50%を超えています。月ごとの上限設定を検討してください。" : "Variable costs exceed 50% of income. Consider setting a monthly cap.");
    }
    if (summary.canJudgeRatios && summary.savings > 0 && summary.savingsRatio > 0.3) {
      warnings.push(lang === "ja" ? "貯蓄目標が月収の30%を超えています。生活費とのバランスを確認してください。" : "Savings target exceeds 30% of income. Check the balance with living costs.");
    }
    if (summary.optionalEmpty.length > 0) {
      warnings.push(lang === "ja"
        ? `未入力の任意項目があります: ${summary.optionalEmpty.join("、")}`
        : `Some optional fields are blank: ${summary.optionalEmpty.join(", ")}`);
    }
    return warnings;
  };

  const checklistItems = {
    ja: [
      "家賃/住宅ローン",
      "光熱費",
      "通信費",
      "保険",
      "食費",
      "日用品",
      "交通費",
      "医療費",
      "教育費",
      "サブスク",
      "年払い/更新費",
      "借入返済",
      "予備費",
      "冠婚葬祭",
      "家電/修繕積立"
    ],
    en: [
      "Rent/Mortgage",
      "Utilities",
      "Phone/Internet",
      "Insurance",
      "Food",
      "Household goods",
      "Transportation",
      "Medical costs",
      "Education",
      "Subscriptions",
      "Annual renewals",
      "Debt repayments",
      "Emergency buffer",
      "Ceremonies/Gifts",
      "Appliance/Repair reserve"
    ]
  };

  const buildChecklist = (lang) => checklistItems[lang].map((item, idx) => `- ${idx + 1}. ${item}`).join("\n");
  const ratioText = (lang, summary, ratio) => summary.canJudgeRatios
    ? `${Math.round(ratio * 100)}%`
    : (lang === "ja" ? "割合判定不可" : "N/A for 0 income");

  const buildOutput = (lang, summary) => {
    const lines = [];
    lines.push(lang === "ja" ? "■ 概要" : "■ Summary");
    lines.push(`${lang === "ja" ? "生成日時" : "Generated at"}: ${summary.generatedAt}`);
    lines.push(`${lang === "ja" ? "通貨" : "Currency"}: JPY`);
    lines.push(`${lang === "ja" ? "月収" : "Income"}: ${formatYen(summary.income)}`);
    lines.push(`${lang === "ja" ? "固定費" : "Fixed costs"}: ${formatYen(summary.fixed)} (${ratioText(lang, summary, summary.fixedRatio)})`);
    lines.push(`${lang === "ja" ? "変動費" : "Variable costs"}: ${formatYen(summary.variable)} (${ratioText(lang, summary, summary.variableRatio)})`);
    lines.push(`${lang === "ja" ? "貯蓄目標" : "Savings target"}: ${formatYen(summary.savings)} (${ratioText(lang, summary, summary.savingsRatio)})`);
    lines.push(`${lang === "ja" ? "残り" : "Remaining"}: ${formatYen(summary.remaining)}`);
    lines.push("");
    lines.push(lang === "ja" ? "■ 注意ポイント" : "■ Warnings");
    if (summary.warnings.length === 0) {
      lines.push(lang === "ja" ? "- 大きな警告はありません。" : "- No major warning detected.");
    } else {
      summary.warnings.forEach((warning) => lines.push(`- ${warning}`));
    }
    lines.push("");
    lines.push(lang === "ja" ? "■ 参考基準" : "■ Reference thresholds");
    lines.push(lang === "ja"
      ? "- 固定費60%超、変動費50%超、貯蓄目標30%超を目安として表示しています。月収0円では割合判定はできません。地域、家族構成、住宅費、医療費、借入状況により適切な割合は変わります。"
      : "- Fixed costs over 60%, variable costs over 50%, and savings targets over 30% are broad reference thresholds. Percentage checks are unavailable when income is 0. Suitable ratios vary by location, household, housing, medical costs, and debt.");
    lines.push("");
    lines.push(lang === "ja" ? "■ 抜けチェックリスト" : "■ Missing item checklist");
    lines.push(buildChecklist(lang));
    lines.push("");
    lines.push(lang === "ja" ? `※${NOTICE_JA}` : `Note: ${NOTICE_EN}`);
    return lines.join("\n");
  };

  const buildTemplatePack = (lang, summary) => {
    if (lang === "ja") {
      return [
        "# 家計テンプレ（簡易）",
        "",
        "## メタ情報",
        `- generated_at: ${summary.generatedAt}`,
        "- language: ja",
        "- currency: JPY",
        `- not_advice: ${NOTICE_JA}`,
        "",
        "## 入力サマリー",
        `- 月収: ${formatYen(summary.income)}`,
        `- 固定費合計: ${formatYen(summary.fixed)} (${ratioText("ja", summary, summary.fixedRatio)})`,
        `- 変動費合計: ${formatYen(summary.variable)} (${ratioText("ja", summary, summary.variableRatio)})`,
        `- 貯蓄目標: ${formatYen(summary.savings)} (${ratioText("ja", summary, summary.savingsRatio)})`,
        `- 残り: ${formatYen(summary.remaining)}`,
        "",
        "## 支出カテゴリ",
        buildChecklist("ja"),
        "",
        "## 参考基準",
        "- 固定費60%超、変動費50%超、貯蓄目標30%超は一般的な目安です。",
        "- 月収0円では割合判定はできません。",
        "- 地域、家族構成、住宅費、医療費、借入、扶養状況により適切な割合は変わります。",
        "",
        "## 重要な注意",
        NOTICE_JA
      ].join("\n");
    }
    return [
      "# Budget Template (Simple)",
      "",
      "## Metadata",
      `- generated_at: ${summary.generatedAt}`,
      "- language: en",
      "- currency: JPY",
      `- not_advice: ${NOTICE_EN}`,
      "",
      "## Input summary",
      `- Income: ${formatYen(summary.income)}`,
      `- Fixed costs: ${formatYen(summary.fixed)} (${ratioText("en", summary, summary.fixedRatio)})`,
      `- Variable costs: ${formatYen(summary.variable)} (${ratioText("en", summary, summary.variableRatio)})`,
      `- Savings target: ${formatYen(summary.savings)} (${ratioText("en", summary, summary.savingsRatio)})`,
      `- Remaining: ${formatYen(summary.remaining)}`,
      "",
      "## Spending categories",
      buildChecklist("en"),
      "",
      "## Reference thresholds",
      "- Fixed costs over 60%, variable costs over 50%, and savings targets over 30% are broad reference thresholds.",
      "- Percentage checks are unavailable when income is 0.",
      "- Suitable ratios vary by location, household, housing costs, medical costs, debt, and dependents.",
      "",
      "## Important notice",
      NOTICE_EN
    ].join("\n");
  };

  const buildCsvPack = (lang, summary) => {
    const rows = lang === "ja"
      ? [
        ["meta", "generated_at", summary.generatedAt],
        ["meta", "language", "ja"],
        ["meta", "currency", "JPY"],
        ["meta", "not_advice", NOTICE_JA],
        [],
        ["カテゴリ", "金額", "メモ"],
        ["月収", summary.income, "手取り月収"],
        ["固定費", summary.fixed, `家賃・通信費・保険など / ${ratioText("ja", summary, summary.fixedRatio)}`],
        ["変動費", summary.variable, `食費・日用品・交通費など / ${ratioText("ja", summary, summary.variableRatio)}`],
        ["貯蓄目標", summary.savings, `任意 / ${ratioText("ja", summary, summary.savingsRatio)}`],
        ["残り", summary.remaining, "月収 - 固定費 - 変動費 - 貯蓄目標"],
        ...checklistItems.ja.map((item) => [item, "", "抜けチェック"]),
        ["注意", "", NOTICE_JA]
      ]
      : [
        ["meta", "generated_at", summary.generatedAt],
        ["meta", "language", "en"],
        ["meta", "currency", "JPY"],
        ["meta", "not_advice", NOTICE_EN],
        [],
        ["Category", "Amount", "Note"],
        ["Income", summary.income, "Net monthly income"],
        ["Fixed costs", summary.fixed, `Rent, phone, insurance, etc. / ${ratioText("en", summary, summary.fixedRatio)}`],
        ["Variable costs", summary.variable, `Food, household goods, transportation, etc. / ${ratioText("en", summary, summary.variableRatio)}`],
        ["Savings target", summary.savings, `Optional / ${ratioText("en", summary, summary.savingsRatio)}`],
        ["Remaining", summary.remaining, "Income - fixed - variable - savings"],
        ...checklistItems.en.map((item) => [item, "", "Missing item check"]),
        ["Notice", "", NOTICE_EN]
      ];
    return "\ufeff" + rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  };

  const initTool = () => {
    const els = {
      income: document.getElementById("income"),
      fixed: document.getElementById("fixed"),
      variable: document.getElementById("variable"),
      savings: document.getElementById("savings"),
      out: document.getElementById("output"),
      btnCheck: document.getElementById("btnCheck"),
      btnCopy: document.getElementById("btnCopy"),
      btnDownloadMd: document.getElementById("btnDownloadMd"),
      btnDownloadCsv: document.getElementById("btnDownloadCsv")
    };

    let hasChecked = false;
    let isStale = false;
    let latestSummary = null;

    const setInitialOutput = () => {
      els.out.textContent = getLang() === "ja" ? REQUIRED_OUTPUT_JA : REQUIRED_OUTPUT_EN;
    };

    const setStaleOutput = () => {
      els.out.textContent = getLang() === "ja" ? STALE_OUTPUT_JA : STALE_OUTPUT_EN;
    };

    const readSummary = () => {
      const lang = getLang();
      const parser = lang === "ja" ? parseMoneyInput : parseMoneyInputEn;
      const labels = lang === "ja"
        ? { income: "月収", fixed: "固定費", variable: "変動費", savings: "貯蓄目標" }
        : { income: "Income", fixed: "Fixed costs", variable: "Variable costs", savings: "Savings target" };
      const income = parser(els.income, labels.income, true);
      const fixed = parser(els.fixed, labels.fixed, false);
      const variable = parser(els.variable, labels.variable, false);
      const savings = parser(els.savings, labels.savings, false);
      const results = { income, fixed, variable, savings };
      const errors = Object.values(results).filter((r) => !r.ok).map((r) => r.error);
      if (errors.length > 0) return { ok: false, errors };

      const optionalEmpty = [];
      if (fixed.empty) optionalEmpty.push(labels.fixed);
      if (variable.empty) optionalEmpty.push(labels.variable);
      if (savings.empty) optionalEmpty.push(labels.savings);

      const summary = {
        generatedAt: generatedAt(),
        income: income.value,
        fixed: fixed.value,
        variable: variable.value,
        savings: savings.value,
        optionalEmpty
      };
      summary.total = summary.fixed + summary.variable + summary.savings;
      summary.remaining = summary.income - summary.total;
      summary.canJudgeRatios = summary.income > 0;
      summary.fixedRatio = summary.canJudgeRatios ? summary.fixed / summary.income : 0;
      summary.variableRatio = summary.canJudgeRatios ? summary.variable / summary.income : 0;
      summary.savingsRatio = summary.canJudgeRatios ? summary.savings / summary.income : 0;
      summary.warnings = buildWarnings(lang, summary);
      return { ok: true, summary };
    };

    const render = () => {
      const lang = getLang();
      const read = readSummary();
      if (!read.ok) {
        latestSummary = null;
        hasChecked = false;
        isStale = false;
        els.out.textContent = read.errors.map((error) => `- ${error}`).join("\n");
        showToast(lang === "ja" ? "入力内容を確認してください。" : "Check the input values.");
        return;
      }
      latestSummary = read.summary;
      hasChecked = true;
      isStale = false;
      els.out.textContent = buildOutput(lang, latestSummary);
    };

    const requireChecked = () => {
      const lang = getLang();
      if (isStale) {
        setStaleOutput();
        showToast(lang === "ja" ? "再チェックしてください。" : "Run Check again.");
        return false;
      }
      if (!hasChecked || !latestSummary) {
        showToast(lang === "ja" ? "先にチェックしてください。" : "Run Check first.");
        return false;
      }
      return true;
    };

    els.btnCheck.addEventListener("click", render);
    els.btnCopy.addEventListener("click", async () => {
      if (!requireChecked()) return;
      const ok = await window.NW.copyToClipboard(els.out.textContent.trim());
      showToast(ok
        ? (getLang() === "ja" ? "コピーしました。" : "Copied.")
        : (getLang() === "ja" ? "コピーに失敗しました。" : "Copy failed."));
    });
    els.btnDownloadMd.addEventListener("click", () => {
      if (!requireChecked()) return;
      const lang = getLang();
      window.NW.downloadText(`money-template-${lang}-${todayStamp()}.md`, buildTemplatePack(lang, latestSummary), "text/markdown;charset=utf-8");
      showToast(lang === "ja" ? "MDを保存しました。" : "Markdown saved.");
    });
    els.btnDownloadCsv.addEventListener("click", () => {
      if (!requireChecked()) return;
      const lang = getLang();
      window.NW.downloadText(`money-template-${lang}-${todayStamp()}.csv`, buildCsvPack(lang, latestSummary), "text/csv;charset=utf-8");
      showToast(lang === "ja" ? "CSVを保存しました。" : "CSV saved.");
    });

    langButtons().forEach((btn) => btn.addEventListener("click", () => {
      if (hasChecked && latestSummary && !isStale) {
        els.out.textContent = buildOutput(getLang(), latestSummary);
      } else if (isStale) {
        setStaleOutput();
      } else {
        setInitialOutput();
      }
    }));

    [els.income, els.fixed, els.variable, els.savings].forEach((el) => {
      el.addEventListener("input", () => {
        if (!hasChecked && !latestSummary) return;
        hasChecked = false;
        isStale = true;
        latestSummary = null;
        setStaleOutput();
      });
    });

    setInitialOutput();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
