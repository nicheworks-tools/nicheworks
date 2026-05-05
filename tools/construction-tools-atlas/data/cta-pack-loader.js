(() => {
  "use strict";

  const MANIFEST_URL = "./data/packs/manifest.json";
  let packCache = null;

  const originalFetch = window.fetch.bind(window);

  function isBaseDataUrl(url) {
    const s = String(url || "");
    return /tools\.basic\.json(?:$|[?#])/.test(s);
  }

  function normalizePackItem(item) {
    if (!Array.isArray(item)) return item;
    const [id, ja, en, cat, task, summaryJa, summaryEn, detailJa, detailEn, aliasesJa = [], aliasesEn = []] = item;
    return {
      id,
      type: "pack_term",
      term: { ja, en },
      aliases: { ja: aliasesJa, en: aliasesEn },
      description: { ja: detailJa, en: detailEn },
      categories: [cat],
      tasks: [task],
      fuzzy: [ja, en, cat, task, ...aliasesJa, ...aliasesEn],
      region: ["jp", "global"],
      summary_ja: summaryJa,
      summary_en: summaryEn,
      detail_ja: detailJa,
      detail_en: detailEn,
      bullets_ja: [],
      bullets_en: [],
      examples: {
        ja: [`${ja}を使う場面を確認する。`],
        en: [`Check when ${en} is used.`]
      },
      summary: { ja: summaryJa, en: summaryEn },
      bullets: { ja: [], en: [] },
      meta: { pack: true }
    };
  }

  async function loadOnePack(file) {
    try {
      const res = await originalFetch(`./data/packs/${file}`, { cache: "no-store" });
      if (!res.ok) {
        console.warn(`CTA pack skipped: ${file} ${res.status}`);
        return [];
      }
      const raw = await res.json();
      return Array.isArray(raw) ? raw.map(normalizePackItem) : [];
    } catch (error) {
      console.warn(`CTA pack skipped: ${file}`, error);
      return [];
    }
  }

  async function loadPacks() {
    if (packCache) return packCache;
    try {
      const manifestRes = await originalFetch(MANIFEST_URL, { cache: "no-store" });
      if (!manifestRes.ok) throw new Error(`manifest ${manifestRes.status}`);
      const manifest = await manifestRes.json();
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      const chunks = await Promise.all(files.map(loadOnePack));
      packCache = chunks.flat();
      return packCache;
    } catch (error) {
      console.warn("CTA pack loading failed", error);
      packCache = [];
      return packCache;
    }
  }

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const res = await originalFetch(input, init);
    if (!isBaseDataUrl(url)) return res;
    try {
      const raw = await res.clone().json();
      const base = Array.isArray(raw) ? raw : Array.isArray(raw?.entries) ? raw.entries : Array.isArray(raw?.data) ? raw.data : [];
      const packs = await loadPacks();
      const seen = new Set();
      const merged = [];
      for (const item of base.concat(packs)) {
        if (!item || !item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
      return new Response(JSON.stringify(merged), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "X-CTA-Pack-Count": String(packs.length),
          "X-CTA-Merged-Count": String(merged.length)
        }
      });
    } catch (error) {
      console.warn("CTA base merge failed", error);
      return res;
    }
  };
})();
