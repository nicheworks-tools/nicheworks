(() => {
  "use strict";

  const QUALITY_FILES = [
    "./data/tools.quality-001.json",
    "./data/tools.quality-002.json",
    "./data/tools.quality-003.json",
    "./data/tools.quality-004.json",
    "./data/tools.quality-005.json",
    "./data/tools.quality-006.json",
    "./data/tools.quality-007.json",
    "./data/tools.quality-008.json",
    "./data/tools.quality-009.json",
    "./data/tools.quality-010.json"
  ];
  const originalFetch = window.fetch.bind(window);

  function isBasicData(url) {
    return /tools\.basic\.json(?:$|[?#])/.test(String(url || ""));
  }

  async function fetchQuality() {
    const chunks = await Promise.all(QUALITY_FILES.map(async (path) => {
      try {
        const res = await originalFetch(path, { cache: "no-store" });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn("quality data skipped", path, err);
        return [];
      }
    }));
    return chunks.flat();
  }

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const response = await originalFetch(input, init);
    if (!isBasicData(url)) return response;
    try {
      const base = await response.clone().json();
      const arr = Array.isArray(base) ? base : Array.isArray(base?.entries) ? base.entries : Array.isArray(base?.data) ? base.data : [];
      const quality = await fetchQuality();
      const seen = new Set();
      const merged = [];
      for (const item of quality.concat(arr)) {
        if (!item || !item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
      return new Response(JSON.stringify(merged), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    } catch (err) {
      console.warn("quality merge failed", err);
      return response;
    }
  };
})();
