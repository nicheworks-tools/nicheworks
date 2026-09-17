#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');

const patterns=read('data/patterns.json');
const refs=read('data/reference-images.json');
const review=read('data/reference-image-review.json');
const source=read('data/source-verification.json');
const sourceById=new Map(source.patterns.map(x=>[x.pattern_id,x]));

const corrected={
  'shepherd-check': ['deterministic fine grouped black/white shepherd-check with woven crossing cue','scripts/generate-reference-images-audit-fixes.py'],
  'glen-check': ['deterministic compound fine grouped Glen check with larger framing divisions','scripts/generate-reference-images-audit-fixes.py'],
  'prince-of-wales-check': ['deterministic compound Glen-check field with contrasting burgundy windowpane overcheck','scripts/generate-reference-images-audit-fixes.py'],
  'gun-club-check': ['deterministic fine multi-tone cream/brown/black district-check weave','scripts/generate-reference-images-audit-fixes.py'],
  'herringbone': ['deterministic reversing diagonal twill columns forming continuous herringbone V bands','scripts/generate-reference-images-audit-fixes.py'],
  'kagome': ['deterministic three-direction basket-weave strip-edge lattice forming kagome basket-eye geometry','scripts/generate-reference-images-audit-fixes.py'],
  'same-komon': ['deterministic fine dotted nested semicircular fans representing Same Komon sharkskin structure','scripts/generate-reference-images-audit-fixes-v2.py'],
  'tomoe': ['deterministic three comma-shaped tomoe with round heads and curved tapering tails','scripts/generate-reference-images-audit-fixes.py'],
  'fleur-de-lis': ['deterministic bold heraldic three-petal fleur-de-lis silhouette with waist band and lower flare','scripts/generate-reference-images-audit-fixes-v2.py'],
  'marbling': ['deterministic multi-vortex fluid-vein field representing marbled flow rather than regular stripes','scripts/generate-reference-images-audit-fixes.py'],
  'sayagata': ['deterministic interlocking manji/key-fret units on a diagonal lattice','scripts/generate-reference-images-audit-fixes.py'],
  'giraffe-print': ['deterministic irregular polygonal giraffe patches separated by pale channels','scripts/generate-reference-images-audit-fixes.py'],
  'zebra-print': ['deterministic tapered irregular branching zebra stripes','scripts/generate-reference-images-audit-fixes.py'],
};

for(const rec of refs.images){
  if(!corrected[rec.pattern_id]) continue;
  const [method,generator]=corrected[rec.pattern_id];
  rec.method=method;
  rec.generator=generator;
  rec.accuracy_audit='corrected-2026-09-17';
}
refs.updated='2026-09-17';
refs.policy.accuracy_audit='data/reference-image-accuracy-audit.json';
refs.policy.verification_rule='verified images passed source/content contract checks, visual structural review, canonical-100 accuracy audit, search/compare regressions, and desktop/mobile Chromium publication QA';
write('data/reference-images.json',refs);

for(const rec of review.records){
  if(!corrected[rec.pattern_id]) continue;
  rec.decision='pass-after-accuracy-correction';
  rec.accuracy_audit='2026-09-17';
  rec.note=`Re-audited against the term/source structure after canonical-100 publication; the previous render was replaced because it could misstate or weaken the recognition structure. ${corrected[rec.pattern_id][0]}.`;
}
review.updated='2026-09-17';
review.review_type='visual-structural-recognition-and-accuracy-review';
review.decision_rule='Pass only when the image is recognizable at browse-card scale, materially matches the documented recognition structure, distinguishes common confusions, and does not overclaim a unique canonical motif for broad terms.';
write('data/reference-image-review.json',review);

const ids=patterns.map(x=>x.id);
if(ids.length!==100 || new Set(ids).size!==100) throw new Error(`Expected 100 unique runtime IDs, got ${ids.length}/${new Set(ids).size}`);
const records=ids.map((id,index)=>{
  const s=sourceById.get(id);
  if(!s) throw new Error(`Missing source verification for ${id}`);
  const isCorrected=Boolean(corrected[id]);
  return {
    ordinal:index+1,
    pattern_id:id,
    source_state:s.verification_state,
    decision:isCorrected?'corrected':(s.verification_state==='qualified'?'representative-accepted':'accepted'),
    review_basis:isCorrected
      ?'source-ledger structure + generator-code audit + canonical contact-sheet visual review + corrected render review'
      :(s.verification_state==='qualified'
        ?'source-ledger scope + generator-code audit + canonical contact-sheet visual review; image accepted only as a representative recognition reference'
        :'source-ledger structure + generator-code audit + canonical contact-sheet visual review'),
    corrected_generator:isCorrected?corrected[id][1]:null
  };
});
const audit={
  schema_version:1,
  updated:'2026-09-17',
  scope:'canonical-100',
  status:'complete',
  policy:{
    purpose:'Accuracy audit of the published recognition-reference images after visual errors were found in the canonical-100 set.',
    accepted_meaning:'The deterministic render materially matches the documented recognition structure at dictionary/browse scale; it is not a claim that all real-world examples look identical.',
    representative_accepted_meaning:'For qualified technique/style/tradition/material terms, the image is a defensible representative recognition cue only, not one universal canonical motif.',
    corrected_meaning:'The prior published render was judged capable of misleading recognition and was replaced during this audit.',
    correction_generator:'scripts/generate-reference-images-audit-fixes.py with v2 overrides for Same Komon and Fleur-de-lis'
  },
  counts:{
    total:records.length,
    corrected:records.filter(x=>x.decision==='corrected').length,
    representative_accepted:records.filter(x=>x.decision==='representative-accepted').length,
    accepted:records.filter(x=>x.decision==='accepted').length,
    unresolved:0
  },
  records
};
write('data/reference-image-accuracy-audit.json',audit);
console.log(`accuracy audit: ${audit.counts.total} total, ${audit.counts.corrected} corrected, ${audit.counts.representative_accepted} representative, ${audit.counts.accepted} accepted`);
