(function (global) {
  'use strict';
  var PRODUCT='okj.toolkit_pro', HUB='okj.batch';
  var FEATURES={
    modernizer:'okj.modernizer.batch',
    unicode:'okj.unicode.batch',
    variant:'okj.variant.batch',
    document:'okj.document.batch',
    name:'okj.name.batch',
    place:'okj.place.batch',
    ocr:'okj.ocr.batch'
  };
  function verified(gate,featureId){
    return !!(gate && gate.active===true && gate.productId===PRODUCT && gate.featureId===featureId);
  }
  function allowed(sharedGate,featureGate,kind){
    return !!(FEATURES[kind] && verified(sharedGate,HUB) && verified(featureGate,FEATURES[kind]));
  }
  function parseLines(text,kind,core,namePlace){
    if(!FEATURES[kind] || kind==='ocr')return {ok:false,error:'unsupported_mode'};
    var parser=(kind==='name'||kind==='place')?namePlace:core;
    if(!parser || typeof parser.parseLines!=='function' && typeof parser.lines!=='function'){
      return {ok:false,error:'parser_unavailable'};
    }
    return (parser.parseLines||parser.lines)(text);
  }
  function parseCsv(text,kind,core,namePlace){
    if(!FEATURES[kind] || kind==='ocr')return {ok:false,error:'unsupported_mode'};
    var parser=(kind==='name'||kind==='place')?namePlace:core;
    if(!parser || typeof parser.parseCsv!=='function' && typeof parser.csv!=='function'){
      return {ok:false,error:'parser_unavailable'};
    }
    return (parser.parseCsv||parser.csv)(text,kind);
  }
  function run(rows,kind,dict,sharedGate,featureGate,engines,options){
    if(!allowed(sharedGate,featureGate,kind))return {ok:false,error:'pro_required'};
    if(kind==='ocr')return {ok:false,error:'use_image_scanner'};
    if(!Array.isArray(rows))return {ok:false,error:'invalid_rows'};
    if(kind==='name'||kind==='place'){
      if(!engines?.namePlace?.analyzeRows)return {ok:false,error:'engine_unavailable'};
      return engines.namePlace.analyzeRows(rows,dict,featureGate,kind);
    }
    if(!engines?.multi?.run)return {ok:false,error:'engine_unavailable'};
    return engines.multi.run(kind,rows,dict,featureGate,options||{});
  }
  function exportData(result,sharedGate,featureGate,format,engines){
    if(!result?.ok || !allowed(sharedGate,featureGate,result.kind)){
      return {ok:false,error:'pro_required'};
    }
    if(result.kind==='ocr')return {ok:false,error:'use_image_scanner'};
    if(result.kind==='name'||result.kind==='place'){
      var np=engines?.namePlace;
      if(!np)return {ok:false,error:'engine_unavailable'};
      return format==='csv'?np.exportCsv(result,featureGate):
        format==='json'?np.exportJson(result,featureGate):{ok:false,error:'invalid_format'};
    }
    if(!engines?.multi?.exportData)return {ok:false,error:'engine_unavailable'};
    return engines.multi.exportData(result,featureGate,format);
  }
  global.OldKanjiBatchHub={
    PRODUCT:PRODUCT,HUB:HUB,FEATURES:FEATURES,verified:verified,allowed:allowed,
    parseLines:parseLines,parseCsv:parseCsv,run:run,exportData:exportData
  };
})(window);
