import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const exportNeedle = '  document.addEventListener("DOMContentLoaded", initTool);\n})();';
assert.ok(source.includes(exportNeedle), 'money-template-checker test export hook must match production source');
source = source.replace(
  exportNeedle,
  `  globalThis.__test = { parseMoneyInput, parseMoneyInputEn, buildWarnings, ratioText, buildOutput, buildTemplatePack, buildCsvPack };\n${exportNeedle}`,
);

function makeElement() {
  return {
    value: '',
    textContent: '',
    dataset: {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    setAttribute() {},
    appendChild() {},
    removeChild() {},
    select() {},
    click() {},
    remove() {},
  };
}

const storage = new Map();
const documentStub = {
  documentElement: { lang: 'ja' },
  querySelectorAll() { return []; },
  addEventListener() {},
  getElementById() { return makeElement(); },
  createElement() { return makeElement(); },
  execCommand() { return true; },
  body: makeElement(),
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'ja', clipboard: { async writeText() {} } },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
  Blob,
  URL,
  Intl,
  Date,
  setTimeout,
  clearTimeout,
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/money-template-checker/app.js' });
const api = context.__test;
assert.ok(api, 'test exports should be available');

const requiredEmpty = api.parseMoneyInput({ value: '' }, '月収', true);
assert.equal(requiredEmpty.ok, false);
assert.match(requiredEmpty.error, /未入力/);

const optionalEmpty = api.parseMoneyInput({ value: '   ' }, '固定費', false);
assert.equal(optionalEmpty.ok, true);
assert.equal(optionalEmpty.value, 0);
assert.equal(optionalEmpty.empty, true);

assert.equal(api.parseMoneyInput({ value: '120000' }, '月収', true).value, 120000);
assert.equal(api.parseMoneyInput({ value: '-1' }, '月収', true).ok, false);
assert.equal(api.parseMoneyInput({ value: 'abc' }, '月収', true).ok, false);
assert.equal(api.parseMoneyInput({ value: '1000000000' }, '月収', true).ok, false);
assert.match(api.parseMoneyInputEn({ value: '-5' }, 'Income', true).error, /negative values are not allowed/);

const warningSummary = {
  remaining: -1000,
  canJudgeRatios: true,
  fixedRatio: 0.61,
  variableRatio: 0.51,
  savings: 40000,
  savingsRatio: 0.31,
  optionalEmpty: ['Savings target'],
};
const warnings = Array.from(api.buildWarnings('en', warningSummary));
assert.equal(warnings.length, 5, 'all configured threshold/blank warnings should be emitted');
assert.ok(warnings.some((line) => line.includes('Expenses plus savings target exceed income')));
assert.ok(warnings.some((line) => line.includes('Fixed costs exceed 60%')));
assert.ok(warnings.some((line) => line.includes('Variable costs exceed 50%')));
assert.ok(warnings.some((line) => line.includes('Savings target exceeds 30%')));
assert.ok(warnings.some((line) => line.includes('Some optional fields are blank')));

const zeroIncomeWarnings = Array.from(api.buildWarnings('en', {
  remaining: 0,
  canJudgeRatios: false,
  fixedRatio: 0,
  variableRatio: 0,
  savings: 0,
  savingsRatio: 0,
  optionalEmpty: [],
}));
assert.ok(zeroIncomeWarnings.some((line) => line.includes('Income is 0')));
assert.equal(api.ratioText('en', { canJudgeRatios: false }, 0), 'N/A for 0 income');
assert.equal(api.ratioText('en', { canJudgeRatios: true }, 0.256), '26%');

const summary = {
  generatedAt: '2026-09-13T00:00:00.000Z',
  income: 300000,
  fixed: 120000,
  variable: 90000,
  savings: 30000,
  remaining: 60000,
  fixedRatio: 0.4,
  variableRatio: 0.3,
  savingsRatio: 0.1,
  canJudgeRatios: true,
  warnings: [],
};
const output = api.buildOutput('en', summary);
assert.match(output, /■ Summary/);
assert.match(output, /Currency: JPY/);
assert.match(output, /No major warning detected/);
assert.match(output, /not financial, investment, tax, debt, insurance, or life-planning advice/i);

const template = api.buildTemplatePack('en', summary);
assert.match(template, /# Budget Template \(Simple\)/);
assert.match(template, /generated_at: 2026-09-13T00:00:00.000Z/);
assert.match(template, /currency: JPY/);

const csv = api.buildCsvPack('en', summary);
assert.equal(csv.charCodeAt(0), 0xfeff, 'CSV should retain UTF-8 BOM');
assert.match(csv, /"meta","currency","JPY"/);
assert.match(csv, /"Remaining","60000"/);

console.log('Money Template Checker behavior test passed.');
