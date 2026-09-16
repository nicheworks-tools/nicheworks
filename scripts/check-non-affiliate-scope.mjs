import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const registry = readJson('tools/tools-index.json');
const classification = readJson('MONETIZATION_CLASSIFICATION.json');
const scope = readJson('audits/non-affiliate-scope.json');

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const sameSet = (a, b) => {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
};

const duplicates = (items) => {
  const seen = new Set();
  const dupes = new Set();
  for (const item of items) {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  }
  return [...dupes].sort();
};

const registrySlugs = registry.items.map((item) => item.slug);
const registrySet = new Set(registrySlugs);

if (registry.total !== registrySlugs.length) {
  fail(`tools-index total=${registry.total} but items=${registrySlugs.length}`);
}
if (duplicates(registrySlugs).length) {
  fail(`duplicate registry slugs: ${duplicates(registrySlugs).join(', ')}`);
}
if (classification.registryTotal !== registry.total) {
  fail(`classification registryTotal=${classification.registryTotal} but registry total=${registry.total}`);
}

const classNames = Object.keys(classification.classes);
const classifiedSlugs = [];
for (const className of classNames) {
  const slugs = classification.classes[className];
  const expected = classification.counts[className];
  if (!Array.isArray(slugs)) fail(`classification class ${className} is not an array`);
  if (expected !== slugs.length) {
    fail(`classification ${className} count=${expected} but list=${slugs.length}`);
  }
  classifiedSlugs.push(...slugs);
}

const classifiedDupes = duplicates(classifiedSlugs);
if (classifiedDupes.length) {
  fail(`tools classified more than once: ${classifiedDupes.join(', ')}`);
}
const classifiedSet = new Set(classifiedSlugs);
if (!sameSet(classifiedSet, registrySet)) {
  const missing = registrySlugs.filter((slug) => !classifiedSet.has(slug));
  const extra = classifiedSlugs.filter((slug) => !registrySet.has(slug));
  fail(`classification does not equal registry; missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`);
}

if (scope.registryTotal !== registry.total) {
  fail(`scope registryTotal=${scope.registryTotal} but registry total=${registry.total}`);
}
if (scope.excludedClass !== 'AFFILIATE') {
  fail(`scope excludedClass must be AFFILIATE, got ${scope.excludedClass}`);
}

const affiliate = classification.classes.AFFILIATE ?? [];
const affiliateSet = new Set(affiliate);
if (scope.excludedCount !== affiliate.length) {
  fail(`scope excludedCount=${scope.excludedCount} but AFFILIATE count=${affiliate.length}`);
}
if (!sameSet(new Set(scope.excludedAffiliateSlugs), affiliateSet)) {
  fail('scope excludedAffiliateSlugs does not exactly match classification AFFILIATE');
}

const scopeClassNames = Object.keys(scope.classes);
const inScope = [];
for (const className of scopeClassNames) {
  const slugs = scope.classes[className];
  if (!classification.classes[className]) {
    fail(`scope references unknown classification class ${className}`);
    continue;
  }
  if (scope.counts[className] !== slugs.length) {
    fail(`scope ${className} count=${scope.counts[className]} but list=${slugs.length}`);
  }
  if (!sameSet(new Set(slugs), new Set(classification.classes[className]))) {
    fail(`scope ${className} does not exactly match classification ${className}`);
  }
  inScope.push(...slugs);
}

const scopeDupes = duplicates(inScope);
if (scopeDupes.length) {
  fail(`duplicate in-scope slugs: ${scopeDupes.join(', ')}`);
}
if (scope.inScopeCount !== inScope.length) {
  fail(`scope inScopeCount=${scope.inScopeCount} but flattened list=${inScope.length}`);
}

const expectedInScope = registrySlugs.filter((slug) => !affiliateSet.has(slug));
if (!sameSet(new Set(inScope), new Set(expectedInScope))) {
  const inScopeSet = new Set(inScope);
  const missing = expectedInScope.filter((slug) => !inScopeSet.has(slug));
  const extra = inScope.filter((slug) => !registrySet.has(slug) || affiliateSet.has(slug));
  fail(`non-affiliate scope mismatch; missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`);
}

if (!process.exitCode) {
  console.log(`PASS: registry=${registry.total}, affiliate=${affiliate.length}, non-affiliate=${inScope.length}`);
}
