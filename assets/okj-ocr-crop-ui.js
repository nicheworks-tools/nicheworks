(function () {
  'use strict';
  const PRODUCT='okj.toolkit_pro', FEATURE='okj.ocr.crop';
  const translations={
    ja:{
      title:'Old Kanji Toolkit Pro — 範囲指定OCR',
      help:'画像上をマウスまたは指でドラッグして範囲を囲んでください。OCR結果は既存の編集欄に反映します。',
      choose:'範囲プリセット',full:'画像全体',center:'中央の半分',upper:'上半分',lower:'下半分',
      run:'選択範囲を日本語OCR',reset:'全体に戻す',
      wait:'画像を選択してください。',selected:'選択範囲',
      busy:'選択範囲を認識中…',complete:'OCR結果を編集欄に反映しました。内容をご確認ください。',
      empty:'認識できる文字がありません。既存の文章は保持しました。',
      denied:'Pro利用権利を確認できません。',
      unsupported_file:'対応していない画像形式です。',file_size:'画像は15MB以下にしてください。',
      tiny:'範囲が小さすぎます。大きめに囲んでください。',
      error:'OCRに失敗しました。',engine:'OCRエンジンを利用できません。',
      stale:'画像が変更されたため、前の結果は反映しませんでした。',
      accessible:'画像上をマウスや指でドラッグして読み取り範囲を選択できます。'
    },
    en:{
      title:'Old Kanji Toolkit Pro — Crop OCR',
      help:'Drag on the image with a mouse or finger to choose the region. Text opens in the existing editable OCR field.',
      choose:'Region preset',full:'Entire image',center:'Center half',upper:'Upper half',lower:'Lower half',
      run:'OCR selected region (Japanese)',reset:'Select full image',
      wait:'Choose an image first.',selected:'Selection',
      busy:'Recognizing selected region…',complete:'OCR result opened in the editor. Review it manually.',
      empty:'No text recognized. The current editor content was kept.',
      denied:'Pro entitlement not verified.',
      unsupported_file:'Unsupported image format.',file_size:'Select an image of at most 15 MB.',
      tiny:'Selection is too small. Choose a larger area.',
      error:'OCR failed.',engine:'OCR engine unavailable.',
      stale:'Image changed during OCR; old results were not inserted.',
      accessible:'Drag on this image with a mouse or touch to select a region for OCR.'
    }
  };
  function locale(){return String(document.documentElement.lang||'ja').startsWith('en')?'en':'ja';}
  function text(k){return translations[locale()][k]||k;}
  function el(tag,value){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;return e;}
  const FULL={x:0,y:0,width:1,height:1};
  const presets={full:FULL,center:{x:.25,y:.25,width:.5,height:.5},
    upper:{x:0,y:0,width:1,height:.5},lower:{x:0,y:.5,width:1,height:.5}};
  async function mount(){
    const bridge=window.NicheWorksProEntitlement,engine=window.OldKanjiCropEngine;
    if(!bridge||!engine||document.getElementById('okj-pro-crop'))return;
    const first=await bridge.refreshProState({productId:PRODUCT,featureId:FEATURE});
    if(!first.active)return;
    const fileInput=document.getElementById('image-input'),img=document.getElementById('preview-image');
    const anchor=document.getElementById('preview-panel');
    if(!fileInput||!img||!anchor)return;
    const panel=el('section');panel.id='okj-pro-crop';panel.className='okj-pro-crop';
    panel.setAttribute('aria-label','Old Kanji Toolkit Pro cropped image OCR');
    const heading=el('h2',text('title')),hint=el('p',text('help'));
    const canvas=el('canvas');canvas.id='okj-pro-crop-canvas';canvas.hidden=true;
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label',text('accessible'));canvas.tabIndex=0;
    const controls=el('div');controls.className='okj-pro-crop-controls';controls.hidden=true;
    const label=el('label',text('choose')),select=el('select');select.id='okj-pro-crop-preset';
    label.htmlFor=select.id;
    for(const key of Object.keys(presets)){const option=el('option',text(key));option.value=key;select.append(option);}
    const reset=el('button',text('reset')),run=el('button',text('run'));
    reset.type='button';run.type='button';run.id='okj-pro-crop-run';run.disabled=true;
    controls.append(label,select,reset,run);
    const details=el('p'),status=el('p',text('wait'));status.setAttribute('aria-live','polite');
    status.className='okj-pro-crop-status';
    panel.append(heading,hint,canvas,controls,details,status);anchor.after(panel);
    let region=FULL,file=null,revision=0,dragStart=null,prior=null,dragging=false,busy=false;
    function warn(key){status.textContent=text(key);}
    function draw(){
      if(canvas.hidden||!img.naturalWidth||!img.naturalHeight)return;
      const ctx=canvas.getContext('2d');if(!ctx)return;
      const w=canvas.width,h=canvas.height;
      ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
      const x=region.x*w,y=region.y*h,r=region.width*w,b=region.height*h;
      ctx.fillStyle='rgba(8,24,44,.38)';
      ctx.fillRect(0,0,w,y);ctx.fillRect(0,y,x,b);
      ctx.fillRect(x+r,y,w-x-r,b);ctx.fillRect(0,y+b,w,h-y-b);
      ctx.strokeStyle='#1766bc';ctx.lineWidth=3;ctx.setLineDash([8,4]);
      ctx.strokeRect(x+1,y+1,Math.max(0,r-2),Math.max(0,b-2));ctx.setLineDash([]);
      const dims=engine.pixels(region,img.naturalWidth,img.naturalHeight);
      details.textContent=dims?text('selected')+': '+dims.width+' × '+dims.height+' px':'';
    }
    function loaded(){
      const selected=fileInput.files?.[0];
      if(!selected||!img.naturalWidth)return;
      const problem=engine.validateSource(selected);
      if(problem){warn(problem);return;}
      const size=engine.makePreviewSize(img.naturalWidth,img.naturalHeight);
      if(!size)return;
      canvas.width=size.width;canvas.height=size.height;
      file=selected;region=FULL;select.value='full';
      canvas.hidden=false;controls.hidden=false;run.disabled=busy;status.textContent='';draw();
    }
    fileInput.addEventListener('change',()=>{
      revision++;file=null;canvas.hidden=true;controls.hidden=true;run.disabled=true;
      details.textContent='';warn('wait');
      if(fileInput.files?.length&&img.complete&&img.naturalWidth)loaded();
    });
    img.addEventListener('load',loaded);
    document.getElementById('remove-image')?.addEventListener('click',()=>{
      revision++;file=null;canvas.hidden=true;controls.hidden=true;run.disabled=true;warn('wait');
    });
    if(fileInput.files?.length&&img.complete&&img.naturalWidth)loaded();
    function at(e){
      const b=canvas.getBoundingClientRect();
      return {x:Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),
        y:Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))};
    }
    canvas.addEventListener('pointerdown',e=>{
      if(busy||canvas.hidden)return;
      e.preventDefault();dragging=true;dragStart=at(e);prior=region;
      try{canvas.setPointerCapture?.(e.pointerId);}catch(_error){}
    });
    canvas.addEventListener('pointermove',e=>{
      if(!dragging)return;e.preventDefault();
      const next=engine.rectFromDrag(dragStart,at(e));
      if(next){region=next;draw();}
    });
    canvas.addEventListener('pointerup',e=>{
      if(!dragging)return;dragging=false;
      const next=engine.rectFromDrag(dragStart,at(e));
      if(next&&engine.pixels(next,img.naturalWidth,img.naturalHeight)){
        region=next;status.textContent='';select.value='full';
      }else{region=prior||FULL;warn('tiny');}
      dragStart=null;draw();
    });
    canvas.addEventListener('pointercancel',()=>{
      dragging=false;dragStart=null;region=prior||FULL;draw();
    });
    select.addEventListener('change',()=>{
      region=presets[select.value]||FULL;status.textContent='';draw();
    });
    reset.addEventListener('click',()=>{region=FULL;select.value='full';status.textContent='';draw();});
    run.addEventListener('click',async()=>{
      if(busy||run.disabled)return;
      busy=true;run.disabled=true;
      const snapshot=revision,source=fileInput.files?.[0];
      try{
        const gate=await bridge.refreshProState({productId:PRODUCT,featureId:FEATURE});
        if(!gate.active){warn('denied');return;}
        if(!source||file!==source||!img.naturalWidth){warn('wait');return;}
        const problem=engine.validateSource(source);
        if(problem){warn(problem);return;}
        if(!window.Tesseract||typeof window.Tesseract.recognize!=='function'){
          warn('engine');return;
        }
        const cropped=await engine.createCropBlob(img,region,gate,()=>document.createElement('canvas'));
        if(!cropped.ok){warn(cropped.error==='invalid_selection'?'tiny':'error');return;}
        warn('busy');
        const recognized=await window.Tesseract.recognize(cropped.blob,'jpn',{
          logger:e=>{if(typeof e?.progress==='number'){
            status.textContent=text('busy')+' '+Math.round(Math.max(0,Math.min(1,e.progress))*100)+'%';
          }}
        });
        if(snapshot!==revision||source!==fileInput.files?.[0]){warn('stale');return;}
        const result=typeof recognized?.data?.text==='string'?recognized.data.text:'';
        if(!result.trim()){warn('empty');return;}
        const editor=document.getElementById('manual-text');
        if(!editor){warn('error');return;}
        editor.value=result;editor.dispatchEvent(new Event('input',{bubbles:true}));
        warn('complete');editor.scrollIntoView({behavior:'smooth',block:'center'});
      }catch(_error){warn('error');}
      finally{busy=false;run.disabled=!file||!img.naturalWidth;}
    });
    new MutationObserver(()=>{
      heading.textContent=text('title');hint.textContent=text('help');label.textContent=text('choose');
      for(const option of select.options)option.textContent=text(option.value);
      reset.textContent=text('reset');run.textContent=text('run');
      canvas.setAttribute('aria-label',text('accessible'));draw();
    }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();