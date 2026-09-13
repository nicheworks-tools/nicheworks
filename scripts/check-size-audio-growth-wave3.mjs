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
  if (exists(rel)) check(read(rel).includes(needle), `${rel}: missing ${label}`);
};
const lacks = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (exists(rel)) check(!read(rel).includes(needle), `${rel}: forbidden ${label}`);
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

// PR12: retail-style size syntax normalization is local syntax cleanup only.
has('tools/size-converter/query-intent.js', 'function normalizeRetailSizeSyntax(raw)');
has('tools/size-converter/query-intent.js', '1\\s*\\/\\s*2', 'half-size fraction normalization');
has('tools/size-converter/query-intent.js', '½', 'half glyph normalization');
has('tools/size-converter/query-intent.js', 'function toHalfWidth(text)');
lacks('tools/size-converter/query-intent.js', 'fetch(', 'query-intent network request');
syntax('tools/size-converter/query-intent.js');

// PR13: valid fit results can hand only an estimated JP size/context to the converter.
has('tools/size-converter/fit-handoff.js', 'function handoff(kind, chart, jpSize)');
has('tools/size-converter/fit-handoff.js', 'input.value = `JP ${jpSize}`');
has('tools/size-converter/fit-handoff.js', 'data-size-converter-fit-extension', 'local fit extension loader');
lacks('tools/size-converter/fit-handoff.js', 'gtag(', 'fit-handoff analytics payload');
lacks('tools/size-converter/fit-handoff.js', 'localStorage', 'fit-handoff persistence');
lacks('tools/size-converter/fit-handoff.js', 'fetch(', 'fit-handoff network request');
syntax('tools/size-converter/fit-handoff.js');

// PR14: inch convenience layer converts locally into the unchanged cm fit engine.
has('tools/size-converter/shoe-units.js', 'length * 2.54');
has('tools/size-converter/shoe-units.js', 'width * 2.54');
has('tools/size-converter/shoe-units.js', 'run.addEventListener("click", prepareInchForCore, { capture: true })');
has('tools/size-converter/fit-handoff.js', 'loadLocalExtension("./shoe-units.js", "shoe-units")');
lacks('tools/size-converter/shoe-units.js', 'gtag(', 'shoe-unit analytics payload');
lacks('tools/size-converter/shoe-units.js', 'localStorage', 'shoe-unit persistence');
lacks('tools/size-converter/shoe-units.js', 'fetch(', 'shoe-unit network request');
syntax('tools/size-converter/shoe-units.js');

// PR15: measurement conditions reuse the existing analyser/DOM state and stay local.
has('tools/tiny-audio-meter/comparison.js', 'detail: { peakHz, peakValue, sampleRate, fftSize: analyser.fftSize }');
has('tools/tiny-audio-meter/comparison.js', 'loadLocalExtension("./measurement-conditions.js", "measurement-conditions")');
has('tools/tiny-audio-meter/measurement-conditions.js', 'Measurement conditions');
has('tools/tiny-audio-meter/measurement-conditions.js', 'navigator.clipboard.writeText');
has('tools/tiny-audio-meter/measurement-conditions.js', 'sampleRate');
has('tools/tiny-audio-meter/measurement-conditions.js', 'fftSize');
lacks('tools/tiny-audio-meter/measurement-conditions.js', 'getUserMedia', 'second microphone acquisition');
lacks('tools/tiny-audio-meter/measurement-conditions.js', 'gtag(', 'conditions analytics payload');
lacks('tools/tiny-audio-meter/measurement-conditions.js', 'localStorage', 'conditions persistence');
lacks('tools/tiny-audio-meter/measurement-conditions.js', 'fetch(', 'conditions network request');
syntax('tools/tiny-audio-meter/comparison.js');
syntax('tools/tiny-audio-meter/measurement-conditions.js');

// Amazon remains ready-but-inert until the separate activation PR has verified URLs.
for (const rel of ['tools/size-converter/affiliate-config.js', 'tools/tiny-audio-meter/affiliate-config.js']) {
  has(rel, 'enabled: false', 'disabled Amazon config');
  lacks(rel, 'https://', 'live affiliate URL before activation');
}

if (failures.length) {
  console.error(`Size/Tiny Audio growth-wave 3 contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  size_converter: ['retail-input-normalization', 'fit-handoff', 'shoe-inch-input'],
  tiny_audio: ['measurement-conditions-report'],
  amazon_enabled: false
}, null, 2));
