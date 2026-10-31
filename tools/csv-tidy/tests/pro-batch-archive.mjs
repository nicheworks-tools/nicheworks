import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { capturePreset } from '../pro/preset-core.mjs';
import { buildBatchArchive } from '../pro/batch-archive.mjs';
import { createZipStore, crc32 } from '../pro/zip-store.mjs';
import { runBatch } from '../pro/batch-core.mjs';
import { harness } from './checkpoint-harness.mjs';

const existing = harness();
const codec = {
  guessEncoding: existing.guessEncoding,
  decodeArrayBuffer: existing.decodeArrayBuffer,
  guessDelimiter: existing.guessDelimiter,
  parseCSV: existing.parseCSV,
  stringifyCSV: existing.stringifyCSV,
  convertZenHan: existing.convertZenHan
};
let count = 0;
const passed = name => { count++; console.log('PASS ' + name); };
const data = text => Buffer.from(text, 'utf8');
const file = (name, text) => ({ name, bytes: data(text) });
const preset = capturePreset({
  label: 'EC monthly mapping',
  source: { hasHeader: true, width: 3, sourceHeaders: ['商品コード', '名称', '備考'] },
  columns: [
    { srcIndex: 0, order: 1, name: 'sku', excluded: false, cleanApply: false },
    { srcIndex: 1, order: 0, name: 'title', excluded: false, cleanApply: true },
    { srcIndex: 2, order: 2, name: 'memo', excluded: true, cleanApply: false }
  ],
  input: { encoding: 'utf-8', delimiter: ',' },
  cleaning: {
    scope: 'selected', trim: true, normSpaces: true,
    zenHan: { enabled: true, dir: 'zen2han', targetHeader: true, targetData: true }
  },
  output: { delimiter: 'input', quotePolicy: 'auto', newline: 'crlf', bom: true }
});
const sourceA = '商品コード,名称,備考\nA01,　白　Ｔシャツ　,"note, one"\n';
const sourceB = '商品コード,名称,備考\nB02,ＮＥＷ,"quote ""in"" value"\n';
const changed = '商品コード,別の名称,備考\nC03,Item,foo\n';
const malformed = '商品コード,名称,備考\nD04,"broken,foo\n';

function inspectWithPython(archiveBytes) {
  const script = `
import csv,io,json,sys,zipfile
data=sys.stdin.buffer.read()
with zipfile.ZipFile(io.BytesIO(data),'r') as z:
  assert z.testzip() is None, "ZIP CRC error"
  names=z.namelist()
  assert all('/' not in n and '\\\\' not in n for n in names), "Unsafe path"
  report=json.loads(z.read('csv-tidy-report.json').decode('utf-8'))
  values={}
  for name in names:
    if name.endswith('.csv'):
      content=z.read(name).decode('utf-8-sig')
      values[name]=list(csv.reader(io.StringIO(content,newline=''),strict=True))
  print(json.dumps({'names':names,'report':report,'matrices':values},ensure_ascii=False))
`;
  const result = spawnSync('python3', ['-c', script], {
    input: Buffer.from(archiveBytes), encoding: 'utf8', maxBuffer: 1024 * 1024
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
assert.equal(crc32(data('123456789')), 0xcbf43926);
passed('ZIP CRC32 matches canonical vector');

const archive = await buildBatchArchive([
  file('ec.csv', sourceA),
  file('wrong.csv', changed),
  file('bad.csv', malformed),
  file('ec.csv', sourceB)
], preset, codec);
assert.equal(archive.name, 'csv-tidy-batch.zip');
assert.equal(archive.mimeType, 'application/zip');
assert.deepEqual([...archive.bytes.subarray(0, 4)], [0x50,0x4b,0x03,0x04]);
const checked = inspectWithPython(archive.bytes);
assert.deepEqual(checked.names, [
  '001-ec.tidy.csv', '004-ec.tidy.csv', 'csv-tidy-report.json'
]);
assert.deepEqual(checked.matrices['001-ec.tidy.csv'], [['title','sku'], ['白 Tシャツ','A01']]);
assert.deepEqual(checked.matrices['004-ec.tidy.csv'], [['title','sku'], ['NEW','B02']]);
assert.equal(checked.report.accepted, 2);
assert.equal(checked.report.rejected, 2);
assert.deepEqual(checked.report.files.map(x => x.code || ''), [
  '', 'source_header_mismatch', 'unclosed_quote', ''
]);
passed('actual ZIP independently extracted/reparsed in Python with valid-only contents and status report');

const manifest = JSON.stringify(checked.report);
assert.ok(!manifest.includes('note, one'));
assert.ok(!manifest.includes('quote in'));
assert.ok(!manifest.includes('白 Tシャツ'));
passed('report never contains source cell values');

const noValid = await buildBatchArchive([file('wrong.csv', changed)], preset, codec);
const noValidContents = inspectWithPython(noValid.bytes);
assert.deepEqual(noValidContents.names, ['csv-tidy-report.json']);
assert.equal(noValidContents.report.rejected, 1);
passed('all-invalid batch still yields report-only ZIP, not corrupt outputs');

const aborted = await buildBatchArchive([file('ec.csv', sourceA)], preset, codec,
  { signal: { aborted: true } });
const abortedContents = inspectWithPython(aborted.bytes);
assert.equal(abortedContents.report.cancelled, 1);
assert.equal(abortedContents.report.accepted, 0);
passed('cancelled batch produces report-only ZIP');

assert.throws(() => createZipStore([
  { name: '../escape.csv', bytes: data('secret') }
]), err => err.code === 'invalid_zip_filename');
assert.throws(() => createZipStore([
  { name: 'child/escape.csv', bytes: data('secret') }
]), err => err.code === 'invalid_zip_filename');
assert.throws(() => createZipStore([
  { name: 'same.csv', bytes: data('a') }, { name: 'same.csv', bytes: data('b') }
]), err => err.code === 'duplicate_zip_filename');
passed('ZIP writer rejects path traversal and duplicate entry overwrites');

assert.throws(() => createZipStore([
  { name: 'safe.csv', bytes: data('123456789') }
], { maxArchiveBytes: 32 }), err => err.code === 'zip_too_large');
passed('ZIP writer respects caller and global byte budget');

const emojiZip = createZipStore([{ name: '日本語✅.csv', bytes: data('x,y\n1,2\n') }]);
const python = spawnSync('python3', ['-c',
  'import io,sys,zipfile;z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()));assert z.namelist()==["日本語✅.csv"];assert z.testzip() is None'
], { input: Buffer.from(emojiZip), encoding: 'utf8' });
assert.equal(python.status, 0, python.stderr);
passed('ZIP UTF-8 filename flag supported by independent Python reader');

const deliberateLimit = await runBatch([file('ec.csv', sourceA)], preset, codec, {
  onOutput() {
    const error = new Error('never include this in a report');
    error.code = 'archive_budget_exceeded';
    throw error;
  }
});
assert.equal(deliberateLimit.files[0].code, 'archive_budget_exceeded');
assert.ok(!JSON.stringify(deliberateLimit).includes('never include this'));
passed('archive-cap failures expose only safe fixed code and no callback detail');

console.log('CSV Tidy Pro batch ZIP archive: ' + count + ' PASS / 0 FAIL');
