import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');
const matcher = read('tools/inci-fastscan/js/core_matcher.js');
const enhancement = read('tools/inci-fastscan/enhancements.js');
const ui = read('tools/inci-fastscan/js/web_ui.js');
const sandbox = {};
vm.runInNewContext(matcher, sandbox, { filename: 'core_matcher.js' });

const verifiedItem = {
  en: '1,2-Hexanediol',
  jp: ['1,2-ヘキサンジオール'],
  category: 'solvent',
  note_short: 'Verified functional note with a reviewed source.',
  note_verified: true,
  note_sources: ['https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/']
};
const result = sandbox.found(verifiedItem, '1,2-Hexanediol');
assert.equal(result.found, true);
assert.equal(result.note_verified, true);
assert.equal(result.note_short, verifiedItem.note_short);
assert.equal(result.note_sources[0], verifiedItem.note_sources[0]);

const unverified = sandbox.found({ ...verifiedItem, note_verified: false }, '1,2-Hexanediol');
assert.equal(unverified.note_short, undefined, 'unverified legacy notes must never be exposed');
assert.equal(unverified.note_verified, false);
assert.equal(unverified.note_sources.length, 0);
const noEvidence = sandbox.found({ ...verifiedItem, note_sources: [] }, '1,2-Hexanediol');
assert.equal(noEvidence.note_short, undefined, 'missing source URL must fail closed');

const snippetStart = enhancement.indexOf('  function bilingualRoleEntry(');
const snippetEnd = enhancement.indexOf('  function syncIncompleteResultCopy(', snippetStart);
assert.ok(snippetStart > 0 && snippetEnd > snippetStart);
const env = {
  ROLE_LABELS: { solvent: { ja: '溶剤', en: 'Solvent' } },
  ROLE_DESCRIPTIONS: { solvent: { ja: '溶剤として使用', en: 'Used as a solvent.' } }
};
vm.runInNewContext(enhancement.slice(snippetStart, snippetEnd), env);
const visible = env.normalizePublicResults([result])[0];
assert.equal(visible.note_verified, true);
assert.equal(visible.note_short, verifiedItem.note_short);
assert.equal(visible.safety, undefined);
const hidden = env.normalizePublicResults([{ ...result, note_verified: false }])[0];
assert.equal(hidden.note_short, undefined);
assert.equal(hidden.note_sources.length, 0);
const incomplete = env.normalizePublicResults([{ ...result, category: 'general' }])[0];
assert.equal(incomplete.found, false, 'unsupported roles must remain incomplete');
assert.equal(incomplete.note_short, undefined);

const begin = ui.indexOf('function renderVerifiedNote(');
const end = ui.indexOf('function renderResults(', begin);
assert.ok(begin > 0 && end > begin);
const view = {
  escapeHtml: value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
};
vm.runInNewContext(ui.slice(begin, end), view);
const english = view.renderVerifiedNote(visible, 'en');
const japanese = view.renderVerifiedNote(visible, 'ja');
assert.match(english, /Source-backed ingredient note/);
assert.match(japanese, /出典付きの補足説明（英語）/);
assert.match(english, /rel="noopener noreferrer"/);
assert.match(english, /cosmileeurope\.eu/);
assert.equal(view.renderVerifiedNote(hidden, 'en'), '');
assert.equal(view.renderVerifiedNote({ ...visible, note_sources: ['javascript:alert(1)'] }, 'en'), '');
assert.ok(ui.includes('renderVerifiedNote(r, uiLang)'), 'verified note must be part of result cards');
const description = ui.slice(ui.indexOf('function ingredientDescription('), ui.indexOf('function renderVerifiedNote('));
assert.ok(!description.includes('note_short'), 'public main role explanation must never be replaced by an English-only note');

console.log('FASTSCAN_VERIFIED_NOTE_VISIBILITY=PASS: evidence-gated detail, unverified isolation, role-first and bilingual UI');
