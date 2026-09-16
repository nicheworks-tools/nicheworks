import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','compare-guides.json'),'utf8'));
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ids=new Set(patterns.map(x=>x.id));
const required=['houndstooth--glen-check','seigaiha--shippo','seigaiha--asanoha','damask--arabesque','paisley--karakusa','buffalo-check--gingham','shepherd-check--gun-club-check','windowpane-check--tattersall','glen-check--prince-of-wales-check','pinstripe--chalk-stripe','bengal-stripe--awning-stripe','polka-dot--swiss-dot','chevron--herringbone','chevron--zigzag','argyle--diamond','diamond--harlequin','koushi--ichimatsu','ichimatsu--checkerboard'];
if(patterns.length!==40)throw new Error(`runtime must be 40, got ${patterns.length}`);
if(data.guides.length!==18)throw new Error(`expected 18 published compare guides, got ${data.guides.length}`);
if(data.guides.some(x=>x.id==='argyle--diamond-family'))throw new Error('legacy external diamond-family guide must be retired now that Diamond Pattern is published');
for(const id of required)if(!data.guides.some(x=>x.id===id))throw new Error(`missing compare guide ${id}`);
for(const g of data.guides){
  if(!ids.has(g.left)||!ids.has(g.right))throw new Error(`${g.id}: compare endpoints must both be published patterns`);
  for(const lang of ['ja','en']){if(!g.summary?.[lang])throw new Error(`${g.id}: missing ${lang} summary`);if(!g.decisive_cue?.[lang])throw new Error(`${g.id}: missing ${lang} decisive cue`);}
}
if(!app.includes('data/compare-guides.json')||!app.includes('decisive_cue'))throw new Error('compare runtime wiring missing');
console.log('OK: 18 published compare guides cover original and Wave 2 confusion pairs; obsolete external Diamond concept is retired.');
