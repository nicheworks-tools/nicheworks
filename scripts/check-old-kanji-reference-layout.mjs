import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cssPath = path.join(root, 'tools/old-kanji-reference/verified-badge.css');
const htmlPath = path.join(root, 'tools/old-kanji-reference/index.html');
const css = fs.readFileSync(cssPath, 'utf8');
const html = fs.readFileSync(htmlPath, 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(css.includes('.group-wrapper #groupContainer'), 'missing groupContainer layout rule');
check(css.includes('max-height: none;'), 'groupContainer must remain in natural page flow');
check(css.includes('overflow: visible;'), 'groupContainer must not become a nested scroll box');
check(!css.includes('max-height: min(72vh, 960px)'), 'legacy desktop nested-scroll hotfix returned');
check(!css.includes('max-height: 68vh'), 'legacy mobile nested-scroll hotfix returned');
check(!css.includes('overflow-y: auto'), 'groupContainer must not use nested vertical scrolling');
check(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'), 'desktop two-column reference grid missing');
check(css.includes('@media (max-width: 720px)'), 'mobile reference grid breakpoint missing');
check(html.includes('verified-badge.css?v=20260914-reference-layout-2'), 'layout repair stylesheet cache key missing');

if (failures.length) {
  console.error(`Old Kanji Reference layout contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji Reference layout contract passed.');
