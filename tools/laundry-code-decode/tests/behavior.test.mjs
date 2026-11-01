import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const appSource = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data.js', import.meta.url), 'utf8');
const storage = new Map();

const documentStub = {
  documentElement: { lang: 'en' },
  getElementById() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() {
    return {
      dataset: {}, style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {}, appendChild() {}, removeChild() {}, remove() {}, select() {},
      removeAttribute() {}, addEventListener() {}, textContent: '', value: '',
    };
  },
  body: { appendChild() {}, removeChild() {} },
  execCommand() { return false; },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en', clipboard: null },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  URL,
  Blob,
  setTimeout,
  clearTimeout,
  requestAnimationFrame(fn) { return setTimeout(fn, 0); },
};
sandbox.window = { SYMBOLS: [], addEventListener() {} };

const context = vm.createContext(sandbox);
vm.runInContext(dataSource, context, { filename: 'tools/laundry-code-decode/data.js' });
vm.runInContext(appSource, context, { filename: 'tools/laundry-code-decode/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

// Input hardening / renderer helpers.
assert.equal(evaluate(`sanitizeCode(' p ')`), 'P');
assert.equal(evaluate(`sanitizeCode('w')`), 'W');
assert.equal(evaluate(`sanitizeCode('A')`), '', 'A is not a current JIS professional-care letter');
assert.equal(evaluate(`sanitizeCode('x')`), '', 'unsupported professional-care code should be discarded');
assert.equal(evaluate(`sanitizeTemp('40')`), 40);
assert.equal(evaluate(`sanitizeTemp(201)`), null, 'temperature above supported range should be rejected');
assert.equal(evaluate(`sanitizeCount(4, 0, 3)`), 3);
assert.equal(evaluate(`sanitizeCount(-2, 0, 3)`), 0);

// Canonical publication contract: exactly the current 43 CAA-listed JIS L 0001:2024 symbols.
const symbols = evaluate('window.SYMBOLS');
assert.equal(symbols.length, 43, 'current JIS publication set must contain exactly 43 symbols');
assert.equal(new Set(symbols.map((s) => s.jis)).size, 43, 'JIS symbol numbers must be unique');
assert.ok(symbols.every((s) => /^\d{3}$/.test(s.jis)), 'every symbol must expose a 3-digit official symbol number');

const expectedJis = [
  '190','170','160','161','150','151','140','141','142','130','131','132','110','111','100',
  '220','210','200',
  '320','310','300','440','445','430','435','420','425','410','415',
  '530','520','510','511','500',
  '620','621','610','611','600','710','711','712','700'
];
assert.deepEqual([...symbols.map((s) => s.jis)].sort(), [...expectedJis].sort());

// Reject the old convenience/data errors that existed before this migration.
assert.equal(symbols.some((s) => s.m?.temp === 20), false, '20°C wash symbols are not in current JIS L 0001:2024');
assert.equal(symbols.some((s) => s.m?.tumble && s.m?.dots === 3), false, 'tumble drying uses only one or two dots');
assert.equal(symbols.some((s) => ['P','F'].includes(s.m?.code) && (s.m?.underline || 0) > 1), false, 'P/F dry cleaning has no very-gentle two-line symbol');
assert.equal(symbols.some((s) => s.jis === '511' && !(s.m?.dots === 1 && s.m?.steamNo)), false, '511 must be low-temperature iron with no steam');

const hand40 = symbols.find((s) => s.jis === '110');
const hand30 = symbols.find((s) => s.jis === '111');
assert.deepEqual({ hand: hand40.m.hand, underline: hand40.m.underline }, { hand: true, underline: 1 });
assert.deepEqual({ hand: hand30.m.hand, underline: hand30.m.underline }, { hand: true, underline: 2 });
assert.equal('temp' in hand40.m, false, '2024 hand-wash graphic does not print a temperature number');

// Geometry regressions for the current symbols.
const washSvg = evaluate(`renderSymbolSVG({ cat: 'wash', m: { temp: 40, underline: 2 } })`);
assert.ok(washSvg.includes('>40</text>'), 'machine-wash symbol should render temperature');
assert.ok(washSvg.includes('M20 55 H44') && washSvg.includes('M20 60 H44'), 'very-gentle wash should render two underlines');

const handSvg = evaluate(`renderSymbolSVG({ cat: 'wash', m: { hand: true, underline: 1 } })`);
assert.equal(handSvg.includes('</text>'), false, 'hand-wash symbol should not invent a printed temperature');
assert.ok(handSvg.includes('M20 55 H44'), '40°C hand wash uses one underline in the 2024 symbol');

const oxygenBleachSvg = evaluate(`renderSymbolSVG({ cat: 'bleach', m: { nonchlorine: true } })`);
assert.ok(oxygenBleachSvg.includes('M22 43 L34 22') && oxygenBleachSvg.includes('M31 47 L43 26'), 'oxygen-only bleach should use two diagonal interior lines');

const wetLineSvg = evaluate(`renderSymbolSVG({ cat: 'dry', m: { verticalLines: 2 } })`);
assert.ok(wetLineSvg.includes('M27 20 V44') && wetLineSvg.includes('M37 20 V44'), 'wet line drying should render two vertical lines');
const wetFlatSvg = evaluate(`renderSymbolSVG({ cat: 'dry', m: { horizontalLines: 2 } })`);
assert.ok(wetFlatSvg.includes('M20 27 H44') && wetFlatSvg.includes('M20 37 H44'), 'wet flat drying should render two horizontal lines');
const shadeSvg = evaluate(`renderSymbolSVG({ cat: 'dry', m: { verticalLines: 1, shade: true } })`);
assert.ok(shadeSvg.includes('M15 30 L30 15'), 'shade marker should be a diagonal corner line');

const wetCleanSvg = evaluate(`renderSymbolSVG({ cat: 'dryclean', m: { code: 'W', underline: 2 } })`);
assert.ok(wetCleanSvg.includes('>W</text>'));
assert.ok(wetCleanSvg.includes('M20 51 H44') && wetCleanSvg.includes('M20 58 H44'), 'very gentle wet cleaning should render two underlines');

const searchText = evaluate(`symbolSearchText({ id: 'jis-141', jis: '141', cat: 'wash', m: { temp: 40, underline: 1 }, ja: { summary: '40℃まで・弱い洗濯', detail: '弱い洗濯' }, en: { summary: 'Gentle wash up to 40°C', detail: 'mild process' } })`);
assert.ok(searchText.includes('141'), 'official symbol number should be searchable');
assert.ok(searchText.includes('40℃まで'));
assert.ok(searchText.includes('gentle wash'));

assert.ok(evaluate(`cautionText()` ).includes('JIS L 0001:2024'), 'safety guidance should identify the current standard');


// The static 43-number guide must match the same official data as the interactive grid.
const htmlSource = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const indexStart = htmlSource.indexOf('<section class="symbol-reference"');
const indexEnd = htmlSource.indexOf('<section class="faq-section"', indexStart);
assert.ok(indexStart > -1 && indexEnd > indexStart, 'static index must appear before FAQ');
const indexHtml = htmlSource.slice(indexStart, indexEnd);
const linkedNumbers = [...indexHtml.matchAll(/href="\?jis=(\d{3})"/g)].map(m => m[1]);
assert.equal(linkedNumbers.length, 43, 'all 43 symbols must be linked for crawlers');
assert.equal(new Set(linkedNumbers).size, 43, 'no duplicate static symbol links');
assert.deepEqual([...linkedNumbers].sort(), [...symbols.map(s => s.jis)].sort(),
  'static index must agree exactly with canonical symbol numbers');
for (const symbol of symbols) {
  assert.ok(indexHtml.includes(symbol.ja.summary), 'missing Japanese static meaning: ' + symbol.jis);
  assert.ok(indexHtml.includes(symbol.en.summary), 'missing English static meaning: ' + symbol.jis);
}
assert.equal(htmlSource.split('id="nwAmazonAffiliate"').length - 1, 1,
  'retain exactly one Amazon accessories mount');
assert.ok(htmlSource.indexOf('id="nwAmazonAffiliate"') < htmlSource.indexOf('<section class="faq-section"'),
  'general accessories should appear before FAQ');
assert.match(htmlSource, /id="resultShare"/, 'share action must be visible on symbol detail');

// Link generation must only allow canonical, fixed three-digit JIS numbers.
sandbox.window.location = { origin: 'https://nicheworks.app', search: '?jis=141' };
assert.equal(evaluate("symbolLink(window.SYMBOLS.find(s => s.jis === '141'))"),
  'https://nicheworks.app/tools/laundry-code-decode/?jis=141');
assert.equal(evaluate("symbolLink({jis:'999'})"), '', 'unknown JIS must not be shared');
assert.equal(evaluate("symbolLink({jis:'141&x=1'})"), '', 'untrusted characters must not become links');
assert.equal(evaluate("symbolLink(null)"), '', 'empty result must not produce a link');
assert.match(appSource, /restoreSymbolFromUrl\(\);/, 'URL restoration must be wired on load');

console.log('Laundry Code Decode JIS L 0001:2024 behavior/data contract passed.');
