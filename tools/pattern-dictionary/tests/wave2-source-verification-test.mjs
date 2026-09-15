import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const published=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const canonical=JSON.parse(fs.readFileSync(path.join(root,'data','canonical-100-expansion.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'data','wave2-source-verification.json'),'utf8'));

if(published.length!==20)throw new Error(`Wave 2 research PR must not publish runtime patterns; expected 20, got ${published.length}`);
if(ledger.phase!=='wave2-source-verification'||ledger.wave!==2)throw new Error('unexpected Wave 2 source-verification metadata');
if(ledger.policy?.publication_state!=='research-only')throw new Error('Wave 2 source ledger must remain research-only');
if(JSON.stringify(ledger.ordinal_range)!==JSON.stringify([21,40]))throw new Error('Wave 2 ordinal range must be 21-40');

const frozen=canonical.entries.filter(x=>x.wave===2).sort((a,b)=>a.ordinal-b.ordinal);
const rows=(ledger.patterns||[]).sort((a,b)=>a.ordinal-b.ordinal);
if(frozen.length!==20||rows.length!==20)throw new Error(`Wave 2 must contain exactly 20 frozen and 20 verified rows; got ${frozen.length}/${rows.length}`);

for(let i=0;i<20;i++){
  const f=frozen[i],r=rows[i];
  if(r.ordinal!==f.ordinal||r.pattern_id!==f.id)throw new Error(`Wave 2 ledger mismatch at ordinal ${f.ordinal}: expected ${f.id}, got ${r.pattern_id}`);
  if(r.verified_names?.ja!==f.names?.ja||r.verified_names?.en!==f.names?.en)throw new Error(`${r.pattern_id}: verified JA/EN names must match the canonical freeze unless a dedicated naming correction changes both artifacts`);
  if(!['verified','qualified'].includes(r.verification_state))throw new Error(`${r.pattern_id}: invalid verification_state`);
  if(!r.term_scope?.trim()||!r.structure?.trim())throw new Error(`${r.pattern_id}: missing term scope or structure`);
  if(!r.color_guidance?.primary_status||!Array.isArray(r.color_guidance?.primary)||r.color_guidance.primary.length<1)throw new Error(`${r.pattern_id}: incomplete color guidance`);
  if(!Array.isArray(r.sources)||r.sources.length<1)throw new Error(`${r.pattern_id}: at least one evidence source is required`);
  for(const s of r.sources){
    if(!s.publisher?.trim()||!/^https:\/\//.test(s.url||'')||!Array.isArray(s.supports)||s.supports.length<1)throw new Error(`${r.pattern_id}: malformed source record`);
  }
  if(r.verification_state==='qualified'&&!r.qualification?.trim())throw new Error(`${r.pattern_id}: qualified row requires explicit qualification text`);
}

const expectedQualified=[
  'breton-stripe',
  'herringbone',
  'koushi',
  'madras-check',
  'prince-of-wales-check',
  'regimental-stripe',
  'swiss-dot'
].sort();
const actualQualified=rows.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
if(JSON.stringify(actualQualified)!==JSON.stringify(expectedQualified))throw new Error(`Wave 2 qualified set changed: ${actualQualified.join(', ')}`);

const sourceUrls=rows.flatMap(x=>x.sources.map(s=>s.url));
if(new Set(sourceUrls).size<18)throw new Error('Wave 2 source ledger is too concentrated; expected at least 18 distinct evidence URLs');

const requiredBoundaryText={
  'madras-check':['textile','single'],
  'prince-of-wales-check':['Glen Check','interchangeably'],
  'koushi':['broad','Ichimatsu'],
  'regimental-stripe':['not one universal','regiment'],
  'breton-stripe':['historic','modern'],
  'swiss-dot':['fabric','polka'],
  'herringbone':['weave','Chevron']
};
for(const [id,needles] of Object.entries(requiredBoundaryText)){
  const q=rows.find(x=>x.pattern_id===id)?.qualification||'';
  for(const needle of needles)if(!q.toLowerCase().includes(needle.toLowerCase()))throw new Error(`${id}: qualification must preserve boundary cue "${needle}"`);
}

console.log(`OK: Wave 2 source verification covers 21-40 exactly; 13 verified / 7 qualified; ${new Set(sourceUrls).size} distinct evidence URLs; runtime remains canonical 20.`);
