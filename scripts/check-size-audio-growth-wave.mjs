import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const check = (condition, message) => { if (!condition) failures.push(message); };
const has = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  check(read(rel).includes(needle), `${rel}: missing ${label}`);
};
const lacks = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  check(!read(rel).includes(needle), `${rel}: forbidden ${label}`);
};

function syntax(rel) {
  check(exists(rel), `${rel}: missing file for syntax check`);
  if (!exists(rel)) return;
  try {
    execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'pipe' });
  } catch (error) {
    failures.push(`${rel}: JavaScript syntax check failed: ${String(error?.stderr || error?.message || error).trim()}`);
  }
}

// Size Converter: current-search intent without inventing new source data.
has('tools/size-converter/index.html', './query-intent.js');
has('tools/size-converter/query-intent.js', 'const clothingRanges = {');
has('tools/size-converter/query-intent.js', "Men's shoes US 4");
has('tools/size-converter/query-intent.js', "Women's shoes US 4");
has('tools/size-converter/query-intent.js', 'const COMPARE_MAX = 4;');
has('tools/size-converter/query-intent.js', 'function addCurrentToCompare()');
has('tools/size-converter/query-intent.js', 'function copyCompare()');
has('tools/size-converter/SPEC.md', "US 4 men's-shoe and women's-shoe shortcuts");
has('tools/size-converter/SPEC.md', 'Candidate comparison rows are page state only and capped at four.');
lacks('tools/size-converter/query-intent.js', 'localStorage.setItem', 'query/compare persistence');
lacks('tools/size-converter/query-intent.js', 'gtag(', 'query/compare analytics payload');
lacks('tools/size-converter/query-intent.js', 'amazon.', 'query/compare Amazon URL construction');
{
  const html = read('tools/size-converter/index.html');
  check(html.indexOf('./app.js') >= 0 && html.indexOf('./app.js') < html.indexOf('./query-intent.js'),
    'Size Converter: query-intent extension must load after the core app');
}
syntax('tools/size-converter/query-intent.js');

// Tiny Audio: numeric export is current-page numeric data only.
has('tools/tiny-audio-meter/records-export.js', 'relative_db');
has('tools/tiny-audio-meter/records-export.js', 'pitch_confidence_percent');
has('tools/tiny-audio-meter/records-export.js', 'URL.createObjectURL');
has('tools/tiny-audio-meter/records-export.js', 'function copySegment()');
lacks('tools/tiny-audio-meter/records-export.js', 'getUserMedia', 'second microphone acquisition');
lacks('tools/tiny-audio-meter/records-export.js', 'localStorage', 'numeric-export persistence');
lacks('tools/tiny-audio-meter/records-export.js', 'gtag(', 'numeric-export analytics payload');
syntax('tools/tiny-audio-meter/records-export.js');

// Tiny Audio: two-second ambient reference is explicitly relative and page-local.
has('tools/tiny-audio-meter/ambient-reference.js', 'const SAMPLE_DURATION_MS = 2000;');
has('tools/tiny-audio-meter/ambient-reference.js', 'const MIN_SAMPLES = 10;');
has('tools/tiny-audio-meter/ambient-reference.js', 'function median(values)');
has('tools/tiny-audio-meter/ambient-reference.js', 'function clearAmbientReference()');
has('tools/tiny-audio-meter/ambient-reference.js', 'current relative dB minus ambient-reference relative dB', 'non-calibrated ambient explanation');
has('tools/tiny-audio-meter/ambient-reference.js', 'processingOn()');
lacks('tools/tiny-audio-meter/ambient-reference.js', 'getUserMedia', 'second microphone acquisition');
lacks('tools/tiny-audio-meter/ambient-reference.js', 'localStorage', 'ambient persistence');
lacks('tools/tiny-audio-meter/ambient-reference.js', 'gtag(', 'ambient analytics payload');
syntax('tools/tiny-audio-meter/ambient-reference.js');

has('tools/tiny-audio-meter/comparison.js', 'loadLocalExtension("./records-export.js", "records-export")');
has('tools/tiny-audio-meter/comparison.js', 'loadLocalExtension("./ambient-reference.js", "ambient-reference")');
has('tools/tiny-audio-meter/app.js', 'echoCancellation: false');
has('tools/tiny-audio-meter/app.js', 'noiseSuppression: false');
has('tools/tiny-audio-meter/app.js', 'autoGainControl: false');
has('tools/tiny-audio-meter/SPEC.md', 'Ambient referenceはactivity threshold、pitch detection、spectrum計算を変更しない。');
has('tools/tiny-audio-meter/SPEC.md', 'Baselineやmicrophone-derived valuesは永続保存・affiliate analytics送信されない。');
syntax('tools/tiny-audio-meter/comparison.js');

// Amazon activation boundary remains closed for this growth wave.
for (const rel of ['tools/size-converter/affiliate-config.js', 'tools/tiny-audio-meter/affiliate-config.js']) {
  has(rel, 'enabled: false', 'disabled Amazon config');
  lacks(rel, 'https://', 'live affiliate URL before activation');
}

if (failures.length) {
  console.error(`Size/Tiny Audio growth-wave contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  size_converter: ['US4-context', 'range-resolution', 'compare-tray-4'],
  tiny_audio: ['numeric-csv-summary', 'segment-copy', 'ambient-relative-reference'],
  amazon_enabled: false
}, null, 2));
