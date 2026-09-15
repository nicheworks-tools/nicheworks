const root = document.querySelector('[data-tool="pattern-atlas-vector-lab"]');

if (root) {
  const samples = {
    asanoha: ['麻の葉 / Asanoha', './assets/vector-lab/asanoha.png', '麻の葉の元PNG'],
    seigaiha: ['青海波 / Seigaiha', './assets/vector-lab/seigaiha.png', '青海波の元PNG'],
    shippo: ['七宝 / Shippo', './assets/vector-lab/shippo.png', '七宝の元PNG']
  };

  const imageTracerPresets = {
    geometric: { ltres:.45, qtres:1.4, pathomit:6, rightangleenhance:true, colorsampling:2, numberofcolors:5, colorquantcycles:3, layering:0, strokewidth:0, linefilter:false, scale:1, roundcoords:2, viewbox:true, desc:false, blurradius:0, blurdelta:20 },
    balanced: { ltres:.75, qtres:.75, pathomit:3, rightangleenhance:true, colorsampling:2, numberofcolors:8, colorquantcycles:3, layering:0, strokewidth:0, linefilter:false, scale:1, roundcoords:2, viewbox:true, desc:false, blurradius:0, blurdelta:20 },
    detail: { ltres:.25, qtres:.25, pathomit:1, rightangleenhance:false, colorsampling:2, numberofcolors:16, colorquantcycles:4, layering:0, strokewidth:0, linefilter:false, scale:1, roundcoords:3, viewbox:true, desc:false, blurradius:0, blurdelta:20 }
  };

  const vtracerPresets = {
    geometric: { mode:'polygon', hierarchical:'cutout', corner_threshold:60, length_threshold:4, max_iterations:10, splice_threshold:45, filter_speckle:4, color_precision:6, layer_difference:16, path_precision:2 },
    balanced: { mode:'spline', hierarchical:'cutout', corner_threshold:60, length_threshold:4, max_iterations:10, splice_threshold:45, filter_speckle:3, color_precision:6, layer_difference:12, path_precision:2 },
    detail: { mode:'spline', hierarchical:'stacked', corner_threshold:50, length_threshold:2, max_iterations:12, splice_threshold:35, filter_speckle:1, color_precision:7, layer_difference:8, path_precision:3 }
  };

  const VTRACER_JS = 'https://cdn.jsdelivr.net/npm/vtracer-webapp@0.4.0/vtracer_webapp_bg.js';
  const VTRACER_WASM = 'https://cdn.jsdelivr.net/npm/vtracer-webapp@0.4.0/vtracer_webapp_bg.wasm';
  const q = (name) => root.querySelector(`[data-pa-lab-${name}]`);
  const el = {
    pattern:q('pattern'), preset:q('preset'), source:q('source'), sourceName:q('source-name'), sourcePath:q('source-path'), sourceDimensions:q('source-dimensions'),
    tileCanvas:q('tile-canvas'), tileMeta:q('tile-meta'), periodMeta:q('period-meta'), x:q('x'), y:q('y'), width:q('width'), height:q('height'),
    detect:q('detect'), runImageTracer:q('run-imagetracer'), runVTracer:q('run-vtracer'), runBoth:q('run-both'), runBaseline:q('run-baseline'),
    results:q('results'), resultCount:q('result-count'), status:q('status'), tileSize:q('tile-size'), tileOutput:q('tile-output'), wasmState:q('wasm-state'), vtracerStage:q('vtracer-stage')
  };

  const states = new Map();
  let pixels = null;
  let sourceWidth = 0;
  let sourceHeight = 0;
  let vtracerBindings = null;
  let vtracerPromise = null;
  let seq = 0;

  function status(text, state='') {
    el.status.textContent = text;
    if (state) el.status.dataset.state = state; else delete el.status.dataset.state;
  }

  function busy(value) {
    [el.pattern, el.preset, el.detect, el.runImageTracer, el.runVTracer, el.runBoth, el.runBaseline].forEach((node) => { node.disabled = value; });
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function bytes(text) { return new TextEncoder().encode(text).byteLength; }
  function prettyBytes(value) { return value < 1024 ? `${value} B` : `${(value/1024).toFixed(value < 10240 ? 1 : 0)} KB`; }
  function serialize(svg) { return new XMLSerializer().serializeToString(svg); }
  function dataUrl(svg) { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; }

  function crop() {
    const x = clamp(Number(el.x.value)||0, 0, Math.max(0, sourceWidth-1));
    const y = clamp(Number(el.y.value)||0, 0, Math.max(0, sourceHeight-1));
    const width = clamp(Number(el.width.value)||sourceWidth, 1, sourceWidth-x);
    const height = clamp(Number(el.height.value)||sourceHeight, 1, sourceHeight-y);
    return { x, y, width, height };
  }

  function cropPixels(box=crop()) {
    const out = new ImageData(box.width, box.height);
    for (let row=0; row<box.height; row++) {
      const from = ((box.y+row)*sourceWidth+box.x)*4;
      out.data.set(pixels.data.subarray(from, from+box.width*4), row*box.width*4);
    }
    return out;
  }

  function diff(a, b) {
    const d = pixels.data;
    return (Math.abs(d[a]-d[b])+Math.abs(d[a+1]-d[b+1])+Math.abs(d[a+2]-d[b+2]))/3;
  }

  function periodError(axis, shift, sampleStep=12) {
    if (!pixels || shift<=0) return Infinity;
    let total=0, count=0;
    if (axis==='x') {
      if (shift>=sourceWidth) return Infinity;
      for (let y=0; y<sourceHeight; y+=sampleStep) for (let x=0; x<sourceWidth-shift; x+=sampleStep) {
        const a=(y*sourceWidth+x)*4, b=(y*sourceWidth+x+shift)*4; total+=diff(a,b); count++;
      }
    } else {
      if (shift>=sourceHeight) return Infinity;
      for (let y=0; y<sourceHeight-shift; y+=sampleStep) for (let x=0; x<sourceWidth; x+=sampleStep) {
        const a=(y*sourceWidth+x)*4, b=((y+shift)*sourceWidth+x)*4; total+=diff(a,b); count++;
      }
    }
    return count ? total/count : Infinity;
  }

  function detectAxis(axis) {
    const dimension = axis==='x' ? sourceWidth : sourceHeight;
    const min=16, max=Math.min(Math.floor(dimension/2),512), jump=dimension>=1024 ? 4 : 2;
    const scores=[];
    for (let shift=min; shift<=max; shift+=jump) scores.push({shift, score:periodError(axis,shift,20)});
    const minima=scores.filter((v,i)=>{ const a=scores[i-1], b=scores[i+1]; return (!a||v.score<=a.score)&&(!b||v.score<=b.score); });
    const ranked=(minima.length?minima:scores).sort((a,b)=>a.score-b.score);
    const best=ranked[0];
    if (!best) return {shift:dimension,score:Infinity};
    const threshold=Math.max(best.score+2.5,best.score*1.5);
    const fundamental=ranked.filter(v=>v.score<=threshold).sort((a,b)=>a.shift-b.shift)[0]||best;
    let refined={shift:fundamental.shift,score:Infinity};
    for (let shift=Math.max(min,fundamental.shift-jump*2); shift<=Math.min(max,fundamental.shift+jump*2); shift++) {
      const score=periodError(axis,shift,8); if (score<refined.score) refined={shift,score};
    }
    return refined;
  }

  function errorText(value) { return Number.isFinite(value) ? value.toFixed(value<10?2:1) : '—'; }

  function drawTile() {
    if (!pixels) return;
    const box=crop(), tile=cropPixels(box), ctx=el.tileCanvas.getContext('2d');
    el.tileCanvas.width=box.width; el.tileCanvas.height=box.height; ctx.putImageData(tile,0,0);
    const ratio=box.width*box.height/(sourceWidth*sourceHeight)*100;
    el.tileMeta.textContent=`${box.width}×${box.height}px / source area ${ratio.toFixed(2)}% / approx ${(sourceWidth/box.width).toFixed(1)}×${(sourceHeight/box.height).toFixed(1)} repeats`;
    el.periodMeta.textContent=`repeat error X ${errorText(periodError('x',box.width))} / Y ${errorText(periodError('y',box.height))} — lower is better`;
  }

  async function detectTile() {
    if (!pixels) return;
    busy(true); status('反復周期を検出中…','busy'); await new Promise(r=>setTimeout(r,0));
    try {
      const x=detectAxis('x'), y=detectAxis('y');
      el.x.value='0'; el.y.value='0'; el.width.value=String(x.shift); el.height.value=String(y.shift); drawTile();
      const worst=Math.max(x.score,y.score), state=worst<=4?'ok':worst>10?'error':'';
      status(`検出: ${x.shift}×${y.shift}px / repeat error ${errorText(x.score)}, ${errorText(y.score)}。必要なら数値を手動調整できます。`,state);
    } finally { busy(false); }
  }

  async function loadSource() {
    const [label,src,alt]=samples[el.pattern.value];
    busy(true); status('元画像を読み込み中…','busy'); states.clear(); el.results.innerHTML='<p class="pa-muted">まだ変換していません。</p>'; el.resultCount.textContent='0 results';
    try {
      const image=new Image(); image.decoding='async'; image.src=src; await image.decode();
      sourceWidth=image.naturalWidth; sourceHeight=image.naturalHeight;
      const canvas=document.createElement('canvas'); canvas.width=sourceWidth; canvas.height=sourceHeight;
      const ctx=canvas.getContext('2d',{willReadFrequently:true}); ctx.drawImage(image,0,0); pixels=ctx.getImageData(0,0,sourceWidth,sourceHeight);
      el.source.src=src; el.source.alt=alt; el.sourceName.textContent=label; el.sourcePath.textContent=src.replace('./',''); el.sourceDimensions.textContent=`${sourceWidth}×${sourceHeight}px`;
      el.x.max=String(sourceWidth-1); el.y.max=String(sourceHeight-1); el.width.max=String(sourceWidth); el.height.max=String(sourceHeight);
      await detectTile();
    } catch (error) { status(`元画像の読み込みに失敗しました: ${error.message||error}`,'error'); }
    finally { busy(false); }
  }

  function normalizeColor(value) {
    const s=(value||'').trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(s)) return s;
    const m=s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    return m ? '#'+m.slice(1).map(n=>Number(n).toString(16).padStart(2,'0')).join('') : null;
  }

  function palette(svg) {
    const found=[], seen=new Set();
    svg.querySelectorAll('[fill]').forEach(node=>{ const c=normalizeColor(node.getAttribute('fill')); if (c&&!seen.has(c)) { seen.add(c); found.push(c); } });
    return found.slice(0,12);
  }

  function setFill(svg, from, to) {
    svg.querySelectorAll('[fill]').forEach(node=>{ if (normalizeColor(node.getAttribute('fill'))===from) node.setAttribute('fill',to); });
  }

  function ensureGeometry(svg,width,height) {
    svg.removeAttribute('width'); svg.removeAttribute('height');
    if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
  }

  function commands(svg) {
    let count=0; svg.querySelectorAll('path[d]').forEach(p=>{ count+=(p.getAttribute('d').match(/[MmLlHhVvCcSsQqTtAaZz]/g)||[]).length; }); return count;
  }

  function patternSvg(svg,width,height) {
    const clone=svg.cloneNode(true); ensureGeometry(clone,width,height);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><pattern id="p" patternUnits="userSpaceOnUse" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${clone.innerHTML}</pattern></defs><rect width="800" height="800" fill="url(#p)"/></svg>`;
  }

  function download(name,text) {
    const url=URL.createObjectURL(new Blob([text],{type:'image/svg+xml;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function refresh(state) {
    const svg=state.stage.querySelector('svg'); if (!svg) return;
    const text=serialize(svg); state.repeat.style.backgroundImage=`url("${dataUrl(text)}")`; state.repeat.style.backgroundSize=`${el.tileSize.value}px auto`;
    state.byteMetric.textContent=`SVG ${prettyBytes(bytes(text))}`; state.colorMetric.textContent=`colors ${palette(svg).length}`;
  }

  function colorEditor(state) {
    const frag=document.createDocumentFragment();
    palette(state.stage.querySelector('svg')).forEach((original,i)=>{
      const label=document.createElement('label'); label.className='pa-lab-color';
      const input=document.createElement('input'); input.type='color'; input.value=original; input.setAttribute('aria-label',`Color ${i+1}`);
      const text=document.createElement('span'); text.textContent=original;
      input.addEventListener('input',()=>{ const previous=input.dataset.current||original; setFill(state.stage.querySelector('svg'),previous,input.value); input.dataset.current=input.value; text.textContent=input.value; refresh(state); });
      label.append(input,text); frag.append(label);
    }); return frag;
  }

  function render({engine,scope,preset,svgText,elapsed,width,height,area}) {
    if (el.results.querySelector('.pa-muted')) el.results.innerHTML='';
    const parsed=new DOMParser().parseFromString(svgText,'image/svg+xml'), svg=parsed.documentElement;
    if (svg.nodeName.toLowerCase()!=='svg'||parsed.querySelector('parsererror')) throw new Error('SVG parse failed');
    ensureGeometry(svg,width,height);
    const card=document.createElement('article'); card.className='pa-lab-result';
    const head=document.createElement('div'); head.className='pa-lab-result-head';
    const label=document.createElement('div'); label.innerHTML=`<h3 class="pa-lab-result-title">${engine}</h3><p class="pa-lab-result-sub">${scope==='tile'?'v2 tile':'v1 full image'} / ${preset} / ${width}×${height}px</p>`;
    const metrics=document.createElement('p'); metrics.className='pa-lab-metrics';
    const byteMetric=document.createElement('span'), colorMetric=document.createElement('span'); byteMetric.className=colorMetric.className='pa-lab-metric';
    const metricTexts=[`paths ${svg.querySelectorAll('path').length}`,`commands ${commands(svg)}`,`${elapsed.toFixed(0)} ms`,`source ${area.toFixed(2)}%`];
    byteMetric.textContent=`SVG ${prettyBytes(bytes(svgText))}`; colorMetric.textContent=`colors ${palette(svg).length}`; metrics.append(byteMetric,colorMetric);
    metricTexts.forEach(t=>{ const m=document.createElement('span'); m.className='pa-lab-metric'; m.textContent=t; metrics.append(m); }); head.append(label,metrics);
    const grid=document.createElement('div'); grid.className='pa-lab-result-grid';
    const stage=document.createElement('div'); stage.className='pa-lab-svg-stage'; stage.append(document.importNode(svg,true));
    const repeat=document.createElement('div'); repeat.className='pa-lab-repeat-stage';
    const p1=document.createElement('div'); p1.className='pa-lab-panel'; p1.innerHTML='<h4>単体SVG</h4>'; p1.append(stage);
    const p2=document.createElement('div'); p2.className='pa-lab-panel'; p2.innerHTML='<h4>反復プレビュー</h4>'; p2.append(repeat); grid.append(p1,p2);
    const editor=document.createElement('div'); editor.className='pa-lab-editor';
    const actions=document.createElement('div'); actions.className='pa-lab-editor-actions';
    const reset=document.createElement('button'); reset.className='pa-button'; reset.type='button'; reset.textContent='色を戻す';
    const tileSave=document.createElement('button'); tileSave.className='pa-button'; tileSave.type='button'; tileSave.textContent='Tile SVG保存';
    const patternSave=document.createElement('button'); patternSave.className='pa-button pa-button-primary'; patternSave.type='button'; patternSave.textContent='Pattern SVG保存'; actions.append(reset,tileSave,patternSave);
    const state={id:++seq,engine,scope,preset,width,height,original:svgText,stage,repeat,byteMetric,colorMetric,editor}; editor.append(colorEditor(state),actions); card.append(head,grid,editor); el.results.append(card); states.set(state.id,state);
    reset.addEventListener('click',()=>{ const fresh=new DOMParser().parseFromString(state.original,'image/svg+xml').documentElement; ensureGeometry(fresh,width,height); stage.replaceChildren(document.importNode(fresh,true)); editor.querySelectorAll('.pa-lab-color').forEach(n=>n.remove()); editor.prepend(colorEditor(state)); refresh(state); });
    tileSave.addEventListener('click',()=>download(`${el.pattern.value}-${engine.toLowerCase().replace(/\s+/g,'-')}-${scope}.svg`,serialize(stage.querySelector('svg'))));
    patternSave.addEventListener('click',()=>download(`${el.pattern.value}-${engine.toLowerCase().replace(/\s+/g,'-')}-pattern.svg`,patternSvg(stage.querySelector('svg'),width,height)));
    refresh(state); el.resultCount.textContent=`${states.size} result${states.size===1?'':'s'}`;
  }

  function traceImageTracer(imageData,preset) {
    if (!window.ImageTracer?.imagedataToSVG) throw new Error('ImageTracerJSを読み込めませんでした');
    const start=performance.now(), svgText=window.ImageTracer.imagedataToSVG(imageData,{...imageTracerPresets[preset]}); return {svgText,elapsed:performance.now()-start};
  }

  async function loadVTracer() {
    if (vtracerBindings) return vtracerBindings;
    if (vtracerPromise) return vtracerPromise;
    el.wasmState.textContent='VTracer WASM: loading…';
    vtracerPromise=(async()=>{
      const bindings=await import(VTRACER_JS), response=await fetch(VTRACER_WASM,{mode:'cors'}); if (!response.ok) throw new Error(`WASM HTTP ${response.status}`);
      let instance; try { ({instance}=await WebAssembly.instantiateStreaming(response.clone(),{'./vtracer_webapp_bg.js':bindings})); } catch (_) { ({instance}=await WebAssembly.instantiate(await response.arrayBuffer(),{'./vtracer_webapp_bg.js':bindings})); }
      if (typeof bindings.__wbg_set_wasm!=='function') throw new Error('VTracer WASM binding mismatch');
      bindings.__wbg_set_wasm(instance.exports); if (typeof instance.exports.__wbindgen_start==='function') instance.exports.__wbindgen_start();
      vtracerBindings=bindings; el.wasmState.textContent='VTracer WASM: ready'; return bindings;
    })().catch(error=>{ vtracerPromise=null; el.wasmState.textContent='VTracer WASM: load failed'; throw error; }); return vtracerPromise;
  }

  async function traceVTracer(imageData,preset) {
    const bindings=await loadVTracer(), token=`pa-vt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const canvas=document.createElement('canvas'); canvas.id=`${token}-c`; canvas.width=imageData.width; canvas.height=imageData.height; canvas.getContext('2d').putImageData(imageData,0,0);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.id=`${token}-s`; svg.setAttribute('width',imageData.width); svg.setAttribute('height',imageData.height); svg.setAttribute('viewBox',`0 0 ${imageData.width} ${imageData.height}`); el.vtracerStage.append(canvas,svg);
    let converter; const start=performance.now();
    try {
      if (!bindings.ColorImageConverter?.new_with_string) throw new Error('VTracer ColorImageConverter APIを初期化できませんでした');
      converter=bindings.ColorImageConverter.new_with_string(JSON.stringify({...vtracerPresets[preset],canvas_id:canvas.id,svg_id:svg.id})); converter.init();
      await new Promise((resolve,reject)=>{ const tick=()=>{ try { converter.tick()?resolve():setTimeout(tick,0); } catch(e){ reject(e); } }; setTimeout(tick,0); });
      ensureGeometry(svg,imageData.width,imageData.height); return {svgText:serialize(svg),elapsed:performance.now()-start};
    } finally { if (converter?.free) converter.free(); canvas.remove(); svg.remove(); }
  }

  function clear() { el.results.innerHTML=''; states.clear(); el.resultCount.textContent='0 results'; }
  function area(width,height) { return width*height/(sourceWidth*sourceHeight)*100; }

  async function runEngine(engine) {
    const box=crop(), image=cropPixels(box), preset=el.preset.value; status(`${engine} / ${box.width}×${box.height}px を変換中…`,'busy');
    const traced=engine==='ImageTracerJS'?traceImageTracer(image,preset):await traceVTracer(image,preset);
    render({engine,scope:'tile',preset,...traced,width:box.width,height:box.height,area:area(box.width,box.height)});
  }

  async function runOne(engine) { busy(true); clear(); try { await runEngine(engine); status(`${engine} の最小タイル変換が完了しました。`,'ok'); } catch(e){ el.results.innerHTML=`<p class="pa-muted">変換に失敗しました: ${String(e.message||e)}</p>`; status(`変換に失敗しました: ${String(e.message||e)}`,'error'); } finally { busy(false); } }
  async function runBoth() { busy(true); clear(); try { await runEngine('ImageTracerJS'); await runEngine('VTracer WASM'); status('同じ最小タイルのA/B比較が完了しました。','ok'); } catch(e){ status(`A/B比較途中で失敗しました: ${String(e.message||e)}`,'error'); } finally { busy(false); } }

  async function runBaseline() {
    if (!pixels) return; busy(true); clear(); status('v1相当の全体画像トレースを実行中…','busy'); await new Promise(r=>setTimeout(r,0));
    try {
      const preset=el.preset.value, full=traceImageTracer(pixels,preset); render({engine:'ImageTracerJS',scope:'full',preset,...full,width:sourceWidth,height:sourceHeight,area:100});
      const box=crop(), tile=traceImageTracer(cropPixels(box),preset); render({engine:'ImageTracerJS',scope:'tile',preset,...tile,width:box.width,height:box.height,area:area(box.width,box.height)}); status('v1全体画像とv2最小タイルの比較が完了しました。','ok');
    } catch(e){ status(`baseline比較に失敗しました: ${String(e.message||e)}`,'error'); } finally { busy(false); }
  }

  el.pattern.addEventListener('change',loadSource); el.detect.addEventListener('click',detectTile); el.runImageTracer.addEventListener('click',()=>runOne('ImageTracerJS')); el.runVTracer.addEventListener('click',()=>runOne('VTracer WASM')); el.runBoth.addEventListener('click',runBoth); el.runBaseline.addEventListener('click',runBaseline);
  [el.x,el.y,el.width,el.height].forEach(input=>input.addEventListener('input',drawTile)); el.tileSize.addEventListener('input',()=>{ el.tileOutput.textContent=`${el.tileSize.value}px`; states.forEach(refresh); });
  loadSource();
}
