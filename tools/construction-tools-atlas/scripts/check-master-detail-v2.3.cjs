const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const runtime = read('app.runtime.js');
const css = read('master-detail-v2.3.css');
const html = read('index.html');

let failed = false;
function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    console.error(`ERROR: missing ${label}: ${needle}`);
    failed = true;
  } else {
    console.log(`OK: ${label}`);
  }
}

requireText(html, 'id="detailSheet"', 'single canonical detail surface');
requireText(runtime, 'const DETAIL_MEDIA = "(min-width: 900px)"', 'desktop detail breakpoint');
requireText(runtime, 'id = "atlasWorkspace"', 'runtime master-detail workspace');
requireText(runtime, 'id = "atlasDetailHost"', 'desktop detail host');
requireText(runtime, 'detailPanel--desktop', 'desktop detail mode');
requireText(runtime, 'detailPanel--mobile', 'mobile detail mode');
requireText(runtime, 'document.body.appendChild(detail)', 'mobile detail re-parenting');
requireText(runtime, 'host.appendChild(detail)', 'desktop detail re-parenting');
requireText(runtime, 'row.dataset.entryId = e.id', 'canonical result row selection state');
requireText(runtime, 'row--selected', 'selected result styling hook');
requireText(runtime, 'els.detailClose?.addEventListener("click", closeDetail)', 'dedicated detail close behavior');
requireText(runtime, 'detailMedia?.addEventListener?.("change"', 'responsive mode synchronization');
requireText(css, '@media (min-width: 900px)', 'desktop CSS contract');
requireText(css, 'grid-template-columns: minmax(360px, 44%) minmax(0, 56%)', 'desktop master/detail proportions');
requireText(css, '@media (max-width: 899px)', 'mobile CSS contract');
requireText(css, 'position: fixed', 'mobile sheet positioning');
requireText(css, 'max-height: min(86dvh', 'mobile sheet height guard');

const detailIds = (html.match(/id="detailSheet"/g) || []).length;
if (detailIds !== 1) {
  console.error(`ERROR: expected exactly one #detailSheet in HTML, found ${detailIds}`);
  failed = true;
} else {
  console.log('OK: one canonical #detailSheet is shared by PC and mobile');
}

if (failed) process.exit(1);
console.log('Construction Tools Atlas master-detail v2.3 contract: PASS');
