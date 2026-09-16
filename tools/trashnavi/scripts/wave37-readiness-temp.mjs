#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const appPath = 'tools/trashnavi/app.js';
let app = fs.readFileSync(appPath, 'utf8');
const oldTail = '"data/direct-waste-links-supply-wave35.json","data/direct-waste-links-supply-wave36.json"]';
const newTail = '"data/direct-waste-links-supply-wave35.json","data/direct-waste-links-supply-wave36.json","data/direct-waste-links-supply-wave37.json"]';
if (!app.includes(oldTail)) throw new Error('Wave36 DIRECT_LINK_FILES tail not found');
app = app.replace(oldTail, newTail);
fs.writeFileSync(appPath, app, 'utf8');

execFileSync(process.execPath, ['tools/trashnavi/scripts/audit-coverage.mjs', '--strict'], { stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/check-trashnavi-direct-links.mjs', '--inventory'], { stdio: 'inherit' });

for (const p of [
  'tools/trashnavi/scripts/wave37-readiness-temp.mjs',
  '.github/workflows/trashnavi-wave37-readiness-temp.yml'
]) {
  if (fs.existsSync(p)) fs.rmSync(p);
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]']);
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git', ['add', '-A']);
const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave37 readiness produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): register Wave37 direct links'], { stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave37-readiness-20260916'], { stdio: 'inherit' });
