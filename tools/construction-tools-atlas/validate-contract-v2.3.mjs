import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.join(here, rel), 'utf8');
const fail = (message) => {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
};
const ok = (message) => console.log(`OK: ${message}`);

const specText = read('SPEC.md');
const indexText = read('index.html');
const schema = JSON.parse(read('data/entry-contract-v2.3.schema.json'));
const example = JSON.parse(read('data/entry-contract-v2.3.example.json'));

const requiredSpecMarkers = [
  'Construction Tools Atlas v2.3',
  'ambiguous / descriptive search',
  'Visual Autocomplete',
  'Raster-first policy',
  'Japanese mode',
  'English mode',
  'Both mode',
  'Deep Link and Share',
  'Affiliate contract',
  '`app.runtime.js` is the active public-page runtime'
];

for (const marker of requiredSpecMarkers) {
  if (!specText.includes(marker)) fail(`SPEC.md missing contract marker: ${marker}`);
}
if (!process.exitCode) ok('SPEC.md contains v2.3 contract markers');

if (!indexText.includes('./app.runtime.js')) fail('index.html must load app.runtime.js');
if (indexText.includes('src="./app.js')) fail('index.html must not load legacy app.js as the public runtime');
if (!process.exitCode) ok('index.html keeps app.runtime.js as public runtime');

if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
  fail('entry schema must use JSON Schema draft 2020-12');
}
if (!schema?.properties?.images || !schema?.properties?.commerce || !schema?.properties?.quality) {
  fail('entry schema must define images, commerce and quality');
}
if (!process.exitCode) ok('entry schema structure is present');

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requireString = (value, label) => {
  if (typeof value !== 'string' || value.trim() === '') fail(`${label} must be a non-empty string`);
};
const requireArray = (value, label) => {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
};

if (!idPattern.test(example.id)) fail('example.id is not a canonical kebab-case ID');
requireString(example.type, 'example.type');
requireString(example?.names?.ja, 'example.names.ja');
requireString(example?.names?.en, 'example.names.en');
requireString(example?.summary?.ja, 'example.summary.ja');
requireString(example?.summary?.en, 'example.summary.en');
requireString(example?.description?.ja, 'example.description.ja');
requireString(example?.description?.en, 'example.description.en');

for (const key of ['similar', 'often_confused_with', 'used_with']) {
  requireArray(example?.relationships?.[key], `example.relationships.${key}`);
  for (const id of example?.relationships?.[key] || []) {
    if (!idPattern.test(id)) fail(`relationship ID is invalid: ${id}`);
  }
}

const imageStates = new Set(['none', 'pilot', 'reviewed', 'verified']);
const contentStates = new Set(['stub', 'expanded', 'reviewed', 'verified']);
const publishStates = new Set(['inline_only', 'ready']);
const affiliateIntents = new Set(['high', 'medium', 'none']);

if (!contentStates.has(example?.quality?.content_state)) fail('invalid quality.content_state');
if (!imageStates.has(example?.quality?.image_state)) fail('invalid quality.image_state');
if (!publishStates.has(example?.quality?.detail_publish_state)) fail('invalid quality.detail_publish_state');
if (!affiliateIntents.has(example?.commerce?.affiliate_intent)) fail('invalid commerce.affiliate_intent');
requireArray(example?.commerce?.offer_ids, 'example.commerce.offer_ids');

const primary = example?.images?.primary;
if (primary) {
  requireString(primary.alt_ja, 'example.images.primary.alt_ja');
  requireString(primary.alt_en, 'example.images.primary.alt_en');
  if (!/\.webp(?:$|\?)/.test(primary.display || '')) fail('primary display image must be WebP');
  if (!/\.webp(?:$|\?)/.test(primary.thumbnail || '')) fail('primary thumbnail image must be WebP');
  if (!new Set(['pilot', 'reviewed', 'verified']).has(primary.state)) fail('invalid primary image state');
  if (primary.subject_match !== true) fail('reviewed example primary image must have subject_match=true');
}

if (!process.exitCode) {
  ok('v2.3 example entry satisfies baseline contract checks');
  console.log('Construction Tools Atlas v2.3 contract validation passed.');
}
