#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const fail=msg=>{throw new Error(msg)};
const qualified=new Set(['ogee','basketweave','toile-de-jouy','chintz','jacobean-floral','botanical-print','ivy']);

const source=read('data/wave3-source-verification.json');
const prod=read('data/wave3-production-content.json');
const search=read('data/wave3-search-dictionary.json');
const compare=read('data/wave3-compare-guides.json');
const refs=read('data/wave3-reference-images.json');
const review=read('data/wave3-reference-image-review.json');
const cases=read('tests/wave3-search-cases.json');
const runtime=read('data/patterns.json');

if(runtime.length!==40)fail(`Wave 3 staging must not publish runtime records; expected 40, got ${runtime.length}`);
for(const [name,obj,key] of [['source',source,'patterns'],['production',prod,'patterns'],['reference',refs,'images'],['review',review,'records']]){
  if(!Array.isArray(obj[key])||obj[key].length!==20)fail(`${name} must contain exactly 20 Wave 3 records`);
}
const ids=source.patterns.slice().sort((a,b)=>a.ordinal-b.ordinal).map(x=>x.pattern_id);
const ords=source.patterns.slice().sort((a,b)=>a.ordinal-b.ordinal).map(x=>x.ordinal);
if(JSON.stringify(ords)!==JSON.stringify(Array.from({length:20},(_,i)=>41+i)))fail('Wave 3 ordinals must be exactly 41..60');
for(const id of ids){
  if(!prod.patterns.some(x=>x.pattern_id===id))fail(`${id}: missing production record`);
  if(!refs.images.some(x=>x.pattern_id===id&&x.review_state==='reviewed'))fail(`${id}: missing reviewed reference image ledger entry`);
  if(!review.records.some(x=>x.pattern_id===id&&x.status==='accepted'))fail(`${id}: missing accepted visual review`);
  const image=path.join(root,'assets','reference',`${id}.png`);
  if(!fs.existsSync(image))fail(`${id}: reference PNG missing`);
  const buf=fs.readFileSync(image);
  if(buf.length<24||buf.toString('hex',0,8)!=='89504e470d0a1a0a')fail(`${id}: not a PNG`);
  if(buf.readUInt32BE(16)!==1536||buf.readUInt32BE(20)!==1536)fail(`${id}: PNG must be 1536x1536`);
}
const actualQualified=new Set(source.patterns.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id));
if(actualQualified.size!==qualified.size||[...qualified].some(x=>!actualQualified.has(x)))fail(`qualified set mismatch: ${[...actualQualified].join(',')}`);
for(const p of prod.patterns){
  if(!Array.isArray(p.commerce_intents)||p.commerce_intents.length!==3)fail(`${p.pattern_id}: expected exactly 3 fixed commerce intents`);
  if(!p.definition?.ja||!p.definition?.en)fail(`${p.pattern_id}: bilingual definition missing`);
  if(!p.search_terms?.ja?.length||!p.search_terms?.en?.length)fail(`${p.pattern_id}: bilingual search terms missing`);
  for(const rel of [...(p.relationships?.similar||[]),...(p.relationships?.often_confused_with||[])]){
    const canonical=runtime.some(x=>x.id===rel)||ids.includes(rel);
    if(!canonical)fail(`${p.pattern_id}: relationship target not in published 40 or Wave 3: ${rel}`);
  }
}
if(compare.guides?.length!==17)fail(`expected 17 staged compare guides, got ${compare.guides?.length}`);
for(const g of compare.guides){
  if(!g.id||!g.left||!g.right||!g.summary?.ja||!g.summary?.en||!g.decisive_cue?.ja||!g.decisive_cue?.en)fail(`invalid compare guide ${g.id}`);
}
if(cases.length<40)fail('expected at least one JA+EN search case per Wave 3 pattern');
for(const c of cases){
  if(!['ja','en'].includes(c.lang)||!c.query||!c.top1)fail('invalid search case');
}
if(!search.ja||!search.en)fail('staged search dictionary must have ja/en maps');
const commerceCount=prod.patterns.reduce((n,p)=>n+p.commerce_intents.length,0);
if(commerceCount!==60)fail(`expected 60 commerce intents, got ${commerceCount}`);

console.log(`Wave 3 staging OK: ${ids.length} patterns, ${compare.guides.length} compare guides, ${cases.length} search cases, ${commerceCount} fixed commerce intents, 20 reviewed PNGs; runtime remains ${runtime.length}.`);
