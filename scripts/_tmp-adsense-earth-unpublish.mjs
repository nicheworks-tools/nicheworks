import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const excluded = new Set(['earth-alerts', 'earth-timeseries']);
const targetUrls = [...excluded].map((slug) => `https://nicheworks.app/tools/${slug}/`);

const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(root, p), s, 'utf8');
const readJson = (p) => JSON.parse(read(p));
const writeJson = (p, value) => write(p, JSON.stringify(value, null, 2) + '\n');

// Keep future tools-index regeneration from re-registering the two placeholder routes.
{
  const p = 'scripts/generate-tools-index.mjs';
  let s = read(p);
  const before = 'const EXCLUDE = new Set(["_codex", "_template"]);';
  const after = 'const EXCLUDE = new Set(["_codex", "_template", "earth-alerts", "earth-timeseries"]);';
  if (!s.includes(after)) {
    if (!s.includes(before)) throw new Error('generate-tools-index EXCLUDE contract changed unexpectedly');
    s = s.replace(before, after);
    write(p, s);
  }
}

// Public registry.
{
  const p = 'tools/tools-index.json';
  const data = readJson(p);
  data.items = data.items.filter((item) => !excluded.has(item.slug));
  data.total = data.items.length;
  writeJson(p, data);
}

// Canonical spec manifest follows the registered/public denominator.
{
  const p = 'tools/tool-spec-manifest.json';
  const data = readJson(p);
  data.items = data.items.filter((item) => !excluded.has(item.slug));
  data.required_complete = data.items.length;
  data.complete = data.items.filter((item) => item.state === 'complete').length;
  data.pending = data.items.filter((item) => item.state !== 'complete').length;
  writeJson(p, data);
}

// Canonical human specs for unregistered placeholders move out of docs/tools.
fs.mkdirSync(path.join(root, 'docs/staged-tools'), { recursive: true });
for (const slug of excluded) {
  const from = path.join(root, 'docs/tools', `${slug}.md`);
  const to = path.join(root, 'docs/staged-tools', `${slug}.md`);
  if (fs.existsSync(from)) {
    let body = fs.readFileSync(from, 'utf8');
    const note = '> Publication status: staged / unregistered for AdSense review readiness. The route remains directly reachable but is noindex,nofollow and excluded from the public registry and sitemaps.\n\n';
    if (!body.includes('Publication status: staged / unregistered')) body = note + body;
    fs.writeFileSync(to, body, 'utf8');
    fs.unlinkSync(from);
  }
}

// Quality matrix denominator and records.
let quality;
{
  const p = 'audits/tool-quality-matrix.json';
  quality = readJson(p);
  quality.records = quality.records.filter((record) => !excluded.has(record.slug));
  quality.registered_tool_count = quality.records.length;
  quality.record_count = quality.records.length;
  if (quality.counts && typeof quality.counts === 'object') {
    for (const key of Object.keys(quality.counts)) {
      quality.counts[key] = quality.records.filter((record) => record.final_state === key).length;
    }
  }
  writeJson(p, quality);
}

// Keep the human-readable matrix aligned without regenerating unrelated wording.
{
  const p = 'audits/tool-quality-matrix.md';
  let s = read(p);
  s = s.split('\n').filter((line) => !line.includes('[earth-alerts]') && !line.includes('[earth-timeseries]')).join('\n');
  const stateCount = (state) => quality.records.filter((record) => record.final_state === state).length;
  const behaviorMissing = quality.records.filter((record) => record.functional_test_status === 'behavior-test-missing').length;
  s = s.replace(/- Registered tools: \*\*\d+\*\*/, `- Registered tools: **${quality.records.length}**`);
  s = s.replace(/- Specifications: \*\*\d+\*\*/, `- Specifications: **${quality.records.length}**`);
  s = s.replace(/- Matrix records: \*\*\d+\*\*/, `- Matrix records: **${quality.records.length}**`);
  s = s.replace(/- PASS: \*\*\d+\*\*/, `- PASS: **${stateCount('PASS')}**`);
  s = s.replace(/- FIX: \*\*\d+\*\*/, `- FIX: **${stateCount('FIX')}**`);
  s = s.replace(/- BLOCKED: \*\*\d+\*\*/, `- BLOCKED: **${stateCount('BLOCKED')}**`);
  s = s.replace(/- NEEDS_DECISION: \*\*\d+\*\*/, `- NEEDS_DECISION: **${stateCount('NEEDS_DECISION')}**`);
  s = s.replace(/- Behavior-level tests missing: \*\*\d+\*\*/, `- Behavior-level tests missing: **${behaviorMissing}**`);
  write(p, s.endsWith('\n') ? s : s + '\n');
}

// Monetization machine-readable ledger follows the public registry.
let monetization;
{
  const p = 'MONETIZATION_CLASSIFICATION_87.json';
  monetization = readJson(p);
  for (const [key, slugs] of Object.entries(monetization.classes)) {
    monetization.classes[key] = slugs.filter((slug) => !excluded.has(slug));
    monetization.counts[key] = monetization.classes[key].length;
  }
  monetization.registryTotal = Object.values(monetization.classes).reduce((sum, slugs) => sum + slugs.length, 0);
  monetization.updated = '2026-09-14';
  writeJson(p, monetization);
}

// Minimal human-ledger update: only denominator/HOLD state touched by this change.
{
  const p = 'MONETIZATION_CLASSIFICATION_87.md';
  let s = read(p);
  s = s.split('\n').filter((line) => line.trim() !== '- `earth-alerts`' && line.trim() !== '- `earth-timeseries`').join('\n');
  s = s.replace(/^# NicheWorks \d+-tool Monetization Classification/m, `# NicheWorks ${monetization.registryTotal}-tool Monetization Classification`);
  s = s.replace(/^Updated: .*$/m, 'Updated: 2026-09-14  ');
  s = s.replace(/the current \d+-tool registry/g, `the current ${monetization.registryTotal}-tool registry`);
  s = s.replace(/\| `HOLD` \| \d+ \|/, `| \`HOLD\` | ${monetization.counts.HOLD} |`);
  s = s.replace(/\| \*\*Total\*\* \| \*\*\d+\*\* \|/, `| **Total** | **${monetization.registryTotal}** |`);
  s = s.replace(/^## 7\. `HOLD` — \d+$/m, `## 7. \`HOLD\` — ${monetization.counts.HOLD}`);
  write(p, s.endsWith('\n') ? s : s + '\n');
}

// Remove the two routes from every plain XML sitemap at repository root.
for (const name of fs.readdirSync(root)) {
  if (!/^sitemap.*\.xml$/.test(name)) continue;
  const p = path.join(root, name);
  let s = fs.readFileSync(p, 'utf8');
  for (const url of targetUrls) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`\\s*<url>\\s*<loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, 'g'), '');
  }
  fs.writeFileSync(p, s, 'utf8');
}
if (fs.existsSync(path.join(root, 'sitemap.xml.gz'))) {
  fs.writeFileSync(path.join(root, 'sitemap.xml.gz'), zlib.gzipSync(fs.readFileSync(path.join(root, 'sitemap.xml'))));
}

// Tighten HTTP-level indexing policy for only the two placeholders.
{
  const p = '_headers';
  let s = read(p);
  for (const slug of excluded) {
    const pattern = new RegExp(`(/tools/${slug}/\\*\\n\\s+X-Robots-Tag:) noindex, follow`, 'g');
    s = s.replace(pattern, '$1 noindex, nofollow');
  }
  write(p, s);
}

// Page-level policy: retain URL/GA4, remove advertising and ad-slot UI, noindex/nofollow.
for (const slug of excluded) {
  const p = `tools/${slug}/index.html`;
  let s = read(p);
  s = s.replace('<meta name="robots" content="index,follow">', '<meta name="robots" content="noindex,nofollow">');
  s = s.replace(/\n\s*<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-9879006623791275" crossorigin="anonymous"><\/script>\s*/g, '\n');
  s = s.replace(/\n\s*<div class="ad-slot ad-top">[^<]*<\/div>\s*/g, '\n');
  s = s.replace(/\n\s*<div class="ad-slot ad-bottom">[^<]*<\/div>\s*/g, '\n');
  write(p, s);
}

// Remove internal discovery links to the staged routes from all other HTML pages.
const htmlFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(abs);
  }
};
walk(root);
for (const abs of htmlFiles) {
  if ([...excluded].some((slug) => abs.includes(`${path.sep}tools${path.sep}${slug}${path.sep}`))) continue;
  let s = fs.readFileSync(abs, 'utf8');
  const original = s;
  for (const slug of excluded) {
    s = s.replace(new RegExp(`<a[^>]+href=["']/tools/${slug}/["'][^>]*>[\\s\\S]*?<\\/a>`, 'g'), '');
  }
  // Remove the now-empty Earth Map related-tools section when both links were its only content.
  s = s.replace(/\n\s*<section class="nw-other">[\s\S]*?<h3[^>]*>関連ツール<\/h3>[\s\S]*?<h3[^>]*>Related tools<\/h3>[\s\S]*?<div class="nw-other-links"[^>]*>\s*<\/div>[\s\S]*?<div class="nw-other-links"[^>]*>\s*<\/div>[\s\S]*?<\/section>/g, '\n');
  if (s !== original) fs.writeFileSync(abs, s, 'utf8');
}

// Assertions for this exact operation.
const registry = readJson('tools/tools-index.json');
const manifest = readJson('tools/tool-spec-manifest.json');
const q = readJson('audits/tool-quality-matrix.json');
const m = readJson('MONETIZATION_CLASSIFICATION_87.json');
if (registry.total !== 88 || registry.items.some((x) => excluded.has(x.slug))) throw new Error('public registry is not exactly 88 after exclusion');
if (manifest.required_complete !== 88 || manifest.items.some((x) => excluded.has(x.slug))) throw new Error('spec manifest is not aligned at 88');
if (q.registered_tool_count !== 88 || q.record_count !== 88 || q.records.some((x) => excluded.has(x.slug))) throw new Error('quality matrix is not aligned at 88');
if (m.registryTotal !== 88 || Object.values(m.classes).flat().some((slug) => excluded.has(slug))) throw new Error('monetization ledger is not aligned at 88');
for (const slug of excluded) {
  const html = read(`tools/${slug}/index.html`);
  if (!html.includes('content="noindex,nofollow"')) throw new Error(`${slug}: missing noindex,nofollow`);
  if (html.includes('pagead2.googlesyndication.com') || html.includes('ad-slot')) throw new Error(`${slug}: advertising remnants remain`);
  for (const name of fs.readdirSync(root).filter((n) => /^sitemap.*\.xml$/.test(n))) {
    if (read(name).includes(`/tools/${slug}/`)) throw new Error(`${name}: still contains ${slug}`);
  }
}

console.log('AdSense Earth placeholder unpublish transform complete: 88 public registered tools; target routes retained direct-only.');
