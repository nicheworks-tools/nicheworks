const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const runtimePath = path.join(ROOT, 'detail-image-hotfix.js');
const registryPath = path.join(ROOT, 'data', 'image-registry-v2.3.json');
const source = fs.readFileSync(runtimePath, 'utf8');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const errors = [];

function requireText(fragment, label) {
  if (!source.includes(fragment)) errors.push(`missing runtime contract: ${label}`);
}

requireText('image-registry-v2.3.json', 'canonical image registry is loaded');
requireText('window.CTA_DEEP_LINK?.getCurrentId?.()', 'canonical ID comes from deep-link controller when available');
requireText('meta.match(/id:', 'canonical ID falls back to rendered detail metadata');
requireText('item.subject_match !== "matched"', 'only subject-matched canonical images are eligible');
requireText('item.migration_state !== "promoted"', 'only promoted canonical images are eligible');
requireText('FORMAL_STATES.has(item.image_state)', 'only reviewed/verified canonical images are eligible');
requireText('img.dataset.imageSource = "canonical-registry"', 'canonical render diagnostics');
requireText('img.dataset.imageSource = "legacy-svg-pilot"', 'legacy fallback diagnostics');
requireText('window.addEventListener("cta:entry-open"', 'entry-open rerender hook');
requireText('window.addEventListener("cta:language-mode"', 'language-mode rerender hook');

const registryVersion = typeof registry?.version === 'string' ? registry.version.trim() : '';
if (!registryVersion) {
  errors.push('canonical image registry version is missing');
} else {
  requireText(`image-registry-v2.3.json?v=${registryVersion}`, 'runtime cache key matches canonical image registry version');
}

const renderStart = source.indexOf('async function render(');
const canonicalPosition = source.indexOf('const canonical = matchCanonical();', renderStart);
const legacyPosition = source.indexOf('const legacy = matchPilot();', renderStart);
if (renderStart < 0 || canonicalPosition < 0 || legacyPosition < 0) {
  errors.push('render resolution order could not be inspected');
} else if (canonicalPosition > legacyPosition) {
  errors.push('canonical registry resolution must occur before legacy SVG matching');
}

const canonicalBlockStart = source.indexOf('if (canonical) {', canonicalPosition);
const canonicalBlockEnd = source.indexOf('\n    }', canonicalBlockStart);
const canonicalBlock = canonicalBlockStart >= 0 && canonicalBlockEnd >= 0
  ? source.slice(canonicalBlockStart, canonicalBlockEnd + 6)
  : '';
if (!canonicalBlock.includes('renderCanonical(slot, canonical);') || !canonicalBlock.includes('return;')) {
  errors.push('promoted canonical image must short-circuit legacy fallback');
}

const canonicalErrorStart = source.indexOf('function renderCanonical(');
const legacyRenderStart = source.indexOf('function renderLegacy(');
const canonicalRenderBlock = canonicalErrorStart >= 0 && legacyRenderStart > canonicalErrorStart
  ? source.slice(canonicalErrorStart, legacyRenderStart)
  : '';
if (canonicalRenderBlock.includes('renderLegacy(') || canonicalRenderBlock.includes('matchPilot(')) {
  errors.push('canonical image load failure must not silently fall back to legacy SVG');
}

if (errors.length) {
  console.error('Construction Tools Atlas canonical image runtime v2.3: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas canonical image runtime v2.3: PASS');
console.log(`- registry cache key: ${registryVersion}`);
console.log('- resolution order: promoted canonical registry -> legacy SVG pilot -> no image');
console.log('- promoted canonical ownership suppresses legacy fallback even on raster load failure');
