import assert from 'node:assert/strict';
import {
  PRESET_VERSION, MAX_PRESET_BYTES, capturePreset, validatePreset,
  serializePreset, deserializePreset, planPresetApplication
} from '../pro/preset-core.mjs';

let passed = 0;
const test = (name, callback) => {
  callback();
  passed++;
  console.log('PASS ' + name);
};
const clone = value => JSON.parse(JSON.stringify(value));
const fixture = () => ({
  label: '毎月の会計CSV 📊',
  source: { hasHeader: true, width: 4, sourceHeaders: ['', '日付', '日付', 'メモ'] },
  columns: [
    { srcIndex: 0, order: 3, name: '', excluded: false, cleanApply: false },
    { srcIndex: 1, order: 2, name: 'date', excluded: false, cleanApply: true },
    { srcIndex: 2, order: 1, name: 'date', excluded: true, cleanApply: false },
    { srcIndex: 3, order: 0, name: 'memo', excluded: false, cleanApply: true }
  ],
  input: { encoding: 'auto', delimiter: 'auto' },
  cleaning: {
    scope: 'selected', trim: true, normSpaces: false,
    zenHan: { enabled: true, dir: 'zen2han', targetHeader: true, targetData: true }
  },
  output: { delimiter: 'input', quotePolicy: 'auto', newline: 'crlf', bom: true }
});
function errorCode(call, expectedCode) {
  assert.throws(call, error => error && error.code === expectedCode,
    'Expected ' + expectedCode);
}
const preset = capturePreset(fixture());

test('valid preset captures original blank/duplicate source headers and all four columns', () => {
  assert.equal(preset.schemaVersion, PRESET_VERSION);
  assert.deepEqual(preset.source.sourceHeaders, ['', '日付', '日付', 'メモ']);
  assert.deepEqual(preset.columns.map(c => c.srcIndex), [0, 1, 2, 3]);
  assert.deepEqual(preset.columns.map(c => c.order), [3, 2, 1, 0]);
  assert.deepEqual(preset.columns.map(c => c.excluded), [false, false, true, false]);
  assert.deepEqual(preset.columns.map(c => c.cleanApply), [false, true, false, true]);
});

test('versioned JSON export/import is deterministic and only includes mapped settings', () => {
  const json = serializePreset(preset);
  assert.deepEqual(deserializePreset(json), preset);
  assert.equal(serializePreset(deserializePreset(json)), json);
  assert.ok(!json.includes('Alice') && !json.includes('rawRows'));
});

test('correct source creates an independent positional application plan', () => {
  const plan = planPresetApplication(preset, fixture().source);
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.columns.map(c => c.order), [3, 2, 1, 0]);
  assert.equal(plan.cleaning.scope, 'selected');
  assert.equal(plan.output.bom, true);
  plan.columns[2].name = 'should not mutate preset';
  plan.cleaning.zenHan.dir = 'han2zen';
  assert.equal(preset.columns[2].name, 'date');
  assert.equal(preset.cleaning.zenHan.dir, 'zen2han');
});

test('changed source header at original position is explicitly rejected', () => {
  const source = clone(fixture().source);
  source.sourceHeaders[2] = '別の列';
  assert.deepEqual(planPresetApplication(preset, source),
    { ok: false, code: 'source_header_mismatch', column: 3 });
});

test('different column count is rejected without partial plan', () => {
  assert.deepEqual(planPresetApplication(preset, {
    hasHeader: true, width: 3, sourceHeaders: ['', '日付', '日付']
  }), { ok: false, code: 'column_width_mismatch', expected: 4, actual: 3 });
});

test('header ON/OFF mismatch is rejected before any mapping is used', () => {
  assert.deepEqual(planPresetApplication(preset, {
    hasHeader: false, width: 4, sourceHeaders: null
  }), { ok: false, code: 'header_mode_mismatch' });
});

test('header OFF uses first data record width, without inventing names', () => {
  const data = fixture();
  data.source = { hasHeader: false, width: 4, sourceHeaders: null };
  const noHeaderPreset = capturePreset(data);
  assert.equal(planPresetApplication(noHeaderPreset, data.source).ok, true);
  errorCode(() => capturePreset({ ...data, source: { ...data.source, sourceHeaders: [] } }),
    'invalid_source_headers');
});

test('duplicate column positions or duplicate order positions are rejected', () => {
  const sameSource = fixture();
  sameSource.columns[1].srcIndex = 0;
  errorCode(() => capturePreset(sameSource), 'invalid_column_position');
  const sameOrder = fixture();
  sameOrder.columns[1].order = 3;
  errorCode(() => capturePreset(sameOrder), 'invalid_column_order');
});

test('partial column mappings, out-of-range positions and invalid names reject', () => {
  const missing = fixture();
  missing.columns.pop();
  errorCode(() => capturePreset(missing), 'invalid_columns');
  const outside = fixture();
  outside.columns[1].srcIndex = 999;
  errorCode(() => capturePreset(outside), 'invalid_column_position');
  const name = fixture();
  name.columns[0].name = 0;
  errorCode(() => capturePreset(name), 'invalid_column_name');
});

test('unsupported schema versions and extra fields carrying CSV rows reject', () => {
  const version = clone(preset);
  version.schemaVersion = 'nicheworks.csv-tidy-pro-preset.v2';
  errorCode(() => validatePreset(version), 'unsupported_preset_version');
  const leakage = clone(preset);
  leakage.rows = [['secret PII']];
  errorCode(() => validatePreset(leakage), 'invalid_preset');
  const rogueColumn = clone(preset);
  rogueColumn.columns[0].rawValue = 'secret';
  errorCode(() => validatePreset(rogueColumn), 'invalid_column');
});

test('invalid transformation settings and CSV output settings reject', () => {
  const badScope = clone(preset);
  badScope.cleaning.scope = 'selected-keys';
  errorCode(() => validatePreset(badScope), 'invalid_cleaning_scope');
  const badBom = clone(preset);
  badBom.output.bom = 'true';
  errorCode(() => validatePreset(badBom), 'invalid_output_bom');
  const badDelimiter = clone(preset);
  badDelimiter.input.delimiter = '|';
  errorCode(() => validatePreset(badDelimiter), 'invalid_input_delimiter');
});

test('malformed and oversized JSON reject without code execution', () => {
  errorCode(() => deserializePreset('{bad json'), 'invalid_preset_json');
  errorCode(() => deserializePreset('x'.repeat(MAX_PRESET_BYTES + 1)), 'preset_too_large');
});

test('no source rows are captured: a valid exported preset has only allow-listed keys', () => {
  const value = JSON.parse(serializePreset(preset));
  assert.deepEqual(Object.keys(value).sort(), [
    'schemaVersion', 'label', 'source', 'columns', 'input', 'cleaning', 'output'
  ].sort());
  assert.ok(value.source.sourceHeaders.includes(''));
  assert.ok(value.columns.some(c => c.excluded));
});

console.log('CSV Tidy Pro preset core: ' + passed + ' PASS / 0 FAIL');
