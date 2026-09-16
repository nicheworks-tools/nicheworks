(() => {
  "use strict";

  const BASE_PATHS = ["./data/tools.basic.json"];
  const MANIFEST_PATH = "./data/quality-manifest.json";
  const ENRICHMENT_PATH = "./data/content-enrichment-v2.3.json";
  const ENRICHMENT_MANIFEST_PATH = "./data/content-enrichment-manifest-v2.3.json";
  const REDIRECT_PATH = "./data/canonical-redirects-v2.3.json";
  const IDENTITY_PATH = "./data/canonical-identity-resolutions-v2.3.json";
  const GENERATED_FILLER_BATCHES = new Set(["direct-5000", "atlas-expand-5000"]);
  const FAVORITES_KEY = "cta_favs";

  const text = (value) => typeof value === "string" ? value.trim() : "";
  const arr = (value) => Array.isArray(value) ? value.filter(Boolean).map(String) : (typeof value === "string" && value.trim() ? [value.trim()] : []);
  const unique = (values) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
  const normalize = (value) => String(value || "").toLowerCase().replace(/[\s\u3000]+/g, " ").replace(/[／]/g, "/").trim();

  async function fetchJson(path) {
    if (!path) return null;
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (_) { return null; }
  }

  function compactToFull(row, qualityBatch) {
    const id = text(row?.id);
    const type = text(row?.t || row?.type);
    const ja = text(row?.ja || row?.term?.ja);
    const en = text(row?.en || row?.term?.en);
    const cat = text(row?.c || row?.category);
    const task = text(row?.task || row?.tsk);
    const descJa = text(row?.dj || row?.description_ja || row?.summary_ja);
    const descEn = text(row?.de || row?.description_en || row?.summary_en);
    const detailJa = text(row?.nj || row?.detail_ja) || `${ja}は仕様、下地条件、周辺部材との取り合いを確認して使う。施工前後の確認を省くと不具合や手戻りの原因になる。`;
    const detailEn = text(row?.ne || row?.detail_en) || `Use ${en} after checking the specification, substrate, and adjacent details. Missing checks can cause defects or rework.`;
    const bulletsJa = arr(row?.bj || row?.bullets_ja);
    const bulletsEn = arr(row?.be || row?.bullets_en);
    const examplesJa = arr(row?.ej || row?.examples_ja);
    const examplesEn = arr(row?.ee || row?.examples_en);
    return {
      id, type, term: { ja, en },
      aliases: { ja: arr(row?.aj || row?.aliases_ja), en: arr(row?.ae || row?.aliases_en) },
      description: { ja: descJa, en: descEn },
      categories: arr(row?.categories || cat), tasks: arr(row?.tasks || task),
      fuzzy: unique([...arr(row?.fuzzy), ja, en, cat, task]),
      region: arr(row?.region).length ? arr(row?.region) : ["global", "jp"],
      summary_ja: descJa, summary_en: descEn, summary: { ja: descJa, en: descEn },
      detail_ja: detailJa, detail_en: detailEn,
      bullets_ja: bulletsJa.length ? bulletsJa : ["仕様と下地条件を確認する。", "周辺部材との取り合いを確認する。"],
      bullets_en: bulletsEn.length ? bulletsEn : ["Check the specification and substrate conditions.", "Confirm adjacent details before finishing."],
      bullets: {
        ja: bulletsJa.length ? bulletsJa : ["仕様と下地条件を確認する。", "周辺部材との取り合いを確認する。"],
        en: bulletsEn.length ? bulletsEn : ["Check the specification and substrate conditions.", "Confirm adjacent details before finishing."]
      },
      examples: {
        ja: examplesJa.length ? examplesJa : [`${ja}を使う前に寸法と仕様を確認する。`],
        en: examplesEn.length ? examplesEn : [`Check dimensions and specifications before using ${en}.`]
      },
      meta: { quality_batch: text(row?.quality_batch || qualityBatch) }
    };
  }

  function entries(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw?.schema === "cta-compact-v1" && Array.isArray(raw.rows)) return raw.rows.map((row) => compactToFull(row, text(raw.quality_batch)));
    if (Array.isArray(raw?.entries)) return raw.entries;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }
  function manifestPaths(raw) {
    const seen = new Set();
    return (Array.isArray(raw?.packs) ? raw.packs : []).map((item) => typeof item === "string" ? item.trim() : text(item?.path)).filter((path) => path && !seen.has(path) && seen.add(path));
  }
  function termKey(entry) {
    const ja = normalize(entry?.term?.ja || entry?.ja || "");
    const en = normalize(entry?.term?.en || entry?.en || "");
    return ja || en ? `${ja}::${en}` : "";
  }

  function createStats() {
    return {
      raw:0, merged:0, skippedMissingId:0, duplicateIds:0, duplicateTerms:0,
      quarantinedGenerated:0, quarantinedGeneratedByBatch:{}, generatedQuarantineSample:[],
      canonicalRedirectsApplied:0, canonicalRedirectMissingSources:0, canonicalRedirectMissingTargets:0, canonicalRedirectProblemSample:[],
      identityNameOverridesApplied:0, identityTypeOverridesApplied:0, identityAliasRemovalsApplied:0,
      identityResolutionMissingTargets:0, identityResolutionSourceMismatches:0, identityResolutionProblemSample:[],
      favoriteIdsMigrated:0, contentEnriched:0, contentEnrichmentMissingTargets:0, contentEnrichmentMissingSample:[],
      contentEnrichmentDuplicateTargets:0, contentEnrichmentDuplicateSample:[], removed:[]
    };
  }

  function addUnique(merged, seenIds, seenTerms, raw, stats, source) {
    entries(raw).forEach((entry) => {
      stats.raw += 1;
      const id = text(entry?.id);
      if (!id) { stats.skippedMissingId += 1; return; }
      const batch = entry?.meta?.generated === true ? text(entry?.meta?.batch) : "";
      if (GENERATED_FILLER_BATCHES.has(batch)) {
        stats.quarantinedGenerated += 1;
        stats.quarantinedGeneratedByBatch[batch] = (stats.quarantinedGeneratedByBatch[batch] || 0) + 1;
        if (stats.generatedQuarantineSample.length < 20) stats.generatedQuarantineSample.push({ id, batch, source });
        return;
      }
      if (seenIds.has(id)) { stats.duplicateIds += 1; stats.removed.push({ reason:"duplicate_id", id, source }); return; }
      const key = termKey(entry);
      if (key && seenTerms.has(key)) { stats.duplicateTerms += 1; stats.removed.push({ reason:"duplicate_term", id, key, source }); return; }
      seenIds.add(id); if (key) seenTerms.add(key); merged.push(entry);
    });
  }

  function removeVocabulary(values, removals) {
    const blocked = new Set(arr(removals).map(normalize));
    return unique(arr(values).filter((value) => !blocked.has(normalize(value))));
  }

  function applyIdentityResolutions(merged, raw, stats) {
    const byId = new Map(merged.map((entry) => [text(entry?.id), entry]));
    for (const row of Array.isArray(raw?.name_overrides) ? raw.name_overrides : []) {
      const id = text(row?.id); const target = byId.get(id); const toJa = text(row?.to?.ja); const toEn = text(row?.to?.en);
      if (!id || (!toJa && !toEn)) continue;
      if (!target) { stats.identityResolutionMissingTargets += 1; continue; }
      const fromJa = text(row?.from?.ja); const fromEn = text(row?.from?.en);
      target.term ||= { ja:"", en:"" };
      if (toJa) target.term.ja = toJa; if (toEn) target.term.en = toEn;
      target.fuzzy = unique([...removeVocabulary(target.fuzzy, [fromJa, fromEn]), target.term.ja, target.term.en]);
      target.meta = { ...(target.meta || {}), canonical_name_override_from:{ ja:fromJa, en:fromEn }, canonical_name_override_to:{ ja:toJa, en:toEn } };
      stats.identityNameOverridesApplied += 1;
    }
    for (const row of Array.isArray(raw?.type_overrides) ? raw.type_overrides : []) {
      const id = text(row?.id); const target = byId.get(id); const to = text(row?.to);
      if (!id || !to) continue;
      if (!target) { stats.identityResolutionMissingTargets += 1; continue; }
      target.type = to; target.meta = { ...(target.meta || {}), canonical_type_override_to:to };
      stats.identityTypeOverridesApplied += 1;
    }
    for (const row of Array.isArray(raw?.alias_removals) ? raw.alias_removals : []) {
      const id = text(row?.id); const target = byId.get(id);
      if (!id) continue;
      if (!target) { stats.identityResolutionMissingTargets += 1; continue; }
      target.aliases ||= { ja:[], en:[] };
      const ja = arr(row?.ja); const en = arr(row?.en);
      target.aliases.ja = removeVocabulary(target.aliases.ja, ja);
      target.aliases.en = removeVocabulary(target.aliases.en, en);
      target.fuzzy = removeVocabulary(target.fuzzy, [...ja, ...en]);
      stats.identityAliasRemovalsApplied += ja.length + en.length;
    }
    window.CTA_CANONICAL_IDENTITY_RESOLUTIONS = raw || {};
  }

  function buildRedirectMap(raw) {
    const map = new Map();
    for (const row of Array.isArray(raw?.redirects) ? raw.redirects : []) {
      const from = text(row?.from); const to = text(row?.to);
      if (from && to && from !== to && !map.has(from)) map.set(from, to);
    }
    return map;
  }
  function resolveWithMap(id, map) {
    let current = text(id); const seen = new Set();
    while (current && map.has(current) && !seen.has(current)) { seen.add(current); current = map.get(current); }
    return current;
  }
  function mergeRedirectVocabulary(target, source, fromId) {
    target.aliases ||= { ja:[], en:[] };
    const sourceJa = text(source?.term?.ja); const sourceEn = text(source?.term?.en);
    const targetJa = text(target?.term?.ja); const targetEn = text(target?.term?.en);
    target.aliases.ja = unique([...arr(target.aliases.ja), ...(sourceJa && sourceJa !== targetJa ? [sourceJa] : []), ...arr(source?.aliases?.ja)]);
    target.aliases.en = unique([...arr(target.aliases.en), ...(sourceEn && sourceEn !== targetEn ? [sourceEn] : []), ...arr(source?.aliases?.en)]);
    target.fuzzy = unique([...arr(target.fuzzy), fromId, sourceJa, sourceEn, ...arr(source?.aliases?.ja), ...arr(source?.aliases?.en), ...arr(source?.fuzzy)]);
    target.meta = { ...(target.meta || {}), canonical_redirect_sources:unique([...(target.meta?.canonical_redirect_sources || []), fromId]) };
  }
  function applyRedirects(merged, raw, stats) {
    const map = buildRedirectMap(raw); const byId = new Map(merged.map((entry) => [text(entry?.id), entry])); const remove = new Set(); const applied = new Map();
    for (const [from, directTo] of map) {
      const to = resolveWithMap(directTo, map); const source = byId.get(from); const target = byId.get(to);
      if (!source) { stats.canonicalRedirectMissingSources += 1; continue; }
      if (!target || from === to) { stats.canonicalRedirectMissingTargets += 1; continue; }
      mergeRedirectVocabulary(target, source, from); remove.add(from); applied.set(from, to); stats.canonicalRedirectsApplied += 1;
    }
    if (remove.size) merged.splice(0, merged.length, ...merged.filter((entry) => !remove.has(text(entry?.id))));
    window.CTA_CANONICAL_REDIRECTS = Object.freeze(Object.fromEntries(applied));
    return applied;
  }

  function applyEnrichment(merged, raw, stats, appliedIds) {
    const byId = new Map(merged.map((entry) => [text(entry?.id), entry]));
    for (const patch of Array.isArray(raw?.entries) ? raw.entries : []) {
      const id = text(patch?.id);
      if (!id) continue;
      if (appliedIds.has(id)) { stats.contentEnrichmentDuplicateTargets += 1; continue; }
      appliedIds.add(id);
      const target = byId.get(id);
      if (!target) { stats.contentEnrichmentMissingTargets += 1; if (stats.contentEnrichmentMissingSample.length < 20) stats.contentEnrichmentMissingSample.push(id); continue; }
      const detailJa = text(patch?.detail_ja); const detailEn = text(patch?.detail_en);
      const bulletsJa = unique(arr(patch?.bullets_ja)); const bulletsEn = unique(arr(patch?.bullets_en));
      const examplesJa = unique(arr(patch?.examples_ja)); const examplesEn = unique(arr(patch?.examples_en));
      if (detailJa) target.detail_ja = detailJa; if (detailEn) target.detail_en = detailEn;
      if (bulletsJa.length) target.bullets_ja = bulletsJa; if (bulletsEn.length) target.bullets_en = bulletsEn;
      target.bullets = { ja:target.bullets_ja || [], en:target.bullets_en || [] };
      target.examples ||= { ja:[], en:[] };
      if (examplesJa.length) target.examples.ja = examplesJa; if (examplesEn.length) target.examples.en = examplesEn;
      target.meta = { ...(target.meta || {}), content_enrichment_wave:text(patch?.wave), content_enrichment_state:text(patch?.state) || "expanded" };
      stats.contentEnriched += 1;
    }
  }

  function resolveCanonicalId(id) {
    let current = text(id); const redirects = window.CTA_CANONICAL_REDIRECTS || {}; const seen = new Set();
    while (current && Object.prototype.hasOwnProperty.call(redirects, current) && !seen.has(current)) { seen.add(current); current = text(redirects[current]); }
    return current;
  }
  function resolveCanonicalIds(ids) { return unique(arr(ids).map(resolveCanonicalId).filter(Boolean)); }
  function migrateFavorites(stats) {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY); if (!raw) return;
      const parsed = JSON.parse(raw); if (!Array.isArray(parsed)) return;
      const before = unique(parsed); const after = resolveCanonicalIds(before);
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(after));
        stats.favoriteIdsMigrated = before.filter((id) => resolveCanonicalId(id) !== id).length;
      }
    } catch (_) { }
  }

  async function loadEntries(options = {}) {
    const manifestPath = options.manifestPath || MANIFEST_PATH;
    const enrichmentManifestPath = options.enrichmentManifestPath || ENRICHMENT_MANIFEST_PATH;
    const redirectPath = options.redirectPath || REDIRECT_PATH;
    const identityPath = options.identityResolutionPath || IDENTITY_PATH;
    const basePaths = Array.isArray(options.basePaths) ? options.basePaths : BASE_PATHS;

    const [manifest, enrichmentManifest, redirects, identity] = await Promise.all([
      fetchJson(manifestPath), fetchJson(enrichmentManifestPath), fetchJson(redirectPath), fetchJson(identityPath)
    ]);
    const packPaths = manifestPaths(manifest);
    const enrichmentPaths = manifestPaths(enrichmentManifest);
    const [packs, bases, enrichments] = await Promise.all([
      Promise.all(packPaths.map(fetchJson)),
      Promise.all(basePaths.map(fetchJson)),
      enrichmentPaths.length ? Promise.all(enrichmentPaths.map(fetchJson)) : Promise.all([fetchJson(options.enrichmentPath || ENRICHMENT_PATH)])
    ]);

    const merged = []; const seenIds = new Set(); const seenTerms = new Set(); const stats = createStats();
    packs.forEach((pack, index) => addUnique(merged, seenIds, seenTerms, pack, stats, packPaths[index]));
    bases.forEach((base, index) => addUnique(merged, seenIds, seenTerms, base, stats, basePaths[index]));
    applyIdentityResolutions(merged, identity, stats);
    applyRedirects(merged, redirects, stats);
    const enrichedIds = new Set(); enrichments.forEach((enrichment) => applyEnrichment(merged, enrichment, stats, enrichedIds));
    migrateFavorites(stats);
    stats.merged = merged.length; stats.removedCount = stats.raw - stats.merged;
    window.CTA_DATA_DIAGNOSTICS = stats;
    return merged;
  }

  window.CTA_DATA_LOADER = Object.freeze({ loadEntries, resolveCanonicalId, resolveCanonicalIds });
})();
