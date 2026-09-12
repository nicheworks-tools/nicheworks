/* ==========================================================
   JSON2Mermaid Lite - app.js
   NicheWorks client-side utility
========================================================== */

(() => {
  const LIMITS = Object.freeze({
    maxInputBytes: 300 * 1024,
    maxDepth: 12,
    maxArrayItems: 50,
    maxLabelLength: 120
  });

  const DEFAULTS = Object.freeze({
    direction: "TD",
    leafMode: "separate",
    arrayMode: "expand"
  });

  const normalizeLang = (lang) => (lang === "en" ? "en" : "ja");

  const normalizeOptions = (options = {}) => ({
    direction: options.direction === "LR" ? "LR" : "TD",
    leafMode: options.leafMode === "inline" ? "inline" : "separate",
    arrayMode: options.arrayMode === "summarize" ? "summarize" : "expand"
  });

  const getByteLength = (text) => new TextEncoder().encode(text).length;

  const createConverterError = (code, message) => {
    const error = new Error(message);
    error.code = code;
    return error;
  };

  const safeMermaidLabel = (value) => {
    let text;
    if (value === null) {
      text = "null";
    } else if (value === undefined) {
      text = "undefined";
    } else {
      text = String(value);
    }

    text = text
      .replace(/[\r\n\t]+/g, " ")
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/\[/g, "（")
      .replace(/\]/g, "）")
      .replace(/"/g, '\\"')
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!text) text = "(empty)";

    if (text.length > LIMITS.maxLabelLength) {
      text = `${text.slice(0, LIMITS.maxLabelLength - 1)}…`;
    }

    return text;
  };

  const jsonToMermaid = (jsonObj, rawOptions, rawLang) => {
    const options = normalizeOptions(rawOptions);
    const lang = normalizeLang(rawLang);
    const lines = [`flowchart ${options.direction}`];
    const warnings = [];
    let idCounter = 0;
    let nodeCount = 0;
    let edgeCount = 0;
    let maxDepth = 0;
    let omittedCount = 0;
    let depthLimitHit = false;
    let arrayLimitHit = false;

    const genId = () => `node_${idCounter++}`;
    const addNode = (label) => {
      const id = genId();
      lines.push(`  ${id}["${safeMermaidLabel(label)}"]`);
      nodeCount++;
      return id;
    };

    const addEdge = (fromId, toId) => {
      if (fromId !== null) {
        lines.push(`  ${fromId} --> ${toId}`);
        edgeCount++;
      }
    };

    const isPrimitive = (value) => value === null || (typeof value !== "object" && typeof value !== "function");

    const walk = (node, parentId = null, label = "root", depth = 0) => {
      maxDepth = Math.max(maxDepth, depth);

      if (options.leafMode === "inline" && isPrimitive(node) && parentId !== null) {
        const inlineId = addNode(`${label}: ${node}`);
        addEdge(parentId, inlineId);
        return;
      }

      const currentId = addNode(label);
      addEdge(parentId, currentId);

      if (isPrimitive(node)) {
        const valueId = addNode(node);
        addEdge(currentId, valueId);
        return;
      }

      if (depth >= LIMITS.maxDepth) {
        depthLimitHit = true;
        const limitLabel = lang === "ja" ? "深さ制限に達しました" : "depth limit reached";
        const limitId = addNode(limitLabel);
        addEdge(currentId, limitId);
        return;
      }

      if (Array.isArray(node)) {
        if (options.arrayMode === "summarize") {
          const summaryLabel = lang === "ja"
            ? `Array(${node.length}件)`
            : `Array(${node.length} items)`;
          const summaryId = addNode(summaryLabel);
          addEdge(currentId, summaryId);
          return;
        }

        if (node.length === 0) {
          const emptyId = addNode("empty array");
          addEdge(currentId, emptyId);
          return;
        }

        const visibleItems = node.slice(0, LIMITS.maxArrayItems);
        visibleItems.forEach((item, index) => {
          walk(item, currentId, `[${index}]`, depth + 1);
        });

        if (node.length > LIMITS.maxArrayItems) {
          arrayLimitHit = true;
          const omitted = node.length - LIMITS.maxArrayItems;
          omittedCount += omitted;
          const moreLabel = lang === "ja"
            ? `... ${omitted}件を省略`
            : `... ${omitted} more items`;
          const moreId = addNode(moreLabel);
          addEdge(currentId, moreId);
        }
        return;
      }

      if (node !== null && typeof node === "object") {
        const keys = Object.keys(node);
        if (keys.length === 0) {
          const emptyId = addNode("empty object");
          addEdge(currentId, emptyId);
          return;
        }

        keys.forEach((key) => {
          walk(node[key], currentId, key, depth + 1);
        });
      }
    };

    walk(jsonObj);

    if (depthLimitHit) {
      warnings.push(
        lang === "ja"
          ? `深さ制限（${LIMITS.maxDepth}階層）に達したため、一部を省略しました。`
          : `Some branches were omitted because the depth limit (${LIMITS.maxDepth}) was reached.`
      );
    }

    if (arrayLimitHit) {
      warnings.push(
        lang === "ja"
          ? `配列は最大${LIMITS.maxArrayItems}件まで展開し、それ以上は省略しました。`
          : `Arrays are expanded up to ${LIMITS.maxArrayItems} items; extra items were omitted.`
      );
    }

    return {
      code: lines.join("\n"),
      warnings,
      stats: {
        nodeCount,
        edgeCount,
        maxDepth,
        omittedCount,
        depthLimitHit
      }
    };
  };

  const convert = (jsonText, options = DEFAULTS, lang = "ja") => {
    const text = typeof jsonText === "string" ? jsonText.trim() : String(jsonText ?? "").trim();
    if (!text) {
      throw createConverterError("EMPTY_INPUT", "No JSON provided.");
    }
    if (getByteLength(text) > LIMITS.maxInputBytes) {
      throw createConverterError("INPUT_TOO_LARGE", "Input exceeds the JSON2Mermaid Free input limit.");
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      error.code = "INVALID_JSON";
      throw error;
    }

    return jsonToMermaid(parsed, options, lang);
  };

  window.NWJSON2MermaidConverter = Object.freeze({
    version: 1,
    limits: LIMITS,
    defaults: DEFAULTS,
    convert
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("jsonInput");
  const outputEl = document.getElementById("mermaidOutput");
  const convertBtn = document.getElementById("convertBtn");
  const copyBtn = document.getElementById("copyBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadMmdBtn = document.getElementById("downloadMmd");
  const downloadTxtBtn = document.getElementById("downloadTxt");
  const statsBox = document.getElementById("statsBox");
  const statNodes = document.getElementById("statNodes");
  const statEdges = document.getElementById("statEdges");
  const statDepth = document.getElementById("statDepth");
  const statOmitted = document.getElementById("statOmitted");
  const statDepthLimit = document.getElementById("statDepthLimit");
  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");
  const warningBox = document.getElementById("warningBox");
  const toastBox = document.getElementById("toastBox");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const i18nKeyNodes = document.querySelectorAll("[data-i18n-key]");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const presetButtons = document.querySelectorAll(".preset-btn");
  const converter = window.NWJSON2MermaidConverter;

  const labels = {
    ja: {
      convert: "変換する",
      converting: "変換中...",
      copy: "コピー",
      copied: "コピー完了",
      reset: "リセット",
      downloadMmd: ".mmdで保存",
      downloadTxt: ".txtで保存",
      presetSimple: "シンプルツリー",
      presetNested: "ネストオブジェクト",
      presetArray: "配列オブジェクト",
      yes: "はい",
      no: "いいえ"
    },
    en: {
      convert: "Convert",
      converting: "Converting...",
      copy: "Copy",
      copied: "Copied",
      reset: "Reset",
      downloadMmd: "Download .mmd",
      downloadTxt: "Download .txt",
      presetSimple: "Simple tree",
      presetNested: "Nested object",
      presetArray: "Array of objects",
      yes: "Yes",
      no: "No"
    }
  };

  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const t = (key) => (labels[currentLang] && labels[currentLang][key]) || labels.ja[key] || key;
  const showProgress = () => progress.classList.remove("hidden");
  const hideProgress = () => progress.classList.add("hidden");

  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  };

  const hideError = () => {
    errorBox.textContent = "";
    errorBox.classList.add("hidden");
  };

  const showWarning = (msg) => {
    warningBox.textContent = msg;
    warningBox.classList.remove("hidden");
  };

  const hideWarning = () => {
    warningBox.textContent = "";
    warningBox.classList.add("hidden");
  };

  const showToast = (msg) => {
    if (!toastBox) return;
    toastBox.textContent = msg;
    toastBox.classList.remove("hidden");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toastBox.classList.add("hidden");
      toastBox.textContent = "";
    }, 1800);
  };

  const getByteLength = (text) => new TextEncoder().encode(text).length;

  const getPositionFromError = (message) => {
    const match = message.match(/position (\d+)/i);
    if (!match) return null;
    const position = Number(match[1]);
    return Number.isFinite(position) ? position : null;
  };

  const getLineColumn = (text, index) => {
    if (index <= 0) return { line: 1, column: 1 };
    const slice = text.slice(0, index);
    const lines = slice.split(/\r\n|\r|\n/);
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  };

  const buildParseErrorMessage = (error, text) => {
    const position = getPositionFromError(error.message || "");
    if (position === null) {
      return currentLang === "ja"
        ? "JSONの構文が正しくありません。"
        : "Invalid JSON format.";
    }

    const { line, column } = getLineColumn(text, position);
    return currentLang === "ja"
      ? `JSONの構文が正しくありません。（行${line}、列${column}付近）`
      : `Invalid JSON format. (around line ${line}, column ${column})`;
  };

  const setBusy = (busy) => {
    convertBtn.disabled = busy;
    convertBtn.textContent = busy ? t("converting") : t("convert");
  };

  const updateStats = (stats) => {
    statNodes.textContent = stats.nodeCount;
    statEdges.textContent = stats.edgeCount;
    statDepth.textContent = stats.maxDepth;
    statOmitted.textContent = stats.omittedCount;
    statDepthLimit.textContent = stats.depthLimitHit ? t("yes") : t("no");
    statsBox.classList.remove("hidden");
  };

  const convertHandler = (isSilent = false) => {
    hideError();
    hideWarning();

    const jsonText = inputEl.value.trim();
    if (!jsonText) {
      outputEl.value = "";
      statsBox.classList.add("hidden");
      showError(currentLang === "ja" ? "JSONが入力されていません。" : "No JSON provided.");
      return;
    }

    if (getByteLength(jsonText) > converter.limits.maxInputBytes) {
      outputEl.value = "";
      statsBox.classList.add("hidden");
      showWarning(
        currentLang === "ja"
          ? "入力サイズが大きすぎます（300KB超）。小さく分割してお試しください。"
          : "Input size is too large (over 300KB). Please split or reduce the JSON."
      );
      return;
    }

    if (!isSilent) outputEl.value = "";

    const options = {
      direction: document.querySelector('input[name="direction"]:checked')?.value || converter.defaults.direction,
      leafMode: document.querySelector('input[name="leafMode"]:checked')?.value || converter.defaults.leafMode,
      arrayMode: document.querySelector('input[name="arrayMode"]:checked')?.value || converter.defaults.arrayMode
    };

    if (!isSilent) {
      setBusy(true);
      showProgress();
    }

    const runConversion = () => {
      try {
        const result = converter.convert(jsonText, options, currentLang);
        outputEl.value = result.code;
        if (result.warnings.length > 0) {
          showWarning(result.warnings.join("\n"));
        } else {
          hideWarning();
        }
        updateStats(result.stats);
        if (!isSilent) outputEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        outputEl.value = "";
        statsBox.classList.add("hidden");
        if (error.code === "INPUT_TOO_LARGE") {
          showWarning(
            currentLang === "ja"
              ? "入力サイズが大きすぎます（300KB超）。小さく分割してお試しください。"
              : "Input size is too large (over 300KB). Please split or reduce the JSON."
          );
        } else if (error.code === "EMPTY_INPUT") {
          showError(currentLang === "ja" ? "JSONが入力されていません。" : "No JSON provided.");
        } else {
          showError(buildParseErrorMessage(error, jsonText));
        }
      } finally {
        if (!isSilent) {
          setBusy(false);
          hideProgress();
        }
      }
    };

    if (isSilent) {
      runConversion();
    } else {
      window.setTimeout(runConversion, 80);
    }
  };

  const applyLang = (lang) => {
    currentLang = lang === "en" ? "en" : "ja";

    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });

    i18nKeyNodes.forEach((el) => {
      const key = el.dataset.i18nKey;
      if (labels[currentLang][key]) {
        el.textContent = labels[currentLang][key];
      }
    });

    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });

    if (outputEl.value || !errorBox.classList.contains("hidden") || !warningBox.classList.contains("hidden")) {
      convertHandler(true);
    }
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Fall through to textarea fallback.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    let success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      success = false;
    }

    textarea.remove();
    return success;
  };

  const copyHandler = async () => {
    const text = outputEl.value.trim();
    if (!text) {
      showToast(currentLang === "ja" ? "出力が空です。先に変換してください。" : "No output yet. Convert JSON first.");
      return;
    }

    const success = await copyText(text);
    if (success) {
      copyBtn.textContent = t("copied");
      showToast(currentLang === "ja" ? "Mermaidコードをコピーしました。" : "Mermaid code copied.");
      window.setTimeout(() => {
        copyBtn.textContent = t("copy");
      }, 1200);
    } else {
      showToast(currentLang === "ja" ? "コピーに失敗しました。手動で選択してください。" : "Copy failed. Please select and copy manually.");
    }
  };

  const resetHandler = () => {
    inputEl.value = "";
    outputEl.value = "";
    statsBox.classList.add("hidden");
    hideError();
    hideWarning();
    hideProgress();
    showToast(currentLang === "ja" ? "入力と出力をリセットしました。" : "Input and output cleared.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const presets = {
    "simple-tree": `{
  "root": {
    "branchA": "leaf",
    "branchB": "leaf"
  }
}`,
    "nested-object": `{
  "user": {
    "profile": {
      "name": "Aki",
      "contact": {
        "email": "aki@example.com"
      }
    }
  }
}`,
    "array-objects": `{
  "items": [
    {"id": 1, "name": "Alpha"},
    {"id": 2, "name": "Beta"}
  ]
}`
  };

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.preset;
      if (!presets[key]) return;
      inputEl.value = presets[key];
      outputEl.value = "";
      statsBox.classList.add("hidden");
      hideError();
      hideWarning();
      inputEl.focus();
    });
  });

  const getDateStamp = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const downloadHandler = (extension) => {
    hideError();
    const text = outputEl.value.trim();
    if (!text) {
      showToast(currentLang === "ja" ? "出力が空です。先に変換してください。" : "No output yet. Convert JSON first.");
      return;
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `json2mermaid-${getDateStamp()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showToast(
      currentLang === "ja"
        ? `${extension.toUpperCase()}ファイルを保存しました。`
        : `${extension.toUpperCase()} file saved.`
    );
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  convertBtn.addEventListener("click", convertHandler);
  copyBtn.addEventListener("click", copyHandler);
  resetBtn.addEventListener("click", resetHandler);
  downloadMmdBtn.addEventListener("click", () => downloadHandler("mmd"));
  downloadTxtBtn.addEventListener("click", () => downloadHandler("txt"));

  applyLang(currentLang);
});
