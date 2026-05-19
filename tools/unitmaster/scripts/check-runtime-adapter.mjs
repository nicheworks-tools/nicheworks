import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const appPath = path.resolve(__dirname, '../app.js');
const dataPath = path.resolve(__dirname, '../data/units.json');
const adapterPath = path.resolve(__dirname, '../runtime-units-adapter.js');
const errors = [];

function fail(message) {
  errors.push(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractConstObject(source, constName) {
  const marker = `const ${constName} = `;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Cannot find ${marker}`);
  const objectStart = source.indexOf('{', start);
  if (objectStart === -1) throw new Error(`Cannot find object start for ${constName}`);

  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let i = objectStart; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) {
        inString = false;
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(objectStart, i + 1);
    }
  }

  throw new Error(`Cannot find object end for ${constName}`);
}

function extractConstArray(source, constName) {
  const marker = `const ${constName} = `;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Cannot find ${marker}`);
  const arrayStart = source.indexOf('[', start);
  if (arrayStart === -1) throw new Error(`Cannot find array start for ${constName}`);
  const arrayEnd = source.indexOf('];', arrayStart);
  if (arrayEnd === -1) throw new Error(`Cannot find array end for ${constName}`);
  return source.slice(arrayStart, arrayEnd + 1);
}

function evaluateExpression(expression) {
  const context = vm.createContext({});
  return vm.runInContext(`(${expression})`, context, { timeout: 1000 });
}

function runtimeKeys(runtimeUnits) {
  const keys = [];
  for (const [category, value] of Object.entries(runtimeUnits)) {
    if (Array.isArray(value)) {
      for (const unitKey of value) keys.push(`${category}:${unitKey}`);
    } else {
      for (const unitKey of Object.keys(value)) keys.push(`${category}:${unitKey}`);
    }
  }
  return keys.sort();
}

function compareArrays(name, expected, actual) {
  const expectedJson = JSON.stringify(expected);
  const actualJson = JSON.stringify(actual);
  if (expectedJson !== actualJson) {
    fail(`${name} mismatch. expected=${expectedJson} actual=${actualJson}`);
  }
}

function compareRuntimeUnits(appUnits, adaptedUnits) {
  compareArrays('runtime unit keys', runtimeKeys(appUnits), runtimeKeys(adaptedUnits));

  for (const [category, value] of Object.entries(appUnits)) {
    if (Array.isArray(value)) continue;
    for (const [unitKey, factor] of Object.entries(value)) {
      const adaptedFactor = adaptedUnits?.[category]?.[unitKey];
      if (adaptedFactor !== factor) {
        fail(`factor mismatch for ${category}:${unitKey}. expected=${factor} actual=${adaptedFactor}`);
      }
    }
  }
}

function compareUnitLabels(appLabels, adaptedLabels) {
  for (const lang of ['ja', 'en']) {
    const appLang = appLabels[lang] || {};
    const adaptedLang = adaptedLabels[lang] || {};
    for (const [category, labels] of Object.entries(appLang)) {
      for (const [unitKey, label] of Object.entries(labels)) {
        const adaptedLabel = adaptedLang?.[category]?.[unitKey];
        if (!adaptedLabel) fail(`missing adapted label for ${lang}:${category}:${unitKey}`);
        if (adaptedLabel !== label) fail(`label mismatch for ${lang}:${category}:${unitKey}. expected=${label} actual=${adaptedLabel}`);
      }
    }
  }
}

const appSource = readText(appPath);
const appUnits = evaluateExpression(extractConstObject(appSource, 'units'));
const appUnitLabels = evaluateExpression(extractConstObject(appSource, 'unitLabels'));
const appCategoryKeys = evaluateExpression(extractConstArray(appSource, 'categoryKeys'));
const unitsJson = JSON.parse(readText(dataPath));
const adapter = require(adapterPath);

if (typeof adapter.adaptUnitMasterData !== 'function') {
  fail('adapter.adaptUnitMasterData must be a function.');
} else {
  const adapted = adapter.adaptUnitMasterData(unitsJson);
  compareArrays('categoryKeys', appCategoryKeys, adapted.categoryKeys);
  compareRuntimeUnits(appUnits, adapted.units);
  compareUnitLabels(appUnitLabels, adapted.unitLabels);

  if (adapted.units?.length?.tsubo_length || adapted.unitLabels?.ja?.length?.tsubo_length || adapted.unitLabels?.en?.length?.tsubo_length) {
    fail('forbidden legacy key tsubo_length was generated by the adapter.');
  }
}

if (errors.length) {
  console.error('UnitMaster runtime adapter validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('UnitMaster runtime adapter validation passed.');
