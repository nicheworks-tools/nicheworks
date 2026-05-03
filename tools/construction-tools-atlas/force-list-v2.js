(() => {
  "use strict";
  const $ = (q) => document.querySelector(q);
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));

  function normalize(x, i){
    return {
      id: x?.id || `row_${i}`,
      ja: x?.term?.ja || x?.ja || "",
      en: x?.term?.en || x?.en || "",
      desc: x?.summary?.ja || x?.summary_ja || x?.description?.ja || x?.detail_ja || x?.summary?.en || x?.summary_en || x?.description?.en || x?.detail_en || "",
      aliases: [ ...(x?.aliases?.ja || []), ...(x?.aliases?.en || []) ]
    };
  }

  function matches(e, q){
    if (!q) return true;
    const hay = [e.ja, e.en, e.desc, ...e.aliases].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  async function run(){
    const list = $("#resultList");
    const count = $("#resultCount");
    const status = $("#statusArea");
    const input = $("#searchInput");
    if (!list || !count) return;

    if (status) {
      status.hidden = false;
      status.textContent = "データを表示しています…";
    }

    let entries = [];
    try {
      const res = await fetch("./data/tools.basic.json?force=20260504", { cache: "reload" });
      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.entries) ? raw.entries : []);
      entries = arr.map(normalize).filter((e) => e.ja || e.en);
    } catch (err) {
      if (status) status.textContent = `読み込み失敗: ${err.message || err}`;
      return;
    }

    function render(){
      const q = input ? input.value.trim() : "";
      const visible = entries.filter((e) => matches(e, q));
      list.innerHTML = visible.slice(0, 500).map((e) => `
        <article class="row" role="listitem">
          <div class="row__main">
            <div class="row__title">${esc(e.en || "—")} / ${esc(e.ja || "—")}</div>
            <div class="row__desc">${esc(e.desc)}</div>
          </div>
        </article>
      `).join("");
      count.textContent = `結果: ${visible.length}件`;
      if (status) status.hidden = true;
      const more = $("#loadMoreWrap");
      if (more) more.hidden = true;
    }

    render();
    if (input) input.addEventListener("input", render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
