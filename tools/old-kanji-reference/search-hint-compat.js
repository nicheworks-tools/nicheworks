(() => {
  function syncSearchHint() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    if (input.dataset.searchHintJa) input.dataset.placeholderJa = input.dataset.searchHintJa;
    if (input.dataset.searchHintEn) input.dataset.placeholderEn = input.dataset.searchHintEn;

    const lang = document.documentElement.lang === "en" ? "en" : "ja";
    input.placeholder = lang === "en"
      ? (input.dataset.searchHintEn || "Search by old form, modern form, reading, meaning, or Unicode")
      : (input.dataset.searchHintJa || "旧字体・現代表記・読み・意味・Unicodeで検索できます");
  }

  document.addEventListener("DOMContentLoaded", () => {
    syncSearchHint();
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach((button) => {
      button.addEventListener("click", () => window.setTimeout(syncSearchHint, 0));
    });
  });
})();
