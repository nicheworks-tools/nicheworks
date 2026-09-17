#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const patterns=read('data/patterns.json');
const refs=read('data/reference-images.json');
const audit=read('data/reference-image-accuracy-audit.json');

const corrected=['shepherd-check','glen-check','prince-of-wales-check','gun-club-check','herringbone','kagome','same-komon','tomoe','fleur-de-lis','marbling','sayagata','giraffe-print','zebra-print'];
const ids=patterns.map(x=>x.id);
const auditIds=audit.records.map(x=>x.pattern_id);
if(audit.status!=='complete') throw new Error(`Audit status is ${audit.status}`);
if(audit.counts.total!==100 || audit.records.length!==100) throw new Error('Accuracy audit must cover exactly 100 records');
if(audit.counts.unresolved!==0) throw new Error(`Accuracy audit has ${audit.counts.unresolved} unresolved`);
if(new Set(auditIds).size!==100) throw new Error('Accuracy audit contains duplicate IDs');
for(const id of ids) if(!auditIds.includes(id)) throw new Error(`Accuracy audit missing ${id}`);
for(const id of corrected){
  const a=audit.records.find(x=>x.pattern_id===id);
  if(!a || a.decision!=='corrected') throw new Error(`Expected corrected audit decision for ${id}`);
  const r=refs.images.find(x=>x.pattern_id===id);
  if(!r || r.accuracy_audit!=='corrected-2026-09-17') throw new Error(`Reference manifest missing correction marker for ${id}`);
  if(!String(r.generator||'').includes('generate-reference-images-audit-fixes')) throw new Error(`Reference manifest missing audit generator for ${id}`);
}
if(audit.records.some(x=>!['accepted','representative-accepted','corrected'].includes(x.decision))) throw new Error('Unexpected audit decision');
console.log(`reference-image accuracy audit pass: ${audit.records.length} records; corrected ${corrected.length}; unresolved 0`);
