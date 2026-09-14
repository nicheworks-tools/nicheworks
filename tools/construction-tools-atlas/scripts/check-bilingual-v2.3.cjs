const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const bootstrapPath = path.join(ROOT, 'detail-dictionary-fix.js');
const controllerPath = path.join(ROOT, 'dictionary-presentation-v2.3.js');
const cssPath = path.join(ROOT, 'bilingual-v2.3.css');
const bootstrap = fs.readFileSync(bootstrapPath, 'utf8');
const controller = fs.readFileSync(controllerPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const errors = [];
function requireText(source, token, message) {
  if (!source.includes(token)) errors.push(message || `missing ${token}`);
}
function forbidText(source, token, message) {
  if (source.includes(token)) errors.push(message || `forbidden ${token}`);
}

requireText(bootstrap, 'dictionary-presentation-v2.3.js', 'legacy detail bootstrap must load the v2.3 presentation module');
requireText(controller, 'cta_lang_mode', 'language mode must persist independently of legacy JA/EN state');
requireText(controller, 'new Set(["ja", "en", "both"])', 'JA / EN / Both mode set is missing');
requireText(controller, '["ja", "日本語"]', 'Japanese mode control is missing');
requireText(controller, '["en", "English"]', 'English mode control is missing');
requireText(controller, '["both", "Both"]', 'Both mode control is missing');
requireText(controller, 'secondaryLanguageToggle', 'secondary-language per-section toggle is missing');
requireText(controller, 'aria-expanded', 'secondary-language toggle must expose expanded state');
requireText(controller, 'mode === "both"', 'Both rendering branch is missing');
requireText(controller, 'termblock__secondaryName', 'names must retain the secondary language');
requireText(controller, 'cta:language-mode', 'language mode change event is missing');
requireText(controller, 'localStorage.setItem(MODE_KEY, mode)', 'mode persistence write is missing');
requireText(controller, 'renderTerms(entry)', 'canonical bilingual name renderer is missing');
requireText(controller, 'appendSection(meaning', 'bilingual explanatory section renderer is missing');
requireText(controller, 'appendSection(examples', 'bilingual examples renderer is missing');
requireText(controller, 'appendSection(aliases', 'bilingual aliases renderer is missing');
forbidText(controller, 'createSvgNode(', 'dictionary presentation controller must not synthesize representative SVG images');
forbidText(controller, 'IMAGE_PILOT = new Map', 'legacy inline SVG image pilot map must be removed from presentation controller');

requireText(css, '.ctaLangModes', 'three-mode language control CSS is missing');
requireText(css, '.secondaryLanguageToggle', 'secondary-language toggle CSS is missing');
requireText(css, 'html[data-lang-mode="both"]', 'Both-mode stacked presentation CSS is missing');
requireText(css, '.bilingualCopy + .bilingualCopy', 'Both-mode vertical language separation is missing');
requireText(css, '@media (max-width:520px)', 'mobile language control guard is missing');

if (errors.length) {
  console.error('Construction Tools Atlas bilingual v2.3 contract: FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Construction Tools Atlas bilingual v2.3 contract: PASS');
console.log('- compatibility bootstrap loads the presentation module');
console.log('- modes: ja / en / both');
console.log('- names remain bilingual');
console.log('- secondary explanatory language expands per section');
console.log('- Both mode stacks both languages vertically');
console.log('- representative-image SVG synthesis stays out of the presentation module');
