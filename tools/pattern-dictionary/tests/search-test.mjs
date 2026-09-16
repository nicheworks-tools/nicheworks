import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const raw=JSON.parse(fs.readFileSync(path.join(root,'data/patterns.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'data/production-content.json'),'utf8'));
const dict=JSON.parse(fs.readFileSync(path.join(root,'data/search-dictionary.json'),'utf8'));
const cases=JSON.parse(fs.readFileSync(path.join(root,'tests/search-cases.json'),'utf8'));
const MATCH_THRESHOLD=20;
const om=Object.fromEntries(prod.patterns.map(x=>[x.pattern_id,x]));
const ps=raw.map(p=>{const o=om[p.id]||{};return{...p,...o,id:p.id,names:{...p.names,...(o.names||{})},aliases:{ja:[...new Set([...(p.aliases?.ja||[]),...(o.aliases?.ja||[])])],en:[...new Set([...(p.aliases?.en||[]),...(o.aliases?.en||[])])]},colors:{...p.colors,...(o.colors||{})},relationships:p.relationships,search_terms:p.search_terms,families:p.families,motifs:p.motifs,visual:p.visual,uses:p.uses,culture:p.culture}});
const norm=s=>(s||'').toLowerCase().normalize('NFKC').replace(/[’']/g,"'").replace(/[‐‑‒–—―]/g,'-').replace(/\s+/g,' ').trim();
const tokens=s=>norm(s).split(/[\s,、。/]+/).filter(Boolean);

function editDistance(a,b){
  const m=a.length,n=b.length,prev=Array.from({length:n+1},(_,i)=>i),cur=new Array(n+1);
  for(let i=1;i<=m;i++){
    cur[0]=i;
    for(let j=1;j<=n;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<=n;j++)prev[j]=cur[j];
  }
  return prev[n];
}
const TYPO_GENERIC=new Set(['check','checks','stripe','stripes','pattern','patterns','plaid','dot','dots','print','prints','black','white','red','blue','green','gray','grey','brown','navy','purple','yellow','orange']);
function nearTypo(a,b){
  a=norm(a);b=norm(b);
  if(!a||!b||a===b||Math.min(a.length,b.length)<5||Math.abs(a.length-b.length)>1||TYPO_GENERIC.has(a)||TYPO_GENERIC.has(b)||a+'s'===b||b+'s'===a)return false;
  if(a.length===b.length){const d=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])d.push(i);if(d.length===2&&d[1]===d[0]+1&&a[d[0]]===b[d[1]]&&a[d[1]]===b[d[0]])return true;}
  return editDistance(a,b)<=1;
}
function typoHit(q,p){
  const qt=tokens(q),ct=[p.names?.ja,p.names?.en,...(p.aliases?.ja||[]),...(p.aliases?.en||[])].flatMap(tokens);
  return qt.some(a=>ct.some(b=>nearTypo(a,b)));
}
function bag(p,lang){return norm([p.names?.[lang],p.names?.[lang==='ja'?'en':'ja'],...(p.aliases?.[lang]||[]),...(p.search_terms?.[lang]||[]),...(p.motifs||[]),...(p.families||[]),...(p.visual?.geometry||[]),...(p.visual?.line||[]),...(p.colors?.primary||[]),...(p.uses||[]),...(p.culture||[]),p.term_scope,p.definition?.[lang],...(p.distinguishing_features?.[lang]||[]),...(p.common_uses?.[lang]||[])].join(' '))}
function signalNegated(nq,nk,lang){return lang==='en'?(nq.includes('not '+nk)||nq.includes('without '+nk)):(nq.includes(nk+'じゃない')||nq.includes(nk+'ではない'))}
function interpret(q,lang){
  const nq=norm(q),out=[],seen=new Set();
  for(const l of [lang,lang==='ja'?'en':'ja'])for(const[k,v]of Object.entries(dict[l]||{})){const nk=norm(k);if(nq.includes(nk)&&!signalNegated(nq,nk,l)&&!seen.has(nk)){seen.add(nk);out.push({label:k,...v});}}
  return out.filter((x,i,a)=>!a.some((y,j)=>j!==i&&norm(y.label).length>norm(x.label).length&&norm(y.label).includes(norm(x.label))));
}
function rank(q,lang){
  const nq=norm(q),sig=interpret(q,lang),qt=tokens(nq);
  return ps.map(p=>{let score=0;const add=n=>score+=n,name=norm(p.names[lang]),other=norm(p.names[lang==='ja'?'en':'ja']);
    if(nq===name)add(100);if(nq===other)add(70);
    for(const a of p.aliases[lang]||[]){const na=norm(a);if(nq===na)add(90);else if(nq.includes(na)||(qt.length>=2&&na.includes(nq)))add(45)}
    for(const t of p.search_terms[lang]||[]){const nt=norm(t);if(nq.includes(nt))add(55);else if(qt.length>=2&&nq.length>=4&&nt.includes(nq))add(12)}
    if(typoHit(nq,p))add(38);
    const b=bag(p,lang);for(const tok of qt)if(tok.length>1&&b.includes(tok))add(12);
    for(const x of sig){if((x.ids||[]).includes(p.id))add(72);if((x.families||[]).some(v=>p.families.includes(v)))add(45);if((x.colors||[]).some(v=>(p.colors?.primary||[]).includes(v)))add(15);if((x.culture||[]).some(v=>(p.culture||[]).includes(v)))add(35);if((x.uses||[]).some(v=>(p.uses||[]).includes(v)))add(25);for(const c of x.concepts||[])if(b.includes(norm(c)))add(35)}
    return{pattern:p,score};
  }).sort((a,b)=>b.score-a.score||a.pattern.id.localeCompare(b.pattern.id));
}
function confidence(r,q='',lang='en'){if(!r.length||r[0].score<MATCH_THRESHOLD)return'LOW';const nq=norm(q),p=r[0].pattern,other=lang==='ja'?'en':'ja',exact=[p.names?.[lang],p.names?.[other],...(p.aliases?.[lang]||[]),...(p.aliases?.[other]||[])].some(v=>norm(v)===nq)||typoHit(nq,p),d=r[0].score-(r[1]?.score||0);if(tokens(nq).length===1&&!exact&&r[0].score>=35)return'MEDIUM';if(r[0].score>=70&&d>=20)return'HIGH';if(r[0].score>=35)return'MEDIUM';return'LOW'}

let fail=0;
for(const c of cases){
  const ranked=rank(c.query,c.lang),vis=ranked.filter(x=>x.score>=MATCH_THRESHOLD),top=vis[0]?.pattern.id,top3=vis.slice(0,3).map(x=>x.pattern.id),conf=confidence(vis,c.query,c.lang);
  let ok=true,expect=[];
  if(c.zero){ok=vis.length===0;expect.push('zero-result');}
  if(c.expected){const hit=c.top1?top===c.expected:top3.includes(c.expected);ok=ok&&hit;expect.push(`${c.expected} ${c.top1?'Top1':'Top3'}`);}
  if(c.confidence){ok=ok&&conf===c.confidence;expect.push(`${c.confidence} confidence`);}
  console.log(`${ok?'PASS':'FAIL'} ${c.lang} ${c.query} -> ${top||'ZERO'} [${top3.join(', ')}] ${conf}; expected ${expect.join(' + ')}`);
  if(!ok)fail++;
}
if(fail)process.exit(1);
console.log(`OK: ${cases.length}/${cases.length} search quality expectations passed.`);
