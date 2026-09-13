import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const toolsRoot = path.resolve('tools');
const testName = 'behavior.test.mjs';
const discovered = [];

for (const entry of fs.readdirSync(toolsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const candidate = path.join(toolsRoot, entry.name, 'tests', testName);
  if (fs.existsSync(candidate)) discovered.push(candidate);
}

discovered.sort();

if (discovered.length === 0) {
  console.error(`Tool behavior test runner found no tools/*/tests/${testName} files.`);
  process.exit(1);
}

let failures = 0;
for (const test of discovered) {
  const rel = path.relative(process.cwd(), test);
  console.log(`==> ${rel}`);
  const result = spawnSync(process.execPath, [test], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) {
    failures += 1;
    console.error(`${rel}: failed to start (${result.error.message})`);
    continue;
  }
  if (result.status !== 0) {
    failures += 1;
    console.error(`${rel}: exited with status ${result.status}`);
  }
}

if (failures) {
  console.error(`Tool behavior tests failed: ${failures}/${discovered.length}.`);
  process.exit(1);
}

console.log(`Tool behavior tests passed: ${discovered.length}.`);
