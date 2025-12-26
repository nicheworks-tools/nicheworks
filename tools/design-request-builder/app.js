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
      "■ デザイン依頼概要",
      `目的: ${data.purpose || "(未記入)"}`,
      `サイズ/仕様: ${data.size || "(未記入)"}`,
      `納期: ${data.deadline || "(未記入)"}`,
      "",
      "■ 参考/素材",
      data.references || "(未記入)",
      "",
      "■ 必須要素",
      data.mustHave || "(未記入)",
      "",
      "■ 避けたい表現",
      data.avoid || "(未記入)",
      "",
      "納品形式や確認フローは別途相談でお願いします。"
    ].join("\n");
  };

  const buildEn = (data) => {
    return [
      "■ Design Request Brief",
      `Purpose: ${data.purpose || "(blank)"}`,
      `Size/Specs: ${data.size || "(blank)"}`,
      `Deadline: ${data.deadline || "(blank)"}`,
      "",
      "■ References/Assets",
      data.references || "(blank)",
      "",
      "■ Must-have items",
      data.mustHave || "(blank)",
      "",
      "■ Avoid",
      data.avoid || "(blank)",
      "",
      "Delivery format and review steps can be discussed separately."
    ].join("\n");
  };

  const initTool = () => {
    const purpose = document.getElementById("purpose");
    const size = document.getElementById("size");
    const deadline = document.getElementById("deadline");
    const references = document.getElementById("references");
    const mustHave = document.getElementById("mustHave");
    const avoid = document.getElementById("avoid");
    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const btnBuild = document.getElementById("btnBuild");
    const btnCopyJa = document.getElementById("btnCopyJa");
    const btnCopyEn = document.getElementById("btnCopyEn");

    const render = () => {
      const data = {
        purpose: purpose.value.trim(),
        size: size.value.trim(),
        deadline: deadline.value.trim(),
        references: references.value.trim(),
        mustHave: mustHave.value.trim(),
        avoid: avoid.value.trim()
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
