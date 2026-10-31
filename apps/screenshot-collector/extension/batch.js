import {createZip} from "./zip.js";
const $=id=>document.getElementById(id);
let stop=false,running=false;
const encoder=new TextEncoder();
function slug(index){return "page-"+String(index+1).padStart(3,"0")+".png";}
function dataBytes(url){const raw=atob(url.slice(url.indexOf(",")+1));const result=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)result[i]=raw.charCodeAt(i);return result;}
async function capture(url){
 const response=await chrome.runtime.sendMessage({type:"CAPTURE_POC",url,engine:"cdp"});
 if(!response?.ok)throw Error(response?.error||"Capture failed");
 const r=response.result;
 if(!r?.dataUrl?.startsWith("data:image/png;base64,"))throw Error("Invalid screenshot payload");
 return {bytes:dataBytes(r.dataUrl),width:r.width,height:r.height};
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
$("batch-start").addEventListener("click",async()=>{
 if(running)return;
 const urls=[...document.querySelectorAll("#pages input[type=checkbox]:checked:not(:disabled)")].map(x=>x.value);
 if(!urls.length){$("batch-status").textContent="Select at least one discovered page.";return;}
 running=true;stop=false;$("batch-start").disabled=true;$("batch-stop").disabled=false;
 const entries=[],records=[],start=new Date().toISOString();
 for(let i=0;i<urls.length;i++){
  if(stop)break;
  const url=urls[i],filename=slug(i);
  $("batch-status").textContent=`Capturing ${i+1}/${urls.length}: ${url}`;
  let success=false;
  for(let attempt=1;attempt<=2&&!success;attempt++){
   try{
    const r=await capture(url);
    entries.push({name:filename,data:r.bytes});
    records.push({url,filename,status:"saved",width:r.width,height:r.height,attempts:attempt});
    success=true;
   }catch(e){
    if(attempt===2)records.push({url,filename:null,status:"failed",error:String(e.message||e),attempts:attempt});
    else await pause(1000);
   }
  }
 }
 const manifest={schemaVersion:1,app:"NicheWorks Screenshot Collector",createdAt:start,completedAt:new Date().toISOString(),engine:"cdp",requested:urls.length,processed:records.length,stopped:stop,results:records};
 entries.push({name:"manifest.json",data:encoder.encode(JSON.stringify(manifest,null,2))});
 try{
  const zip=createZip(entries),url=URL.createObjectURL(zip),a=$("batch-download");
  if(a.href.startsWith("blob:"))URL.revokeObjectURL(a.href);
  a.href=url;a.download="screenshot-collector-"+new Date().toISOString().replace(/[:.]/g,"-")+".zip";a.hidden=false;
  $("batch-status").textContent=`Finished: ${records.filter(x=>x.status==="saved").length} saved, ${records.filter(x=>x.status==="failed").length} failed${stop?", stopped":""}. ZIP ready.`;
 }catch(e){$("batch-status").textContent="ZIP error: "+String(e.message||e);}
 finally{running=false;$("batch-start").disabled=false;$("batch-stop").disabled=true;}
});
$("batch-stop").addEventListener("click",()=>{stop=true;$("batch-status").textContent="Stop requested; current page will finish before export.";});
