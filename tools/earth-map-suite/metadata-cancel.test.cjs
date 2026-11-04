const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

function declaration(name) {
  const marker = '    const ' + name + ' = ';
  const start = source.indexOf(marker);
  assert.ok(start >= 0, name + ' must exist in the production runtime');
  const end = source.indexOf('\n    };', start);
  assert.ok(end > start, name + ' must have a completed body');
  return source.slice(start, end + '\n    };'.length);
}

function harness(mode) {
  const requests = [];
  const writes = [];
  const fetch = (url, options = {}) => new Promise(resolve => {
    requests.push({ url, options, resolve });
  });
  const declarations = mode === 'storm'
    ? [declaration('loadStormMetadataStatus'), declaration('resetStormReplay')]
    : mode === 'compare'
      ? [declaration('fetchComparePeriodMetadata'), declaration('loadCompareMetadataStatus'), declaration('resetCompareOutput')]
      : [declaration('loadCardMetadataStatus'), declaration('resetCardOutput')];
  const loadName = 'load' + mode[0].toUpperCase() + mode.slice(1) + 'MetadataStatus';
  const resetName = mode === 'storm' ? 'resetStormReplay' : mode === 'compare' ? 'resetCompareOutput' : 'resetCardOutput';
  const prefix = [
    'let stormState = {}; let stormMetadataRequestId = 1; let stormMetadataAbort = null;',
    'let compareState = {}; let compareMetadataRequestId = 1; let compareMetadataAbort = null;',
    'let cardState = {}; let cardMetadataRequestId = 1; let cardMetadataAbort = null;',
    'const stormMetadataPanel = null, stormMetadataBody = null, stormReplay = null, stormStatus = null;',
    'const compareOutput = null, compareMetrics = null, compareMetadataPanel = null, compareMetadataBody = null;',
    'const cardOutput = null, cardSummary = null, cardMetadataPanel = null, cardMetadataBody = null;',
    'const ERROR_CODES = { timeout: "timeout", upstream_fail: "upstream_fail" };',
    'const showStormMetadataLoading = () => {};',
    'const buildMetadataUrl = () => "/api/earth-map-suite/precipitation";',
    'const normalizeMetadataPayload = data => ({ ...data, reachable: true, status: "ok" });',
    'const renderStormMetadata = data => writes.push({ mode: "storm", data });',
    'const renderCompareMetadata = data => writes.push({ mode: "compare", data });',
    'const renderCardMetadata = data => writes.push({ mode: "card", data });',
    'const trackMetadataStatus = () => {};',
    'const trackCompareMetadataStatus = () => {};',
    'const trackCardMetadataStatus = () => {};',
  ];
  const suffix = [
    'return {run:' + loadName + ', reset:' + resetName + ',',
    'revive(){ ' + mode + 'MetadataRequestId += 1; ' + mode + 'State = {}; },',
    'currentState(){ return ' + mode + 'State; }};'
  ];
  const runtime = new Function('fetch', 'AbortController', 'writes',
    [...prefix, ...declarations, ...suffix].join('\n'));
  const handlers = runtime(fetch, AbortController, writes);
  const params = mode === 'compare'
    ? { bbox: '130,30,140,40', startA: '2026-11-01', endA: '2026-11-02', startB: '2026-11-02', endB: '2026-11-03', preset: 'low' }
    : { bbox: '130,30,140,40', bboxArea: 0.01, start: '2026-11-01', end: '2026-11-02', preset: 'low' };
  function answer(index, data = { data_type: 'real_observation_metadata', sampling_status: 'metadata_only' }) {
    assert.ok(requests[index], 'missing request ' + index);
    requests[index].resolve({ ok: true, status: 200, json: async () => data });
  }
  return { ...handlers, params, requests, writes, answer };
}

test('Storm reset aborts in-flight metadata and rejects late response', async () => {
  const h = harness('storm');
  const pending = h.run(h.params, 'en', 1);
  assert.equal(h.requests.length, 1);
  h.reset();
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.answer(0);
  await pending;
  assert.equal(h.writes.length, 0);
  assert.equal(h.currentState(), null);
});

test('Compare shares one signal between periods and reset invalidates both', async () => {
  const h = harness('compare');
  const pending = h.run(h.params, 'ja', 1);
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].options.signal, h.requests[1].options.signal);
  h.reset();
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.answer(0); h.answer(1);
  await pending;
  assert.equal(h.writes.length, 1, 'only initial loading may render');
  assert.equal(h.currentState(), null);
});

test('Card reset aborts the request and ignores outdated response', async () => {
  const h = harness('card');
  const pending = h.run(h.params, 'ja', 1);
  h.reset();
  assert.equal(h.requests[0].options.signal.aborted, true);
  h.answer(0);
  await pending;
  assert.equal(h.writes.length, 1);
  assert.equal(h.currentState(), null);
});

test('Old Storm response cannot replace a fresh request result', async () => {
  const h = harness('storm');
  const oldRequest = h.run(h.params, 'en', 1);
  h.reset();
  h.revive();
  const freshRequest = h.run(h.params, 'en', 3);
  assert.equal(h.requests.length, 2);
  h.answer(1, { id: 'new' });
  await freshRequest;
  h.answer(0, { id: 'old' });
  await oldRequest;
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].data.id, 'new');
});

test('Every mode has an actual abort path in production reset and invalid-input branches', () => {
  for (const mode of ['storm', 'compare', 'card']) {
    assert.match(declaration(mode === 'storm' ? 'resetStormReplay' : mode === 'compare' ? 'resetCompareOutput' : 'resetCardOutput'),
      new RegExp(mode + 'MetadataAbort\\?\\.abort\\(\\)'));
    assert.match(source, new RegExp(mode + 'MetadataRequestId \\+= 1;\\s*' + mode + 'MetadataAbort\\?\\.abort\\(\\);'));
  }
});
