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

  const usageLinkJa = document.getElementById("usageLink-ja");
  const usageLinkEn = document.getElementById("usageLink-en");

  /* All JP/EN elements */
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");

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

  /* ----------------------------
      JSON → Mermaid Logic
  ---------------------------- */
  function jsonToMermaid(jsonObj) {
    let lines = ["flowchart TD"];
    let idCounter = 0;

    const genId = () => `node_${idCounter++}`;

    const walk = (node, parentId = null, path = "root") => {
      const currentId = genId();
      const safeLabel = path.replace(/"/g, '\\"');
      lines.push(`  ${currentId}["${safeLabel}"]`);

      if (parentId !== null) {
        lines.push(`  ${parentId} --> ${currentId}`);
      }

      if (node !== null && typeof node === "object") {
        if (Array.isArray(node)) {
          node.forEach((item, index) => {
            walk(item, currentId, `${path}[${index}]`);
          });
        } else {
          Object.keys(node).forEach((key) => {
            walk(node[key], currentId, key);
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
    outputEl.value = "";

    const jsonText = inputEl.value.trim();
    if (!jsonText) {
      showError(currentLang === "ja" ? "JSONが入力されていません。" : "No JSON provided.");
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
        showError(
          currentLang === "ja"
            ? "JSONの構文が正しくありません。"
            : "Invalid JSON format."
        );
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
    hideProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  resetBtnJa.addEventListener("click", resetHandler);
  resetBtnEn.addEventListener("click", resetHandler);

});
