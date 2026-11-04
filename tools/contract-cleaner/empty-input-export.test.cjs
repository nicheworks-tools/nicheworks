const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createHarness() {
  const input = { value: '' };
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  const copied = [];
  const files = [];
  let downloads = 0;
  const document = {
    getElementById(id) {
      if (id === 'contractText') return input;
      if (id === 'copyToast') return toast;
      return null;
    },
    addEventListener() {},
    createElement(name) {
      assert.equal(name, 'a');
      return { href: '', download: '', click() { downloads += 1; }, remove() {} };
    },
    body: { appendChild() {} }
  };
  const context = {
    document,
    navigator: { clipboard: { async writeText(value) { copied.push(value); } } },
    window: { isSecureContext: true, setTimeout() {} },
    Blob,
    URL: {
      createObjectURL(blob) { files.push(blob); return 'blob:contract-cleaner:test'; },
      revokeObjectURL() {}
    }
  };
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  vm.runInNewContext(source + '\n;globalThis.__contractTest = { handleCopySummary, handleCopyQuestions, handleDownload };', context, { filename: 'app.js' });
  return { input, toast, copied, files, get downloads() { return downloads; }, methods: context.__contractTest };
}

test('empty and whitespace-only documents cannot generate or export a fake zero-hit review', async () => {
  const h = createHarness();
  for (const value of ['', '   ', '\r\n\t \r\n']) {
    h.input.value = value;
    await h.methods.handleCopySummary();
    assert.equal(h.copied.length, 0);
    assert.equal(h.toast.textContent, 'コピーする内容がありません');
    h.methods.handleDownload();
    assert.equal(h.files.length, 0);
    assert.equal(h.downloads, 0);
  }
});

test('a genuine no-keyword contract still produces a no-match report rather than suppressing output', async () => {
  const h = createHarness();
  h.input.value = 'これは一般的な説明文です。';
  await h.methods.handleCopySummary();
  assert.equal(h.copied.length, 1);
  assert.match(h.copied[0], /注意語は見つかりませんでした/);
  h.methods.handleDownload();
  assert.equal(h.downloads, 1);
  assert.equal(h.files.length, 1);
  assert.match(await h.files[0].text(), /注意語は見つかりませんでした/);
});

test('real keyword findings are preserved after the empty-input guard', async () => {
  const h = createHarness();
  h.input.value = '損害賠償責任の上限を定めます。';
  await h.methods.handleCopySummary();
  assert.match(h.copied[0], /損害賠償/);
  h.methods.handleDownload();
  assert.match(await h.files[0].text(), /損害賠償/);
  assert.equal(h.downloads, 1);
});

test('clearing a previously valid document never exports that previous content', async () => {
  const h = createHarness();
  h.input.value = '損害賠償責任を定めます。';
  h.methods.handleDownload();
  assert.equal(h.files.length, 1);
  h.input.value = '';
  await h.methods.handleCopySummary();
  h.methods.handleDownload();
  assert.equal(h.copied.length, 0);
  assert.equal(h.files.length, 1);
  assert.equal(h.downloads, 1);
});
