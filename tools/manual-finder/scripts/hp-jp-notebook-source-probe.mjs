#!/usr/bin/env node
/**
 * Discovery ONLY: manufacturer-official HP Japan Notebook option compatibility matrix.
 * A matrix header denotes a bounded *family* population, not an exact PDF manual.
 */
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const SOURCE='https://jp.ext.hp.com/content/dam/jp-ext-hp-com/jp/ja/ec/lib/products/portables/personal/spec_pdf/notebook_option.pdf';
const response=await fetch(SOURCE,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'user-agent':'Mozilla/5.0','accept':'application/pdf'}});
if(!response.ok||new URL(response.url).hostname!=='jp.ext.hp.com')throw Error('HP origin/HTTP invalid: '+response.status+' '+response.url);
const pdf=Buffer.from(await response.arrayBuffer());
if(pdf.subarray(0,5).toString()!=='%PDF-'||pdf.length<10000)throw Error('not actual HP official PDF');
await fs.mkdir('manualfinder-hp-probe',{recursive:true});
await fs.writeFile('manualfinder-hp-probe/official-notebook-option.pdf',pdf);
let raw,layout;
try{
 raw=execFileSync('pdftotext',['-raw','manualfinder-hp-probe/official-notebook-option.pdf','-'],{encoding:'utf8'});
 layout=execFileSync('pdftotext',['-layout','manualfinder-hp-probe/official-notebook-option.pdf','-'],{encoding:'utf8'});
}catch(e){throw Error('pdftotext not installed/failed: '+String(e))}
await fs.writeFile('manualfinder-hp-probe/notebook-text-raw.txt',raw);
await fs.writeFile('manualfinder-hp-probe/notebook-text-layout.txt',layout);
const lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const candidate=lines.filter(x=>/^(?:HP |OMEN |Victus )/.test(x)&&/\d{2}[-a-zA-Z0-9]+/.test(x)).slice(0,150);
const out={url:SOURCE,finalUrl:response.url,bytes:pdf.length,rawLines:lines.length,layoutLines:layout.split(/\n/).length,candidate,rawHead:lines.slice(0,140),observedAt:new Date().toISOString()};
await fs.writeFile('manualfinder-hp-probe/population-probe.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({status:response.status,pdfBytes:pdf.length,rawLines:out.rawLines,candidateCount:candidate.length,candidates:candidate,head:out.rawHead.slice(0,85)}));
