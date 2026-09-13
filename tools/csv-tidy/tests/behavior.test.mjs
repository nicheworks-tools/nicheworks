import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const exportNeedle = '  document.addEventListener("DOMContentLoaded", init);\n})();';
assert.ok(source.includes(exportNeedle), 'csv-tidy test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = { guessDelimiter, parseCSV, mustQuote, stringifyCSV, convertZenHan, csvtdyZen2Han, csvtdyHan2Zen, csvtdyCleanCell };\n${exportNeedle}`,
);

function makeElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    checked: false,
    dataset: {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {},
    appendChild() {},
    insertAdjacentElement() {},
    setAttribute() {},
  };
}

const documentStub = {
  querySelector() { return makeElement(); },
  querySelectorAll() { return []; },
  getElementById() { return makeElement(); },
  createElement() { return makeElement(); },
  addEventListener() {},
};

const sandbox = {
  console,
  document: documentStub,
  window: {},
  navigator: { language: 'en' },
  TextDecoder,
  Blob,
  URL,
  setTimeout,
  clearTimeout,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/csv-tidy/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

assert.equal(api.guessDelimiter('a,b\n1,2\n'), ',');
assert.equal(api.guessDelimiter('a\tb\n1\t2\n'), '\t');
assert.equal(api.guessDelimiter('a;b\n1;2\n'), ';');
assert.equal(api.guessDelimiter('plain text only'), ',', 'comma should remain the safe default when no delimiter is detected');

const parsed = JSON.parse(JSON.stringify(api.parseCSV('a,b\r\n"1,2","x""y"\r\n', ',')));
assert.deepEqual(parsed, [['a', 'b'], ['1,2', 'x"y']]);

const multiline = JSON.parse(JSON.stringify(api.parseCSV('"a\nb",c\n', ',')));
assert.deepEqual(multiline, [['a\nb', 'c']], 'quoted newlines should stay inside the field');

assert.throws(
  () => api.parseCSV('"unclosed,value', ','),
  (error) => error && error.code === 'unclosed_quote' && error.message === 'unclosed_quote',
  'unclosed quoted fields should fail deterministically',
);

assert.equal(api.mustQuote('plain', ','), false);
assert.equal(api.mustQuote('a,b', ','), true);
assert.equal(api.mustQuote('a"b', ','), true);
assert.equal(api.mustQuote('a\nb', ','), true);

assert.equal(
  api.stringifyCSV([['a,b', 'x"y'], ['z', 'q']], ',', 'crlf'),
  '"a,b","x""y"\r\nz,q\r\n',
  'CSV output should escape quotes and honor CRLF mode',
);

assert.equal(api.convertZenHan('ＡＢＣ１２３　！', 'zen2han'), 'ABC123 !');
assert.equal(api.convertZenHan('ABC 123!', 'han2zen'), 'ＡＢＣ　１２３！');
assert.equal(api.csvtdyZen2Han('Ｔｅｓｔ　１２３！'), 'Test 123!');
assert.equal(api.csvtdyHan2Zen('Test 123!'), 'Ｔｅｓｔ　１２３！');

assert.equal(
  api.csvtdyCleanCell('  ＡＢ  ', false, {
    trimOn: true,
    normOn: false,
    zenOn: true,
    zenDir: 'zen2han',
    zenHeader: false,
    zenData: true,
  }),
  'AB',
  'data cleaning should trim and apply configured zen-to-han conversion',
);
assert.equal(
  api.csvtdyCleanCell('  ＡＢ  ', true, {
    trimOn: true,
    normOn: false,
    zenOn: true,
    zenDir: 'zen2han',
    zenHeader: false,
    zenData: true,
  }),
  'ＡＢ',
  'header conversion should remain disabled when zenHeader is false',
);

console.log('CSV Tidy behavior test passed.');
