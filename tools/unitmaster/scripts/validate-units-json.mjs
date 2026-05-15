import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../data/units.json');
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Failed to read or parse JSON: ${error.message}`);
    return null;
  }
}

const data = readJson(dataPath);

if (!data) {
  reportAndExit();
}

if (!isNonEmptyString(data.version)) fail('version is required.');
if (data.status !== 'seed' && data.status !== 'runtime') fail('status must be either "seed" or "runtime".');
if (!isBoolean(data.runtimeSource)) fail('runtimeSource must be a boolean.');
if (!Array.isArray(data.categories) || data.categories.length === 0) fail('categories must be a non-empty array.');
if (!Array.isArray(data.units) || data.units.length === 0) fail('units must be a non-empty array.');

const categoryIds = new Set();
const categoryBaseUnits = new Map();

for (const category of data.categories || []) {
  if (!isNonEmptyString(category.id)) fail('category.id is required.');
  if (!isNonEmptyString(category.nameJa)) fail(`category ${category.id || '(unknown)'} nameJa is required.`);
  if (!isNonEmptyString(category.nameEn)) fail(`category ${category.id || '(unknown)'} nameEn is required.`);
  if (categoryIds.has(category.id)) fail(`duplicate category id: ${category.id}`);
  categoryIds.add(category.id);
  categoryBaseUnits.set(category.id, category.baseUnit ?? null);
}

const seenUnitKeys = new Set();
const requiredUnitFields = ['category', 'key', 'labelJa', 'labelEn', 'meaningJa', 'usageJa', 'cautionJa', 'traditional', 'priority'];
const forbiddenKeys = new Set(['tsubo_length']);
const knownTemperatureUnits = new Set(['c', 'f', 'k']);

for (const unit of data.units || []) {
  for (const field of requiredUnitFields) {
    if (!(field in unit)) fail(`unit ${unit.key || '(unknown)'} is missing required field: ${field}`);
  }

  if (!isNonEmptyString(unit.category)) fail(`unit ${unit.key || '(unknown)'} category is required.`);
  if (!categoryIds.has(unit.category)) fail(`unit ${unit.key || '(unknown)'} has unknown category: ${unit.category}`);

  if (!isNonEmptyString(unit.key)) fail('unit.key is required.');
  if (forbiddenKeys.has(unit.key)) fail(`forbidden legacy unit key remains: ${unit.key}`);

  const scopedKey = `${unit.category}:${unit.key}`;
  if (seenUnitKeys.has(scopedKey)) fail(`duplicate unit key in category: ${scopedKey}`);
  seenUnitKeys.add(scopedKey);

  if (!isNonEmptyString(unit.labelJa)) fail(`unit ${scopedKey} labelJa is required.`);
  if (!isNonEmptyString(unit.labelEn)) fail(`unit ${scopedKey} labelEn is required.`);
  if (!isNonEmptyString(unit.meaningJa)) fail(`unit ${scopedKey} meaningJa is required.`);
  if (!Array.isArray(unit.usageJa) || unit.usageJa.length === 0) fail(`unit ${scopedKey} usageJa must be a non-empty array.`);
  if (!isNonEmptyString(unit.cautionJa)) fail(`unit ${scopedKey} cautionJa is required.`);
  if (!isBoolean(unit.traditional)) fail(`unit ${scopedKey} traditional must be boolean.`);
  if (!isBoolean(unit.priority)) fail(`unit ${scopedKey} priority must be boolean.`);

  if (unit.category === 'temp') {
    if (unit.conversionType !== 'temperature') fail(`temperature unit ${scopedKey} must have conversionType: "temperature".`);
    if (!knownTemperatureUnits.has(unit.key)) warn(`temperature unit ${scopedKey} is not one of c/f/k.`);
  } else {
    if (!isNumber(unit.factor)) fail(`unit ${scopedKey} factor must be a finite number.`);
    if (!isNonEmptyString(unit.baseUnit)) fail(`unit ${scopedKey} baseUnit is required.`);
    const categoryBase = categoryBaseUnits.get(unit.category);
    if (categoryBase && unit.baseUnit !== categoryBase) warn(`unit ${scopedKey} baseUnit (${unit.baseUnit}) differs from category baseUnit (${categoryBase}).`);
  }
}

const requiredRuntimeKeys = [
  'length:mm', 'length:cm', 'length:m', 'length:km', 'length:inch', 'length:ft', 'length:yard', 'length:mile',
  'length:shaku', 'length:sun', 'length:bu_length', 'length:ken', 'length:ri', 'length:furlong', 'length:chain',
  'length:league', 'length:angstrom', 'length:micrometer', 'length:parsec', 'length:lightyear',
  'weight:g', 'weight:kg', 'weight:lb', 'weight:oz', 'weight:monme', 'weight:kin', 'weight:kan', 'weight:dram', 'weight:grain',
  'temp:c', 'temp:f', 'temp:k',
  'volume:ml', 'volume:l', 'volume:cup', 'volume:gou', 'volume:shou', 'volume:to',
  'area:mm2', 'area:cm2', 'area:m2', 'area:km2', 'area:tsubo_area', 'area:tan', 'area:se', 'area:cho',
  'speed:m/s', 'speed:km/h', 'speed:mph', 'speed:knot', 'speed:league_per_hour',
  'pressure:pa', 'pressure:hpa', 'pressure:bar', 'pressure:atm', 'pressure:torr', 'pressure:psi'
];

for (const key of requiredRuntimeKeys) {
  if (!seenUnitKeys.has(key)) fail(`required runtime unit missing from units.json: ${key}`);
}

reportAndExit();

function reportAndExit() {
  if (warnings.length) {
    console.warn('UnitMaster units.json warnings:');
    for (const message of warnings) console.warn(`- ${message}`);
  }

  if (errors.length) {
    console.error('UnitMaster units.json validation failed:');
    for (const message of errors) console.error(`- ${message}`);
    process.exit(1);
  }

  console.log(`UnitMaster units.json validation passed. ${data.units.length} units checked.`);
}
