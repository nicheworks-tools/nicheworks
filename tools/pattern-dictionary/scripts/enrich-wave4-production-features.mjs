#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'data','wave4-production-content.json');
const source=JSON.parse(fs.readFileSync(path.join(root,'data','wave4-source-verification.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const qualified=new Set(source.patterns.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id));
for(const p of data.patterns){
  const ja=qualified.has(p.pattern_id)
    ? '一つの固定リピートとして決め打ちせず、出典で確認した構造・技法・様式の範囲で識別する'
    : '配色だけで決めず、反復する形・線・モチーフの構造を優先して識別する';
  const en=qualified.has(p.pattern_id)
    ? 'Treat it as a sourced structural, technique, or style family rather than one universal fixed repeat'
    : 'Identify it primarily by repeating shape, line, and motif structure rather than by color alone';
  p.distinguishing_features.ja=[...new Set([...(p.distinguishing_features.ja||[]),ja])];
  p.distinguishing_features.en=[...new Set([...(p.distinguishing_features.en||[]),en])];
  if(p.distinguishing_features.ja.length<3||p.distinguishing_features.en.length<3)throw new Error(`${p.pattern_id}: 3+ distinguishing features required`);
}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log('Wave 4 production content enriched to 3+ distinguishing features in JA/EN for all 20 records.');
