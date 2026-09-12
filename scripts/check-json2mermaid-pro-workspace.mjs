import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createProWorkspace } from '../tools/json2mermaid/pro-workspace.mjs';

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

const converterCalls = [];
const converterApi = {
  version: 1,
  convert(jsonText, options, lang) {
    converterCalls.push({ jsonText, options, lang });
    const parsed = JSON.parse(jsonText);
    return {
      code: `flowchart ${options.direction || 'TD'}\n  root["${Object.keys(parsed)[0]}"]`,
      warnings: [],
      stats: { nodeCount: 1, edgeCount: 0, maxDepth: 0, omittedCount: 0, depthLimitHit: false }
    };
  }
};

const initializeCalls = [];
const renderCalls = [];
const mermaidApi = {
  initialize(config) {
    initializeCalls.push(config);
  },
  async render(id, source) {
    renderCalls.push({ id, source });
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"></svg>' };
  }
};

const workspace = createProWorkspace({
  converterApi,
  mermaidApi,
  storage: new MemoryStorage(),
  idPrefix: 'workspace test'
});

workspace.presets.save({
  id: 'dark-docs',
  name: 'Dark docs',
  config: {
    theme: 'dark',
    startOnLoad: true,
    securityLevel: 'loose'
  }
});

const batch = await workspace.runBatch([
  { id: 'one', name: 'One', jsonText: '{"alpha":1}' },
  { id: 'two', name: 'Two', jsonText: '{"beta":2}' }
], {
  options: { direction: 'LR', leafMode: 'inline', arrayMode: 'summarize' },
  lang: 'en'
});

assert.equal(converterCalls.length, 2);
assert.equal(batch.length, 2);
assert.equal(batch[0].status, 'ok');
assert.equal(batch[0].code, 'flowchart LR\n  root["alpha"]');
for (const record of batch) {
  assert.equal(Object.prototype.hasOwnProperty.call(record, 'jsonText'), false);
}

const rendered = await workspace.renderBatchResult(batch[0], { presetId: 'dark-docs' });
assert.match(rendered.svg, /<svg\b/);
assert.equal(initializeCalls.length, 1);
assert.equal(initializeCalls[0].theme, 'dark');
assert.equal(initializeCalls[0].startOnLoad, false);
assert.equal(initializeCalls[0].securityLevel, 'strict');
assert.equal(renderCalls.length, 1);
assert.match(renderCalls[0].id, /^workspace-test-\d+$/);
assert.equal(renderCalls[0].source, batch[0].code);

const svgBlob = await workspace.exportBatchResultSvg(batch[0], { presetId: 'dark-docs' });
assert.match(svgBlob.type, /^image\/svg\+xml/);

const revoked = [];
const pngBlob = await workspace.exportBatchResultPng(batch[0], {
  presetId: 'dark-docs',
  pngOptions: {
    urlApi: {
      createObjectURL(blob) {
        assert.match(blob.type, /^image\/svg\+xml/);
        return 'blob:workspace-test';
      },
      revokeObjectURL(url) {
        revoked.push(url);
      }
    },
    imageFactory() {
      const image = { naturalWidth: 120, naturalHeight: 60, onload: null, onerror: null };
      Object.defineProperty(image, 'src', {
        set(value) {
          assert.equal(value, 'blob:workspace-test');
          queueMicrotask(() => image.onload());
        }
      });
      return image;
    },
    canvasFactory() {
      return {
        width: 0,
        height: 0,
        getContext(kind) {
          assert.equal(kind, '2d');
          return { drawImage() {} };
        },
        toBlob(callback, type) {
          assert.equal(type, 'image/png');
          callback(new Blob(['png'], { type: 'image/png' }));
        }
      };
    }
  }
});
assert.equal(pngBlob.type, 'image/png');
assert.deepEqual(revoked, ['blob:workspace-test']);

await assert.rejects(
  workspace.renderBatchResult({ status: 'error', error: 'bad' }),
  /Only successful batch results/
);
await assert.rejects(
  workspace.renderBatchResult(batch[0], { presetId: 'missing' }),
  /Unknown style preset/
);

const workspaceSource = fs.readFileSync(new URL('../tools/json2mermaid/pro-workspace.mjs', import.meta.url), 'utf8');
const publicHtml = fs.readFileSync(new URL('../tools/json2mermaid/index.html', import.meta.url), 'utf8');
for (const forbidden of ['JSON.parse(', 'flowchart ', 'safeMermaidLabel', 'const walk =', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'sendBeacon(', 'http://', 'https://']) {
  assert.equal(workspaceSource.includes(forbidden), false, `workspace must not duplicate conversion or add network transport: ${forbidden}`);
}
assert.equal(publicHtml.includes('pro-workspace.mjs'), false, 'public page must not load staged Pro workspace');
const publicScriptSources = [...publicHtml.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
assert.equal(
  publicScriptSources.some((src) => /(?:^|\/)mermaid(?:\.min)?\.js(?:$|[?#])/i.test(src)),
  false,
  'public page must not load a Mermaid runtime yet'
);

console.log('JSON2Mermaid Pro workspace staging contracts: OK');
