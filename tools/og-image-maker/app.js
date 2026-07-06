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
    template: "minimal",
    theme: "light",
    bgColor: "#ffffff",
    gradientStart: "#3b82f6",
    gradientEnd: "#1d4ed8",
    textAlign: "left",
    showSafeArea: false,
    logo: null
  };

  const STORAGE_KEY = "nw_og_settings";

  const saveSettings = () => {
    const data = {
      title: state.title,
      subtitle: state.subtitle,
      url: state.url,
      template: state.template,
      theme: state.theme,
      bgColor: state.bgColor,
      gradientStart: state.gradientStart,
      gradientEnd: state.gradientEnd,
      textAlign: state.textAlign,
      showSafeArea: state.showSafeArea
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(state, data);
        return true;
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return false;
  };

  const drawTextBlock = (ctx, text, x, y, maxWidth, lineHeight, align = "left") => {
    const chunks = text.includes(" ") ? text.split(" ") : Array.from(text);
    let line = "";
    let lines = [];
    chunks.forEach((chunk, idx) => {
      const spacer = text.includes(" ") ? " " : "";
      const test = `${line}${chunk}${spacer}`;
      if (ctx.measureText(test).width > maxWidth && idx > 0) {
        lines.push(line.trim());
        line = `${chunk}${spacer}`;
      } else {
        line = test;
      }
    });
    lines.push(line.trim());

    let offsetY = y;
    lines.forEach((l) => {
      let drawX = x;
      if (align === "center") {
        drawX = x + (maxWidth - ctx.measureText(l).width) / 2;
      }
      ctx.fillText(l, drawX, offsetY);
      offsetY += lineHeight;
    });
    return offsetY;
  };

  const drawMinimal = (ctx, canvas, isDark, textColor, accentColor) => {
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.fillStyle = textColor;
    ctx.font = "bold 64px sans-serif";
    const title = state.title || "NicheWorks OG";
    let nextY = drawTextBlock(ctx, title, 80, 160, 1040, 72, state.textAlign);

    ctx.font = "normal 36px sans-serif";
    if (state.subtitle) {
      nextY = drawTextBlock(ctx, state.subtitle, 80, nextY + 20, 1040, 44, state.textAlign);
    }

    ctx.font = "normal 28px sans-serif";
    if (state.url) {
      ctx.fillStyle = isDark ? "#cbd5f5" : "#475569";
      const urlY = canvas.height - 80;
      if (state.textAlign === "center") {
        ctx.textAlign = "center";
        ctx.fillText(state.url, canvas.width / 2, urlY);
        ctx.textAlign = "left";
      } else {
        ctx.fillText(state.url, 80, urlY);
      }
      ctx.fillStyle = textColor;
    }

    if (state.logo) {
      const maxLogo = 120;
      const scale = Math.min(maxLogo / state.logo.width, maxLogo / state.logo.height, 1);
      const w = state.logo.width * scale;
      const h = state.logo.height * scale;
      const logoX = state.textAlign === "center" ? (canvas.width - w) / 2 : canvas.width - w - 80;
      const logoY = state.textAlign === "center" ? canvas.height - h - 140 : canvas.height - h - 80;
      ctx.drawImage(state.logo, logoX, logoY, w, h);
    }
  };

  const drawSplit = (ctx, canvas, isDark, textColor, accentColor) => {
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const splitX = 800;
    ctx.fillStyle = accentColor;
    ctx.fillRect(splitX, 0, canvas.width - splitX, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = "bold 64px sans-serif";
    const title = state.title || "NicheWorks OG";
    let nextY = drawTextBlock(ctx, title, 80, 160, 640, 72, state.textAlign);

    ctx.font = "normal 36px sans-serif";
    if (state.subtitle) {
      nextY = drawTextBlock(ctx, state.subtitle, 80, nextY + 20, 640, 44, state.textAlign);
    }

    ctx.font = "normal 28px sans-serif";
    if (state.url) {
      ctx.fillStyle = isDark ? "#cbd5f5" : "#475569";
      const urlY = canvas.height - 80;
      if (state.textAlign === "center") {
        ctx.textAlign = "center";
        ctx.fillText(state.url, splitX / 2, urlY);
        ctx.textAlign = "left";
      } else {
        ctx.fillText(state.url, 80, urlY);
      }
      ctx.fillStyle = textColor;
    }

    if (state.logo) {
      const maxLogo = 200;
      const scale = Math.min(maxLogo / state.logo.width, maxLogo / state.logo.height, 1);
      const w = state.logo.width * scale;
      const h = state.logo.height * scale;
      ctx.drawImage(state.logo, splitX + (canvas.width - splitX - w) / 2, (canvas.height - h) / 2, w, h);
    }
  };

  const drawGradient = (ctx, canvas, isDark, textColor, accentColor) => {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, state.gradientStart);
    grad.addColorStop(1, state.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = "bold 64px sans-serif";
    const title = state.title || "NicheWorks OG";
    let nextY = drawTextBlock(ctx, title, 80, 200, 1040, 72, state.textAlign);

    ctx.font = "normal 36px sans-serif";
    if (state.subtitle) {
      nextY = drawTextBlock(ctx, state.subtitle, 80, nextY + 20, 1040, 44, state.textAlign);
    }

    ctx.font = "normal 28px sans-serif";
    if (state.url) {
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)";
      const urlY = canvas.height - 80;
      if (state.textAlign === "center") {
        ctx.textAlign = "center";
        ctx.fillText(state.url, canvas.width / 2, urlY);
        ctx.textAlign = "left";
      } else {
        ctx.fillText(state.url, 80, urlY);
      }
      ctx.fillStyle = textColor;
    }

    if (state.logo) {
      const maxLogo = 100;
      const scale = Math.min(maxLogo / state.logo.width, maxLogo / state.logo.height, 1);
      const w = state.logo.width * scale;
      const h = state.logo.height * scale;
      ctx.drawImage(state.logo, canvas.width - w - 80, 80, w, h);
    }
  };

  const renderCanvas = (canvas, isExport = false) => {
    const ctx = canvas.getContext("2d");
    const isDark = state.theme === "dark";
    const textColor = isDark ? "#f8fafc" : "#111827";
    const accentColor = isDark ? "#38bdf8" : "#2563eb";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.template === "split") {
      drawSplit(ctx, canvas, isDark, textColor, accentColor);
    } else if (state.template === "gradient") {
      drawGradient(ctx, canvas, isDark, textColor, accentColor);
    } else {
      drawMinimal(ctx, canvas, isDark, textColor, accentColor);
    }

    if (state.showSafeArea && !isExport) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      // Standard safe area (e.g., 5% margin)
      const marginX = canvas.width * 0.05;
      const marginY = canvas.height * 0.05;
      ctx.strokeRect(marginX, marginY, canvas.width - marginX * 2, canvas.height - marginY * 2);
      ctx.setLineDash([]);
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
    const templateSelect = document.getElementById("templateSelect");
    const themeSelect = document.getElementById("themeSelect");
    const bgColorInput = document.getElementById("bgColorInput");
    const gradientStartInput = document.getElementById("gradientStartInput");
    const gradientEndInput = document.getElementById("gradientEndInput");
    const textAlignSelect = document.getElementById("textAlignSelect");
    const safeAreaToggle = document.getElementById("safeAreaToggle");
    const logoInput = document.getElementById("logoInput");
    const batchInput = document.getElementById("batchInput");
    const resetBtn = document.getElementById("resetBtn");

    let lastTheme = state.theme;

    const syncState = () => {
      state.title = titleInput.value.trim();
      state.subtitle = subtitleInput.value.trim();
      state.url = urlInput.value.trim();
      state.template = templateSelect.value;

      const newTheme = themeSelect.value;
      if (newTheme !== lastTheme) {
        if (newTheme === "dark" && state.bgColor === "#ffffff") {
          state.bgColor = "#0f172a";
          bgColorInput.value = "#0f172a";
        } else if (newTheme === "light" && state.bgColor === "#0f172a") {
          state.bgColor = "#ffffff";
          bgColorInput.value = "#ffffff";
        }
        lastTheme = newTheme;
      }
      state.theme = newTheme;

      state.bgColor = bgColorInput.value;
      state.gradientStart = gradientStartInput.value;
      state.gradientEnd = gradientEndInput.value;
      state.textAlign = textAlignSelect.value;
      state.showSafeArea = safeAreaToggle.checked;

      // Toggle background control visibility
      document.getElementById("field-bgColor").style.display = state.template === "gradient" ? "none" : "";
      document.getElementById("field-gradient").style.display = state.template === "gradient" ? "" : "none";

      saveSettings();
      renderCanvas(canvas);
    };

    const applyStateToUI = () => {
      titleInput.value = state.title;
      subtitleInput.value = state.subtitle;
      urlInput.value = state.url;
      templateSelect.value = state.template;
      themeSelect.value = state.theme;
      bgColorInput.value = state.bgColor;
      gradientStartInput.value = state.gradientStart;
      gradientEndInput.value = state.gradientEnd;
      textAlignSelect.value = state.textAlign;
      safeAreaToggle.checked = state.showSafeArea;
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
    templateSelect.addEventListener("change", syncState);
    themeSelect.addEventListener("change", syncState);
    bgColorInput.addEventListener("input", syncState);
    gradientStartInput.addEventListener("input", syncState);
    gradientEndInput.addEventListener("input", syncState);
    textAlignSelect.addEventListener("change", syncState);
    safeAreaToggle.addEventListener("change", syncState);

    resetBtn.addEventListener("click", () => {
      if (!confirm("Reset settings? / 設定をリセットしますか？")) return;
      Object.assign(state, {
        title: "",
        subtitle: "",
        url: "",
        template: "minimal",
        theme: "light",
        bgColor: "#ffffff",
        gradientStart: "#3b82f6",
        gradientEnd: "#1d4ed8",
        textAlign: "left",
        showSafeArea: false,
        logo: null
      });
      logoInput.value = ""; // Clear file input
      applyStateToUI();
      syncState();
    });

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
      renderCanvas(canvas, true); // Render without safe area for download
      downloadCanvas(canvas, "og-image.png");
      renderCanvas(canvas, false); // Restore preview with safe area if enabled
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
        renderCanvas(tempCanvas, true);
        downloadCanvas(tempCanvas, `og-${index + 1}.png`);
      });
      syncState();
    });

    loadSettings();
    applyStateToUI();
    refreshPro();
    syncState();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
