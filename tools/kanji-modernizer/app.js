document.addDOMContentLoaded = document.addEventListener("DOMContentLoaded", () => {
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const inputText = document.getElementById("inputText");
  const convertBtn = document.getElementById("convertBtn");
  const progress = document.getElementById("progress");
  const errorBox = document.getElementById("errorBox");
  const resultBlock = document.getElementById("resultBlock");
  const outputText = document.getElementById("outputText");
  const copyBtn = document.getElementById("copyBtn");
  const resetBtn = document.getElementById("resetBtn");

  let dict = {};
  let reverseDict = {};
  let dictLoaded = false;

  /* =========================================================
     言語適用
     ========================================================= */
  let currentLang =
    (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    currentLang = lang;

    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    inputText.placeholder =
      lang === "ja"
        ? "例）舊字體の東京府淺草區"
        : "Example: Paste old-style kanji here.";
  };

  langButtons.forEach((btn) =>
    btn.addEventListener("click", () => applyLang(btn.dataset.lang))
  );

  applyLang(currentLang);

  /* =========================================================
     辞書ロード
     ========================================================= */
  const loadDict = () => {
    return fetch("./dict.json")
      .then((res) => {
        if (!res.ok) throw new Error("dict load failed");
        return res.json();
      })
      .then((data) => {
        dict = data;
        reverseDict = {};
        Object.keys(dict).forEach((oldChar) => {
          const modernChar = dict[oldChar];
          if (!reverseDict[modernChar]) reverseDict[modernChar] = oldChar;
        });
        dictLoaded = true;
      })
      .catch((e) => {
        console.error(e);
        dictLoaded = false;
      });
  };

  loadDict();

  /* =========================================================
     Helper UI
     ========================================================= */
  const showProgress = (show) => {
    progress.style.display = show ? "block" : "none";
  };

  const setError = (ja, en) => {
    if (!ja && !en) {
      errorBox.hidden = true;
      errorBox.textContent = "";
      return;
    }
    errorBox.hidden = false;
    errorBox.textContent = currentLang === "ja" ? ja : en;
  };

  /* =========================================================
     Convert
     ========================================================= */
  convertBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    setError("", "");
    resultBlock.hidden = true;

    if (!text) {
      setError(
        "入力テキストが空です。",
        "Input text is empty."
      );
      return;
    }

    const direction = document.querySelector(
      "input[name='direction']:checked"
    )?.value;

    convertBtn.disabled = true;
    showProgress(true);

    const ensureDict = dictLoaded ? Promise.resolve() : loadDict();

    ensureDict
      .then(() => {
        const map = direction === "old-to-new" ? dict : reverseDict;

        let result = "";
        for (const ch of text) {
          result += map[ch] || ch;
        }

        outputText.value = result;
        resultBlock.hidden = false;
        resultBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(() => {
        setError(
          "辞書の読み込みに失敗しました。",
          "Failed to load dictionary."
        );
      })
      .finally(() => {
        convertBtn.disabled = false;
        showProgress(false);
      });
  });

  /* =========================================================
     Copy
     ========================================================= */
  copyBtn.addEventListener("click", () => {
    if (!outputText.value) return;

    navigator.clipboard
      .writeText(outputText.value)
      .catch((e) => console.error("copy failed", e));
  });

  /* =========================================================
     Reset
     ========================================================= */
  resetBtn.addEventListener("click", () => {
    inputText.value = "";
    outputText.value = "";
    resultBlock.hidden = true;
    setError("", "");
    showProgress(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
