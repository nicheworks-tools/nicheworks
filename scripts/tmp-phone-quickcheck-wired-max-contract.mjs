import fs from 'node:fs';

function replaceExact(path, from, to) {
  const text = fs.readFileSync(path, 'utf8');
  if (!text.includes(from)) throw new Error(`${path}: expected text not found`);
  fs.writeFileSync(path, text.replace(from, to));
}

replaceExact(
  'tools/phone-quickcheck/app.js',
`  function sourceBackedMaxWired(phone) {
    const explicit = numberOrNull(phone.charging?.wiredMaxW);
    if (explicit) return explicit;
    const manufacturer = String(phone.manufacturer || '').toLowerCase();
    if (manufacturer === 'samsung' || manufacturer === 'sharp') {
      return numberOrNull(phone.charging?.wiredRecommendedW);
    }
    return null;
  }
`,
`  function sourceBackedMaxWired(phone) {
    return numberOrNull(phone.charging?.wiredMaxW);
  }
`);

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
const behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = `// Foldable schema renders both physical states and keeps folded dimensions in the list.\n`;
if (!behavior.includes(marker)) throw new Error('foldable behavior marker missing');
const contractTest = `// Charger guidance must never be promoted to a handset-side wired maximum without wiredMaxW.\n{\n  const h = await createHarness(['synthetic-foldable']);\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /充電器目安<\\/span><b>25W\\+/);\n  assert.doesNotMatch(html, /端末側の有線充電上限<\\/span><b>25W/);\n}\n\n`;
fs.writeFileSync(behaviorPath, behavior.replace(marker, contractTest + marker));

console.log('Applied strict Phone QuickCheck wiredMaxW contract patch.');
