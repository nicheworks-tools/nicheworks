const $=id=>document.getElementById(id);
const status=$("status"),button=$("capture"),output=$("output");
function statusText(s){status.textContent=s;}
async function toBlob(url){return await(await fetch(url)).blob();}
async function stitch(result){
 const {chunks,info}=result;
 const images=[];
 for(const item of chunks){const bitmap=await createImageBitmap(await toBlob(item.dataUrl));images.push({...item,bitmap});}
 const ratio=images[0].bitmap.width/info.viewportWidth;
 const canvas=document.createElement("canvas");canvas.width=images[0].bitmap.width;canvas.height=Math.round(info.height*ratio);
 if(canvas.height>32767||canvas.width>32767)throw Error("Canvas dimensions exceed PoC limit");
 const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
 let paintedBottom=0;
 for(const {bitmap,y} of images){
   const targetY=Math.round(y*ratio);
   const sourceOffset=Math.max(0,paintedBottom-targetY);
   const height=Math.min(bitmap.height-sourceOffset,canvas.height-(targetY+sourceOffset));
   if(height>0){ctx.drawImage(bitmap,0,sourceOffset,bitmap.width,height,0,targetY+sourceOffset,bitmap.width,height);paintedBottom=targetY+sourceOffset+height;}
   bitmap.close();
 }
 return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("PNG encoding failed")),"image/png"));
}
button.addEventListener("click",async()=>{
 button.disabled=true;output.hidden=true;
 try{
  const url=new URL($("url").value);if(!["http:","https:"].includes(url.protocol))throw Error("Only HTTP(S) URLs are supported");
  const granted=await chrome.permissions.request({origins:[url.origin+"/*"]});
  if(!granted)throw Error("Site permission denied");
  statusText("Capturing… keep the temporary tab active.");
  const engine=$("engine").value;
  const response=await chrome.runtime.sendMessage({type:"CAPTURE_POC",url:url.href,engine});
  if(!response?.ok)throw Error(response?.error||"Capture failed");
  const result=response.result;
  const blob=engine==="cdp"?await toBlob(result.dataUrl):await stitch(result);
  const objectUrl=URL.createObjectURL(blob);
  if($("preview").src.startsWith("blob:"))URL.revokeObjectURL($("preview").src);
  $("preview").src=objectUrl;$("save").href=objectUrl;
  $("meta").textContent=engine+" · "+(result.width||result.info.width)+" × "+(result.height||result.info.height)+" CSS px · "+blob.size+" bytes"+(result.warning?" · "+result.warning:"");
  output.hidden=false;statusText("Capture completed. Check visual seams and missing content before marking PASS.");
 }catch(e){statusText("FAILED: "+String(e.message||e));}finally{button.disabled=false;}
});
