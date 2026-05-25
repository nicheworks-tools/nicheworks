#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const base = __dirname;
const notes = JSON.parse(fs.readFileSync(path.join(base, 'compatibility-notes.json'), 'utf8'));
const dict = JSON.parse(fs.readFileSync(path.join(base, 'dict.json'), 'utf8'));

if (!notes || typeof notes !== 'object' || !notes.entries || typeof notes.entries !== 'object') {
  throw new Error('compatibility-notes.json: entries object is required');
}

const required = [
  'old','modern','riskLevel','riskTypes','summaryJa','summaryEn','copyNoteJa','copyNoteEn','technicalJa','technicalEn','recommendedCheckJa','recommendedCheckEn'
];
const validRisk = new Set(['low','medium','high']);
const mapping = dict.old_to_new || {};

for (const [key, entry] of Object.entries(notes.entries)) {
  if (!(key in mapping)) throw new Error(`Unknown key in dict.old_to_new: ${key}`);
  for (const field of required) {
    if (!(field in entry)) throw new Error(`Missing field ${field} for ${key}`);
  }
  if (entry.old !== key) throw new Error(`old mismatch for ${key}`);
  if (entry.modern !== mapping[key]) throw new Error(`modern mismatch for ${key}: expected ${mapping[key]}, got ${entry.modern}`);
  if (!validRisk.has(entry.riskLevel)) throw new Error(`invalid riskLevel for ${key}: ${entry.riskLevel}`);
  if (!Array.isArray(entry.riskTypes)) throw new Error(`riskTypes must be array for ${key}`);
}

console.log(`OK: compatibility-notes entries=${Object.keys(notes.entries).length}`);
