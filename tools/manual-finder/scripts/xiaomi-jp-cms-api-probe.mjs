#!/usr/bin/env node
import fs from 'node:fs/promises';
await fs.mkdir('manualfinder-xiaomi-probe',{recursive:true});
const paths=[
 'https://go.buy.mi.com/jp/v2/cms/page/get?from=web&cacheable=1&path=jp%2Fsupport%2Fuser-guide',
 'https://go.buy.mi.com/jp/v2/cms/page/get?from=web&cacheable=1&path=support%2Fuser-guide',
 'https://go.buy.mi.com/v2/cms/page/get?from=web&cacheable=1&path=jp%2Fsupport%2Fuser-guide',
 'https://go.buy.mi.com/jp/v2/cms/page/get?from=web&cacheable=1&path=jp%2Fsupport%2Fuser-guide-pdf',
 'https://go.buy.mi.com/jp/v2/cms/page/get?from=web&cacheable=1&path=jp%2Fsupport%2Fuser-guide%2Fxiaomi-17t-pro'
];
const outputs=await Promise.all(paths.map(async(url,i)=>{
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(28000),headers:{'user-agent':'Mozilla/5.0','accept':'application/json','referer':'https://www.mi.com/jp/support/user-guide/'}});
  const text=await r.text();
  await fs.writeFile('manualfinder-xiaomi-probe/xiaomi-cms-'+i+'.json',text);
  let json;try{json=JSON.parse(text)}catch{}
  const result={index:i,url:r.url,status:r.status,type:r.headers.get('content-type'),bytes:text.length,topKeys:Object.keys(json||{}),errno:json?.errno,layoutCount:json?.data?.layouts?.length,error:json?.errmsg,head:text.slice(0,400)};
  console.log(JSON.stringify(result));return result;
 }catch(e){console.error(i,String(e));return{index:i,error:String(e)}}
}));
await fs.writeFile('manualfinder-xiaomi-probe/cms-api-probe-results.json',JSON.stringify(outputs,null,2)+'\n');
