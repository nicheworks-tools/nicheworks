import {crawl} from "./discovery.js";
const $=id=>document.getElementById(id);
let aborter=null;
$("discover").addEventListener("click",async()=>{
  const button=$("discover"),list=$("pages"),progress=$("discovery-status");
  list.replaceChildren();button.disabled=true;$("stop-discovery").disabled=false;
  aborter=new AbortController();
  try{
    const root=new URL($("url").value);
    if(!["http:","https:"].includes(root.protocol))throw Error("Only HTTP(S) URLs are supported");
    const permitted=await chrome.permissions.request({origins:[root.origin+"/*"]});
    if(!permitted)throw Error("Site permission denied");
    const maxPages=Number($("max-pages").value);
    const pages=await crawl(root.href,{maxPages,signal:aborter.signal,onProgress:p=>{progress.textContent=`Scanned ${p.scanned} / ${p.limit}; queued ${p.queued}`;}});
    for(const p of pages){
      const li=document.createElement("li"),checkbox=document.createElement("input");
      checkbox.type="checkbox";checkbox.checked=p.status==="ok";checkbox.disabled=p.status!=="ok";checkbox.value=p.url;
      const span=document.createElement("span");span.textContent=" "+(p.title||p.url)+" — "+p.url+(p.error?" ("+p.error+")":"");
      li.append(checkbox,span);list.append(li);
    }
    progress.textContent=`Discovered ${pages.filter(p=>p.status==="ok").length} HTML pages. Select targets; batch capture is not implemented yet.`;
  }catch(e){progress.textContent="Discovery failed: "+String(e.message||e);}
  finally{button.disabled=false;$("stop-discovery").disabled=true;aborter=null;}
});
$("stop-discovery").addEventListener("click",()=>aborter?.abort());
