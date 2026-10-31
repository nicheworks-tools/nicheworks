(function(w){'use strict';
const FEATURES={modernizer:'okj.modernizer.batch',unicode:'okj.unicode.batch',variant:'okj.variant.batch',document:'okj.document.batch'};
function allowed(g,k){return !!(FEATURES[k]&&g&&g.active===true&&g.productId==='okj.toolkit_pro'&&g.featureId===FEATURES[k]);}
function validate(a){if(!Array.isArray(a))return {ok:false,error:'invalid_input'};
const rows=a.filter(v=>typeof v==='string'&&v.trim());
if(!rows.length)return {ok:false,error:'empty'};
if(rows.length>200)return {ok:false,error:'too_many_rows'};
if(rows.some(v=>[...v].length>2000))return {ok:false,error:'row_too_long'};
return {ok:true,rows};}
function lines(text){return typeof text==='string'?validate(text.replace(/^\uFEFF/,'').split(/\r\n|\n|\r/)):{ok:false,error:'invalid_input'};}
function csv(text,k){if(!FEATURES[k]||typeof text!=='string')return {ok:false,error:'invalid_csv'};
if(text.length>1048576)return {ok:false,error:'file_too_large'};
text=text.replace(/^\uFEFF/,'');
const rows=[];let row=[],cell='',inside=false,closed=false;
for(let i=0;i<text.length;i++){const c=text[i];
if(inside){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"'){inside=false;closed=true;}else cell+=c;}
else if(c==='"'&&!cell&&!closed){inside=true;}
else if(c===','){row.push(cell);cell='';closed=false;}
else if(c==='\n'||c==='\r'){row.push(cell);rows.push(row);row=[];cell='';closed=false;if(c==='\r'&&text[i+1]==='\n')i++;if(rows.length>202)return {ok:false,error:'too_many_rows'};}
else{if(c==='"'||closed)return {ok:false,error:'invalid_csv'};cell+=c;}}
if(inside)return {ok:false,error:'invalid_csv'};
if(row.length||cell){row.push(cell);rows.push(row);}
const nonempty=rows.filter(x=>x.some(y=>y.trim()));if(!nonempty.length)return {ok:false,error:'empty'};
const labels={modernizer:['text','source','文章','本文'],unicode:['text','character','文字','漢字'],variant:['text','characters','比較文字','異体字'],document:['text','document','文章','本文']};
let idx=nonempty[0].findIndex(x=>labels[k].includes(x.trim().toLowerCase()));
if(idx>=0)nonempty.shift();
else{if(nonempty.some(x=>x.length!==1))return {ok:false,error:'header_required'};idx=0;}
return validate(nonempty.map(x=>x[idx]||''));}
w.OkjMultiCore={FEATURES,allowed,validate,lines,csv};})(window);
