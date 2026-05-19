(() => {
  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function codePointToEntity(text) {
    return Array.from(String(text || ""))
      .map((char) => `&#x${char.codePointAt(0).toString(16).toUpperCase()};`)
      .join("");
  }

  function applyLanguage() {
    const lang = currentLang();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
  }

  function setHtmlCopyButtonValue(button, entity) {
    if (!button || !entity) return;
    button.dataset.copyValue = entity;
  }

  function fixDetailPanel() {
    const panel = document.getElementById("detailPanel");
    if (!panel || !panel.classList.contains("open")) return;

    applyLanguage();

    const glyphs = panel.querySelectorAll(".glyph-large");
    const oldGlyph = glyphs[0]?.textContent || "";
    const modernGlyph = glyphs[1]?.textContent || "";
    const oldEntity = codePointToEntity(oldGlyph);
    const modernEntity = codePointToEntity(modernGlyph);

    const codeBlocks = panel.querySelectorAll(".code-block");
    const entityBlock = Array.from(codeBlocks).find((block) => block.textContent.includes("HTML") || block.textContent.includes("エンティティ"));
    const codes = entityBlock ? entityBlock.querySelectorAll("code") : [];
    if (codes[0]) codes[0].textContent = oldEntity;
    if (codes[1]) codes[1].textContent = modernEntity;

    const buttons = Array.from(panel.querySelectorAll(".detail-actions .copy-btn"));
    buttons.forEach((button) => {
      const text = button.textContent || "";
      if (text.includes("旧字HTML") || text.includes("old HTML")) setHtmlCopyButtonValue(button, oldEntity);
      if (text.includes("新字HTML") || text.includes("modern HTML")) setHtmlCopyButtonValue(button, modernEntity);
    });
  }

  function scheduleFix() {
    window.setTimeout(fixDetailPanel, 0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLanguage();
    document.addEventListener("click", scheduleFix, true);
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach((button) => {
      button.addEventListener("click", () => window.setTimeout(() => {
        applyLanguage();
        fixDetailPanel();
      }, 0));
    });
  });
})();
