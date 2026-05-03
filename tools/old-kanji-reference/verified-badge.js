(() => {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  document.addEventListener("DOMContentLoaded", () => {
    enhanceAll();
    const target = document.getElementById("groupContainer") || document.body;
    const observer = new MutationObserver(() => enhanceAll());
    observer.observe(target, { childList: true, subtree: true });
  });
})();
