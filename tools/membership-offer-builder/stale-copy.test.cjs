const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const INPUT_IDS = [
  'topicInput', 'audienceInput', 'deliverablesInput', 'frequencyInput',
  'timeInput', 'priceInput', 'planCountInput', 'notIncludedInput',
  'cancelRefundInput', 'firstMonthInput', 'retentionInput',
  'communityInput', 'workloadLimitInput'
];

function harness(language = 'ja') {
  const nodes = new Map();
  const callbacks = new Map();
  let copied = '';
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', hidden: true, style: {}, dataset: {},
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(name, fn) { callbacks.set(id + ':' + name, fn); },
      async emit(name) { await callbacks.get(id + ':' + name)?.(); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: language },
    getElementById: get,
    querySelectorAll() { return []; },
    addEventListener(name, fn) { callbacks.set('document:' + name, fn); },
    body: { appendChild() {} },
    createElement() { return { style: {}, value: '', setAttribute() {}, select() {}, remove() {} }; },
    execCommand() { return false; }
  };
  const navigator = {
    language,
    clipboard: { async writeText(value) { copied = value; } }
  };
  const window = { isSecureContext: true };
  const localStorage = { getItem() { return null; }, setItem() {} };
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source, {
    document, navigator, window, localStorage,
    clearTimeout() {}, setTimeout() { return 1; }
  });
  callbacks.get('document:DOMContentLoaded')();
  return { get, clipboard: () => copied };
}

test('changing membership price and cancellation terms clears old offer and prevents copying it', async () => {
  const { get, clipboard } = harness();
  get('topicInput').value = 'Community';
  get('priceInput').value = '¥500';
  get('cancelRefundInput').value = 'Cancel anytime';
  await get('buildOfferBtn').emit('click');
  assert.match(get('offerOutput').value, /¥500/);
  await get('copyOfferBtn').emit('click');
  assert.match(clipboard(), /¥500/);

  get('priceInput').value = '¥900';
  await get('priceInput').emit('input');
  assert.doesNotMatch(get('offerOutput').value, /¥500/);
  await get('copyOfferBtn').emit('click');
  assert.match(get('toast').textContent, /再生成/);
  assert.doesNotMatch(clipboard(), /¥900/);

  await get('buildOfferBtn').emit('click');
  await get('copyOfferBtn').emit('click');
  assert.match(clipboard(), /¥900/);
  assert.doesNotMatch(clipboard(), /¥500/);

  get('cancelRefundInput').value = 'No refund';
  await get('cancelRefundInput').emit('change');
  assert.doesNotMatch(get('offerOutput').value, /Cancel anytime/);
});

test('copy refuses eventless edits; all 13 input fields invalidate generated output', async () => {
  const { get, clipboard } = harness('en');
  get('topicInput').value = 'Initial topic';
  await get('buildOfferBtn').emit('click');
  get('topicInput').value = 'Updated topic';
  await get('copyOfferBtn').emit('click');
  assert.equal(clipboard(), '');
  assert.equal(get('offerOutput').value, 'Fill in the fields, then click Build offer.');

  for (const id of INPUT_IDS) {
    await get('buildOfferBtn').emit('click');
    assert.match(get('offerOutput').value, /Membership Offer Draft/);
    get(id).value += ' changed';
    await get(id).emit('change');
    assert.equal(get('offerOutput').value, 'Fill in the fields, then click Build offer.');
  }
  await get('buildOfferBtn').emit('click');
  await get('copyOfferBtn').emit('click');
  assert.match(clipboard(), /Updated topic/);
});
