import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const r=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(r,'data/patterns.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(r,'data/production-content.json'),'utf8'));
const om=Object.fromEntries(prod.patterns.map(x=>[x.pattern_id,x]));
const p=base.map(x=>({...x,...(om[x.id]||{}),id:x.id,names:{...x.names,...(om[x.id]?.names||{})},colors:{...x.colors,...(om[x.id]?.colors||{})}}));
const errors=[];
const reviewOrder=['draft','researched','image_ready','reviewed','verified','published'];

if(p.length!==20) errors.push(`expected 20 patterns, got ${p.length}`);
if(new Set(p.map(x=>x.id)).size!==20) errors.push('duplicate pattern ids');
for(const x of p){
  if(!x.names?.ja||!x.names?.en) errors.push(`${x.id}: missing JA/EN names`);
  if(!x.colors?.primary?.length) errors.push(`${x.id}: missing primary colors`);
  if(!['non-essential','traditional','identity-relevant','variable'].includes(x.colors?.color_role)) errors.push(`${x.id}: invalid color role`);
  if(reviewOrder.indexOf(x.review_state)<reviewOrder.indexOf('researched')) errors.push(`${x.id}: expected researched-or-later review state, got ${x.review_state}`);
  for(const [lang,rel] of [['ja',path.join('patterns',x.id,'index.html')],['en',path.join('en','patterns',x.id,'index.html')]]){
    const full=path.join(r,rel);
    if(!fs.existsSync(full)){errors.push(`${x.id}: missing ${lang} static detail page`);continue}
    const html=fs.readFileSync(full,'utf8');
    if(!html.includes(`data-pattern-id="${x.id}"`)) errors.push(`${rel}: pattern id mismatch`);
    if(!html.includes('noindex,follow')) errors.push(`${rel}: detail must stay noindex until image verification`);
  }
}
for(const f of ['data/production-content.json','data/source-verification.json','index.html','search.html','compare.html','en/index.html','en/search.html','en/compare.html','app.js','style.css','data/search-dictionary.json']) if(!fs.existsSync(path.join(r,f))) errors.push(`missing ${f}`);
const app=fs.readFileSync(path.join(r,'app.js'),'utf8');
if(app.includes('pattern.html?id=')) errors.push('app.js still links to legacy query detail URL');
if(!app.includes("'patterns/'+encodeURIComponent(p.id)+'/'")) errors.push('app.js static detail URL contract missing');
if(!app.includes("data/production-content.json")) errors.push('app.js researched production overlay is not wired');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('OK: 20 canonical records are researched-or-later, 40 static noindex detail pages exist, and required production-phase files are present.');
