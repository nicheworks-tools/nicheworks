import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','compare-guides.json'),'utf8'));
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ids=new Set(patterns.map(x=>x.id));
const expected=[
  ['houndstooth','glen-check'],
  ['seigaiha','shippo'],
  ['seigaiha','asanoha'],
  ['damask','arabesque'],
  ['paisley','karakusa']
];

if(data.guides.length!==6)throw new Error(`expected 6 canonical compare guides, got ${data.guides.length}`);
for(const [a,b] of expected){
  const g=data.guides.find(x=>x.left===a&&x.right===b);
  if(!g)throw new Error(`missing ${a} vs ${b}`);
}
const diamond=data.guides.find(x=>x.id==='argyle--diamond-family');
if(!diamond||diamond.left!=='argyle'||diamond.right_external?.id!=='diamond-family')throw new Error('missing Argyle vs generic diamond family guide');
for(const g of data.guides){
  if(!ids.has(g.left))throw new Error(`${g.id}: invalid left pattern`);
  if(g.right&&!ids.has(g.right))throw new Error(`${g.id}: invalid right pattern`);
  for(const lang of ['ja','en']){
    if(!g.summary?.[lang])throw new Error(`${g.id}: missing ${lang} summary`);
    if(!g.decisive_cue?.[lang])throw new Error(`${g.id}: missing ${lang} decisive cue`);
  }
}
if(!app.includes("data/compare-guides.json"))throw new Error('app.js must load compare guides');
if(!app.includes('diamond-family'))throw new Error('app.js must support external diamond-family comparison concept');
if(!app.includes('decisive_cue'))throw new Error('compare UI must render decisive cue');
console.log('OK: 6/6 canonical compare guides are valid and runtime-wired.');
