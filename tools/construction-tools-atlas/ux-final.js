(() => {
  "use strict";

  const $ = (q, el = document) => el.querySelector(q);
  const lang = () => localStorage.getItem("cta_uilang") === "en" ? "en" : "ja";

  const copy = {
    ja: {
      popularTitle: "よく使う検索",
      popular: ["インパクト", "丸のこ", "レベル", "墨つぼ", "養生", "石膏ボード", "コーキング", "安全帯"],
      emptyTitle: "見つからない場合",
      emptyTips: ["短い単語で検索する", "別名で探す", "英語名でも試す"],
      disclaimer: "当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。",
      loadingFallback: "簡易表示に切り替えました"
    },
    en: {
      popularTitle: "Popular searches",
      popular: ["impact", "circular saw", "level", "chalk line", "masking", "drywall", "caulking", "harness"],
      emptyTitle: "If you cannot find a term",
      emptyTips: ["Try a shorter keyword", "Try an alias", "Try Japanese or English"],
      disclaimer: "This site may contain ads. Information accuracy is not guaranteed. Always check official sources when needed.",
      loadingFallback: "Switched to simple list view"
    }
  };

  let fallbackEntries = [];
  let fallbackActive = false;

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
        if (fallbackActive) renderFallbackList();
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

  function normalizeItem(x, i){
    const termJa = x?.term?.ja || x?.ja || x?.summary?.ja || "";
    const termEn = x?.term?.en || x?.en || x?.summary?.en || "";
    const summaryJa = x?.summary?.ja || x?.summary_ja || x?.description?.ja || x?.detail?.ja || x?.detail_ja || "";
    const summaryEn = x?.summary?.en || x?.summary_en || x?.description?.en || x?.detail?.en || x?.detail_en || "";
    const aliasesJa = x?.aliases?.ja || [];
    const aliasesEn = x?.aliases?.en || [];
    return { id: x?.id || `fallback_${i}`, termJa, termEn, summaryJa, summaryEn, aliasesJa, aliasesEn };
  }

  function matchFallback(e, q){
    if (!q) return true;
    const hay = [e.termJa, e.termEn, e.summaryJa, e.summaryEn, ...(e.aliasesJa || []), ...(e.aliasesEn || [])].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every((s) => hay.includes(s));
  }

  function renderFallbackList(){
    const list = $("#resultList");
    const count = $("#resultCount");
    const status = $("#statusArea");
    const hint = $("#hintText");
    const input = $("#searchInput");
    if (!list || !count) return;
    const q = input ? input.value.trim() : "";
    const visible = fallbackEntries.filter((e) => matchFallback(e, q));
    list.innerHTML = "";
    const frag = document.createDocumentFragment();
    visible.slice(0, 300).forEach((e) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<div class="row__main"><div class="row__title">${escapeHtml(e.termEn || "—")} / ${escapeHtml(e.termJa || "—")}</div><div class="row__desc">${escapeHtml((lang() === "ja" ? e.summaryJa || e.summaryEn : e.summaryEn || e.summaryJa) || "")}</div></div>`;
      frag.appendChild(row);
    });
    list.appendChild(frag);
    count.textContent = lang() === "ja" ? `結果: ${visible.length}件` : `Results: ${visible.length}`;
    if (hint) hint.textContent = visible.length ? copy[lang()].loadingFallback : "";
    if (status) status.hidden = true;
    const more = $("#loadMoreWrap");
    if (more) more.hidden = true;
    renderEmptyHelp();
  }

  async function activateFallbackIfNeeded(){
    const list = $("#resultList");
    const status = $("#statusArea");
    const looksStuck = !list || list.children.length === 0;
    if (!looksStuck) return;
    try {
      const res = await fetch("./data/tools.basic.json", { cache: "no-store" });
      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.entries) ? raw.entries : []);
      fallbackEntries = arr.map(normalizeItem).filter((e) => e.termJa || e.termEn);
      fallbackActive = fallbackEntries.length > 0;
      if (fallbackActive) renderFallbackList();
      else if (status) status.textContent = "No data";
    } catch (err) {
      if (status) status.textContent = `Data load failed: ${err.message || err}`;
    }
  }

  function apply(){
    renderPopularSearches();
    renderEmptyHelp();
    patchFooter();
  }

  function boot(){
    apply();
    const target = $("#resultCount");
    if (target) new MutationObserver(apply).observe(target, { childList: true, characterData: true, subtree: true });
    const input = $("#searchInput");
    if (input) input.addEventListener("input", () => {
      setTimeout(apply, 0);
      if (fallbackActive) renderFallbackList();
    });
    const langBtn = $("#langBtn");
    if (langBtn) langBtn.addEventListener("click", () => setTimeout(() => {
      apply();
      if (fallbackActive) renderFallbackList();
    }, 30));
    setTimeout(activateFallbackIfNeeded, 1500);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
