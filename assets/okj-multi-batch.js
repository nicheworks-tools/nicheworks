(function(w){'use strict';
const core=w.OkjMultiCore, FEATURES=core.FEATURES;
function vals(v){return (Array.isArray(v)?v:[v]).filter(x=>typeof x==='string'&&x);}
function lookup(dict){const rev=new Map();
function put(n,o){const list=rev.get(n)||[];if(!list.includes(o))list.push(o);rev.set(n,list);}
Object.entries(dict.old_to_new).forEach(([old,v])=>vals(v).forEach(n=>put(n,old)));
Object.entries(dict.new_to_old||{}).forEach(([n,v])=>vals(v).forEach(o=>put(n,o)));
return rev;}
function info(ch){const cp=ch.codePointAt(0),hex=cp.toString(16).toUpperCase();
return {char:ch,unicode:'U+'+hex,decimal:cp,htmlHex:'&#x'+hex+';',htmlDecimal:'&#'+cp+';',
utf16:[...ch].map(c=>{const units=[];for(let i=0;i<c.length;i++)units.push(c.charCodeAt(i).toString(16).toUpperCase().padStart(4,'0'));return units.join(' ');}).join(' '),
compatibility:(cp>=0xF900&&cp<=0xFAFF)||(cp>=0x2F800&&cp<=0x2FA1F),
supplementary:cp>0xFFFF,variationSelector:(cp>=0xFE00&&cp<=0xFE0F)||(cp>=0xE0100&&cp<=0xE01EF)};}
function modern(text,dict,reverse,options){const dir=options.direction==='new-to-old'?'new-to-old':'old-to-new';
const policy=options.policy==='first'?'first':'conservative';
const excluded=[];if(options.exclude!==false){
for(const re of [/https?:\/\/[^\s]+/g,/\x60{3}[\s\S]*?\x60{3}/g]){
let m;while((m=re.exec(text)))excluded.push([m.index,m.index+m[0].length]);}}
let output='',offset=0;const replacements=[],ambiguities=[];
for(const ch of text){let candidates=[];
if(!excluded.some(r=>offset>=r[0]&&offset<r[1])&&!(options.exclude!==false&&ch.charCodeAt(0)<=127)){
candidates=dir==='new-to-old'?(reverse.get(ch)||[]):vals(dict.old_to_new[ch]);}
candidates=[...new Set(candidates.filter(x=>x!==ch))];
const target=candidates.length===1||candidates.length>1&&(policy==='first'||dir==='old-to-new')?candidates[0]:ch;
if(target!==ch)replacements.push({from:ch,to:target});
if(candidates.length>1&&dir==='new-to-old')ambiguities.push({char:ch,candidates,selected:target});
output+=target;offset+=ch.length;}
return {input:text,output,status:replacements.length?'changed':'unchanged',details:{direction:dir,policy,replacements,ambiguities}};}
function documentRow(text,dict){let output='',total=0;const found=new Map();
for(const ch of text){const candidates=vals(dict.old_to_new[ch]),target=candidates[0]||ch;output+=target;
if(candidates.length){total++;const row=found.get(ch)||{old:ch,modern:candidates,count:0};row.count++;found.set(ch,row);}}
return {input:text,output,status:total?'reference_candidate':'no_reference_match',details:{total,detected:[...found.values()]}};}
function characters(text,kind,dict,reverse){const items=[...new Set([...text].filter(ch=>ch.trim()))].map(ch=>({
...info(ch),modern:vals(dict.old_to_new[ch]),old:reverse.get(ch)||[]}));
return {input:text,output:items.map(x=>kind==='unicode'?x.char+' '+x.unicode:
x.char+' ('+x.unicode+')'+(x.modern.length?' → '+x.modern.join('/'):'')+(x.old.length?' ← '+x.old.join('/'):'')).join(' / '),
status:kind==='unicode'?'unicode_reference':items.length>1?'comparison_reference':'single_glyph',
details:{characters:items}};}
function run(kind,rows,dict,gate,options={}){if(!core.allowed(gate,kind))return {ok:false,error:'pro_required'};
const checked=core.validate(rows);if(!checked.ok)return checked;
if(!dict?.old_to_new||typeof dict.old_to_new!=='object'||Array.isArray(dict.old_to_new))return {ok:false,error:'dictionary_unavailable'};
const reverse=lookup(dict);
return {ok:true,kind,count:checked.rows.length,rows:checked.rows.map((text,i)=>({
row:i+1,...(kind==='modernizer'?modern(text,dict,reverse,options):kind==='document'?documentRow(text,dict):characters(text,kind,dict,reverse))})),
disclaimer:'Dictionary reference only. Official name/glyph, historical transcription, font and system display must be verified.'};}
function cell(v){let x=String(v??'');if(/^[\s\uFEFF]*[=+\-@]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"';}
function exportData(result,gate,format){if(!result?.ok||!core.allowed(gate,result.kind))return {ok:false,error:'pro_required'};
if(format==='json')return {ok:true,filename:'old-kanji-'+result.kind+'-batch.json',mime:'application/json;charset=utf-8',
content:JSON.stringify({schemaVersion:'okj-batch-v2',kind:result.kind,rows:result.rows,disclaimer:result.disclaimer},null,2)};
if(format!=='csv')return {ok:false,error:'invalid_format'};
const out=['row,input,output,status,details',...result.rows.map(x=>[x.row,x.input,x.output,x.status,JSON.stringify(x.details)].map(cell).join(','))];
return {ok:true,filename:'old-kanji-'+result.kind+'-batch.csv',mime:'text/csv;charset=utf-8',content:'\uFEFF'+out.join('\r\n')};}
w.OldKanjiMultiBatch={FEATURES,run,exportData,info,lookup};})(window);
