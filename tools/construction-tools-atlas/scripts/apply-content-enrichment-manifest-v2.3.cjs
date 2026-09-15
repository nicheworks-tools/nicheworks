const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const LOADER = path.join(ROOT, 'data', 'quality-loader.js');
const AUDITOR = path.join(ROOT, 'scripts', 'audit-public-content-quality-v2.3.cjs');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  return source.replace(before, after);
}

let loader = fs.readFileSync(LOADER, 'utf8');
loader = replaceOnce(
  loader,
  '  const DEFAULT_ENRICHMENT_PATH = "./data/content-enrichment-v2.3.json";\n',
  '  const DEFAULT_ENRICHMENT_PATH = "./data/content-enrichment-v2.3.json";\n  const DEFAULT_ENRICHMENT_MANIFEST_PATH = "./data/content-enrichment-manifest-v2.3.json";\n',
  'loader enrichment manifest constant'
);
loader = replaceOnce(
  loader,
  '  function applyContentEnrichment(merged, raw, stats) {\n    const byId = new Map(merged.map((entry) => [safeText(entry?.id), entry]));\n    for (const patch of enrichmentEntries(raw)) {\n      const id = safeText(patch?.id);\n      if (!id) continue;\n',
  '  function applyContentEnrichment(merged, raw, stats, appliedIds = new Set()) {\n    const byId = new Map(merged.map((entry) => [safeText(entry?.id), entry]));\n    for (const patch of enrichmentEntries(raw)) {\n      const id = safeText(patch?.id);\n      if (!id) continue;\n      if (appliedIds.has(id)) {\n        stats.contentEnrichmentDuplicateTargets += 1;\n        if (stats.contentEnrichmentDuplicateSample.length < 20) stats.contentEnrichmentDuplicateSample.push(id);\n        continue;\n      }\n      appliedIds.add(id);\n',
  'loader duplicate enrichment guard'
);
loader = replaceOnce(
  loader,
  '      contentEnriched: 0,\n      contentEnrichmentMissingTargets: 0,\n      contentEnrichmentMissingSample: [],\n',
  '      contentEnriched: 0,\n      contentEnrichmentMissingTargets: 0,\n      contentEnrichmentMissingSample: [],\n      contentEnrichmentDuplicateTargets: 0,\n      contentEnrichmentDuplicateSample: [],\n',
  'loader enrichment stats'
);
loader = replaceOnce(
  loader,
  '    const enrichmentPath = options.enrichmentPath || DEFAULT_ENRICHMENT_PATH;\n    const redirectPath = options.redirectPath || DEFAULT_REDIRECT_PATH;\n',
  '    const enrichmentPath = options.enrichmentPath || DEFAULT_ENRICHMENT_PATH;\n    const enrichmentManifestPath = options.enrichmentManifestPath || DEFAULT_ENRICHMENT_MANIFEST_PATH;\n    const redirectPath = options.redirectPath || DEFAULT_REDIRECT_PATH;\n',
  'loader enrichment manifest option'
);
loader = replaceOnce(
  loader,
  '    const manifest = await fetchJson(manifestPath);\n    const enrichment = await fetchJson(enrichmentPath);\n    const redirects = await fetchJson(redirectPath);\n',
  '    const manifest = await fetchJson(manifestPath);\n    const enrichmentManifest = await fetchJson(enrichmentManifestPath);\n    const enrichmentPaths = manifestPaths(enrichmentManifest);\n    const enrichments = [];\n    if (enrichmentPaths.length) {\n      for (const path of enrichmentPaths) enrichments.push(await fetchJson(path));\n    } else {\n      enrichments.push(await fetchJson(enrichmentPath));\n    }\n    const redirects = await fetchJson(redirectPath);\n',
  'loader enrichment pack fetch'
);
loader = replaceOnce(
  loader,
  '    applyIdentityResolutions(merged, identityResolutions, stats);\n    applyCanonicalRedirects(merged, redirects, stats);\n    applyContentEnrichment(merged, enrichment, stats);\n',
  '    applyIdentityResolutions(merged, identityResolutions, stats);\n    applyCanonicalRedirects(merged, redirects, stats);\n    const enrichedIds = new Set();\n    for (const enrichment of enrichments) applyContentEnrichment(merged, enrichment, stats, enrichedIds);\n',
  'loader enrichment pack application'
);
loader = replaceOnce(
  loader,
  '    if (stats.removedCount > 0 || stats.canonicalRedirectsApplied > 0 || stats.identityTypeOverridesApplied > 0 || stats.identityAliasRemovalsApplied > 0 || stats.favoriteIdsMigrated > 0 || stats.contentEnriched > 0 || stats.contentEnrichmentMissingTargets > 0) {\n',
  '    if (stats.removedCount > 0 || stats.canonicalRedirectsApplied > 0 || stats.identityTypeOverridesApplied > 0 || stats.identityAliasRemovalsApplied > 0 || stats.favoriteIdsMigrated > 0 || stats.contentEnriched > 0 || stats.contentEnrichmentMissingTargets > 0 || stats.contentEnrichmentDuplicateTargets > 0) {\n',
  'loader diagnostics condition'
);
fs.writeFileSync(LOADER, loader);

let auditor = fs.readFileSync(AUDITOR, 'utf8');
auditor = replaceOnce(
  auditor,
  "const ENRICHMENT_PATH = path.join(DATA, 'content-enrichment-v2.3.json');\n",
  "const ENRICHMENT_PATH = path.join(DATA, 'content-enrichment-v2.3.json');\nconst ENRICHMENT_MANIFEST_PATH = path.join(DATA, 'content-enrichment-manifest-v2.3.json');\n",
  'auditor enrichment manifest constant'
);
const oldRead = `function readEnrichment(publicIds) {\n  if (!fs.existsSync(ENRICHMENT_PATH)) return { version: '', byId: new Map(), count: 0 };\n  const raw = readJson(ENRICHMENT_PATH);\n  if (raw?.schema !== 'cta-content-enrichment-v2.3') throw new Error('Unexpected content enrichment schema');\n  const byId = new Map();\n  for (const patch of array(raw.entries)) {\n    const id = text(patch?.id);\n    if (!id) throw new Error('Content enrichment entry missing id');\n    if (byId.has(id)) throw new Error(\`Duplicate content enrichment id: \${id}\`);\n    if (!publicIds.has(id)) throw new Error(\`Content enrichment targets non-public id: \${id}\`);\n    if (!text(patch?.detail_ja) || !text(patch?.detail_en)) throw new Error(\`\${id}: enrichment requires bilingual detail\`);\n    if (!nonEmptyArray(patch?.bullets_ja) || !nonEmptyArray(patch?.bullets_en)) throw new Error(\`\${id}: enrichment requires bilingual bullets\`);\n    if (!nonEmptyArray(patch?.examples_ja) || !nonEmptyArray(patch?.examples_en)) throw new Error(\`\${id}: enrichment requires bilingual examples\`);\n    byId.set(id, patch);\n  }\n  return { version: text(raw.version), byId, count: byId.size };\n}\n`;
const newRead = `function readEnrichment(publicIds) {\n  const manifest = fs.existsSync(ENRICHMENT_MANIFEST_PATH) ? readJson(ENRICHMENT_MANIFEST_PATH) : null;\n  let sources = [];\n  let version = '';\n  if (manifest) {\n    if (manifest?.schema !== 'cta-content-enrichment-manifest-v2.3') throw new Error('Unexpected content enrichment manifest schema');\n    version = text(manifest.version);\n    sources = array(manifest.packs).map((pack) => typeof pack === 'string' ? pack : pack?.path).map(text).filter(Boolean);\n    if (!sources.length) throw new Error('Content enrichment manifest has no packs');\n  } else if (fs.existsSync(ENRICHMENT_PATH)) {\n    sources = ['./data/content-enrichment-v2.3.json'];\n  } else {\n    return { version: '', byId: new Map(), count: 0 };\n  }\n\n  const byId = new Map();\n  for (const source of sources) {\n    const file = path.resolve(ROOT, source.replace(/^\\.\\//, ''));\n    if (!fs.existsSync(file)) throw new Error(\`Missing content enrichment pack: \${source}\`);\n    const raw = readJson(file);\n    if (raw?.schema !== 'cta-content-enrichment-v2.3') throw new Error(\`Unexpected content enrichment schema: \${source}\`);\n    if (!version) version = text(raw.version);\n    for (const patch of array(raw.entries)) {\n      const id = text(patch?.id);\n      if (!id) throw new Error(\`Content enrichment entry missing id in \${source}\`);\n      if (byId.has(id)) throw new Error(\`Duplicate content enrichment id across packs: \${id}\`);\n      if (!publicIds.has(id)) throw new Error(\`Content enrichment targets non-public id: \${id}\`);\n      if (!text(patch?.detail_ja) || !text(patch?.detail_en)) throw new Error(\`\${id}: enrichment requires bilingual detail\`);\n      if (!nonEmptyArray(patch?.bullets_ja) || !nonEmptyArray(patch?.bullets_en)) throw new Error(\`\${id}: enrichment requires bilingual bullets\`);\n      if (!nonEmptyArray(patch?.examples_ja) || !nonEmptyArray(patch?.examples_en)) throw new Error(\`\${id}: enrichment requires bilingual examples\`);\n      byId.set(id, { ...patch, __source: source });\n    }\n  }\n  return { version, byId, count: byId.size };\n}\n`;
auditor = replaceOnce(auditor, oldRead, newRead, 'auditor read enrichment packs');
auditor = replaceOnce(
  auditor,
  "    if (samples[q.status].length < 25) samples[q.status].push({ id, source: source.source, enrichment: q.enriched ? 'content-enrichment-v2.3.json' : null, fallback_fields: q.fallbackFields });\n",
  "    if (samples[q.status].length < 25) samples[q.status].push({ id, source: source.source, enrichment: q.enriched ? text(patch?.__source) : null, fallback_fields: q.fallbackFields });\n",
  'auditor sample source'
);
auditor = replaceOnce(
  auditor,
  "    version: '2026-09-16-q011-identity-closure-1',\n",
  "    version: '2026-09-16-content-wave2-q011-1',\n",
  'auditor snapshot version'
);
auditor = replaceOnce(
  auditor,
  "  if (runtimeResult.diagnostics.contentEnrichmentMissingTargets) throw new Error(`Runtime reports ${runtimeResult.diagnostics.contentEnrichmentMissingTargets} missing enrichment targets`);\n",
  "  if (runtimeResult.diagnostics.contentEnrichmentMissingTargets) throw new Error(`Runtime reports ${runtimeResult.diagnostics.contentEnrichmentMissingTargets} missing enrichment targets`);\n  if (runtimeResult.diagnostics.contentEnrichmentDuplicateTargets) throw new Error(`Runtime reports ${runtimeResult.diagnostics.contentEnrichmentDuplicateTargets} duplicate enrichment targets`);\n",
  'auditor runtime duplicate guard'
);
fs.writeFileSync(AUDITOR, auditor);

console.log('Applied content enrichment manifest migration.');
