import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));

const lock = json('tools/old-kanji-completion-lock.json');
const audit = json('tools/old-kanji-reference/dictionary-audit.json');
const monetization = json('MONETIZATION_CLASSIFICATION.json');
const completion = read('tools/OLD_KANJI_COMPLETION_AUDIT.md');
const lockDoc = read('tools/OLD_KANJI_COMPLETION_LOCK.md');

const expectedBaseline = '447c1beb0e5490b5dfc8b45a2a9a4afb0d7122d3';
const expectedScope = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];
const expectedSeo = ['ga-kaku', 'sho-shou', 'kyu-old'].sort();

check(lock.schemaVersion === 'old-kanji-completion-lock-v1', 'completion lock schema version mismatch');
check(lock.mode === 'maintenance_measurement', 'completion lock mode must be maintenance_measurement');
check(lock.releaseCodeBaselineSha === expectedBaseline, 'release code baseline SHA drifted');
check(JSON.stringify([...lock.scope].sort()) === JSON.stringify([...expectedScope].sort()), 'locked eight-tool scope drifted');

for (const slug of expectedScope) {
  const spec = read(`tools/${slug}/SPEC.md`);
  check(spec.includes('Specification status: `complete`'), `${slug}: SPEC is not complete`);
  check(!spec.includes('- [ ]'), `${slug}: unchecked acceptance criterion returned after completion lock`);
}

const s = audit.summary || {};
const ls = lock.dictionarySnapshot || {};
for (const [key, expected] of Object.entries({
  canonicalOldToNewRecords: 356,
  rawOldToNewEntries: 364,
  rawDuplicateKeys: 8,
  conflictingRawDuplicateKeys: 0,
  metadataDuplicateKeys: 61,
  reverseIssues: 35,
  issueRecords: 0,
  seoCandidates: 168
})) {
  check(s[key] === expected, `dictionary audit ${key} drifted: ${s[key]} !== ${expected}`);
  check(ls[key] === expected, `lock manifest ${key} mismatch: ${ls[key]} !== ${expected}`);
}
for (const [key, expected] of Object.entries({
  old_to_modern: 165,
  variant: 3,
  compatibility: 22,
  identity: 115,
  unresolved: 51
})) {
  check(s.classes?.[key] === expected, `dictionary class ${key} drifted`);
  check(ls.classes?.[key] === expected, `lock class ${key} mismatch`);
}
check(audit.version === lock.dictionarySnapshot.auditVersion, 'dictionary audit version differs from completion lock');

const kanjiDir = path.join(root, 'tools/old-kanji-reference/kanji');
const actualSeo = fs.readdirSync(kanjiDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(kanjiDir, entry.name, 'index.html')))
  .map((entry) => entry.name)
  .sort();
check(JSON.stringify(actualSeo) === JSON.stringify(expectedSeo), `published individual-page inventory drifted: ${JSON.stringify(actualSeo)}`);
check(lock.seoInventory?.publishedIndividualPages === 3, 'lock manifest published page count must remain 3');
check(JSON.stringify([...(lock.seoInventory?.allowlist || [])].sort()) === JSON.stringify(expectedSeo), 'lock manifest SEO allowlist drifted');
check(lock.seoInventory?.repositoryCandidates === 168, 'lock manifest repository candidate count drifted');

const classes = monetization.classes || {};
check(classes.ADS_DONATION?.includes('old-kanji-reference'), 'Reference canonical monetization class is no longer ADS_DONATION');
check(classes.HOLD?.includes('old-kanji-ocr-scanner'), 'OCR canonical monetization class is no longer HOLD');
check(!classes.AFFILIATE?.includes('old-kanji-reference'), 'Reference unexpectedly entered AFFILIATE class');
check(!classes.AFFILIATE?.includes('old-kanji-ocr-scanner'), 'OCR unexpectedly entered AFFILIATE class');
check(lock.monetization?.oldKanjiReference === 'ADS_DONATION', 'lock manifest Reference monetization mismatch');
check(lock.monetization?.oldKanjiOcrScanner === 'HOLD', 'lock manifest OCR monetization mismatch');
check(lock.monetization?.affiliateRuntimeEnabled === false, 'lock manifest affiliate runtime must remain disabled');

for (const rel of ['tools/old-kanji-reference/affiliate-config.js','tools/old-kanji-ocr-scanner/affiliate-config.js']) {
  const source = read(rel);
  check(/enabled:\s*false/.test(source), `${rel}: affiliate runtime became enabled`);
  check(/trackingId:\s*["']["']/.test(source), `${rel}: tracking ID is no longer empty`);
}

for (const rel of [
  'tools/OLD_KANJI_RELEASE_AUDIT.md',
  'tools/OLD_KANJI_SEO_INVENTORY_GATE.md',
  'scripts/check-old-kanji-release-audit.mjs',
  'scripts/check-old-kanji-seo-inventory-gate.mjs',
  'scripts/check-old-kanji-browser-ux.mjs'
]) {
  check(fs.existsSync(path.join(root, rel)), `locked release evidence missing: ${rel}`);
}

check(completion.startsWith('# Old Kanji Completion Audit\n\nStatus: completion locked; maintenance / measurement mode.'), 'Completion Audit is not in locked maintenance mode');
check(completion.includes('### Wave 20 — Completion lock\nStatus: **completed**.'), 'Wave 20 completion record missing');
check(completion.includes('No Completion Wave 21 is scheduled.'), 'completion sequence must terminate at Wave 20');
check(completion.includes(expectedBaseline), 'Completion Audit does not record release baseline SHA');

for (const phrase of [
  'maintenance / measurement mode',
  'release code baseline',
  'Reopen triggers',
  'settled Search Console demand',
  'No Completion Wave 21'
]) {
  check(lockDoc.includes(phrase), `completion lock document missing: ${phrase}`);
}

check(Array.isArray(lock.knownLimitations) && lock.knownLimitations.length >= 5, 'known limitations are not locked');
check(Array.isArray(lock.reopenTriggers) && lock.reopenTriggers.length >= 6, 'reopen triggers are not locked');

if (failures.length) {
  console.error(`Old Kanji completion lock failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Old Kanji completion lock passed: release baseline ${expectedBaseline}, 8 tools, 3 individual pages, 168 repository candidates, maintenance/measurement mode.`);
