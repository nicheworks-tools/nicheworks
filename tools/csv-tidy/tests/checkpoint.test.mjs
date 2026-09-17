import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { harness, plain, element, summaryHarness } from './checkpoint-harness.mjs';
const fixtures = JSON.parse(fs.readFileSync(new URL('./core-fixtures.json', import.meta.url)));
for (const f of fixtures) test(`parser fixture: ${f.name}`, () => {
  assert.deepEqual(plain(harness().parseCSV(f.text, f.delimiter)), f.expected);
});
test('UTF-8 BOM is removed by the actual decoder before parsing', async () => {
  const h = harness(); await h.load(Buffer.concat([Buffer.from([239,187,191]), Buffer.from('名前,値\n東京,001\n')]));
  assert.deepEqual(plain(h.state.data.rows), [['名前','値'],['東京','001']]);
});
test('Shift_JIS bytes decode Japanese correctly in this Node runtime (browser pending)', async () => {
  const h = harness(); // 名前,値\n東京,001\n encoded as Shift_JIS, not UTF-8 text with an SJIS label.
  const bytes = Buffer.from('96bc914f2c926c0a938c8b9e2c3030310a', 'hex');
  await h.load(bytes, 'shift_jis');
  assert.deepEqual(plain(h.state.data.rows), [['名前','値'],['東京','001']]);
  assert.equal(h.guessEncoding(bytes), 'shift_jis');
});
test('unclosed quotes are rejected; empty input parses to no records', () => {
  const h = harness();
  assert.throws(() => h.parseCSV('a,b\n"unclosed,x', ','), e => e.code === 'unclosed_quote');
  assert.deepEqual(plain(h.parseCSV('', ',')), []);
});
test('G1 resolved: quoted commas do not change the semicolon delimiter', async () => {
  const h = harness(), text = 'name;memo\nA;"one,two,three,four,five"\n';
  assert.equal(h.guessDelimiter(text), ';');
  await h.load(text, 'utf-8', 'auto');
  assert.deepEqual(plain(h.state.data.rows), [['name','memo'],['A','one,two,three,four,five']]);
});
test('G1: logical quoted records, escaped quotes and TAB detection', () => {
  const h = harness();
  for (const delimiter of [',', '\t', ';']) {
    const text = 'a'+delimiter+'b\n"one,two;three\tfour\nHe said ""hello"""'+delimiter+'001\n';
    assert.equal(h.guessDelimiter(text), delimiter);
  }
  assert.equal(h.guessDelimiter('"all,inside;one\tcell\nnext line"\n'), ',');
});
test('G1: ambiguous separators require selection, never a confident guess', async () => {
  const h = harness(), text = 'a,b;c\n1,2;3\n';
  assert.throws(() => h.guessDelimiter(text), e => e.code === 'ambiguous_delimiter' && e.candidates.length === 2);
  await h.load(text, 'utf-8', 'auto');
  assert.equal(h.state.data.rows.length, 0);
  assert.match(h.get('#errBox').textContent, /ambiguous_delimiter/);
  await h.load(text, 'utf-8', ';');
  assert.deepEqual(plain(h.state.data.rows), [['a,b','c'],['1,2','3']]);
});
test('G2 resolved: EOF terminator vs actual empty records and fields', async () => {
  const h = harness();
  for (const [text, expected] of [
    ['', []], ['a\n', [['a']]], ['a\n\n', [['a'],['']]],
    ['\n', [['']]], ['""', [['']]], ['a\n""', [['a'],['']]],
    ['a,b\n,', [['a','b'],['','']]], ['a,b\n,\n', [['a','b'],['','']]],
    ['a\r\n\r\nb\r\n', [['a'],[''],['b']]],
  ]) assert.deepEqual(plain(h.parseCSV(text, ',')), expected, JSON.stringify(text));
  await h.load('a,b\n,\nx,y\n,');
  assert.deepEqual(plain(h.state.data.rows), [['a','b'],['',''],['x','y'],['','']]);
  await h.load('a\n\nx\n\n');
  assert.deepEqual(plain(h.state.data.rows), [['a'],[''],['x'],['']]);
});
test('G3 KNOWN GAP: replacement decoding and sparse Japanese SJIS misclassification', () => {
  const h = harness();
  assert.equal(h.decodeArrayBuffer(Buffer.from([0xff]), 'utf-8'), '\uFFFD');
  const bytes = Buffer.concat([Buffer.from('a'.repeat(2000) + ','), Buffer.from([0x93,0x8c,0x8b,0x9e])]);
  assert.equal(h.guessEncoding(bytes), 'utf-8');
  assert.ok(h.decodeArrayBuffer(bytes, h.guessEncoding(bytes)).includes('\uFFFD'));
  assert.ok(h.decodeArrayBuffer(bytes, 'shift_jis').endsWith('東京'));
});
test('G4 KNOWN GAP: template announces rename but preview still uses Japanese names/order', async () => {
  const h = harness(); await h.load('金額,日付\n1200,2026-01-01\n');
  h.applyTemplate('accounting');
  assert.deepEqual(plain(h.state.data.cols.map(c => c.outName)), ['amount','date']);
  assert.deepEqual(plain(h.buildOutputPreview(false).headers), ['金額','日付']);
  assert.match(h.get('#tmplInfo').textContent, /rename:2, order:0/);
});
test('G5 KNOWN GAP: filtering column DOM hides an exclusion from summary/confirmation', () => {
  const h = summaryHarness(), keep = element(), drop = element();
  keep.querySelector('.col-name').value = 'keep';
  drop.querySelector('.col-name').value = 'drop'; drop.querySelector('.col-exclude').checked = true;
  h.set([keep, drop], 1); h.renderSummary();
  assert.deepEqual(plain(h.excludedNames()), ['drop']);
  assert.match(h.box.innerHTML, /Input<\/strong><span>2 columns/);
  h.set([keep], 1); h.renderSummary(); // same data, rendered list filtered to "keep"
  assert.deepEqual(plain(h.excludedNames()), []);
  assert.match(h.box.innerHTML, /Input<\/strong><span>1 columns/);
});
test('G6 KNOWN GAP: empty header renamed and ragged records silently padded on load', async () => {
  const h = harness(); await h.load(',b\nx\ny,z,extra\n');
  assert.deepEqual(plain(h.state.data.rows), [['','b',''],['x','',''],['y','z','extra']]);
  assert.deepEqual(plain(h.buildOutputPreview(false).headers), ['col_1','b','col_3']);
  assert.equal(h.get('#errBox').textContent, '');
});
test('duplicate headers remain separate positional columns', async () => {
  const h = harness(); await h.load('a,a\nx,y\n');
  assert.deepEqual(plain(h.buildOutputPreview(false).headers), ['a','a']);
  assert.deepEqual(plain(h.buildOutputPreview(false).rows), [['x','y']]);
});
test('G7 resolved: malformed quotes reject with logical record, field and offset', () => {
  const h = harness();
  for (const [text, code, record, field] of [
    ['a\nb"c"d\n','invalid_quote',2,1], ['a\n"b"c\n','invalid_quote',2,1],
    ['a,b\nx,"y" z','invalid_quote',2,2], ['a,b\nx,"unclosed','unclosed_quote',2,2],
    ['a,b\n"first\nsecond",ok\nx,b"c"','invalid_quote',3,2],
  ]) assert.throws(() => h.parseCSV(text, ','), e => e.code === code && e.record === record && e.field === field && Number.isInteger(e.offset));
  assert.throws(() => h.parseCSV('a,b', 'auto'), e => e.code === 'invalid_delimiter');
});
test('G8 KNOWN GAP: selected-column scope does not protect an unchecked column', async () => {
  const h = harness(); await h.load('a,b\n  x  ,  y  \n');
  h.state.options.cleanScope = 'selected'; h.state.data.cols[1].cleanApply = false;
  assert.deepEqual(plain(h.buildOutputPreview(false).rows), [['x','y']]);
});
test('G9 KNOWN GAP: failed replacement load retains previous exportable rows', async () => {
  const h = harness(); await h.load('a,b\nx,y\n'); await h.load('a,b\n"broken,x');
  assert.match(h.get('#errBox').textContent, /Failed to parse CSV/);
  assert.deepEqual(plain(h.state.data.rows), [['a','b'],['x','y']]);
});

// Independent oracle is Python's standard-library CSV reader; it does not call parseCSV.
function reparse(bytes, delimiter) {
  const result = spawnSync('python3', ['-c', 'import sys,csv,io,json; print(json.dumps(list(csv.reader(io.StringIO(sys.stdin.buffer.read().decode("utf-8-sig"), newline=""), delimiter=sys.argv[1], strict=True))))', delimiter], { input: bytes, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return JSON.parse(result.stdout);
}
test('combined transformations: preview and actual export Blob independently round-trip', async () => {
  const h = harness();
  const text = 'id,name,note,drop\n001,  Ａ  Ｂ  ,"Tokyo, Japan\nHe said ""hello""",remove\n';
  const source = await h.load(text), original = Buffer.from(source);
  const [id,name,note,drop] = h.state.data.cols;
  name.name = 'Person'; name.order = 0; note.order = 1; id.order = 2; drop.excluded = true;
  h.state.options.normSpaces = true;
  const expected = [['Person','note','id'],['A B','Tokyo, Japan\nHe said "hello"','001']];
  const preview = h.buildOutputPreview(true);
  assert.deepEqual(plain([preview.headers, ...preview.rows]), expected);
  for (const [mode, delimiter] of [['input',','],['comma',','],['tab','\t'],['semi',';']]) {
    for (const bom of [true,false]) for (const newline of ['crlf','lf']) {
      h.get('#outDelimiter').value = mode;
      h.state.options.output = { bom, newline };
      assert.doesNotThrow(() => h.downloadCSV());
      const bytes = Buffer.from(await h.blobs.at(-1).arrayBuffer());
      assert.equal(bytes.subarray(0,3).equals(Buffer.from([239,187,191])), bom);
      const decoded = bytes.toString('utf8').replace(/^\uFEFF/, '');
      const nl = newline === 'crlf' ? '\r\n' : '\n';
      const expectedText = ['Person'+delimiter+'note'+delimiter+'id', 'A B'+delimiter+'"Tokyo, Japan\nHe said ""hello"""'+delimiter+'001'].join(nl)+nl;
      assert.equal(decoded, expectedText);
      assert.deepEqual(reparse(bytes, delimiter), expected);
    }
  }
  assert.deepEqual(source, original);
});
test('header off, resolved TAB, always quote, and Japanese export round-trip', async () => {
  const h = harness(); h.state.input.hasHeader = false;
  await h.load('東京\t００１\n大阪\t００２\n', 'utf-8', 'auto');
  h.get('#quotePolicy').value = 'always'; h.downloadCSV();
  const bytes = Buffer.from(await h.blobs.at(-1).arrayBuffer());
  assert.equal(bytes.toString('utf8'), '\uFEFF"東京"\t"001"\r\n"大阪"\t"002"\r\n');
  assert.deepEqual(reparse(bytes, '\t'), [['東京','001'],['大阪','002']]);
});
test('all columns excluded cannot generate a zero-column file', async () => {
  const h = harness(); await h.load('a,b\nx,y\n'); h.state.data.cols.forEach(c => c.excluded = true);
  h.downloadCSV(); assert.equal(h.blobs.length, 0); assert.match(h.get('#errBox').textContent, /column/i);
});
test('export includes all records beyond preview limit and invalid output delimiter is rejected', async () => {
  const h = harness();
  const rows = Array.from({length: 23}, (_, i) => [String(i).padStart(3, '0'), '東京']);
  await h.load('id,city\n' + rows.map(r => r.join(',')).join('\n'));
  assert.equal(h.buildOutputPreview(true).rows.length, 20);
  h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['id','city'], ...rows]);
  h.get('#outDelimiter').value = 'invalid'; h.downloadCSV();
  assert.equal(h.blobs.length, 1);
  assert.match(h.get('#errBox').textContent, /INVALID_DELIMITER/);
});
test('half-width to full-width, header targeting, and disabled cleaning round-trip', async () => {
  const h = harness(); await h.load('code,note\n001,  A  B  \n');
  h.state.options.trim = false; h.state.options.zenHan.enabled = false;
  h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['code','note'],['001','  A  B  ']]);
  h.state.options.trim = true; h.state.options.normSpaces = true;
  h.state.options.zenHan = { enabled: true, dir: 'han2zen', targetHeader: false, targetData: true };
  h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['code','note'],['００１','Ａ　Ｂ']]);
  h.state.options.zenHan.targetHeader = true;
  h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['ｃｏｄｅ','ｎｏｔｅ'],['００１','Ａ　Ｂ']]);
});
test('actual Shift_JIS input transforms and exports to independent UTF-8 reparse', async () => {
  const h = harness(); await h.load(Buffer.from('96bc914f2c926c0a938c8b9e2c3030310a', 'hex'), 'shift_jis');
  h.state.data.cols[0].name = 'city'; h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['city','値'],['東京','001']]);
});

test('G1/G2/G7 corrected input round-trips through independent Python parser', async () => {
  for (const [text, delimiter, expected] of [
    ['name;memo\nA;"one,two,three\nHe said ""hello"""\n', 'auto', [['name','memo'],['A','one,two,three\nHe said "hello"']]],
    ['a,b\n,\nx,y\n,', ',', [['a','b'],['',''],['x','y'],['','']]],
    ['a\n\nx\n\n', ',', [['a'],[''],['x'],['']]],
  ]) {
    const h = harness(), bytes = await h.load(text, 'utf-8', delimiter), copy = Buffer.from(bytes);
    h.downloadCSV();
    assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), h.state.input.delimiterResolved), expected);
    assert.deepEqual(bytes, copy);
  }
});
