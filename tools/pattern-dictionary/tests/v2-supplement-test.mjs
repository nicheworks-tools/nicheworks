import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'data/patterns.json'),'utf8'));
const v2=JSON.parse(fs.readFileSync(path.join(root,'data/v2-extension.json'),'utf8'));
const backlog=JSON.parse(fs.readFileSync(path.join(root,'data/coverage-backlog.json'),'utf8'));
const sitemap=fs.readFileSync(path.resolve(root,'..','..','sitemap.xml'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const expected=['sakura-motif','ume-motif','kiku-motif','tsuru-motif','yukiwa','kanzemizu','shokko','matsukawabishi','bishamon-kikko','tachibana-motif','noshi-motif','goshoguruma','temari-motif','sankuzushi','kasuri'];
const assert=(ok,s)=>{if(!ok)throw new Error(s)};
assert(base.length===100,'v1 canonical source must remain frozen');
assert(v2.schema_version==='pattern-dictionary-v2-supplement-3','v2 supplement schema mismatch');
assert(v2.entries.length===15,'fifteen supplemental entries required');
assert(new Set(v2.entries.map(x=>x.id)).size===15,'duplicate supplement IDs');
assert(backlog.candidates.length===72,'remaining backlog count mismatch');
for(const e of v2.entries){
 assert(expected.includes(e.id)&&!base.some(x=>x.id===e.id),'supplement ID unexpectedly overlaps v1 '+e.id);
 assert(e.production?.definition?.ja&&e.production?.definition?.en,'missing bilingual definition '+e.id);
 assert((e.production.distinguishing_features.ja||[]).length>=3&&(e.production.distinguishing_features.en||[]).length>=3,'missing comparison cues '+e.id);
 assert(e.source?.sources?.length>=2,'missing independent attribution links '+e.id);
 assert(e.production.verification_state===e.source.verification_state,'source verification mismatch '+e.id);
 assert((e.runtime?.taxonomy?.types||[]).includes(e.id==='kasuri'?'technique':'motif'),'classification mismatch '+e.id);
 assert(!backlog.candidates.some(x=>x.id===e.id),'published supplement still in backlog '+e.id);
 for(const s of e.source.sources){const u=new URL(s.url);assert(u.protocol==='https:','non-HTTPS source '+e.id);assert(s.publisher&&s.supports?.length,'unsupported source '+e.id)}
 const svg=fs.readFileSync(path.join(root,e.reference.path),'utf8');
 assert(svg.startsWith('<svg ')&&svg.includes('width="1536"')&&svg.includes('height="1536"')&&svg.includes('<defs>'),'missing original vector reference '+e.id);
 assert((svg.match(/<use href="#motif"/g)||[]).length===9,'image must repeat 3x3: '+e.id);
 assert(!/<(script|image|foreignObject)\b/i.test(svg),'unsafe external or executable SVG '+e.id);
 for(const prefix of ['','en/']){
  const rel=prefix+'patterns/'+e.id+'/index.html',html=fs.readFileSync(path.join(root,rel),'utf8');
  const url='https://nicheworks.app/tools/pattern-dictionary/'+rel.replace(/index\.html$/,'');
  assert(html.includes('<meta name="robots" content="index,follow">'),'indexable detail missing '+rel);
  assert(html.includes('rel="canonical" href="'+url+'"'),'canonical mismatch '+rel);
  assert(html.includes('data-pattern-id="'+e.id+'"'),'detail identity mismatch '+rel);
  assert(html.includes('og:image" content="https://nicheworks.app/tools/pattern-dictionary/'+e.reference.path+'"'),'share image missing '+rel);
  assert(sitemap.includes('<loc>'+url+'</loc>'),'sitemap missing '+rel);
  assert(html.includes('hreflang="ja"')&&html.includes('hreflang="en"'),'language links missing '+rel);
 }
}
const kasuri=v2.entries.find(x=>x.id==='kasuri');
assert(kasuri.production.verification_state==='qualified'&&kasuri.production.qualification?.ja&&kasuri.production.qualification?.en,'kasuri technique and qualified scope must be preserved');
assert(kasuri.runtime.taxonomy.appearance.length===0,'kasuri cannot be reduced to one fixed pattern image');
const yukiwa=v2.entries.find(x=>x.id==='yukiwa');
assert(yukiwa.source.verification_state==='qualified'&&yukiwa.production.qualification?.ja&&yukiwa.production.qualification?.en,'yukiwa origin uncertainty must be preserved');
assert(app.includes('fetch(V2)')&&app.includes('reference_path')&&app.includes('sourceMap[p.id]'),'runtime must use v2, original drawings and provenance');
for(const [lang,file] of [['ja','index.html'],['en','en/index.html']])assert(fs.readFileSync(path.join(root,file),'utf8').includes('115'),lang+' homepage count not updated');
const cited=v2.entries.reduce((n,e)=>n+e.source.sources.length,0);
assert(cited===38,'source-link count mismatch '+cited);
console.log('OK: 115 browseable records, fifteen source-backed supplemental entries, '+cited+' attribution links, fifteen 1536 SVG references, 30 static bilingual detail URLs and 72 remaining unpublished concepts.');
