import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const canonical=read('data/canonical-100-expansion.json');
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

const frozen=canonical.entries.filter(x=>x.wave===2).sort((a,b)=>a.ordinal-b.ordinal);
if(frozen.length!==20)throw new Error(`expected 20 frozen Wave 2 records, got ${frozen.length}`);
if(published.length!==20)throw new Error(`Reference image staging must not publish Wave 2; runtime has ${published.length}`);
if(manifest.wave!==2||manifest.publication_state!=='staged-not-public'||manifest.status!=='structural-review-complete')throw new Error('Wave 2 image manifest must remain reviewed but staged-not-public');
if(manifest.images.length!==20)throw new Error(`expected 20 Wave 2 image records, got ${manifest.images.length}`);
if(review.scope!=='wave2-21-40'||review.publication_state!=='staged-not-public'||review.records.length!==20)throw new Error('Wave 2 review ledger contract invalid');
if(!review.review_history?.includes('Buffalo Check')||!review.review_history?.includes('Diamond Pattern'))throw new Error('review history must preserve the rejected-first-pass regeneration record');

const sourceById=Object.fromEntries(source.patterns.map(x=>[x.pattern_id,x]));
const manifestById=Object.fromEntries(manifest.images.map(x=>[x.pattern_id,x]));
const reviewById=Object.fromEntries(review.records.map(x=>[x.pattern_id,x]));
if(Object.keys(manifestById).length!==20||Object.keys(reviewById).length!==20)throw new Error('duplicate Wave 2 image/review ids');

for(const f of frozen){
  const image=manifestById[f.id];
  const verdict=reviewById[f.id];
  const src=sourceById[f.id];
  if(!image||!verdict||!src)throw new Error(`${f.id}: missing manifest, review, or source row`);
  if(image.ordinal!==f.ordinal)throw new Error(`${f.id}: ordinal mismatch`);
  if(image.review_state!=='reviewed')throw new Error(`${f.id}: image must be reviewed`);
  if(verdict.decision!=='pass'||!verdict.note?.trim())throw new Error(`${f.id}: passing visual review with note required`);
  if(!image.representation_scope?.trim())throw new Error(`${f.id}: representation_scope required`);
  if(image.has_text||image.is_mockup||!image.multiple_repeats)throw new Error(`${f.id}: image policy flags invalid`);
  if(!image.path.endsWith(`/${f.id}.png`))throw new Error(`${f.id}: path mismatch ${image.path}`);
  const file=path.join(root,image.path);
  if(!fs.existsSync(file))throw new Error(`${f.id}: missing ${image.path}`);
  const [w,h]=pngSize(fs.readFileSync(file));
  if(w!==1536||h!==1536)throw new Error(`${f.id}: ${w}x${h}, expected 1536x1536`);
  if(!generator.includes(`'${f.id}'`))throw new Error(`${f.id}: deterministic generator mapping missing`);
  if(src.verification_state==='qualified'&&!image.representation_scope.includes('representative'))throw new Error(`${f.id}: qualified term must use an explicitly representative image scope`);
}

for(const id of ['buffalo-check','shepherd-check','gun-club-check','diamond']){
  if(!reviewById[id].note.includes('Regenerated after review'))throw new Error(`${id}: regeneration history must remain explicit`);
}

console.log('OK: Wave 2 has 20/20 deterministic 1536x1536 reviewed PNG references, qualified-term scopes stay representative, rejected first-pass images are documented, and runtime remains 20.');
