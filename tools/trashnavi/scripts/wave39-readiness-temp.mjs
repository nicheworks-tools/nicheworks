#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const appPath = 'tools/trashnavi/app.js';
let app = fs.readFileSync(appPath, 'utf8');
if (!app.includes('data/direct-waste-links-supply-wave39.json')) {
  app = app.replace('"data/direct-waste-links-supply-wave38.json"]', '"data/direct-waste-links-supply-wave38.json","data/direct-waste-links-supply-wave39.json"]');
}
if (!app.includes('data/direct-waste-links-supply-wave39.json')) throw new Error('Wave39 dataset registration failed');
fs.writeFileSync(appPath, app, 'utf8');

for (const [script, args] of [
  ['tools/trashnavi/scripts/audit-coverage.mjs', ['--strict']],
  ['scripts/check-trashnavi-direct-links.mjs', ['--inventory']],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs', ['--check']],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs', []],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs', []]
]) execFileSync(process.execPath, [script, ...args], { stdio: 'inherit' });

for (const p of ['tools/trashnavi/scripts/wave39-readiness-temp.mjs', '.github/workflows/trashnavi-wave39-readiness-temp.yml']) {
  if (fs.existsSync(p)) fs.rmSync(p);
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git', ['add', '-A'], { stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
if (!status.trim()) throw new Error('No readiness changes to commit');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): register Wave39 direct links'], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave39-readiness-20260917'], { stdio: 'inherit' });
