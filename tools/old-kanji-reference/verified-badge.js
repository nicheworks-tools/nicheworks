(() => {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function applyLanguageScope(root = document) {
    const lang = currentLang();
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
  }

  function codePointToEntity(text) {
    return Array.from(String(text || ""))
      .map((char) => `&#x${char.codePointAt(0).toString(16).toUpperCase()};`)
      .join("");
  }

  function fixEntityDetailPanel() {
    const panel = document.getElementById("detailPanel");
    if (!panel || !panel.classList.contains("open")) return;

    applyLanguageScope(panel);

    const glyphs = panel.querySelectorAll(".glyph-large");
    const oldGlyph = glyphs[0]?.textContent || "";
    const modernGlyph = glyphs[1]?.textContent || "";
    if (!oldGlyph && !modernGlyph) return;

    const oldEntity = codePointToEntity(oldGlyph);
    const modernEntity = codePointToEntity(modernGlyph);

    const entityBlock = Array.from(panel.querySelectorAll(".code-block")).find((block) => {
      const text = block.textContent || "";
      return text.includes("HTML") || text.includes("エンティティ");
    });
    const codeEls = entityBlock ? entityBlock.querySelectorAll("code") : [];
    if (codeEls[0]) codeEls[0].textContent = oldEntity;
    if (codeEls[1]) codeEls[1].textContent = modernEntity;

    panel.querySelectorAll(".detail-actions .copy-btn").forEach((button) => {
      const text = button.textContent || "";
      if (text.includes("旧字HTML") || /old HTML/i.test(text)) button.dataset.copyValue = oldEntity;
      if (text.includes("新字HTML") || /modern HTML/i.test(text)) button.dataset.copyValue = modernEntity;
    });
  }

  function enhanceMetaLine(meta) {
    if (!meta || meta.dataset.badgeEnhanced === "1") return;

    const ja = meta.querySelector('[data-i18n="ja"]');
    const en = meta.querySelector('[data-i18n="en"]');
    if (!ja || !en) return;

    const jaText = ja.textContent.trim();
    const enText = en.textContent.trim();

    const jaMatch = jaText.match(/^分類：(.+?)(?:\s*\/\s*確認済み)?$/);
    const enMatch = enText.match(/^Category:\s*(.+?)(?:\s*\/\s*verified)?$/);
    if (!jaMatch || !enMatch) return;

    const jaCategory = jaMatch[1].trim();
    const enCategory = enMatch[1].trim();
    const verified = /確認済み/.test(jaText) || /verified/i.test(enText);

    ja.innerHTML = `<span class="meta-label">分類</span><span class="category-badge">${escapeHtml(jaCategory)}</span>${verified ? '<span class="verified-badge">確認済み</span>' : ''}`;
    en.innerHTML = `<span class="meta-label">Category</span><span class="category-badge">${escapeHtml(enCategory)}</span>${verified ? '<span class="verified-badge">Verified</span>' : ''}`;

    meta.classList.add("kanji-meta-badges");
    meta.dataset.badgeEnhanced = "1";
  }

  function enhanceAll() {
    document.querySelectorAll(".kanji-meta").forEach(enhanceMetaLine);
  }

  function insertToolLinks() {
    if (document.querySelector(".old-kanji-tool-links")) return;
    const searchPanel = document.querySelector(".search-panel");
    if (!searchPanel) return;

    const box = document.createElement("section");
    box.className = "old-kanji-tool-links";
    box.innerHTML = `
      <div class="tool-link-card">
        <p data-i18n="ja" class="tool-link-title">文章全体を変換したい場合</p>
        <p data-i18n="en" class="tool-link-title">Need full-text conversion?</p>
        <p data-i18n="ja" class="tool-link-desc">このページは1文字ずつ確認する旧字体一覧です。文章全体を変換したい場合は、旧字体変換ツールを使ってください。</p>
        <p data-i18n="en" class="tool-link-desc">This page is a per-character reference. Use the converter tool if you want to convert a full sentence or paragraph.</p>
        <a href="/tools/kanji-modernizer/" class="tool-link-button" data-i18n="ja">旧字体変換ツールへ</a>
        <a href="/tools/kanji-modernizer/" class="tool-link-button" data-i18n="en">Open converter</a>
      </div>
    `;
    searchPanel.insertAdjacentElement("afterend", box);
  }

  function insertFaqForConverter() {
    const faq = document.querySelector(".faq-section");
    if (!faq || faq.querySelector('[data-extra-faq="converter"]')) return;

    const details = document.createElement("details");
    details.dataset.extraFaq = "converter";
    details.innerHTML = `
      <summary><span data-i18n="ja">旧字体を文章ごと変換したい場合は？</span><span data-i18n="en">How can I convert a full text?</span></summary>
      <p data-i18n="ja">この一覧は旧字と新字の対応を確認するためのページです。文章全体を変換したい場合は、旧字体変換ツールを使ってください。</p>
      <p data-i18n="en">This reference is for checking character pairs. For full text conversion, use the Old Kanji Converter tool.</p>
    `;
    faq.appendChild(details);
  }

  function applyMobileCompactHints() {
    document.querySelectorAll(".group-wrapper .kanji-card").forEach((card) => {
      if (card.dataset.mobileEnhanced === "1") return;
      const hasMeaning = card.querySelector(".kanji-meaning");
      const hasUsage = card.querySelector(".kanji-usage");
      if (!hasMeaning && !hasUsage) card.classList.add("kanji-card-basic");
      card.dataset.mobileEnhanced = "1";
    });
  }

  function syncLanguageDisplay() {
    applyLanguageScope(document);
    fixEntityDetailPanel();
  }

  function enhancePage() {
    enhanceAll();
    insertToolLinks();
    insertFaqForConverter();
    applyMobileCompactHints();
    syncLanguageDisplay();
  }

  document.addEventListener("DOMContentLoaded", () => {
    enhancePage();
    const target = document.getElementById("groupContainer") || document.body;
    const observer = new MutationObserver(() => enhancePage());
    observer.observe(target, { childList: true, subtree: true });

    document.addEventListener("click", () => setTimeout(fixEntityDetailPanel, 0), true);

    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setTimeout(syncLanguageDisplay, 0));
    });
  });
})();
