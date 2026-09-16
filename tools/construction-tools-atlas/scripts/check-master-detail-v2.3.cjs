const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const html = read('index.html');
const runtime = read('app.runtime.js');
const css = read('style.css');

const errors = [];
const requireText = (source, token, message) => { if (!source.includes(token)) errors.push(message || `missing ${token}`); };
const forbidText = (source, token, message) => { if (source.includes(token)) errors.push(message || `forbidden ${token}`); };

requireText(html, 'id="atlasWorkspace"', 'authoritative master-detail workspace must exist in HTML before runtime');
requireText(html, 'id="detailPanel"', 'one authoritative detail panel must exist in HTML');
requireText(html, 'id="detailContent"', 'detail content surface must exist in HTML');
requireText(html, 'id="mobileBackdrop"', 'mobile sheet backdrop must exist in HTML');

const detailPanels = (html.match(/id="detailPanel"/g) || []).length;
if (detailPanels !== 1) errors.push(`expected exactly one #detailPanel, found ${detailPanels}`);

requireText(css, 'grid-template-columns:minmax(360px,43fr) minmax(0,57fr)', 'desktop master/detail proportions must remain approximately 43/57');
requireText(css, 'height:clamp(660px,calc(100vh - 255px),920px)', 'workspace must own a real desktop height');
requireText(css, '.detailPanel{position:relative;display:grid;grid-template-rows:minmax(0,1fr)}', 'visible detail panel must fill the workspace');
requireText(css, '.detailContent{height:100%;min-height:0;display:flex;flex-direction:column}', 'detail content must fill the panel');
requireText(css, '.detailScroll{flex:1;min-height:0;overflow:auto', 'detail body must use the remaining panel height');
requireText(css, '@media(max-width:899px)', 'mobile breakpoint is missing');
requireText(css, 'position:fixed;z-index:50', 'mobile detail must become a fixed bottom sheet');
requireText(css, 'height:min(88dvh,820px)', 'mobile bottom sheet height guard is missing');

requireText(runtime, 'const MOBILE_QUERY = "(max-width: 899px)"', 'runtime mobile breakpoint must align with CSS');
requireText(runtime, 'els.detailPanel.dataset.open = "true"', 'detail opener must expose mobile open state');
requireText(runtime, 'els.detailPanel.dataset.open = "false"', 'detail closer must clear mobile open state');
requireText(runtime, 'row.dataset.entryId = entry.id', 'result rows must preserve canonical selection identity');
requireText(runtime, 'aria-current', 'selected result state must be accessible');
requireText(runtime, 'els.detailClose.addEventListener("click"', 'dedicated mobile detail close behavior is missing');
requireText(runtime, 'window.matchMedia(MOBILE_QUERY)', 'runtime must synchronize mobile backdrop behavior');

forbidText(runtime, 'appendChild(detail)', 'authoritative detail DOM must not be re-parented at runtime');
forbidText(runtime, 'detailPanel--desktop', 'legacy desktop detail mode class must not return');
forbidText(runtime, 'detailPanel--mobile', 'legacy mobile detail mode class must not return');
forbidText(html, 'master-detail-v2.3.css', 'legacy master-detail patch stylesheet must not be in the production entrypoint');

if (errors.length) {
  console.error('Construction Tools Atlas master-detail v2.3 contract: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas master-detail v2.3 contract: PASS');
console.log('- one authoritative master-detail DOM from initial HTML');
console.log('- desktop 43/57 workspace with actual detail surface height');
console.log('- same detail surface becomes a mobile bottom sheet without re-parenting');
