import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appPath = path.resolve(__dirname, '../app.js');
const jsonPath = path.resolve(__dirname, '../data/units.json');
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
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
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

function runtimeKeysFromAppUnits(appUnits) {
  const keys = [];
  for (const [category, value] of Object.entries(appUnits)) {
    if (Array.isArray(value)) {
      for (const unitKey of value) keys.push(`${category}:${unitKey}`);
    } else {
      for (const unitKey of Object.keys(value)) keys.push(`${category}:${unitKey}`);
    }
  }
  return keys.sort();
}

function keysFromUnitsJson(jsonUnits) {
  return jsonUnits.map((unit) => `${unit.category}:${unit.key}`).sort();
}

const appSource = readText(appPath);
const unitsJson = JSON.parse(readText(jsonPath));
const appUnits = evaluateExpression(extractConstObject(appSource, 'units'));
const appCategoryKeys = evaluateExpression(extractConstArray(appSource, 'categoryKeys'));

const appKeys = runtimeKeysFromAppUnits(appUnits);
const jsonKeys = keysFromUnitsJson(unitsJson.units || []);
const appSet = new Set(appKeys);
const jsonSet = new Set(jsonKeys);

for (const key of appKeys) {
  if (!jsonSet.has(key)) fail(`app.js runtime unit is missing from units.json: ${key}`);
}

for (const key of jsonKeys) {
  if (!appSet.has(key)) fail(`units.json unit is missing from app.js runtime units: ${key}`);
}

const jsonCategoryIds = new Set((unitsJson.categories || []).map((category) => category.id));
for (const category of appCategoryKeys) {
  if (!jsonCategoryIds.has(category)) fail(`app.js category is missing from units.json categories: ${category}`);
}

for (const category of jsonCategoryIds) {
  if (!appCategoryKeys.includes(category)) fail(`units.json category is missing from app.js categoryKeys: ${category}`);
}

if (appSet.has('length:tsubo_length') || jsonSet.has('length:tsubo_length')) {
  fail('forbidden legacy unit key remains: length:tsubo_length');
}

if (errors.length) {
  console.error('UnitMaster app.js / units.json sync check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`UnitMaster app.js / units.json sync check passed. ${appKeys.length} runtime units checked.`);
