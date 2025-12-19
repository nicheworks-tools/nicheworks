let DICT = [];

window.addEventListener("DOMContentLoaded", async () => {
  DICT = await fetch("data/ingredients.json").then(r => r.json());

  setupTabs();
  setupFastCheck();
  setupJBTranslator();
});

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
    const analysis = await coreAnalyzeIngredients(text, DICT);
    renderResults(document.getElementById("fast-results"), analysis.results);
  };

  // OCR -> fast-input (EN)
  document.getElementById("btn-ocr-run-fast").onclick = async () => {
    const file = document.getElementById("ocr-file-fast").files[0];
    if (!file) return;

    const btn = document.getElementById("btn-ocr-run-fast");
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Running...";

    try {
      const text = await runOCR(file, "eng"); // TAB1: EN
      document.getElementById("fast-input").value = text;
    } catch (e) {
      console.error(e);
      alert("OCR failed. See console for details.");
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  };
}

function setupJBTranslator() {
  document.getElementById("btn-jb-check").onclick = async () => {
    const text = document.getElementById("jb-input").value;
    const analysis = await coreAnalyzeIngredients(text, DICT);
    renderResults(document.getElementById("jb-results"), analysis.results);
  };

  // OCR -> jb-input (JP+EN)
  document.getElementById("btn-ocr-run").onclick = async () => {
    const file = document.getElementById("ocr-file").files[0];
    if (!file) return;

    const btn = document.getElementById("btn-ocr-run");
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Running...";

    try {
      const text = await runOCR(file, "jpn+eng"); // TAB2: JP+EN
      document.getElementById("jb-input").value = text;
    } catch (e) {
      console.error(e);
      alert("OCR failed. See console for details.");
    } finally {
      btn.disabled = false;
      btn.textContent = prev;
    }
  };
}
