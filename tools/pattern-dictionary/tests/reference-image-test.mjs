import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data/patterns.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/reference-images.json'),'utf8'));
const review=JSON.parse(fs.readFileSync(path.join(root,'data/reference-image-review.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');

function pngSize(buf){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  if(!buf.subarray(0,8).equals(sig))throw new Error('not PNG');
  if(buf.subarray(12,16).toString('ascii')!=='IHDR')throw new Error('missing IHDR');
  return [buf.readUInt32BE(16),buf.readUInt32BE(20)];
}
const ids=patterns.map(x=>x.id).sort();
const images=manifest.images||[],records=review.records||[];
if(patterns.length!==100)throw new Error(`runtime must contain 100 patterns, got ${patterns.length}`);
if(manifest.status!=='verified-publication')throw new Error(`reference image manifest must be verified-publication, got ${manifest.status}`);
if(images.length!==100||records.length!==100)throw new Error(`expected 100 image/review records, got ${images.length}/${records.length}`);
if(JSON.stringify(images.map(x=>x.pattern_id).sort())!==JSON.stringify(ids))throw new Error('reference image IDs must exactly match runtime 100');
if(JSON.stringify(records.map(x=>x.pattern_id).sort())!==JSON.stringify(ids))throw new Error('reference review IDs must exactly match runtime 100');
const byId=Object.fromEntries(images.map(x=>[x.pattern_id,x]));
const reviewById=Object.fromEntries(records.map(x=>[x.pattern_id,x]));
for(const id of ids){
  const image=byId[id],verdict=reviewById[id];
  if(image.review_state!=='verified')throw new Error(`${id}: reference image must be verified`);
  if(!['pass','pass-after-accuracy-correction'].includes(verdict.decision)||!verdict.note?.trim())throw new Error(`${id}: passing review note required`);
  if(verdict.decision==='pass-after-accuracy-correction'&&!verdict.accuracy_audit)throw new Error(`${id}: corrected review must carry accuracy_audit marker`);
  if(image.has_text||image.is_mockup||!image.multiple_repeats)throw new Error(`${id}: image policy flags invalid`);
  const file=path.join(root,image.path);if(!fs.existsSync(file))throw new Error(`${id}: missing ${image.path}`);
  const [w,h]=pngSize(fs.readFileSync(file));if(w!==1536||h!==1536)throw new Error(`${id}: ${w}x${h}, expected 1536x1536`);
  if(!app.includes(`'${id}'`))throw new Error(`${id}: runtime Reference Image allowlist missing`);
}
console.log('OK: 100/100 published patterns have verified deterministic 1536x1536 Reference Images and passing review records.');
