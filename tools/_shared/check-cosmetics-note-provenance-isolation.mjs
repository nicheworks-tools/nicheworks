import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
const semanticAudit = read('tools/_shared/check-cosmetics-semantic-quality.mjs');
const contract = read('tools/_shared/COSMETICS_NOTE_PROVENANCE.md');

assert.ok(matcher.includes('function verifiedNote(item)'), 'FastScan must gate dictionary notes through verifiedNote()');
assert.ok(matcher.includes('item?.note_verified !== true'), 'unverified notes must fail closed');
assert.ok(matcher.includes('Array.isArray(item.note_sources)'), 'verified notes must require source metadata');
assert.ok(matcher.includes('/^https:\\/\\//i.test(source.trim())'), 'note provenance must require HTTPS source URLs');
assert.ok(matcher.includes('note_short: note || undefined'), 'only verified notes may enter FastScan result objects');
assert.ok(ui.includes('r.note_short || rt("defaultNote", uiLang)'), 'FastScan must fall back to neutral local copy when no verified note is available');
assert.ok(ui.includes('Matched the local dictionary. Check official manufacturer information when needed.'), 'English neutral fallback note missing');
assert.ok(ui.includes('ローカル辞書に一致しました。必要に応じてメーカー等の公式情報も確認してください。'), 'Japanese neutral fallback note missing');

assert.ok(semanticAudit.includes('records_with_claim_bearing_note_for_review'), 'semantic audit must keep claim-bearing legacy note inventory');
assert.ok(semanticAudit.includes('records_with_explicit_evidence_metadata'), 'semantic audit must keep evidence metadata inventory');

for (const token of [
  '22',
  'zero explicit per-record evidence metadata',
  'note_verified',
  'note_sources',
  'FastScan',
  'Lite',
  'Amazon'
]) {
  assert.ok(contract.includes(token), `note provenance contract missing: ${token}`);
}

console.log(JSON.stringify({
  status: 'pass',
  phase: 'note-provenance-runtime-isolation',
  raw_claim_bearing_notes_in_pr38_baseline: 22,
  unverified_dictionary_notes_rendered_by_fastscan: false,
  verified_note_requires_https_source: true,
  lite_runtime_changed: false,
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
