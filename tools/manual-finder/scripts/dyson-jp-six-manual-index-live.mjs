#!/usr/bin/env node
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const manifest=JSON.parse(await fs.readFile(new URL('../coverage-passes/dyson/jp-first-six-guide-indexes-20261106.json',import.meta.url),'utf8'));
export function verifyPage(row,html,finalUrl){
 const from=new URL(row.url),final=new URL(finalUrl);
 if(from.hostname!=='www.dyson.co.jp'||final.hostname!=='www.dyson.co.jp'||final.pathname!==from.pathname||final.protocol!=='https:')throw Error(row.model+': official manufacturer page redirects to another origin/path: '+finalUrl);
 const clean=String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ');
 const plain=clean.normalize('NFKC').toLowerCase();
 const model=row.needle.normalize('NFKC').toLowerCase();
 if(!plain.includes(model))throw Error(row.model+': official product/variant name absent');
 const pos=plain.indexOf(model);
 if(!/取扱説明書/.test(clean)||!/PDF|ＰＤＦ/i.test(clean))throw Error(row.model+': official instruction manual PDF section missing');
 if(row.model.includes('SV46')&&!plain.includes('v12 detect slim (sv20)'))throw Error('V12 SV46: separate SV20 manual link missing');
 if(row.model.includes('SV20')&&!plain.includes('v12 detect slim (sv46)'))throw Error('V12 SV20: separate SV46 manual link missing');
 if(row.model.includes('V8 Slim')&&!plain.includes('sv10k ext bk'))throw Error('V8 Slim: exact product edition identity missing');
 if(row.group==='hair'&&!plain.includes('airwrap i.d.'))throw Error('Airwrap i.d.: exact i.d. series missing');
 return{model:row.model,manualIndex:row.url,exactModelFound:true,manualSection:true,modelIndex:pos};
}
async function run(){
 const seen=new Map(),verified=[],blocked=[];
 for(const row of manifest.products){
  let result=seen.get(row.url);
  if(!result){
   const response=await fetch(row.url,{redirect:'follow',signal:AbortSignal.timeout(35000),headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
   if(response.status===403)result={status:'manufacturer_http403_blocked',verified:false};
   else{
    if(!response.ok)throw Error(row.model+': unexpected HTTP '+response.status);
    const buf=Buffer.from(await response.arrayBuffer());
    if(buf.length<2500||buf.length>12000000)throw Error(row.model+': invalid HTML byte count '+buf.length);
    result={status:'live',verified:true,text:buf.toString('utf8'),finalUrl:response.url};
   }
   seen.set(row.url,result);
  }
  if(!result.verified){blocked.push(row.model);console.log(JSON.stringify({model:row.model,status:'manufacturer_http403_blocked',verified:false}));}
  else{
   verifyPage(row,result.text,result.finalUrl);
   verified.push(row.model);console.log(JSON.stringify({model:row.model,status:'verified_live',verified:true}));
  }
 }
 if(blocked.length+verified.length!==6)throw Error('six-source check incomplete');
 console.log(JSON.stringify({status:'DYSON_SOURCE_PROBE_TRANSPARENT',checked:6,verifiedLive:verified.length,manufacturerBlocked403:blocked.length,blocked,uniquePages:seen.size}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run().catch(e=>{console.error(e);process.exitCode=1;});
