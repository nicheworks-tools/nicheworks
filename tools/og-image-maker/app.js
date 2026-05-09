(() => {
  "use strict";

  const PRO_KEY_STORAGE = "nw_og_image_maker_pro_key";
  const PRO_KEY_PATTERN = /^NW-OGIM-PRO-[A-Z0-9]{4,}$/i;
  const MAX_LOGO_BYTES = 2 * 1024 * 1024;
  const MAX_BATCH_ROWS = 10;

  const state = {
    title: "",
    subtitle: "",
    url: "",
    theme: "light",
    logo: null,
    logoObjectUrl: null
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const getLang = () => document.documentElement.lang === "en" ? "en" : "ja";

  const messages = {
    ja: {
      titleRequired: "タイトルを入力してください。",
      logoTooLarge: "ロゴ画像は2MB以下を推奨しています。別の画像を選んでください。",
      logoType: "画像ファイルを選んでください。",
      logoLoadError: "ロゴ画像を読み込めませんでした。",
      logoCleared: "ロゴを削除しました。",
      saveFailed: "PNG保存に失敗しました。ブラウザを変えて再度お試しください。",
      saved: "PNGを保存しました。",
      proEnabled: "Pro機能を有効化しました。",
      proInvalid: "Proキーの形式が正しくありません。",
      proRequired: "Proキーを有効化してください。",
      batchEmpty: "一括生成する行を入力してください。",
      batchTooMany: "一括生成は最大10行までです。",
      batchDone: "一括生成を開始しました。ブラウザが連続ダウンロードを止める場合があります。"
    },
    en: {
      titleRequired: "Please enter a title.",
      logoTooLarge: "Logo images should be 2MB or smaller. Choose another image.",
      logoType: "Please choose an image file.",
      logoLoadError: "Could not load the logo image.",
      logoCleared: "Logo cleared.",
      saveFailed: "Could not save the PNG. Try another browser and retry.",
      saved: "PNG saved.",
      proEnabled: "Pro features enabled.",
      proInvalid: "The Pro key format is invalid.",
      proRequired: "Enable your Pro key first.",
      batchEmpty: "Enter rows for batch generation.",
      batchTooMany: "Batch generation supports up to 10 rows.",
      batchDone: "Batch generation started. Your browser may block repeated downloads."
    }
  };

  const t = (key) => messages[getLang()][key] || key;

  const showToast = (message) => {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const setTitleError = (message) => {
    const titleError = $("#titleError");
    if (titleError) titleError.textContent = message || "";
    const titleInput = $("#titleInput");
    if (titleInput) titleInput.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    $$('[data-i18n]').forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    $$(".nw-lang-switch button").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    $$(".nw-lang-switch button").forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);
  };

  const getDateStamp = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const sanitizeFilenamePart = (value) => {
    return (value || "og-image")
      .toLowerCase()
      .replace(/https?:\/\//g, "")
      .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "og-image";
  };

  const drawTextBlock = (ctx, text, x, y, maxWidth, lineHeight) => {
    const source = text || "";
    const useWordWrap = source.includes(" ");
    const chunks = useWordWrap ? source.split(" ") : Array.from(source);
    let line = "";
    let offsetY = y;

    chunks.forEach((chunk, index) => {
      const spacer = useWordWrap ? " " : "";
      const test = `${line}${chunk}${spacer}`;
      if (ctx.measureText(test).width > maxWidth && index > 0) {
        ctx.fillText(line.trim(), x, offsetY);
        line = `${chunk}${spacer}`;
        offsetY += lineHeight;
      } else {
        line = test;
      }
    });

    ctx.fillText(line.trim(), x, offsetY);
    return offsetY + lineHeight;
  };

  const renderCanvas = (canvas, data = state) => {
    const ctx = canvas.getContext("2d");
    const isDark = data.theme === "dark";
    const bg = isDark ? "#0f172a" : "#ffffff";
    const textColor = isDark ? "#f8fafc" : "#111827";
    const subColor = isDark ? "#cbd5e1" : "#475569";
    const accent = isDark ? "#38bdf8" : "#2563eb";
    const title = data.title || "Sample OG Image";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.fillStyle = textColor;
    ctx.font = "bold 64px sans-serif";
    let nextY = drawTextBlock(ctx, title, 80, 160, 1040, 72);

    if (data.subtitle) {
      ctx.fillStyle = subColor;
      ctx.font = "normal 36px sans-serif";
      nextY = drawTextBlock(ctx, data.subtitle, 80, nextY + 10, 1040, 44);
    }

    if (data.url) {
      ctx.fillStyle = subColor;
      ctx.font = "normal 28px sans-serif";
      ctx.fillText(data.url, 80, canvas.height - 80);
    }

    if (data.logo) {
      const maxLogo = 120;
      const scale = Math.min(maxLogo / data.logo.width, maxLogo / data.logo.height, 1);
      const w = data.logo.width * scale;
      const h = data.logo.height * scale;
      ctx.drawImage(data.logo, canvas.width - w - 80, canvas.height - h - 80, w, h);
    }
  };

  const downloadCanvas = (canvas, filename) => new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("toBlob failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 700);
        resolve();
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });

  const revokeLogoUrl = () => {
    if (state.logoObjectUrl) {
      URL.revokeObjectURL(state.logoObjectUrl);
      state.logoObjectUrl = null;
    }
  };

  const syncState = () => {
    const titleInput = $("#titleInput");
    const subtitleInput = $("#subtitleInput");
    const urlInput = $("#urlInput");
    const themeSelect = $("#themeSelect");
    const canvas = $("#preview");

    state.title = titleInput ? titleInput.value.trim() : "";
    state.subtitle = subtitleInput ? subtitleInput.value.trim() : "";
    state.url = urlInput ? urlInput.value.trim() : "";
    state.theme = themeSelect ? themeSelect.value : "light";
    setTitleError("");
    if (canvas) renderCanvas(canvas);
  };

  const validateTitle = () => {
    syncState();
    if (!state.title) {
      setTitleError(t("titleRequired"));
      showToast(t("titleRequired"));
      $("#titleInput")?.focus();
      return false;
    }
    return true;
  };

  const parseBatch = (text) => {
    const lines = (text || "").split("\n").map((line) => line.trim()).filter(Boolean);
    return lines.map((line) => {
      const delimiter = line.includes("\t") ? "\t" : ",";
      const [title = "", subtitle = "", url = ""] = line.split(delimiter).map((v) => v.trim());
      return { title, subtitle, url, theme: state.theme, logo: state.logo };
    });
  };

  const hasPro = () => {
    try {
      const saved = localStorage.getItem(PRO_KEY_STORAGE) || localStorage.getItem("nw_pro_key") || "";
      return PRO_KEY_PATTERN.test(saved);
    } catch (_) {
      return false;
    }
  };

  const refreshPro = () => {
    const enabled = hasPro();
    $$('[data-pro-only]').forEach((el) => { el.style.display = enabled ? "" : "none"; });
    $$('[data-pro-lock]').forEach((el) => { el.style.display = enabled ? "none" : ""; });
  };

  const initPro = () => {
    const unlockBtn = $("#unlockProBtn");
    const proKeyInput = $("#proKeyInput");
    unlockBtn?.addEventListener("click", () => {
      const key = (proKeyInput?.value || "").trim();
      if (!PRO_KEY_PATTERN.test(key)) {
        showToast(t("proInvalid"));
        return;
      }
      try { localStorage.setItem(PRO_KEY_STORAGE, key); } catch (_) {}
      if (proKeyInput) proKeyInput.value = "";
      refreshPro();
      showToast(t("proEnabled"));
    });
    refreshPro();
  };

  const initTool = () => {
    const canvas = $("#preview");
    const titleInput = $("#titleInput");
    const subtitleInput = $("#subtitleInput");
    const urlInput = $("#urlInput");
    const themeSelect = $("#themeSelect");
    const logoInput = $("#logoInput");
    const clearLogoBtn = $("#clearLogoBtn");
    const downloadBtn = $("#downloadBtn");
    const batchDownload = $("#batchDownload");
    const batchInput = $("#batchInput");

    [titleInput, subtitleInput, urlInput].forEach((input) => {
      input?.addEventListener("input", syncState);
    });
    themeSelect?.addEventListener("change", syncState);

    logoInput?.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      revokeLogoUrl();

      if (!file) {
        state.logo = null;
        syncState();
        return;
      }
      if (!file.type.startsWith("image/")) {
        state.logo = null;
        logoInput.value = "";
        showToast(t("logoType"));
        syncState();
        return;
      }
      if (file.size > MAX_LOGO_BYTES) {
        state.logo = null;
        logoInput.value = "";
        showToast(t("logoTooLarge"));
        syncState();
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      state.logoObjectUrl = objectUrl;
      const img = new Image();
      img.onload = () => {
        state.logo = img;
        syncState();
      };
      img.onerror = () => {
        state.logo = null;
        logoInput.value = "";
        revokeLogoUrl();
        showToast(t("logoLoadError"));
        syncState();
      };
      img.src = objectUrl;
    });

    clearLogoBtn?.addEventListener("click", () => {
      state.logo = null;
      if (logoInput) logoInput.value = "";
      revokeLogoUrl();
      syncState();
      showToast(t("logoCleared"));
    });

    downloadBtn?.addEventListener("click", async () => {
      if (!validateTitle() || !canvas) return;
      const filename = `${sanitizeFilenamePart(state.title)}-${getDateStamp()}.png`;
      try {
        await downloadCanvas(canvas, filename);
        showToast(t("saved"));
      } catch (_) {
        showToast(t("saveFailed"));
      }
    });

    batchDownload?.addEventListener("click", async () => {
      if (!hasPro()) {
        showToast(t("proRequired"));
        refreshPro();
        return;
      }
      const rows = parseBatch(batchInput?.value || "");
      if (!rows.length) {
        showToast(t("batchEmpty"));
        return;
      }
      if (rows.length > MAX_BATCH_ROWS) {
        showToast(t("batchTooMany"));
        return;
      }

      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        if (!row.title) continue;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 1200;
        tempCanvas.height = 630;
        renderCanvas(tempCanvas, row);
        const filename = `${sanitizeFilenamePart(row.title)}-${getDateStamp()}-${String(index + 1).padStart(2, "0")}.png`;
        try {
          await downloadCanvas(tempCanvas, filename);
        } catch (_) {
          showToast(t("saveFailed"));
          return;
        }
      }
      showToast(t("batchDone"));
      syncState();
    });

    initPro();
    syncState();
    window.addEventListener("beforeunload", revokeLogoUrl);
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();
    initTool();
  });
})();
