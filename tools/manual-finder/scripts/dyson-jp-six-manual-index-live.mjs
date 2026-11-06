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
 const out=[];
 for(const row of manifest.products){
  const res=await fetch(row.url,{redirect:'follow',signal:AbortSignal.timeout(35000),headers:{'user-agent':'Mozilla/5.0 (compatible; ManualFinder official documentation verification)','accept':'text/html,application/xhtml+xml'}});
  if(!res.ok)throw Error(row.model+': HTTP '+res.status);
  const bytes=Buffer.from(await res.arrayBuffer());
  if(bytes.length<2500||bytes.length>12000000)throw Error(row.model+': HTML length unexpected '+bytes.length);
  const value=verifyPage(row,bytes.toString('utf8'),res.url);
  console.log(JSON.stringify({pass:true,...value,bytes:bytes.length}));out.push(value);
 }
 if(out.length!==6)throw Error('Dyson exact six source pages incomplete');
 console.log(JSON.stringify({status:'DYSON_SIX_MODEL_MANUAL_PAGES_PASS',checked:6,passed:out.length,pages:new Set(out.map(x=>x.manualIndex)).size}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))run().catch(e=>{console.error(e);process.exitCode=1;});
