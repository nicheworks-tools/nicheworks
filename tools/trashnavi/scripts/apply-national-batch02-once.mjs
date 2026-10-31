#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const tool=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(tool,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const check=(b,m)=>{if(!b)throw Error(m)};
const oldWork='tools/trashnavi/data/national-batch02-research-worklist.json';
const newWork='tools/trashnavi/review-worklists/national-batch02-research-worklist.json';
const work=json(oldWork);
const ledgerPath='tools/trashnavi/data/municipality-review-ledger.json';
const manifestPath='tools/trashnavi/municipality-page-manifest.json';
const aiPath='tools/trashnavi/ai-reference.json';
const appPath='tools/trashnavi/app.js';
const indexPath='tools/trashnavi/index.html';
const sourcePath='tools/trashnavi/data/direct-waste-links-national-batch02.json';
const ledger=json(ledgerPath),manifest=json(manifestPath),ai=json(aiPath);
const slugs={
'082112':'joso','082155':'kitaibaraki','124222':'mutsuzawa','124231':'chosei','124249':'shirako','124265':'nagara',
'124273':'chonan','124419':'otaki','124435':'onjuku','124630':'kyonan',
'133035':'mizuho','133051':'hinode','133078':'hinohara','133086':'okutama','133612':'oshima','133621':'toshima',
'133639':'niijima','133647':'kozushima','133817':'miyake','133825':'mikurajima','134015':'hachijo','134023':'aogashima','134210':'ogasawara',
'142085':'zushi','142107':'miura','142115':'hadano','142174':'minamiashigara','142182':'ayase',
'143014':'hayama','143219':'samukawa','143413':'oiso','143421':'ninomiya','143618':'nakai','143626':'oi',
'143634':'matsuda','143642':'yamakita','143669':'kaisei','143821':'hakone','143839':'manazuru','143847':'yugawara',
'144011':'aikawa','144029':'kiyokawa','152048':'sanjo','152056':'kashiwazaki','152064':'shibata','152081':'ojiya',
'152099':'kamo','152102':'tokamachi'};
const prefSlug={'茨城県':'ibaraki','千葉県':'chiba','東京都':'tokyo','神奈川県':'kanagawa','新潟県':'niigata'};
const noDirect=new Set(['084476','132136']);
const joint=new Set(['082112','124222','124231','124249','124265','124273']);
const chosei=new Set(['124222','124231','124249','124265','124273']);
const calendar=new Set(['124222','124231','124435','133035','133051','133086','133612','142085','142107','142115','142182','143014','143219','143413','143421','143618','143626','143634','152048','152056','152064','152081','152099']);
const extra={
'082112':[{type:'持込施設',link_type:'dropoff_facility',name:'常総市 石下地区限定：クリーンポート・きぬへの直接搬入',url:'https://www.city.joso.lg.jp/kurashi_gyousei/kurashi/gomi_kankyou/recycle/homegomi/ishige/ishige_mochikomi.html'}],
'142174':[
{type:'粗大ごみ',link_type:'bulky_waste',name:'南足柄市 粗大ごみの出し方・申込案内',url:'https://www.city.minamiashigara.kanagawa.jp/kurashi/gomi/gomi/p06975.html'},
{type:'持込施設',link_type:'dropoff_facility',name:'南足柄市 2026年4月からの可燃ごみ持込先',url:'https://www.city.minamiashigara.kanagawa.jp/kurashi/gomi/gomi/p08896.html'}
]};
const groupUrl='https://choseikouiki.jp/file/gomi_to_shigen_wakekata_dashikata_hozonban.pdf';
const labels={waste_sorting:'ごみ分別ページ',collection_calendar:'収集カレンダー',waste_app:'ごみ分別アプリ',dropoff_facility:'持込施設',bulky_waste:'粗大ごみ'};
check(work.work_items.length===50,'Batch 02 must review exactly 50 municipalities');
check(new Set(work.work_items.map(x=>x.lgcode)).size===50,'Duplicate target code');
let rows=[];
let newlyPublished=[];
const byCode=new Map(ledger.municipalities.map(x=>[x.lgcode,x]));
const existingCodes=new Set(manifest.map(x=>x.lgcode));
const date='2026-10-31';
for(const item of work.work_items){
const code=item.lgcode;
const base=byCode.get(code);
check(base && base.coverage_state==='pending_review','Unexpected prior state for '+code);
check(!existingCodes.has(code),'Already in manifest '+code);
const state=noDirect.has(code)?'reviewed_no_direct':joint.has(code)?'joint_service':code==='142174'?'standard':'limited';
const url=code==='134023'?'https://www.vill.aogashima.tokyo.jp/life/recycle.html':item.candidate_official_waste_url;
const ty=code==='082155'?'waste_app':calendar.has(code)||code==='082112'?'collection_calendar':'waste_sorting';
let sources=[];
if(state!=='reviewed_no_direct'){
check(url,'No qualified official URL for '+code);
check(slugs[code]&&prefSlug[item.pref],'Missing slug for '+code);
sources.push({pref:item.pref,city:item.municipality,name:item.municipality+' 公式'+(labels[ty]||'ごみ情報'),
type:labels[ty],link_type:ty,url,lgcode:code,last_checked:date,status:'active',language:'ja'});
for(const z of extra[code]||[]) sources.push({pref:item.pref,city:item.municipality,...z,lgcode:code,last_checked:date,status:'active',language:'ja'});
if(chosei.has(code)) sources.push({pref:item.pref,city:item.municipality,name:'長生郡市広域市町村圏組合 家庭ごみの分別早見表',
type:'ごみ分別ページ',link_type:'waste_sorting',url:groupUrl,lgcode:code,last_checked:date,status:'active',language:'ja'});
check(sources.length===new Set(sources.map(x=>x.url)).size,'Repeated official URL within '+code);
rows.push(...sources);
const m={lgcode:code,pref_slug:prefSlug[item.pref],city_slug:slugs[code],publish:true};
manifest.push(m); newlyPublished.push({...m,city:item.municipality});
}
base.coverage_state=state;base.reviewed_at=date;
base.qualifying_source_count=new Set(sources.map(x=>x.url)).size;
base.distinct_link_type_count=new Set(sources.map(x=>x.link_type)).size;
base.service_provider=chosei.has(code)?'長生郡市広域市町村圏組合':code==='082112'?'常総地方広域市町村圏事務組合・下妻地方広域事務組合':null;
base.review_note=state==='reviewed_no_direct'?
(code==='084476'?'Municipality has an indexed waste page but its official content could not be inspected because of bot/JavaScript verification. No unverified direct URL published.':'Municipality-specific third-party index and outsourced search found, but an accessible official municipal waste-specific direct source could not be independently confirmed. No third-party link was published.') :
state==='joint_service'?
(code==='082112'?'City official district allocation shows Mitsukaido via 常総環境センター and Ishige via クリーンポート・きぬ. Never generalize the Ishige-only dropoff guidance.':'Official 長生郡市広域市町村圏組合 2026-2030 joint collection plan explicitly names municipality and joint collection/intermediate processing; shared official sorting source is included.') :
state==='standard'?'Verified three independent official URLs for sorting, bulky waste and direct dropoff.':
'Verified specific official waste source; no missing category or independent URL was invented. District-specific details remain controlled by official source.';
item.review_state=state;
item.verification_status=state==='reviewed_no_direct'?'review_complete_no_safe_direct':'review_complete_official_source';
item.candidate_official_waste_url=url||null;
item.reviewed_at=date;
item.service_provider=base.service_provider;
item.qualifying_source_count=base.qualifying_source_count;
item.distinct_link_type_count=base.distinct_link_type_count;
}
check(newlyPublished.length===48,'Expected 48 publishable and 2 reviewed-no-direct');
check(rows.length===56,'Expected 56 confirmed official links, got '+rows.length);
const totals={};
for(const z of ledger.municipalities) totals[z.coverage_state]=(totals[z.coverage_state]||0)+1;
check(totals.pending_review===1347,'Expected pending=1347');
check(totals.reviewed_no_direct===2,'Expected no direct=2');
check(manifest.filter(m=>m.publish).length===392,'Expected published=392');
check(manifest.length===392,'Unexpected unpublished manifest entries');
write(sourcePath,JSON.stringify(rows,null,2)+'\n');
write(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
write(manifestPath,JSON.stringify(manifest,null,2)+'\n');
ai.snapshot_date=date;
ai.published_municipality_count=manifest.length;
ai.municipalities=manifest.map(m=>({lgcode:m.lgcode,pref_slug:m.pref_slug,city_slug:m.city_slug,
url:'https://nicheworks.app/tools/trashnavi/'+m.pref_slug+'/'+m.city_slug+'/'}));
write(aiPath,JSON.stringify(ai,null,2)+'\n');
let app=read(appPath);
check(!app.includes('direct-waste-links-national-batch02.json'),'Already declared batch02');
const appMarker='"data/direct-waste-links-national-batch01.json"';
check(app.includes(appMarker),'Missing batch01 runtime marker');
app=app.replace(appMarker,appMarker+',"data/direct-waste-links-national-batch02.json"');
write(appPath,app);
let index=read(indexPath);
const marker='<a href="/tools/trashnavi/chiba/ichinomiya/">一宮町</a></div>';
check(index.includes(marker),'Expected index insertion anchor absent');
const links=newlyPublished.map(m=>'<a href="/tools/trashnavi/'+m.pref_slug+'/'+m.city_slug+'/">'+m.city+'</a>').join('');
index=index.replace(marker,marker.replace('</div>','')+links+'</div>');
write(indexPath,index);
let sitemap=read('sitemap.xml');
const sitemapItems=newlyPublished.map(m=>'  <url><loc>https://nicheworks.app/tools/trashnavi/'+m.pref_slug+'/'+m.city_slug+'/</loc></url>').join('\n')+'\n';
check(sitemap.includes('</urlset>'),'Root sitemap closing tag absent');
sitemap=sitemap.replace('</urlset>',sitemapItems+'</urlset>');
write('sitemap.xml',sitemap);
const specPath='tools/trashnavi/SPEC.md';
write(specPath,read(specPath)+'\n## National review batch 02 (2026-10-31)\n\nReviewed 50 Phase 1 municipalities across Ibaraki (3), Chiba (8), Tokyo (14), Kanagawa (19), and Niigata (6). Final states: standard 1, limited 41, joint_service 6, reviewed_no_direct 2; pending in batch 0. Published 48 additional municipality pages. Nationwide reviewed 394 / 1741, pending 1347, published 392. The review policy remains unchanged. Official source dataset: data/direct-waste-links-national-batch02.json. Research trail: review-worklists/national-batch02-research-worklist.json.\n');
work.status='review_complete_generated_and_audited';
work.verified_source_count=rows.length;
work.final_counts={standard:1,limited:41,joint_service:6,reviewed_no_direct:2,pending_review:0};
work.research_snapshot=date;
write(newWork,JSON.stringify(work,null,2)+'\n');
fs.rmSync(path.join(root,oldWork));
execFileSync(process.execPath,['tools/trashnavi/scripts/generate-municipality-pages.mjs'],{cwd:root,stdio:'inherit'});
console.log(JSON.stringify({reviewed:394,pending:1347,published:392,newPages:48,newRecords:rows.length,states:totals},null,2));
