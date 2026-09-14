import fs from 'node:fs';

const patterns = JSON.parse(fs.readFileSync(new URL('../data/patterns.json', import.meta.url), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(new URL('../data/source-verification.json', import.meta.url), 'utf8'));

const canonical = [
  'houndstooth','gingham','tartan','glen-check','argyle','chevron','polka-dot','moroccan-trellis',
  'seigaiha','asanoha','shippo','ichimatsu','kikko','karakusa','damask','arabesque','paisley',
  'leopard-print','ikat','kilim'
].sort();

const ids = patterns.map((p) => p.id).sort();
const ledgerIds = ledger.patterns.map((p) => p.pattern_id).sort();

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

if (JSON.stringify(ids) !== JSON.stringify(canonical)) fail('patterns.json canonical ID set differs from the fixed 20.');
if (JSON.stringify(ledgerIds) !== JSON.stringify(canonical)) fail('source-verification.json canonical ID set differs from the fixed 20.');
if (ledger.patterns.length !== 20) fail(`expected 20 verification records, found ${ledger.patterns.length}.`);

for (const record of ledger.patterns) {
  const pattern = patterns.find((p) => p.id === record.pattern_id);
  if (!pattern) {
    fail(`missing pattern data for ${record.pattern_id}`);
    continue;
  }
  if (!['verified', 'qualified'].includes(record.verification_state)) fail(`${record.pattern_id}: invalid verification_state`);
  if (!record.term_scope) fail(`${record.pattern_id}: missing term_scope`);
  if (!record.structure) fail(`${record.pattern_id}: missing structure`);
  if (!record.verified_names?.ja || !record.verified_names?.en) fail(`${record.pattern_id}: missing verified names`);
  if (record.verified_names.ja !== pattern.names.ja || record.verified_names.en !== pattern.names.en) {
    fail(`${record.pattern_id}: verified names do not match patterns.json`);
  }
  if (!record.color_guidance?.color_role || !Array.isArray(record.color_guidance?.primary) || !record.color_guidance.primary.length) {
    fail(`${record.pattern_id}: incomplete color guidance`);
  }
  if (!record.color_guidance?.primary_status || !record.color_guidance?.reason) fail(`${record.pattern_id}: missing primary palette qualification`);
  if (!Array.isArray(record.sources) || !record.sources.length) fail(`${record.pattern_id}: no evidence sources`);
  for (const source of record.sources || []) {
    if (!source.publisher || !/^https:\/\//.test(source.url || '') || !Array.isArray(source.supports) || !source.supports.length) {
      fail(`${record.pattern_id}: malformed source record`);
    }
  }
  if (record.verification_state === 'qualified' && !record.qualification) fail(`${record.pattern_id}: qualified record lacks qualification text`);
}

const qualified = ledger.patterns.filter((p) => p.verification_state === 'qualified').map((p) => p.pattern_id).sort();
const expectedQualified = ['ikat', 'kilim', 'moroccan-trellis'].sort();
if (JSON.stringify(qualified) !== JSON.stringify(expectedQualified)) {
  fail(`qualified set changed: ${qualified.join(', ')}`);
}

if (!process.exitCode) {
  console.log('OK: source verification ledger covers exactly 20 canonical patterns.');
  console.log(`verified=${20 - qualified.length} qualified=${qualified.length}`);
}
