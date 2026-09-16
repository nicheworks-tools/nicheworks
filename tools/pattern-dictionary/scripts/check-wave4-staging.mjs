#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const fail=msg=>{throw new Error(msg)};
const runtime=read('data/patterns.json');
const canonical=read('data/canonical-100-expansion.json');
const source=read('data/wave4-source-verification.json');
const prod=read('data/wave4-production-content.json');
const search=read('data/wave4-search-dictionary.json');
const compare=read('data/wave4-compare-guides.json');
const refs=read('data/wave4-reference-images.json');
const review=read('data/wave4-reference-image-review.json');
const cases=read('tests/wave4-search-cases.json');
if(runtime.length!==60)fail(`Wave 4 staging must keep runtime at 60, got ${runtime.length}`);
for(const [name,obj,key] of [['source',source,'patterns'],['production',prod,'patterns'],['reference',refs,'images'],['review',review,'records']])if(!Array.isArray(obj[key])||obj[key].length!==20)fail(`${name} must contain exactly 20 Wave 4 records`);
const rows=[...source.patterns].sort((a,b)=>a.ordinal-b.ordinal);
const ids=rows.map(x=>x.pattern_id); const ords=rows.map(x=>x.ordinal);
if(JSON.stringify(ords)!==JSON.stringify(Array.from({length:20},(_,i)=>61+i)))fail('Wave 4 ordinals must be exactly 61..80');
const expectedQualified=['ajrakh','bandhani','baroque-scroll','batik','chinoiserie','flame-stitch','kalamkari','kanoko','moire','same-komon','shibori'].sort();
const actualQualified=rows.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
if(JSON.stringify(actualQualified)!==JSON.stringify(expectedQualified))fail(`qualified set mismatch: ${actualQualified.join(', ')}`);
const allCanonical=new Set([...runtime.map(x=>x.id),...ids,...(canonical.entries||[]).map(x=>x.id)]);
for(const id of ids){
 const p=prod.patterns.find(x=>x.pattern_id===id); if(!p)fail(`${id}: missing production record`);
 if(!p.definition?.ja||!p.definition?.en)fail(`${id}: bilingual definition missing`);
 if(!p.distinguishing_features?.ja?.length||!p.distinguishing_features?.en?.length)fail(`${id}: bilingual distinguishing features missing`);
 if(!p.common_uses?.ja?.length||!p.common_uses?.en?.length)fail(`${id}: bilingual common uses missing`);
 if(p.common_uses.en.some(x=>/[ぁ-んァ-ヶ一-龯]/.test(x)))fail(`${id}: untranslated English common use`);
 if(!p.search_terms?.ja?.length||!p.search_terms?.en?.length)fail(`${id}: bilingual search terms missing`);
 if(!Array.isArray(p.commerce_intents)||p.commerce_intents.length!==3)fail(`${id}: expected exactly 3 fixed commerce intents`);
 for(const rel of [...(p.relationships?.similar||[]),...(p.relationships?.often_confused_with||[])])if(!allCanonical.has(rel))fail(`${id}: relationship target outside canonical 100: ${rel}`);
 const img=refs.images.find(x=>x.pattern_id===id); if(!img||img.review_state!=='reviewed')fail(`${id}: reference image not marked reviewed`);
 const rr=review.records.find(x=>x.pattern_id===id); if(!rr||rr.status!=='accepted')fail(`${id}: structural visual review not accepted`);
 const file=path.join(root,'assets','reference',`${id}.png`); if(!fs.existsSync(file))fail(`${id}: reference PNG missing`);
 const buf=fs.readFileSync(file); if(buf.length<24||buf.toString('hex',0,8)!=='89504e470d0a1a0a')fail(`${id}: not a PNG`);
 if(buf.readUInt32BE(16)!==1536||buf.readUInt32BE(20)!==1536)fail(`${id}: PNG must be exactly 1536x1536`);
}
if(compare.guides?.length!==23)fail(`expected 23 staged compare guides, got ${compare.guides?.length}`);
for(const g of compare.guides){if(!g.id||!g.left||!g.right||!g.summary?.ja||!g.summary?.en||!g.decisive_cue?.ja||!g.decisive_cue?.en)fail(`invalid compare guide ${g.id}`);if(!allCanonical.has(g.left)||!allCanonical.has(g.right))fail(`${g.id}: compare target outside canonical 100`);}
if(cases.length!==66)fail(`expected exactly 66 Wave 4 search cases, got ${cases.length}`);
for(const c of cases)if(!['ja','en'].includes(c.lang)||!c.query||!c.top1||!ids.includes(c.top1))fail(`invalid Wave 4 search case: ${JSON.stringify(c)}`);
if(!search.ja||!search.en)fail('staged search dictionary must have ja/en maps');
const commerceCount=prod.patterns.reduce((n,p)=>n+p.commerce_intents.length,0); if(commerceCount!==60)fail(`expected 60 commerce intents, got ${commerceCount}`);
if(review.status!=='structural-review-complete')fail(`review ledger status must be structural-review-complete, got ${review.status}`);
console.log(`Wave 4 staging OK: 20 patterns, 23 compare guides, 66 search cases, 60 fixed commerce intents, 20 reviewed 1536x1536 PNGs; runtime remains ${runtime.length}.`);
