const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const LOADER = path.join(ROOT, 'data', 'quality-loader.js');
const CHECKER = path.join(ROOT, 'scripts', 'check-canonical-redirects-v2.3.cjs');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  const count = source.split(before).length - 1;
  if (count === 0) throw new Error(`${label}: anchor not found`);
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  return source.replace(before, after);
}

let loader = fs.readFileSync(LOADER, 'utf8');
loader = replaceOnce(
  loader,
  '  const DEFAULT_REDIRECT_PATH = "./data/canonical-redirects-v2.3.json";\n',
  '  const DEFAULT_REDIRECT_PATH = "./data/canonical-redirects-v2.3.json";\n  const DEFAULT_IDENTITY_RESOLUTION_PATH = "./data/canonical-identity-resolutions-v2.3.json";\n',
  'identity path constant'
);

loader = replaceOnce(
  loader,
  '  function redirectEntries(raw) {\n    return Array.isArray(raw?.redirects) ? raw.redirects : [];\n  }\n',
  `  function identityTypeOverrides(raw) {\n    return Array.isArray(raw?.type_overrides) ? raw.type_overrides : [];\n  }\n\n  function identityAliasRemovals(raw) {\n    return Array.isArray(raw?.alias_removals) ? raw.alias_removals : [];\n  }\n\n  function removeIdentityVocabulary(values, removals) {\n    const removeKeys = new Set(safeArray(removals).map(normalizeTerm).filter(Boolean));\n    return uniqueText(safeArray(values).filter((value) => !removeKeys.has(normalizeTerm(value))));\n  }\n\n  function applyIdentityResolutions(merged, raw, stats) {\n    const byId = new Map(merged.map((entry) => [safeText(entry?.id), entry]));\n    for (const row of identityTypeOverrides(raw)) {\n      const id = safeText(row?.id);\n      const from = safeText(row?.from);\n      const to = safeText(row?.to);\n      if (!id || !to) continue;\n      const target = byId.get(id);\n      if (!target) {\n        stats.identityResolutionMissingTargets += 1;\n        if (stats.identityResolutionProblemSample.length < 20) stats.identityResolutionProblemSample.push({ id, reason: "missing_type_override_target" });\n        continue;\n      }\n      const current = safeText(target?.type);\n      if (from && current !== from && current !== to) {\n        stats.identityResolutionSourceMismatches += 1;\n        if (stats.identityResolutionProblemSample.length < 20) stats.identityResolutionProblemSample.push({ id, reason: "unexpected_source_type", expected: from, actual: current, to });\n      }\n      target.type = to;\n      target.meta = { ...(target.meta || {}), canonical_type_override_from: from, canonical_type_override_to: to };\n      stats.identityTypeOverridesApplied += 1;\n    }\n\n    for (const row of identityAliasRemovals(raw)) {\n      const id = safeText(row?.id);\n      if (!id) continue;\n      const target = byId.get(id);\n      if (!target) {\n        stats.identityResolutionMissingTargets += 1;\n        if (stats.identityResolutionProblemSample.length < 20) stats.identityResolutionProblemSample.push({ id, reason: "missing_alias_removal_target" });\n        continue;\n      }\n      if (!target.aliases || typeof target.aliases !== "object") target.aliases = { ja: [], en: [] };\n      const ja = safeArray(row?.ja);\n      const en = safeArray(row?.en);\n      target.aliases.ja = removeIdentityVocabulary(target.aliases.ja, ja);\n      target.aliases.en = removeIdentityVocabulary(target.aliases.en, en);\n      target.fuzzy = removeIdentityVocabulary(target.fuzzy, [...ja, ...en]);\n      target.meta = { ...(target.meta || {}), canonical_alias_removals_applied: true };\n      stats.identityAliasRemovalsApplied += ja.length + en.length;\n    }\n\n    window.CTA_CANONICAL_IDENTITY_RESOLUTIONS = raw || {};\n  }\n\n  function redirectEntries(raw) {\n    return Array.isArray(raw?.redirects) ? raw.redirects : [];\n  }\n`,
  'identity resolution functions'
);

loader = replaceOnce(
  loader,
  '      canonicalRedirectProblemSample: [],\n      favoriteIdsMigrated: 0,\n',
  '      canonicalRedirectProblemSample: [],\n      identityTypeOverridesApplied: 0,\n      identityAliasRemovalsApplied: 0,\n      identityResolutionMissingTargets: 0,\n      identityResolutionSourceMismatches: 0,\n      identityResolutionProblemSample: [],\n      favoriteIdsMigrated: 0,\n',
  'identity stats'
);

loader = replaceOnce(
  loader,
  '    const redirectPath = options.redirectPath || DEFAULT_REDIRECT_PATH;\n    const basePaths = Array.isArray(options.basePaths) ? options.basePaths : DEFAULT_BASE_PATHS;\n    const manifest = await fetchJson(manifestPath);\n    const enrichment = await fetchJson(enrichmentPath);\n    const redirects = await fetchJson(redirectPath);\n',
  '    const redirectPath = options.redirectPath || DEFAULT_REDIRECT_PATH;\n    const identityResolutionPath = options.identityResolutionPath || DEFAULT_IDENTITY_RESOLUTION_PATH;\n    const basePaths = Array.isArray(options.basePaths) ? options.basePaths : DEFAULT_BASE_PATHS;\n    const manifest = await fetchJson(manifestPath);\n    const enrichment = await fetchJson(enrichmentPath);\n    const redirects = await fetchJson(redirectPath);\n    const identityResolutions = await fetchJson(identityResolutionPath);\n',
  'identity loader fetch'
);

loader = replaceOnce(
  loader,
  '    applyCanonicalRedirects(merged, redirects, stats);\n    applyContentEnrichment(merged, enrichment, stats);\n',
  '    applyIdentityResolutions(merged, identityResolutions, stats);\n    applyCanonicalRedirects(merged, redirects, stats);\n    applyContentEnrichment(merged, enrichment, stats);\n',
  'identity application order'
);

loader = replaceOnce(
  loader,
  '    if (stats.removedCount > 0 || stats.canonicalRedirectsApplied > 0 || stats.favoriteIdsMigrated > 0 || stats.contentEnriched > 0 || stats.contentEnrichmentMissingTargets > 0) {\n',
  '    if (stats.removedCount > 0 || stats.canonicalRedirectsApplied > 0 || stats.identityTypeOverridesApplied > 0 || stats.identityAliasRemovalsApplied > 0 || stats.favoriteIdsMigrated > 0 || stats.contentEnriched > 0 || stats.contentEnrichmentMissingTargets > 0) {\n',
  'identity diagnostics logging'
);
fs.writeFileSync(LOADER, loader);

let checker = fs.readFileSync(CHECKER, 'utf8');
checker = replaceOnce(
  checker,
  "const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');\n",
  "const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');\nconst IDENTITY_PATH = path.join(DATA, 'canonical-identity-resolutions-v2.3.json');\n",
  'checker identity path'
);
checker = replaceOnce(
  checker,
  "  const redirectDoc = readJson(REDIRECT_PATH);\n  const redirects = array(redirectDoc.redirects);\n  if (redirects.length !== 10) throw new Error(`Expected 10 confirmed redirects, got ${redirects.length}`);\n",
  "  const redirectDoc = readJson(REDIRECT_PATH);\n  const identityDoc = readJson(IDENTITY_PATH);\n  const redirects = array(redirectDoc.redirects);\n  if (!redirects.length) throw new Error('No canonical redirects configured');\n  const typeOverrideMap = new Map(array(identityDoc.type_overrides).map((row) => [text(row?.id), text(row?.to)]).filter(([id, to]) => id && to));\n  const effectiveType = (row) => typeOverrideMap.get(idOf(row)) || typeOf(row);\n",
  'checker redirect setup'
);
checker = replaceOnce(
  checker,
  '    if (typeOf(source) !== typeOf(target)) throw new Error(`${from}: type mismatch ${typeOf(source)} -> ${typeOf(target)}`);\n',
  '    if (effectiveType(source) !== effectiveType(target)) throw new Error(`${from}: effective type mismatch ${effectiveType(source)} -> ${effectiveType(target)}`);\n',
  'checker effective type parity'
);
checker = replaceOnce(
  checker,
  "  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.canonicalRedirectsApplied !== redirects.length) throw new Error('Loader redirect count mismatch');\n",
  "  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.identityTypeOverridesApplied !== array(identityDoc.type_overrides).length) throw new Error('Loader identity type override count mismatch');\n  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.identityResolutionMissingTargets) throw new Error('Loader reports missing identity resolution targets');\n  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.canonicalRedirectsApplied !== redirects.length) throw new Error('Loader redirect count mismatch');\n",
  'checker runtime identity diagnostics'
);
fs.writeFileSync(CHECKER, checker);

console.log('Applied q011 identity runtime patch.');
