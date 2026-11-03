import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJSON=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const supplement=readJSON('data/v2-extension.json').entries;
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const boot='const page=document.body.dataset.page,lang=';
const script=app.slice(0,app.lastIndexOf(boot));
if(script.length<20000||script.length===app.length)throw new Error('app bootstrap not found');
let activePattern=supplement[0].id,activeLang='ja';
const nodes={};
for(const id of ['#detail','#lang-link','#pattern-grid','#pattern-count','#q','#autocomplete'])nodes[id]={innerHTML:'',textContent:'',href:'',dataset:{},setAttribute(){},contains(){return false}};
nodes['#detail'].insertAdjacentHTML=function(_where,text){this.innerHTML+=text};
const doc={body:{dataset:{page:'none',get patternId(){return activePattern}}},documentElement:{get lang(){return activeLang}},querySelector:s=>nodes[s]||null,querySelectorAll:_=>[],addEventListener(){}};
const fetchStatic=async url=>{
 const loc=String(url).replace(/^\/tools\/pattern-dictionary\//,'');
 if(loc.startsWith('/')||loc.includes('..'))throw new Error('invalid local fetch: '+url);
 const data=readJSON(loc);return{ok:true,json:async()=>data};
};
const ctx=vm.createContext({fetch:fetchStatic,URL,URLSearchParams,document:doc,window:{},console,location:{search:''},history:{replaceState(){}}});
vm.runInContext(script,ctx,{timeout:3000});
const patterns=await vm.runInContext('patterns()',ctx);
const sourceMap=await vm.runInContext('sources()',ctx);
const expected=100+supplement.length;
if(expected<130||patterns.length!==expected||new Set(patterns.map(x=>x.id)).size!==expected)throw new Error('browser runtime identity drift: '+patterns.length+'/'+expected);
let queries=0,details=0;
for(const e of supplement){
 const p=patterns.find(x=>x.id===e.id);
 if(!p?.taxonomy?.types?.length||!p?.definition?.ja||!p?.definition?.en||!p.reference_path.endsWith(e.id+'.svg'))throw new Error('unmerged v2 content: '+e.id);
 if(!sourceMap[e.id]?.sources?.length)throw new Error('unmerged source provenance: '+e.id);
 for(const lang of ['ja','en']){
  const name=e.production.names[lang];
  const results=await vm.runInContext('rank('+JSON.stringify(name)+','+JSON.stringify(lang)+')',ctx);
  if(results.results[0]?.pattern.id!==e.id)throw new Error('exact-name search does not return '+e.id+' first: '+lang+' '+name+'; got '+results.results[0]?.pattern.id);
  queries++;
  activeLang=lang;activePattern=e.id;nodes['#detail'].innerHTML='';
  await vm.runInContext('initDetail('+JSON.stringify(lang)+')',ctx);
  const html=nodes['#detail'].innerHTML;
  if(!html.includes('pd-sources')||!html.includes('pd-source-list')||!html.includes('reference-v2/'+e.id+'.svg'))throw new Error('missing source or original image in '+lang+' '+e.id);
  details++;
 }
}
nodes['#pattern-grid'].innerHTML='';nodes['#pattern-count'].textContent='';
await vm.runInContext("initHome('ja')",ctx);
if(nodes['#pattern-count'].textContent!==String(expected)+'件')throw new Error('JA count incorrect: '+nodes['#pattern-count'].textContent);
console.log('OK: browser runtime '+expected+' entries, '+queries+' JA/EN exact-name searches, '+details+' source/image detail mounts, and correct home count.');
