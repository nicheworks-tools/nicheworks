import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const r=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p=JSON.parse(fs.readFileSync(path.join(r,'data/patterns.json'),'utf8'));
let e=[];
if(p.length!==20)e.push('expected 20');
if(new Set(p.map(x=>x.id)).size!==20)e.push('duplicate ids');
for(const x of p){
  if(!x.names?.ja||!x.names?.en)e.push(x.id+': names');
  if(!x.colors?.primary?.length)e.push(x.id+': primary colors');
  if(!['non-essential','traditional','identity-relevant','variable'].includes(x.colors?.color_role))e.push(x.id+': color role');
}
for(const f of ['index.html','search.html','pattern.html','compare.html','en/index.html','en/search.html','en/pattern.html','en/compare.html','app.js','style.css','data/search-dictionary.json']){
  if(!fs.existsSync(path.join(r,f)))e.push('missing '+f);
}
if(e.length){console.error(e.join('\n'));process.exit(1)}
console.log('OK: 20 records and required slice files.');
