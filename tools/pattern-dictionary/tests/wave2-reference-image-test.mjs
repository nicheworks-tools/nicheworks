import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const source=read('data/wave2-source-verification.json');
const manifest=read('data/wave2-reference-images.json');
const review=read('data/wave2-reference-image-review.json');
const published=read('data/patterns.json');
const generator=fs.readFileSync(path.join(root,'scripts','generate-reference-images-wave2.py'),'utf8');

function pngSize(buf){
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  if(!buf.subarray(0,8).equals(sig))throw new Error('not PNG');
  if(buf.subarray(12,16).toString('ascii')!=='IHDR')throw new Error('missing IHDR');
  return [buf.readUInt32BE(16),buf.readUInt32BE(20)];
}

if(![20,40].includes(published.length))throw new Error(`unexpected runtime count ${published.length}`);
if(manifest.wave!==2||manifest.publication_state!=='staged-not-public'||manifest.status!=='structural-review-complete')throw new Error('Wave 2 image manifest must remain immutable reviewed provenance');
if(manifest.images.length!==20)throw new Error(`expected 20 Wave 2 image records, got ${manifest.images.length}`);
if(review.scope!=='wave2-21-40'||review.publication_state!=='staged-not-public'||review.records.length!==20)throw new Error('Wave 2 review ledger contract invalid');
if(!review.review_history?.includes('Buffalo Check')||!review.review_history?.includes('Diamond Pattern'))throw new Error('review history must preserve the rejected-first-pass regeneration record');

const sourceById=Object.fromEntries(source.patterns.map(x=>[x.pattern_id,x]));
const manifestById=Object.fromEntries(manifest.images.map(x=>[x.pattern_id,x]));
const reviewById=Object.fromEntries(review.records.map(x=>[x.pattern_id,x]));
if(Object.keys(manifestById).length!==20||Object.keys(reviewById).length!==20)throw new Error('duplicate Wave 2 image/review ids');
const ordered=source.patterns.slice().sort((a,b)=>a.ordinal-b.ordinal);
if(ordered.length!==20)throw new Error(`expected 20 Wave 2 source rows, got ${ordered.length}`);

for(let i=0;i<20;i++){
  const src=ordered[i],id=src.pattern_id,ordinal=i+21;
  const image=manifestById[id],verdict=reviewById[id];
  if(src.ordinal!==ordinal)throw new Error(`${id}: source ordinal mismatch`);
  if(!image||!verdict)throw new Error(`${id}: missing manifest or review row`);
  if(image.ordinal!==ordinal)throw new Error(`${id}: image ordinal mismatch`);
  if(image.review_state!=='reviewed')throw new Error(`${id}: staged image provenance must remain reviewed`);
  if(verdict.decision!=='pass'||!verdict.note?.trim())throw new Error(`${id}: passing visual review with note required`);
  if(!image.representation_scope?.trim())throw new Error(`${id}: representation_scope required`);
  if(image.has_text||image.is_mockup||!image.multiple_repeats)throw new Error(`${id}: image policy flags invalid`);
  if(!image.path.endsWith(`/${id}.png`))throw new Error(`${id}: path mismatch ${image.path}`);
  const file=path.join(root,image.path);
  if(!fs.existsSync(file))throw new Error(`${id}: missing ${image.path}`);
  const [w,h]=pngSize(fs.readFileSync(file));
  if(w!==1536||h!==1536)throw new Error(`${id}: ${w}x${h}, expected 1536x1536`);
  if(!generator.includes(`'${id}'`))throw new Error(`${id}: deterministic generator mapping missing`);
  if(src.verification_state==='qualified'&&!image.representation_scope.includes('representative'))throw new Error(`${id}: qualified term must use an explicitly representative image scope`);
  if(published.length===40&&!published.some(x=>x.id===id))throw new Error(`${id}: published runtime missing Wave 2 image row`);
}

for(const id of ['buffalo-check','shepherd-check','gun-club-check','diamond'])if(!reviewById[id].note.includes('Regenerated after review'))throw new Error(`${id}: regeneration history must remain explicit`);

console.log(`OK: Wave 2 preserves 20/20 deterministic 1536x1536 reviewed PNG provenance with qualified scopes and regeneration history; runtime state ${published.length}.`);
