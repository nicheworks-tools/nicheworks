import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const r=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p=JSON.parse(fs.readFileSync(path.join(r,'data/patterns.json'),'utf8'));
const errors=[];

if(p.length!==20) errors.push(`expected 20 patterns, got ${p.length}`);
if(new Set(p.map(x=>x.id)).size!==20) errors.push('duplicate pattern ids');

for(const x of p){
  if(!x.names?.ja||!x.names?.en) errors.push(`${x.id}: missing JA/EN names`);
  if(!x.colors?.primary?.length) errors.push(`${x.id}: missing primary colors`);
  if(!['non-essential','traditional','identity-relevant','variable'].includes(x.colors?.color_role)) errors.push(`${x.id}: invalid color role`);
  if(x.review_state!=='prototype-curated') errors.push(`${x.id}: unexpected review state ${x.review_state}`);

  for(const [lang,rel] of [['ja',path.join('patterns',x.id,'index.html')],['en',path.join('en','patterns',x.id,'index.html')]]){
    const full=path.join(r,rel);
    if(!fs.existsSync(full)){errors.push(`${x.id}: missing ${lang} static detail page`);continue;}
    const html=fs.readFileSync(full,'utf8');
    if(!html.includes(`data-pattern-id="${x.id}"`)) errors.push(`${rel}: pattern id mismatch`);
    if(!html.includes('noindex,follow')) errors.push(`${rel}: prototype detail must stay noindex`);
  }
}

for(const f of ['index.html','search.html','compare.html','en/index.html','en/search.html','en/compare.html','app.js','style.css','data/search-dictionary.json']){
  if(!fs.existsSync(path.join(r,f))) errors.push(`missing ${f}`);
}

const app=fs.readFileSync(path.join(r,'app.js'),'utf8');
if(app.includes('pattern.html?id=')) errors.push('app.js still links to legacy query detail URL');
if(!app.includes("'patterns/'+encodeURIComponent(p.id)+'/'")) errors.push('app.js static detail URL contract missing');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('OK: 20 canonical records, 40 static noindex detail pages, and required slice files.');
