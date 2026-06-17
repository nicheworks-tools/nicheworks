import fs from 'node:fs';

const file = new URL('../data/tools.quality-002.json', import.meta.url);
const before = fs.readFileSync(file, 'utf8');
const pattern = /("detail_en":"(?:\\.|[^"\\])*")\},"bullets_ja"/g;
const after = before.replace(pattern, '$1,"bullets_ja"');

if (after === before) {
  throw new Error('Expected malformed detail_en boundary was not found.');
}

JSON.parse(after);
fs.writeFileSync(file, after, 'utf8');
console.log('Repaired tools.quality-002.json.');
