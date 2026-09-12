import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'tools', 'tools-index.json');
const manifestPath = path.join(root, 'tools', 'tool-spec-manifest.json');
const REQUIRED_HEADINGS = [
  'Purpose',
  'Current functional contract',
  'Inputs',
  'Outputs',
  'State and persistence',
  'Privacy and network behavior',
  'Language mode',
  'Layout class',
  'Limits and non-goals',
  'Acceptance criteria',
  'Implementation evidence',
];
const errors = [];

function fail(message) {
  errors.push(message);
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    fail(`cannot read ${path.relative(root, file)}: ${error.message}`);
    return '';
  }
}

function duplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}

const registry = readJson(registryPath, 'tools/tools-index.json');
const manifest = readJson(manifestPath, 'tools/tool-spec-manifest.json');

if (!registry || !manifest) {
  console.error(`Tool specification contract: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (!Array.isArray(registry.items)) fail('tools/tools-index.json: items must be an array');
if (!Array.isArray(manifest.items)) fail('tools/tool-spec-manifest.json: items must be an array');

const registryItems = Array.isArray(registry.items) ? registry.items : [];
const manifestItems = Array.isArray(manifest.items) ? manifest.items : [];
const registrySlugs = registryItems.map((item) => item?.slug).filter(Boolean);
const manifestSlugs = manifestItems.map((item) => item?.slug).filter(Boolean);

for (const slug of duplicates(registrySlugs)) fail(`registry duplicate slug: ${slug}`);
for (const slug of duplicates(manifestSlugs)) fail(`manifest duplicate slug: ${slug}`);

if (registry.total !== registryItems.length) {
  fail(`registry total mismatch: total=${registry.total}, items=${registryItems.length}`);
}
if (manifestItems.length !== registryItems.length) {
  fail(`manifest coverage mismatch: manifest=${manifestItems.length}, registry=${registryItems.length}`);
}

const registrySet = new Set(registrySlugs);
const manifestSet = new Set(manifestSlugs);
for (const slug of registrySlugs) {
  if (!manifestSet.has(slug)) fail(`manifest missing registered tool: ${slug}`);
}
for (const slug of manifestSlugs) {
  if (!registrySet.has(slug)) fail(`manifest contains unregistered tool: ${slug}`);
}

const allowedStates = new Set(['complete', 'pending']);
let completeCount = 0;
let pendingCount = 0;

for (const item of manifestItems) {
  const slug = item?.slug;
  if (!slug) {
    fail('manifest item missing slug');
    continue;
  }
  if (!allowedStates.has(item.state)) {
    fail(`${slug}: invalid state ${JSON.stringify(item.state)}`);
    continue;
  }

  const expectedSpec = `tools/${slug}/SPEC.md`;
  const specFile = path.join(root, expectedSpec);
  const specExists = fs.existsSync(specFile) && fs.statSync(specFile).isFile();

  if (item.state === 'pending') {
    pendingCount += 1;
    if (item.spec !== null) fail(`${slug}: pending item spec must be null`);
    if (specExists) fail(`${slug}: SPEC.md exists but manifest state is pending`);
    continue;
  }

  completeCount += 1;
  if (item.spec !== expectedSpec) {
    fail(`${slug}: complete spec path must be ${expectedSpec}`);
  }
  if (!specExists) {
    fail(`${slug}: complete spec missing at ${expectedSpec}`);
    continue;
  }

  const text = readText(specFile);
  const expectedUrl = `https://nicheworks.app/tools/${slug}/`;
  const slugLine = `- Slug: \`${slug}\``;
  const urlLine = `- Public URL: \`${expectedUrl}\``;
  const statusLine = '- Specification status: `complete`';
  const commonLine = '- Common specification: `common-spec/spec-ja.md`';

  if (!text.startsWith('# Tool Specification — ')) fail(`${slug}: missing standard H1`);
  if (!text.includes(slugLine)) fail(`${slug}: missing/mismatched slug identity line`);
  if (!text.includes(urlLine)) fail(`${slug}: missing/mismatched public URL identity line`);
  if (!text.includes(statusLine)) fail(`${slug}: missing complete status identity line`);
  if (!text.includes(commonLine)) fail(`${slug}: missing common specification identity line`);

  for (const heading of REQUIRED_HEADINGS) {
    const marker = `## ${heading}`;
    const matches = text.match(new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm')) || [];
    if (matches.length !== 1) {
      fail(`${slug}: expected exactly one heading ${marker}; found ${matches.length}`);
    }
  }

  const layoutMatch = text.match(/## Layout class\s+\n+`(mobile-oriented|pc-oriented|hybrid)`/m);
  if (!layoutMatch) fail(`${slug}: Layout class must start with one allowed class in backticks`);

  const langSection = text.split('## Language mode')[1]?.split('\n## ')[0] || '';
  const allowedLanguageModes = [
    'bilingual single-page',
    'separate JA/EN pages',
    'Japanese-only',
    'English-only',
    'mixed/reference-specific mode',
  ];
  if (!allowedLanguageModes.some((mode) => langSection.includes(`\`${mode}\``))) {
    fail(`${slug}: Language mode must declare one allowed mode in backticks`);
  }

  const acceptanceSection = text.split('## Acceptance criteria')[1]?.split('\n## ')[0] || '';
  const criteria = acceptanceSection.split('\n').filter((line) => /^\s*- \[[ x]\]/i.test(line));
  if (criteria.length < 3) fail(`${slug}: Acceptance criteria must contain at least 3 checklist items`);

  const evidenceSection = text.split('## Implementation evidence')[1] || '';
  if (!evidenceSection.includes(`tools/${slug}/`)) {
    fail(`${slug}: Implementation evidence must reference files under tools/${slug}/`);
  }
}

if (!Number.isInteger(manifest.required_complete) || manifest.required_complete < 0) {
  fail('manifest required_complete must be a non-negative integer');
} else if (completeCount < manifest.required_complete) {
  fail(`complete coverage below floor: complete=${completeCount}, required_complete=${manifest.required_complete}`);
}

if (manifest.complete !== completeCount) {
  fail(`manifest complete summary mismatch: declared=${manifest.complete}, actual=${completeCount}`);
}
if (manifest.pending !== pendingCount) {
  fail(`manifest pending summary mismatch: declared=${manifest.pending}, actual=${pendingCount}`);
}
if (completeCount + pendingCount !== manifestItems.length) {
  fail(`manifest state counts do not sum to items: complete=${completeCount}, pending=${pendingCount}, items=${manifestItems.length}`);
}

// Detect untracked registered SPEC.md files even if their manifest record is malformed.
for (const slug of registrySlugs) {
  const specFile = path.join(root, 'tools', slug, 'SPEC.md');
  if (!fs.existsSync(specFile)) continue;
  const manifestItem = manifestItems.find((item) => item?.slug === slug);
  if (!manifestItem || manifestItem.state !== 'complete') {
    fail(`${slug}: SPEC.md is not tracked as complete in manifest`);
  }
}

const summary = `${registryItems.length} registered / ${completeCount} complete / ${pendingCount} pending / floor ${manifest.required_complete}`;
if (errors.length) {
  console.error(`Tool specification contract: FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}; ${summary})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Tool specification contract: OK (${summary})`);
}
