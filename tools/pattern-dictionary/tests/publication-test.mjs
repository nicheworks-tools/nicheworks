import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const repoRoot=path.resolve(root,'..','..');
const canonical=['houndstooth','gingham','tartan','glen-check','argyle','chevron','polka-dot','moroccan-trellis','seigaiha','asanoha','shippo','ichimatsu','kikko','karakusa','damask','arabesque','paisley','leopard-print','ikat','kilim'];
const prod=JSON.parse(fs.readFileSync(path.join(root,'data','production-content.json'),'utf8'));
const refs=JSON.parse(fs.readFileSync(path.join(root,'data','reference-images.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(path.join(root,'data','source-verification.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const homeJa=fs.readFileSync(path.join(root,'index.html'),'utf8');
const homeEn=fs.readFileSync(path.join(root,'en','index.html'),'utf8');
const sitemap=fs.readFileSync(path.join(repoRoot,'sitemap.xml'),'utf8');

if(prod.phase!=='verified-publication')throw new Error(`production phase must be verified-publication, got ${prod.phase}`);
if(prod.policy?.review_state!=='verified')throw new Error('production policy review_state must be verified');
if(prod.patterns.length!==20)throw new Error(`expected 20 production patterns, got ${prod.patterns.length}`);
for(const id of canonical){
  const p=prod.patterns.find(x=>x.pattern_id===id);
  if(!p)throw new Error(`missing production pattern ${id}`);
  if(p.review_state!=='verified')throw new Error(`${id}: review_state must be verified`);
}
if(refs.status!=='verified-publication')throw new Error(`reference image status must be verified-publication, got ${refs.status}`);
if(refs.images.length!==20)throw new Error(`expected 20 reference images, got ${refs.images.length}`);
for(const id of canonical){
  const image=refs.images.find(x=>x.pattern_id===id);
  if(!image||image.review_state!=='verified')throw new Error(`${id}: reference image must be verified`);
}
const qualified=(source.patterns||source.records||[]).filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
const expectedQualified=['ikat','kilim','moroccan-trellis'];
if(JSON.stringify(qualified)!==JSON.stringify(expectedQualified))throw new Error(`qualified source scopes changed unexpectedly: ${qualified.join(', ')}`);
let detailCount=0;
for(const id of canonical){
  for(const prefix of ['', 'en/']){
    const file=path.join(root,prefix,'patterns',id,'index.html');
    const html=fs.readFileSync(file,'utf8');
    if(!html.includes('<meta name="robots" content="index,follow">'))throw new Error(`${prefix}${id}: detail page must be index,follow after verified publication`);
    if(html.includes('noindex'))throw new Error(`${prefix}${id}: stale noindex remains`);
    if(/検証中です。公開用Reference Image|remains noindex until source and Reference Image review/.test(html))throw new Error(`${prefix}${id}: stale pre-publication footer remains`);
    const url=`https://nicheworks.app/tools/pattern-dictionary/${prefix}patterns/${id}/`;
    if(!sitemap.includes(`<loc>${url}</loc>`))throw new Error(`${prefix}${id}: missing from sitemap`);
    detailCount++;
  }
}
if(detailCount!==40)throw new Error(`expected 40 detail pages, got ${detailCount}`);
if(/final verification is still pending|最終verified前|現在はreviewed/.test(app))throw new Error('runtime still exposes pre-publication review messaging');
if(/詳細ページは最終検証完了まで検索インデックス対象外|Detail pages remain out of the search index until final verification/.test(homeJa+homeEn))throw new Error('home footer still exposes pre-publication indexing messaging');
console.log('OK: 20/20 patterns and reference images are verified, qualified term scopes are preserved, 40/40 detail pages are indexable, and all 40 are in the sitemap.');
