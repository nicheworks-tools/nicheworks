import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const lock = read('tools/OLD_KANJI_COMPLETION_LOCK.md');
const audit = read('tools/OLD_KANJI_COMPLETION_AUDIT.md');
const release = read('tools/OLD_KANJI_RELEASE_AUDIT.md');

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

check(lock.includes('Status: maintenance / measurement mode'), 'completion lock status must remain maintenance / measurement mode');
check(lock.includes('447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3'), 'audited Wave 19 release baseline changed or missing');
check(lock.includes('individual-kanji public inventory: 3 reviewed pages'), 'locked three-page inventory statement missing');
check(lock.includes('repository-side SEO candidates: 168 candidates, not publication inventory'), 'locked SEO-candidate boundary missing');
check(lock.includes('## Reopen triggers'), 'reopen triggers missing');
check(lock.includes('## Maintenance rules'), 'maintenance rules missing');
check(lock.includes('fresh settled search-demand evidence'), 'SEO expansion demand gate missing');

check(audit.includes('Status: completion locked; maintenance / measurement mode.'), 'completion audit is not locked');
check(audit.includes('### Wave 20 — Completion lock\nStatus: **completed**.'), 'Wave 20 is not marked completed');
check(audit.includes('Further feature, monetization, data-authority, or SEO expansion requires an explicit reopen trigger'), 'completion decision does not enforce reopen rule');
check(release.includes('no known release blocker remains within the current product contract'), 'Wave 19 release-readiness evidence missing');

for (const slug of tools) {
  const spec = read(`tools/${slug}/SPEC.md`);
  check(spec.includes('Specification status: `complete`'), `${slug}: specification status is not complete`);
  const unchecked = spec.split(/\r?\n/).filter((line) => line.includes('- [ ]'));
  check(unchecked.length === 0, `${slug}: unchecked acceptance criteria returned`);
}

for (const required of [
  'scripts/check-old-kanji-release-audit.mjs',
  'scripts/check-old-kanji-seo-inventory-gate.mjs',
  'scripts/check-old-kanji-search-cluster.mjs',
  'scripts/check-old-kanji-measurement.mjs',
  'scripts/check-old-kanji-browser-ux.mjs'
]) check(fs.existsSync(path.join(root, required)), `completion evidence missing: ${required}`);

if (failures.length) {
  console.error(`Old Kanji completion lock failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Old Kanji completion lock passed: 8-tool current contract locked to maintenance / measurement mode.');
