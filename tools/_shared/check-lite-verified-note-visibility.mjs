import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/app.js', 'utf8');
const index = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/index.html', 'utf8');
const css = fs.readFileSync('tools/cosmetic-ingredient-checker-lite/enhancements.css', 'utf8');

const makeNode = tag => ({
  tag,
  children: [],
  appendChild(node) { this.children.push(node); },
  append(...nodes) { this.children.push(...nodes); }
});
const env = {
  currentLang: 'en',
  document: {
    createElement: makeNode,
    createTextNode: text => ({ tag: '#text', textContent: text })
  },
  hasBilingualRoleExplanation: () => true,
  roleDescription: () => 'Bilingual role-level explanation',
  localized: () => '',
  CATEGORY_LABELS: {},
  ROLE_DESCRIPTIONS: {}
};
const start = app.indexOf('function buildDescription(');
const end = app.indexOf('function roleLabel(', start);
assert.ok(start >= 0 && end > start, 'Lite helper region must exist');
vm.runInNewContext(app.slice(start, end), env, { filename: 'lite-role-note-helpers.js' });
const verified = {
  en: '1,2-Hexanediol',
  category: 'solvent',
  note_short: 'Reviewed ingredient-specific note',
  note_verified: true,
  note_sources: ['https://cosmileeurope.eu/inci/detail/5/1-2-hexanediol/']
};

assert.equal(env.buildDescription(verified, []), 'Bilingual role-level explanation',
  'reviewed notes must not replace primary bilingual role description');
assert.equal(env.verifiedIngredientNote(verified).note, verified.note_short);
assert.equal(env.verifiedIngredientNote({ ...verified, note_verified: false }), null,
  'raw legacy dictionary note must fail closed');
assert.equal(env.verifiedIngredientNote({ ...verified, note_sources: [] }), null);
assert.equal(env.verifiedIngredientNote({ ...verified, note_sources: ['javascript:alert(1)'] }), null);

const cell = makeNode('td');
env.appendVerifiedIngredientNote(cell, verified);
assert.equal(cell.children.length, 1);
const details = cell.children[0];
assert.equal(details.tag, 'details');
assert.equal(details.children[0].tag, 'summary');
assert.match(details.children[0].textContent, /Source-backed/);
assert.equal(details.children[1].textContent, verified.note_short);
assert.equal(details.children[2].children[0].href, verified.note_sources[0]);
assert.equal(details.children[2].children[0].rel, 'noopener noreferrer');
const previousLength = cell.children.length;
env.appendVerifiedIngredientNote(cell, { ...verified, note_verified: false });
assert.equal(cell.children.length, previousLength, 'unverified notes must not add details');

env.currentLang = 'ja';
const jpCell = makeNode('td');
env.appendVerifiedIngredientNote(jpCell, verified);
assert.match(jpCell.children[0].children[0].textContent, /出典付きの補足説明（英語）/);
assert.match(app, /if \(item\.statusKey === 'matched'\) appendVerifiedIngredientNote\(noteCell, item\.match\)/);
assert.ok(!app.slice(start, end).includes('innerHTML'), 'reviewed notes must use text nodes rather than HTML injection');
assert.match(index, /app\.js\?v=20261101-bulking-wave31/, 'reviewed role copy must use the released JS version');
assert.match(index, /enhancements\.css\?v=20261031-verified-note-1/);
assert.match(css, /\.lite-verified-note/);
console.log('LITE_VERIFIED_NOTE_VISIBILITY=PASS: role-first explanation, reviewed-only context, source links and bilingual labels');
