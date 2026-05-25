#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const base = __dirname;
const dict = JSON.parse(fs.readFileSync(path.join(base, 'dict.json'), 'utf8'));
const stroke = JSON.parse(fs.readFileSync(path.join(base, 'stroke-counts.json'), 'utf8'));

const map = dict.old_to_new || {};
const entries = stroke.entries;
const errors = [];

if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
  errors.push('entries object is missing');
} else {
  for (const [key, value] of Object.entries(entries)) {
    if (!(key in map)) errors.push(`${key}: missing in dict.old_to_new`);
    if (!value || typeof value !== 'object') { errors.push(`${key}: invalid entry object`); continue; }
    if (value.old !== key) errors.push(`${key}: old must match key`);
    if (value.modern !== map[key]) errors.push(`${key}: modern mismatch (${value.modern} !== ${map[key]})`);
    if (!Number.isInteger(value.oldStrokes) || value.oldStrokes <= 0) errors.push(`${key}: oldStrokes must be positive integer`);
    if (!Number.isInteger(value.modernStrokes) || value.modernStrokes <= 0) errors.push(`${key}: modernStrokes must be positive integer`);
    if (value.difference !== value.oldStrokes - value.modernStrokes) errors.push(`${key}: difference mismatch`);
    if (!['high', 'medium', 'low'].includes(value.confidence)) errors.push(`${key}: confidence must be high/medium/low`);
    if (typeof value.noteJa !== 'string' || !value.noteJa.trim()) errors.push(`${key}: noteJa is required`);
    if (typeof value.noteEn !== 'string' || !value.noteEn.trim()) errors.push(`${key}: noteEn is required`);
  }
}

if (errors.length) {
  console.error('validate-stroke-counts: FAILED');
  errors.forEach(err => console.error(`- ${err}`));
  process.exit(1);
}

console.log(`validate-stroke-counts: OK (${Object.keys(entries).length} entries)`);
