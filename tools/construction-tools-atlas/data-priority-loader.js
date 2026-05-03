(() => {
  "use strict";

  const $ = (q) => document.querySelector(q);

  function esc(s){
    return String(s || "").replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  }

  function normalize(x, i){
    return {
      id: x && x.id ? x.id : `row_${i}`,
      ja: (x && x.term && x.term.ja) || x.ja || "",
      en: (x && x.term && x.term.en) || x.en || "",
      descJa: (x && x.summary && x.summary.ja) || x.summary_ja || (x && x.description && x.description.ja) || x.detail_ja || "",
      descEn: (x && x.summary && x.summary.en) || x.summary_en || (x && x.description && x.description.en) || x.detail_en || "",
      aliasesJa: (x && x.aliases && x.aliases.ja) || [],
      aliasesEn: (x && x.aliases && x.aliases.en) || []
    };
  }

  function match(e, q){
    if (!q) return true;
    const hay = [e.ja, e.en, e.descJa, e.descEn, ...e.aliasesJa, ...e.aliasesEn].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  async function forceRender(){
    const list = $("#resultList");
    const count = $("#resultCount");
    if (!list || !count) return;

    let entries = [];
    try {
      const res = await fetch("./data/tools.basic.json?v=20260503-4", { cache: "no-store" });
      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.entries) ? raw.entries : []);
      entries = arr.map(normalize).filter((e) => e.ja || e.en);
    } catch (err) {
      const status = $("#statusArea");
      if (status) {
        status.hidden = false;
        status.textContent = `Data load failed: ${err.message || err}`;
      }
      return;
    }

    function render(){
      const q = ($("#searchInput") && $("#searchInput").value.trim()) || "";
      const visible = entries.filter((e) => match(e, q));
      list.innerHTML = visible.slice(0, 500).map((e) => `
        <div class="row" role="listitem" data-fallback="1">
          <div class="row__main">
            <div class="row__title">${esc(e.en || "—")} / ${esc(e.ja || "—")}</div>
            <div class="row__desc">${esc(e.descJa || e.descEn || "")}</div>
          </div>
        </div>
      `).join("");
      count.textContent = `結果: ${visible.length}件`;
      const status = $("#statusArea");
      if (status) status.hidden = true;
      const more = $("#loadMoreWrap");
      if (more) more.hidden = true;
    }

    render();
    const input = $("#searchInput");
    if (input) input.addEventListener("input", render);
  }

  function loadUxFinal(){
    if (document.querySelector('script[data-cta-ux-final="1"]')) return;
    const script = document.createElement("script");
    script.dataset.ctaUxFinal = "1";
    script.src = "./ux-final.js?v=20260503-4";
    script.async = false;
    (document.body || document.documentElement).appendChild(script);
  }

  function boot(){
    loadUxFinal();
    setTimeout(forceRender, 250);
  }

  if (document.body) boot();
  else document.addEventListener("DOMContentLoaded", boot, { once: true });
})();
