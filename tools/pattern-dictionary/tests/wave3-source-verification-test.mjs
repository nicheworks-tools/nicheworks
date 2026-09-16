import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const published=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const canonical=JSON.parse(fs.readFileSync(path.join(root,'data','canonical-100-expansion.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'data','wave3-source-verification.json'),'utf8'));

if(published.length!==40)throw new Error(`Wave 3 source gate requires runtime canonical 40, got ${published.length}`);
if(ledger.phase!=='wave3-source-verification'||ledger.wave!==3)throw new Error('unexpected Wave 3 source-verification metadata');
if(ledger.policy?.publication_state!=='research-only')throw new Error('Wave 3 source ledger must remain research-only');
if(!String(ledger.policy?.runtime_lock||'').includes('40'))throw new Error('Wave 3 runtime lock must explicitly preserve canonical 40');
if(JSON.stringify(ledger.ordinal_range)!==JSON.stringify([41,60]))throw new Error('Wave 3 ordinal range must be 41-60');

const planned=(canonical.entries||[]).filter(x=>x.wave===3).slice().sort((a,b)=>a.ordinal-b.ordinal);
if(planned.length!==20)throw new Error(`canonical-100 Wave 3 must contain exactly 20 rows, got ${planned.length}`);
for(let i=0;i<20;i++)if(planned[i].ordinal!==i+41)throw new Error(`canonical Wave 3 ordinal gap at ${i+41}`);

const rows=(ledger.patterns||[]).slice().sort((a,b)=>a.ordinal-b.ordinal);
if(rows.length!==20)throw new Error(`Wave 3 source ledger must contain exactly 20 rows, got ${rows.length}`);
const runtimeIds=new Set(published.map(x=>x.id));
const plannedById=new Map(planned.map(x=>[x.id,x]));

for(let i=0;i<20;i++){
  const r=rows[i],ordinal=i+41;
  if(r.ordinal!==ordinal)throw new Error(`${r.pattern_id}: expected ordinal ${ordinal}, got ${r.ordinal}`);
  const p=plannedById.get(r.pattern_id);
  if(!p)throw new Error(`${r.pattern_id}: not in canonical-100 Wave 3`);
  if(p.ordinal!==r.ordinal)throw new Error(`${r.pattern_id}: canonical ordinal mismatch`);
  if(r.verified_names?.ja!==p.names?.ja||r.verified_names?.en!==p.names?.en)throw new Error(`${r.pattern_id}: verified names diverge from frozen canonical names`);
  if(runtimeIds.has(r.pattern_id))throw new Error(`${r.pattern_id}: Wave 3 leaked into runtime before publication gate`);
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

if(new Set(rows.map(x=>x.pattern_id)).size!==20)throw new Error('Wave 3 ledger contains duplicate pattern IDs');
if(new Set(rows.map(x=>x.ordinal)).size!==20)throw new Error('Wave 3 ledger contains duplicate ordinals');

const expectedQualified=['basketweave','botanical-print','chintz','ivy','jacobean-floral','ogee','toile-de-jouy'].sort();
const actualQualified=rows.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
if(JSON.stringify(actualQualified)!==JSON.stringify(expectedQualified))throw new Error(`Wave 3 qualified set changed: ${actualQualified.join(', ')}`);

const sourceUrls=rows.flatMap(x=>x.sources.map(s=>s.url));
if(new Set(sourceUrls).size<20)throw new Error(`Wave 3 source ledger is too concentrated; got ${new Set(sourceUrls).size} distinct evidence URLs`);

const requiredBoundaryText={
  'ogee':['double-curved','not one universal'],
  'basketweave':['weave structure','not one universal'],
  'toile-de-jouy':['textile','not one fixed','pastoral'],
  'chintz':['cotton','not one fixed'],
  'jacobean-floral':['historical','not one fixed'],
  'botanical-print':['broad modern','plant-based','fixed motif'],
  'ivy':['broad botanical','not one standardized']
};
for(const [id,needles] of Object.entries(requiredBoundaryText)){
  const q=rows.find(x=>x.pattern_id===id)?.qualification||'';
  for(const needle of needles)if(!q.toLowerCase().includes(needle.toLowerCase()))throw new Error(`${id}: qualification must preserve boundary cue "${needle}"`);
}

const specialBoundaries={
  trellis:['Moroccan Trellis'],
  hishi:['diamond'],
  hexagon:['six-sided'],
  honeycomb:['six-sided']
};
const canonicalById=new Map(planned.map(x=>[x.id,x]));
if(!String(canonicalById.get('trellis')?.scope_note||'').includes('Moroccan Trellis'))throw new Error('trellis: canonical boundary vs Moroccan Trellis missing');
if(!String(canonicalById.get('hishi')?.scope_note||'').includes('diamond'))throw new Error('hishi: canonical boundary vs generic diamond missing');
for(const [id,needles] of Object.entries(specialBoundaries)){
  const text=`${rows.find(x=>x.pattern_id===id)?.term_scope||''} ${rows.find(x=>x.pattern_id===id)?.structure||''} ${canonicalById.get(id)?.scope_note||''}`.toLowerCase();
  for(const needle of needles)if(!text.includes(needle.toLowerCase()))throw new Error(`${id}: required semantic boundary cue "${needle}" missing`);
}

console.log(`OK: Wave 3 source provenance covers 41-60 exactly; ${rows.filter(x=>x.verification_state==='verified').length} verified / ${actualQualified.length} qualified; ${new Set(sourceUrls).size} distinct evidence URLs; runtime locked at 40.`);
