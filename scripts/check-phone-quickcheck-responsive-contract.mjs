import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'tools/phone-quickcheck/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'tools/phone-quickcheck/style.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'tools/phone-quickcheck/app.js'), 'utf8');

const failures = [];
const requireText = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(label);
};

requireText(html, 'name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"', 'viewport meta must be mobile-safe');
requireText(html, 'class="workspace"', 'desktop workspace missing');
requireText(html, 'class="list-panel"', 'phone list panel missing');
requireText(html, 'id="desktopDetail" class="detail-panel"', 'desktop detail panel missing');
requireText(html, 'id="sheetBackdrop"', 'mobile sheet backdrop missing');
requireText(html, 'id="mobileSheet" class="bottom-sheet"', 'mobile bottom sheet missing');
requireText(html, 'id="sheetClose"', 'mobile sheet close control missing');

requireText(css, '@media(max-width:900px)', '900px mobile/tablet breakpoint missing');
requireText(css, '.workspace{grid-template-columns:1fr}', 'mobile workspace must collapse to one column');
requireText(css, '.detail-panel{display:none}', 'desktop detail must hide at mobile breakpoint');
requireText(css, '.phone-row .cell,.phone-row .port-cell{display:none}', 'mobile list must collapse secondary table cells');
requireText(css, '.bottom-sheet.open{display:block;position:fixed', 'mobile bottom sheet fixed layout missing');
requireText(css, 'max-height:88vh;overflow:auto', 'mobile bottom sheet vertical scrolling contract missing');
requireText(css, 'padding-bottom:env(safe-area-inset-bottom)', 'mobile safe-area padding missing');
requireText(css, '@media(max-width:600px)', '600px narrow breakpoint missing');
requireText(css, '@media(max-width:480px)', '480px phone breakpoint missing');
requireText(css, '.kv{display:grid;grid-template-columns:max-content minmax(0,1fr)', 'detail key/value grid must preserve mobile labels');
requireText(css, '.kv span:first-child{color:var(--muted);white-space:nowrap}', 'detail labels must not collapse into per-character wrapping');

requireText(app, "window.matchMedia('(max-width: 900px)').matches", 'runtime mobile breakpoint must match CSS 900px contract');
requireText(app, 'function openSheet()', 'mobile sheet open behavior missing');
requireText(app, 'function closeSheet()', 'mobile sheet close behavior missing');
requireText(app, "event.key === 'Escape'", 'Escape dismissal missing');

if (failures.length) {
  console.error(`Phone QuickCheck responsive contract failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('Phone QuickCheck responsive contract passed: desktop >900px, tablet/mobile <=900px, narrow <=600px, phone <=480px (covers 320/390/414px).');
