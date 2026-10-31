(function(){'use strict';
const chunks=location.pathname.split('/').filter(Boolean);
const kinds={'kanji-modernizer':'modernizer','unicode-kanji-checker':'unicode',
'variant-kanji-compare':'variant','old-document-kanji-highlighter':'document'};
const kind=chunks[0]==='tools'?kinds[chunks[1]]:null;
if(!kind)return;
const PRODUCT='okj.toolkit_pro';
const lang=()=>document.documentElement.lang?.toLowerCase().startsWith('en')?'en':'ja';
const TEXT={
ja:{heading:'一括処理（Pro）',note:'1行を1件として最大200件（各2000文字）を処理します。CSVも利用できます。判定は辞書を使う参考情報で、正式な字体・文献解読を保証しません。入力内容は外部送信されません。',
input:'複数テキスト（1行1件）',file:'CSVファイル（text / 文章 / 本文 などの列）',run:'一括処理を実行',csv:'CSVで保存',json:'JSONで保存',
direction:'変換方向',oldNew:'旧字 → 新字',newOld:'新字 → 旧字',policy:'曖昧な候補',conservative:'保守的（変換しない）',first:'先頭候補を採用',
exclude:'ASCII・URL・コードブロックを変換しない',total:'処理件数',result:'一括処理結果',original:'入力',output:'結果',details:'詳しい判定',
empty:'入力がありません。',too_many_rows:'200件以内で入力してください。',row_too_long:'1件が2000文字を超えています。',
invalid_csv:'CSV形式が不正です。',header_required:'複数列CSVにはtext/文章/本文等の列見出しが必要です。',
file_too_large:'CSVは1MB以下で選んでください。',dictionary_unavailable:'辞書を取得できませんでした。',
pro_required:'Pro権利を確認できません。',processing:'処理中…',failed:'一括処理に失敗しました。',
ready:'CSVまたは改行区切りで入力してください。',downloadFirst:'先に一括処理してください。'},
en:{heading:'Batch processing (Pro)',note:'Process up to 200 entries (2000 characters each), one per line, or import CSV. Dictionary results are reference only, not verified official glyphs or historical transcription. Text stays in your browser.',
input:'Texts, one entry per line',file:'CSV file (text / 文章 / 本文 column)',run:'Run batch',csv:'Download CSV',json:'Download JSON',
direction:'Conversion direction',oldNew:'Old → modern',newOld:'Modern → old',policy:'Ambiguous candidates',conservative:'Conservative (keep source)',first:'Choose first candidate',
exclude:'Exclude ASCII, URLs and code blocks',total:'Rows',result:'Batch results',original:'Input',output:'Output',details:'Details',
empty:'No input.',too_many_rows:'Enter no more than 200 rows.',row_too_long:'A row exceeds 2000 characters.',
invalid_csv:'Invalid CSV quoting.',header_required:'Multi-column CSV needs a text/文章/本文 column.',
file_too_large:'CSV must be at most 1MB.',dictionary_unavailable:'Could not load dictionary.',
pro_required:'Pro entitlement could not be verified.',processing:'Processing…',failed:'Batch processing failed.',
ready:'Enter one record per line or choose a CSV.',downloadFirst:'Run the batch first.'}};
function t(x){return TEXT[lang()][x]||x;}
function create(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
async function mount(){
const bridge=window.NicheWorksProEntitlement,core=window.OkjMultiCore,engine=window.OldKanjiMultiBatch;
if(!bridge||!core||!engine)return;
const feature=core.FEATURES[kind];
const initial=await bridge.refreshProState({productId:PRODUCT,featureId:feature});
if(!initial.active||document.getElementById('okj-multi-batch'))return;
const main=document.querySelector('main');if(!main)return;
const panel=create('section');panel.id='okj-multi-batch';panel.className='okj-multi-batch';
const title=create('h2',t('heading')),note=create('p',t('note'));
const label=create('label',t('input')),field=create('textarea');field.id='okj-multi-input';field.rows=7;field.maxLength=405000;field.placeholder='舊學\\n廣島\\n﨑';
label.htmlFor=field.id;
const fileLabel=create('label',t('file')),upload=create('input');upload.type='file';upload.accept='.csv,text/csv';upload.id='okj-multi-csv';
fileLabel.htmlFor=upload.id;
const opts=create('div');opts.className='okj-multi-options';
const directionLabel=create('label',t('direction')),direction=create('select');
direction.id='okj-multi-direction';directionLabel.htmlFor=direction.id;
for(const [key,value] of [['oldNew','old-to-new'],['newOld','new-to-old']]){const option=create('option',t(key));option.value=value;direction.append(option);}
const policyLabel=create('label',t('policy')),policy=create('select');policy.id='okj-multi-policy';policyLabel.htmlFor=policy.id;
for(const [key,value] of [['conservative','conservative'],['first','first']]){const option=create('option',t(key));option.value=value;policy.append(option);}
const excludeLabel=create('label',t('exclude')),exclude=create('input');exclude.type='checkbox';exclude.checked=true;excludeLabel.prepend(exclude);
if(kind==='modernizer')opts.append(directionLabel,direction,policyLabel,policy,excludeLabel);
const actions=create('div');actions.className='okj-multi-actions';
const run=create('button',t('run')),csv=create('button',t('csv')),json=create('button',t('json'));
for(const b of [run,csv,json])b.type='button';csv.disabled=true;json.disabled=true;
actions.append(run,csv,json);
const status=create('p',t('ready'));status.className='okj-multi-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const resultsTitle=create('h3',t('result')),results=create('div');results.className='okj-multi-results';
panel.append(title,note,label,field,fileLabel,upload,opts,actions,status,resultsTitle,results);
const before=document.querySelector('#resultBlock,#summarySection,#resultSummary');
if(before)before.before(panel);else main.append(panel);
let cached=null,last=null,busy=false;
const recheck=()=>bridge.refreshProState({productId:PRODUCT,featureId:feature});
function message(code){status.textContent=t(code);}
function clear(){last=null;csv.disabled=true;json.disabled=true;results.replaceChildren();}
field.addEventListener('input',clear);upload.addEventListener('change',clear);
function render(){
results.replaceChildren();if(!last?.ok)return;
const summary=create('p',t('total')+': '+last.count),wrap=create('div');wrap.className='okj-multi-table-scroll';
const table=create('table'),head=create('thead'),hrow=create('tr');
for(const name of ['original','output','details'])hrow.append(create('th',t(name)));
head.append(hrow);table.append(head);
const body=create('tbody');
for(const row of last.rows){const tr=create('tr');
tr.append(create('td',row.input),create('td',row.output));
const detail=create('td'),code=create('pre',JSON.stringify(row.details,null,2));detail.append(code);tr.append(detail);body.append(tr);}
table.append(body);wrap.append(table);results.append(summary,wrap);csv.disabled=false;json.disabled=false;}
run.addEventListener('click',async()=>{
if(busy)return;busy=true;run.disabled=true;clear();message('processing');
try{
const gate=await recheck();if(!gate.active){message('pro_required');return;}
let incoming;if(upload.files?.length){
const selected=upload.files[0];if(selected.size>1048576){message('file_too_large');return;}
incoming=core.csv(await selected.text(),kind);
}else incoming=core.lines(field.value);
if(!incoming.ok){message(incoming.error);return;}
if(!cached){const target=kind==='modernizer'?'../kanji-modernizer/dict.json':'../old-kanji-reference/dict.json';
const response=await fetch(target,{cache:'force-cache'});if(!response.ok)throw Error('dictionary_unavailable');cached=await response.json();}
const result=engine.run(kind,incoming.rows,cached,gate,
{direction:direction.value,policy:policy.value,exclude:exclude.checked});
if(!result.ok){message(result.error);return;}
last=result;status.textContent=t('total')+': '+result.count;render();
}catch(e){message(e.message==='dictionary_unavailable'?'dictionary_unavailable':'failed');}
finally{busy=false;run.disabled=false;}
});
async function download(format){if(!last?.ok){message('downloadFirst');return;}
try{const gate=await recheck();if(!gate.active){message('pro_required');return;}
const data=engine.exportData(last,gate,format);if(!data.ok){message(data.error);return;}
const url=URL.createObjectURL(new Blob([data.content],{type:data.mime}));
const a=create('a');a.href=url;a.download=data.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}catch{message('failed');}}
csv.addEventListener('click',()=>download('csv'));json.addEventListener('click',()=>download('json'));
function relabel(){
title.textContent=t('heading');note.textContent=t('note');label.textContent=t('input');fileLabel.textContent=t('file');
run.textContent=t('run');csv.textContent=t('csv');json.textContent=t('json');resultsTitle.textContent=t('result');
directionLabel.textContent=t('direction');policyLabel.textContent=t('policy');
for(const o of direction.options)o.textContent=t(o.value==='old-to-new'?'oldNew':'newOld');
for(const o of policy.options)o.textContent=t(o.value);excludeLabel.lastChild.textContent=t('exclude');
if(last?.ok)render();}
new MutationObserver(relabel).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
