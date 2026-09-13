import fs from 'node:fs';

const monetizationDocs = [
  'docs/tools/ai-interaction-atlas.md',
  'docs/tools/api-key-token-redactor.md',
  'docs/tools/ats-paste-doctor.md',
  'docs/tools/contract-risk-highlighter.md',
  'docs/tools/incident-update-generator.md',
];

for (const path of monetizationDocs) {
  let text = fs.readFileSync(path, 'utf8');
  const start = text.indexOf('## 14. Monetization and entitlement contract');
  const next = text.indexOf('## 15. Functional acceptance tests', start);
  if (start < 0 || next < 0) throw new Error(`${path}: monetization/function sections not found`);

  const block = text
    .slice(start, next)
    .replace(/^## 14\. Monetization and entitlement contract/m, '### Monetization and entitlement contract')
    .trim();

  text = text.slice(0, start) + text.slice(next);
  text = text
    .replace('## 15. Functional acceptance tests', '## 14. Functional acceptance tests')
    .replace('## 16. Explicit tool-specific exceptions', '## 15. Explicit tool-specific exceptions');

  const evidence = text.indexOf('### Implementation evidence');
  if (evidence < 0) throw new Error(`${path}: implementation evidence anchor not found`);
  text = `${text.slice(0, evidence).trimEnd()}\n\n${block}\n\n${text.slice(evidence)}`;
  fs.writeFileSync(path, text);
}

for (const path of ['docs/tools/size-converter.md', 'docs/tools/tiny-audio-meter.md']) {
  let text = fs.readFileSync(path, 'utf8');
  const old = '## 11. Advertising / affiliate contract';
  if (!text.includes(old)) throw new Error(`${path}: combined advertising/affiliate heading not found`);
  text = text.replace(old, '## 11. Advertising contract\n\n### Affiliate contract');
  fs.writeFileSync(path, text);
}

console.log('Canonical 15-section numbering restored for 7 specifications.');
