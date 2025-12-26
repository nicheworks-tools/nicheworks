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

  const buildJa = (data) => {
    return [
      "■ 週次レポート",
      "【KPI】",
      data.kpi || "(未記入)",
      "",
      "【変化点】",
      data.changes || "(未記入)",
      "",
      "【結果/影響】",
      data.results || "(未記入)",
      "",
      "【次アクション】",
      data.nextActions || "(未記入)",
      "",
      "補足事項があれば追記してください。"
    ].join("\n");
  };

  const buildEn = (data) => {
    return [
      "■ Weekly Ops Report",
      "[KPI]",
      data.kpi || "(blank)",
      "",
      "[What changed]",
      data.changes || "(blank)",
      "",
      "[Results/Impact]",
      data.results || "(blank)",
      "",
      "[Next actions]",
      data.nextActions || "(blank)",
      "",
      "Add notes if needed."
    ].join("\n");
  };

  const initTool = () => {
    const kpi = document.getElementById("kpi");
    const changes = document.getElementById("changes");
    const results = document.getElementById("results");
    const nextActions = document.getElementById("nextActions");
    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const btnBuild = document.getElementById("btnBuild");
    const btnCopyJa = document.getElementById("btnCopyJa");
    const btnCopyEn = document.getElementById("btnCopyEn");

    const render = () => {
      const data = {
        kpi: kpi.value.trim(),
        changes: changes.value.trim(),
        results: results.value.trim(),
        nextActions: nextActions.value.trim()
      };
      outputJa.textContent = buildJa(data);
      outputEn.textContent = buildEn(data);
    };

    btnBuild.addEventListener("click", render);
    btnCopyJa.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(outputJa.textContent.trim());
      if (ok) btnCopyJa.classList.add("primary");
      setTimeout(() => btnCopyJa.classList.remove("primary"), 600);
    });
    btnCopyEn.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(outputEn.textContent.trim());
      if (ok) btnCopyEn.classList.add("primary");
      setTimeout(() => btnCopyEn.classList.remove("primary"), 600);
    });

    render();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
