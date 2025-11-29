/* ==========================================================
   JSON2Mermaid Lite - app.js
   Soft Border UI + Diffchecker Layout + NicheWorks Spec v2
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------
      Element References
  ---------------------------- */
  const inputEl = document.getElementById("jsonInput");
  const outputEl = document.getElementById("mermaidOutput");
  const convertBtns = document.querySelectorAll("#convertBtn");
  const copyBtns = document.querySelectorAll("#copyBtn");
  const resetBtns = document.querySelectorAll("#resetBtn");
  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");
  const usageLinks = document.querySelectorAll("#usageLink");

  /* ----------------------------
      Language Switch
      (Unified JP/EN HTML)
  ---------------------------- */
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    currentLang = lang;

    // Show elements that match data-i18n
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    // Switch active state in header
    langButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.lang === lang)
    );

    // Usage link auto-switch
    usageLinks.forEach((link) => {
      link.href = lang === "ja" ? "./usage.html" : "./usage-en.html";
    });
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(currentLang);

  /* ----------------------------
      Progress Bar
  ---------------------------- */
  const showProgress = () => {
    progress.classList.remove("hidden");
  };

  const hideProgress = () => {
    progress.classList.add("hidden");
  };

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
      JSON → Mermaid Core Logic
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
        // Primitive value node
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
      Convert (JSON → Mermaid)
  ---------------------------- */
  convertBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      hideError();
      outputEl.value = "";

      let jsonText = inputEl.value.trim();
      if (!jsonText) {
        showError(currentLang === "ja"
          ? "JSONが入力されていません。"
          : "No JSON provided.");
        return;
      }

      btn.disabled = true;
      showProgress();

      setTimeout(() => {
        try {
          const parsed = JSON.parse(jsonText);
          const mermaid = jsonToMermaid(parsed);
          outputEl.value = mermaid;

          // Scroll to output
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
    });
  });

  /* ----------------------------
      Copy Output
  ---------------------------- */
  copyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const text = outputEl.value;
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = currentLang === "ja" ? "コピー完了" : "Copied!";
        setTimeout(() => {
          btn.textContent = currentLang === "ja" ? "コピー" : "Copy";
        }, 1200);
      });
    });
  });

  /* ----------------------------
      Reset (All Clear)
  ---------------------------- */
  resetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      inputEl.value = "";
      outputEl.value = "";
      hideError();
      hideProgress();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

});
