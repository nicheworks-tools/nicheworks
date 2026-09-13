import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

const documentStub = {
  documentElement: { lang: 'ja' },
  addEventListener() {},
  getElementById() { return null; },
  querySelectorAll() { return []; },
  createElement() {
    return {
      dataset: {},
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      appendChild() {},
      addEventListener() {},
      setAttribute() {},
      textContent: '',
      innerHTML: '',
      hidden: false,
      disabled: false,
    };
  },
  body: { appendChild() {}, removeChild() {} },
  execCommand() { return false; },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'ja', clipboard: null },
  URL,
  setTimeout,
  clearTimeout,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/redirect-unwrapper/app.js' });
const evaluate = (expression) => vm.runInContext(expression, context);

assert.equal(
  evaluate(`normalizeUrl('example.com/path')`),
  'https://example.com/path',
  'scheme-less input should be normalized to https',
);

assert.equal(
  evaluate(`decodeRepeated('https%253A%252F%252Fdest.example%252Fpage%253Fa%253D1')`),
  'https://dest.example/page?a=1',
  'nested percent encoding should be decoded repeatedly',
);

const nested = JSON.parse(evaluate(`JSON.stringify(analyzeUrlString('https://tracker.example/click?url=https%253A%252F%252Fdest.example%252Fpage%253Fa%253D1&utm_source=mail&utm_medium=email&utm_campaign=launch'))`));
assert.equal(nested.host, 'tracker.example');
assert.equal(nested.candidates.length, 1, 'one destination candidate should be extracted');
assert.equal(nested.candidates[0].host, 'dest.example');
assert.equal(nested.candidates[0].url, 'https://dest.example/page?a=1');
assert.deepEqual(nested.trackingParams.map((item) => item.key), ['utm_source', 'utm_medium', 'utm_campaign']);
assert.ok(nested.warnings.some((warning) => warning.includes('表示ドメインと転送先候補のドメインが異なります')), 'host mismatch warning should be surfaced');
assert.ok(nested.warnings.some((warning) => warning.includes('追跡パラメータが多く含まれています')), 'many-tracker warning should be surfaced');

const ipHttp = JSON.parse(evaluate(`JSON.stringify(analyzeUrlString('http://192.0.2.10/admin'))`));
assert.equal(ipHttp.scheme, 'http:');
assert.ok(ipHttp.warnings.some((warning) => warning.includes('HTTP URLです')), 'plain HTTP should be warned');
assert.ok(ipHttp.warnings.some((warning) => warning.includes('ホストがIPアドレスです')), 'IP hosts should be warned');

assert.deepEqual(
  JSON.parse(evaluate(`JSON.stringify(findHttpUrls('go https://one.example/a), then https://two.example/b.;'))`)),
  ['https://one.example/a', 'https://two.example/b'],
  'embedded URL extraction should trim trailing punctuation',
);

console.log('Redirect Unwrapper behavior test passed.');
