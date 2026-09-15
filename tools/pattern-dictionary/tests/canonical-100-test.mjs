import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const current=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const expansion=JSON.parse(fs.readFileSync(path.join(root,'data','canonical-100-expansion.json'),'utf8'));

if(current.length!==20)throw new Error(`canonical published base must remain exactly 20 during freeze PR, got ${current.length}`);
if(expansion.schema!=='pattern-dictionary-canonical-100-v1')throw new Error('unexpected canonical-100 schema');
if(expansion.base?.published_count!==20||expansion.policy?.expansion_count!==80||expansion.policy?.target_total!==100)throw new Error('canonical-100 counts are inconsistent');
if(expansion.policy?.wave_size!==20)throw new Error('production waves must remain 20 patterns each');
if(expansion.policy?.pattern_atlas!=='out-of-scope')throw new Error('Pattern Atlas must remain out of scope');

const entries=expansion.entries||[];
if(entries.length!==80)throw new Error(`expected 80 frozen expansion entries, got ${entries.length}`);
const existingIds=current.map(x=>x.id);
const plannedIds=entries.map(x=>x.id);
const allIds=[...existingIds,...plannedIds];
if(new Set(existingIds).size!==20)throw new Error('published canonical IDs must be unique');
if(new Set(plannedIds).size!==80)throw new Error('planned canonical IDs must be unique');
if(new Set(allIds).size!==100)throw new Error('canonical 100 contains duplicate IDs');

for(let i=0;i<entries.length;i++){
  const e=entries[i];
  const ordinal=i+21;
  const wave=Math.floor((ordinal-1)/20)+1;
  if(e.ordinal!==ordinal)throw new Error(`${e.id}: expected ordinal ${ordinal}, got ${e.ordinal}`);
  if(e.wave!==wave)throw new Error(`${e.id}: expected wave ${wave}, got ${e.wave}`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id))throw new Error(`${e.id}: invalid canonical slug`);
  if(!e.names?.ja?.trim()||!e.names?.en?.trim())throw new Error(`${e.id}: missing JA/EN frozen names`);
  if(!e.family?.trim()||!e.term_scope?.trim())throw new Error(`${e.id}: missing family or term_scope`);
  if(/^qualified-/.test(e.term_scope)&&!e.scope_note?.trim())throw new Error(`${e.id}: qualified term requires scope_note`);
}

for(const wave of [2,3,4,5]){
  const count=entries.filter(x=>x.wave===wave).length;
  if(count!==20)throw new Error(`wave ${wave}: expected 20 entries, got ${count}`);
}

const relationshipTargets=new Set();
for(const p of current){
  for(const key of ['similar','often_confused_with'])for(const id of p.relationships?.[key]||[])relationshipTargets.add(id);
}
const unresolved=[...relationshipTargets].filter(id=>!allIds.includes(id)).sort();
if(unresolved.length)throw new Error(`canonical 100 must resolve current relationship targets: ${unresolved.join(', ')}`);

const requiredPlanned=[
  'buffalo-check','shepherd-check','prince-of-wales-check','herringbone','zigzag','diamond','harlequin','checkerboard','swiss-dot','dalmatian-spots','scallop','nami-chidori','tomoe','baroque-scroll'
];
for(const id of requiredPlanned)if(!plannedIds.includes(id))throw new Error(`missing relationship-driven expansion entry: ${id}`);

const risky=entries.filter(x=>/^qualified-/.test(x.term_scope));
if(risky.length<15)throw new Error('taxonomy must explicitly qualify broad technique/style/textile terms rather than pretending they are fixed motifs');

console.log(`OK: canonical 100 frozen as 20 published + 80 planned; waves 2-5 are 20 each; ${risky.length} broad terms are explicitly scope-qualified; all current relationship targets resolve.`);
