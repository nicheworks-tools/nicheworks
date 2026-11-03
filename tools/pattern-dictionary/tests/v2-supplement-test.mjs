import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJSON=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base=readJSON('data/patterns.json');
const v2=readJSON('data/v2-extension.json');
const backlog=readJSON('data/coverage-backlog.json');
const taxonomy=readJSON('data/taxonomy-v2.json');
const sitemap=fs.readFileSync(path.resolve(root,'..','..','sitemap.xml'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const existing=new Set(base.map(x=>x.id));
const requiredNew=['guilloche','rosette-ornament','sunburst','concentric-circles','mosaic-pattern','art-deco-fan','op-art-pattern','halftone-dots','topographic-contours','triangle-tessellation'];
assert(base.length===100&&existing.size===100,'canonical v1 freeze violated');
assert(v2.entries.length>=30,'v2 supplement regressed below 30 published entries');
assert(v2.schema_version.startsWith('pattern-dictionary-v2-supplement-'),'unsupported v2 publication schema');
const ids=v2.entries.map(x=>x.id);
assert(new Set(ids).size===ids.length,'supplement duplicate IDs');
assert(requiredNew.every(id=>ids.includes(id)),'2026-11-03 reviewed wave missing published identities');
assert(backlog.candidates.length+ids.length===87,'original 87-candidate coverage inventory must remain conserved');
const types=Object.keys(taxonomy.concept_types),appearance=Object.keys(taxonomy.appearance_groups),contexts=Object.keys(taxonomy.contexts);
let citationCount=0,illustrationCount=0;
for(const e of v2.entries){
 const id=e.id,p=e.production,s=e.source,t=e.runtime?.taxonomy;
 assert(!existing.has(id),'v2 overlaps frozen canonical ID: '+id);
 assert(p?.pattern_id===id&&s?.pattern_id===id&&e.runtime?.id===id,'entry identity mismatch: '+id);
 assert(p.definition?.ja&&p.definition?.en,'missing bilingual definition: '+id);
 assert(p.names?.ja&&p.names?.en,'missing bilingual names: '+id);
 assert((p.distinguishing_features?.ja||[]).length>=3&&(p.distinguishing_features?.en||[]).length>=3,'missing 3+ JA/EN identification cues: '+id);
 assert((p.common_uses?.ja||[]).length&&(p.common_uses?.en||[]).length,'missing bilingual uses: '+id);
 assert(p.verification_state===s.verification_state&&['verified','qualified'].includes(s.verification_state),'unreviewed or contradictory provenance: '+id);
 if(s.verification_state==='qualified')assert(p.qualification?.ja&&p.qualification?.en,'qualified concept has no bilingual scope note: '+id);
 assert(Array.isArray(s.sources)&&s.sources.length>=2,'at least two referenced sources required: '+id);
 const sourceLinks=new Set();
 for(const item of s.sources){
  assert(item.publisher&&(item.supports||[]).length,'attribution lacks publisher and support claim: '+id);
  const url=new URL(item.url);
  assert(url.protocol==='https:'&&!sourceLinks.has(item.url),'invalid or repeated source URL: '+id);
  sourceLinks.add(item.url);citationCount++;
 }
 assert(t?.types?.length,'concept type is absent: '+id);
 for(const type of t.types)assert(types.includes(type),'invalid concept type '+type+' for '+id);
 for(const visual of t.appearance||[])assert(appearance.includes(visual),'invalid appearance '+visual+' for '+id);
 for(const context of t.contexts||[])assert(contexts.includes(context),'invalid context '+context+' for '+id);
 assert(!backlog.candidates.some(x=>x.id===id),'published item remains unpublished backlog: '+id);
 assert(e.reference?.path==='assets/reference-v2/'+id+'.svg','invalid reference image path: '+id);
 const svg=fs.readFileSync(path.join(root,e.reference.path),'utf8');
 assert(svg.startsWith('<svg ')&&svg.includes('width="1536"')&&svg.includes('height="1536"')&&svg.includes('<defs>'),'original SVG dimensions or structure missing: '+id);
 assert((svg.match(/<use href="#motif"/g)||[]).length===9,'expected 3x3 reference repeat: '+id);
 assert(!/<(script|image|foreignObject)\b/i.test(svg),'unsafe SVG content: '+id);
 illustrationCount++;
 const ja='https://nicheworks.app/tools/pattern-dictionary/patterns/'+id+'/';
 const en='https://nicheworks.app/tools/pattern-dictionary/en/patterns/'+id+'/';
 for(const [lang,rel,url] of [['ja','patterns/'+id+'/index.html',ja],['en','en/patterns/'+id+'/index.html',en]]){
  const html=fs.readFileSync(path.join(root,rel),'utf8');
  assert(html.includes('data-pattern-id="'+id+'"'),'detail ID drift: '+rel);
  assert(html.includes('rel="canonical" href="'+url+'"'),'canonical drift: '+rel);
  assert(html.includes('<meta name="robots" content="index,follow">'),'detail not indexable: '+rel);
  assert(html.includes('hreflang="ja" href="'+ja+'"')&&html.includes('hreflang="en" href="'+en+'"'),'reciprocal hreflang mismatch: '+rel);
  assert(html.includes('property="og:image" content="https://nicheworks.app/tools/pattern-dictionary/'+e.reference.path+'"'),'social image mismatch: '+rel);
  assert(html.includes('"inLanguage":"'+lang+'"'),'structured data language mismatch: '+rel);
  assert(sitemap.includes('<loc>'+url+'</loc>'),'published URL not in sitemap: '+rel);
 }
}
for(const id of requiredNew)assert(!backlog.candidates.some(x=>x.id===id),'newly published item still in editorial queue: '+id);
for(const lang of ['ja','en']){
 const html=fs.readFileSync(path.join(root,lang==='ja'?'index.html':'en/index.html'),'utf8');
 assert(html.includes(String(100+v2.entries.length)),lang+' displayed collection count is stale');
}
const kasuri=v2.entries.find(x=>x.id==='kasuri');
assert(kasuri.production.verification_state==='qualified'&&kasuri.runtime.taxonomy.types.includes('technique')&&kasuri.runtime.taxonomy.appearance.length===0,'kasuri must remain a qualified technique');
for(const id of ['guilloche','mosaic-pattern','op-art-pattern','topographic-contours']){
 const e=v2.entries.find(x=>x.id===id);
 assert(e?.production.verification_state==='qualified'&&e?.production.qualification?.ja&&e?.production.qualification?.en,'non-universal scope qualification missing: '+id);
}
assert(v2.entries.find(x=>x.id==='mosaic-pattern').runtime.taxonomy.types.includes('technique'),'mosaic should not be classified as one fixed printed motif');
assert(v2.entries.find(x=>x.id==='op-art-pattern').runtime.taxonomy.types.includes('effect'),'Op Art visual-effect category missing');
assert(app.includes('fetch(V2)')&&app.includes('reference_path')&&app.includes('sourceMap[p.id]'),'browser must load new source and illustration paths');
console.log('OK: '+(100+v2.entries.length)+' dictionary entries, '+(2*(100+v2.entries.length))+' bilingual detail URLs, '+illustrationCount+' supplemental SVGs, '+citationCount+' source references; '+backlog.candidates.length+' unpublished candidates, and qualified visual-effect/technique boundaries.');
