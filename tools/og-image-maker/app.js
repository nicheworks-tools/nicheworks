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

  const state = {
    title: "",
    subtitle: "",
    url: "",
    theme: "light",
    logo: null
  };

  const drawTextBlock = (ctx, text, x, y, maxWidth, lineHeight) => {
    const chunks = text.includes(" ") ? text.split(" ") : Array.from(text);
    let line = "";
    let offsetY = y;
    chunks.forEach((chunk, idx) => {
      const spacer = text.includes(" ") ? " " : "";
      const test = `${line}${chunk}${spacer}`;
      if (ctx.measureText(test).width > maxWidth && idx > 0) {
        ctx.fillText(line, x, offsetY);
        line = `${chunk}${spacer}`;
        offsetY += lineHeight;
      } else {
        line = test;
      }
    });
    ctx.fillText(line.trim(), x, offsetY);
    return offsetY + lineHeight;
  };

  const renderCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    const isDark = state.theme === "dark";
    const bg = isDark ? "#0f172a" : "#ffffff";
    const textColor = isDark ? "#f8fafc" : "#111827";
    const accent = isDark ? "#38bdf8" : "#2563eb";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.fillStyle = textColor;
    ctx.font = "bold 64px sans-serif";
    const title = state.title || "NicheWorks OG";
    let nextY = drawTextBlock(ctx, title, 80, 160, 1040, 72);

    ctx.font = "normal 36px sans-serif";
    if (state.subtitle) {
      nextY = drawTextBlock(ctx, state.subtitle, 80, nextY + 10, 1040, 44);
    }

    ctx.font = "normal 28px sans-serif";
    if (state.url) {
      ctx.fillStyle = isDark ? "#cbd5f5" : "#475569";
      ctx.fillText(state.url, 80, canvas.height - 80);
      ctx.fillStyle = textColor;
    }

    if (state.logo) {
      const maxLogo = 120;
      const scale = Math.min(maxLogo / state.logo.width, maxLogo / state.logo.height, 1);
      const w = state.logo.width * scale;
      const h = state.logo.height * scale;
      ctx.drawImage(state.logo, canvas.width - w - 80, canvas.height - h - 80, w, h);
    }
  };

  const downloadCanvas = (canvas, filename) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const parseBatch = (text) => text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, subtitle, url] = line.split(",").map((v) => (v || "").trim());
      return { title, subtitle, url };
    });

  const initTool = () => {
    const canvas = document.getElementById("preview");
    const titleInput = document.getElementById("titleInput");
    const subtitleInput = document.getElementById("subtitleInput");
    const urlInput = document.getElementById("urlInput");
    const themeSelect = document.getElementById("themeSelect");
    const logoInput = document.getElementById("logoInput");
    const batchInput = document.getElementById("batchInput");

    const syncState = () => {
      state.title = titleInput.value.trim();
      state.subtitle = subtitleInput.value.trim();
      state.url = urlInput.value.trim();
      state.theme = themeSelect.value;
      renderCanvas(canvas);
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

    titleInput.addEventListener("input", syncState);
    subtitleInput.addEventListener("input", syncState);
    urlInput.addEventListener("input", syncState);
    themeSelect.addEventListener("change", syncState);

    logoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) {
        state.logo = null;
        syncState();
        return;
      }
      const img = new Image();
      img.onload = () => {
        state.logo = img;
        syncState();
      };
      img.src = URL.createObjectURL(file);
    });

    document.getElementById("downloadBtn").addEventListener("click", () => {
      syncState();
      downloadCanvas(canvas, "og-image.png");
    });

    document.getElementById("batchDownload").addEventListener("click", () => {
      if (!window.NW.hasPro()) return;
      const rows = parseBatch(batchInput.value);
      rows.forEach((row, index) => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 1200;
        tempCanvas.height = 630;
        state.title = row.title;
        state.subtitle = row.subtitle;
        state.url = row.url;
        renderCanvas(tempCanvas);
        downloadCanvas(tempCanvas, `og-${index + 1}.png`);
      });
      syncState();
    });

    refreshPro();
    syncState();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
