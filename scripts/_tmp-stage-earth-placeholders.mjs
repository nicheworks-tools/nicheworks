import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const staged = new Set(['earth-alerts', 'earth-timeseries']);
const stagedUrls = [...staged].map((slug) => `https://nicheworks.app/tools/${slug}/`);

const p = (rel) => path.join(root, rel);
const read = (rel) => fs.readFileSync(p(rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(p(rel), text, 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const writeJson = (rel, value) => write(rel, JSON.stringify(value, null, 2) + '\n');

function replaceRequired(text, before, after, label) {
  if (text.includes(after)) return text;
  if (!text.includes(before)) throw new Error(`${label}: expected source fragment missing`);
  return text.replace(before, after);
}

// 1) Prevent regeneration from re-registering placeholders.
{
  const rel = 'scripts/generate-tools-index.mjs';
  let s = read(rel);
  s = replaceRequired(
    s,
    'const EXCLUDE = new Set(["_codex", "_template"]);',
    'const EXCLUDE = new Set(["_codex", "_template", "earth-alerts", "earth-timeseries"]);',
    rel,
  );
  write(rel, s);
}

// 2) Explicit staged/unregistered manifest: direct routes may remain reachable,
// but they are not public-registry or sitemap members until product completion.
writeJson('tools/staged-tools.json', {
  schema_version: 1,
  updated: '2026-09-14',
  items: [...staged].map((slug) => ({
    slug,
    state: 'staged-unregistered',
    reason: 'Coming-soon placeholder withheld from public discovery and AdSense review surface pending product completion',
  })),
});

// 3) Remove from public tool registry.
{
  const rel = 'tools/tools-index.json';
  const data = readJson(rel);
  data.items = data.items.filter((item) => !staged.has(item.slug));
  data.total = data.items.length;
  writeJson(rel, data);
}

// 4) Public spec manifest follows registered denominator.
{
  const rel = 'tools/tool-spec-manifest.json';
  const data = readJson(rel);
  data.items = data.items.filter((item) => !staged.has(item.slug));
  data.required_complete = data.items.length;
  data.complete = data.items.filter((item) => item.state === 'complete').length;
  data.pending = data.items.filter((item) => item.state !== 'complete').length;
  writeJson(rel, data);
}

// 5) Move public-facing documentation specs to staged docs.
fs.mkdirSync(p('docs/staged-tools'), { recursive: true });
for (const slug of staged) {
  const src = p(`docs/tools/${slug}.md`);
  const dst = p(`docs/staged-tools/${slug}.md`);
  if (fs.existsSync(src)) {
    let body = fs.readFileSync(src, 'utf8');
    const note = '> Publication status: `staged-unregistered`. This coming-soon route is intentionally excluded from the public tool registry and sitemap until the product is complete.\n\n';
    if (!body.includes('Publication status: `staged-unregistered`')) body = note + body;
    fs.writeFileSync(dst, body, 'utf8');
    fs.unlinkSync(src);
  }
}

// 6) Quality matrix follows the registered denominator.
{
  const rel = 'audits/tool-quality-matrix.json';
  const data = readJson(rel);
  data.records = data.records.filter((record) => !staged.has(record.slug));
  data.registered_tool_count = data.records.length;
  data.record_count = data.records.length;
  data.counts = {
    PASS: data.records.filter((r) => r.final_state === 'PASS').length,
    FIX: data.records.filter((r) => r.final_state === 'FIX').length,
    BLOCKED: data.records.filter((r) => r.final_state === 'BLOCKED').length,
    NEEDS_DECISION: data.records.filter((r) => r.final_state === 'NEEDS_DECISION').length,
  };
  writeJson(rel, data);

  const mdRel = 'audits/tool-quality-matrix.md';
  let md = read(mdRel);
  md = md.split('\n').filter((line) => ![...staged].some((slug) => line.includes(`](${`../docs/tools/${slug}.md`})`))).join('\n');
  md = md.replace(/- Registered tools: \*\*\d+\*\*/, `- Registered tools: **${data.records.length}**`);
  md = md.replace(/- Specifications: \*\*\d+\*\*/, `- Specifications: **${data.records.length}**`);
  md = md.replace(/- Matrix records: \*\*\d+\*\*/, `- Matrix records: **${data.records.length}**`);
  md = md.replace(/- PASS: \*\*\d+\*\*/, `- PASS: **${data.counts.PASS}**`);
  md = md.replace(/- FIX: \*\*\d+\*\*/, `- FIX: **${data.counts.FIX}**`);
  md = md.replace(/- BLOCKED: \*\*\d+\*\*/, `- BLOCKED: **${data.counts.BLOCKED}**`);
  md = md.replace(/- NEEDS_DECISION: \*\*\d+\*\*/, `- NEEDS_DECISION: **${data.counts.NEEDS_DECISION}**`);
  const behaviorMissing = data.records.filter((r) => r.functional_test_status === 'behavior-test-missing').length;
  md = md.replace(/- Behavior-level tests missing: \*\*\d+\*\*/, `- Behavior-level tests missing: **${behaviorMissing}**`);
  write(mdRel, md.endsWith('\n') ? md : md + '\n');
}

// 7) Monetization ledger follows registered denominator.
{
  const rel = 'MONETIZATION_CLASSIFICATION_87.json';
  const data = readJson(rel);
  for (const key of Object.keys(data.classes || {})) {
    data.classes[key] = data.classes[key].filter((slug) => !staged.has(slug));
    data.counts[key] = data.classes[key].length;
  }
  data.registryTotal = Object.values(data.classes).reduce((sum, values) => sum + values.length, 0);
  data.updated = '2026-09-14';
  writeJson(rel, data);

  const mdRel = 'MONETIZATION_CLASSIFICATION_87.md';
  let md = read(mdRel);
  md = md.split('\n').filter((line) => ![...staged].some((slug) => line.trim() === `- \`${slug}\``)).join('\n');
  const counts = data.counts;
  md = md.replace(/^# NicheWorks \d+-tool Monetization Classification/m, `# NicheWorks ${data.registryTotal}-tool Monetization Classification`);
  md = md.replace(/Status: \*\*canonical registered-tool monetization ledger\*\*/g, 'Status: **canonical registered-tool monetization ledger**');
  md = md.replace(/Updated: \d{4}-\d{2}-\d{2}/, 'Updated: 2026-09-14');
  md = md.replace(/\| `PRO_BUNDLE` \| \d+ \|/, `| \`PRO_BUNDLE\` | ${counts.PRO_BUNDLE} |`);
  md = md.replace(/\| `STANDALONE_PRO` \| \d+ \|/, `| \`STANDALONE_PRO\` | ${counts.STANDALONE_PRO} |`);
  md = md.replace(/\| `AFFILIATE` \| \d+ \|/, `| \`AFFILIATE\` | ${counts.AFFILIATE} |`);
  md = md.replace(/\| `ADS_DONATION` \| \d+ \|/, `| \`ADS_DONATION\` | ${counts.ADS_DONATION} |`);
  md = md.replace(/\| `FREE` \| \d+ \|/, `| \`FREE\` | ${counts.FREE} |`);
  md = md.replace(/\| `HOLD` \| \d+ \|/, `| \`HOLD\` | ${counts.HOLD} |`);
  md = md.replace(/\| \*\*Total\*\* \| \*\*\d+\*\* \|/, `| **Total** | **${data.registryTotal}** |`);
  md = md.replace(/## 7\. `HOLD` — \d+/, `## 7. \`HOLD\` — ${counts.HOLD}`);
  write(mdRel, md.endsWith('\n') ? md : md + '\n');
}

// 8) Make the two direct landing pages explicitly non-indexable.
for (const slug of staged) {
  const rel = `tools/${slug}/index.html`;
  let html = read(rel);
  const robotsTag = /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?\s*>/i;
  if (robotsTag.test(html)) {
    html = html.replace(robotsTag, '<meta name="robots" content="noindex,nofollow">');
  } else {
    html = html.replace('</head>', '  <meta name="robots" content="noindex,nofollow">\n</head>');
  }
  write(rel, html);
}

// 9) Remove the two routes from XML discovery, including nested URLs.
{
  const rel = 'sitemap.xml';
  let xml = read(rel);
  for (const slug of staged) {
    const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    xml = xml.replace(new RegExp(`\\s*<url>[\\s\\S]*?<loc>https:\\/\\/nicheworks\\.app\\/tools\\/${esc}\\/(?:[^<]*)?<\\/loc>[\\s\\S]*?<\\/url>`, 'g'), '');
  }
  write(rel, xml.endsWith('\n') ? xml : xml + '\n');
  if (fs.existsSync(p('sitemap.xml.gz'))) fs.writeFileSync(p('sitemap.xml.gz'), zlib.gzipSync(Buffer.from(xml, 'utf8')));
}

// 10) Remove public internal links to staged routes while leaving staged files themselves intact.
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}
for (const file of walk(root)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if ([...staged].some((slug) => rel.startsWith(`tools/${slug}/`))) continue;
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const slug of staged) {
    const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`\\s*<a\\b[^>]*href=["']\\/tools\\/${esc}\\/["'][^>]*>[\\s\\S]*?<\\/a>`, 'gi'), '');
  }
  if (html !== before) fs.writeFileSync(file, html, 'utf8');
}

// 11) Scrub discovery-oriented text manifests if they mention the staged slugs.
for (const rel of ['llms.txt', 'ai.txt']) {
  if (!fs.existsSync(p(rel))) continue;
  let text = read(rel);
  text = text.split('\n').filter((line) => ![...staged].some((slug) => line.includes(`/tools/${slug}/`) || line.includes(slug))).join('\n');
  write(rel, text.endsWith('\n') ? text : text + '\n');
}

// 12) Extend SEO public URL contract with a strict staged-route exception.
{
  const rel = 'scripts/check-seo-public-url-contract.mjs';
  let s = read(rel);
  s = replaceRequired(
    s,
    "const sitemapPath = path.join(root, 'sitemap.xml');\nconst errors = [];",
    "const sitemapPath = path.join(root, 'sitemap.xml');\nconst stagedToolsPath = path.join(toolsDir, 'staged-tools.json');\nconst errors = [];",
    `${rel}: staged path`,
  );
  s = replaceRequired(
    s,
    "const registry = readJson(indexPath);\nconst sitemap = readText(sitemapPath);\nconst items = Array.isArray(registry?.items) ? registry.items : [];",
    "const registry = readJson(indexPath);\nconst sitemap = readText(sitemapPath);\nconst stagedRegistry = fs.existsSync(stagedToolsPath) ? readJson(stagedToolsPath) : { items: [] };\nconst stagedItems = Array.isArray(stagedRegistry?.items) ? stagedRegistry.items : [];\nconst stagedSet = new Set(stagedItems.map((item) => item?.slug).filter(Boolean));\nconst items = Array.isArray(registry?.items) ? registry.items : [];",
    `${rel}: staged registry load`,
  );
  const oldBlock = `if (fs.existsSync(toolsDir)) {\n  for (const entry of fs.readdirSync(toolsDir, { withFileTypes: true })) {\n    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) continue;\n    const landing = path.join(toolsDir, entry.name, 'index.html');\n    if (fs.existsSync(landing) && !seen.has(entry.name)) fail(\`${'${entry.name}'}: public tool landing exists but slug is absent from tools/tools-index.json\`);\n  }\n}`;
  const newBlock = `if (fs.existsSync(toolsDir)) {\n  for (const entry of fs.readdirSync(toolsDir, { withFileTypes: true })) {\n    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) continue;\n    const landing = path.join(toolsDir, entry.name, 'index.html');\n    if (!fs.existsSync(landing) || seen.has(entry.name)) continue;\n    if (!stagedSet.has(entry.name)) {\n      fail(\`${'${entry.name}'}: public tool landing exists but slug is absent from tools/tools-index.json and tools/staged-tools.json\`);\n      continue;\n    }\n    const html = readText(landing);\n    const robotsValues = [...html.matchAll(/<meta\\b[^>]*>/gi)]\n      .map((match) => match[0])\n      .filter((tag) => tagAttr(tag, 'name').toLowerCase() === 'robots')\n      .map((tag) => tagAttr(tag, 'content').toLowerCase());\n    if (!robotsValues.some((value) => value.split(/[,\\s]+/).includes('noindex'))) {\n      fail(\`${'${entry.name}'}: staged landing must declare meta robots noindex\`);\n    }\n    const stagedUrl = toolPublicUrl(entry.name);\n    const sitemapCount = exactSitemapCount(sitemap, stagedUrl);\n    if (sitemapCount !== 0) fail(\`${'${entry.name}'}: staged landing must be absent from sitemap; found ${'${sitemapCount}'}\`);\n  }\n}\n\nfor (const stagedItem of stagedItems) {\n  const slug = stagedItem?.slug;\n  try { assertToolSlug(slug); } catch (error) { fail(\`tools/staged-tools.json: ${'${error.message}'}\`); continue; }\n  if (seen.has(slug)) fail(\`${'${slug}'}: slug cannot be both registered and staged\`);\n  const landing = path.join(toolsDir, slug, 'index.html');\n  if (!fs.existsSync(landing)) fail(\`${'${slug}'}: staged landing missing: tools/${'${slug}'}/index.html\`);\n}`;
  s = replaceRequired(s, oldBlock, newBlock, `${rel}: unregistered landing block`);
  write(rel, s);
}

// Final local invariants before workflow-level checks.
const registry = readJson('tools/tools-index.json');
if (registry.total !== 88) throw new Error(`expected 88 public tools after staging, got ${registry.total}`);
for (const slug of staged) {
  if (registry.items.some((item) => item.slug === slug)) throw new Error(`${slug} still registered`);
  if (read('sitemap.xml').includes(`/tools/${slug}/`)) throw new Error(`${slug} still in sitemap.xml`);
  const html = read(`tools/${slug}/index.html`);
  if (!/name=["']robots["'][^>]*content=["']noindex,nofollow["']/i.test(html)) throw new Error(`${slug} missing noindex,nofollow`);
}

console.log('Earth placeholder staging transform complete: 88 public tools; 2 staged-unregistered routes.');
