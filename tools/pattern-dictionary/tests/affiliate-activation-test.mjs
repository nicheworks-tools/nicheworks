import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const sourceConfig=path.join(root,'data','affiliate-config.json');
const before=fs.readFileSync(sourceConfig,'utf8');
const tmpDir=fs.mkdtempSync(path.join(os.tmpdir(),'pattern-dictionary-affiliate-'));
const fixture=path.join(tmpDir,'affiliate-config.json');
fs.writeFileSync(fixture,before);

function run(args){
  const result=spawnSync(process.execPath,args,{cwd:path.resolve(root,'../..'),env:{...process.env,PATTERN_DICTIONARY_AFFILIATE_CONFIG:fixture},encoding:'utf8'});
  if(result.status!==0){
    process.stderr.write(result.stdout||'');
    process.stderr.write(result.stderr||'');
    process.exit(result.status||1);
  }
  process.stdout.write(result.stdout||'');
}

try{
  run(['tools/pattern-dictionary/scripts/activate-amazon-affiliate.mjs','nicheworks-test-22']);
  run(['tools/pattern-dictionary/tests/affiliate-test.mjs','--require-active']);
  const active=JSON.parse(fs.readFileSync(fixture,'utf8'));
  if(active.enabled!==true||active.tracking_id!=='nicheworks-test-22')throw new Error('activation fixture did not become active');
  if(fs.readFileSync(sourceConfig,'utf8')!==before)throw new Error('production affiliate config changed during isolated activation test');
  console.log('OK: activation script reaches the ACTIVE 20/20 contract without modifying production affiliate config.');
}finally{
  fs.rmSync(tmpDir,{recursive:true,force:true});
}
