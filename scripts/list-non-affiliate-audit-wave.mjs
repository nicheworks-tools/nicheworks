import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const registry = readJson('tools/tools-index.json');
const scope = readJson('audits/non-affiliate-scope.json');
const plan = readJson('audits/non-affiliate-audit-plan.json');

const inScopeSet = new Set(Object.values(scope.classes).flat());
const ordered = registry.items
  .map((item) => item.slug)
  .filter((slug) => inScopeSet.has(slug));

if (ordered.length !== plan.totalTools) {
  throw new Error(`Expected ${plan.totalTools} in-scope tools, found ${ordered.length}.`);
}

const waves = Array.from({ length: plan.waveCount }, (_, index) => ({
  wave: index + 1,
  slugs: ordered.slice(index * plan.waveSize, (index + 1) * plan.waveSize)
}));

for (const wave of waves) {
  if (wave.slugs.length !== plan.waveSize) {
    throw new Error(`Wave ${wave.wave} expected ${plan.waveSize} tools, found ${wave.slugs.length}.`);
  }
}

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
    waves
  }, null, 2));
}
