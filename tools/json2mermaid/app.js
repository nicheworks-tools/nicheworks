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

  const convertBtns = document.querySelectorAll(".convert-btn");
  const copyBtns = document.querySelectorAll(".copy-btn");
  const resetBtns = document.querySelectorAll(".reset-btn");

  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");

  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");

  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  /* ----------------------------
      Lang Switch (JP / EN)
  ---------------------------- */
  const applyLang = (lang) => {
    currentLang = lang;

    // data-i18n の要素を切り替え
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    // ボタンの active 切り替え
    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
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
    const lines = ["flowchart TD"];
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
        // primitive
        const valId = genId();
        const valLabel = String(node).replace(/"/g, '\\"');
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
  convertBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      hideError();
      outputEl.value = "";

      const jsonText = inputEl.value.trim();
      if (!jsonText) {
        showError(
          currentLang === "ja"
            ? "JSONが入力されていません。"
            : "No JSON provided."
        );
        return;
      }

      // 連打防止
      convertBtns.forEach((b) => (b.disabled = true));
      showProgress();

      setTimeout(() => {
        try {
          const parsed = JSON.parse(jsonText);
          const mermaid = jsonToMermaid(parsed);
          outputEl.value = mermaid;

          // 出力欄へスクロール
          outputEl.scrollIntoView({ behavior: "smooth" });
        } catch (e) {
          showError(
            currentLang === "ja"
              ? "JSONの構文が正しくありません。"
              : "Invalid JSON format."
          );
        } finally {
          convertBtns.forEach((b) => (b.disabled = false));
          hideProgress();
        }
      }, 120);
    });
  });

  /* ----------------------------
      Copy Output
  ---------------------------- */
  copyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = outputEl.value;
      if (!text) return;

      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.textContent = currentLang === "ja" ? "コピー完了" : "Copied!";
          setTimeout(() => {
            btn.textContent = currentLang === "ja" ? "コピー" : "Copy";
          }, 1200);
        })
        .catch(() => {
          showError(
            currentLang === "ja"
              ? "クリップボードにコピーできませんでした。"
              : "Failed to copy to clipboard."
          );
        });
    });
  });

  /* ----------------------------
      Reset (All Clear)
  ---------------------------- */
  resetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      inputEl.value = "";
      outputEl.value = "";
      hideError();
      hideProgress();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
});
