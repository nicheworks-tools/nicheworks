import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const expected = new Set(['houndstooth','gingham','tartan','glen-check','argyle','chevron','polka-dot','moroccan-trellis','seigaiha','asanoha','shippo','ichimatsu','kikko']);
const manifest = JSON.parse(fs.readFileSync(path.join(root,'data','reference-images.json'),'utf8'));
const prod = JSON.parse(fs.readFileSync(path.join(root,'data','production-content.json'),'utf8'));
const app = fs.readFileSync(path.join(root,'app.js'),'utf8');

function pngSize(buf) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  if (!buf.subarray(0,8).equals(sig)) throw new Error('not PNG');
  if (buf.subarray(12,16).toString('ascii') !== 'IHDR') throw new Error('missing IHDR');
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

if (manifest.images.length !== expected.size) throw new Error(`expected 13 manifest images, got ${manifest.images.length}`);
for (const image of manifest.images) {
  if (!expected.delete(image.pattern_id)) throw new Error(`unexpected/duplicate pattern ${image.pattern_id}`);
  if (image.review_state !== 'image_ready') throw new Error(`${image.pattern_id}: state must be image_ready`);
  if (image.has_text || image.is_mockup || !image.multiple_repeats) throw new Error(`${image.pattern_id}: image policy flags invalid`);
  const file = path.join(root, image.path);
  if (!fs.existsSync(file)) throw new Error(`${image.pattern_id}: missing ${image.path}`);
  const [w,h] = pngSize(fs.readFileSync(file));
  if (w !== 1536 || h !== 1536) throw new Error(`${image.pattern_id}: ${w}x${h}, expected 1536x1536`);
  const record = prod.patterns.find(x => x.pattern_id === image.pattern_id);
  if (!record || record.review_state !== 'image_ready') throw new Error(`${image.pattern_id}: production-content must be image_ready`);
}
if (expected.size) throw new Error(`missing expected images: ${[...expected].join(', ')}`);
if (!app.includes('REFERENCE_IDS')) throw new Error('app.js missing REFERENCE_IDS runtime contract');
if (!app.includes("assets/reference/")) throw new Error('app.js missing reference image path');
console.log('OK: 13/13 deterministic Reference Image candidates are 1536x1536 PNG, image_ready, and runtime-wired.');
