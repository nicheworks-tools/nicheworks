(function () {
  'use strict';
  var slugs=[
    'old-kanji-reference','kanji-modernizer','old-kanji-ocr-scanner',
    'old-document-kanji-highlighter','unicode-kanji-checker',
    'variant-kanji-compare','place-old-kanji-checker','name-old-kanji-checker'
  ];
  var path=location.pathname.split('/').filter(Boolean);
  if(path[0]!=='tools'||!slugs.includes(path[1]))return;
  var isHome=path[1]==='old-kanji-reference';
  var hrefs={
    modernizer:'/tools/kanji-modernizer/#okj-multi-batch',
    unicode:'/tools/unicode-kanji-checker/#okj-multi-batch',
    variant:'/tools/variant-kanji-compare/#okj-multi-batch',
    document:'/tools/old-document-kanji-highlighter/#okj-multi-batch',
    name:'/tools/name-old-kanji-checker/#okj-pro-batch',
    place:'/tools/place-old-kanji-checker/#okj-pro-batch',
    ocr:'/tools/old-kanji-ocr-scanner/#okj-pro-ocr-phase1'
  };
  var I18N={
    ja:{
      title:'Old Kanji Toolkit Pro — 共通Batch',
      lead:'一括処理をまとめて選択できます。テキストはこのブラウザ内のみで処理します。公式字体・史料の正確な読解を保証しません。',
      open:'共通Batchを開く',nav:'個別ツールの一括処理',
      modernizer:'文章を旧字・新字に一括変換',unicode:'Unicodeを一括確認',
      variant:'異体字を一括比較',document:'古文書の旧字体を一括検出',
      name:'氏名の一括チェック',place:'地名の一括チェック',ocr:'画像の一括OCR',
      select:'処理対象',input:'テキスト（1行1件）',upload:'CSVファイル（1MB以下）',
      run:'一括処理',csv:'CSVを保存',json:'JSONを保存',
      direction:'変換方向',oldNew:'旧 → 新',newOld:'新 → 旧',
      policy:'曖昧候補',conservative:'保守的',first:'最初の候補',
      exclude:'ASCII・URL・コードを除外',
      image:'画像の一括OCRは専用画面で処理します。画像データは引き継がれません。',
      visitOcr:'画像OCR画面へ移動',
      note:'処理結果は参考候補です。固有名詞・正式記録・原資料との照合が必要です。',
      results:'一括処理結果',original:'入力',output:'出力／候補',details:'内訳',
      ready:'1行1件で入力してください（最大200件）。',
      empty:'入力がありません。',invalid_csv:'CSV形式を確認してください。',
      select_column:'CSVの列見出しを確認してください。',
      header_required:'複数列CSVには対応する見出しが必要です。',
      file_too_large:'CSVは1MB以下です。',row_too_long:'1件の文字数制限を超えています。',
      too_many_rows:'200件までです。',invalid_rows:'入力形式が不正です。',
      dictionary_unavailable:'辞書の読込に失敗しました。',parser_unavailable:'入力処理を利用できません。',
      engine_unavailable:'一括処理を利用できません。',
      pro_required:'共通Batchと対象機能の両方の利用権利を確認できません。',
      processing:'一括処理中…',failed:'処理に失敗しました。',
      count:'処理件数',downloadFirst:'一括処理を実行してください。'
    },
    en:{
      title:'Old Kanji Toolkit Pro — Shared Batch',
      lead:'Choose a batch workflow in one place. Text is processed locally in your browser. Results do not certify registered glyphs or historical readings.',
      open:'Open shared Batch',nav:'Individual batch tools',
      modernizer:'Batch old/modern conversion',unicode:'Batch Unicode inspection',
      variant:'Batch variant comparison',document:'Batch old-document detection',
      name:'Batch name checking',place:'Batch place checking',ocr:'Batch image OCR',
      select:'Batch workflow',input:'Text, one entry per line',upload:'CSV file (1 MB max)',
      run:'Run batch',csv:'Download CSV',json:'Download JSON',
      direction:'Conversion direction',oldNew:'Old → modern',newOld:'Modern → old',
      policy:'Ambiguity policy',conservative:'Conservative',first:'First candidate',
      exclude:'Exclude ASCII, URL and code',
      image:'Batch image OCR runs in the scanner. Image data is not transferred.',
      visitOcr:'Go to image scanner',
      note:'Results are reference candidates. Confirm official glyphs, names and source documents independently.',
      results:'Batch results',original:'Input',output:'Output / candidate',details:'Details',
      ready:'One entry per line (maximum 200).',
      empty:'No input.',invalid_csv:'Invalid CSV format.',
      select_column:'CSV header not recognized.',
      header_required:'Multi-column CSV requires a matching header.',
      file_too_large:'CSV must be at most 1 MB.',row_too_long:'Entry is too long.',
      too_many_rows:'Maximum 200 entries.',invalid_rows:'Invalid input.',
      dictionary_unavailable:'Dictionary unavailable.',parser_unavailable:'Input parser unavailable.',
      engine_unavailable:'Batch engine unavailable.',
      pro_required:'Shared Batch and specific workflow grants are both required.',
      processing:'Processing batch…',failed:'Batch processing failed.',
      count:'Rows',downloadFirst:'Run a batch first.'
    }
  };
  function locale(){return String(document.documentElement.lang||'ja').startsWith('en')?'en':'ja';}
  function t(key){return I18N[locale()][key]||key;}
  function el(tag,text){
    var x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x;
  }
  function button(key){
    var x=el('button',t(key));x.type='button';return x;
  }
  async function mount(){
    var bridge=window.NicheWorksProEntitlement,engine=window.OldKanjiBatchHub;
    if(!bridge||!engine||document.getElementById('okj-shared-batch'))return;
    var initial=await bridge.refreshProState({productId:engine.PRODUCT,featureId:engine.HUB});
    if(!engine.verified(initial,engine.HUB))return;
    var available=Object.keys(engine.FEATURES).filter(function(kind){
      return engine.verified(bridge.getFeatureState({
        productId:engine.PRODUCT,featureId:engine.FEATURES[kind]
      }),engine.FEATURES[kind]);
    });
    if(!available.length)return;
    var main=document.querySelector('main');if(!main)return;
    var section=el('section');section.id='okj-shared-batch';section.className='okj-shared-batch';
    section.setAttribute('aria-label','Old Kanji shared batch workflows');
    var title=el('h2',t('title')),lead=el('p',t('lead'));
    var nav=el('nav');nav.setAttribute('aria-label',t('nav'));nav.className='okj-shared-batch-nav';
    var links=[];
    for(var kind of available){
      var a=el('a',t(kind));a.href=hrefs[kind];a.dataset.kind=kind;nav.append(a);links.push(a);
    }
    section.append(title,lead,nav);
    var top=main.querySelector('h1');
    if(top)top.after(section);else main.prepend(section);
    if(!isHome){
      var shortcut=el('a',t('open'));shortcut.className='okj-shared-batch-home';
      shortcut.href='/tools/old-kanji-reference/#okj-shared-batch';
      section.append(shortcut);
    }
    var localize=function(){
      title.textContent=t('title');lead.textContent=t('lead');nav.setAttribute('aria-label',t('nav'));
      for(var a of links)a.textContent=t(a.dataset.kind);
      var shortcut=section.querySelector('.okj-shared-batch-home');
      if(shortcut)shortcut.textContent=t('open');
    };
    if(!isHome){
      new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
      return;
    }
    var core=window.OkjMultiCore,namePlace=window.OldKanjiNamePlaceBatch,multi=window.OldKanjiMultiBatch;
    if(!core||!namePlace||!multi)return;
    var engines={namePlace:namePlace,multi:multi};
    var form=el('div');form.className='okj-shared-batch-form';
    var selectLabel=el('label',t('select')),select=el('select');
    select.id='okj-shared-batch-kind';selectLabel.htmlFor=select.id;
    for(var kind of available){
      var opt=el('option',t(kind));opt.value=kind;select.append(opt);
    }
    var inputLabel=el('label',t('input')),input=el('textarea');
    input.id='okj-shared-batch-input';input.rows=6;input.maxLength=400000;
    inputLabel.htmlFor=input.id;
    var uploadLabel=el('label',t('upload')),upload=el('input');
    upload.id='okj-shared-batch-file';upload.type='file';upload.accept='.csv,text/csv';
    uploadLabel.htmlFor=upload.id;
    var options=el('div');options.className='okj-shared-batch-options';
    var directionLabel=el('label',t('direction')),direction=el('select');
    direction.id='okj-shared-batch-direction';directionLabel.htmlFor=direction.id;
    for(var key of ['oldNew','newOld']){
      var o=el('option',t(key));o.value=key==='oldNew'?'old-to-new':'new-to-old';direction.append(o);
    }
    var policyLabel=el('label',t('policy')),policy=el('select');
    policy.id='okj-shared-batch-policy';policyLabel.htmlFor=policy.id;
    for(var key of ['conservative','first']){
      var o=el('option',t(key));o.value=key;policy.append(o);
    }
    var excludeLabel=el('label',t('exclude')),exclude=el('input');
    exclude.type='checkbox';exclude.checked=true;excludeLabel.prepend(exclude);
    options.append(directionLabel,direction,policyLabel,policy,excludeLabel);
    var actions=el('div');actions.className='okj-shared-batch-actions';
    var run=button('run'),csv=button('csv'),json=button('json');
    csv.disabled=true;json.disabled=true;
    actions.append(run,csv,json);
    var imageNote=el('p',t('image'));imageNote.className='okj-shared-batch-image';
    var visit=el('a',t('visitOcr'));visit.href=hrefs.ocr;imageNote.append(' ',visit);
    var status=el('p',t('ready'));status.className='okj-shared-batch-status';
    status.setAttribute('aria-live','polite');
    var disclaimer=el('p',t('note'));
    var resultTitle=el('h3',t('results')),output=el('div');output.className='okj-shared-batch-results';
    form.append(selectLabel,select,inputLabel,input,uploadLabel,upload,options,actions,imageNote,status,disclaimer,resultTitle,output);
    section.append(form);
    var previous=null,dictionary=null,busy=false,revision=0;
    function setStatus(k){status.textContent=t(k);}
    function clear(){
      revision++;previous=null;csv.disabled=true;json.disabled=true;output.replaceChildren();
    }
    function changeKind(){
      clear();input.value='';upload.value='';
      var img=select.value==='ocr';
      inputLabel.hidden=img;input.hidden=img;uploadLabel.hidden=img;upload.hidden=img;
      options.hidden=img||select.value!=='modernizer';
      actions.hidden=img;imageNote.hidden=!img;
      setStatus(img?'image':'ready');
    }
    function present(result){
      output.replaceChildren();if(!result?.ok)return;
      output.append(el('p',t('count')+': '+result.count));
      var wrap=el('div');wrap.className='okj-shared-batch-scroll';
      var table=el('table'),thead=el('thead'),tr=el('tr');
      for(var heading of ['original','output','details'])tr.append(el('th',t(heading)));
      thead.append(tr);table.append(thead);
      var tbody=el('tbody');
      for(var row of result.rows){
        var one=el('tr');
        one.append(el('td',row.input),el('td',
          result.kind==='name'||result.kind==='place'?
            (row.matches||[]).map(function(hit){
              return hit.char+' → '+hit.modernCandidates.join('/')+
                (hit.oldCandidates.length?' / '+hit.oldCandidates.join('/'):'');
            }).join(' | ')||'—':row.output));
        var td=el('td'),pre=el('pre',JSON.stringify(
          result.kind==='name'||result.kind==='place'?row.matches:row.details,null,2));
        td.append(pre);one.append(td);tbody.append(one);
      }
      table.append(tbody);wrap.append(table);output.append(wrap);
      csv.disabled=false;json.disabled=false;
    }
    input.addEventListener('input',clear);upload.addEventListener('change',clear);
    for(var control of [direction,policy,exclude])control.addEventListener('change',clear);
    select.addEventListener('change',changeKind);
    async function verify(kind){
      var shared=await bridge.refreshProState({productId:engine.PRODUCT,featureId:engine.HUB});
      if(!engine.verified(shared,engine.HUB))return null;
      var feature=await bridge.refreshProState({
        productId:engine.PRODUCT,featureId:engine.FEATURES[kind]
      });
      return engine.allowed(shared,feature,kind)?{shared:shared,feature:feature}:null;
    }
    run.addEventListener('click',async function(){
      if(busy||select.value==='ocr')return;
      busy=true;run.disabled=true;clear();setStatus('processing');
      var stamp=revision,kind=select.value;
      try {
        var gates=await verify(kind);
        if(!gates){setStatus('pro_required');return;}
        var parsed;
        if(upload.files?.length){
          var file=upload.files[0];
          if(file.size>1024*1024){setStatus('file_too_large');return;}
          parsed=engine.parseCsv(await file.text(),kind,core,namePlace);
        }else parsed=engine.parseLines(input.value,kind,core,namePlace);
        if(!parsed.ok){setStatus(parsed.error);return;}
        if(!dictionary){
          var response=await fetch('/tools/old-kanji-reference/dict.json',{cache:'force-cache'});
          if(!response.ok)throw Error('dictionary_unavailable');
          dictionary=await response.json();
        }
        if(stamp!==revision||kind!==select.value)return;
        var answer=engine.run(parsed.rows,kind,dictionary,gates.shared,gates.feature,engines,{
          direction:direction.value,policy:policy.value,exclude:exclude.checked
        });
        if(!answer.ok){setStatus(answer.error);return;}
        previous=answer;setStatus('count');
        status.textContent=t('count')+': '+answer.count;present(answer);
      }catch(error){setStatus(error.message==='dictionary_unavailable'?'dictionary_unavailable':'failed');}
      finally {busy=false;run.disabled=false;}
    });
    async function download(format){
      if(!previous?.ok){setStatus('downloadFirst');return;}
      var gates=await verify(previous.kind);
      if(!gates){setStatus('pro_required');return;}
      var exported=engine.exportData(previous,gates.shared,gates.feature,format,engines);
      if(!exported.ok){setStatus(exported.error);return;}
      var url=URL.createObjectURL(new Blob([exported.content],{type:exported.mime}));
      var anchor=el('a');anchor.href=url;anchor.download=exported.filename;anchor.click();
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
    }
    csv.addEventListener('click',function(){download('csv');});
    json.addEventListener('click',function(){download('json');});
    function translate(){
      localize();selectLabel.textContent=t('select');inputLabel.textContent=t('input');
      uploadLabel.textContent=t('upload');directionLabel.textContent=t('direction');
      policyLabel.textContent=t('policy');
      excludeLabel.lastChild.textContent=t('exclude');
      for(var o of select.options)o.textContent=t(o.value);
      for(var o of direction.options)o.textContent=t(o.value==='old-to-new'?'oldNew':'newOld');
      for(var o of policy.options)o.textContent=t(o.value);
      run.textContent=t('run');csv.textContent=t('csv');json.textContent=t('json');
      imageNote.firstChild.textContent=t('image')+' ';visit.textContent=t('visitOcr');
      disclaimer.textContent=t('note');resultTitle.textContent=t('results');
      if(previous?.ok)present(previous);
    }
    new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    changeKind();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
