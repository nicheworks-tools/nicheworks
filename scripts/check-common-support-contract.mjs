import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, 'tools/tools-index.json'), 'utf8'));
const failures = [];
const allowed = new Set(['.html', '.js', '.mjs']);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (allowed.has(path.extname(entry.name))) out.push(abs);
  }
  return out;
}

for (const item of registry.items) {
  const dir = path.join(root, 'tools', item.slug);
  const files = walk(dir);
  if (!files.length) { failures.push(`${item.slug}: no public HTML/JS implementation files found`); continue; }
  const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  if (!source.includes('https://ofuse.me/nicheworks')) failures.push(`${item.slug}: OFUSE support link missing`);
  if (!source.includes('https://ko-fi.com/nicheworks')) failures.push(`${item.slug}: Ko-fi support link missing`);
}

if (failures.length) {
  console.error(`Common support contract: ${failures.length} failure(s) across ${registry.items.length} registered tools`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Common support contract OK for ${registry.items.length} registered tools.`);
