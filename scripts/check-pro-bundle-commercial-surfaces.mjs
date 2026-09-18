import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const classificationPath = path.join(root, 'MONETIZATION_CLASSIFICATION.json');
const classification = JSON.parse(fs.readFileSync(classificationPath, 'utf8'));

if (classification.bundleBoundaryStatus !== 'pending-freeze') {
  console.log(`PRO_BUNDLE commercial scan skipped: bundleBoundaryStatus=${classification.bundleBoundaryStatus}`);
  process.exit(0);
}

const slugs = classification.classes?.PRO_BUNDLE;
if (!Array.isArray(slugs) || slugs.length !== classification.counts?.PRO_BUNDLE) {
  console.error('PRO_BUNDLE commercial scan: canonical class/count mismatch');
  process.exit(1);
}

const runtimeExtensions = new Set(['.html', '.js', '.mjs', '.cjs', '.json']);
const ignoredNames = new Set(['SPEC.md', 'README.md', 'package-lock.json', 'package.json']);
const ignoredSegments = new Set(['tests', 'test', '__tests__', 'docs', 'fixtures', 'snapshots', 'node_modules']);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredSegments.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (!ignoredNames.has(entry.name) && runtimeExtensions.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const findings = [];
function add(slug, file, rule, detail) {
  findings.push({ slug, file: path.relative(root, file).replaceAll(path.sep, '/'), rule, detail });
}

const directStripe = /https:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]+/gi;
const offerSchema = /["']@type["']\s*:\s*["']Offer["']/gi;
const oldFixedPrice = /(?:\$\s*2\.99\b|USD\s*2\.99\b|2\.99\s*USD\b)/gi;
const commercialContext = /(?:pro|stripe|purchase|checkout|unlock|paid|payment|buy|購入|有料|決済|解除)/i;
const positivePurchaseClaims = [
  /after purchase[^.\n]{0,180}(?:pro|unlock|enabled|active)/gi,
  /purchase[^.\n]{0,140}(?:activates?|enables?|unlocks?)\s+(?:nicheworks\s+)?pro/gi,
  /unlock\s+(?:nicheworks\s+)?pro/gi,
  /buy\s+(?:nicheworks\s+)?pro/gi,
  /購入後[^。\n]{0,180}(?:pro|有効|解除)/g,
  /(?:nicheworks\s*)?proを購入/g,
  /購入[^。\n]{0,100}(?:pro|解除|有効)/g
];
const dormantContext = /(?:purchase unavailable|no new purchase link|not live|not available for purchase|購入不可|購入リンク.{0,20}(?:提供していません|ありません)|本番化されていません|廃止|historical|legacy evidence)/i;

for (const slug of slugs) {
  const toolDir = path.join(root, 'tools', slug);
  if (!fs.existsSync(toolDir)) {
    add(slug, toolDir, 'missing_tool_dir', 'Canonical PRO_BUNDLE tool directory is missing.');
    continue;
  }

  for (const file of walk(toolDir)) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }

    for (const match of text.matchAll(directStripe)) add(slug, file, 'direct_stripe', match[0]);
    for (const match of text.matchAll(offerSchema)) add(slug, file, 'offer_schema', match[0]);

    if (commercialContext.test(text)) {
      for (const match of text.matchAll(oldFixedPrice)) add(slug, file, 'legacy_fixed_price', match[0]);
    }

    if (!dormantContext.test(text)) {
      for (const pattern of positivePurchaseClaims) {
        for (const match of text.matchAll(pattern)) {
          add(slug, file, 'purchase_unlock_claim', match[0].replace(/\s+/g, ' ').slice(0, 220));
        }
      }
    }
  }
}

if (findings.length) {
  console.error(`PRO_BUNDLE commercial surface scan failed: ${findings.length} finding(s) across ${new Set(findings.map((x) => x.slug)).size} tool(s).`);
  const grouped = new Map();
  for (const finding of findings) {
    if (!grouped.has(finding.slug)) grouped.set(finding.slug, []);
    grouped.get(finding.slug).push(finding);
  }
  for (const slug of [...grouped.keys()].sort()) {
    console.error(`\n[${slug}]`);
    for (const finding of grouped.get(slug)) console.error(`- ${finding.rule}: ${finding.file} :: ${finding.detail}`);
  }
  process.exit(1);
}

console.log(`PRO_BUNDLE commercial surface scan passed for all ${slugs.length} canonical tools while bundleBoundaryStatus=pending-freeze.`);
