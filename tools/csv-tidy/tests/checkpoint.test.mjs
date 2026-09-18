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
test('G3: strict decoding and sparse SJIS Japanese detection', async () => {
  const h = harness();
  assert.throws(() => h.decodeArrayBuffer(Buffer.from([0xff]), 'utf-8'), e => e.code === 'decoding_failed' && e.encoding === 'utf-8');
  assert.throws(() => h.decodeArrayBuffer(Buffer.from([0x81]), 'shift_jis'), e => e.code === 'decoding_failed' && e.encoding === 'shift_jis');
  const bytes = Buffer.concat([Buffer.from('a'.repeat(2000) + ','), Buffer.from([0x93,0x8c,0x8b,0x9e])]);
  assert.equal(h.guessEncoding(bytes), 'shift_jis');
  assert.ok(h.decodeArrayBuffer(bytes, h.guessEncoding(bytes)).endsWith('東京'));
  await h.load(bytes, 'auto');
  assert.equal(h.state.data.rows[0][1], '東京');
  assert.match(h.get('#loadHint').textContent, /inferred|guessed/i);
  assert.match(h.get('#loadHint').textContent, /verify/i);
});
test('G3: ambiguous valid encodings require selection; UTF-8 BOM is authoritative', async () => {
  const h = harness(), ambiguous = Buffer.from('c2a9', 'hex'); // UTF-8 © vs SJIS ﾂｩ
  assert.throws(() => h.guessEncoding(ambiguous), e => e.code === 'ambiguous_encoding');
  await h.load(ambiguous, 'auto');
  assert.equal(h.state.data.rows.length, 0);
  assert.equal(h.state.ui.inputError.code, 'ambiguous_encoding');
  assert.match(h.get('#errBox').textContent, /select|choose/i);
  await h.load(ambiguous, 'utf-8'); assert.deepEqual(plain(h.state.data.rows), [['©']]);
  await h.load(ambiguous, 'shift_jis'); assert.deepEqual(plain(h.state.data.rows), [['ﾂｩ']]);
  assert.equal(h.guessEncoding(Buffer.from('efbbbfc2a9', 'hex')), 'utf-8');
  assert.throws(() => h.guessEncoding(Buffer.from('efbbbf938c8b9e', 'hex')), e => e.code === 'decoding_failed' && e.encoding === 'utf-8');
  assert.equal(h.decodeArrayBuffer(Buffer.from('\uFFFD'), 'utf-8'), '\uFFFD', 'literal U+FFFD is valid text, not decoder substitution');
});
test('G3: unavailable Shift_JIS is distinct from invalid bytes', async () => {
  const h = harness(class { constructor(enc, options) { if (enc === 'shift_jis') throw new RangeError('unsupported'); return new TextDecoder(enc, options); } });
  assert.throws(() => h.decodeArrayBuffer(Buffer.from([0x93,0x8c]), 'shift_jis'), e => e.code === 'unsupported_shift_jis');
  await h.load(Buffer.from([0x93,0x8c]), 'auto');
  assert.equal(h.state.ui.inputError.code, 'unsupported_shift_jis');
  assert.equal(h.state.data.rows.length, 0);
  assert.match(h.get('#errBox').textContent, /UTF-8/);
  await h.load('name,value\n東京,001\n', 'auto');
  assert.deepEqual(plain(h.state.data.rows), [['name','value'],['東京','001']]);
  for (const enc of ['utf-8','shift_jis','auto']) {
    const invalid = harness(); await invalid.load(Buffer.from([0xff]), enc);
    assert.equal(invalid.state.data.rows.length, 0);
    assert.equal(invalid.state.ui.inputError.code, 'decoding_failed');
    invalid.downloadCSV(); assert.equal(invalid.blobs.length, 0);
  }
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
test('G6: reject ragged logical records without padding for either header mode', async () => {
  for (const header of [true, false]) for (const delimiter of [',', '\t', ';']) {
    for (const [last, actual] of [['x', 1], ['x'+delimiter+'y'+delimiter+'extra', 3], ['', 1]]) {
      const h = harness(); h.state.input.hasHeader = header;
      const bytes = Buffer.from('a'+delimiter+'b\n"quoted,comma\nsecond line"'+delimiter+'001\n'+last+'\n');
      const copy = Buffer.from(bytes); await h.load(bytes, 'utf-8', delimiter);
      assert.deepEqual(plain(h.state.ui.inputError), { code: 'inconsistent_fields', record: 3, expectedFields: 2, actualFields: actual });
      assert.deepEqual(plain(h.state.data.rows), []);
      assert.match(h.get('#errBox').textContent, /record 3/);
      h.downloadCSV(); assert.equal(h.blobs.length, 0);
      assert.deepEqual(bytes, copy);
    }
  }
  const h = harness(); await h.load(',b\nx\ny,z,extra\n'); // original failing fixture
  assert.deepEqual(plain(h.state.ui.inputError), { code: 'inconsistent_fields', record: 2, expectedFields: 2, actualFields: 1 });
});
test('G6: empty and duplicate headers remain independent through output and manual editing', async () => {
  for (const [headers, data] of [
    [['name','','age'], ['Alice','x','20']],
    [['','',''], ['A','B','C']],
    [['name','name',''], ['A','B','C']],
  ]) {
    const h = harness(), bytes = Buffer.from(headers.join(',')+'\n'+data.join(',')+'\n');
    const original = Buffer.from(bytes); await h.load(bytes);
    assert.deepEqual(plain(h.buildOutputPreview(false).headers), headers);
    assert.equal(new Set(h.state.data.cols.map(c => c.id)).size, 3);
    assert.deepEqual(plain(h.state.data.cols.map(c => c.srcIndex)), [0,1,2]);
    h.downloadCSV();
    assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [headers,data]);
    const emptyIndex = headers.indexOf('');
    h.state.data.cols[emptyIndex].name = 'renamed';
    h.state.data.cols.forEach((c,i) => { c.order = 2-i; });
    const renamed = headers.map((v,i) => i === emptyIndex ? 'renamed' : v).reverse();
    h.downloadCSV();
    assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [renamed, [...data].reverse()]);
    assert.deepEqual(bytes, original);
  }
});
test('G6: header OFF exports all data and correct-width empty records without labels', async () => {
  const h = harness(); h.state.input.hasHeader = false;
  await h.load('name,,age\nAlice,x,20\n,,');
  assert.deepEqual(plain(h.state.data.cols.map(c => c.name)), ['col_1','col_2','col_3']);
  h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['name','','age'],['Alice','x','20'],['','','']]);
});
test('G6: dedicated width-error gate blocks export until a valid reload', async () => {
  const h = harness(); await h.load('a,b\nx,y\n'); await h.load('a,b\nx\n');
  h.downloadCSV(); assert.equal(h.blobs.length, 0);
  h.get('#errBox').textContent = ''; // presentation cannot bypass rejection
  h.downloadCSV(); assert.equal(h.blobs.length, 0);
  await h.load('a,b\n001,東京\n'); h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['a','b'],['001','東京']]);
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
function scope(h, value) {
  h.get('#cleanScope').value = value;
  h.get('#cleanScope').dispatch('change');
}
async function selectedRoundTrip(h, expected) {
  const preview = h.buildOutputPreview(true);
  const full = h.buildOutputPreview(false);
  assert.deepEqual(plain(preview), plain(full));
  assert.deepEqual(plain(h.state.input.hasHeader ? [preview.headers, ...preview.rows] : preview.rows), expected);
  const before = h.blobs.length;
  h.downloadCSV();
  assert.equal(h.blobs.length, before + 1);
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), expected);
}
test('G8 resolved: scope control and trim selection, reversed, none and ALL', async () => {
  const h = harness(); h.bindUI(); await h.load('a,b\n  x  ,  y  \n');
  scope(h, 'selected');
  const [a,b] = h.state.data.cols;
  b.cleanApply = false;
  await selectedRoundTrip(h, [['a','b'],['x','  y  ']]);
  a.cleanApply = false; b.cleanApply = true;
  await selectedRoundTrip(h, [['a','b'],['  x  ','y']]);
  b.cleanApply = false;
  await selectedRoundTrip(h, [['a','b'],['  x  ','  y  ']]);
  scope(h, 'all');
  await selectedRoundTrip(h, [['a','b'],['x','y']]);
});
test('G8 resolved: individual space and width rules and combined cleaning', async () => {
  for (const [value, trim, normSpaces, enabled, direction, expected] of [
    [' x  \t y ',false,true,false,'zen2han',' x y '],
    [' ＡＢ１２ ',false,false,true,'zen2han',' AB12 '],
    [' AB12 ',false,false,true,'han2zen','　ＡＢ１２　'],
    ['  Ａ  Ｂ  ',true,true,true,'zen2han','A B'],
  ]) {
    const h = harness(); h.bindUI(); await h.load(`a,b\n${value},${value}\n`);
    scope(h,'selected'); h.state.data.cols[1].cleanApply = false;
    Object.assign(h.state.options, {trim,normSpaces});
    Object.assign(h.state.options.zenHan, {enabled,dir:direction,targetData:true,targetHeader:false});
    await selectedRoundTrip(h, [['a','b'],[expected,value]]);
  }
});
test('G8 resolved: duplicate and empty header selection follows entity through edits', async () => {
  for (const headers of ['same,same,drop', ',,drop']) {
    const h = harness(); h.bindUI(); await h.load(`${headers}\n  A  ,  B  ,  C  \n`);
    scope(h,'selected');
    const [a,b,c] = h.state.data.cols;
    a.cleanApply = false; b.cleanApply = true; c.cleanApply = false;
    await selectedRoundTrip(h, [headers.split(','),['  A  ','B','  C  ']]);
    b.order = 0; a.order = 1; c.excluded = true; b.name = ' Renamed ';
    await selectedRoundTrip(h, [['Renamed',a.name],['B','  A  ']]);
  }
});
test('G8 resolved: selected scope gates separate header and data width targets', async () => {
  for (const [targetHeader,targetData] of [[true,false],[false,true],[true,true]]) {
    const h = harness(); h.bindUI(); await h.load('Ａ,Ｂ\nＣ,Ｄ\n');
    scope(h,'selected'); h.state.data.cols[1].cleanApply = false;
    h.state.options.trim = false; h.state.options.normSpaces = false;
    Object.assign(h.state.options.zenHan, {enabled:true,dir:'zen2han',targetHeader,targetData});
    await selectedRoundTrip(h, [[targetHeader?'A':'Ａ','Ｂ'],[targetData?'C':'Ｃ','Ｄ']]);
  }
});
test('G8 resolved: header OFF positional selection preserves literal Japanese and quoted data', async () => {
  const h = harness(); h.bindUI(); h.state.input.hasHeader = false;
  const source = await h.load('  ００１  ,"  東京, ""引用""\n次  "\n');
  const original = Buffer.from(source);
  scope(h,'selected'); h.state.data.cols[1].cleanApply = false;
  h.state.options.normSpaces = true;
  await selectedRoundTrip(h, [['001','  東京, "引用"\n次  ']]);
  assert.deepEqual(source, original);
});
function blockedLoad(h) {
  const before = h.blobs.length;
  h.get('#errBox').textContent = '';
  h.get('#downloadBtn').disabled = false;
  h.downloadCSV();
  assert.equal(h.blobs.length, before);
  assert.deepEqual(plain(h.buildOutputPreview(false).rows), []);
}
test('G9 resolved: every replacement failure blocks export and preserves coherent accepted metadata', async () => {
  for (const [bytes, encoding, delimiter, code] of [
    ['a,b\n"broken,x','utf-8',',','unclosed_quote'],
    ['a,b\nx,b"c','utf-8',',','invalid_quote'],
    ['a,b\nx','utf-8',',','inconsistent_fields'],
    [Buffer.from([0xff]),'utf-8',',','decoding_failed'],
    [Buffer.from('c2a9','hex'),'auto',',','ambiguous_encoding'],
    ['a,b;c\n1,2;3','utf-8','auto','ambiguous_delimiter'],
    ['a,b','utf-8','|','invalid_delimiter'],
    ['','utf-8',',','empty_input'],
  ]) {
    const h = harness(); await h.load('old;value\nA;001','utf-8',';');
    const accepted = plain({data:h.state.data, filename:h.state.input.filename,
      encoding:h.state.input.encodingResolved, delimiter:h.state.input.delimiterResolved});
    h.state.input.encoding=encoding; h.state.input.delimiter=delimiter;
    const source=Buffer.from(bytes), original=Buffer.from(source);
    await h.handleFile({name:'failed.csv',bytes:source});
    assert.equal(h.state.load.status,'invalid');
    assert.equal(h.state.ui.inputError.code,code);
    assert.equal(h.state.input.filename,accepted.filename);
    assert.equal(h.state.input.encodingResolved,accepted.encoding);
    assert.equal(h.state.input.delimiterResolved,accepted.delimiter);
    for (const key of ['rawText','rows','cols']) assert.deepEqual(plain(h.state.data[key]),accepted.data[key]);
    assert.equal(h.get('#outName').value,'fixture.tidy.csv');
    blockedLoad(h); assert.equal(h.state.ui.inputError.code,code);
    assert.deepEqual(source,original);
  }
});
test('G9 resolved: repeated success failure recovery exports only each accepted document', async () => {
  const h=harness();
  for (const [name,value] of [['A.csv','001'],['B.csv','東京'],['C.csv','003']]) {
    h.state.input.encoding='utf-8'; h.state.input.delimiter=',';
    await h.handleFile({name,bytes:Buffer.from(`id,value\n${name},${value}\n`)});
    assert.equal(h.state.load.status,'valid'); assert.equal(h.state.ui.inputError,null);
    assert.equal(h.state.input.filename,name);
    await selectedRoundTrip(h,[['id','value'],[name,value]]);
    await h.load('a,b\n"bad'); blockedLoad(h);
  }
});
test('G9 resolved: FileReader error, abort and synchronous read failure invalidate output', async () => {
  for (const failure of ['error','abort','throw']) {
    const h=harness(); await h.load('a,b\nold,1');
    h.sandbox.FileReader=class { readAsArrayBuffer() {
      if(failure==='throw') throw new Error('read denied');
      if(failure==='abort') this.onabort(); else this.onerror();
    }};
    await h.handleFile({name:'unreadable.csv'});
    assert.equal(h.state.load.status,'invalid');
    assert.equal(h.state.ui.inputError.code,'file_read_failed'); blockedLoad(h);
  }
});
test('G9 resolved: pending loads, reset and out-of-order reads cannot revive stale output', async () => {
  const h=harness(); await h.load('a,b\nold,1');
  const readers=[];
  h.sandbox.FileReader=class { readAsArrayBuffer(file) { this.file=file; readers.push(this); }};
  const finish=(i,text)=>{ readers[i].result=new TextEncoder().encode(text).buffer; readers[i].onload(); };
  const first=h.handleFile({name:'slow.csv'}); blockedLoad(h);
  const second=h.handleFile({name:'new.csv'});
  finish(1,'a,b\nnew,002'); await second;
  finish(0,'a,b\nstale,999'); await first;
  assert.equal(h.state.input.filename,'new.csv');
  await selectedRoundTrip(h,[['a','b'],['new','002']]);
  const pending=h.handleFile({name:'cancelled.csv'});
  await h.handleFile(null); finish(2,'a,b\ncancelled,1'); await pending;
  assert.equal(h.state.load.status,'empty'); assert.equal(h.state.input.filename,'');
  assert.equal(h.state.ui.inputError,null); assert.equal(h.state.data.rows.length,0); blockedLoad(h);
  const recovery=h.handleFile({name:'after-reset.csv'}); finish(3,'a,b\nrecovered,003'); await recovery;
  assert.equal(h.state.ui.inputError,null);
  await selectedRoundTrip(h,[['a','b'],['recovered','003']]);
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

test('G3: UTF-8 byte fixtures preserve text or require explicit selection when ambiguous', async () => {
  for (const hex of ['612c620a3030312c780a', 'e5908de5898d2ce580a40ae69db1e4baac2c3030310a', 'efbbbfe5908de5898d2ce580a40ae69db1e4baac2c3030310a']) {
    const bytes = Buffer.from(hex, 'hex'), copy = Buffer.from(bytes);
    for (const enc of ['utf-8', 'auto']) {
      const h = harness(); await h.load(bytes, enc);
      if (enc === 'auto' && hex.startsWith('e5908d')) {
        // These exact bytes also strictly decode as SJIS 蜷榊燕,蛟､ / 譚ｱ莠ｬ,001.
        assert.equal(h.state.ui.inputError.code, 'ambiguous_encoding');
        assert.deepEqual(plain(h.state.data.rows), []);
        await h.load(bytes, 'utf-8');
      }
      assert.deepEqual(plain(h.state.data.rows), hex.startsWith('61') ? [['a','b'],['001','x']] : [['名前','値'],['東京','001']]);
      assert.deepEqual(bytes, copy);
    }
  }
});
test('G3: actual AUTO SJIS input independently round-trips as UTF-8', async () => {
  const h = harness(), bytes = Buffer.from('96bc914f2c926c0a938c8b9e2c3030310a', 'hex');
  const copy = Buffer.from(bytes); await h.load(bytes, 'auto'); h.downloadCSV();
  assert.deepEqual(reparse(Buffer.from(await h.blobs.at(-1).arrayBuffer()), ','), [['名前','値'],['東京','001']]);
  assert.deepEqual(bytes, copy);
});
