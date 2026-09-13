import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, 'tools/tools-index.json'), 'utf8'));
const slugs = (registry.items || registry.tools || []).map((x) => x.slug).filter(Boolean);
const excluded = new Set(['.git','node_modules','vendor']);
const candidates = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(ent.name)) continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(abs);
    else inspect(abs);
  }
}

function inspect(abs) {
  const rel = path.relative(root, abs).replaceAll('\\','/');
  if (!/\.(?:mjs|cjs|js)$/.test(rel)) return;
  if (!/(?:test|check|validate|audit|spec)/i.test(rel)) return;
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch { return; }
  const assertCount = (text.match(/\bassert(?:\.|\()/g) || []).length + (text.match(/\bexpect\s*\(/g) || []).length;
  const testApiCount = (text.match(/\b(?:test|it)\s*\(/g) || []).length;
  if (!assertCount && !testApiCount) return;
  const vmExec = /vm\.(?:runInContext|runInNewContext)|new Function\s*\(/.test(text);
  const childExec = /execFileSync|spawnSync|execSync/.test(text);
  const importedRuntime = /(?:import|require\s*\()/.test(text);
  const sourceIncludes = (text.match(/\.includes\s*\(/g) || []).length;
  const referenced = slugs.filter((slug) => rel.includes(`/tools/${slug}/`) || rel.includes(`tools/${slug}/`) || text.includes(`tools/${slug}/`) || rel.includes(`/${slug}/`));
  candidates.push({ path: rel, assertCount, testApiCount, vmExec, childExec, importedRuntime, sourceIncludes, slugs: referenced });
}

walk(root);
candidates.sort((a,b) => a.path.localeCompare(b.path));
console.log(JSON.stringify({ count: candidates.length, candidates }, null, 2));
