const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness(language = 'en') {
  const storage = new Map();
  const localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, val) { storage.set(key, String(val)); },
    removeItem(key) { storage.delete(key); }
  };
  const window = {};
  const src = fs.readFileSync(path.join(__dirname, 'app-fixed.js'), 'utf8');
  const startOfEventBindings = src.indexOf("  $('btn_save')?.addEventListener");
  assert.ok(startOfEventBindings > 0, 'active runtime binds UI actions');
  const script = src.slice(0, startOfEventBindings)
    + '\n  window.testHelpers={ normalizeLogs, validPct, validReset, logs, settings, saveSettings, advanceReset, resetAuto, next };\n})();\n';
  vm.runInNewContext(script, {
    window, localStorage, location: { pathname: language === 'en' ? '/tools/codex-usage-forecaster/en/' : '/tools/codex-usage-forecaster/' },
    document: { getElementById() { return null; } },
    Date, Math, Number, JSON
  });
  return { ...window.testHelpers, storage, localStorage };
}

test('imported invalid quota samples never become misleading percentages or timestamps', () => {
  const h = harness();
  const now = Date.now();
  const normalized = h.normalizeLogs([
    { id: 'valid', ts: now - 100000, uw: 85, u5h: 25, mode: 'normal' },
    { id: 'invalid-percent', ts: now - 200000, uw: 150, u5h: -50 },
    { id: 'bad-date', ts: -Infinity, uw: 20, u5h: 20 },
    { id: 'nan-date', ts: NaN, uw: 20, u5h: 20 },
    { id: 'missing-date', uw: 40, u5h: 60 },
    null, 0, 'bad'
  ]);
  assert.equal(normalized.length, 3);
  assert.ok(normalized.every(x => Number.isFinite(x.ts) && x.ts > 0));
  const bad = normalized.find(x => x.id === 'invalid-percent');
  assert.equal(bad.uw, null);
  assert.equal(bad.u5h, null);
  assert.equal(normalized.find(x => x.id === 'valid').uw, 85);
  assert.equal(h.validPct(Infinity), null);
  assert.equal(h.validPct(NaN), null);
});

test('invalid or corrupt manual reset settings fail closed without crashing local load', () => {
  const h = harness();
  h.storage.set('nw_cuf_settings_v1', '{"manualNextResetW":-1e309,"manualNextReset5h":1e309}');
  assert.equal(h.settings().manualNextResetW, null);
  assert.equal(h.settings().manualNextReset5h, null);
  h.storage.set('nw_cuf_settings_v1', 'null');
  assert.equal(h.settings().manualNextResetW, null);
  h.saveSettings({ manualNextResetW: 12345, manualNextReset5h: NaN });
  assert.equal(h.settings().manualNextResetW, 12345);
  assert.equal(h.settings().manualNextReset5h, null);
  h.saveSettings(null);
  assert.equal(h.settings().manualNextResetW, null);
});

test('reset forecasting advances a 1970-era anchor in constant time and ignores infinity', () => {
  const h = harness();
  const period = 5 * 60 * 60 * 1000, now = Date.now();
  const reset = h.advanceReset(1, period);
  assert.ok(reset > now && reset <= now + period);
  const manual = h.next(1, null, period);
  assert.equal(manual.src, 'manual');
  assert.ok(manual.ts > now && manual.ts <= now + period);
  assert.equal(h.advanceReset(-Infinity, period), null);
  assert.equal(h.advanceReset(Infinity, period), null);
  const auto = h.next(-Infinity, now + period * 2, period);
  assert.equal(auto.src, 'auto');
  assert.equal(auto.ts, now + period * 2);
  const projected = h.resetAuto([
    { ts: 1000, u5h: 10 }, { ts: 2000, u5h: 5 }
  ], 'u5h', period);
  assert.ok(projected > now && projected <= now + period);
});
