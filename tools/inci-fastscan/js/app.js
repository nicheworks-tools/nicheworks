let DICT = [];
let dictReady = false;
let currentLang = "ja";
let lastDictionaryStatus = "loading";
let lastFastResults = null;
let lastJbResults = null;

const DICTIONARY_FILES = [
  "data/ingredients.json",
  "data/ingredients-extra-1.json",
  "data/ingredients-extra-2.json",
  "data/ingredients-extra-3.json",
  "data/ingredients-extra-4.json"
];

const FALLBACK_DICT = [
  {
    en: "Water",
    jp: ["水"],
    alias: ["Aqua"],
    safety: "safe",
    category: "solvent",
    note_short: "Common solvent/base ingredient."
  },
  {
    en: "Glycerin",
    jp: ["グリセリン"],
    alias: [],
    safety: "safe",
    category: "humectant",
    note_short: "Common humectant used for moisturizing support."
  },
  {
    en: "Niacinamide",
    jp: ["ナイアシンアミド"],
    alias: [],
    safety: "safe",
    category: "active",
    note_short: "Common skin-conditioning ingredient; some users may feel irritation."
  },
  {
    en: "Fragrance",
    jp: ["香料"],
    alias: ["Parfum"],
    safety: "caution",
    category: "fragrance",
    note_short: "Review if you are sensitive to fragrance or have known allergies."
  }
];

const UI_TEXT = {
  dictLoading: {
    ja: "成分辞書を読み込み中です...",
    en: "Loading ingredient dictionary..."
  },
  dictLoaded: {
    ja: count => `成分辞書を読み込みました。${count}件`,
    en: count => `Dictionary loaded: ${count} items.`
  },
  dictPartial: {
    ja: count => `一部の補助辞書は読めませんでしたが、${count}件の辞書で動作しています。`,
    en: count => `Some supplemental dictionaries failed to load, but ${count} dictionary items are available.`
  },
  dictFallback: {
    ja: "成分辞書の読み込みに失敗したため、最低限のフォールバック辞書で動作しています。正確な確認にはページを再読み込みしてください。",
    en: "Dictionary loading failed, so this page is using a small fallback dictionary. Reload the page for a more complete check."
  },
  chooseImage: {
    ja: "画像を選択してください。",
    en: "Choose an image first."
  },
  ocrRunning: {
    ja: "OCR実行中です。画像の状態によって時間がかかります。",
    en: "Running OCR. This may take time depending on the image."
  },
  ocrRunningJp: {
    ja: "OCR実行中です。日本語OCRは時間がかかる場合があります。",
    en: "Running OCR. Japanese OCR may take longer."
  },
  ocrDone: {
    ja: "OCR結果を入力欄に入れました。誤認識がないか確認してからチェックしてください。",
    en: "OCR text was added to the input. Review it before checking ingredients."
  },
  ocrDoneJp: {
    ja: "OCR結果を入力欄に入れました。文字化け・途中切れがないか確認してください。",
    en: "OCR text was added to the input. Check for broken or missing characters."
  },
  ocrFailed: {
    ja: "OCRに失敗しました。画像を変更するか、成分表示を手入力してください。",
    en: "OCR failed. Try another image or paste the ingredient text manually."
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  setupLanguageSwitch();
  setupTabs();
  setupFastCheck();
  setupJBTranslator();
  setupResets();
  setupSamples();
  await loadDictionary();
});

function setupLanguageSwitch() {
  const saved = safeStorageGet("inci-fastscan-lang");
  const browserLang = (navigator.language || "").toLowerCase();
  const initial = saved || (browserLang.startsWith("ja") ? "ja" : "en");
  applyLanguage(initial);

  document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(button => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });
}

function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "ja";
  document.documentElement.lang = currentLang;
  safeStorageSet("inci-fastscan-lang", currentLang);

  document.querySelectorAll("[data-lang-text]").forEach(el => {
    const value = currentLang === "ja" ? el.dataset.ja : el.dataset.en;
    if (value !== undefined) el.innerHTML = value;
  });

  document.querySelectorAll("[data-placeholder-ja][data-placeholder-en]").forEach(el => {
    el.placeholder = currentLang === "ja" ? el.dataset.placeholderJa : el.dataset.placeholderEn;
  });

  document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });

  refreshLanguageDependentUi();
}

function refreshLanguageDependentUi() {
  refreshDictionaryStatus();
  if (lastFastResults) renderResults(document.getElementById("fast-results"), lastFastResults, currentLang);
  if (lastJbResults) renderResults(document.getElementById("jb-results"), lastJbResults, currentLang);
}

function refreshDictionaryStatus() {
  const status = document.getElementById("dict-status");
  if (!status) return;

  if (lastDictionaryStatus === "loaded") {
    status.className = "status-note status-ok";
    status.textContent = getText("dictLoaded", DICT.length);
  } else if (lastDictionaryStatus === "partial") {
    status.className = "status-note status-warn";
    status.textContent = getText("dictPartial", DICT.length);
  } else if (lastDictionaryStatus === "fallback") {
    status.className = "status-note status-warn";
    status.textContent = getText("dictFallback");
  } else {
    status.className = "status-note";
    status.textContent = getText("dictLoading");
  }
}

function getText(key, ...args) {
  const item = UI_TEXT[key];
  if (!item) return "";
  const value = item[currentLang] || item.ja || item.en;
  return typeof value === "function" ? value(...args) : value;
}

async function loadDictionary() {
  const status = document.getElementById("dict-status");
  lastDictionaryStatus = "loading";
  setCheckButtonsDisabled(true);
  if (status) {
    status.hidden = false;
    refreshDictionaryStatus();
  }

  try {
    const results = await Promise.allSettled(
      DICTIONARY_FILES.map(async file => {
        const response = await fetch(file, { cache: "no-store" });
        if (!response.ok) throw new Error(`${file} HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error(`${file} is not an array`);
        return data;
      })
    );

    const loaded = results
      .filter(result => result.status === "fulfilled")
      .flatMap(result => result.value);

    if (!loaded.length) throw new Error("No dictionary files loaded");

    DICT = dedupeDictionary(loaded);
    dictReady = true;
    lastDictionaryStatus = results.some(result => result.status === "rejected") ? "partial" : "loaded";
    refreshDictionaryStatus();
  } catch (error) {
    console.error(error);
    DICT = FALLBACK_DICT;
    dictReady = true;
    lastDictionaryStatus = "fallback";
    refreshDictionaryStatus();
  } finally {
    setCheckButtonsDisabled(false);
  }
}

function dedupeDictionary(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    if (!item || !item.en) continue;
    const key = String(item.id || item.en).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function setCheckButtonsDisabled(disabled) {
  ["btn-fast-check", "btn-jb-check"].forEach(id => {
    const button = document.getElementById(id);
    if (button) button.disabled = disabled;
  });
}

function setupTabs() {
  const tabFast = document.getElementById("tab-fast");
  const tabJB = document.getElementById("tab-jb");
  const panelFast = document.getElementById("tab-fast-panel");
  const panelJB = document.getElementById("tab-jb-panel");

  tabFast.onclick = () => {
    tabFast.classList.add("active");
    tabJB.classList.remove("active");
    panelFast.classList.add("active");
    panelJB.classList.remove("active");
  };

  tabJB.onclick = () => {
    tabJB.classList.add("active");
    tabFast.classList.remove("active");
    panelJB.classList.add("active");
    panelFast.classList.remove("active");
  };
}

function setupFastCheck() {
  document.getElementById("btn-fast-check").onclick = async () => {
    const text = document.getElementById("fast-input").value;
    if (!dictReady) return;
    const analysis = await coreAnalyzeIngredients(text, DICT);
    lastFastResults = analysis.results;
    renderResults(document.getElementById("fast-results"), lastFastResults, currentLang);
  };

  document.getElementById("btn-ocr-run-fast").onclick = async () => {
    const file = document.getElementById("ocr-file-fast").files[0];
    const status = document.getElementById("fast-ocr-status");
    if (!file) {
      setStatus(status, getText("chooseImage"), "status-warn");
      return;
    }

    const btn = document.getElementById("btn-ocr-run-fast");
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Running...";
    setStatus(status, getText("ocrRunning"), "");

    try {
      const text = await runOCR(file, "eng");
      const processed = postProcessOcrText(text, { langHint: "en" });
      document.getElementById("fast-input").value = processed;
      setStatus(status, getText("ocrDone"), "status-ok");
    } catch (e) {
      console.error(e);
      setStatus(status, getText("ocrFailed"), "status-warn");
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  };
}

function setupJBTranslator() {
  document.getElementById("btn-jb-check").onclick = async () => {
    const text = document.getElementById("jb-input").value;
    if (!dictReady) return;
    const analysis = await coreAnalyzeIngredients(text, DICT);
    lastJbResults = analysis.results;
    renderResults(document.getElementById("jb-results"), lastJbResults, currentLang);
  };

  document.getElementById("btn-ocr-run").onclick = async () => {
    const file = document.getElementById("ocr-file").files[0];
    const status = document.getElementById("jb-ocr-status");
    if (!file) {
      setStatus(status, getText("chooseImage"), "status-warn");
      return;
    }

    const btn = document.getElementById("btn-ocr-run");
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Running...";
    setStatus(status, getText("ocrRunningJp"), "");

    try {
      const text = await runOCR(file, "jpn+eng");
      const processed = postProcessOcrText(text, { langHint: "jp" });
      document.getElementById("jb-input").value = processed;
      setStatus(status, getText("ocrDoneJp"), "status-ok");
    } catch (e) {
      console.error(e);
      setStatus(status, getText("ocrFailed"), "status-warn");
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  };
}

function setupSamples() {
  const fastSample = document.getElementById("btn-fast-sample");
  const jbSample = document.getElementById("btn-jb-sample");

  if (fastSample) {
    fastSample.onclick = () => {
      document.getElementById("fast-input").value = "Water, Glycerin, Niacinamide, Butylene Glycol, Sodium Hyaluronate, Fragrance";
    };
  }

  if (jbSample) {
    jbSample.onclick = () => {
      document.getElementById("jb-input").value = "水、グリセリン、ナイアシンアミド、BG、ヒアルロン酸Na、香料";
    };
  }
}

function setupResets() {
  const fastReset = document.getElementById("btn-fast-reset");
  if (fastReset) {
    fastReset.onclick = () => {
      const input = document.getElementById("fast-input");
      const results = document.getElementById("fast-results");
      const file = document.getElementById("ocr-file-fast");
      const ocrBtn = document.getElementById("btn-ocr-run-fast");
      const status = document.getElementById("fast-ocr-status");

      if (input) input.value = "";
      if (results) results.innerHTML = "";
      if (file) file.value = "";
      if (status) status.hidden = true;
      lastFastResults = null;
      if (ocrBtn) {
        ocrBtn.disabled = false;
        ocrBtn.textContent = "Run OCR (EN)";
      }
    };
  }

  const jbReset = document.getElementById("btn-jb-reset");
  if (jbReset) {
    jbReset.onclick = () => {
      const input = document.getElementById("jb-input");
      const results = document.getElementById("jb-results");
      const file = document.getElementById("ocr-file");
      const ocrBtn = document.getElementById("btn-ocr-run");
      const status = document.getElementById("jb-ocr-status");

      if (input) input.value = "";
      if (results) results.innerHTML = "";
      if (file) file.value = "";
      if (status) status.hidden = true;
      lastJbResults = null;
      if (ocrBtn) {
        ocrBtn.disabled = false;
        ocrBtn.textContent = "Run OCR (JP)";
      }
    };
  }
}

function setStatus(el, text, modifier) {
  if (!el) return;
  el.hidden = false;
  el.className = `status-note ${modifier || ""}`.trim();
  el.textContent = text;
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage errors in private/restricted browsing modes.
  }
}
