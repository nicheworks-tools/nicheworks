import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const published=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const canonical=JSON.parse(fs.readFileSync(path.join(root,'data','canonical-100-expansion.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'data','wave4-source-verification.json'),'utf8'));

if(![60,80,100].includes(published.length))throw new Error(`Wave 4 provenance expects runtime 60 before publication, 80 after Wave 4, or 100 after canonical completion, got ${published.length}`);
if(ledger.phase!=='wave4-source-verification'||ledger.wave!==4)throw new Error('unexpected Wave 4 source-verification metadata');
if(ledger.policy?.publication_state!=='research-only')throw new Error('Wave 4 source ledger must remain immutable research provenance');
if(!String(ledger.policy?.runtime_lock||'').includes('60'))throw new Error('Wave 4 provenance must retain its original runtime-60 staging lock');
if(JSON.stringify(ledger.ordinal_range)!==JSON.stringify([61,80]))throw new Error('Wave 4 ordinal range must be 61-80');

const planned=(canonical.entries||[]).filter(x=>x.wave===4).slice().sort((a,b)=>a.ordinal-b.ordinal);
if(published.length===60&&planned.length!==20)throw new Error(`pre-publication canonical-100 Wave 4 must contain exactly 20 rows, got ${planned.length}`);
if(published.length>=80&&planned.length!==0)throw new Error('post-publication canonical-100 expansion must no longer retain Wave 4 rows');
if(published.length===60)for(let i=0;i<20;i++)if(planned[i].ordinal!==i+61)throw new Error(`canonical Wave 4 ordinal gap at ${i+61}`);

const rows=(ledger.patterns||[]).slice().sort((a,b)=>a.ordinal-b.ordinal);
if(rows.length!==20)throw new Error(`Wave 4 source ledger must contain exactly 20 rows, got ${rows.length}`);
const runtimeById=new Map(published.map(x=>[x.id,x]));
const plannedById=new Map(planned.map(x=>[x.id,x]));

for(let i=0;i<20;i++){
  const r=rows[i],ordinal=i+61;
  if(r.ordinal!==ordinal)throw new Error(`${r.pattern_id}: expected ordinal ${ordinal}, got ${r.ordinal}`);
  if(published.length===60){
    const p=plannedById.get(r.pattern_id);
    if(!p)throw new Error(`${r.pattern_id}: not in canonical-100 Wave 4`);
    if(p.ordinal!==r.ordinal)throw new Error(`${r.pattern_id}: canonical ordinal mismatch`);
    if(r.verified_names?.ja!==p.names?.ja||r.verified_names?.en!==p.names?.en)throw new Error(`${r.pattern_id}: verified names diverge from frozen canonical names`);
    if(runtimeById.has(r.pattern_id))throw new Error(`${r.pattern_id}: Wave 4 leaked into runtime before publication gate`);
  }else{
    const p=runtimeById.get(r.pattern_id);
    if(!p)throw new Error(`${r.pattern_id}: published runtime missing Wave 4 row`);
    if(r.verified_names?.ja!==p.names?.ja||r.verified_names?.en!==p.names?.en)throw new Error(`${r.pattern_id}: runtime names diverge from verified Wave 4 provenance`);
  }
  if(!['verified','qualified'].includes(r.verification_state))throw new Error(`${r.pattern_id}: invalid verification_state`);
  if(!r.term_scope?.trim()||!r.structure?.trim())throw new Error(`${r.pattern_id}: missing term scope or structure`);
  if(!Array.isArray(r.verified_aliases?.ja)||!Array.isArray(r.verified_aliases?.en))throw new Error(`${r.pattern_id}: aliases must be explicit arrays`);
  if(!r.color_guidance?.color_role||!r.color_guidance?.primary_status||!r.color_guidance?.reason?.trim()||!Array.isArray(r.color_guidance?.primary)||r.color_guidance.primary.length<1)throw new Error(`${r.pattern_id}: incomplete color guidance`);
  if(!Array.isArray(r.sources)||r.sources.length<1)throw new Error(`${r.pattern_id}: at least one evidence source is required`);
  for(const s of r.sources){
    if(!s.publisher?.trim()||!/^https:\/\//.test(s.url||'')||!Array.isArray(s.supports)||s.supports.length<1)throw new Error(`${r.pattern_id}: malformed source record`);
    for(const claim of s.supports)if(!String(claim).trim())throw new Error(`${r.pattern_id}: empty support claim`);
  }
  if(r.verification_state==='qualified'&&!r.qualification?.trim())throw new Error(`${r.pattern_id}: qualified row requires explicit qualification text`);
}

if(new Set(rows.map(x=>x.pattern_id)).size!==20)throw new Error('Wave 4 ledger contains duplicate pattern IDs');
if(new Set(rows.map(x=>x.ordinal)).size!==20)throw new Error('Wave 4 ledger contains duplicate ordinals');

const expectedQualified=['ajrakh','bandhani','baroque-scroll','batik','chinoiserie','flame-stitch','kalamkari','kanoko','moire','same-komon','shibori'].sort();
const actualQualified=rows.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
if(JSON.stringify(actualQualified)!==JSON.stringify(expectedQualified))throw new Error(`Wave 4 qualified set changed: ${actualQualified.join(', ')}`);

const sourceUrls=rows.flatMap(x=>x.sources.map(s=>s.url));
if(new Set(sourceUrls).size<20)throw new Error(`Wave 4 source ledger is too concentrated; got ${new Set(sourceUrls).size} distinct evidence URLs`);

const requiredBoundaryText={
  'baroque-scroll':['historical decorative style','running scrolls','rather than one universal pattern'],
  'chinoiserie':['broad European decorative style','one canonical repeat','representative'],
  'flame-stitch':['Bargello','technique/visual','one universal'],
  'moire':['watered textile surface effect','not one fixed'],
  'kanoko':['kanoko shibori','resist-dye','does not define one universal'],
  'same-komon':['fine-dot pattern','stencil-dyed','one fixed stencil density'],
  'shibori':['family of resist-dye techniques','not one pattern','representative'],
  'batik':['wax-resist','wide diversity','not one fixed'],
  'bandhani':['tie-resist','many named layouts','not one universal'],
  'ajrakh':['textile-printing tradition','not one fixed motif','no single'],
  'kalamkari':['textile-making process','regional tradition','not one universal motif']
};
for(const [id,needles] of Object.entries(requiredBoundaryText)){
  const q=rows.find(x=>x.pattern_id===id)?.qualification||'';
  for(const needle of needles)if(!q.toLowerCase().includes(needle.toLowerCase()))throw new Error(`${id}: qualification must preserve boundary cue "${needle}"`);
}

const requiredStructureText={
  'tree-of-life':['tree','branch'],
  'yagasuri':['arrow'],
  'sayagata':['interlocking','fret'],
  'uroko':['triangle'],
  'tatewaku':['vertically','curv'],
  'kagome':['basket','lattice'],
  'hanabishi':['flower','lozenge'],
  'nami-chidori':['plover','wave'],
  'tomoe':['comma']
};
for(const [id,needles] of Object.entries(requiredStructureText)){
  const text=`${rows.find(x=>x.pattern_id===id)?.term_scope||''} ${rows.find(x=>x.pattern_id===id)?.structure||''}`.toLowerCase();
  for(const needle of needles)if(!text.includes(needle))throw new Error(`${id}: required semantic structure cue "${needle}" missing`);
}

const expectedIds=published.length===60?planned.map(x=>x.id).sort():rows.map(x=>x.pattern_id).sort();
const actualIds=rows.map(x=>x.pattern_id).sort();
if(JSON.stringify(actualIds)!==JSON.stringify(expectedIds))throw new Error('Wave 4 ledger IDs diverge from canonical/runtime contract');

console.log(`OK: Wave 4 source provenance covers 61-80 exactly; ${rows.filter(x=>x.verification_state==='verified').length} verified / ${actualQualified.length} qualified; ${new Set(sourceUrls).size} distinct evidence URLs; runtime state ${published.length}.`);
