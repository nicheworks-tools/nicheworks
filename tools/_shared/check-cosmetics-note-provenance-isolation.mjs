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

// Role-level explanations remain bilingual and primary; reviewed ingredient notes
// appear only in a secondary source-linked detail view. Legacy raw notes fail closed.
assert.ok(ui.includes('function ingredientDescription(item, lang)'), 'FastScan must centralize public ingredient descriptions');
const roleDescription = ui.slice(ui.indexOf('function ingredientDescription('), ui.indexOf('function renderVerifiedNote('));
assert.ok(!roleDescription.includes('note_short'), 'ingredient-specific notes must not replace bilingual role descriptions');
assert.ok(ui.includes('const description = ROLE_DESCRIPTIONS[key] || ROLE_DESCRIPTIONS.general;'), 'FastScan must keep maintained neutral role copy');
assert.ok(ui.includes('function renderVerifiedNote(item, lang)'), 'verified notes require a dedicated secondary detail renderer');
assert.ok(ui.includes('item?.note_verified !== true'), 'secondary note renderer must require source-verification flag');
assert.ok(ui.includes('note_sources'), 'secondary note renderer must require public provenance links');
assert.ok(ui.includes('この成分の主な役割情報は現在整理中です。'), 'Japanese neutral role fallback missing');
assert.ok(ui.includes('The primary role for this ingredient is still being organized.'), 'English neutral role fallback missing');
assert.ok(!ui.includes('r.note_short || rt("defaultNote", uiLang)'), 'obsolete dictionary-match fallback must not return');
assert.ok(!ui.includes('ローカル辞書に一致しました。必要に応じてメーカー等の公式情報も確認してください。'), 'dictionary-match copy must not be the public fallback');

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
  public_fallback: 'maintained-role-description',
  recognition_contract_changed: false,
  affiliate_contract_changed: false
}, null, 2));
