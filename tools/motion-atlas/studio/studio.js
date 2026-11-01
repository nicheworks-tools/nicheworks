(() => {
"use strict";
const ja = document.documentElement.lang === "ja";
const $ = id => document.getElementById(id);
const EFFECTS = Object.freeze({
 "fade-in":[{opacity:0},{opacity:1}],
 "slide-in":[{opacity:0,transform:"translateX(45px)"},{opacity:1,transform:"translateX(0)"}],
 "fade-up":[{opacity:0,transform:"translateY(24px)"},{opacity:1,transform:"translateY(0)"}],
 "scale-in":[{opacity:0,transform:"scale(.65)"},{opacity:1,transform:"scale(1)"}],
 "overshoot":[{opacity:0,transform:"scale(.65)",offset:0},{opacity:1,transform:"scale(1.17)",offset:.6},{transform:"scale(.94)",offset:.8},{transform:"scale(1)",offset:1}],
 "wiggle":[{transform:"rotate(0)",offset:0},{transform:"rotate(-8deg)",offset:.3},{transform:"rotate(7deg)",offset:.7},{transform:"rotate(0)",offset:1}],
 "pulse":[{transform:"scale(1)",offset:0},{transform:"scale(1.08)",offset:.5},{transform:"scale(1)",offset:1}],
 "mask-reveal":[{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0 0 0)"}],
 "squash-stretch":[{transform:"scale(1,1)",offset:0},{transform:"scale(1.22,.76)",offset:.3},{transform:"scale(.86,1.14)",offset:.65},{transform:"scale(1,1)",offset:1}],
 "parallax":[{transform:"translateX(0)"},{transform:"translateX(36px)"}]
});
const EASINGS=["ease","ease-in","ease-out","ease-in-out","linear","cubic-bezier(.2,.8,.2,1)"];
const WORDS = ja ? {
 effect:"演出",delay:"開始時刻（ms）",duration:"再生時間（ms）",easing:"速度曲線",
 up:"上へ",down:"下へ",remove:"削除",empty:"少なくとも1件必要です",
 max:"最大8件です",invalid:"時間の入力を確認してください",long:"合計時間は15秒以内にしてください",
 running:"モーションを再生しました。",stopped:"停止しました。",reduced:"動きを減らす設定のため静止表示にしました。",
 saved:"プリセットを保存しました。",loaded:"プリセットを読み込みました。",deleted:"プリセットを削除しました。",
 noPreset:"保存したプリセットがありません。",saveFail:"ブラウザへの保存に失敗しました。",
 noName:"保存名を入力してください。",notForSale:"Studioは販売準備中です。購入済みの有効な権限がないためコード生成はできません。",
 exporting:"サーバーで購入権限を確認しています…",denied:"購入権限が確認できません。購入・決済はまだ開始していません。",
 error:"サーバーでのコード生成に失敗しました。",ready:"CSSとReactのコード生成が完了しました。",download:"コード一式を保存しました。"
} : {
 effect:"Effect",delay:"Start (ms)",duration:"Length (ms)",easing:"Easing",
 up:"Up",down:"Down",remove:"Remove",empty:"At least one track is required.",
 max:"Maximum 8 tracks",invalid:"Check the start and duration values.",long:"Keep the timeline within 15 seconds.",
 running:"Motion sequence playing.",stopped:"Stopped.",reduced:"Reduced-motion preference active: stationary preview shown.",
 saved:"Preset saved.",loaded:"Preset loaded.",deleted:"Preset deleted.",
 noPreset:"No saved presets.",saveFail:"Unable to save to this browser.",
 noName:"Enter a preset name.",notForSale:"Studio is not on sale yet. No verified paid entitlement is available for code export.",
 exporting:"Verifying server-side purchase authorization…",denied:"Paid entitlement not verified. Studio checkout is not yet available.",
 error:"Server code generation failed.",ready:"CSS and React bundle generated.",download:"Code bundle downloaded."
};
const STORAGE="motionAtlasStudioPresetsV1";
const SESSION_KEY="nicheworks:billing:session:motion_atlas.studio_v1";
const defaultTrack=(effect,delay,duration)=>({effect,delay,duration,easing:"ease-out"});
let tracks=[defaultTrack("fade-up",0,750),defaultTrack("overshoot",320,720)];
let animations=[],bundle=null;
const getText=()=>String($("target-text").value||"").slice(0,80).replace(/[\u0000-\u001f\u007f]/g,"");
const el=(name,text,className)=>{
 const node=document.createElement(name);
 if(text!==undefined&&text!==null)node.textContent=String(text);
 if(className)node.className=className;
 return node;
};
const message=text=>{$("status").textContent=text;};
const total=()=>tracks.reduce((n,t)=>Math.max(n,t.delay+t.duration),0);
function valid(){
 return tracks.length>=1&&tracks.length<=8&&getText().trim().length>0&&
 tracks.every(t=>Object.hasOwn(EFFECTS,t.effect)&&Number.isInteger(t.delay)&&t.delay>=0&&t.delay<=12000&&Number.isInteger(t.duration)&&t.duration>=100&&t.duration<=5000&&EASINGS.includes(t.easing))&&total()<=15000;
}
function updateTotal(){
 $("total-duration").textContent=String(total())+" ms";
 $("add-track").disabled=tracks.length>=8;
 if(total()>15000)message(WORDS.long);
}
function selectFrom(options,value,className){
 const s=el("select",null,className);
 options.forEach(item=>{const o=el("option",item);o.value=item;if(item===value)o.selected=true;s.append(o);});
 return s;
}
function addField(row,label,child){
 const wrap=el("label",label);
 wrap.append(child);
 row.append(wrap);
}
function renderTracks(){
 const list=$("timeline-list");list.replaceChildren();
 tracks.forEach((track,index)=>{
  const card=el("div",null,"track");
  card.dataset.index=String(index);
  const title=el("div",null,"track-header");
  title.append(el("strong",(ja?"トラック":"Track")+" "+(index+1)));
  const controls=el("div",null,"track-actions");
  [[WORDS.up,()=>move(index,-1),index===0],[WORDS.down,()=>move(index,1),index===tracks.length-1],[WORDS.remove,()=>remove(index),tracks.length===1]].forEach(([label,click,disabled])=>{
    const button=el("button",label);button.type="button";button.disabled=disabled;button.addEventListener("click",click);controls.append(button);
  });
  title.append(controls);card.append(title);
  const fields=el("div",null,"track-fields");
  const effect=selectFrom(Object.keys(EFFECTS),track.effect,"track-effect");
  effect.addEventListener("change",()=>{track.effect=effect.value;createStage();});
  addField(fields,WORDS.effect,effect);
  [["delay",WORDS.delay,0,12000],["duration",WORDS.duration,100,5000]].forEach(([key,label,min,max])=>{
    const input=el("input");
    input.type="number";input.min=String(min);input.max=String(max);input.step="10";input.value=String(track[key]);
    input.addEventListener("change",()=>{
      const n=Number(input.value);
      if(!Number.isInteger(n)||n<min||n>max){input.value=String(track[key]);message(WORDS.invalid);return;}
      track[key]=n;updateTotal();drawBar(card,track);createStage();
    });
    addField(fields,label,input);
  });
  card.append(fields);
  const easing=selectFrom(EASINGS,track.easing,"track-easing");
  easing.addEventListener("change",()=>{track.easing=easing.value;createStage();});
  addField(card,WORDS.easing,easing);
  const ruler=el("div",null,"track-ruler");ruler.setAttribute("aria-hidden","true");
  ruler.append(el("span",null,"track-bar"));card.append(ruler);
  list.append(card);drawBar(card,track);
 });
 updateTotal();
}
function drawBar(card,track){
 const bar=card.querySelector(".track-bar");
 if(!bar)return;
 bar.style.left=String(track.delay/15000*100)+"%";
 bar.style.width=String(Math.max(track.duration/15000*100,.75))+"%";
}
function move(index,direction){
 const other=index+direction;if(other<0||other>=tracks.length)return;
 const copy=tracks[index];tracks[index]=tracks[other];tracks[other]=copy;
 renderTracks();createStage();
}
function remove(index){if(tracks.length<2){message(WORDS.empty);return;}tracks.splice(index,1);renderTracks();createStage();}
function createStage(){
 animations.forEach(a=>a.cancel());animations=[];
 const stage=$("stage");stage.replaceChildren();
 let parent=stage;
 tracks.forEach(()=>{
  const wrapper=el("span",null,"studio-layer");parent.append(wrapper);parent=wrapper;
 });
 const content=el("span",getText()||"MOTION","studio-target");
 parent.append(content);
 return stage.querySelectorAll(".studio-layer");
}
function play(){
 if(!valid()){message(WORDS.invalid);return;}
 const layers=Array.from(createStage());
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){message(WORDS.reduced);return;}
 tracks.forEach((track,i)=>{
  const animation=layers[i].animate(EFFECTS[track.effect],{delay:track.delay,duration:track.duration,easing:track.easing,fill:"both",iterations:1});
  animations.push(animation);
 });
 message(WORDS.running);
}
function stop(){createStage();message(WORDS.stopped);}
function safePresets(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE)||"{}");
  return raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 }catch{return {};}
}
function loadPresets(){
 const select=$("preset-picker"),existing=select.value;
 select.replaceChildren();
 const names=Object.keys(safePresets()).sort((a,b)=>a.localeCompare(b));
 names.forEach(name=>{const option=el("option",name);option.value=name;select.append(option);});
 if(names.includes(existing))select.value=existing;
}
function save(){
 const name=String($("preset-name").value||"").trim().slice(0,48);
 if(!name){message(WORDS.noName);return;}
 if(!valid()){message(WORDS.invalid);return;}
 const values=safePresets();
 values[name]={text:getText(),tracks:tracks.map(t=>({...t}))};
 try{localStorage.setItem(STORAGE,JSON.stringify(values));loadPresets();$("preset-picker").value=name;message(WORDS.saved);}catch{message(WORDS.saveFail);}
}
function load(){
 const name=$("preset-picker").value;
 const saved=safePresets()[name];
 if(!saved){message(WORDS.noPreset);return;}
 if(!saved||!Array.isArray(saved.tracks)||saved.tracks.length<1||saved.tracks.length>8||
  typeof saved.text!=="string"||saved.text.length>80||saved.tracks.some(t=>!t||!Object.hasOwn(EFFECTS,t.effect)||
  !Number.isInteger(t.delay)||t.delay<0||t.delay>12000||!Number.isInteger(t.duration)||t.duration<100||
  t.duration>5000||!EASINGS.includes(t.easing))){message(WORDS.invalid);return;}
 $("target-text").value=saved.text;tracks=saved.tracks.map(t=>({...t}));
 if(!valid()){message(WORDS.invalid);return;}
 renderTracks();createStage();message(WORDS.loaded);
}
function del(){
 const name=$("preset-picker").value;
 if(!name){message(WORDS.noPreset);return;}
 const values=safePresets();delete values[name];
 try{localStorage.setItem(STORAGE,JSON.stringify(values));loadPresets();message(WORDS.deleted);}catch{message(WORDS.saveFail);}
}
async function exportBundle(){
 if(!valid()){message(WORDS.invalid);return;}
 const sessionId=String(localStorage.getItem(SESSION_KEY)||"");
 if(!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)){message(WORDS.notForSale);return;}
 $("export").disabled=true;message(WORDS.exporting);
 try{
  const response=await fetch("/api/motion-atlas/studio-export",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({sessionId,composition:{text:getText(),tracks}})});
  const data=await response.json();
  if(!response.ok||!data.ok||!Array.isArray(data.files)){message(response.status===401||response.status===403?WORDS.denied:WORDS.error);return;}
  bundle=data.files.find(file=>file.name==="MotionStudioBundle.md");
  if(!bundle||typeof bundle.content!=="string"){message(WORDS.error);return;}
  $("export-output").textContent=bundle.content;
  $("export-output").hidden=false;$("export-download").hidden=false;
  message(WORDS.ready);
 }catch{message(WORDS.error);}finally{$("export").disabled=false;}
}
function download(){
 if(!bundle)return;
 const blob=new Blob([bundle.content],{type:"text/markdown;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const anchor=el("a");anchor.href=url;anchor.download="MotionStudioBundle.md";document.body.append(anchor);
 anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);message(WORDS.download);
}
$("target-text").addEventListener("input",createStage);
$("add-track").addEventListener("click",()=>{
 if(tracks.length>=8){message(WORDS.max);return;}
 const last=tracks[tracks.length-1],delay=last?Math.min(12000,last.delay+Math.round(last.duration/2)):0;
 tracks.push(defaultTrack("fade-in",delay,650));renderTracks();createStage();
});
$("preview").addEventListener("click",play);
$("stop").addEventListener("click",stop);
$("save-preset").addEventListener("click",save);
$("load-preset").addEventListener("click",load);
$("delete-preset").addEventListener("click",del);
$("export").addEventListener("click",exportBundle);
$("export-download").addEventListener("click",download);
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change",()=>{if(animations.length)stop();});
loadPresets();renderTracks();createStage();
})();
