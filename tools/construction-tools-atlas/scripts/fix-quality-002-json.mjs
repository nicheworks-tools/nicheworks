import fs from 'node:fs';

const file = new URL('../data/tools.quality-002.json', import.meta.url);
const before = fs.readFileSync(file, 'utf8');
const boundaryRepairs = [
  [/("summary_en":"(?:\\.|[^"\\])*")\},"detail_ja"/g, '$1,"detail_ja"'],
  [/("detail_en":"(?:\\.|[^"\\])*")\},"bullets_ja"/g, '$1,"bullets_ja"'],
];

let after = before;
for (const [pattern, replacement] of boundaryRepairs) {
  after = after.replace(pattern, replacement);
}

if (after === before) {
  throw new Error('Expected malformed field boundaries were not found.');
}

JSON.parse(after);
fs.writeFileSync(file, after, 'utf8');
console.log('Repaired tools.quality-002.json.');
