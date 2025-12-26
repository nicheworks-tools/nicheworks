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

(() => {
  "use strict";

  const num = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatYen = (value) => {
    return `${Math.round(value).toLocaleString("ja-JP")}円`;
  };

  const buildChecklist = (lang, summary) => {
    const base = lang === "ja"
      ? [
        "家賃/住宅ローン",
        "通信費/サブスク",
        "保険料",
        "食費/日用品",
        "交通/移動費",
        "予備費（突発支出）"
      ]
      : [
        "Rent/Mortgage",
        "Utilities & subscriptions",
        "Insurance",
        "Food & household",
        "Transportation",
        "Buffer for unexpected costs"
      ];

    const extra = lang === "ja"
      ? [
        "教育・学習費",
        "医療費の積立",
        "年間支出（税・更新費）",
        "貯蓄・投資の自動積立"
      ]
      : [
        "Education & learning",
        "Medical reserve",
        "Annual bills & taxes",
        "Automated savings/investments"
      ];

    const list = summary.hasPro ? base.concat(extra) : base;
    return list.map((item, idx) => `- ${idx + 1}. ${item}`).join("\n");
  };

  const buildOutput = (lang, summary) => {
    const lines = [];
    lines.push(lang === "ja" ? "■ 概要" : "■ Summary");
    lines.push(`${lang === "ja" ? "月収" : "Income"}: ${formatYen(summary.income)}`);
    lines.push(`${lang === "ja" ? "固定費" : "Fixed"}: ${formatYen(summary.fixed)}`);
    lines.push(`${lang === "ja" ? "変動費" : "Variable"}: ${formatYen(summary.variable)}`);
    if (summary.savings > 0) {
      lines.push(`${lang === "ja" ? "貯蓄目標" : "Savings"}: ${formatYen(summary.savings)}`);
    }
    lines.push(`${lang === "ja" ? "残り" : "Remaining"}: ${formatYen(summary.remaining)}`);

    lines.push("-");
    lines.push(lang === "ja" ? "■ 注意ポイント" : "■ Warnings");
    if (summary.warnings.length === 0) {
      lines.push(lang === "ja" ? "- 大きな警告はありません。" : "- No major warnings detected.");
    } else {
      summary.warnings.forEach((w) => lines.push(`- ${w}`));
    }

    lines.push("-");
    lines.push(lang === "ja" ? "■ 抜けチェックリスト" : "■ Missing item checklist");
    lines.push(buildChecklist(lang, summary));

    return lines.join("\n");
  };

  const buildWarnings = (lang, summary) => {
    const warnings = [];
    if (summary.remaining < 0) {
      warnings.push(lang === "ja" ? "支出が収入を超えています。" : "Expenses exceed income.");
    }
    if (summary.fixedRatio > 0.6) {
      warnings.push(lang === "ja" ? "固定費が高めです。見直し余地あり。" : "Fixed costs are high; consider trimming." );
    }
    if (summary.savings > 0 && summary.savingsRatio > 0.3) {
      warnings.push(lang === "ja" ? "貯蓄目標が高めです。生活費とバランス確認を。" : "Savings target may be aggressive; review balance.");
    }
    if (summary.variableRatio > 0.5) {
      warnings.push(lang === "ja" ? "変動費の割合が高めです。上限設定を。" : "Variable costs are high; set a cap.");
    }
    return warnings;
  };

  const buildTemplatePack = (lang, summary) => {
    if (lang === "ja") {
      return `# 家計テンプレ（簡易）\n\n- 月収: ${formatYen(summary.income)}\n- 固定費合計: ${formatYen(summary.fixed)}\n- 変動費合計: ${formatYen(summary.variable)}\n- 貯蓄目標: ${formatYen(summary.savings)}\n- 残り: ${formatYen(summary.remaining)}\n\n## 使い方\n1. 固定費/変動費/貯蓄の上限を決める\n2. 毎週の支出を記録する\n3. 残りがマイナスにならない範囲で調整する\n`;
    }
    return `# Budget Template (Simple)\n\n- Income: ${formatYen(summary.income)}\n- Fixed costs: ${formatYen(summary.fixed)}\n- Variable costs: ${formatYen(summary.variable)}\n- Savings target: ${formatYen(summary.savings)}\n- Remaining: ${formatYen(summary.remaining)}\n\n## How to use\n1. Set caps for fixed/variable/savings\n2. Track spending weekly\n3. Adjust to keep remaining non-negative\n`;
  };

  const buildCsvPack = (summary) => {
    return [
      "Category,Amount",
      `Income,${summary.income}`,
      `Fixed,${summary.fixed}`,
      `Variable,${summary.variable}`,
      `Savings,${summary.savings}`,
      `Remaining,${summary.remaining}`
    ].join("\n");
  };

  const initTool = () => {
    const income = document.getElementById("income");
    const fixed = document.getElementById("fixed");
    const variable = document.getElementById("variable");
    const savings = document.getElementById("savings");
    const out = document.getElementById("output");
    const btnCheck = document.getElementById("btnCheck");
    const btnCopy = document.getElementById("btnCopy");
    const proBox = document.getElementById("proBox");
    const btnDownloadMd = document.getElementById("btnDownloadMd");
    const btnDownloadCsv = document.getElementById("btnDownloadCsv");
    const langButtons = Array.from(document.querySelectorAll(".nw-lang-switch button"));

    const render = () => {
      const summary = {
        income: num(income.value),
        fixed: num(fixed.value),
        variable: num(variable.value),
        savings: num(savings.value),
        hasPro: window.NW.hasPro()
      };
      summary.total = summary.fixed + summary.variable + summary.savings;
      summary.remaining = summary.income - summary.total;
      summary.fixedRatio = summary.income ? summary.fixed / summary.income : 0;
      summary.variableRatio = summary.income ? summary.variable / summary.income : 0;
      summary.savingsRatio = summary.income ? summary.savings / summary.income : 0;
      summary.warnings = buildWarnings(document.documentElement.lang || "ja", summary);

      out.textContent = buildOutput(document.documentElement.lang || "ja", summary);
      proBox.style.display = summary.hasPro ? "" : "none";

      btnDownloadMd.onclick = () => {
        const lang = document.documentElement.lang || "ja";
        const text = buildTemplatePack(lang, summary);
        window.NW.downloadText(`money-template-${lang}.md`, text);
      };
      btnDownloadCsv.onclick = () => {
        const text = buildCsvPack(summary);
        window.NW.downloadText("money-template.csv", text);
      };
    };

    btnCheck.addEventListener("click", render);
    btnCopy.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(out.textContent.trim());
      if (ok) btnCopy.classList.add("primary");
      setTimeout(() => btnCopy.classList.remove("primary"), 600);
    });
    langButtons.forEach((btn) => btn.addEventListener("click", render));

    render();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
