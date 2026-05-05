/* ==========================================================
   JSON2Mermaid Lite - app.js
   NicheWorks client-side utility
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("jsonInput");
  const outputEl = document.getElementById("mermaidOutput");
  const convertBtn = document.getElementById("convertBtn");
  const copyBtn = document.getElementById("copyBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadMmdBtn = document.getElementById("downloadMmd");
  const downloadTxtBtn = document.getElementById("downloadTxt");
  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");
  const warningBox = document.getElementById("warningBox");
  const toastBox = document.getElementById("toastBox");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const i18nKeyNodes = document.querySelectorAll("[data-i18n-key]");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const presetButtons = document.querySelectorAll(".preset-btn");

  const MAX_INPUT_BYTES = 300 * 1024;
  const MAX_DEPTH = 12;
  const MAX_ARRAY_ITEMS = 50;
  const MAX_LABEL_LENGTH = 120;

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
      presetArray: "配列オブジェクト"
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
      presetArray: "Array of objects"
    }
  };

  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const t = (key) => (labels[currentLang] && labels[currentLang][key]) || labels.ja[key] || key;

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
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(currentLang);

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

    if (text.length > MAX_LABEL_LENGTH) {
      text = `${text.slice(0, MAX_LABEL_LENGTH - 1)}…`;
    }

    return text;
  };

  const jsonToMermaid = (jsonObj) => {
    const lines = ["flowchart TD"];
    const warnings = [];
    let idCounter = 0;
    let depthLimitHit = false;
    let arrayLimitHit = false;

    const genId = () => `node_${idCounter++}`;
    const addNode = (label) => {
      const id = genId();
      lines.push(`  ${id}["${safeMermaidLabel(label)}"]`);
      return id;
    };

    const addEdge = (fromId, toId) => {
      if (fromId !== null) {
        lines.push(`  ${fromId} --> ${toId}`);
      }
    };

    const walk = (node, parentId = null, label = "root", depth = 0) => {
      const currentId = addNode(label);
      addEdge(parentId, currentId);

      if (depth >= MAX_DEPTH) {
        depthLimitHit = true;
        const limitLabel = currentLang === "ja" ? "深さ制限に達しました" : "depth limit reached";
        const limitId = addNode(limitLabel);
        addEdge(currentId, limitId);
        return;
      }

      if (Array.isArray(node)) {
        if (node.length === 0) {
          const emptyId = addNode("empty array");
          addEdge(currentId, emptyId);
          return;
        }

        const visibleItems = node.slice(0, MAX_ARRAY_ITEMS);
        visibleItems.forEach((item, index) => {
          walk(item, currentId, `[${index}]`, depth + 1);
        });

        if (node.length > MAX_ARRAY_ITEMS) {
          arrayLimitHit = true;
          const omitted = node.length - MAX_ARRAY_ITEMS;
          const moreLabel = currentLang === "ja"
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
        return;
      }

      const valueId = addNode(node);
      addEdge(currentId, valueId);
    };

    walk(jsonObj);

    if (depthLimitHit) {
      warnings.push(
        currentLang === "ja"
          ? `深さ制限（${MAX_DEPTH}階層）に達したため、一部を省略しました。`
          : `Some branches were omitted because the depth limit (${MAX_DEPTH}) was reached.`
      );
    }

    if (arrayLimitHit) {
      warnings.push(
        currentLang === "ja"
          ? `配列は最大${MAX_ARRAY_ITEMS}件まで展開し、それ以上は省略しました。`
          : `Arrays are expanded up to ${MAX_ARRAY_ITEMS} items; extra items were omitted.`
      );
    }

    return { code: lines.join("\n"), warnings };
  };

  const setBusy = (busy) => {
    convertBtn.disabled = busy;
    convertBtn.textContent = busy ? t("converting") : t("convert");
  };

  const convertHandler = () => {
    hideError();
    hideWarning();
    outputEl.value = "";

    const jsonText = inputEl.value.trim();
    if (!jsonText) {
      showError(currentLang === "ja" ? "JSONが入力されていません。" : "No JSON provided.");
      return;
    }

    if (getByteLength(jsonText) > MAX_INPUT_BYTES) {
      showWarning(
        currentLang === "ja"
          ? "入力サイズが大きすぎます（300KB超）。小さく分割してお試しください。"
          : "Input size is too large (over 300KB). Please split or reduce the JSON."
      );
      return;
    }

    setBusy(true);
    showProgress();

    window.setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonText);
        const result = jsonToMermaid(parsed);
        outputEl.value = result.code;
        if (result.warnings.length > 0) {
          showWarning(result.warnings.join("\n"));
        }
        outputEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        showError(buildParseErrorMessage(e, jsonText));
      } finally {
        setBusy(false);
        hideProgress();
      }
    }, 80);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
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
    } catch (e) {
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

  convertBtn.addEventListener("click", convertHandler);
  copyBtn.addEventListener("click", copyHandler);
  resetBtn.addEventListener("click", resetHandler);
  downloadMmdBtn.addEventListener("click", () => downloadHandler("mmd"));
  downloadTxtBtn.addEventListener("click", () => downloadHandler("txt"));
});
