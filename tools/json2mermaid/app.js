/* ==========================================================
   JSON2Mermaid Lite - app.js
   Soft Border UI + Diffchecker Layout + NicheWorks Spec v2
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------
     要素取得
  ---------------------------- */
  const inputEl = document.getElementById("jsonInput");
  const outputEl = document.getElementById("mermaidOutput");
  const convertBtn = document.querySelectorAll("#convertBtn");
  const copyBtn = document.querySelectorAll("#copyBtn");
  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");

  /* ----------------------------
     言語切替（仕様 v2：同一HTML内Aパターン）
  ---------------------------- */
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
    currentLang = lang;
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(currentLang);

  /* ----------------------------
     プログレスバー制御
  ---------------------------- */
  const showProgress = () => {
    progress.classList.remove("hidden");
  };

  const hideProgress = () => {
    progress.classList.add("hidden");
  };

  /* ----------------------------
     エラー表示
  ---------------------------- */
  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  };

  const hideError = () => {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
  };

  /* ----------------------------
     JSON → Mermaid 変換ロジック
     flowchart TD を生成する
  ---------------------------- */

  function jsonToMermaid(jsonObj) {
    let lines = ["flowchart TD"];
    let idCounter = 0;

    // ノードID生成ヘルパー
    const genId = () => `node_${idCounter++}`;

    // 再帰処理
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
        // プリミティブ値ノード
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
     変換実行
  ---------------------------- */
  convertBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      hideError();
      outputEl.value = "";

      let jsonText = inputEl.value.trim();
      if (!jsonText) {
        showError(currentLang === "ja"
          ? "JSONが入力されていません。"
          : "No JSON input.");
        return;
      }

      // プログレスバー開始
      showProgress();
      btn.disabled = true;

      setTimeout(() => {
        try {
          const parsed = JSON.parse(jsonText);
          const mermaid = jsonToMermaid(parsed);

          outputEl.value = mermaid;

          // 自動スクロール
          outputEl.scrollIntoView({ behavior: "smooth" });

        } catch (e) {
          showError(
            currentLang === "ja"
              ? "JSONの構文が正しくありません。"
              : "Invalid JSON format."
          );
        }

        hideProgress();
        btn.disabled = false;
      }, 100); // 若干の遅延でバーを見せる
    });
  });

  /* ----------------------------
     コピー機能
  ---------------------------- */
  copyBtn.forEach(btn => {
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

});
