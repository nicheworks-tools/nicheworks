(function () {
  'use strict';
  const PRODUCT='okj.toolkit_pro';
  const REPORT='okj.reports',EXPORT='okj.advancedExport';
  const messages={
    ja:{
      title:'Old Kanji Toolkit Pro — 調査レポート・高度な出力',
      privacy:'このブラウザ内だけでレポートを生成します。OCR本文・氏名・住所・ファイル名は決済やAmazonに送信しません。',
      titleLabel:'レポート名',notes:'確認事項・調査メモ（任意）',
      includeHistory:'保存済みOCR履歴を含める（追加のPro権利が必要）',
      includeCollection:'保存済み旧字体コレクションを含める（追加のPro権利が必要）',
      reportMd:'調査レポート（Markdown）',reportJson:'調査レポート（JSON）',
      exportCsv:'OCR・検出結果CSV',exportMd:'OCR・検出結果Markdown',exportJson:'OCR・検出結果JSON',
      noText:'まずOCR結果を入力してください。',unauthorized:'Pro利用権利を確認できません。再確認してください。',
      missingHistory:'履歴の利用権利を確認できません。',missingCollection:'コレクションの利用権利を確認できません。',
      missingDictionary:'旧字体辞書の読み込みに失敗しました。',error:'レポートの生成に失敗しました。',
      ready:'ファイルをこの端末に保存します。内容を目視で確認してください。',
      warning:'これは参考資料です。公的な名前・住所表記や登録字体を証明しません。',
      defaultTitle:'旧字体調査レポート'
    },
    en:{
      title:'Old Kanji Toolkit Pro — Reports and advanced export',
      privacy:'Reports are generated locally in this browser. OCR text, names, addresses and filenames are never sent to billing or Amazon.',
      titleLabel:'Report title',notes:'Research notes (optional)',
      includeHistory:'Include saved OCR history (requires additional entitlement)',
      includeCollection:'Include saved glyph collection (requires additional entitlement)',
      reportMd:'Research report (Markdown)',reportJson:'Research report (JSON)',
      exportCsv:'OCR/detection CSV',exportMd:'OCR/detection Markdown',exportJson:'OCR/detection JSON',
      noText:'Enter or recognize OCR text first.',unauthorized:'Pro entitlement could not be verified.',
      missingHistory:'History entitlement could not be verified.',missingCollection:'Collection entitlement could not be verified.',
      missingDictionary:'Could not load the old-kanji reference dictionary.',error:'Could not generate this report.',
      ready:'Saving locally. Review results manually before using them.',
      warning:'Reference-only output, not proof of official name/address spelling or registered glyphs.',
      defaultTitle:'Old Kanji research report'
    }
  };
  function lang(){return String(document.documentElement.lang||'ja').startsWith('en')?'en':'ja';}
  function t(key){return messages[lang()][key]||key;}
  function node(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;}
  function button(name){const b=node('button','',t(name));b.type='button';return b;}
  async function mount(){
    const bridge=window.NicheWorksProEntitlement,history=window.OldKanjiHistoryCollection;
    const reports=window.OldKanjiReportEngine,exporter=window.OldKanjiExportEngine;
    if(!bridge||!history||!reports||!exporter)return;
    const initial=await bridge.refreshProState({productId:PRODUCT});
    if(!initial.active)return;
    const hasReport=bridge.getFeatureState({productId:PRODUCT,featureId:REPORT}).active;
    const hasExport=bridge.getFeatureState({productId:PRODUCT,featureId:EXPORT}).active;
    if(!hasReport&&!hasExport)return;
    const anchor=document.getElementById('copy-actions');
    if(!anchor||document.getElementById('okj-pro-reports-export'))return;
    const panel=node('section','okj-pro-reports-export');
    panel.id='okj-pro-reports-export';
    panel.setAttribute('aria-label','Old Kanji Pro reports and export');
    const heading=node('h2','',t('title'));
    const notice=node('p','okj-reports-note',t('privacy'));
    const warning=node('p','okj-reports-note',t('warning'));
    const titleLabel=node('label','',t('titleLabel'));
    const reportTitle=node('input');
    reportTitle.type='text';reportTitle.id='okj-report-title';reportTitle.maxLength=120;
    reportTitle.setAttribute('aria-label',t('titleLabel'));
    titleLabel.htmlFor=reportTitle.id;
    const notesLabel=node('label','',t('notes'));
    const notes=node('textarea');notes.id='okj-report-notes';notes.rows=3;notes.maxLength=5000;
    notes.setAttribute('aria-label',t('notes'));notesLabel.htmlFor=notes.id;
    const includeHistory=node('input');includeHistory.type='checkbox';includeHistory.id='okj-report-history';
    const includeHistoryLabel=node('label','',t('includeHistory'));includeHistoryLabel.htmlFor=includeHistory.id;
    const includeCollection=node('input');includeCollection.type='checkbox';includeCollection.id='okj-report-collection';
    const includeCollectionLabel=node('label','',t('includeCollection'));includeCollectionLabel.htmlFor=includeCollection.id;
    const options=node('div','okj-reports-options');
    const histRow=node('div');histRow.append(includeHistory,includeHistoryLabel);
    const colRow=node('div');colRow.append(includeCollection,includeCollectionLabel);
    options.append(histRow,colRow);
    const actions=node('div','okj-reports-actions');
    const buttons=[];
    if(hasReport)for(const [key,format] of [['reportMd','md'],['reportJson','json']]){
      const b=button(key);b.dataset.reportFormat=format;b.dataset.reportType='report';buttons.push([b,key]);actions.append(b);
    }
    if(hasExport)for(const [key,format] of [['exportCsv','csv'],['exportMd','md'],['exportJson','json']]){
      const b=button(key);b.dataset.reportFormat=format;b.dataset.reportType='export';buttons.push([b,key]);actions.append(b);
    }
    const status=node('p','okj-reports-status');
    status.setAttribute('aria-live','polite');
    panel.append(heading,notice,warning,titleLabel,reportTitle,notesLabel,notes,options,actions,status);
    anchor.after(panel);
    let dict=null;
    async function recheck(featureId){
      return bridge.refreshProState({productId:PRODUCT,featureId:featureId});
    }
    async function optionalData(){
      let historyRecords=[],collectionRecords=[];
      if(includeHistory.checked){
        const gate=await recheck('okj.history');
        if(!gate.active)throw Error('missingHistory');
        const found=history.listHistoryRecords(gate);
        if(!found.ok)throw Error('missingHistory');
        historyRecords=found.records;
      }
      if(includeCollection.checked){
        const gate=await recheck('okj.collections');
        if(!gate.active)throw Error('missingCollection');
        const found=history.listCollectionRecords(gate);
        if(!found.ok)throw Error('missingCollection');
        collectionRecords=found.records;
      }
      return {historyRecords,collectionRecords};
    }
    async function buildInput(){
      const ocrText=document.getElementById('manual-text')?.value||'';
      if(!ocrText.trim())throw Error('noText');
      if(!dict){
        const res=await fetch('../old-kanji-reference/dict.json',{cache:'force-cache'});
        if(!res.ok)throw Error('missingDictionary');
        dict=await res.json();
      }
      if(!dict?.old_to_new||typeof dict.old_to_new!=='object')throw Error('missingDictionary');
      const oldToNew=dict.old_to_new,detected=new Map();
      for(const ch of ocrText){
        if(!Object.prototype.hasOwnProperty.call(oldToNew,ch))continue;
        if(!detected.has(ch))detected.set(ch,{old:ch,modern:Array.isArray(oldToNew[ch])?oldToNew[ch]:[oldToNew[ch]],count:0});
        detected.get(ch).count++;
      }
      const opts=await optionalData();
      return {
        title:reportTitle.value.trim()||t('defaultTitle'),
        notes:notes.value,ocrText:ocrText,
        modernPreview:document.getElementById('modern-preview-output')?.textContent||'',
        sourceLabel:document.getElementById('file-name')?.textContent||'Manual OCR',
        createdAt:new Date().toISOString(),
        detectedOldKanji:Array.from(detected.values()),
        historyRecords:opts.historyRecords,
        collectionRecords:opts.collectionRecords
      };
    }
    async function save(type,format,clicked){
      if(clicked.disabled)return;
      clicked.disabled=true;status.textContent='';
      try{
        const feature=type==='report'?REPORT:EXPORT;
        const gate=await recheck(feature);
        if(!gate.active)throw Error('unauthorized');
        const data=await buildInput();
        const result=type==='report' ?
          (format==='md'?reports.buildMarkdownReport(data,gate):reports.buildJsonReport(data,gate)) :
          (format==='csv'?exporter.buildCsvExport(data,gate):format==='md'?
            exporter.buildMarkdownExport(data,gate):exporter.buildJsonExport(data,gate));
        if(!result.ok)throw Error('unauthorized');
        const url=URL.createObjectURL(new Blob([result.content],{type:result.mimeType}));
        const a=document.createElement('a');a.href=url;a.download=result.filename;a.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
        status.textContent=t('ready');
      }catch(e){
        status.textContent=t(['noText','missingHistory','missingCollection','missingDictionary','unauthorized'].includes(e.message)?e.message:'error');
      }finally{clicked.disabled=false;}
    }
    for(const [b] of buttons)b.addEventListener('click',()=>save(b.dataset.reportType,b.dataset.reportFormat,b));
    function localize(){
      heading.textContent=t('title');notice.textContent=t('privacy');warning.textContent=t('warning');
      titleLabel.textContent=t('titleLabel');reportTitle.setAttribute('aria-label',t('titleLabel'));
      notesLabel.textContent=t('notes');notes.setAttribute('aria-label',t('notes'));
      includeHistoryLabel.textContent=t('includeHistory');includeCollectionLabel.textContent=t('includeCollection');
      for(const [b,key] of buttons)b.textContent=t(key);
    }
    new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
