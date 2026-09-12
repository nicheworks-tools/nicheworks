import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runBatchWithSharedConverter } from '../tools/json2mermaid/pro-shared-converter-integration.mjs';

const appSource = fs.readFileSync(new URL('../tools/json2mermaid/app.js', import.meta.url), 'utf8');
const integrationSource = fs.readFileSync(new URL('../tools/json2mermaid/pro-shared-converter-integration.mjs', import.meta.url), 'utf8');

assert.match(appSource, /window\.NWJSON2MermaidConverter\s*=\s*Object\.freeze/);
assert.match(appSource, /version:\s*1/);
assert.match(appSource, /maxInputBytes:\s*300\s*\*\s*1024/);
assert.match(appSource, /maxDepth:\s*12/);
assert.match(appSource, /maxArrayItems:\s*50/);
assert.match(appSource, /direction:\s*"TD"/);
assert.match(appSource, /leafMode:\s*"separate"/);
assert.match(appSource, /arrayMode:\s*"expand"/);
assert.match(appSource, /converter\.convert\(jsonText, options, currentLang\)/);
assert.equal((appSource.match(/const jsonToMermaid\s*=/g) || []).length, 1, 'JSON→Mermaid algorithm must exist once');

for (const forbidden of ['JSON.parse(', 'flowchart ', 'safeMermaidLabel', 'const walk =']) {
  assert.equal(integrationSource.includes(forbidden), false, `Pro integration must not duplicate converter logic: ${forbidden}`);
}

const calls = [];
const fakeSharedApi = {
  version: 1,
  convert(jsonText, options, lang) {
    calls.push({ jsonText, options, lang });
    const value = JSON.parse(jsonText);
    return {
      code: `flowchart ${options.direction || 'TD'}\n  root["${Object.keys(value)[0]}"]`,
      warnings: [],
      stats: { nodeCount: 1, edgeCount: 0, maxDepth: 0, omittedCount: 0, depthLimitHit: false }
    };
  }
};

const batch = await runBatchWithSharedConverter([
  { id: 'a', name: 'A', jsonText: '{"alpha":1}' },
  { id: 'b', name: 'B', jsonText: '{"beta":2}' }
], fakeSharedApi, {
  options: { direction: 'LR', leafMode: 'inline', arrayMode: 'summarize' },
  lang: 'en'
});

assert.equal(calls.length, 2);
assert.deepEqual(calls[0], {
  jsonText: '{"alpha":1}',
  options: { direction: 'LR', leafMode: 'inline', arrayMode: 'summarize' },
  lang: 'en'
});
assert.equal(batch[0].status, 'ok');
assert.equal(batch[0].code, 'flowchart LR\n  root["alpha"]');
assert.equal(batch[1].status, 'ok');
for (const record of batch) {
  assert.equal(Object.prototype.hasOwnProperty.call(record, 'jsonText'), false);
}

for (const [label, source] of [['app', appSource], ['integration', integrationSource]]) {
  for (const forbidden of ['XMLHttpRequest', 'WebSocket', 'sendBeacon(']) {
    assert.equal(source.includes(forbidden), false, `${label} must not add network transport: ${forbidden}`);
  }
}

console.log('JSON2Mermaid shared converter contracts: OK');
