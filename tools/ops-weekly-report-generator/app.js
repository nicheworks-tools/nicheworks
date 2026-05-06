(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getCurrentLang = () => document.documentElement.lang === "en" ? "en" : "ja";

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    const nextLang = lang === "en" ? "en" : "ja";
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === nextLang ? "" : "none";
    });
    langButtons().forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === nextLang);
    });
    document.documentElement.lang = nextLang;
    try { localStorage.setItem("nw_lang", nextLang); } catch (_) {}
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

  const showToast = (messageJa, messageEn) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = getCurrentLang() === "en" ? messageEn : messageJa;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch (error) {
        return false;
      } finally {
        textarea.remove();
      }
    }
  };

  const downloadText = (filename, text, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const valueOf = (id) => (document.getElementById(id)?.value || "").trim();

  const collectData = () => ({
    period: valueOf("period"),
    team: valueOf("team"),
    kpi: valueOf("kpi"),
    changes: valueOf("changes"),
    results: valueOf("results"),
    goodThings: valueOf("goodThings"),
    risks: valueOf("risks"),
    openItems: valueOf("openItems"),
    nextActions: valueOf("nextActions"),
    focusNext: valueOf("focusNext"),
    decisions: valueOf("decisions")
  });

  const hasBodyInput = (data) => [
    data.kpi,
    data.changes,
    data.results,
    data.goodThings,
    data.risks,
    data.openItems,
    data.nextActions,
    data.focusNext,
    data.decisions
  ].some(Boolean);

  const addSection = (lines, title, body) => {
    if (!body) return;
    if (lines.length > 0) lines.push("");
    lines.push(title, body);
  };

  const buildJa = (data) => {
    const lines = ["# 週次運用レポート"];
    addSection(lines, "## 対象期間", data.period);
    addSection(lines, "## 担当/チーム", data.team);
    addSection(lines, "## 週次サマリー", makeSummaryJa(data));
    addSection(lines, "## KPI", data.kpi);
    addSection(lines, "## 変化点", data.changes);
    addSection(lines, "## 結果/影響", data.results);
    addSection(lines, "## 良かったこと", data.goodThings);
    addSection(lines, "## 問題/リスク", data.risks);
    addSection(lines, "## 未解決事項", data.openItems);
    addSection(lines, "## 次アクション", data.nextActions);
    addSection(lines, "## 来週の重点", data.focusNext);
    addSection(lines, "## 判断が必要なこと", data.decisions);
    lines.push("", "※数値は確定値/暫定値を確認し、必要に応じて社外秘情報を伏せてください。");
    return lines.join("\n");
  };

  const buildEn = (data) => {
    const lines = ["# Weekly Ops Report"];
    addSection(lines, "## Report period", data.period);
    addSection(lines, "## Owner / team", data.team);
    addSection(lines, "## Weekly summary", makeSummaryEn(data));
    addSection(lines, "## KPI", data.kpi);
    addSection(lines, "## What changed", data.changes);
    addSection(lines, "## Results / impact", data.results);
    addSection(lines, "## Wins", data.goodThings);
    addSection(lines, "## Issues / risks", data.risks);
    addSection(lines, "## Open items", data.openItems);
    addSection(lines, "## Next actions", data.nextActions);
    addSection(lines, "## Focus for next week", data.focusNext);
    addSection(lines, "## Decisions needed", data.decisions);
    lines.push("", "Note: Confirm whether figures are final or provisional, and mask confidential information as needed.");
    return lines.join("\n");
  };

  const makeSummaryJa = (data) => {
    const parts = [];
    if (data.results) parts.push("今週の主な結果/影響を確認しました。");
    if (data.kpi) parts.push("KPIは記載値を前提に整理しています。");
    if (data.risks) parts.push("問題/リスクがあるため、継続確認が必要です。");
    if (data.nextActions || data.focusNext) parts.push("次アクションと来週の重点を明確化しました。");
    if (parts.length === 0) return "入力内容をもとに週次状況を整理しました。";
    return parts.join(" ");
  };

  const makeSummaryEn = (data) => {
    const parts = [];
    if (data.results) parts.push("This week’s main results and impact have been reviewed.");
    if (data.kpi) parts.push("KPIs are summarized based on the entered figures.");
    if (data.risks) parts.push("Issues or risks require continued follow-up.");
    if (data.nextActions || data.focusNext) parts.push("Next actions and next week’s focus have been clarified.");
    if (parts.length === 0) return "The weekly status has been organized based on the entered information.";
    return parts.join(" ");
  };

  const fileDate = () => new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const initTool = () => {
    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const btnBuild = document.getElementById("btnBuild");
    const btnCopyJa = document.getElementById("btnCopyJa");
    const btnCopyEn = document.getElementById("btnCopyEn");
    const btnSaveJa = document.getElementById("btnSaveJa");
    const btnSaveEn = document.getElementById("btnSaveEn");
    const btnSaveMd = document.getElementById("btnSaveMd");
    const gatedButtons = [btnCopyJa, btnCopyEn, btnSaveJa, btnSaveEn, btnSaveMd].filter(Boolean);
    let hasGenerated = false;
    let lastJa = "";
    let lastEn = "";

    const setGenerated = (enabled) => {
      hasGenerated = enabled;
      gatedButtons.forEach((button) => { button.disabled = !enabled; });
    };

    const requireGenerated = () => {
      if (hasGenerated) return true;
      showToast("先にレポートを生成してください。", "Generate a report first.");
      return false;
    };

    btnBuild.addEventListener("click", () => {
      const data = collectData();
      if (!data.period) {
        showToast("対象期間を入力してください。", "Enter the report period.");
        return;
      }
      if (!hasBodyInput(data)) {
        showToast("KPI、結果、次アクション、リスクなどを1つ以上入力してください。", "Enter at least one KPI, result, next action, risk, or related field.");
        return;
      }
      lastJa = buildJa(data);
      lastEn = buildEn(data);
      outputJa.textContent = lastJa;
      outputEn.textContent = lastEn;
      setGenerated(true);
      showToast("レポートを生成しました。", "Report generated.");
    });

    btnCopyJa.addEventListener("click", async () => {
      if (!requireGenerated()) return;
      const ok = await copyToClipboard(lastJa);
      showToast(ok ? "コピーしました。" : "コピーに失敗しました。", ok ? "Copied." : "Copy failed.");
    });

    btnCopyEn.addEventListener("click", async () => {
      if (!requireGenerated()) return;
      const ok = await copyToClipboard(lastEn);
      showToast(ok ? "コピーしました。" : "コピーに失敗しました。", ok ? "Copied." : "Copy failed.");
    });

    btnSaveJa.addEventListener("click", () => {
      if (!requireGenerated()) return;
      downloadText(`ops-weekly-report-ja-${fileDate()}.txt`, lastJa);
      showToast("JP TXTを保存しました。", "JP TXT saved.");
    });

    btnSaveEn.addEventListener("click", () => {
      if (!requireGenerated()) return;
      downloadText(`ops-weekly-report-en-${fileDate()}.txt`, lastEn);
      showToast("EN TXTを保存しました。", "EN TXT saved.");
    });

    btnSaveMd.addEventListener("click", () => {
      if (!requireGenerated()) return;
      const markdown = `${lastJa}\n\n---\n\n${lastEn}\n`;
      downloadText(`ops-weekly-report-${fileDate()}.md`, markdown, "text/markdown;charset=utf-8");
      showToast("Markdownを保存しました。", "Markdown saved.");
    });

    setGenerated(false);
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
