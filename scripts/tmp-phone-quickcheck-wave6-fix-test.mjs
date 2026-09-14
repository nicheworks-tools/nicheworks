import fs from 'node:fs';
const path = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let text = fs.readFileSync(path, 'utf8');
const broken = "  assert.match(html, /Adaptive Fast Charging / QC2\\.0/);";
const fixed = "  assert.ok(html.includes('Adaptive Fast Charging / QC2.0'));";
if (!text.includes(broken)) throw new Error('wave 6 broken regression line not found');
text = text.replace(broken, fixed);
fs.writeFileSync(path, text);
console.log('Fixed wave 6 regression syntax.');
