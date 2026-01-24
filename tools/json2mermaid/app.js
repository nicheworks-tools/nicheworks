/* ==========================================================
   JSON2Mermaid Lite - app.js
   Soft Border UI + NicheWorks Spec v2
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------
      Element References
  ---------------------------- */
  const inputEl = document.getElementById("jsonInput");
  const outputEl = document.getElementById("mermaidOutput");

  const convertBtnJa = document.getElementById("convertBtn-ja");
  const convertBtnEn = document.getElementById("convertBtn-en");

  const copyBtnJa = document.getElementById("copyBtn-ja");
  const copyBtnEn = document.getElementById("copyBtn-en");

  const resetBtnJa = document.getElementById("resetBtn-ja");
  const resetBtnEn = document.getElementById("resetBtn-en");

  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");
  const warningBox = document.getElementById("warningBox");

  const usageLinkJa = document.getElementById("usageLink-ja");
  const usageLinkEn = document.getElementById("usageLink-en");

  /* All JP/EN elements */
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const presetButtons = document.querySelectorAll(".preset-btn");

  const downloadMmdJa = document.getElementById("downloadMmd-ja");
  const downloadMmdEn = document.getElementById("downloadMmd-en");
  const downloadTxtJa = document.getElementById("downloadTxt-ja");
  const downloadTxtEn = document.getElementById("downloadTxt-en");

  const MAX_INPUT_BYTES = 300 * 1024;
  const MAX_DEPTH = 12;

  /* ----------------------------
      Language Switch
  ---------------------------- */
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    currentLang = lang;

    // Show only matched data-i18n elements
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    // Active state for header buttons
    langButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.lang === lang)
    );

    // Usage link switching
    usageLinkJa.style.display = lang === "ja" ? "" : "none";
    usageLinkEn.style.display = lang === "en" ? "" : "none";
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  // initial apply
  applyLang(currentLang);

  /* ----------------------------
      Progress Helpers
  ---------------------------- */
  const showProgress = () => progress.classList.remove("hidden");
  const hideProgress = () => progress.classList.add("hidden");

  /* ----------------------------
      Error Handling
  ---------------------------- */
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
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
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

  /* ----------------------------
      JSON → Mermaid Logic
  ---------------------------- */
  function jsonToMermaid(jsonObj) {
    let lines = ["flowchart TD"];
    let idCounter = 0;

    const genId = () => `node_${idCounter++}`;

    const walk = (node, parentId = null, path = "root", depth = 0) => {
      const currentId = genId();
      const safeLabel = path.replace(/"/g, '\\"');
      lines.push(`  ${currentId}["${safeLabel}"]`);

      if (parentId !== null) {
        lines.push(`  ${parentId} --> ${currentId}`);
      }

      if (depth >= MAX_DEPTH) {
        const limitId = genId();
        const limitLabel = currentLang === "ja"
          ? "（深さ制限）"
          : "(depth limit)";
        lines.push(`  ${limitId}["${limitLabel}"]`);
        lines.push(`  ${currentId} --> ${limitId}`);
        return;
      }

      if (node !== null && typeof node === "object") {
        if (Array.isArray(node)) {
          node.forEach((item, index) => {
            walk(item, currentId, `${path}[${index}]`, depth + 1);
          });
        } else {
          Object.keys(node).forEach((key) => {
            walk(node[key], currentId, key, depth + 1);
          });
        }
      } else {
        // Primitive
        let valId = genId();
        let valLabel = String(node).replace(/"/g, '\\"');
        lines.push(`  ${valId}["${valLabel}"]`);
        lines.push(`  ${currentId} --> ${valId}`);
      }
    };

    walk(jsonObj, null, "root");
    return lines.join("\n");
  }

  /* ----------------------------
      Convert
  ---------------------------- */
  const convertHandler = (btn) => {
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
          : "Input size is too large (over 300KB). Please reduce the JSON."
      );
      return;
    }

    btn.disabled = true;
    showProgress();

    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonText);
        const mermaid = jsonToMermaid(parsed);
        outputEl.value = mermaid;

        outputEl.scrollIntoView({ behavior: "smooth" });
      } catch (e) {
        showError(buildParseErrorMessage(e, jsonText));
      }

      btn.disabled = false;
      hideProgress();
    }, 120);
  };

  convertBtnJa.addEventListener("click", () => convertHandler(convertBtnJa));
  convertBtnEn.addEventListener("click", () => convertHandler(convertBtnEn));

  /* ----------------------------
      Copy
  ---------------------------- */
  const copyHandler = (btn, lang) => {
    const text = outputEl.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = lang === "ja" ? "コピー完了" : "Copied!";
      setTimeout(() => {
        btn.textContent = lang === "ja" ? "コピー" : "Copy";
      }, 1200);
    });
  };

  copyBtnJa.addEventListener("click", () => copyHandler(copyBtnJa, "ja"));
  copyBtnEn.addEventListener("click", () => copyHandler(copyBtnEn, "en"));

  /* ----------------------------
      Reset
  ---------------------------- */
  const resetHandler = () => {
    inputEl.value = "";
    outputEl.value = "";
    hideError();
    hideWarning();
    hideProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  resetBtnJa.addEventListener("click", resetHandler);
  resetBtnEn.addEventListener("click", resetHandler);

  /* ----------------------------
      Presets
  ---------------------------- */
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

  /* ----------------------------
      Download
  ---------------------------- */
  const downloadHandler = (extension) => {
    const text = outputEl.value.trim();
    if (!text) {
      showError(
        currentLang === "ja"
          ? "出力が空です。先に変換してください。"
          : "No output yet. Convert JSON first."
      );
      return;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `json2mermaid.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  downloadMmdJa.addEventListener("click", () => downloadHandler("mmd"));
  downloadMmdEn.addEventListener("click", () => downloadHandler("mmd"));
  downloadTxtJa.addEventListener("click", () => downloadHandler("txt"));
  downloadTxtEn.addEventListener("click", () => downloadHandler("txt"));

});
