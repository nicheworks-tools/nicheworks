(() => {
  "use strict";
  const $ = (q, el = document) => el.querySelector(q);
  const words = ["インパクト", "丸のこ", "レベル", "墨つぼ", "養生", "石膏ボード", "コーキング", "安全帯"];

  function initPopularSearches(){
    if (document.querySelector("#popularSearches")) return;
    const search = document.querySelector(".search");
    const input = document.querySelector("#searchInput");
    if (!search || !input || !search.parentNode) return;

    const section = document.createElement("section");
    section.className = "popularSearches";
    section.id = "popularSearches";
    const title = document.createElement("div");
    title.className = "popularSearches__title";
    title.textContent = "よく使う検索";
    const chips = document.createElement("div");
    chips.className = "popularSearches__chips";

    words.forEach((word) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pillbtn";
      btn.textContent = word;
      btn.addEventListener("click", () => {
        input.value = word;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      });
      chips.appendChild(btn);
    });

    section.appendChild(title);
    section.appendChild(chips);
    search.parentNode.insertBefore(section, search);
  }

  document.addEventListener("DOMContentLoaded", initPopularSearches);
})();
