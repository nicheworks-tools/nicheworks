import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const published=read('data/patterns.json');
const source=read('data/wave2-source-verification.json');
const prod=read('data/wave2-production-content.json');
const compare=read('data/wave2-compare-guides.json');
const dict=read('data/wave2-search-dictionary.json');
const cases=read('tests/wave2-search-cases.json');

if(![20,40].includes(published.length))throw new Error(`unexpected runtime count ${published.length}`);
if(prod.phase!=='wave2-production-content'||prod.publication_state!=='staged-not-public')throw new Error('Wave 2 production pack remains immutable staging provenance');
const ledger=source.patterns.slice().sort((a,b)=>a.ordinal-b.ordinal);
const rows=prod.patterns.slice().sort((a,b)=>a.ordinal-b.ordinal);
if(ledger.length!==20||rows.length!==20)throw new Error(`expected 20/20 source/production rows, got ${ledger.length}/${rows.length}`);
const allIds=new Set(published.map(x=>x.id));
for(let i=0;i<20;i++){
  const s=ledger[i],r=rows[i],ordinal=i+21;
  if(r.ordinal!==ordinal||s.ordinal!==ordinal||r.pattern_id!==s.pattern_id)throw new Error(`ordinal/id mismatch at ${ordinal}`);
  if(!r.definition?.ja?.trim()||!r.definition?.en?.trim())throw new Error(`${r.pattern_id}: bilingual definition required`);
  if((r.distinguishing_features?.ja||[]).length<3||(r.distinguishing_features?.en||[]).length<3)throw new Error(`${r.pattern_id}: 3+ distinguishing features required in both languages`);
  if((r.common_uses?.ja||[]).length<3||(r.common_uses?.en||[]).length<3)throw new Error(`${r.pattern_id}: 3+ common uses required in both languages`);
  if(!(r.families||[]).length||!(r.motifs||[]).length)throw new Error(`${r.pattern_id}: family/motif metadata required`);
  if(!(r.search_terms?.ja||[]).length||!(r.search_terms?.en||[]).length)throw new Error(`${r.pattern_id}: bilingual search terms required`);
  if(!r.visual?.geometry?.length||!r.visual?.line?.length||!r.visual?.density?.length||!r.visual?.repetition?.length||!r.visual?.contrast?.length)throw new Error(`${r.pattern_id}: complete visual metadata required`);
  if((r.commerce_intents||[]).length<2||(r.commerce_intents||[]).length>4)throw new Error(`${r.pattern_id}: commerce intents must be 2-4 maintained queries`);
  for(const offer of r.commerce_intents){
    if(!offer.intent||!offer.query?.trim())throw new Error(`${r.pattern_id}: malformed commerce intent`);
    if(/[?&](q|k)=/i.test(offer.query))throw new Error(`${r.pattern_id}: commerce intent must store canonical query text, not a URL`);
  }
  if(published.length===40&&!allIds.has(r.pattern_id))throw new Error(`${r.pattern_id}: published runtime missing Wave 2 production row`);
}

if(compare.publication_state!=='staged-not-public'||compare.guides.length<10)throw new Error('Wave 2 compare provenance must contain at least 10 guides');
const waveIds=new Set(rows.map(x=>x.pattern_id));
for(const g of compare.guides){
  if(!g.summary?.ja||!g.summary?.en||!g.decisive_cue?.ja||!g.decisive_cue?.en)throw new Error(`${g.id}: bilingual summary and decisive cue required`);
}
for(const lang of ['ja','en'])for(const [term,v] of Object.entries(dict[lang]||{})){
  if(!term.trim())throw new Error(`blank ${lang} staged search term`);
  for(const id of v.ids||[])if(!waveIds.has(id)&&published.length===20&&!published.some(x=>x.id===id))throw new Error(`${term}: unresolved staged search id ${id}`);
}
if(cases.length<40)throw new Error(`expected at least 40 Wave 2 search cases, got ${cases.length}`);
for(const c of cases)if(!['ja','en'].includes(c.lang)||!c.query?.trim()||!waveIds.has(c.top1))throw new Error(`malformed staged search case: ${JSON.stringify(c)}`);

const norm=s=>(s||'').toLowerCase().normalize('NFKC').replace(/[’']/g,"'").replace(/[‐‑‒–—―]/g,'-').replace(/\s+/g,' ').trim();
const stagedPatterns=rows.map(r=>{const s=ledger.find(x=>x.pattern_id===r.pattern_id);return {...r,names:s.verified_names,aliases:s.verified_aliases,term_scope:s.term_scope,colors:{primary:s.color_guidance.primary},culture:r.families.includes('japanese')?['Japanese']:[]};});
function bag(p,lang){return norm([p.names?.[lang],p.names?.[lang==='ja'?'en':'ja'],...(p.aliases?.[lang]||[]),...(p.search_terms?.[lang]||[]),...(p.motifs||[]),...(p.families||[]),...(p.colors?.primary||[]),...(p.common_uses?.[lang]||[]),p.term_scope,p.definition?.[lang],...(p.distinguishing_features?.[lang]||[])].join(' '))}
function signals(q,lang){const nq=norm(q),out=[];for(const l of [lang,lang==='ja'?'en':'ja'])for(const [k,v] of Object.entries(dict[l]||{}))if(nq.includes(norm(k)))out.push(v);return out}
function score(p,q,lang){const nq=norm(q),b=bag(p,lang);let s=0;const name=norm(p.names?.[lang]),other=norm(p.names?.[lang==='ja'?'en':'ja']);if(nq===name)s+=100;if(nq===other)s+=70;for(const a of p.aliases?.[lang]||[]){const na=norm(a);if(nq===na)s+=90;else if(nq.includes(na))s+=45}for(const t of p.search_terms?.[lang]||[]){const nt=norm(t);if(nq.includes(nt)||nt.includes(nq))s+=55}for(const tok of nq.split(/[\s,、。/]+/).filter(Boolean))if(tok.length>1&&b.includes(tok))s+=12;for(const x of signals(q,lang)){if((x.ids||[]).includes(p.pattern_id))s+=72;if((x.families||[]).some(v=>p.families.includes(v)))s+=45;if((x.culture||[]).some(v=>p.culture.includes(v)))s+=35;for(const c of x.concepts||[])if(b.includes(norm(c)))s+=35}return s}
for(const c of cases){const ranked=stagedPatterns.map(p=>({id:p.pattern_id,score:score(p,c.query,c.lang)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));if(ranked[0]?.id!==c.top1)throw new Error(`staged search Top1 mismatch for ${JSON.stringify(c.query)}: expected ${c.top1}, got ${ranked[0]?.id} (${ranked[0]?.score})`)}

console.log(`OK: Wave 2 production provenance covers 20/20, ${compare.guides.length} compare guides, ${cases.length} search regressions, and maintained 2-4 Amazon intents per pattern; runtime state ${published.length}.`);
