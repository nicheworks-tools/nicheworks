// Run: node --test tools/pages-deploy-guide/tests/download-failure.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function launch(options = {}) {
  const listeners = new Map();
  const elements = new Map();
  const ids = ['platform','sourceType','customDomain','outputFolder','output','errors','diagnosis','proPack','generate','copyAll','downloadMd','toast'];
  for (const id of ids) {
    elements.set(id, {
      value: ({platform:'cloudflare',sourceType:'static',customDomain:'no',outputFolder:'root'})[id] || '',
      style: {}, classList: { add(){}, remove(){} }, dataset: {},
      addEventListener(event, callback) { listeners.set(id + ':' + event, callback); }
    });
  }
  const calls = { clicks: 0, removed: 0, revoked: 0 };
  const document = {
    documentElement: { lang: 'en' },
    body: { appendChild(node) { if (options.appendThrows) throw Error('append denied'); } },
    getElementById(id) { return elements.get(id); },
    querySelectorAll() { return []; },
    addEventListener(event, callback) { if (event === 'DOMContentLoaded') callback(); },
    createElement(tag) {
      return {
        style: {},
        click() { calls.clicks++; if (options.clickThrows) throw Error('click denied'); },
        remove() { calls.removed++; }
      };
    }
  };
  const URL = {
    createObjectURL() { if (options.urlThrows) throw Error('object URL denied'); return 'blob:test'; },
    revokeObjectURL() { calls.revoked++; }
  };
  const context = {
    document, URL, Blob, Date, String, navigator: { language: 'en' },
    localStorage: { getItem() { return null; }, setItem() {} },
    setTimeout(callback) { callback(); return 1; }, clearTimeout() {}
  };
  vm.runInNewContext(source, context, { filename: 'app.js' });
  listeners.get('generate:click')();
  listeners.get('downloadMd:click')();
  return { calls, toast: elements.get('toast').textContent };
}

test('object URL failure shows download error rather than throwing', () => {
  const result = launch({ urlThrows: true });
  assert.equal(result.calls.clicks, 0);
  assert.match(result.toast, /Could not start download/);
});
test('DOM append failure revokes object URL and shows error', () => {
  const result = launch({ appendThrows: true });
  assert.equal(result.calls.revoked, 1);
  assert.match(result.toast, /Could not start download/);
});
test('anchor click failure removes anchor and revokes URL', () => {
  const result = launch({ clickThrows: true });
  assert.equal(result.calls.removed, 1);
  assert.equal(result.calls.revoked, 1);
  assert.match(result.toast, /Could not start download/);
});
test('normal download starts and cleans up', () => {
  const result = launch();
  assert.equal(result.calls.clicks, 1);
  assert.equal(result.calls.removed, 1);
  assert.equal(result.calls.revoked, 1);
  assert.match(result.toast, /Markdown download started/);
});
