import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const tools = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];

function localPath(fromHtml, value) {
  const clean = value.split(/[?#]/, 1)[0];
  if (!clean || /^(?:https?:)?\/\//.test(clean) || clean.startsWith('data:')) return null;
  if (clean.startsWith('/')) return path.join(root, clean.slice(1));
  return path.resolve(path.dirname(fromHtml), clean);
}

for (const slug of tools) {
  const toolDir = path.join(root, 'tools', slug);
  const indexPath = path.join(toolDir, 'index.html');
  const specPath = path.join(toolDir, 'SPEC.md');

  check(fs.existsSync(indexPath), `${slug}: index.html missing`);
  check(fs.existsSync(specPath), `${slug}: SPEC.md missing`);
  if (!fs.existsSync(indexPath) || !fs.existsSync(specPath)) continue;

  const html = fs.readFileSync(indexPath, 'utf8');
  const spec = fs.readFileSync(specPath, 'utf8');

  check(spec.includes('Specification status: `complete`'), `${slug}: specification status is not complete`);
  const unchecked = spec.split(/\r?\n/).filter((line) => line.includes('- [ ]'));
  check(unchecked.length === 0, `${slug}: unchecked acceptance criteria remain: ${JSON.stringify(unchecked)}`);

  const refs = [
    ...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi),
    ...html.matchAll(/<link\b[^>]*\brel=["'][^"']*stylesheet[^"']*["'][^>]*\bhref=["']([^"']+)["']/gi)
  ].map((match) => match[1]);

  for (const ref of refs) {
    const resolved = localPath(indexPath, ref);
    if (resolved) check(fs.existsSync(resolved), `${slug}: missing local runtime asset ${ref}`);
  }

  const localScripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .map((ref) => ({ ref, resolved: localPath(indexPath, ref) }))
    .filter(({ resolved }) => resolved && resolved.startsWith(toolDir + path.sep) && fs.existsSync(resolved));

  for (const { ref, resolved } of localScripts) {
    const source = fs.readFileSync(resolved, 'utf8');
    check(!/fetch\s*\(\s*["']https?:\/\//i.test(source), `${slug}: tool-local script fetches an external URL directly (${ref})`);
    check(!/\bXMLHttpRequest\b/.test(source), `${slug}: tool-local XMLHttpRequest found (${ref})`);
    check(!/\bWebSocket\s*\(/.test(source), `${slug}: tool-local WebSocket found (${ref})`);
    check(!/navigator\.sendBeacon\s*\(/.test(source), `${slug}: tool-local sendBeacon found (${ref})`);
  }
}

const referenceHtml = read('tools/old-kanji-reference/index.html');
const referenceSpec = read('tools/old-kanji-reference/SPEC.md');
const referenceCss = read('tools/old-kanji-reference/style.css');

check(referenceHtml.includes('./app-meaning-v4.js'), 'Reference must load app-meaning-v4.js');
check(!referenceHtml.includes('./app-meaning.js'), 'Reference must not load removed app-meaning.js');
check(!referenceHtml.includes('./app-meaning-v3.js'), 'Reference must not load removed app-meaning-v3.js');
check(!fs.existsSync(path.join(root, 'tools/old-kanji-reference/app-meaning.js')), 'removed Reference app-meaning.js returned');
check(!fs.existsSync(path.join(root, 'tools/old-kanji-reference/app-meaning-v3.js')), 'removed Reference app-meaning-v3.js returned');

check(referenceHtml.includes('出力（現在は無料）'), 'Reference JP Free export copy missing');
check(referenceHtml.includes('Export (currently free)'), 'Reference EN Free export copy missing');
check(referenceHtml.includes('戸籍・公的書類の正式表記は実際の登録字体を確認してください。'), 'Reference official-spelling caution missing');
check(referenceHtml.includes('確認できた根拠のない別字'), 'Reference evidence-boundary FAQ caution missing');
check(referenceCss.includes('.shape-note-grid') && referenceCss.includes('.stroke-note-grid'), 'Reference shape/stroke detail layout styling missing');
check(referenceCss.includes('.shape-note-grid,\n  .stroke-note-grid { grid-template-columns: 1fr; }'), 'Reference mobile shape/stroke layout rule missing');

const releaseEvidence = [
  'scripts/run-tool-behavior-tests.mjs',
  'scripts/check-old-kanji-browser-ux.mjs',
  'scripts/check-old-kanji-reference-layout.mjs',
  'scripts/check-old-kanji-cluster-contract.mjs',
  'scripts/check-old-kanji-reference-seo.mjs',
  'scripts/check-old-kanji-search-cluster.mjs',
  'scripts/check-old-kanji-seo-inventory-gate.mjs',
  'scripts/check-old-kanji-internal-handoffs.mjs',
  'scripts/check-old-kanji-measurement.mjs',
  'scripts/check-old-kanji-amazon.mjs',
  'scripts/check-old-kanji-pro-boundary.mjs',
  'scripts/build-old-kanji-dictionary-audit.mjs'
];
for (const rel of releaseEvidence) check(fs.existsSync(path.join(root, rel)), `release evidence missing: ${rel}`);

const audit = JSON.parse(read('tools/old-kanji-reference/dictionary-audit.json'));
check(audit.summary?.issueRecords === 0, 'dictionary audit has blocking issue records');
check(audit.summary?.conflictingRawDuplicateKeys === 0, 'dictionary audit has conflicting raw duplicate keys');

const completion = read('tools/OLD_KANJI_COMPLETION_AUDIT.md');
check(completion.includes('### Wave 18 — SEO inventory final gate\nStatus: **completed**.'), 'Wave 18 completion evidence missing');
check(referenceSpec.includes('scripts/check-old-kanji-release-audit.mjs'), 'Reference SPEC must cite final release audit for non-authority caution');

if (failures.length) {
  console.error(`Old Kanji final release audit failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji final release audit passed: 8 complete SPECs, 0 unchecked criteria, current Reference runtime only, local asset/privacy boundaries intact.');
