import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cssPath = path.join(root, 'tools/old-kanji-reference/verified-badge.css');
const jsPath = path.join(root, 'tools/old-kanji-reference/verified-badge.js');
const htmlPath = path.join(root, 'tools/old-kanji-reference/index.html');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(css.includes('.group-wrapper #groupContainer'), 'missing groupContainer layout rule');
check(css.includes('max-height: min(72vh, 960px)'), 'desktop all-entries list height bound missing');
check(css.includes('overflow-y: auto'), 'all-entries list must remain independently scrollable');
check(css.includes('max-height: 68vh'), 'mobile all-entries list height bound missing');
check(css.includes('@media print'), 'print override missing');
check(css.includes('max-height: none;'), 'print must release the list height bound');
check(css.includes('overflow: visible;'), 'print must expose the full list');
check(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'), 'desktop two-column reference grid missing');
check(css.includes('@media (max-width: 720px)'), 'mobile reference grid breakpoint missing');
check(html.includes('verified-badge.css?v=20260914-modern-summary-4'), 'current modern-summary stylesheet cache key missing');
check(!html.includes('verified-badge.css?v=20260914-reference-layout-2'), 'stale modern-summary stylesheet cache key returned');

check(css.includes('.modern-summary ul'), 'grouped-by-modern summary grid styles missing');
check(css.includes('grid-template-columns: repeat(3, minmax(0, 1fr));'), 'desktop grouped-by-modern compact grid missing');
check(css.includes('.modern-summary li > div'), 'grouped-by-modern inline pair styling missing');
check(css.includes('@media (max-width: 340px)'), 'narrow-screen grouped-by-modern fallback missing');
check(js.includes('function normalizeModernSummaryPlacement()'), 'grouped-by-modern placement normalizer missing');
check(js.includes('emptyMessage.insertAdjacentElement("afterend", panel);'), 'grouped-by-modern summary must appear after the all-entries list');
check(js.includes('normalizeModernSummaryPlacement();'), 'grouped-by-modern placement normalizer is not executed');
check(js.includes('document.querySelector(".group-wrapper") || document.body'), 'dynamic summary observer must watch the whole group wrapper');
check(html.includes('verified-badge.js?v=20260914-modern-summary-4'), 'current modern-summary script cache key missing');
check(!html.includes('verified-badge.js?v=20260503-okj-badge-1'), 'stale modern-summary script cache key returned');

if (failures.length) {
  console.error(`Old Kanji Reference layout contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji Reference layout contract passed.');