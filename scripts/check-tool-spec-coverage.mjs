import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, 'tools/tools-index.json'), 'utf8'));
const specDirectory = path.join(root, 'docs/tools');
const requiredSections = [
  '1. Identity', '2. Purpose', '3. Inputs', '4. Processing behavior', '5. Outputs',
  '6. Error behavior', '7. Privacy/data handling', '8. Responsive contract',
  '9. Language contract', '10. SEO contract', '11. Advertising contract',
  '12. Donation/support contract', '13. Help/usage/FAQ contract',
  '14. Functional acceptance tests', '15. Explicit tool-specific exceptions',
];
const errors = [];
const duplicates = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

if (!Array.isArray(registry.items)) errors.push('registry.items must be an array');
const registryItems = Array.isArray(registry.items) ? registry.items : [];
const registrySlugs = registryItems.map((item) => item.slug);
if (registry.total !== registryItems.length) errors.push(`registry total ${registry.total} does not match ${registryItems.length} items`);
for (const slug of duplicates(registrySlugs)) errors.push(`duplicate registry slug: ${slug}`);

const specFiles = fs.readdirSync(specDirectory)
  .filter((name) => name.endsWith('.md') && name !== 'README.md')
  .sort();
const specSlugs = [];

for (const file of specFiles) {
  const filenameSlug = file.slice(0, -3);
  const text = fs.readFileSync(path.join(specDirectory, file), 'utf8');
  const identityMatches = [...text.matchAll(/^- \*\*Slug:\*\* `([^`]+)`$/gm)].map((match) => match[1]);
  if (identityMatches.length !== 1) {
    errors.push(`${file}: expected exactly one Slug identity; found ${identityMatches.length}`);
    continue;
  }
  const identitySlug = identityMatches[0];
  specSlugs.push(identitySlug);
  if (identitySlug !== filenameSlug) errors.push(`${file}: identity slug is ${identitySlug}`);
  for (const section of requiredSections) {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const count = (text.match(new RegExp(`^## ${escaped}$`, 'gm')) || []).length;
    if (count !== 1) errors.push(`${file}: expected one "## ${section}" section; found ${count}`);
  }
}

for (const slug of duplicates(specSlugs)) errors.push(`duplicate specification slug: ${slug}`);
const registrySet = new Set(registrySlugs);
const specSet = new Set(specSlugs);
for (const slug of registrySlugs) if (!specSet.has(slug)) errors.push(`registered tool lacks specification: ${slug}`);
for (const slug of specSlugs) if (!registrySet.has(slug)) errors.push(`specification is not registered: ${slug}`);
if (registryItems.length !== specFiles.length) errors.push(`count mismatch: registry=${registryItems.length}, specs=${specFiles.length}`);

if (errors.length) {
  console.error(`Tool spec coverage: FAIL (${errors.length} issues)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Tool spec coverage: OK (${registryItems.length} registered / ${specFiles.length} specifications)`);
}
