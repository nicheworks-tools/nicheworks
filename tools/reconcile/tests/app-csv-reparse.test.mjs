import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../app.mjs', import.meta.url), 'utf8');

const reparse = source.match(/async function reparseLoadedCsv\(side\) \{[\s\S]*?\n\}/)?.[0] || '';
assert.ok(reparse, 'reparseLoadedCsv must exist');
assert.match(reparse, /readCsvFile\(current\.sourceFile/);
assert.match(reparse, /sourceFile:\s*current\.sourceFile/);
assert.doesNotMatch(reparse, /sourceFile:\s*file\b/);

const loadCsv = source.match(/async function loadCsv\(side, file\) \{[\s\S]*?\n\}/)?.[0] || '';
assert.ok(loadCsv, 'loadCsv must exist');
assert.match(loadCsv, /sourceFile:\s*file/);

console.log('Reconcile CSV reparse source-file contract passed.');
