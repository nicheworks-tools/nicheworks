(function (global) {
  'use strict';
  var PRODUCT='okj.toolkit_pro';
  var FEATURES={name:'okj.name.batch',place:'okj.place.batch'};
  var MAX_ROWS=200,MAX_CHARS=400;
  function authorized(gate,kind) {
    return !!(FEATURES[kind] && gate && gate.active===true &&
      gate.productId===PRODUCT && gate.featureId===FEATURES[kind]);
  }
  function validateRow(value) {
    return typeof value==='string' && value.trim() && [...value].length<=MAX_CHARS;
  }
  function makeRows(lines) {
    if(!Array.isArray(lines))return {ok:false,error:'invalid_rows'};
    var rows=lines.map(function(v){return String(v);}).filter(function(v){return v.trim();});
    if(!rows.length)return {ok:false,error:'empty'};
    if(rows.length>MAX_ROWS)return {ok:false,error:'too_many_rows'};
    if(rows.some(function(v){return !validateRow(v);}))return {ok:false,error:'row_too_long'};
    return {ok:true,rows:rows};
  }
  function parseLines(text){
    if(typeof text!=='string')return {ok:false,error:'invalid_rows'};
    return makeRows(text.replace(/^\uFEFF/,'').split(/\r\n|\n|\r/));
  }
  function parseCsv(text,kind){
    if(typeof text!=='string'||!FEATURES[kind])return {ok:false,error:'invalid_csv'};
    if(text.length>1024*1024)return {ok:false,error:'file_too_large'};
    text=text.replace(/^\uFEFF/,'');
    var lines=[],row=[],cell='',quoted=false,justClosed=false;
    for(var i=0;i<text.length;i++){
      var c=text[i];
      if(quoted){
        if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}
        else if(c==='"') {quoted=false;justClosed=true;}
        else cell+=c;
      } else if(c==='"'&&cell===''&&!justClosed){quoted=true;}
      else if(c===','){row.push(cell);cell='';justClosed=false;}
      else if(c==='\r'||c==='\n'){
        row.push(cell);lines.push(row);row=[];cell='';justClosed=false;
        if(c==='\r'&&text[i+1]==='\n')i++;
        if(lines.length>MAX_ROWS+2)return {ok:false,error:'too_many_rows'};
      } else {
        if(c==='"'||justClosed)return {ok:false,error:'invalid_csv'};
        cell+=c;
      }
    }
    if(quoted)return {ok:false,error:'invalid_csv'};
    if(row.length||cell||justClosed){row.push(cell);lines.push(row);}
    lines=lines.filter(function(fields){return fields.some(function(x){return x.trim();});});
    if(!lines.length)return {ok:false,error:'empty'};
    var header=lines[0].map(function(x){return x.trim().toLowerCase();});
    var accepted=kind==='name'?['name','full name','氏名','名前','姓名','人名']:['place','place name','address','地名','住所','駅名','所在地'];
    var col=header.findIndex(function(x){return accepted.includes(x);});
    var firstIsHeader=col>=0;
    if(!firstIsHeader){
      if(lines.some(function(fields){return fields.length!==1;}))return {ok:false,error:'select_column'};
      col=0;
    }
    var body=firstIsHeader?lines.slice(1):lines;
    var values=[];
    for(var j=0;j<body.length;j++){
      if(!body[j][col]||!body[j][col].trim())continue;
      values.push(body[j][col]);
    }
    return makeRows(values);
  }
  function buildReverse(forward){
    var reverse=new Map();
    Object.entries(forward).forEach(function(pair){
      var old=pair[0],modern=Array.isArray(pair[1])?pair[1]:[pair[1]];
      modern.forEach(function(candidate){
        if(typeof candidate!=='string'||!candidate)return;
        var set=reverse.get(candidate)||[];
        if(!set.includes(old))set.push(old);
        reverse.set(candidate,set);
      });
    });
    return reverse;
  }
  function analyzeRows(input,dict,gate,kind){
    if(!authorized(gate,kind))return {ok:false,error:'pro_required'};
    var checked=makeRows(input);
    if(!checked.ok)return checked;
    var forward=dict?.old_to_new;
    if(!forward||typeof forward!=='object'||Array.isArray(forward))return {ok:false,error:'dictionary_unavailable'};
    var reverse=buildReverse(forward);
    var results=checked.rows.map(function(value,index){
      var matches=[];
      [...value].forEach(function(char){
        var forwardValue=Object.prototype.hasOwnProperty.call(forward,char)?forward[char]:null;
        var toModern=forwardValue?(Array.isArray(forwardValue)?forwardValue:[forwardValue]).filter(Boolean):[];
        var toOld=reverse.get(char)||[];
        if(toModern.length||toOld.length)matches.push({
          char:char,relationship:toModern.length?'old_to_modern':'modern_to_old',
          modernCandidates:toModern.slice(),oldCandidates:toOld.slice()
        });
      });
      return {row:index+1,input:value,status:matches.length?'reference_candidate':'no_reference_match',matches:matches};
    });
    return {ok:true,kind:kind,count:results.length,matched:results.filter(function(x){return x.matches.length>0;}).length,
      rows:results,disclaimer:'Reference candidates only; verify registered name or address spellings with official records.'};
  }
  function csvCell(value){
    // Defuse spreadsheet formula execution even if a user input starts with whitespace.
    var valueText=String(value==null?'':value);
    if(/^[\s\uFEFF]*[=+\-@]/.test(valueText))valueText="'"+valueText;
    return '"'+valueText.replace(/"/g,'""')+'"';
  }
  function exportCsv(result,gate){
    if(!result?.ok||!authorized(gate,result.kind))return {ok:false,error:'pro_required'};
    var lines=['row,input,status,character,relationship,modern_candidates,old_candidates'];
    result.rows.forEach(function(row){
      if(!row.matches.length){
        lines.push([row.row,row.input,row.status,'','','',''].map(csvCell).join(','));
      }else row.matches.forEach(function(item){
        lines.push([row.row,row.input,row.status,item.char,item.relationship,
          item.modernCandidates.join(' / '),item.oldCandidates.join(' / ')].map(csvCell).join(','));
      });
    });
    return {ok:true,filename:'old-kanji-'+result.kind+'-batch.csv',mime:'text/csv;charset=utf-8',content:'\uFEFF'+lines.join('\r\n')};
  }
  function exportJson(result,gate){
    if(!result?.ok||!authorized(gate,result.kind))return {ok:false,error:'pro_required'};
    return {ok:true,filename:'old-kanji-'+result.kind+'-batch.json',mime:'application/json;charset=utf-8',
      content:JSON.stringify({schemaVersion:'okj-batch-v1',kind:result.kind,disclaimer:result.disclaimer,rows:result.rows},null,2)};
  }
  global.OldKanjiNamePlaceBatch={FEATURES:FEATURES,MAX_ROWS:MAX_ROWS,authorized:authorized,
    parseLines:parseLines,parseCsv:parseCsv,analyzeRows:analyzeRows,exportCsv:exportCsv,exportJson:exportJson};
})(window);
