import fs from 'node:fs';
import path from 'node:path';
import { buildNonAffiliateWaves } from './non-affiliate-wave-assignment.mjs';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const registry = readJson('tools/tools-index.json');
const scope = readJson('audits/non-affiliate-scope.json');
const plan = readJson('audits/non-affiliate-audit-plan.json');

const { ordered, waves: waveSlugs } = buildNonAffiliateWaves(registry, scope, plan);
const waves = waveSlugs.map((slugs, index) => ({ wave: index + 1, slugs }));

const arg = process.argv[2];
if (arg) {
  const waveNumber = Number(arg);
  if (!Number.isInteger(waveNumber) || waveNumber < 1 || waveNumber > plan.waveCount) {
    throw new Error(`Wave must be an integer from 1 to ${plan.waveCount}.`);
  }
  console.log(JSON.stringify(waves[waveNumber - 1], null, 2));
} else {
  console.log(JSON.stringify({
    totalTools: ordered.length,
    waveSize: plan.waveSize,
    waveCount: plan.waveCount,
    waveSizes: plan.waveSizes,
    lateAdditions: plan.lateAdditions,
    waves
  }, null, 2));
}
