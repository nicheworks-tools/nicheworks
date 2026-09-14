import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const canonical = ['houndstooth','gingham','tartan','glen-check','argyle','chevron','polka-dot','moroccan-trellis','seigaiha','asanoha','shippo','ichimatsu','kikko','karakusa','damask','arabesque','paisley','leopard-print','ikat','kilim'];
const expected = new Set(canonical);
const manifest = JSON.parse(fs.readFileSync(path.join(root,'data','reference-images.json'),'utf8'));
const prod = JSON.parse(fs.readFileSync(path.join(root,'data','production-content.json'),'utf8'));
const review = JSON.parse(fs.readFileSync(path.join(root,'data','reference-image-review.json'),'utf8'));
const app = fs.readFileSync(path.join(root,'app.js'),'utf8');
const order = ['draft','researched','image_ready','reviewed','verified','published'];

function pngSize(buf) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  if (!buf.subarray(0,8).equals(sig)) throw new Error('not PNG');
  if (buf.subarray(12,16).toString('ascii') !== 'IHDR') throw new Error('missing IHDR');
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

if (!['candidates-complete','structural-review-complete','verified-publication'].includes(manifest.status)) throw new Error(`unexpected manifest status ${manifest.status}`);
if (manifest.images.length !== expected.size) throw new Error(`expected 20 manifest images, got ${manifest.images.length}`);
if (review.records.length !== canonical.length) throw new Error(`expected 20 visual-review records, got ${review.records.length}`);
const reviewById = Object.fromEntries(review.records.map(x => [x.pattern_id,x]));
for (const image of manifest.images) {
  if (!expected.delete(image.pattern_id)) throw new Error(`unexpected/duplicate pattern ${image.pattern_id}`);
  if (order.indexOf(image.review_state) < order.indexOf('image_ready')) throw new Error(`${image.pattern_id}: state must be image_ready or later`);
  if (!image.representation_scope) throw new Error(`${image.pattern_id}: missing representation_scope`);
  if (image.has_text || image.is_mockup || !image.multiple_repeats) throw new Error(`${image.pattern_id}: image policy flags invalid`);
  const file = path.join(root, image.path);
  if (!fs.existsSync(file)) throw new Error(`${image.pattern_id}: missing ${image.path}`);
  const [w,h] = pngSize(fs.readFileSync(file));
  if (w !== 1536 || h !== 1536) throw new Error(`${image.pattern_id}: ${w}x${h}, expected 1536x1536`);
  const record = prod.patterns.find(x => x.pattern_id === image.pattern_id);
  if (!record || order.indexOf(record.review_state) < order.indexOf('image_ready')) throw new Error(`${image.pattern_id}: production-content must be image_ready or later`);
  if (['reviewed','verified','published'].includes(image.review_state) && reviewById[image.pattern_id]?.decision !== 'pass') throw new Error(`${image.pattern_id}: reviewed state requires a passing structural review record`);
}
if (expected.size) throw new Error(`missing expected images: ${[...expected].join(', ')}`);
if (new Set(review.records.map(x => x.pattern_id)).size !== canonical.length) throw new Error('visual-review ledger has duplicate or missing ids');
for (const id of canonical) if (!reviewById[id]) throw new Error(`visual-review ledger missing ${id}`);
const runtimeIds = app.match(/const REFERENCE_IDS=new Set\(\[(.*?)\]\);/s)?.[1] || '';
for (const id of canonical) if (!runtimeIds.includes(`'${id}'`)) throw new Error(`app.js REFERENCE_IDS missing ${id}`);
if (!app.includes("assets/reference/")) throw new Error('app.js missing reference image path');
console.log(`OK: 20/20 Reference Images are 1536x1536 PNG, image_ready-or-later, structurally reviewed for reviewed-or-later states, and runtime-wired.`);
