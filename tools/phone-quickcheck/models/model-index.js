(() => {
  "use strict";

  // Progressive enhancement: all 250 static rows remain available to users and
  // crawlers without JavaScript. Search text stays in the visitor's browser.
  function init() {
    const search = document.getElementById("modelSearch");
    const count = document.getElementById("modelSearchCount");
    if (!search || !count) return;
    const sections = Array.from(document.querySelectorAll('section[id^="maker-"]'));
    const groups = sections.map(section => ({
      section,
      maker: section.id.replace("maker-", "").toLowerCase(),
      rows: Array.from(section.querySelectorAll("tbody tr"))
    }));
    const total = groups.reduce((n,group) => n + group.rows.length,0);
    const clean = text => String(text || "").normalize("NFKC").toLowerCase().trim();

    function filter() {
      const query = clean(search.value);
      let visible = 0;
      for (const group of groups) {
        let visibleHere = 0;
        for (const row of group.rows) {
          const link = row.querySelector("th a");
          const haystack = clean(group.maker + " " + (link?.textContent || ""));
          const matches = !query || haystack.includes(query);
          row.hidden = !matches;
          if (matches) { visible++; visibleHere++; }
        }
        group.section.hidden = visibleHere === 0;
      }
      count.textContent = visible
        ? visible + " / " + total + "機種を表示"
        : "該当する機種がありません。別の名前で検索してください。";
    }

    for (const group of groups) {
      for (const row of group.rows) {
        // Track both the main tool handoff and any directly linked SEO profile.
        // Retain the coarse event schema; neither the search text nor model identity leaves the browser.
        for (const anchor of row.querySelectorAll("th a")) {
          anchor.addEventListener("click", () => {
            if (typeof window.gtag !== "function") return;
            window.gtag("event", "phone_index_model_click", {
              tool_slug: "phone-quickcheck",
              maker_bucket: group.maker,
              placement: "static_model_index"
            });
          });
        }
      }
    }

    search.addEventListener("input", filter);
    filter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init,{once:true});
  } else {
    init();
  }
})();
