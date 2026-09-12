import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fix = process.argv.includes('--fix');
const failures = [];
const hardGapText = 'Mandatory common-spec donation/support block is missing.';
const targets = [
  'ats-paste-doctor',
  'message-generator',
  'old-document-kanji-highlighter',
  'old-kanji-ocr-scanner',
  'place-old-kanji-checker',
  'unicode-kanji-checker',
  'url-title-collector',
  'variant-kanji-compare',
];

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const write = (rel, content) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
};
const check = (condition, message) => { if (!condition) failures.push(message); };

const supportCss = `.nw-donate {\n  margin: 32px 0 24px;\n  padding: 16px;\n  border: 1px solid #e5e7eb;\n  border-radius: 12px;\n  background: #fff;\n}\n.nw-donate-text {\n  margin: 0 0 10px;\n  color: #4b5563;\n  font-size: 0.9rem;\n  line-height: 1.6;\n}\n.nw-donate-links {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n}\n.nw-donate-links a {\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 8px 12px;\n  border: 1px solid #d1d5db;\n  border-radius: 999px;\n  color: inherit;\n  background: #fff;\n  text-decoration: none;\n}\n.nw-donate-links a:hover,\n.nw-donate-links a:focus-visible {\n  background: #f7f7f7;\n  text-decoration: underline;\n}\n@media (max-width: 480px) {\n  .nw-donate-links { flex-direction: column; }\n  .nw-donate-links a { justify-content: center; width: 100%; }\n}\n`;

function supportMarkup(language = 'bilingual') {
  const text = language === 'en'
    ? 'If this tool helps, you can support ongoing NicheWorks development.'
    : language === 'ja'
      ? 'このツールが役に立ったら、NicheWorks の開発継続をご支援いただけます。'
      : 'このツールが役に立ったら、NicheWorks の開発継続をご支援いただけます。 / If this tool helps, you can support ongoing NicheWorks development.';
  return `\n    <section class="nw-donate" aria-label="Support NicheWorks">\n      <p class="nw-donate-text">${text}</p>\n      <div class="nw-donate-links">\n        <a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a>\n        <a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a>\n      </div>\n    </section>\n`;
}

function applySupport(rel, language = 'bilingual') {
  check(exists(rel), `${rel}: missing page`);
  if (!exists(rel)) return;
  let html = read(rel);
  const hasOfuse = html.includes('https://ofuse.me/nicheworks');
  const hasKofi = html.includes('https://ko-fi.com/nicheworks');
  if (hasOfuse !== hasKofi) throw new Error(`${rel}: partial support block exists; refusing automatic repair`);
  if (!html.includes('/assets/nw-support.css')) {
    check(html.includes('</head>'), `${rel}: missing </head>`);
    html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/nw-support.css">\n</head>');
  }
  if (!hasOfuse && !hasKofi) {
    if (html.includes('</main>')) html = html.replace('</main>', `${supportMarkup(language)}  </main>`);
    else if (html.includes('<footer')) html = html.replace('<footer', `${supportMarkup(language)}  <footer`);
    else if (html.includes('</body>')) html = html.replace('</body>', `${supportMarkup(language)}</body>`);
    else throw new Error(`${rel}: no safe footer-near insertion point`);
  }
  write(rel, html);
}

function updateCanonicalDoc(slug) {
  const rel = `docs/tools/${slug}.md`;
  check(exists(rel), `${rel}: missing canonical audit record`);
  if (!exists(rel)) return;
  let text = read(rel);
  text = text.replace('- **Audit state:** `FIX`', '- **Audit state:** `PASS`');
  const section = `## 12. Donation/support contract\n\nFollow common-spec sections 6 and 9-4. Current main-page donation/support evidence: **present**. Preserve the footer-near OFUSE + Ko-fi support block and shared support styling unless the suite contract intentionally changes.\n\n`;
  const replaced = text.replace(/## 12\. Donation\/support contract[\s\S]*?(?=## 13\.)/, section);
  check(replaced !== text || text.includes('Current main-page donation/support evidence: **present**'), `${rel}: donation section not found`);
  text = replaced;
  write(rel, text);
}

function updateMatrixJson() {
  const rel = 'audits/tool-quality-matrix.json';
  const matrix = JSON.parse(read(rel));
  for (const slug of targets) {
    const record = matrix.records.find((item) => item.slug === slug);
    if (!record) throw new Error(`${rel}: missing ${slug}`);
    record.donation_status = 'present';
    record.common_spec_compliance = 'no-hard-gap-found';
    record.hard_compliance_gaps = (record.hard_compliance_gaps || []).filter((item) => item !== hardGapText && !/donation\/support block is missing/i.test(item));
    record.obvious_broken_or_incomplete_behavior = (record.obvious_broken_or_incomplete_behavior || []).filter((item) => item !== hardGapText && !/donation\/support block is missing/i.test(item));
    record.outstanding_issues = (record.outstanding_issues || []).filter((item) => item !== hardGapText && !/donation\/support block is missing/i.test(item));
    if (!record.implementation_exists) record.final_state = 'BLOCKED';
    else if ((record.decision_gaps || []).length) record.final_state = 'NEEDS_DECISION';
    else if (record.hard_compliance_gaps.length) record.final_state = 'FIX';
    else record.final_state = 'PASS';
  }
  const counts = { PASS: 0, FIX: 0, BLOCKED: 0, NEEDS_DECISION: 0 };
  for (const record of matrix.records) counts[record.final_state] += 1;
  matrix.counts = counts;
  write(rel, `${JSON.stringify(matrix, null, 2)}\n`);
  return matrix;
}

function updateMatrixMd(matrix) {
  const rel = 'audits/tool-quality-matrix.md';
  let md = read(rel);
  for (const [state, count] of Object.entries(matrix.counts)) {
    md = md.replace(new RegExp(`- ${state}: \\*\\*\\d+\\*\\*`), `- ${state}: **${count}**`);
  }
  for (const slug of targets) {
    const record = matrix.records.find((item) => item.slug === slug);
    const row = `| [${slug}](../docs/tools/${slug}.md) | ${record.layout_class} | ${record.usage_status} | ${record.faq_status} | ${record.functional_test_status} | ${record.hard_compliance_gaps.length} | ${record.decision_gaps.length} | **${record.final_state}** |`;
    const lines = md.split('\n');
    const index = lines.findIndex((line) => line.startsWith(`| [${slug}](`));
    if (index < 0) throw new Error(`${rel}: row missing for ${slug}`);
    lines[index] = row;
    md = lines.join('\n');
  }
  md = md.replace(/## Recalculated Wave 1 recommendation[\s\S]*$/,
`## Wave 1 hard-gap status\n\nThe mandatory donation/support shared-root-cause repair is complete for: ${targets.map((slug) => `\`${slug}\``).join(', ')}. Their recommendation-only usage/FAQ/test gaps remain visible, but the support-block defect no longer forces \\`FIX\\`. Current matrix state after this repair: **${matrix.counts.PASS} PASS / ${matrix.counts.FIX} FIX / ${matrix.counts.BLOCKED} BLOCKED / ${matrix.counts.NEEDS_DECISION} NEEDS_DECISION**.\n`);
  write(rel, md);
}

function verify() {
  check(exists('assets/nw-support.css'), 'assets/nw-support.css: missing');
  if (exists('assets/nw-support.css')) {
    const css = read('assets/nw-support.css');
    check(css.includes('.nw-donate-links'), 'assets/nw-support.css: missing support-link styling');
  }
  const pages = targets.map((slug) => [`tools/${slug}/index.html`, 'bilingual']);
  if (exists('tools/url-title-collector/en/index.html')) pages.push(['tools/url-title-collector/en/index.html', 'en']);
  for (const [rel] of pages) {
    check(exists(rel), `${rel}: missing`);
    if (!exists(rel)) continue;
    const html = read(rel);
    check(html.includes('/assets/nw-support.css'), `${rel}: shared support CSS not loaded`);
    check(html.includes('https://ofuse.me/nicheworks'), `${rel}: OFUSE missing`);
    check(html.includes('https://ko-fi.com/nicheworks'), `${rel}: Ko-fi missing`);
  }
  const matrix = JSON.parse(read('audits/tool-quality-matrix.json'));
  const recalculated = { PASS: 0, FIX: 0, BLOCKED: 0, NEEDS_DECISION: 0 };
  for (const record of matrix.records) recalculated[record.final_state] += 1;
  check(JSON.stringify(recalculated) === JSON.stringify(matrix.counts), 'quality matrix: declared counts do not match records');
  for (const slug of targets) {
    const record = matrix.records.find((item) => item.slug === slug);
    check(Boolean(record), `quality matrix: missing ${slug}`);
    if (!record) continue;
    check(record.donation_status === 'present', `quality matrix: ${slug} donation_status not present`);
    check(record.final_state === 'PASS', `quality matrix: ${slug} not PASS`);
    check((record.hard_compliance_gaps || []).length === 0, `quality matrix: ${slug} still has hard gap`);
    const doc = read(`docs/tools/${slug}.md`);
    check(doc.includes('- **Audit state:** `PASS`'), `${slug} canonical doc: audit state not PASS`);
    check(doc.includes('Current main-page donation/support evidence: **present**'), `${slug} canonical doc: support evidence not present`);
  }
  const md = read('audits/tool-quality-matrix.md');
  for (const slug of targets) check(md.includes(`| [${slug}](../docs/tools/${slug}.md)`) && md.includes(`| **PASS** |`), `${slug}: human matrix row missing`);
}

if (fix) {
  write('assets/nw-support.css', supportCss);
  for (const slug of targets) applySupport(`tools/${slug}/index.html`, 'bilingual');
  if (exists('tools/url-title-collector/en/index.html')) applySupport('tools/url-title-collector/en/index.html', 'en');
  for (const slug of targets) updateCanonicalDoc(slug);
  const matrix = updateMatrixJson();
  updateMatrixMd(matrix);
}

verify();

if (failures.length) {
  console.error(`Common support contract: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Common support contract OK for ${targets.length} repaired tools${fix ? ' (fix applied)' : ''}.`);
