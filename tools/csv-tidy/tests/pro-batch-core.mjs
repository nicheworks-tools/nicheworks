import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { capturePreset } from '../pro/preset-core.mjs';
import { BATCH_LIMITS, convertOne, runBatch } from '../pro/batch-core.mjs';
import { harness } from './checkpoint-harness.mjs';

const free = harness();
const codec = {
  guessEncoding: free.guessEncoding,
  decodeArrayBuffer: free.decodeArrayBuffer,
  guessDelimiter: free.guessDelimiter,
  parseCSV: free.parseCSV,
  stringifyCSV: free.stringifyCSV,
  convertZenHan: free.convertZenHan
};
let passed = 0;
const success = text => { passed++; console.log('PASS ' + text); };
const makeFile = (name, text) => ({
  name, bytes: Buffer.isBuffer(text) ? text : Buffer.from(text, 'utf8')
});
const presetInput = () => ({
  label: 'Monthly CSV',
  source: { hasHeader: true, width: 5, sourceHeaders: ['', 'code', 'code', 'name', 'note'] },
  columns: [
    { srcIndex: 0, order: 3, name: '', excluded: false, cleanApply: false },
    { srcIndex: 1, order: 1, name: 'sku', excluded: false, cleanApply: false },
    { srcIndex: 2, order: 4, name: 'spare', excluded: true, cleanApply: true },
    { srcIndex: 3, order: 0, name: 'title', excluded: false, cleanApply: true },
    { srcIndex: 4, order: 2, name: 'memo', excluded: false, cleanApply: true }
  ],
  input: { encoding: 'utf-8', delimiter: ',' },
  cleaning: {
    scope: 'selected', trim: true, normSpaces: true,
    zenHan: { enabled: true, dir: 'zen2han', targetHeader: true, targetData: true }
  },
  output: { delimiter: 'input', quotePolicy: 'auto', newline: 'crlf', bom: true }
});
const preset = capturePreset(presetInput());
const sourceText = [
  ',code,code,name,note',
  'A,001,Spare,"　白　Ｔシャツ　","memo, one"',
  'B,002,Spare,"長い  名前","new' + '\n' + 'line"',
  'C,003,Spare,ＮＥＷ,"a ""quote"""'
].join('\n') + '\n';

function pythonRead(bytes) {
  const code = 'import csv,io,json,sys; text=sys.stdin.buffer.read().decode("utf-8-sig"); print(json.dumps(list(csv.reader(io.StringIO(text,newline=""), strict=True)),ensure_ascii=False))';
  const py = spawnSync('python3', ['-c', code], { input: Buffer.from(bytes), encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
  assert.equal(py.status, 0, py.stderr);
  return JSON.parse(py.stdout);
}

function check(err, code) {
  assert.equal(err && err.code, code, 'Expected error ' + code + ', got ' + String(err));
}
const capture = async (files, selection = preset, opts = {}) => {
  const delivered = [];
  const report = await runBatch(files, selection, codec, {
    ...opts,
    onOutput: async file => delivered.push({
      name: file.name, index: file.index, bytes: Buffer.from(file.bytes)
    })
  });
  return { report, delivered };
};

const originalBytes = Buffer.from(sourceText, 'utf8');
const transformed = await convertOne(makeFile('one.csv', originalBytes), preset, codec);
// Regression: modern browser File/Blob has a bytes() METHOD. It must never
// be mistaken for a Uint8Array property when arrayBuffer() is available.
const modernFile = {
  name: 'browser-file.csv',
  size: originalBytes.byteLength,
  bytes: async () => new Uint8Array(originalBytes),
  arrayBuffer: async () => originalBytes.buffer.slice(
    originalBytes.byteOffset, originalBytes.byteOffset + originalBytes.byteLength
  )
};
const browserLike = await convertOne(modernFile, preset, codec);
assert.deepEqual(Buffer.from(browserLike.bytes), Buffer.from(transformed.bytes));
success('modern File.bytes() method is not mistaken for direct raw bytes');
assert.equal(transformed.inputRows, 3);
assert.equal(transformed.outputColumns, 4);
assert.deepEqual(pythonRead(transformed.bytes), [
  ['title', 'sku', 'memo', ''],
  ['白 Tシャツ', '001', 'memo, one', 'A'],
  ['長い 名前', '002', 'new\nline', 'B'],
  ['NEW', '003', 'a "quote"', 'C']
]);
assert.deepEqual(originalBytes, Buffer.from(sourceText, 'utf8'));
success('browser-compatible production codec + independent Python CSV reader match complex data');

free.state.input.hasHeader = true;
free.state.options.cleanScope = preset.cleaning.scope;
free.state.options.trim = preset.cleaning.trim;
free.state.options.normSpaces = preset.cleaning.normSpaces;
free.state.options.zenHan = { ...preset.cleaning.zenHan };
await free.load(sourceText, 'utf-8', ',');
free.state.data.cols.forEach((col, index) => {
  const mapped = preset.columns[index];
  col.name = mapped.name;
  col.order = mapped.order;
  col.excluded = mapped.excluded;
  col.cleanApply = mapped.cleanApply;
});
const freeOut = free.buildOutputPreview(false);
const freeSerialized = free.stringifyCSV(
  [freeOut.headers, ...freeOut.rows], ',', 'crlf', 'auto'
);
assert.deepEqual(Buffer.from(transformed.bytes), Buffer.concat([
  Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(freeSerialized, 'utf8')
]));
success('batch output is byte-for-byte equal to existing Free engine for same configuration');

const valid1 = makeFile('sales.csv', sourceText);
const differentHeader = makeFile('wrong.csv', sourceText.replace(',code,code,name,note', ',code,other,name,note'));
const malformed = makeFile('bad.csv', ',code,code,name,note\n"unclosed,x,y,z\n');
const ragged = makeFile('ragged.csv', ',code,code,name,note\nA,001,Spare,Title\n');
const valid2 = makeFile('sales.csv', sourceText.replace('A,001', 'D,004'));
const invalidUtf8 = makeFile('invalid.csv', Buffer.from([0xff, 0xfe, 0xf0]));
const batch = await capture([valid1, differentHeader, malformed, ragged, invalidUtf8, valid2]);
assert.equal(batch.report.accepted, 2);
assert.equal(batch.report.rejected, 4);
assert.equal(batch.delivered.length, 2);
assert.deepEqual(batch.report.files.map(x => x.status),
  ['ok', 'rejected', 'rejected', 'rejected', 'rejected', 'ok']);
assert.deepEqual(batch.report.files.map(x => x.code || ''), [
  '', 'source_header_mismatch', 'unclosed_quote', 'inconsistent_fields', 'decoding_failed', ''
]);
assert.deepEqual(batch.delivered.map(x => x.name), ['001-sales.tidy.csv', '006-sales.tidy.csv']);
assert.equal(pythonRead(batch.delivered[0].bytes).length, 4);
assert.equal(pythonRead(batch.delivered[1].bytes)[1][1], '004');
success('sequential mixed batch delivers only two valid files with collision-proof names');

assert.ok(!JSON.stringify(batch.report).includes('Spare'));
assert.ok(!JSON.stringify(batch.report).includes('memo, one'));
assert.ok(!JSON.stringify(batch.report).includes('白'));
success('batch report contains only bounded status metadata, not CSV rows');

const rejectedOnly = await capture([differentHeader, malformed, ragged]);
assert.equal(rejectedOnly.delivered.length, 0);
success('invalid files never invoke the output callback');

const first = await capture([differentHeader, valid1], preset, { stopOnError: true });
assert.equal(first.report.files.length, 1);
assert.equal(first.report.accepted, 0);
success('stop-on-error prevents subsequent deliveries');

const aborted = await capture([valid1, valid2], preset, { signal: { aborted: true } });
assert.equal(aborted.report.accepted, 0);
assert.equal(aborted.report.cancelled, 2);
success('abort prevents all output callback calls');

const deliveryError = await runBatch([valid1], preset, codec, {
  onOutput: async () => { throw new Error('private data should not be in report'); }
});
assert.equal(deliveryError.files[0].code, 'output_delivery_failed');
assert.ok(!JSON.stringify(deliveryError).includes('private data'));
success('failed output delivery yields a bounded failure without exception details');

const huge = makeFile('huge.csv', Buffer.alloc(BATCH_LIMITS.maxFileBytes + 1, 0x61));
const hugeResult = await capture([huge, valid1]);
assert.equal(hugeResult.report.files[0].code, 'input_too_large');
assert.equal(hugeResult.report.accepted, 1);
success('input-size limit rejects large file without blocking a later valid file');

await assert.rejects(async () => runBatch(
  new Array(BATCH_LIMITS.maxFiles + 1).fill(valid1), preset, codec, { onOutput: async () => {} }
), error => error.code === 'invalid_batch_size');
success('batch file-count limit blocks accidental mass allocation');

const autoPreset = presetInput();
autoPreset.input = { encoding: 'utf-8', delimiter: 'auto' };
autoPreset.source = { hasHeader: true, width: 2, sourceHeaders: ['a', 'b'] };
autoPreset.columns = [0, 1].map(index => ({
  srcIndex: index, order: index, name: index ? 'b' : 'a',
  excluded: false, cleanApply: true
}));
const ambiguousResult = await capture([makeFile('ambiguous.csv', 'a,b;c\n1,2;3\n')], capturePreset(autoPreset));
assert.equal(ambiguousResult.report.files[0].code, 'ambiguous_delimiter');
assert.equal(ambiguousResult.delivered.length, 0);
success('production auto delimiter ambiguity is rejected, never guessed silently');

const headerless = presetInput();
headerless.source = { hasHeader: false, width: 1, sourceHeaders: null };
headerless.columns = [{ srcIndex: 0, order: 0, name: 'no-invented-header', excluded: false, cleanApply: true }];
headerless.output = { delimiter: 'comma', quotePolicy: 'auto', newline: 'lf', bom: false };
const oneColumn = await capture([makeFile('onecol.csv', 'a\n\nb\n')], capturePreset(headerless));
assert.equal(oneColumn.report.accepted, 1);
assert.deepEqual(pythonRead(oneColumn.delivered[0].bytes), [['a'], [''], ['b']]);
success('header OFF preserves explicit blank logical record and no synthetic header');

const excludeAll = presetInput();
excludeAll.columns.forEach(col => { col.excluded = true; });
const noCols = await capture([valid1], capturePreset(excludeAll));
assert.equal(noCols.report.files[0].code, 'no_output_columns');
success('all excluded columns cannot produce an export');

const badCodec = { ...codec, parseCSV: null };
await assert.rejects(async () => convertOne(valid1, preset, badCodec),
  error => error.code === 'codec_unavailable');
success('missing production codec fails closed');

console.log('CSV Tidy Pro batch core: ' + passed + ' PASS / 0 FAIL');
