import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const patterns=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'data','production-content.json'),'utf8'));
const prodById=Object.fromEntries(prod.patterns.map(x=>[x.pattern_id,x]));
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const indexes=[path.join(root,'index.html'),path.join(root,'en','index.html')];
const expectedFamilies=['check','geometric','japanese','ornamental','animal'];

if(patterns.length!==20)throw new Error(`expected 20 patterns, got ${patterns.length}`);
if(new Set(patterns.map(x=>x.id)).size!==20)throw new Error('pattern ids must be unique');
for(const family of expectedFamilies){
  const count=patterns.filter(p=>(p.families||[]).includes(family)).length;
  if(!count)throw new Error(`browse family ${family} has zero patterns`);
}
for(const file of indexes){
  const html=fs.readFileSync(file,'utf8');
  for(const family of expectedFamilies)if(!html.includes(`data-family="${family}"`))throw new Error(`${path.relative(root,file)} missing ${family} filter`);
  if(html.indexOf('data-family="check"')>html.indexOf('id="pattern-grid"'))throw new Error(`${path.relative(root,file)} filters must appear before the 20-image browse grid`);
  if(/DEV images|DEV画像|実装検証用/.test(html))throw new Error(`${path.relative(root,file)} contains stale DEV-image messaging`);
}
if(!css.includes('@media(max-width:680px)'))throw new Error('missing mobile breakpoint');
if(!css.includes('.pd-compare-grid{grid-template-columns:1fr;gap:12px}'))throw new Error('compare panels must stack at mobile width');
if(!css.includes('.pd-filter-row{flex-wrap:nowrap;overflow:auto'))throw new Error('mobile filters must remain horizontally scrollable');
if(/UI検証用DEVプレースホルダー|This image is a DEV placeholder/.test(app))throw new Error('runtime contains stale DEV detail warning');
for(const p of patterns){
  for(const prefix of ['', 'en/']){
    const file=path.join(root,prefix,'patterns',p.id,'index.html');
    if(!fs.existsSync(file))throw new Error(`missing detail page ${prefix}${p.id}`);
    const html=fs.readFileSync(file,'utf8');
    const verified=prodById[p.id]?.review_state==='verified'||prodById[p.id]?.review_state==='published';if(verified&&!html.includes('index,follow'))throw new Error(`${prefix}${p.id}: verified detail page must be index,follow`);if(!verified&&!html.includes('noindex,follow'))throw new Error(`${prefix}${p.id}: pre-verified detail page must remain noindex,follow`);
  }
}
console.log('OK: browse families, 40 detail wrappers, stale messaging, and mobile comparison/filter contracts passed.');
