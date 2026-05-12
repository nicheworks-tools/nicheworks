(() => {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const DEFAULT_BASE_PATHS = ["./data/tools.basic.json"];
  const DEFAULT_MANIFEST_PATH = "./data/quality-manifest.json";

  function safeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function safeArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }

  function compactToFull(row, qualityBatch) {
    const id = safeText(row?.id);
    const type = safeText(row?.t || row?.type);
    const ja = safeText(row?.ja || row?.term?.ja);
    const en = safeText(row?.en || row?.term?.en);
    const cat = safeText(row?.c || row?.category);
    const task = safeText(row?.task || row?.tsk);
    const descJa = safeText(row?.dj || row?.description_ja || row?.summary_ja);
    const descEn = safeText(row?.de || row?.description_en || row?.summary_en);
    const detailJa = safeText(row?.nj || row?.detail_ja) || `${ja}は仕様、下地条件、周辺部材との取り合いを確認して使う。施工前後の確認を省くと不具合や手戻りの原因になる。`;
    const detailEn = safeText(row?.ne || row?.detail_en) || `Use ${en} after checking the specification, substrate, and adjacent details. Missing checks can cause defects or rework.`;
    const bulletsJa = safeArray(row?.bj || row?.bullets_ja);
    const bulletsEn = safeArray(row?.be || row?.bullets_en);
    const finalBulletsJa = bulletsJa.length ? bulletsJa : ["仕様と下地条件を確認する。", "周辺部材との取り合いを確認する。"];
    const finalBulletsEn = bulletsEn.length ? bulletsEn : ["Check the specification and substrate conditions.", "Confirm adjacent details before finishing."];
    const aliasesJa = safeArray(row?.aj || row?.aliases_ja);
    const aliasesEn = safeArray(row?.ae || row?.aliases_en);
    const categories = safeArray(row?.categories || cat);
    const tasks = safeArray(row?.tasks || task);
    const fuzzy = safeArray(row?.fuzzy).concat([ja, en, cat, task]).filter(Boolean);
    const examplesJa = safeArray(row?.ej || row?.examples_ja);
    const examplesEn = safeArray(row?.ee || row?.examples_en);

    return {
      id,
      type,
      term: { ja, en },
      aliases: { ja: aliasesJa, en: aliasesEn },
      description: { ja: descJa, en: descEn },
      categories,
      tasks,
      fuzzy: [...new Set(fuzzy)],
      region: safeArray(row?.region).length ? safeArray(row.region) : ["global", "jp"],
      summary_ja: descJa,
      summary_en: descEn,
      detail_ja: detailJa,
      detail_en: detailEn,
      bullets_ja: finalBulletsJa,
      bullets_en: finalBulletsEn,
      examples: {
        ja: examplesJa.length ? examplesJa : [`${ja}を使う前に寸法と仕様を確認する。`],
        en: examplesEn.length ? examplesEn : [`Check dimensions and specifications before using ${en}.`],
      },
      summary: { ja: descJa, en: descEn },
      bullets: { ja: finalBulletsJa, en: finalBulletsEn },
      meta: { quality_batch: safeText(row?.quality_batch || qualityBatch) },
    };
  }

  function asEntries(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw?.schema === "cta-compact-v1" && Array.isArray(raw?.rows)) {
      const qualityBatch = safeText(raw?.quality_batch);
      return raw.rows.map((row) => compactToFull(row, qualityBatch));
    }
    if (Array.isArray(raw?.entries)) return raw.entries;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }

  function packPath(item) {
    if (typeof item === "string") return item.trim();
    if (item && typeof item.path === "string") return item.path.trim();
    return "";
  }

  async function fetchJson(path) {
    if (!path) return null;
    try {
      const response = await originalFetch(path, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  function manifestPaths(manifest) {
    const packs = Array.isArray(manifest?.packs) ? manifest.packs : [];
    const paths = [];
    const seen = new Set();
    packs.forEach((pack) => {
      const path = packPath(pack);
      if (!path || seen.has(path)) return;
      seen.add(path);
      paths.push(path);
    });
    return paths;
  }

  function addUnique(merged, seen, entries) {
    asEntries(entries).forEach((entry) => {
      const id = typeof entry?.id === "string" ? entry.id.trim() : "";
      if (!id || seen.has(id)) return;
      seen.add(id);
      merged.push(entry);
    });
  }

  async function loadEntries(options = {}) {
    const manifestPath = options.manifestPath || DEFAULT_MANIFEST_PATH;
    const basePaths = Array.isArray(options.basePaths) ? options.basePaths : DEFAULT_BASE_PATHS;
    const manifest = await fetchJson(manifestPath);
    const packPaths = manifestPaths(manifest);
    const merged = [];
    const seen = new Set();
    for (const path of packPaths) {
      const pack = await fetchJson(path);
      addUnique(merged, seen, pack);
    }
    for (const path of basePaths) {
      const base = await fetchJson(path);
      addUnique(merged, seen, base);
    }
    return merged;
  }

  function fixSearchInput() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const example = input.getAttribute("content") || input.getAttribute("stable") || "例：インパクト / 石膏ボード / 床レベラー / torque wrench";
    input.removeAttribute("stable");
    input.removeAttribute("content");
    input.setAttribute("placeholder", example);
  }

  function loadLatestImageHotfix() {
    try {
      if (document.querySelector('script[data-cta-image-hotfix="20260510-image-6"]')) return;
      const script = document.createElement("script");
      script.src = "./detail-image-hotfix.js?v=20260510-image-6";
      script.defer = true;
      script.dataset.ctaImageHotfix = "20260510-image-6";
      document.head.appendChild(script);
    } catch (_) {
      // Optional image pilot must not stop the dictionary.
    }
  }

  window.CTA_DATA_LOADER = { loadEntries };

  document.addEventListener("DOMContentLoaded", () => {
    fixSearchInput();
    loadLatestImageHotfix();
  });
})();
