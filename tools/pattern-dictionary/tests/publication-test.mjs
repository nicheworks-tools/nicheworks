import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repoRoot=path.resolve(root,'..','..');
const base=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'data','production-content.json'),'utf8'));
const refs=JSON.parse(fs.readFileSync(path.join(root,'data','reference-images.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(path.join(root,'data','source-verification.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const homeJa=fs.readFileSync(path.join(root,'index.html'),'utf8');
const homeEn=fs.readFileSync(path.join(root,'en','index.html'),'utf8');
const sitemap=fs.readFileSync(path.join(repoRoot,'sitemap.xml'),'utf8');
const canonical=base.map(x=>x.id);
if(canonical.length!==40)throw new Error(`published runtime must be 40, got ${canonical.length}`);
if(prod.phase!=='verified-publication'||prod.policy?.review_state!=='verified'||prod.policy?.record_count!==40)throw new Error('production publication metadata must declare verified 40');
if(prod.patterns.length!==40)throw new Error(`expected 40 production patterns, got ${prod.patterns.length}`);
for(const id of canonical){const p=prod.patterns.find(x=>x.pattern_id===id);if(!p||p.review_state!=='verified')throw new Error(`${id}: production record must be verified`);}
if(refs.status!=='verified-publication'||refs.images.length!==40)throw new Error(`reference image publication set must contain verified 40`);
for(const id of canonical){const image=refs.images.find(x=>x.pattern_id===id);if(!image||image.review_state!=='verified')throw new Error(`${id}: reference image must be verified`);}
const qualified=source.patterns.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
const expectedQualified=['breton-stripe','herringbone','ikat','kilim','koushi','madras-check','moroccan-trellis','prince-of-wales-check','regimental-stripe','swiss-dot'].sort();
if(JSON.stringify(qualified)!==JSON.stringify(expectedQualified))throw new Error(`qualified source scopes changed unexpectedly: ${qualified.join(', ')}`);
let detailCount=0;
for(const id of canonical)for(const prefix of ['', 'en/']){
  const file=path.join(root,prefix,'patterns',id,'index.html'),html=fs.readFileSync(file,'utf8');
  if(!html.includes('<meta name="robots" content="index,follow">')||html.includes('noindex'))throw new Error(`${prefix}${id}: detail page must be index,follow only`);
  if(/検証中です。公開用Reference Image|remains noindex until source and Reference Image review/.test(html))throw new Error(`${prefix}${id}: stale pre-publication footer remains`);
  const url=`https://nicheworks.app/tools/pattern-dictionary/${prefix}patterns/${id}/`;if(!sitemap.includes(`<loc>${url}</loc>`))throw new Error(`${prefix}${id}: missing from sitemap`);detailCount++;
}
if(detailCount!==80)throw new Error(`expected 80 detail pages, got ${detailCount}`);
if(/final verification is still pending|最終verified前|現在はreviewed/.test(app))throw new Error('runtime still exposes pre-publication review messaging');
if(!homeJa.includes('現在の40件')||!homeEn.includes('The current 40 entries'))throw new Error('home publication count must be 40 in JA/EN');
if(!homeJa.includes('data-family="stripe"')||!homeJa.includes('data-family="dot"')||!homeEn.includes('data-family="stripe"')||!homeEn.includes('data-family="dot"'))throw new Error('JA/EN home must expose stripe and dot visual filters');
console.log('OK: 40/40 patterns and Reference Images are verified, 80/80 detail pages are indexable and in sitemap, and JA/EN homes expose the expanded visual filters.');
