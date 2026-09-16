#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const branch='feat/trashnavi-wave38-readiness-20260916';
const appPath='tools/trashnavi/app.js';
let app=fs.readFileSync(appPath,'utf8');
const needle='"data/direct-waste-links-supply-wave37.json"]';
const replacement='"data/direct-waste-links-supply-wave37.json","data/direct-waste-links-supply-wave38.json"]';
if (!app.includes('direct-waste-links-supply-wave38.json')) {
  if (!app.includes(needle)) throw new Error('Wave37 direct-link tail not found');
  app=app.replace(needle,replacement);
  fs.writeFileSync(appPath,app,'utf8');
}

for (const [script,args] of [
  ['tools/trashnavi/scripts/audit-coverage.mjs',['--strict']],
  ['scripts/check-trashnavi-direct-links.mjs',['--inventory']],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs',['--check']],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs',[]],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs',[]]
]) execFileSync(process.execPath,[script,...args],{stdio:'inherit'});

for (const p of ['tools/trashnavi/scripts/wave38-readiness-temp.mjs','.github/workflows/trashnavi-wave38-readiness-temp.yml']) {
  if (fs.existsSync(p)) fs.rmSync(p);
}
execFileSync('git',['config','user.name','github-actions[bot]']);
execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git',['add','-A'],{stdio:'inherit'});
const status=execFileSync('git',['status','--porcelain'],{encoding:'utf8'});
if (!status.trim()) throw new Error('Wave38 readiness produced no changes');
execFileSync('git',['commit','-m','feat(trashnavi): register Wave38 readiness dataset'],{stdio:'inherit'});
execFileSync('git',['push','origin',`HEAD:${branch}`],{stdio:'inherit'});
