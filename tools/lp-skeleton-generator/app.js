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

  const buildOutput = () => {
    const product = document.getElementById("productName").value.trim() || "(商品名)";
    const target = document.getElementById("target").value.trim() || "(ターゲット)";
    const benefits = document.getElementById("benefits").value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const price = document.getElementById("price").value.trim();
    const proof = document.getElementById("proof").value.trim();
    const cta = document.getElementById("cta").value.trim() || "(CTA)";

    const benefitList = benefits.length ? benefits.map((b) => `- ${b}`).join("\n") : "- ベネフィットを入力";
    const benefitListEn = benefits.length ? benefits.map((b) => `- ${b}`).join("\n") : "- Add benefits";

    const jp = [
      `# ${product} LP骨子`,
      "## 1. ヒーロー", "- キャッチ: " + product,
      "- ターゲット: " + target,
      "## 2. 課題・共感", "- 今の悩みを提示",
      "## 3. ベネフィット", benefitList,
      "## 4. 料金/プラン", price ? `- 価格: ${price}` : "- 価格は未入力",
      "## 5. 実績/信頼", proof ? `- 証拠: ${proof}` : "- 実績・証拠を追加",
      "## 6. CTA", `- ${cta}`
    ].join("\n");

    const en = [
      `# ${product} LP Skeleton`,
      "## 1. Hero", `- Headline: ${product}`,
      `- Audience: ${target}`,
      "## 2. Problem / Empathy", "- State the pain",
      "## 3. Benefits", benefitListEn,
      "## 4. Pricing", price ? `- Price: ${price}` : "- Pricing not set",
      "## 5. Proof", proof ? `- Proof: ${proof}` : "- Add proof",
      "## 6. CTA", `- ${cta}`
    ].join("\n");

    const html = [
      `<section>`,
      `  <h1>${product}</h1>`,
      `  <p>${target}</p>`,
      `</section>`,
      `<section>`,
      `  <h2>Benefits</h2>`,
      `  <ul>`,
      ...benefits.map((b) => `    <li>${b}</li>`),
      `  </ul>`,
      `</section>`,
      `<section>`,
      `  <h2>CTA</h2>`,
      `  <button>${cta}</button>`,
      `</section>`
    ].join("\n");

    return { output: `${jp}\n\n---\n\n${en}`, markdown: `${jp}\n\n---\n\n${en}`, html };
  };

  const initTool = () => {
    const output = document.getElementById("output");
    const generate = () => {
      const { output: text } = buildOutput();
      output.value = text;
    };

    const refreshPro = () => {
      const hasPro = window.NW.hasPro();
      document.querySelectorAll("[data-pro-only]").forEach((el) => {
        el.style.display = hasPro ? "" : "none";
      });
      document.querySelectorAll("[data-pro-lock]").forEach((el) => {
        el.style.display = hasPro ? "none" : "";
      });
    };

    document.getElementById("generate").addEventListener("click", generate);
    document.getElementById("copyAll").addEventListener("click", () => window.NW.copyToClipboard(output.value));

    document.getElementById("downloadMd").addEventListener("click", () => {
      if (!window.NW.hasPro()) return;
      const { markdown } = buildOutput();
      window.NW.downloadText("lp-skeleton.md", markdown);
    });

    document.getElementById("downloadHtml").addEventListener("click", () => {
      if (!window.NW.hasPro()) return;
      const { html } = buildOutput();
      window.NW.downloadText("lp-skeleton.html", html);
    });

    refreshPro();
    generate();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
