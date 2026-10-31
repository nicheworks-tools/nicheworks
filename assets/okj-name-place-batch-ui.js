(function () {
  'use strict';
  const PRODUCT='okj.toolkit_pro';
  const parts=location.pathname.split('/').filter(Boolean);
  const kind=parts[1]==='name-old-kanji-checker'?'name':
    parts[1]==='place-old-kanji-checker'?'place':null;
  if(parts[0]!=='tools'||!kind)return;
  const feature=kind==='name'?'okj.name.batch':'okj.place.batch';
  const i18n={
    ja:{
      heading:kind==='name'?'人名・氏名の一括チェック（Pro）':'地名・住所の一括チェック（Pro）',
      note:'1行に1件を入力するかCSVを選択してください（最大200件）。旧字体辞書の参考候補のみを提示します。戸籍・行政上の正式な字体や住所の証明ではありません。入力内容と結果はサーバーへ送信しません。',
      input:'一括チェックの入力（1行1件）',placeholder:kind==='name'?'齋藤\n渡邊\n濱田':'廣島\n國府\n濱松',
      file:'CSVファイルを取り込む（name / 氏名 または place / 住所 列）',
      run:'候補を一括チェック',exportCsv:'結果をCSVで保存',exportJson:'結果をJSONで保存',
      total:'対象件数',matched:'候補あり',noMatch:'辞書に候補なし（正式字体であることの証明ではありません）',
      oldToModern:'旧字 → 新字候補',modernToOld:'新字 → 旧字候補',
      empty:'入力がありません。',too_many_rows:'最大200件までです。',
      row_too_long:'1件400文字を超えています。',invalid_csv:'CSVの引用符が不正です。',
      select_column:'複数列のCSVは、列名に「氏名」「名前」「name」または「地名」「住所」「place」を付けてください。',
      file_too_large:'CSVは1MB以下で選択してください。',
      dictionary_unavailable:'辞書を読み込めませんでした。無料の単件チェックには影響しません。',
      failed:'処理できませんでした。内容を確認してください。',
      denied:'Pro権利を確認できませんでした。',nothing:'まず一括チェックを実行してください。',
      results:'一括チェック結果',open:'入力',status:'判定',details:'候補',progress:'チェック中…'
    },
    en:{
      heading:kind==='name'?'Batch name check (Pro)':'Batch place/address check (Pro)',
      note:'Enter one value per line or select a CSV (max 200). Results are reference candidates, NOT proof of official registration, legal glyphs or addresses. Source text and results remain in your browser.',
      input:'Batch values, one per line',placeholder:kind==='name'?'齋藤\n渡邊\n濱田':'廣島\n國府\n濱松',
      file:'Import a CSV (name / 氏名 or place / 住所 column)',
      run:'Check all entries',exportCsv:'Download CSV results',exportJson:'Download JSON results',
      total:'Rows',matched:'Rows with candidates',noMatch:'No dictionary match (not evidence of legal validity)',
      oldToModern:'old → modern candidate',modernToOld:'modern → old candidate',
      empty:'Enter at least one value.',too_many_rows:'Maximum 200 rows.',
      row_too_long:'A row is longer than 400 characters.',invalid_csv:'Malformed CSV quoting.',
      select_column:'For multi-column CSV add a name/氏名 or place/住所 header.',
      file_too_large:'CSV must be at most 1MB.',
      dictionary_unavailable:'Reference dictionary unavailable; Free single-entry checking is unaffected.',
      failed:'Could not process these entries.',denied:'Pro entitlement could not be verified.',
      nothing:'Run the batch check first.',results:'Batch results',open:'Input',status:'Status',
      details:'Candidates',progress:'Checking…'
    }
  };
  function language(){return String(document.documentElement.lang||'ja').toLowerCase().startsWith('en')?'en':'ja';}
  function t(key){return i18n[language()][key]||key;}
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function button(name){const b=el('button','',t(name));b.type='button';return b;}
  async function mount(){
    const bridge=window.NicheWorksProEntitlement,batch=window.OldKanjiNamePlaceBatch;
    if(!bridge||!batch)return;
    const first=await bridge.refreshProState({productId:PRODUCT,featureId:feature});
    if(!first.active)return; // Never reveal paid controls to unverified visitors.
    const main=document.querySelector('main');
    if(!main||document.getElementById('okj-pro-batch'))return;
    const panel=el('section','okj-pro-batch');
    panel.id='okj-pro-batch';
    panel.setAttribute('aria-label','Old Kanji Toolkit Pro batch checks');
    const heading=el('h2','',t('heading')),note=el('p','okj-batch-note',t('note'));
    const label=el('label','',t('input'));const textarea=el('textarea');
    textarea.id='okj-batch-lines';textarea.rows=6;textarea.maxLength=80200;
    textarea.placeholder=t('placeholder');label.htmlFor=textarea.id;
    const csvLabel=el('label','',t('file'));const upload=el('input');
    upload.type='file';upload.accept='.csv,text/csv';upload.id='okj-batch-csv';
    csvLabel.htmlFor=upload.id;
    const run=button('run'),csv=button('exportCsv'),json=button('exportJson');
    csv.disabled=true;json.disabled=true;
    const actions=el('div','okj-batch-actions');actions.append(run,csv,json);
    const info=el('p','okj-batch-status');info.setAttribute('aria-live','polite');
    const subheading=el('h3','',t('results'));const tableWrap=el('div','okj-batch-table-wrap');
    panel.append(heading,note,label,textarea,csvLabel,upload,actions,info,subheading,tableWrap);
    const task=document.querySelector(kind==='name'?'#name-result-list':'#resultList');
    if(task)task.after(panel);else main.append(panel);
    let previous=null,dictionary=null;
    async function recheck(){return bridge.refreshProState({productId:PRODUCT,featureId:feature});}
    function inform(msg){info.textContent=t(msg);}
    function printTable(){
      tableWrap.replaceChildren();
      if(!previous?.ok)return;
      const summary=el('p','',t('total')+': '+previous.count+' · '+t('matched')+': '+previous.matched);
      const table=el('table');table.setAttribute('aria-label',t('results'));
      const thead=el('thead'),head=el('tr');
      for(const name of ['open','status','details'])head.append(el('th','',t(name)));
      thead.append(head);table.append(thead);
      const body=el('tbody');
      previous.rows.forEach(row=>{
        const tr=el('tr');
        tr.append(el('td','okj-batch-original',row.input));
        tr.append(el('td','',row.matches.length?t('matched'):t('noMatch')));
        const details=el('td');
        if(row.matches.length)row.matches.forEach(match=>{
          const type=match.relationship==='old_to_modern'?'oldToModern':'modernToOld';
          const values=match.relationship==='old_to_modern'?match.modernCandidates:match.oldCandidates;
          details.append(el('p','',match.char+' — '+t(type)+': '+values.join(' / ')));
        });
        tr.append(details);body.append(tr);
      });
      table.append(body);tableWrap.append(summary,table);
      csv.disabled=false;json.disabled=false;
    }
    run.addEventListener('click',async()=>{
      if(run.disabled)return;
      run.disabled=true;csv.disabled=true;json.disabled=true;previous=null;tableWrap.replaceChildren();inform('progress');
      try{
        const gate=await recheck();
        if(!gate.active){inform('denied');return;}
        let rows;
        if(upload.files?.length){
          const file=upload.files[0];
          if(file.size>1024*1024){inform('file_too_large');return;}
          rows=batch.parseCsv(await file.text(),kind);
        }else rows=batch.parseLines(textarea.value);
        if(!rows.ok){inform(rows.error);return;}
        if(!dictionary){
          const response=await fetch('../old-kanji-reference/dict.json',{cache:'force-cache'});
          if(!response.ok)throw Error('dictionary_unavailable');
          dictionary=await response.json();
        }
        const result=batch.analyzeRows(rows.rows,dictionary,gate,kind);
        if(!result.ok){inform(result.error);return;}
        previous=result;info.textContent=t('total')+': '+result.count+' · '+t('matched')+': '+result.matched;
        printTable();
      }catch(error){inform(error.message==='dictionary_unavailable'?'dictionary_unavailable':'failed');}
      finally{run.disabled=false;}
    });
    async function download(format){
      if(!previous?.ok){inform('nothing');return;}
      const gate=await recheck();
      if(!gate.active){inform('denied');return;}
      const result=format==='csv'?batch.exportCsv(previous,gate):batch.exportJson(previous,gate);
      if(!result.ok){inform('denied');return;}
      const url=URL.createObjectURL(new Blob([result.content],{type:result.mime}));
      const a=document.createElement('a');a.href=url;a.download=result.filename;a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    csv.addEventListener('click',()=>download('csv'));
    json.addEventListener('click',()=>download('json'));
    function localize(){
      heading.textContent=t('heading');note.textContent=t('note');label.textContent=t('input');
      textarea.placeholder=t('placeholder');csvLabel.textContent=t('file');
      run.textContent=t('run');csv.textContent=t('exportCsv');json.textContent=t('exportJson');
      subheading.textContent=t('results');if(previous?.ok)printTable();
    }
    new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
