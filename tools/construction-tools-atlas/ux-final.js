(() => {
  "use strict";

  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
  const lang = () => localStorage.getItem("cta_uilang") === "en" ? "en" : "ja";

  const copy = {
    ja: {
      popularTitle: "よく使う検索",
      popular: ["インパクト", "丸のこ", "レベル", "墨つぼ", "養生", "石膏ボード", "コーキング", "安全帯"],
      emptyTitle: "見つからない場合",
      emptyTips: ["短い単語で検索する", "別名で探す", "英語名でも試す"],
      disclaimer: "当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。"
    },
    en: {
      popularTitle: "Popular searches",
      popular: ["impact", "circular saw", "level", "chalk line", "masking", "drywall", "caulking", "harness"],
      emptyTitle: "If you cannot find a term",
      emptyTips: ["Try a shorter keyword", "Try an alias", "Try Japanese or English"],
      disclaimer: "This site may contain ads. Information accuracy is not guaranteed. Always check official sources when needed."
    }
  };

  function ensurePopularSearches(){
    let section = $("#popularSearches");
    if (section) return section;
    const search = $(".search");
    if (!search || !search.parentNode) return null;
    section = document.createElement("section");
    section.className = "popularSearches";
    section.id = "popularSearches";
    section.innerHTML = '<div class="popularSearches__title" id="popularSearchesTitle"></div><div class="popularSearches__chips" id="popularSearchesChips"></div>';
    search.parentNode.insertBefore(section, search);
    return section;
  }

  function renderPopularSearches(){
    ensurePopularSearches();
    const l = lang();
    const input = $("#searchInput");
    const title = $("#popularSearchesTitle");
    const chips = $("#popularSearchesChips");
    if (title) title.textContent = copy[l].popularTitle;
    if (!chips || !input) return;
    chips.innerHTML = "";
    copy[l].popular.forEach((word) => {
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
  }

  function ensureEmptyHelp(){
    let box = $("#emptySearchHelp");
    if (box) return box;
    const status = $("#statusArea");
    if (!status || !status.parentNode) return null;
    box = document.createElement("section");
    box.className = "emptySearchHelp";
    box.id = "emptySearchHelp";
    box.hidden = true;
    status.parentNode.insertBefore(box, status.nextSibling);
    return box;
  }

  function renderEmptyHelp(){
    const box = ensureEmptyHelp();
    const count = $("#resultCount");
    if (!box || !count) return;
    const n = Number((count.textContent.match(/\d+/) || ["0"])[0]);
    const input = $("#searchInput");
    const hasQuery = Boolean(input && input.value.trim());
    box.hidden = !(hasQuery && n === 0);
    if (box.hidden) return;
    const l = lang();
    box.innerHTML = `<strong>${escapeHtml(copy[l].emptyTitle)}</strong><ul>${copy[l].emptyTips.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  }

  function patchFooter(){
    const footer = $("#footerDisclaimer");
    if (footer) footer.textContent = copy[lang()].disclaimer;
  }

  function apply(){
    renderPopularSearches();
    renderEmptyHelp();
    patchFooter();
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    const target = $("#resultCount");
    if (target) new MutationObserver(apply).observe(target, { childList: true, characterData: true, subtree: true });
    const input = $("#searchInput");
    if (input) input.addEventListener("input", () => setTimeout(apply, 0));
    const langBtn = $("#langBtn");
    if (langBtn) langBtn.addEventListener("click", () => setTimeout(apply, 30));
  });
})();
