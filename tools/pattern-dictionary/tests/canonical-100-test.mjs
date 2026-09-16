import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const current=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const expansion=JSON.parse(fs.readFileSync(path.join(root,'data','canonical-100-expansion.json'),'utf8'));

if(current.length!==40)throw new Error(`canonical published base must be exactly 40 after Wave 2, got ${current.length}`);
if(expansion.schema!=='pattern-dictionary-canonical-100-v1')throw new Error('unexpected canonical-100 schema');
if(expansion.base?.published_count!==40||expansion.policy?.expansion_count!==60||expansion.policy?.target_total!==100)throw new Error('canonical-100 counts are inconsistent after Wave 2 publication');
if(expansion.policy?.wave_size!==20)throw new Error('production waves must remain 20 patterns each');
if(expansion.policy?.pattern_atlas!=='out-of-scope')throw new Error('Pattern Atlas must remain out of scope');

const entries=expansion.entries||[];
if(entries.length!==60)throw new Error(`expected 60 remaining expansion entries, got ${entries.length}`);
const existingIds=current.map(x=>x.id),plannedIds=entries.map(x=>x.id),allIds=[...existingIds,...plannedIds];
if(new Set(existingIds).size!==40)throw new Error('published canonical IDs must be unique');
if(new Set(plannedIds).size!==60)throw new Error('remaining planned canonical IDs must be unique');
if(new Set(allIds).size!==100)throw new Error('canonical 100 contains duplicate IDs');

for(let i=0;i<entries.length;i++){
  const e=entries[i],ordinal=i+41,wave=Math.floor((ordinal-1)/20)+1;
  if(e.ordinal!==ordinal)throw new Error(`${e.id}: expected ordinal ${ordinal}, got ${e.ordinal}`);
  if(e.wave!==wave)throw new Error(`${e.id}: expected wave ${wave}, got ${e.wave}`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id))throw new Error(`${e.id}: invalid canonical slug`);
  if(!e.names?.ja?.trim()||!e.names?.en?.trim())throw new Error(`${e.id}: missing JA/EN frozen names`);
  if(!e.family?.trim()||!e.term_scope?.trim())throw new Error(`${e.id}: missing family or term_scope`);
}
for(const wave of [3,4,5])if(entries.filter(x=>x.wave===wave).length!==20)throw new Error(`wave ${wave}: expected 20 remaining entries`);

const relationshipTargets=new Set();
for(const p of current)for(const key of ['similar','often_confused_with'])for(const id of p.relationships?.[key]||[])relationshipTargets.add(id);
const unresolved=[...relationshipTargets].filter(id=>!allIds.includes(id)).sort();
if(unresolved.length)throw new Error(`canonical 100 must resolve published relationship targets: ${unresolved.join(', ')}`);

for(const id of ['hexagon','hishi','ivy','dalmatian-spots','scallop','nami-chidori','tomoe','baroque-scroll'])if(!plannedIds.includes(id))throw new Error(`missing relationship-driven remaining entry: ${id}`);
const risky=entries.filter(x=>/^qualified-/.test(x.term_scope));
if(risky.length<15)throw new Error('remaining taxonomy must keep broad technique/style/textile terms explicitly qualified');
for(const id of ['basketweave','trellis','toile-de-jouy','chintz','chinoiserie','flame-stitch','moire','kanoko','same-komon','shibori','batik','bandhani','bogolan','adire','sashiko','block-print']){
  const e=entries.find(x=>x.id===id);if(!e?.scope_note?.trim())throw new Error(`${id}: boundary-sensitive qualified term requires scope_note`);
}
console.log(`OK: canonical 100 is now 40 published + 60 planned; waves 3-5 remain 20 each; ${risky.length} remaining broad terms stay explicitly qualified.`);
