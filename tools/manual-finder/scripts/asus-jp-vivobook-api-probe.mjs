#!/usr/bin/env node
import fs from 'node:fs/promises';
const page='https://www.asus.com/jp/laptops/for-home/vivobook/filter?Series=Vivobook';
const html=await (await fetch(page,{headers:{'user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)})).text();
const link=html.match(/https:\/\/odinapi\.asus\.com\/recent-data\/apiv2\/SeriesFilterResult\?[^"<]+/i)?.[0];
if(!link)throw Error('manufacturer live page does not provide SeriesFilterResult official API');
const base=new URL(link.replace(/&amp;/g,'&'));if(base.hostname!=='odinapi.asus.com')throw Error('unexpected manufacturer API host');
const out={observedAt:new Date().toISOString(),manufacturerPage:page,api:base.href,results:[]};
for(const [index,size]of [[1,20],[2,20],[1,100]]){
 const u=new URL(base.href);u.searchParams.set('PageIndex',String(index));u.searchParams.set('PageSize',String(size));
 try{
  const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0','accept':'application/json','referer':page},signal:AbortSignal.timeout(30000)});
  const text=await r.text();
  let json;try{json=JSON.parse(text)}catch{json=null}
  const result=json?.Result||json?.result||json;
  const products=result?.ProductList||result?.productList||result?.products||[];
  const item={index,size,url:u.href,status:r.status,bytes:text.length,jsonKeys:Object.keys(json||{}),totalCount:result?.TotalCount??null,productCount:products.length,items:products.map(x=>({name:String(x.Name||x.ProductName||'').replace(/<[^>]+>/g,' ').trim(),url:x.ProductURL||x.ProductCardURL,path:x.PDWebPath,productId:x.ProductID,subSeries:x.SubSeriesName,partNo:x.PartNo})),rawSample:text.slice(0,500)};
  out.results.push(item);
  console.log(JSON.stringify({index,size,status:r.status,total:item.totalCount,items:products.length,sample:item.items.slice(0,4),keys:item.jsonKeys}));
 }catch(e){out.results.push({index,size,url:u.href,error:String(e)});console.error(index,size,String(e))}
}
await fs.mkdir('manualfinder-asus-probe',{recursive:true});
await fs.writeFile('manualfinder-asus-probe/asus-official-api-pages.json',JSON.stringify(out,null,2)+'\n');
if(out.results.some(x=>x.error||x.status!==200))process.exitCode=1;
