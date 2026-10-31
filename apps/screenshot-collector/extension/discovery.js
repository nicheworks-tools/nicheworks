// Pure URL policy shared by crawler and unit tests. No remote calls or dependencies.
const TRACKING=/^(utm_.+|fbclid|gclid|msclkid|mc_cid|mc_eid)$/i;
const DANGEROUS=/(^|\/)(logout|log-out|signout|sign-out|delete|remove|destroy|checkout|purchase|pay|admin|wp-admin)(\/|$)/i;
export function normalizeUrl(raw,base,origin) {
  let u;
  try {u=new URL(raw,base);}catch{return null;}
  if(!["http:","https:"].includes(u.protocol)||u.origin!==origin)return null;
  if(DANGEROUS.test(u.pathname))return null;
  u.hash="";
  u.searchParams.forEach((_,k)=>{if(TRACKING.test(k))u.searchParams.delete(k);});
  u.searchParams.sort();
  if(u.pathname!=="/")u.pathname=u.pathname.replace(/\/+$/,"");
  return u.href;
}
export function discoverLinks(html,base,origin) {
  // DOMParser runs in extension page context; extracted links are data, never executed.
  const doc=new DOMParser().parseFromString(html,"text/html");
  const out=new Set();
  for(const a of doc.querySelectorAll("a[href]")){
    const url=normalizeUrl(a.getAttribute("href"),base,origin);
    if(url)out.add(url);
  }
  return [...out];
}
export async function crawl(root,{maxPages=50,onProgress=()=>{},signal}={}){
  const u=new URL(root);
  if(!["http:","https:"].includes(u.protocol))throw Error("Only HTTP(S) URLs are supported");
  if(!Number.isInteger(maxPages)||maxPages<1||maxPages>500)throw Error("maxPages must be 1–500");
  const first=normalizeUrl(root,root,u.origin);
  if(!first)throw Error("Root URL excluded by safety policy");
  const queue=[first],seen=new Set([first]),pages=[];
  while(queue.length && pages.length<maxPages){
    if(signal?.aborted)throw Error("Discovery stopped");
    const url=queue.shift();
    try{
      const response=await fetch(url,{credentials:"include",redirect:"follow",signal});
      const actual=normalizeUrl(response.url,url,u.origin);
      if(!actual)throw Error("Redirected outside selected origin or to excluded path");
      const type=response.headers.get("content-type")||"";
      if(!response.ok)throw Error("HTTP "+response.status);
      if(!/text\/html/i.test(type))throw Error("Not HTML: "+type);
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,"text/html");
      const title=(doc.querySelector("title")?.textContent||"").trim().slice(0,180);
      pages.push({url:actual,title,status:"ok"});
      for(const next of discoverLinks(html,actual,u.origin)){
        if(!seen.has(next)&&seen.size<maxPages*8){seen.add(next);queue.push(next);}
      }
    }catch(e){if(signal?.aborted)throw e;pages.push({url,title:"",status:"failed",error:String(e.message||e)});}
    onProgress({scanned:pages.length,queued:queue.length,limit:maxPages});
  }
  return pages;
}
