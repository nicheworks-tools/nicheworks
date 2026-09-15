(() => {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const DEFAULT_BASE_PATHS = ["./data/tools.basic.json"];
  const DEFAULT_MANIFEST_PATH = "./data/quality-manifest.json";
  const DEFAULT_ENRICHMENT_PATH = "./data/content-enrichment-v2.3.json";
  const DEFAULT_REDIRECT_PATH = "./data/canonical-redirects-v2.3.json";
  const DEFAULT_IDENTITY_RESOLUTION_PATH = "./data/canonical-identity-resolutions-v2.3.json";
  const GENERATED_FILLER_BATCHES = new Set(["direct-5000", "atlas-expand-5000"]);
  const FAVORITES_KEY = "cta_favs";

  function safeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function safeArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }

  function uniqueText(values) {
    return [...new Set(safeArray(values).map((value) => value.trim()).filter(Boolean))];
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

  function normalizeTerm(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\s\u3000]+/g, " ")
      .replace(/[／]/g, "/")
      .trim();
  }

  function termKey(entry) {
    const ja = normalizeTerm(entry?.term?.ja || entry?.ja || entry?.summary?.ja || "");
    const en = normalizeTerm(entry?.term?.en || entry?.en || entry?.summary?.en || "");
    if (!ja && !en) return "";
    return `${ja}::${en}`;
  }

  function generatedFillerBatch(entry) {
    if (entry?.meta?.generated !== true) return "";
    const batch = safeText(entry?.meta?.batch);
    return GENERATED_FILLER_BATCHES.has(batch) ? batch : "";
  }

  function addUnique(merged, seenIds, seenTerms, entries, stats, sourcePath) {
    asEntries(entries).forEach((entry) => {
      stats.raw += 1;
      const id = typeof entry?.id === "string" ? entry.id.trim() : "";
      if (!id) {
        stats.skippedMissingId += 1;
        return;
      }

      const fillerBatch = generatedFillerBatch(entry);
      if (fillerBatch) {
        stats.quarantinedGenerated += 1;
        stats.quarantinedGeneratedByBatch[fillerBatch] = (stats.quarantinedGeneratedByBatch[fillerBatch] || 0) + 1;
        if (stats.generatedQuarantineSample.length < 20) {
          stats.generatedQuarantineSample.push({ id, batch: fillerBatch, source: sourcePath });
        }
        return;
      }

      if (seenIds.has(id)) {
        stats.duplicateIds += 1;
        stats.removed.push({ reason: "duplicate_id", id, key: "", source: sourcePath });
        return;
      }

      const key = termKey(entry);
      if (key && seenTerms.has(key)) {
        stats.duplicateTerms += 1;
        stats.removed.push({ reason: "duplicate_term", id, key, source: sourcePath });
        return;
      }

      seenIds.add(id);
      if (key) seenTerms.add(key);
      merged.push(entry);
    });
  }

  function enrichmentEntries(raw) {
    return Array.isArray(raw?.entries) ? raw.entries : [];
  }

  function identityTypeOverrides(raw) {
    return Array.isArray(raw?.type_overrides) ? raw.type_overrides : [];
  }

  function identityAliasRemovals(raw) {
    return Array.isArray(raw?.alias_removals) ? raw.alias_removals : [];
  }

  function removeIdentityVocabulary(values, removals) {
    const removeKeys = new Set(safeArray(removals).map(normalizeTerm).filter(Boolean));
    return uniqueText(safeArray(values).filter((value) => !removeKeys.has(normalizeTerm(value))));
  }

  function applyIdentityResolutions(merged, raw, stats) {
    const byId = new Map(merged.map((entry) => [safeText(entry?.id), entry]));
    for (const row of identityTypeOverrides(raw)) {
      const id = safeText(row?.id);
      const from = safeText(row?.from);
      const to = safeText(row?.to);
      if (!id || !to) continue;
      const target = byId.get(id);
      if (!target) {
        stats.identityResolutionMissingTargets += 1;
        if (stats.identityResolutionProblemSample.length < 20) stats.identityResolutionProblemSample.push({ id, reason: "missing_type_override_target" });
        continue;
      }
      const current = safeText(target?.type);
      if (from && current !== from && current !== to) {
        stats.identityResolutionSourceMismatches += 1;
        if (stats.identityResolutionProblemSample.length < 20) stats.identityResolutionProblemSample.push({ id, reason: "unexpected_source_type", expected: from, actual: current, to });
      }
      target.type = to;
      target.meta = { ...(target.meta || {}), canonical_type_override_from: from, canonical_type_override_to: to };
      stats.identityTypeOverridesApplied += 1;
    }

    for (const row of identityAliasRemovals(raw)) {
      const id = safeText(row?.id);
      if (!id) continue;
      const target = byId.get(id);
      if (!target) {
        stats.identityResolutionMissingTargets += 1;
        if (stats.identityResolutionProblemSample.length < 20) stats.identityResolutionProblemSample.push({ id, reason: "missing_alias_removal_target" });
        continue;
      }
      if (!target.aliases || typeof target.aliases !== "object") target.aliases = { ja: [], en: [] };
      const ja = safeArray(row?.ja);
      const en = safeArray(row?.en);
      target.aliases.ja = removeIdentityVocabulary(target.aliases.ja, ja);
      target.aliases.en = removeIdentityVocabulary(target.aliases.en, en);
      target.fuzzy = removeIdentityVocabulary(target.fuzzy, [...ja, ...en]);
      target.meta = { ...(target.meta || {}), canonical_alias_removals_applied: true };
      stats.identityAliasRemovalsApplied += ja.length + en.length;
    }

    window.CTA_CANONICAL_IDENTITY_RESOLUTIONS = raw || {};
  }

  function redirectEntries(raw) {
    return Array.isArray(raw?.redirects) ? raw.redirects : [];
  }

  function buildRedirectMap(raw) {
    const map = new Map();
    for (const row of redirectEntries(raw)) {
      const from = safeText(row?.from);
      const to = safeText(row?.to);
      if (!from || !to || from === to || map.has(from)) continue;
      map.set(from, to);
    }
    return map;
  }

  function resolveWithMap(id, redirectMap) {
    let current = safeText(id);
    const seen = new Set();
    while (current && redirectMap.has(current) && !seen.has(current)) {
      seen.add(current);
      current = redirectMap.get(current);
    }
    return current;
  }

  function mergeRedirectVocabulary(target, source, fromId) {
    if (!target.aliases || typeof target.aliases !== "object") target.aliases = { ja: [], en: [] };
    const targetJa = safeText(target?.term?.ja);
    const targetEn = safeText(target?.term?.en);
    const sourceJa = safeText(source?.term?.ja);
    const sourceEn = safeText(source?.term?.en);
    target.aliases.ja = uniqueText([
      ...safeArray(target.aliases.ja),
      ...(sourceJa && sourceJa !== targetJa ? [sourceJa] : []),
      ...safeArray(source?.aliases?.ja)
    ]);
    target.aliases.en = uniqueText([
      ...safeArray(target.aliases.en),
      ...(sourceEn && sourceEn !== targetEn ? [sourceEn] : []),
      ...safeArray(source?.aliases?.en)
    ]);
    target.fuzzy = uniqueText([
      ...safeArray(target.fuzzy),
      fromId,
      sourceJa,
      sourceEn,
      ...safeArray(source?.aliases?.ja),
      ...safeArray(source?.aliases?.en),
      ...safeArray(source?.fuzzy)
    ]);
    target.meta = {
      ...(target.meta || {}),
      canonical_redirect_sources: uniqueText([...(target.meta?.canonical_redirect_sources || []), fromId])
    };
  }

  function applyCanonicalRedirects(merged, raw, stats) {
    const redirectMap = buildRedirectMap(raw);
    const byId = new Map(merged.map((entry) => [safeText(entry?.id), entry]));
    const removeIds = new Set();
    const appliedMap = new Map();

    for (const [from, directTo] of redirectMap) {
      const to = resolveWithMap(directTo, redirectMap);
      const source = byId.get(from);
      const target = byId.get(to);
      if (!source) {
        stats.canonicalRedirectMissingSources += 1;
        if (stats.canonicalRedirectProblemSample.length < 20) stats.canonicalRedirectProblemSample.push({ from, to, reason: "missing_source" });
        continue;
      }
      if (!target || from === to) {
        stats.canonicalRedirectMissingTargets += 1;
        if (stats.canonicalRedirectProblemSample.length < 20) stats.canonicalRedirectProblemSample.push({ from, to, reason: "missing_target" });
        continue;
      }
      mergeRedirectVocabulary(target, source, from);
      removeIds.add(from);
      appliedMap.set(from, to);
      stats.canonicalRedirectsApplied += 1;
    }

    if (removeIds.size) {
      const kept = merged.filter((entry) => !removeIds.has(safeText(entry?.id)));
      merged.splice(0, merged.length, ...kept);
    }

    const redirectObject = Object.fromEntries(appliedMap);
    window.CTA_CANONICAL_REDIRECTS = Object.freeze(redirectObject);
    return appliedMap;
  }

  function applyContentEnrichment(merged, raw, stats) {
    const byId = new Map(merged.map((entry) => [safeText(entry?.id), entry]));
    for (const patch of enrichmentEntries(raw)) {
      const id = safeText(patch?.id);
      if (!id) continue;
      const target = byId.get(id);
      if (!target) {
        stats.contentEnrichmentMissingTargets += 1;
        if (stats.contentEnrichmentMissingSample.length < 20) stats.contentEnrichmentMissingSample.push(id);
        continue;
      }
      const detailJa = safeText(patch?.detail_ja);
      const detailEn = safeText(patch?.detail_en);
      const bulletsJa = uniqueText(patch?.bullets_ja);
      const bulletsEn = uniqueText(patch?.bullets_en);
      const examplesJa = uniqueText(patch?.examples_ja);
      const examplesEn = uniqueText(patch?.examples_en);
      if (detailJa) target.detail_ja = detailJa;
      if (detailEn) target.detail_en = detailEn;
      if (bulletsJa.length) target.bullets_ja = bulletsJa;
      if (bulletsEn.length) target.bullets_en = bulletsEn;
      target.bullets = { ja: target.bullets_ja || [], en: target.bullets_en || [] };
      if (!target.examples || typeof target.examples !== "object") target.examples = { ja: [], en: [] };
      if (examplesJa.length) target.examples.ja = examplesJa;
      if (examplesEn.length) target.examples.en = examplesEn;
      target.meta = {
        ...(target.meta || {}),
        content_enrichment_wave: safeText(patch?.wave),
        content_enrichment_state: safeText(patch?.state) || "expanded"
      };
      stats.contentEnriched += 1;
    }
  }

  function createStats() {
    return {
      raw: 0,
      merged: 0,
      skippedMissingId: 0,
      duplicateIds: 0,
      duplicateTerms: 0,
      quarantinedGenerated: 0,
      quarantinedGeneratedByBatch: {},
      generatedQuarantineSample: [],
      canonicalRedirectsApplied: 0,
      canonicalRedirectMissingSources: 0,
      canonicalRedirectMissingTargets: 0,
      canonicalRedirectProblemSample: [],
      identityTypeOverridesApplied: 0,
      identityAliasRemovalsApplied: 0,
      identityResolutionMissingTargets: 0,
      identityResolutionSourceMismatches: 0,
      identityResolutionProblemSample: [],
      favoriteIdsMigrated: 0,
      contentEnriched: 0,
      contentEnrichmentMissingTargets: 0,
      contentEnrichmentMissingSample: [],
      removed: []
    };
  }

  function resolveCanonicalId(id) {
    const value = safeText(id);
    const redirects = window.CTA_CANONICAL_REDIRECTS || {};
    let current = value;
    const seen = new Set();
    while (current && Object.prototype.hasOwnProperty.call(redirects, current) && !seen.has(current)) {
      seen.add(current);
      current = safeText(redirects[current]);
    }
    return current;
  }

  function resolveCanonicalIds(ids) {
    return uniqueText(safeArray(ids).map((id) => resolveCanonicalId(id)).filter(Boolean));
  }

  function migrateStoredFavorites(stats) {
    try {
      const storage = window.localStorage;
      if (!storage?.getItem || !storage?.setItem) return;
      const raw = storage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const before = uniqueText(parsed);
      const after = resolveCanonicalIds(before);
      const beforeJson = JSON.stringify(before);
      const afterJson = JSON.stringify(after);
      if (beforeJson !== afterJson) {
        storage.setItem(FAVORITES_KEY, afterJson);
        stats.favoriteIdsMigrated = before.filter((id) => resolveCanonicalId(id) !== id).length;
      }
    } catch (_) {
      // Favorites migration is best effort and must not block dictionary loading.
    }
  }

  async function loadEntries(options = {}) {
    const manifestPath = options.manifestPath || DEFAULT_MANIFEST_PATH;
    const enrichmentPath = options.enrichmentPath || DEFAULT_ENRICHMENT_PATH;
    const redirectPath = options.redirectPath || DEFAULT_REDIRECT_PATH;
    const identityResolutionPath = options.identityResolutionPath || DEFAULT_IDENTITY_RESOLUTION_PATH;
    const basePaths = Array.isArray(options.basePaths) ? options.basePaths : DEFAULT_BASE_PATHS;
    const manifest = await fetchJson(manifestPath);
    const enrichment = await fetchJson(enrichmentPath);
    const redirects = await fetchJson(redirectPath);
    const identityResolutions = await fetchJson(identityResolutionPath);
    const packPaths = manifestPaths(manifest);
    const merged = [];
    const seenIds = new Set();
    const seenTerms = new Set();
    const stats = createStats();

    for (const path of packPaths) {
      const pack = await fetchJson(path);
      addUnique(merged, seenIds, seenTerms, pack, stats, path);
    }
    for (const path of basePaths) {
      const base = await fetchJson(path);
      addUnique(merged, seenIds, seenTerms, base, stats, path);
    }

    applyIdentityResolutions(merged, identityResolutions, stats);
    applyCanonicalRedirects(merged, redirects, stats);
    applyContentEnrichment(merged, enrichment, stats);
    migrateStoredFavorites(stats);
    stats.merged = merged.length;
    stats.removedCount = stats.raw - stats.merged;
    window.CTA_DATA_DIAGNOSTICS = stats;
    if (stats.removedCount > 0 || stats.canonicalRedirectsApplied > 0 || stats.identityTypeOverridesApplied > 0 || stats.identityAliasRemovalsApplied > 0 || stats.favoriteIdsMigrated > 0 || stats.contentEnriched > 0 || stats.contentEnrichmentMissingTargets > 0) {
      console.info("Construction Tools Atlas data dedupe/quarantine/redirect/enrichment", stats);
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

  function appendScriptOnce(src, attr, value) {
    try {
      if (document.querySelector(`script[${attr}=\"${value}\"]`)) return;
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.setAttribute(attr, value);
      document.head.appendChild(script);
    } catch (_) {
      // Optional runtime extension must not stop the dictionary.
    }
  }

  function loadLatestRuntimeExtensions() {
    appendScriptOnce("./detail-image-hotfix.js?v=20260510-image-6", "data-cta-image-hotfix", "20260510-image-6");
    appendScriptOnce("./detail-image-hotfix-extra.js?v=20260510-extra-1", "data-cta-image-hotfix-extra", "20260510-extra-1");
    appendScriptOnce("./canonical-deep-link-v2.3.js?v=20260915-canonical-1", "data-cta-canonical-deep-link", "v2.3");
  }

  window.CTA_DATA_LOADER = { loadEntries, resolveCanonicalId, resolveCanonicalIds };

  document.addEventListener("DOMContentLoaded", () => {
    fixSearchInput();
    loadLatestRuntimeExtensions();
  });
})();