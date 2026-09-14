const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const bootstrap = fs.readFileSync(path.join(ROOT, 'detail-dictionary-fix.js'), 'utf8');
const runtime = fs.readFileSync(path.join(ROOT, 'deep-link-v2.3.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'deep-link-v2.3.css'), 'utf8');

const errors = [];
function requireText(source, token, message) {
  if (!source.includes(token)) errors.push(message || `missing ${token}`);
}
function forbidText(source, token, message) {
  if (source.includes(token)) errors.push(message || `forbidden ${token}`);
}

requireText(bootstrap, 'deep-link-v2.3.js', 'compatibility bootstrap must load deep-link runtime');
requireText(bootstrap, 'deep-link-v2.3.css', 'compatibility bootstrap must load deep-link styles');
requireText(runtime, 'const ENTRY_PARAM = "entry"', 'entry query parameter contract is missing');
requireText(runtime, 'url.searchParams.set(ENTRY_PARAM, id)', 'share URL must be built from canonical entry ID');
requireText(runtime, 'url.search = ""', 'share URL must start from a query-free canonical base');
requireText(runtime, 'navigator.share', 'Web Share API path is missing');
requireText(runtime, 'navigator.clipboard.writeText(payload.url)', 'clipboard URL fallback is missing');
requireText(runtime, 'prepareInitialEntryState', 'initial shared-entry history preparation is missing');
requireText(runtime, 'history.replaceState({ ctaAtlasBase: true }', 'base history state is missing');
requireText(runtime, 'history.pushState({ ctaEntry: id }', 'entry history state is missing');
requireText(runtime, 'window.addEventListener("popstate"', 'browser Back/Forward handling is missing');
requireText(runtime, 'closeForPopState()', 'Back must close the active detail surface before leaving the app state');
requireText(runtime, 'showInvalidEntryMessage', 'invalid entry fallback is missing');
requireText(runtime, 'row.click()', 'deep link must route through the canonical runtime detail opener');
requireText(runtime, 'window.CTA_DEEP_LINK', 'public deep-link diagnostics/API surface is missing');
requireText(runtime, 'source: "deep-link"', 'initial deep-link source marker is missing');
requireText(runtime, 'detailHeaderActions', 'detail share action group is missing');
requireText(css, '.detailHeaderActions', 'share/header action styles are missing');
requireText(css, '@media (max-width:520px)', 'mobile share/header guard is missing');
forbidText(runtime, 'searchParams.set("q"', 'raw search query must never be written into shared URLs');
forbidText(runtime, 'searchParams.set("query"', 'raw search query must never be written into shared URLs');

if (errors.length) {
  console.error('Construction Tools Atlas deep-link v2.3 contract: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas deep-link v2.3 contract: PASS');
console.log('- canonical ?entry=<id> URLs only');
console.log('- Web Share with clipboard fallback');
console.log('- shared mobile entry routes through the canonical detail opener');
console.log('- Back closes detail state before leaving the app state');
console.log('- invalid IDs fall back without crashing');
console.log('- raw search text is excluded from shared URLs');
