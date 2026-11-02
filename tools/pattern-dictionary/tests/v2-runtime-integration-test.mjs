import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const noBoot=source.slice(0,source.lastIndexOf('const page=document.body.dataset.page,lang='));
if(noBoot.length<20000||noBoot.length===source.length)throw new Error('app.js boot marker not found');
let activePattern='sakura-motif',activeLang='ja';
const nodes={};
for(const id of ['#detail','#lang-link','#pattern-grid','#pattern-count','#q','#autocomplete'])nodes[id]={innerHTML:'',textContent:'',href:'',dataset:{},setAttribute(){},contains(){return false}};
nodes['#detail'].insertAdjacentHTML=function(_where,s){this.innerHTML+=s};
const doc={
  body:{dataset:{page:'none',get patternId(){return activePattern}}},
  documentElement:{get lang(){return activeLang}},
  querySelector:s=>nodes[s]||null,
  querySelectorAll:s=>s==='[data-axis]'?[]:[],
  addEventListener(){},
};
const fetchStatic=async url=>{
  const name=String(url).replace(/^\/tools\/pattern-dictionary\//,'');
  if(name.startsWith('/')||name.includes('..'))throw new Error('unsafe fetch '+url);
  const json=JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
  return {ok:true,json:async()=>json};
};
const context=vm.createContext({fetch:fetchStatic,URL,URLSearchParams,document:doc,window:{},console,location:{search:''},history:{replaceState(){}}});
vm.runInContext(noBoot,context,{timeout:3000});
const patterns=await vm.runInContext('patterns()',context);
const sources=await vm.runInContext('sources()',context);
if(patterns.length!==115)throw new Error('browser runtime not serving 115 identities: '+patterns.length);
for(const id of ['sakura-motif','ume-motif','kiku-motif','tsuru-motif','yukiwa','kanzemizu','shokko','matsukawabishi','bishamon-kikko','tachibana-motif','noshi-motif','goshoguruma','temari-motif','sankuzushi','kasuri']){
  const p=patterns.find(x=>x.id===id);
  if(!p?.taxonomy?.types.includes(id==='kasuri'?'technique':'motif')||!p?.definition?.ja||!p?.definition?.en)throw new Error('v2 record not merged or concept type incorrect: '+id);
  if(!sources[id]?.sources?.length)throw new Error('v2 source links not merged: '+id);
  if(!p.reference_path.endsWith(id+'.svg'))throw new Error('reference path missing '+id);
}

const kasuri=patterns.find(p=>p.id==='kasuri');
if(kasuri.verification_state!=='qualified'||kasuri.taxonomy.appearance.length!==0)throw new Error('Kasuri must remain a qualified technique with no universal appearance');
for(const [lang,query,id] of [
 ['ja','桜文様','sakura-motif'],['ja','梅文様','ume-motif'],['ja','菊文様','kiku-motif'],
 ['ja','鶴文様','tsuru-motif'],['ja','雪輪文様','yukiwa'],
 ['en','cherry blossom pattern','sakura-motif'],['en','plum blossom pattern','ume-motif'],
 ['en','chrysanthemum pattern','kiku-motif'],['en','crane motif','tsuru-motif'],
 ['en','yukiwa motif','yukiwa'],
 ['ja','観世水文様','kanzemizu'],['ja','蜀江文','shokko'],
 ['ja','松皮菱文様','matsukawabishi'],['ja','毘沙門亀甲','bishamon-kikko'],
 ['ja','橘文様','tachibana-motif'],
 ['en','Kanze Water Motif','kanzemizu'],['en','Shokko Brocade Motif','shokko'],
 ['en','Pine-Bark Diamond Motif','matsukawabishi'],
 ['en','Bishamon Kikko Triple-Hexagon Motif','bishamon-kikko'],['en','Tachibana Citrus Motif','tachibana-motif'],
 ['ja','束ね熨斗文様','noshi-motif'],['ja','御所車文様','goshoguruma'],
 ['ja','手毬文様','temari-motif'],['ja','三崩し文様','sankuzushi'],['ja','絣','kasuri'],
 ['en','Bundled Noshi Motif','noshi-motif'],['en','Gosho-guruma Carriage Motif','goshoguruma'],
 ['en','Temari Ball Motif','temari-motif'],['en','Sankuzushi Three-Bar Motif','sankuzushi'],
 ['en','Kasuri Resist-Dyed Weave','kasuri']
]){
 const res=await vm.runInContext('rank('+JSON.stringify(query)+','+JSON.stringify(lang)+')',context);
 if(res.results[0]?.pattern.id!==id)throw new Error('wrong v2 search ranking '+lang+' '+query+': '+res.results[0]?.pattern.id);
}
for(const lang of ['ja','en']){
 activeLang=lang;
 for(const id of ['sakura-motif','ume-motif','kiku-motif','tsuru-motif','yukiwa','kanzemizu','shokko','matsukawabishi','bishamon-kikko','tachibana-motif','noshi-motif','goshoguruma','temari-motif','sankuzushi','kasuri']){
  activePattern=id;nodes['#detail'].innerHTML='';
  await vm.runInContext('initDetail('+JSON.stringify(lang)+')',context);
  const html=nodes['#detail'].innerHTML;
  if(!html.includes('pd-sources')||!html.includes('pd-source-list'))throw new Error('source panel not mounted: '+lang+' '+id);
  if(!html.includes('reference-v2/'+id+'.svg'))throw new Error('SVG not mounted: '+lang+' '+id);
  if(!html.includes('https://'))throw new Error('links missing: '+lang+' '+id);
 }
}
activeLang='ja';nodes['#pattern-grid'].innerHTML='';nodes['#pattern-count'].textContent='';
await vm.runInContext("initHome('ja')",context);
if(nodes['#pattern-count'].textContent!=='115件')throw new Error('JA home count is not 115');
console.log('OK: browser runtime loads 115 terms; 30 supplemental search forms resolve correctly; 30 bilingual detail panels show SVG and sources; home lists 115.');
