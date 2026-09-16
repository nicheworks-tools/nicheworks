import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const published=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'data','wave2-source-verification.json'),'utf8'));

if(![20,40,60,80,100].includes(published.length))throw new Error(`unexpected runtime count ${published.length}`);
if(ledger.phase!=='wave2-source-verification'||ledger.wave!==2)throw new Error('unexpected Wave 2 source-verification metadata');
if(ledger.policy?.publication_state!=='research-only')throw new Error('Wave 2 source ledger remains immutable research provenance');
if(JSON.stringify(ledger.ordinal_range)!==JSON.stringify([21,40]))throw new Error('Wave 2 ordinal range must be 21-40');

const rows=(ledger.patterns||[]).slice().sort((a,b)=>a.ordinal-b.ordinal);
if(rows.length!==20)throw new Error(`Wave 2 source ledger must contain exactly 20 rows, got ${rows.length}`);
for(let i=0;i<20;i++){
  const r=rows[i],ordinal=i+21;
  if(r.ordinal!==ordinal)throw new Error(`${r.pattern_id}: expected ordinal ${ordinal}, got ${r.ordinal}`);
  if(!['verified','qualified'].includes(r.verification_state))throw new Error(`${r.pattern_id}: invalid verification_state`);
  if(!r.verified_names?.ja?.trim()||!r.verified_names?.en?.trim())throw new Error(`${r.pattern_id}: missing verified names`);
  if(!r.term_scope?.trim()||!r.structure?.trim())throw new Error(`${r.pattern_id}: missing term scope or structure`);
  if(!r.color_guidance?.primary_status||!Array.isArray(r.color_guidance?.primary)||r.color_guidance.primary.length<1)throw new Error(`${r.pattern_id}: incomplete color guidance`);
  if(!Array.isArray(r.sources)||r.sources.length<1)throw new Error(`${r.pattern_id}: at least one evidence source is required`);
  for(const s of r.sources)if(!s.publisher?.trim()||!/^https:\/\//.test(s.url||'')||!Array.isArray(s.supports)||s.supports.length<1)throw new Error(`${r.pattern_id}: malformed source record`);
  if(r.verification_state==='qualified'&&!r.qualification?.trim())throw new Error(`${r.pattern_id}: qualified row requires explicit qualification text`);
  if(published.length>=40&&!published.some(x=>x.id===r.pattern_id))throw new Error(`${r.pattern_id}: published runtime missing Wave 2 row`);
}

const expectedQualified=['breton-stripe','herringbone','koushi','madras-check','prince-of-wales-check','regimental-stripe','swiss-dot'].sort();
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

console.log(`OK: Wave 2 source provenance covers 21-40 exactly; 13 verified / 7 qualified; ${new Set(sourceUrls).size} distinct evidence URLs; runtime state ${published.length}.`);
