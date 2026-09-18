import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { harness } from './checkpoint-harness.mjs';

const results=[]; let pass=0, fail=0;
function csvField(v){const s=String(v??'');return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function cell(r,c){
  switch(c%10){
    case 0:return ' '+String(r).padStart(6,'0')+' ';
    case 1:return ' 東京 '+r+' ';
    case 2:return 'memo,'+r;
    case 3:return '日本語 '+r;
    case 4:return ' ＡＢ１２ ';
    case 5:return r%997===0?'line '+r+'\nnext':'He said "Q'+r+'"';
    case 6:return '';
    case 7:return 'x  \t y';
    case 8:return '  z  z  ';
    default:return 'tail-'+r;
  }
}
function makeCSV(rows,cols,longField=''){
  const lines=new Array(rows+1); lines[0]=Array.from({length:cols},(_,i)=>'c'+i).join(',');
  for(let r=1;r<=rows;r++){
    const values=new Array(cols);
    for(let c=0;c<cols;c++) values[c]=(longField&&c===cols-1)?longField+r:cell(r,c);
    lines[r]=values.map(csvField).join(',');
  }
  return lines.join('\n')+'\n';
}
function makeApproxBytes(target,rows=1000,cols=10){
  let low=0,high=Math.max(1,Math.ceil(target/rows)),best=''; const unit='長文Field ';
  while(low<=high){
    const mid=Math.floor((low+high)/2);
    const text=makeCSV(rows,cols,unit.repeat(Math.max(0,Math.floor(mid/unit.length))));
    best=text; const size=Buffer.byteLength(text);
    if(size<target)low=mid+1;else high=mid-1;
  }
  return best;
}
function configure(h){
  Object.assign(h.state.options,{trim:true,normSpaces:true,cleanScope:'selected'});
  Object.assign(h.state.options.zenHan,{enabled:true,dir:'zen2han',targetHeader:true,targetData:true});
  const cols=h.state.data.cols;
  cols.forEach((c,i)=>{c.cleanApply=i%2===0;c.order=i;});
  if(cols.length>=3){const t=cols[0].order;cols[0].order=cols[2].order;cols[2].order=t;}
  cols[0].name='id'; if(cols.length>1)cols[1].excluded=true;
}
function memoryMB(){const m=process.memoryUsage();return{heapMB:+(m.heapUsed/1e6).toFixed(2),rssMB:+(m.rss/1e6).toFixed(2)};}
async function measure(text,rows,cols){
  const h=harness(),bytes=Buffer.from(text),t0=performance.now();
  await h.load(bytes,'utf-8',','); const t1=performance.now();
  assert.equal(h.state.load.status,'valid'); assert.equal(h.state.data.rows.length,rows+1); assert.equal(h.state.data.cols.length,cols);
  configure(h);
  const p0=performance.now(),preview=h.buildOutputPreview(true),p1=performance.now();
  const f0=performance.now(),full=h.buildOutputPreview(false),f1=performance.now();
  assert.ok(preview.rows.length<=h.state.ui.previewN); assert.equal(full.rows.length,rows); assert.equal(full.colsUsed,cols-1);
  const matrix=[full.headers,...full.rows],s0=performance.now(),serialized=h.stringifyCSV(matrix,',','lf','auto'),s1=performance.now();
  assert.equal(full.rows[0][1],'000001');
  assert.equal(full.rows[Math.floor(rows/2)][1],String(Math.floor(rows/2)+1).padStart(6,'0'));
  assert.equal(full.rows.at(-1)[1],String(rows).padStart(6,'0'));
  assert.ok(full.rows[0].some(v=>String(v).includes('日本語'))); assert.ok(serialized.length>0);
  return{bytes:bytes.length,rows,inputCols:cols,outputCols:full.colsUsed,loadMs:+(t1-t0).toFixed(2),previewMs:+(p1-p0).toFixed(2),fullMs:+(f1-f0).toFixed(2),serializeMs:+(s1-s0).toFixed(2),totalMs:+(s1-t0).toFixed(2),memory:memoryMB(),h,full};
}
function median(v){const a=[...v].sort((x,y)=>x-y);return a[Math.floor(a.length/2)];}
function pythonCheck(buffer,rows,cols,mid){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'csv-tidy-scale-')),file=path.join(dir,'out.csv');fs.writeFileSync(file,buffer);
  const py=[
    "import csv,json,sys",
    "p=sys.argv[1]; er=int(sys.argv[2]); ec=int(sys.argv[3]); mid=int(sys.argv[4])",
    "count=0; first=None; middle=None; last=None; header=None",
    "with open(p,'r',encoding='utf-8-sig',newline='') as f:",
    "    for row in csv.reader(f,strict=True):",
    "        if len(row)!=ec: raise SystemExit('width mismatch')",
    "        if count==0: header=row",
    "        elif count==1: first=row",
    "        if count==mid+1: middle=row",
    "        if count>0: last=row",
    "        count += 1",
    "if count != er+1: raise SystemExit('row mismatch')",
    "print(json.dumps({'rows':count-1,'cols':ec,'header':header,'first':first,'middle':middle,'last':last},ensure_ascii=False))"
  ].join('\n');
  const r=spawnSync('python3',['-c',py,file,String(rows),String(cols),String(mid)],{encoding:'utf8'});
  fs.rmSync(dir,{recursive:true,force:true}); assert.equal(r.status,0,r.stderr||r.stdout); return JSON.parse(r.stdout);
}
async function run(name,fn){
  try{const v=await fn();pass++;results.push({name,status:'PASS',...(v||{})});console.log('PASS',name,v?JSON.stringify(v):'');}
  catch(e){fail++;results.push({name,status:'FAIL',error:String(e&&e.stack||e)});console.error('FAIL',name,e);}
}
for(const rows of [1000,10000,50000,100000,250000])await run('rows-'+rows,async()=>{const r=await measure(makeCSV(rows,10),rows,10);return{bytes:r.bytes,loadMs:r.loadMs,previewMs:r.previewMs,fullMs:r.fullMs,serializeMs:r.serializeMs,totalMs:r.totalMs,memory:r.memory};});
for(const cols of [10,50,100,200])await run('cols-'+cols,async()=>{const r=await measure(makeCSV(1000,cols),1000,cols);return{bytes:r.bytes,totalMs:r.totalMs,memory:r.memory};});
for(const target of [1e6,5e6,10e6,25e6])await run('bytes-'+Math.round(target/1e6)+'MB',async()=>{const text=makeApproxBytes(target),r=await measure(text,1000,10);return{bytes:r.bytes,totalMs:r.totalMs,memory:r.memory};});
for(const cfg of [['repeat-10k',10000,10],['repeat-100k',100000,10],['repeat-100cols',1000,100]])await run(cfg[0],async()=>{const text=makeCSV(cfg[1],cfg[2]),t=[];for(let i=0;i<3;i++)t.push((await measure(text,cfg[1],cfg[2])).totalMs);return{medianMs:+median(t).toFixed(2),minMs:+Math.min(...t).toFixed(2),maxMs:+Math.max(...t).toFixed(2)};});
await run('full-transform-large',async()=>{const r=await measure(makeCSV(100000,10),100000,10);assert.equal(r.full.headers[1],'id');return{bytes:r.bytes,totalMs:r.totalMs,memory:r.memory};});
await run('late-ragged-rejected',async()=>{const h=harness(),good=makeCSV(100000,10);await h.load(Buffer.from(good+'BROKEN\n'),'utf-8',',');assert.equal(h.state.load.status,'invalid');assert.equal(h.state.ui.inputError.code,'inconsistent_fields');assert.equal(h.buildOutputPreview(false).rows.length,0);h.downloadCSV();assert.equal(h.blobs.length,0);return{code:h.state.ui.inputError.code,record:h.state.ui.inputError.record};});
await run('late-unclosed-quote-rejected',async()=>{const h=harness(),good=makeCSV(100000,10);await h.load(Buffer.from(good+'"unclosed'),'utf-8',',');assert.equal(h.state.load.status,'invalid');assert.equal(h.state.ui.inputError.code,'unclosed_quote');assert.equal(h.buildOutputPreview(false).rows.length,0);h.downloadCSV();assert.equal(h.blobs.length,0);return{code:h.state.ui.inputError.code,record:h.state.ui.inputError.record};});
await run('python-reparse-100k',async()=>{const r=await measure(makeCSV(100000,10),100000,10);r.h.downloadCSV();const b=Buffer.from(await r.h.blobs.at(-1).arrayBuffer()),p=pythonCheck(b,100000,9,50000);assert.equal(p.first[1],'000001');assert.equal(p.last[1],'100000');return{bytes:b.length,rows:p.rows,cols:p.cols};});
await run('python-reparse-wide',async()=>{const r=await measure(makeCSV(1000,200),1000,200);r.h.downloadCSV();const b=Buffer.from(await r.h.blobs.at(-1).arrayBuffer()),p=pythonCheck(b,1000,199,500);assert.equal(p.rows,1000);return{bytes:b.length,rows:p.rows,cols:p.cols};});
console.log(JSON.stringify({summary:{pass,fail,total:pass+fail},environment:{node:process.version,python:spawnSync('python3',['--version'],{encoding:'utf8'}).stdout.trim(),platform:process.platform,arch:process.arch,hostMemoryBytes:os.totalmem(),freeMemoryBytes:os.freemem()},results},null,2));
if(fail)process.exitCode=1;
