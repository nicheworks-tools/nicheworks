#!/usr/bin/env node
/**
 * Acer manufacturer-owned Windows 11 compatibility index: population DISCOVERY ONLY.
 * Compatibility with Windows 11 does not prove a manual exists. This tool never
 * creates public ManualFinder rows, nor calls any support page a user manual.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const SOURCE = 'https://www.acer.com/ph-en/support/windows/windows-11-compatibility';
const SHA = s => crypto.createHash('sha256').update(s).digest('hex');
export function extractAcerAspireCandidates(html) {
  const raw=String(html);
  // Remove executable scripts, styles and embedded JSON before reading visible text.
  const text=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&amp;/gi,'&').replace(/\s+/g,' ');
  const section=text.match(/(?:##\s*)?Laptops\b([\s\S]*?)(?:Desktops\b|Tablets\b|Monitors\b)/i);
  if (!section) throw Error('Acer laptop category boundary not identifiable; fail closed');
  const aspire=section[1].match(/\bAspire\b([\s\S]*?)(?:\bSwift\b|\bTravelMate\b|\bSpin\b|\bPredator\b|\bNitro\b|\bConceptD\b|\bDesktops\b)/i);
  if(!aspire) throw Error('Acer Aspire family boundary not identifiable; fail closed');
  const names=[...aspire[1].matchAll(/\b(?:Aspire\s+)?(A(?:1[0-9]{2}|3[0-9]{2}|5[0-9]{2}|7[0-9]{2})-[0-9A-Z]+(?:-[0-9A-Z]+)?)\b/g)].map(x=>'Aspire '+x[1]);
  const models=[...new Set(names)].sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
  if(models.length<50) throw Error(`Acer candidate population below 50: extracted=${models.length}, rawRows=${names.length}, laptopSectionChars=${section[1].length}, aspireSectionChars=${aspire[1].length}; publication forbidden`);
  return {models,sourceRows:names.length,duplicates:names.length-models.length,sha256:SHA(models.join('\n'))};
}
export async function discover({html,sourceUrl=SOURCE}={}){
  let observedAt=new Date().toISOString(),status=null,finalUrl=sourceUrl;
  if(html===undefined){
    const r=await fetch(sourceUrl,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0 (compatible; NicheWorks-ManualFinder/1.0)'}});
    status=r.status;finalUrl=r.url;
    const u=new URL(r.url);
    if(!r.ok||u.protocol!=='https:'||u.hostname!=='www.acer.com'||u.pathname!=='/ph-en/support/windows/windows-11-compatibility')throw Error('official Acer source origin/path/status mismatch '+r.status+' '+r.url);
    html=await r.text();
  }
  const candidates=extractAcerAspireCandidates(html);
  return {schemaVersion:1,manufacturer:'Acer',scope:'PH Windows 11 tested Aspire laptops (not JP manual population)',sourceUrl,finalUrl,httpStatus:status,observedAt,...candidates,
    publicationReady:false,manualVerified:0,reviewState:'candidate_only',
    note:'This official list proves only Acer Windows 11 compatibility. It does NOT establish model manual URLs, region JP availability or a complete Acer product universe. Never publish these candidates without independent exact manufacturer manual evidence and a bounded official catalog scope.'};
}
async function main(){
 const argv=process.argv.slice(2),file=argv.indexOf('--html'),out=argv.indexOf('--out');
 const started=Date.now();
 try {
  const result=await discover({html:file<0?undefined:await fs.readFile(argv[file+1],'utf8')});
  const data=JSON.stringify({...result,elapsedMs:Date.now()-started},null,2)+'\n';
  if(out>=0)await fs.writeFile(argv[out+1],data);else process.stdout.write(data);
 } catch(error) {
  const diagnostic={schemaVersion:1,manufacturer:'Acer',sourceUrl:SOURCE,observedAt:new Date().toISOString(),elapsedMs:Date.now()-started,publicationReady:false,manualVerified:0,published:0,diagnosticOnly:true,error:String(error)};
  if(out>=0)await fs.writeFile(argv[out+1],JSON.stringify(diagnostic,null,2)+'\n');
  console.error(JSON.stringify(diagnostic));process.exitCode=1;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e);process.exitCode=1});
