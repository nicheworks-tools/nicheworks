import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  JSON2MERMAID_PRO_ENGINE_VERSION,
  createPresetStore,
  createSvgBlob,
  renderWithAdapter,
  runBatch,
  svgToPngBlob
} from '../tools/json2mermaid/pro-engine.mjs';

assert.equal(JSON2MERMAID_PRO_ENGINE_VERSION, 1);

const batch = await runBatch([
  { id: 'one', name: 'One', jsonText: '{"a":1}' },
  { id: 'bad', name: 'Bad', jsonText: '{' },
  '{"b":2}'
], async (jsonText, meta) => {
  const parsed = JSON.parse(jsonText);
  return {
    code: `flowchart TD\n  root["${Object.keys(parsed)[0]}"]`,
    warnings: meta.id === 'one' ? ['test-warning'] : [],
    stats: { nodeCount: 1 }
  };
});

assert.equal(batch.length, 3);
assert.deepEqual(batch[0], {
  id: 'one',
  name: 'One',
  status: 'ok',
  code: 'flowchart TD\n  root["a"]',
  warnings: ['test-warning'],
  stats: { nodeCount: 1 }
});
assert.equal(batch[1].id, 'bad');
assert.equal(batch[1].status, 'error');
assert.equal(batch[2].id, 'item-3');
assert.equal(batch[2].status, 'ok');
for (const record of batch) {
  assert.equal(Object.prototype.hasOwnProperty.call(record, 'jsonText'), false);
}

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

const storage = new MemoryStorage();
const presets = createPresetStore(storage);
const saved = presets.save({
  id: 'dark-docs',
  name: 'Dark docs',
  config: {
    theme: 'dark',
    colors: { line: '#d1d5db' }
  }
});
assert.equal(saved.id, 'dark-docs');
assert.equal(presets.list().length, 1);
assert.equal(presets.get('dark-docs').config.theme, 'dark');
assert.throws(() => presets.save({
  id: 'unsafe',
  name: 'Unsafe',
  config: { jsonText: '{"secret":true}' }
}), /cannot contain jsonText/);
assert.throws(() => presets.save({
  id: 'unsafe-source',
  name: 'Unsafe source',
  config: { source: 'flowchart TD' }
}), /cannot contain source/);
assert.equal(presets.remove('dark-docs'), true);
assert.equal(presets.list().length, 0);

let rendererCalls = 0;
const rendered = await renderWithAdapter(
  'flowchart TD\n  a --> b',
  { config: { theme: 'neutral' } },
  async (code, config) => {
    rendererCalls += 1;
    assert.equal(code, 'flowchart TD\n  a --> b');
    assert.equal(config.theme, 'neutral');
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"></svg>';
  }
);
assert.equal(rendererCalls, 1);
assert.match(rendered.svg, /<svg\b/);

const svgBlob = createSvgBlob(rendered.svg);
assert.match(svgBlob.type, /^image\/svg\+xml/);
assert.equal(await svgBlob.text(), rendered.svg);

const revoked = [];
const fakeUrlApi = {
  createObjectURL(blob) {
    assert.match(blob.type, /^image\/svg\+xml/);
    return 'blob:json2mermaid-test';
  },
  revokeObjectURL(url) {
    revoked.push(url);
  }
};
const fakeImageFactory = () => {
  const image = { naturalWidth: 100, naturalHeight: 50, onload: null, onerror: null };
  Object.defineProperty(image, 'src', {
    set(value) {
      assert.equal(value, 'blob:json2mermaid-test');
      queueMicrotask(() => image.onload());
    }
  });
  return image;
};
const fakeCanvasFactory = () => {
  const context = {
    drawImage(image, x, y, width, height) {
      assert.equal(image.naturalWidth, 100);
      assert.deepEqual([x, y, width, height], [0, 0, 100, 50]);
    }
  };
  return {
    width: 0,
    height: 0,
    getContext(kind) {
      assert.equal(kind, '2d');
      return context;
    },
    toBlob(callback, type) {
      assert.equal(type, 'image/png');
      callback(new Blob(['png'], { type: 'image/png' }));
    }
  };
};

const pngBlob = await svgToPngBlob(rendered.svg, {
  urlApi: fakeUrlApi,
  imageFactory: fakeImageFactory,
  canvasFactory: fakeCanvasFactory
});
assert.equal(pngBlob.type, 'image/png');
assert.deepEqual(revoked, ['blob:json2mermaid-test']);

const engineSource = fs.readFileSync(new URL('../tools/json2mermaid/pro-engine.mjs', import.meta.url), 'utf8');
for (const forbidden of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'sendBeacon(', 'http://', 'https://']) {
  assert.equal(engineSource.includes(forbidden), false, `engine must not contain network transport: ${forbidden}`);
}

console.log('JSON2Mermaid Pro engine contracts: OK');
