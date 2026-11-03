const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(persisted = null) {
  const nodes = new Map(), events = new Map(), downloads = [], storage = new Map();
  if (persisted !== null) storage.set('nw_mini_game_scores', JSON.stringify(persisted));
  let lastBlob = null, intervalCount = 0;
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', style: {}, dataset: {}, checked: false,
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(event, fn) { events.set(id + ':' + event, fn); },
      async emit(event) { await events.get(id + ':' + event)?.(); }
    });
    return nodes.get(id);
  };
  const document = {
    documentElement: { lang: 'ja' }, body: { appendChild() {} },
    getElementById: get, querySelectorAll() { return []; },
    addEventListener(event, fn) {
      if (!events.has('document:' + event)) events.set('document:' + event, []);
      events.get('document:' + event).push(fn);
    },
    createElement(tag) {
      return {
        style: {}, remove() {},
        click() { if (tag === 'a') downloads.push({ name: this.download, blob: lastBlob }); }
      };
    }
  };
  const localStorage = {
    getItem(k) { return storage.has(k) ? storage.get(k) : null; },
    setItem(k, v) { storage.set(k, v); }
  };
  class BlobStub { constructor(parts, options) { this.parts = parts; this.type = options.type; lastBlob = this; } }
  const URL = { createObjectURL() { return 'blob:download'; }, revokeObjectURL() {} };
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, localStorage, navigator: { language: 'ja' }, window,
    Blob: BlobStub, URL, Date,
    setTimeout() { return 1; }, clearTimeout() {},
    setInterval() { intervalCount++; return intervalCount; }, clearInterval() {}
  });
  for (const fn of events.get('document:DOMContentLoaded') || []) fn();
  return { get, downloads, storage, intervals: () => intervalCount };
}

function parseCsv(s) {
  const rows = [], row = [];
  let value = '', quoted = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { value += '"'; i++; }
      else if (ch === '"') quoted = false;
      else value += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(value); value = ''; }
    else if (ch === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row.splice(0));
      value = '';
    } else value += ch;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

test('commas, double quotes and embedded newlines produce exactly three CSV columns', async () => {
  const h = harness();
  h.get('playerName').value = 'Team "A", East\nDivision';
  h.get('scoreValue').value = '42.5';
  await h.get('btnAdd').emit('click');
  await h.get('btnExport').emit('click');
  assert.equal(h.downloads.length, 1);
  assert.equal(h.downloads[0].name, 'mini-game-scores.csv');
  assert.equal(h.downloads[0].blob.type, 'text/csv;charset=utf-8');
  const csv = h.downloads[0].blob.parts.join('');
  assert.ok(csv.startsWith('\uFEFFname,score,time\r\n'));
  const rows = parseCsv(csv.slice(1));
  assert.equal(rows.length, 2);
  assert.equal(rows[1].length, 3);
  assert.equal(rows[1][0], 'Team "A", East\nDivision');
  assert.equal(rows[1][1], '42.5');
  assert.ok(rows[1][2].length > 5);
});

test('formula-like names are neutralized and malformed legacy score values export as numeric zero', async () => {
  const h = harness([{ name: ' =HYPERLINK("https://evil.invalid", "click")', score: '=2+2', time: '12/31/2026, 10:03' }]);
  await h.get('btnExport').emit('click');
  const rows = parseCsv(h.downloads[0].blob.parts.join('').slice(1));
  assert.equal(rows[1].length, 3);
  assert.equal(rows[1][0], "' =HYPERLINK(\"https://evil.invalid\", \"click\")");
  assert.equal(rows[1][1], '0');
  assert.equal(rows[1][2], '12/31/2026, 10:03');
});

test('empty history creates no file, reset timer leaves scores intact and no duplicate start intervals', async () => {
  const h = harness();
  await h.get('btnExport').emit('click');
  assert.equal(h.downloads.length, 0);
  h.get('playerName').value = 'A';
  h.get('scoreValue').value = '1';
  await h.get('btnAdd').emit('click');
  await h.get('btnStart').emit('click');
  await h.get('btnStart').emit('click');
  assert.equal(h.intervals(), 1);
  await h.get('btnReset').emit('click');
  assert.equal(h.get('timerDisplay').textContent, '00:00');
  await h.get('btnExport').emit('click');
  assert.equal(h.downloads.length, 1);
  assert.match(h.downloads[0].blob.parts.join(''), /"A",1/);
});
