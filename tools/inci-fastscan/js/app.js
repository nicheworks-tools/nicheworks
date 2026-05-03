let DICT = [];
let dictReady = false;

const FALLBACK_DICT = [
  {
    en: "Water",
    jp: ["水"],
    alias: ["Aqua"],
    safety: "safe",
    note_short: "Common solvent/base ingredient."
  },
  {
    en: "Glycerin",
    jp: ["グリセリン"],
    alias: [],
    safety: "safe",
    note_short: "Common humectant used for moisturizing support."
  },
  {
    en: "Niacinamide",
    jp: ["ナイアシンアミド"],
    alias: [],
    safety: "safe",
    note_short: "Common skin-conditioning ingredient; some users may feel irritation."
  },
  {
    en: "Fragrance",
    jp: ["香料"],
    alias: ["Parfum"],
    safety: "caution",
    note_short: "Review if you are sensitive to fragrance or have known allergies."
  }
];

window.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  setupFastCheck();
  setupJBTranslator();
  setupResets();
  setupSamples();
  await loadDictionary();
});

async function loadDictionary() {
  const status = document.getElementById("dict-status");
  setCheckButtonsDisabled(true);
  if (status) {
    status.hidden = false;
    status.className = "status-note";
    status.textContent = "成分辞書を読み込み中です... / Loading ingredient dictionary...";
  }

  try {
    const response = await fetch("data/ingredients.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Dictionary HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Dictionary is not an array");
    DICT = data;
    dictReady = true;
    if (status) {
      status.className = "status-note status-ok";
      status.textContent = `成分辞書を読み込みました。${DICT.length}件 / Dictionary loaded: ${DICT.length} items.`;
    }
  } catch (error) {
    console.error(error);
    DICT = FALLBACK_DICT;
    dictReady = true;
    if (status) {
      status.className = "status-note status-warn";
      status.textContent = "成分辞書の読み込みに失敗したため、最低限のフォールバック辞書で動作しています。正確な確認にはページを再読み込みしてください。";
    }
  } finally {
    setCheckButtonsDisabled(false);
  }
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
    renderResults(document.getElementById("fast-results"), analysis.results);
  };

  document.getElementById("btn-ocr-run-fast").onclick = async () => {
    const file = document.getElementById("ocr-file-fast").files[0];
    const status = document.getElementById("fast-ocr-status");
    if (!file) {
      setStatus(status, "画像を選択してください。 / Choose an image first.", "status-warn");
      return;
    }

    const btn = document.getElementById("btn-ocr-run-fast");
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Running...";
    setStatus(status, "OCR実行中です。画像の状態によって時間がかかります。 / Running OCR...", "");

    try {
      const text = await runOCR(file, "eng");
      const processed = postProcessOcrText(text, { langHint: "en" });
      document.getElementById("fast-input").value = processed;
      setStatus(status, "OCR結果を入力欄に入れました。誤認識がないか確認してからチェックしてください。", "status-ok");
    } catch (e) {
      console.error(e);
      setStatus(status, "OCRに失敗しました。画像を変更するか、成分表示を手入力してください。", "status-warn");
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
    renderResults(document.getElementById("jb-results"), analysis.results);
  };

  document.getElementById("btn-ocr-run").onclick = async () => {
    const file = document.getElementById("ocr-file").files[0];
    const status = document.getElementById("jb-ocr-status");
    if (!file) {
      setStatus(status, "画像を選択してください。 / Choose an image first.", "status-warn");
      return;
    }

    const btn = document.getElementById("btn-ocr-run");
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Running...";
    setStatus(status, "OCR実行中です。日本語OCRは時間がかかる場合があります。 / Running OCR...", "");

    try {
      const text = await runOCR(file, "jpn+eng");
      const processed = postProcessOcrText(text, { langHint: "jp" });
      document.getElementById("jb-input").value = processed;
      setStatus(status, "OCR結果を入力欄に入れました。文字化け・途中切れがないか確認してください。", "status-ok");
    } catch (e) {
      console.error(e);
      setStatus(status, "OCRに失敗しました。画像を変更するか、成分表示を手入力してください。", "status-warn");
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
