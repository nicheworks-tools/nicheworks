"use strict";
(()=>{const $=id=>document.getElementById(id),c=$("canvas"),ctx=c.getContext("2d"),ws=$("workspace");let items=[],selected=new Set(),history=[],future=[],drag=null,scale=1,serial=0,language="ja",opacityBefore=null;const maxHistory=35;
const tr=(ja,en)=>language==="ja"?ja:en;
function snapshot(){return {items:items.map(o=>({id:o.id,img:o.img,name:o.name,x:o.x,y:o.y,w:o.w,h:o.h,alpha:o.alpha})),width:c.width,height:c.height,background:$("background").value};}
function save(){history.push(snapshot());if(history.length>maxHistory)history.shift();future=[];}
function restore(s){items=s.items.map(o=>({...o}));c.width=s.width;c.height=s.height;$("width").value=s.width;$("height").value=s.height;$("background").value=s.background;selected.clear();fit();}
function bounds(){return c.getBoundingClientRect();}
function point(e){const b=bounds();return {x:(e.clientX-b.left)*c.width/b.width,y:(e.clientY-b.top)*c.height/b.height};}
function hit(p){for(let i=items.length-1;i>=0;i--){const o=items[i];if(p.x>=o.x&&p.x<=o.x+o.w&&p.y>=o.y&&p.y<=o.y+o.h)return o;}return null;}
function renderLayers(){const list=$("layers");if(!list)return;const ids=items.map(o=>o.id).join(",");if(list.dataset.ids!==ids){const nodes=items.map((o,i)=>{const button=document.createElement("button");button.type="button";button.className="layer-button";button.dataset.layerId=String(o.id);button.onclick=()=>{selected=new Set([o.id]);render();c.focus();};return button;});list.replaceChildren(...nodes);list.dataset.ids=ids;}for(const button of list.children){const o=items.find(item=>String(item.id)===button.dataset.layerId);if(!o)continue;button.textContent=o.name||("Image "+o.id);button.setAttribute("aria-label",tr("画像レイヤー: ","Image layer: ")+button.textContent);button.setAttribute("aria-pressed",String(selected.has(o.id)));}}
function render(){ctx.clearRect(0,0,c.width,c.height);if($("background").value==="white"){ctx.fillStyle="white";ctx.fillRect(0,0,c.width,c.height);}for(const o of items){ctx.globalAlpha=o.alpha;ctx.drawImage(o.img,o.x,o.y,o.w,o.h);ctx.globalAlpha=1;if(selected.has(o.id)){ctx.strokeStyle="#0875f9";ctx.lineWidth=Math.max(2,3/scale);ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.fillStyle="#0875f9";for(const [x,y] of [[o.x,o.y],[o.x+o.w,o.y],[o.x,o.y+o.h],[o.x+o.w,o.y+o.h]])ctx.fillRect(x-6/scale,y-6/scale,12/scale,12/scale);}}$("status").textContent=tr("画像 "+items.length+" 枚 / 選択 "+selected.size+" 枚","Images "+items.length+" / Selected "+selected.size);renderLayers();}
function fit(){const available=Math.max(240,ws.clientWidth-44);scale=Math.max(0.5,Math.min(1,available/c.width));c.style.width=Math.round(c.width*scale)+"px";c.style.height=Math.round(c.height*scale)+"px";render();}
const MAX_CANVAS_PIXELS=24000000,MAX_IMAGE_PIXELS=24000000,MAX_TOTAL_IMAGE_PIXELS=48000000,MAX_FILE_BYTES=32*1024*1024;
function issue(message){const el=$("error");if(el){el.textContent=message;el.hidden=!message;}}
function change(fn){save();fn();render();}
function resizeCanvas(){
  const w=Number($("width").value),h=Number($("height").value);
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<100||h<100||w>12000||h>12000||w*h>MAX_CANVAS_PIXELS){
    $("width").value=c.width;$("height").value=c.height;
    issue(tr("キャンバスは各辺100〜12,000px、合計2,400万画素以内にしてください。","Canvas sides must be 100–12,000px, with no more than 24 million total pixels."));
    return;
  }
  if(w===c.width&&h===c.height){issue("");return;}
  save();
  try{c.width=w;c.height=h;fit();issue("");}
  catch(error){issue(tr("キャンバスのサイズ変更に失敗しました。","Could not resize the canvas."));console.error(error);}
}
let loadQueue=Promise.resolve();
function load(files){
  const incoming=[...files].filter(f=>/^image\/(png|jpeg|webp)$/.test(f.type));
  if(!incoming.length){issue(tr("PNG、JPEG、WebP形式の画像を選択してください。","Choose PNG, JPEG, or WebP images."));return;}
  loadQueue=loadQueue.then(async()=>{
    const ready=[];
    let rejected=0;
    let pixels=items.reduce((total,item)=>total+(item.img.naturalWidth||item.img.width)*(item.img.naturalHeight||item.img.height),0);
    for(const file of incoming){
      if(file.size>MAX_FILE_BYTES){rejected++;continue;}
      const image=await new Promise(resolve=>{
        const url=URL.createObjectURL(file),img=new Image();
        img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
        img.onerror=()=>{URL.revokeObjectURL(url);resolve(null);};
        img.src=url;
      });
      if(!image){rejected++;continue;}
      const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
      if(w<=0||h<=0||w*h>MAX_IMAGE_PIXELS||pixels+w*h>MAX_TOTAL_IMAGE_PIXELS){rejected++;continue;}
      pixels+=w*h;
      ready.push({img:image,name:file.name});
    }
    if(ready.length)change(()=>{
      for(const {img,name} of ready){
        const factor=Math.min(1,600/img.width,600/img.height),id=++serial;
        items.push({id,img,name,x:40+(id%8)*30,y:40+(id%8)*30,w:img.width*factor,h:img.height*factor,alpha:1});
      }
      selected=new Set([serial]);
    });
    if(rejected)issue(tr("一部の画像を読み込めませんでした。画像は32MB・2,400万画素以下、合計4,800万画素以内にしてください。","Some images were rejected. Limit each file to 32MB and 24MP, with 48MP total across layers."));
    else issue("");
  }).catch(error=>{
    issue(tr("画像の読み込みに失敗しました。","Could not import images."));
    console.error("Screenshot Canvas import error",error);
  });
}
$("files").onchange=e=>{load(e.target.files);e.target.value="";};
ws.addEventListener("dragover",e=>e.preventDefault());ws.addEventListener("drop",e=>{e.preventDefault();load(e.dataTransfer.files);});document.addEventListener("paste",e=>{const files=[...e.clipboardData.items].filter(i=>i.kind==="file").map(i=>i.getAsFile()).filter(Boolean);if(files.length)load(files);});
c.addEventListener("pointerdown",e=>{const p=point(e),o=hit(p);if(!o){selected.clear();render();return;}if(e.shiftKey){if(selected.has(o.id))selected.delete(o.id);else selected.add(o.id);render();return;}if(!selected.has(o.id))selected=new Set([o.id]);const corners=[[o.x,o.y,"nw"],[o.x+o.w,o.y,"ne"],[o.x,o.y+o.h,"sw"],[o.x+o.w,o.y+o.h,"se"]];const corner=selected.size===1?corners.find(([x,y])=>Math.hypot(p.x-x,p.y-y)<Math.max(20,15/scale)):null;save();drag={id:o.id,p,mode:corner?"resize":"move",corner:corner?.[2],start:items.filter(a=>selected.has(a.id)).map(a=>({id:a.id,x:a.x,y:a.y,w:a.w,h:a.h}))};c.setPointerCapture(e.pointerId);render();});
c.addEventListener("pointermove",e=>{if(!drag)return;const p=point(e),dx=p.x-drag.p.x,dy=p.y-drag.p.y;for(const st of drag.start){const o=items.find(a=>a.id===st.id);if(drag.mode==="move"){o.x=st.x+dx;o.y=st.y+dy;}else{const sx=drag.corner.includes("w")?-1:1,sy=drag.corner.includes("n")?-1:1;const factor=Math.max(.03,1+((dx*sx/st.w)+(dy*sy/st.h))/2);o.w=st.w*factor;o.h=st.h*factor;o.x=st.x+(sx<0?st.w-o.w:0);o.y=st.y+(sy<0?st.h-o.h:0);}}render();});const finish=()=>{drag=null;};c.addEventListener("pointerup",finish);c.addEventListener("pointercancel",finish);
c.addEventListener("keydown",e=>{if(e.key==="Escape"){selected.clear();render();e.preventDefault();return;}const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==="z"){e.preventDefault();if(e.shiftKey)$("redo").click();else $("undo").click();return;}if(mod&&e.key.toLowerCase()==="y"){e.preventDefault();$("redo").click();return;}if(!selected.size)return;if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();$("delete").click();return;}const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(directions[e.key]){e.preventDefault();const [x,y]=directions[e.key],step=e.shiftKey?10:1;change(()=>{for(const item of items)if(selected.has(item.id)){item.x+=x*step;item.y+=y*step;}});}});
$("undo").onclick=()=>{if(!history.length)return;future.push(snapshot());restore(history.pop());};$("redo").onclick=()=>{if(!future.length)return;history.push(snapshot());restore(future.pop());};
$("delete").onclick=()=>{if(selected.size)change(()=>{items=items.filter(o=>!selected.has(o.id));selected.clear();});};
$("duplicate").onclick=()=>{if(!selected.size)return;change(()=>{const copies=items.filter(o=>selected.has(o.id)).map(o=>({...o,id:++serial,x:o.x+24,y:o.y+24}));items.push(...copies);selected=new Set(copies.map(o=>o.id));});};
$("front").onclick=()=>{if(selected.size)change(()=>{items=[...items.filter(o=>!selected.has(o.id)),...items.filter(o=>selected.has(o.id))];});};
$("back").onclick=()=>{if(selected.size)change(()=>{items=[...items.filter(o=>selected.has(o.id)),...items.filter(o=>!selected.has(o.id))];});};
$("opacity").onpointerdown=()=>{opacityBefore=snapshot();};$("opacity").oninput=e=>{if(!opacityBefore)opacityBefore=snapshot();const a=+e.target.value/100;for(const o of items.filter(o=>selected.has(o.id)))o.alpha=a;render();};$("opacity").onchange=()=>{if(opacityBefore){history.push(opacityBefore);if(history.length>maxHistory)history.shift();future=[];opacityBefore=null;}};
function layout(mode){if(!items.length)return;const gap=Math.max(0,Math.min(500,+$("gap").value||0));change(()=>{if(mode==="overlay"){items.forEach(o=>{o.x=(c.width-o.w)/2;o.y=(c.height-o.h)/2;});return;}const cols=mode==="column"?1:mode==="row"?items.length:Math.ceil(Math.sqrt(items.length));let x=gap,y=gap,rowH=0;items.forEach((o,i)=>{if(i&&i%cols===0){x=gap;y+=rowH+gap;rowH=0;}o.x=x;o.y=y;x+=o.w+gap;rowH=Math.max(rowH,o.h);});});}
document.querySelectorAll("[data-layout]").forEach(b=>b.onclick=()=>layout(b.dataset.layout));$("width").onchange=resizeCanvas;$("height").onchange=resizeCanvas;$("background").onfocus=()=>{if(!opacityBefore)opacityBefore=snapshot();};$("background").onchange=()=>{if(opacityBefore){history.push(opacityBefore);opacityBefore=null;future=[];}render();};$("fit").onclick=fit;
$("export").onclick=()=>{
  if(c.width*c.height>MAX_CANVAS_PIXELS){issue(tr("キャンバスの合計画素数が上限を超えています。","Canvas exceeds the 24MP export limit."));return;}
  try{
    const exportCanvas=document.createElement("canvas");
    exportCanvas.width=c.width;exportCanvas.height=c.height;
    const x=exportCanvas.getContext("2d");
    if(!x)throw Error("Export canvas context unavailable");
    if($("background").value==="white"){x.fillStyle="white";x.fillRect(0,0,c.width,c.height);}
    for(const o of items){x.globalAlpha=o.alpha;x.drawImage(o.img,o.x,o.y,o.w,o.h);}
    exportCanvas.toBlob(blob=>{
      if(!blob){issue(tr("PNGを生成できませんでした。画像サイズを小さくしてください。","PNG export failed. Try a smaller canvas."));return;}
      try{
        const u=URL.createObjectURL(blob),a=document.createElement("a");
        a.href=u;a.download="screenshot-canvas.png";a.click();
        setTimeout(()=>URL.revokeObjectURL(u),30000);
        issue("");
      }catch(error){issue(tr("PNGファイルを保存できませんでした。","Could not save the PNG file."));console.error(error);}
    },"image/png");
  }catch(error){issue(tr("PNG書き出しに失敗しました。画像サイズを小さくしてください。","Could not export PNG. Try a smaller canvas."));console.error(error);}
};
$("lang").onchange=e=>{language=e.target.value;document.documentElement.lang=language;document.querySelectorAll("[data-ja]").forEach(el=>el.textContent=el.dataset[language]);render();};window.addEventListener("resize",fit);fit();})();