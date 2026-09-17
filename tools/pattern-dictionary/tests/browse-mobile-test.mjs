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
const searchPages=[path.join(root,'search.html'),path.join(root,'en','search.html')];
const expectedFamilies=['check','stripe','dot','geometric','japanese','floral','ornamental','animal','global-textile'];

if(patterns.length!==100)throw new Error(`expected 100 patterns, got ${patterns.length}`);
if(new Set(patterns.map(x=>x.id)).size!==100)throw new Error('pattern ids must be unique');
for(const family of expectedFamilies){
  const count=patterns.filter(p=>(p.families||[]).includes(family)).length;
  if(!count)throw new Error(`browse family ${family} has zero patterns`);
}
for(const file of indexes){
  const html=fs.readFileSync(file,'utf8');
  for(const family of expectedFamilies)if(!html.includes(`data-family="${family}"`))throw new Error(`${path.relative(root,file)} missing ${family} filter`);
  if(html.indexOf('data-family="check"')>html.indexOf('id="pattern-grid"'))throw new Error(`${path.relative(root,file)} filters must appear before the 100-image browse grid`);
  if(/DEV images|DEV画像|実装検証用/.test(html))throw new Error(`${path.relative(root,file)} contains stale DEV-image messaging`);
  const expectedLabel=file.includes(`${path.sep}en${path.sep}`)?'aria-label="Search patterns"':'aria-label="模様を検索"';
  if(!html.includes(expectedLabel))throw new Error(`${path.relative(root,file)} search input needs an explicit accessible name`);
}
for(const file of searchPages){
  const html=fs.readFileSync(file,'utf8');
  const expectedLabel=file.includes(`${path.sep}en${path.sep}`)?'aria-label="Search patterns"':'aria-label="模様を検索"';
  if(!html.includes(expectedLabel))throw new Error(`${path.relative(root,file)} search input needs an explicit accessible name`);
}
if(!css.includes('@media(max-width:680px)'))throw new Error('missing mobile breakpoint');
if(!css.includes('.pd-compare-grid{grid-template-columns:1fr;gap:12px}'))throw new Error('compare panels must stack at mobile width');
if(!css.includes('.pd-filter-row{flex-wrap:nowrap;overflow:auto'))throw new Error('mobile filters must remain horizontally scrollable');
if(!css.includes('.pd-mini-stripe')||!css.includes('.pd-mini-dot')||!css.includes('.pd-mini-floral')||!css.includes('.pd-mini-global-textile'))throw new Error('expanded visual filter cues missing');
if(/UI検証用DEVプレースホルダー|This image is a DEV placeholder/.test(app))throw new Error('runtime contains stale DEV detail warning');
if(!app.includes('function autocompleteNameMatch(q,p,lang)')||!app.includes('.some(v=>v.startsWith(nq))'))throw new Error('Visual Autocomplete must preserve partial name/alias prefix matching while typing');
if(app.includes('20柄の辞典項目')||app.includes('fixed 20-pattern dictionary'))throw new Error('runtime contains stale canonical-20 comparison copy');
if(!app.includes('class="pd-detail-image" src="${patternSvg(p)}" alt="${esc(p.names[lang])}"'))throw new Error('detail Reference Image must expose the pattern name as alt text');
if(!app.includes('<section class="pd-top-result"><img src="${patternSvg(p)}" alt="${esc(p.names[lang])}">'))throw new Error('top search-result image must expose the matched pattern name as alt text');
if(!app.includes('<article class="pd-compare-panel"><img src="${patternSvg(a)}" alt="${esc(a.names[lang])}">')||!app.includes('<article class="pd-compare-panel"><img src="${patternSvg(b)}" alt="${esc(b.names[lang])}">'))throw new Error('comparison Reference Images must expose pattern-name alt text');
for(const p of patterns){
  for(const prefix of ['', 'en/']){
    const file=path.join(root,prefix,'patterns',p.id,'index.html');
    if(!fs.existsSync(file))throw new Error(`missing detail page ${prefix}${p.id}`);
    const html=fs.readFileSync(file,'utf8');
    const verified=prodById[p.id]?.review_state==='verified'||prodById[p.id]?.review_state==='published';
    if(verified&&!html.includes('index,follow'))throw new Error(`${prefix}${p.id}: verified detail page must be index,follow`);
    if(!verified&&!html.includes('noindex,follow'))throw new Error(`${prefix}${p.id}: pre-verified detail page must remain noindex,follow`);
  }
}
console.log('OK: browse families, 200 detail wrappers, search-control accessibility, autocomplete prefix behavior, Reference Image alt contracts, stale messaging, and mobile comparison/filter contracts passed.');
