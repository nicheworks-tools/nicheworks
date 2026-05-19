#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const dictPath = path.join(baseDir, 'dict.json');
const notesPath = path.join(baseDir, 'shape-notes.json');

const required = [
  'old','modern','radicalJa','radicalEn','structureJa','structureEn','differenceJa','differenceEn','noteJa','noteEn'
];

function fail(msg){
  console.error(`❌ ${msg}`);
  process.exit(1);
}

let dict;
let notes;
try { dict = JSON.parse(fs.readFileSync(dictPath, 'utf8')); }
catch (e) { fail(`Failed to parse dict.json: ${e.message}`); }
try { notes = JSON.parse(fs.readFileSync(notesPath, 'utf8')); }
catch (e) { fail(`Failed to parse shape-notes.json: ${e.message}`); }

if (!notes || typeof notes !== 'object' || !notes.entries || typeof notes.entries !== 'object') {
  fail('shape-notes.json must have an entries object.');
}

const map = dict.old_to_new || {};
const entries = notes.entries;
const errors = [];

for (const [key, entry] of Object.entries(entries)) {
  if (!(key in map)) errors.push(`${key}: missing in dict.old_to_new`);
  if (!entry || typeof entry !== 'object') { errors.push(`${key}: entry must be an object`); continue; }
  if (entry.old !== key) errors.push(`${key}: old must match key`);
  if (map[key] !== entry.modern) errors.push(`${key}: modern mismatch (expected ${map[key]}, got ${entry.modern})`);
  for (const field of required) {
    if (!(field in entry) || typeof entry[field] !== 'string' || !entry[field].trim()) {
      errors.push(`${key}: invalid or missing ${field}`);
    }
  }
  if ('tags' in entry && !Array.isArray(entry.tags)) errors.push(`${key}: tags must be an array when present`);
}

if (errors.length) {
  console.error('❌ Validation failed:');
  errors.forEach(err => console.error(`- ${err}`));
  process.exit(1);
}

console.log(`✅ shape-notes validation passed (${Object.keys(entries).length} entries)`);
