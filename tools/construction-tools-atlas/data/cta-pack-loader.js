(() => {
  "use strict";

  const MANIFEST_URL = "./data/packs/manifest.json";
  let packCache = null;
  const originalFetch = window.fetch.bind(window);

  function isBaseDataUrl(url) {
    return /tools\.basic\.json(?:$|[?#])/.test(String(url || ""));
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizePackItem(item) {
    if (!Array.isArray(item)) return item;
    const [id, ja, en, cat, task, summaryJa, summaryEn, detailJa, detailEn, aliasesJa = [], aliasesEn = []] = item;
    const sj = summaryJa || `${ja}：${cat}分野の${task || "現場"}に関する用語`;
    const se = summaryEn || `${en}: a ${cat} term used around ${task || "site"} work.`;
    const dj = detailJa || `${ja}は、${cat}分野で使われる現場用語です。用途、材料、周辺部材、施工条件を確認します。`;
    const de = detailEn || `${en} is a construction reference term used in ${cat} work. Check purpose, material, adjacent components, and work conditions.`;
    const aj = arr(aliasesJa);
    const ae = arr(aliasesEn);
    return {
      id,
      type: "pack_term",
      term: { ja, en },
      aliases: { ja: aj, en: ae },
      description: { ja: dj, en: de },
      categories: [cat].filter(Boolean),
      tasks: [task].filter(Boolean),
      fuzzy: [ja, en, cat, task, ...aj, ...ae].filter(Boolean),
      region: ["jp", "global"],
      summary_ja: sj,
      summary_en: se,
      detail_ja: dj,
      detail_en: de,
      bullets_ja: ["用途と施工条件を確認する。", "必要に応じて公式資料や現場基準を確認する。"],
      bullets_en: ["Confirm purpose and work conditions.", "Check official or site-specific standards when needed."],
      examples: { ja: [`${ja}を使う場面を確認する。`], en: [`Check when ${en} is used.`] },
      summary: { ja: sj, en: se },
      bullets: {
        ja: ["用途と施工条件を確認する。", "必要に応じて公式資料や現場基準を確認する。"],
        en: ["Confirm purpose and work conditions.", "Check official or site-specific standards when needed."]
      },
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
