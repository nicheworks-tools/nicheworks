import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function runtimeObject(file, name) {
  const source = fs.readFileSync(file, 'utf8');
  const start = source.indexOf(`const ${name} = {`);
  assert.ok(start >= 0, `${file}: missing ${name}`);
  const end = source.indexOf('\n};', start);
  assert.ok(end > start, `${file}: unclosed ${name}`);
  const sandbox = {};
  vm.runInNewContext(source.slice(start, end + 3) + `\nglobalThis.runtimeValue = ${name};`, sandbox);
  return sandbox.runtimeValue;
}

const liteFile = 'tools/cosmetic-ingredient-checker-lite/app.js';
const scanFile = 'tools/inci-fastscan/js/web_ui.js';
const liteLabels = runtimeObject(liteFile, 'CATEGORY_LABELS');
const liteDescriptions = runtimeObject(liteFile, 'ROLE_DESCRIPTIONS');
const fastLabels = runtimeObject(scanFile, 'ROLE_LABELS');
const fastDescriptions = runtimeObject(scanFile, 'ROLE_DESCRIPTIONS');

const categories = ['buffer', 'conditioning', 'skin conditioning', 'hair conditioning', 'plant extract', 'bulking agent'];
for (const category of categories) {
  for (const lang of ['ja', 'en']) {
    assert.ok(liteLabels[category]?.[lang], `Lite missing ${category} ${lang} label`);
    assert.ok(liteDescriptions[category]?.[lang], `Lite missing ${category} ${lang} description`);
    assert.equal(liteLabels[category][lang], fastLabels[category]?.[lang], `label parity: ${category} ${lang}`);
    assert.equal(liteDescriptions[category][lang], fastDescriptions[category]?.[lang], `description parity: ${category} ${lang}`);
  }
}
assert.equal(liteLabels.general.en, 'Information incomplete', 'general must not become a supported public role');
console.log('COSMETICS_ROLE_PARITY=PASS: six bilingual role categories match in Lite and FastScan; general remains incomplete');
