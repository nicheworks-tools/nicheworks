(function () {
  'use strict';
  var PRODUCT='okj.toolkit_pro',FEATURE='okj.workspaces';
  var inputByTool={
    'old-kanji-reference':['#detectorInput','#searchInput'],
    'kanji-modernizer':['#inputText'],
    'old-kanji-ocr-scanner':['#manual-text'],
    'old-document-kanji-highlighter':['#inputText'],
    'unicode-kanji-checker':['#inputText'],
    'variant-kanji-compare':['#inputText'],
    'place-old-kanji-checker':['#placeInput'],
    'name-old-kanji-checker':['#name-input']
  };
  var langStrings={
    ja:{
      title:'Old Kanji Toolkit Pro — Workspace',
      privacy:'資料・氏名・本文はこのブラウザだけに保存されます。同期・サーバー保存はありません。ブラウザのデータを消すと失われます。',
      create:'案件を作成',createLabel:'新しい案件名',select:'作業する案件',
      useCurrent:'現在の入力文を取り込む',entryLabel:'資料名・メモ（任意）',
      entryText:'案件に追加する文章',save:'案件に保存',delete:'この案件を削除',
      exportMd:'Markdownを書き出す',exportJson:'JSONを書き出す',
      empty:'最初に案件を作成してください。',noEntries:'まだ資料はありません。',
      remove:'削除',copy:'文章をコピー',none:'入力文が見つかりません。',
      noText:'文章を入力してください。',invalid:'保存内容が無効か上限に達しました。',
      done:'保存しました。',deleted:'削除しました。',denied:'Pro利用権利を確認できません。',
      copied:'コピーしました。',failed:'保存・読み込みに失敗しました。',confirm:'この案件と中身をすべて削除しますか？'
    },
    en:{
      title:'Old Kanji Toolkit Pro — Workspace',
      privacy:'Documents, names and text stay in this browser only. There is no cloud sync or server storage. Clearing browser data deletes your work.',
      create:'Create workspace',createLabel:'New workspace name',select:'Current workspace',
      useCurrent:'Import current input',entryLabel:'Document label or note (optional)',
      entryText:'Text to add to workspace',save:'Save to workspace',delete:'Delete this workspace',
      exportMd:'Export Markdown',exportJson:'Export JSON',
      empty:'Create a workspace first.',noEntries:'No saved documents yet.',
      remove:'Remove',copy:'Copy full text',none:'No text found in current tool input.',
      noText:'Enter text first.',invalid:'Invalid content or storage limit reached.',
      done:'Saved.',deleted:'Deleted.',denied:'Pro entitlement could not be verified.',
      copied:'Copied.',failed:'Storage operation failed.',confirm:'Delete this workspace and all of its contents?'
    }
  };
  function language(){return String(document.documentElement.lang||'ja').toLowerCase().startsWith('en')?'en':'ja';}
  function text(k){return langStrings[language()][k];}
  function node(tag,cls,value){
    var x=document.createElement(tag);
    if(cls)x.className=cls;
    if(value!==undefined)x.textContent=value;
    return x;
  }
  function makeButton(value){
    var b=node('button','',value);b.type='button';return b;
  }
  function toolSlug(){
    var parts=location.pathname.split('/').filter(Boolean);
    return parts[0]==='tools' && Object.hasOwn(inputByTool,parts[1])?parts[1]:'';
  }
  function currentInput(slug) {
    var selectors=inputByTool[slug]||[];
    for(var i=0;i<selectors.length;i++){
      var el=document.querySelector(selectors[i]);
      var value=typeof el?.value==='string'?el.value:'';
      if(value.trim())return value;
    }
    return '';
  }
  async function mount(){
    var store=window.OldKanjiWorkspaceStore,bridge=window.NicheWorksProEntitlement,slug=toolSlug();
    if(!store||!bridge||!slug||document.getElementById('okj-pro-workspaces'))return;
    var initial=await bridge.refreshProState({ productId: PRODUCT, featureId: FEATURE });
    if(!initial.active)return; // No Pro UI or CTA for Free users.
    var main=document.querySelector('main');
    if(!main)return;
    var panel=node('section','okj-pro-workspaces');
    panel.id='okj-pro-workspaces';
    panel.setAttribute('aria-label','Old Kanji Pro workspaces');
    var heading=node('h2','',text('title'));
    var notice=node('p','okj-workspace-notice',text('privacy'));
    var top=node('div','okj-workspace-row');
    var newName=node('input');
    newName.type='text';newName.maxLength=80;newName.placeholder=text('createLabel');
    newName.setAttribute('aria-label',text('createLabel'));
    var create=makeButton(text('create'));
    top.append(newName,create);
    var workspaceSelect=node('select');
    workspaceSelect.setAttribute('aria-label',text('select'));
    var switcher=node('div','okj-workspace-row');
    var remove=makeButton(text('delete'));
    switcher.append(workspaceSelect,remove);
    var importCurrent=makeButton(text('useCurrent'));
    var label=node('input');
    label.type='text';label.maxLength=120;label.placeholder=text('entryLabel');
    label.setAttribute('aria-label',text('entryLabel'));
    var textarea=node('textarea');
    textarea.maxLength=30000;textarea.rows=5;textarea.placeholder=text('entryText');
    textarea.setAttribute('aria-label',text('entryText'));
    var save=makeButton(text('save'));
    var exportMd=makeButton(text('exportMd'));
    var exportJson=makeButton(text('exportJson'));
    var actions=node('div','okj-workspace-row');
    actions.append(save,exportMd,exportJson);
    var listing=node('div','okj-workspace-list');
    var status=node('p','okj-workspace-status');
    status.setAttribute('aria-live','polite');
    panel.append(heading,notice,top,switcher,importCurrent,label,textarea,actions,listing,status);
    main.append(panel);

    var selectedId='';
    function localGate(){return bridge.getFeatureState({productId:PRODUCT,featureId:FEATURE});}
    async function recheck(){
      var checked=await bridge.refreshProState({ productId: PRODUCT, featureId: FEATURE });
      if(!checked.active)status.textContent=text('denied');
      return checked;
    }
    function inform(k){status.textContent=text(k);}
    function list(){
      var got=store.list(localGate());
      if(!got.ok){inform('denied');return [];}
      return got.workspaces;
    }
    function render(){
      var records=list();
      if(records.length && !records.some(function(w){return w.id===selectedId;}))selectedId=records[0].id;
      if(!records.length)selectedId='';
      workspaceSelect.replaceChildren();
      records.forEach(function(w){
        var option=node('option','',w.name);
        option.value=w.id;
        workspaceSelect.append(option);
      });
      workspaceSelect.value=selectedId;
      var enabled=Boolean(selectedId);
      workspaceSelect.disabled=!enabled;remove.disabled=!enabled;
      save.disabled=!enabled;exportMd.disabled=!enabled;exportJson.disabled=!enabled;
      importCurrent.disabled=!enabled;textarea.disabled=!enabled;label.disabled=!enabled;
      listing.replaceChildren();
      var selected=records.find(function(w){return w.id===selectedId;});
      if(!selected){listing.append(node('p','',text('empty')));return;}
      if(!selected.entries.length){listing.append(node('p','',text('noEntries')));return;}
      selected.entries.forEach(function(entry){
        var block=node('div','okj-workspace-entry');
        var labelText=node('strong','',entry.label||entry.sourceTool);
        var meta=node('small','',entry.createdAt+' · '+entry.sourceTool);
        var preview=node('p','',entry.text.slice(0,200)+(entry.text.length>200?'…':''));
        var copy=makeButton(text('copy'));
        var deleteEntry=makeButton(text('remove'));
        copy.addEventListener('click',async function(){
          var gate=await recheck();if(!gate.active)return;
          try{await navigator.clipboard.writeText(entry.text);inform('copied');}
          catch(_error){inform('failed');}
        });
        deleteEntry.addEventListener('click',async function(){
          var gate=await recheck();if(!gate.active)return;
          var result=store.removeEntry(selectedId,entry.id,gate);
          inform(result.ok?'deleted':'failed');render();
        });
        block.append(labelText,meta,preview,copy,deleteEntry);
        listing.append(block);
      });
    }
    create.addEventListener('click',async function(){
      var gate=await recheck();if(!gate.active)return;
      var result=store.create(newName.value,gate);
      if(!result.ok){inform('invalid');return;}
      selectedId=result.workspace.id;newName.value='';
      inform('done');render();
    });
    workspaceSelect.addEventListener('change',function(){selectedId=workspaceSelect.value;render();});
    remove.addEventListener('click',async function(){
      if(!selectedId||!confirm(text('confirm')))return;
      var gate=await recheck();if(!gate.active)return;
      var result=store.removeWorkspace(selectedId,gate);
      if(result.ok){selectedId='';inform('deleted');render();}
      else inform('failed');
    });
    importCurrent.addEventListener('click',async function(){
      var gate=await recheck();if(!gate.active)return;
      var value=currentInput(slug);
      if(!value){inform('none');return;}
      textarea.value=value.slice(0,30000);
    });
    save.addEventListener('click',async function(){
      var gate=await recheck();if(!gate.active)return;
      if(!textarea.value.trim()){inform('noText');return;}
      var result=store.addEntry(selectedId,{
        sourceTool:slug,label:label.value.trim(),text:textarea.value
      },gate);
      if(!result.ok){inform('invalid');return;}
      textarea.value='';label.value='';
      inform('done');render();
    });
    async function exportFile(format){
      var gate=await recheck();if(!gate.active)return;
      var result=store.exportWorkspace(selectedId,format,gate);
      if(!result.ok){inform('failed');return;}
      var url=URL.createObjectURL(new Blob([result.content],{type:result.mime}));
      var a=document.createElement('a');a.href=url;a.download=result.filename;
      a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
    }
    exportMd.addEventListener('click',function(){exportFile('markdown');});
    exportJson.addEventListener('click',function(){exportFile('json');});
    function localize(){
      heading.textContent=text('title');notice.textContent=text('privacy');
      newName.placeholder=text('createLabel');newName.setAttribute('aria-label',text('createLabel'));
      create.textContent=text('create');
      workspaceSelect.setAttribute('aria-label',text('select'));
      remove.textContent=text('delete');importCurrent.textContent=text('useCurrent');
      label.placeholder=text('entryLabel');label.setAttribute('aria-label',text('entryLabel'));
      textarea.placeholder=text('entryText');textarea.setAttribute('aria-label',text('entryText'));
      save.textContent=text('save');exportMd.textContent=text('exportMd');exportJson.textContent=text('exportJson');
      render();
    }
    new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    window.addEventListener('storage',function(e){if(e.key===store.STORAGE_KEY)render();});
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();