import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({window:{}});
for(const file of ['assets/okj-report-engine.js','assets/okj-export-engine.js'])
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const report=ctx.window.OldKanjiReportEngine;
const exporter=ctx.window.OldKanjiExportEngine;
const gateReport={active:true,productId:'okj.toolkit_pro',featureId:'okj.reports'};
const gateExport={active:true,productId:'okj.toolkit_pro',featureId:'okj.advancedExport'};
const wrong={...gateReport,active:false};
const input={
 title:'Historical Manuscript',sourceLabel:'Original A',ocrText:'  舊學\n=HYPERLINK("https://evil.example")',
 modernPreview:'  旧学\n=HYPERLINK("https://evil.example")',
 detectedOldKanji:[{old:'舊',modern:['旧'],count:1},{old:'學',modern:['学'],count:1}],
 historyRecords:[{sourceType:'image',sourceLabel:'Original A',ocrText:'舊學'}],
 collectionRecords:[{old:'舊',modern:['旧'],source:'ocr'}],createdAt:'2026-10-31T00:00:00Z',notes:'Compare against official source'
};
assert.equal(report.buildMarkdownReport(input,gateExport).error,'pro_required');
assert.equal(report.buildJsonReport(input,wrong).error,'pro_required');
assert.equal(exporter.buildCsvExport(input,gateReport).error,'pro_required');
assert.equal(exporter.buildJsonExport(input,{active:true,productId:'wrong',featureId:'okj.advancedExport'}).error,'pro_required');
const md=report.buildMarkdownReport(input,gateReport);
assert.equal(md.ok,true);assert.ok(md.content.includes('舊學'));assert.ok(md.content.includes('旧学'));
assert.ok(md.content.includes('History Summary'));assert.ok(md.content.includes('Collection Summary'));
const json=JSON.parse(report.buildJsonReport(input,gateReport).content);
assert.equal(json.report.ocrText,input.ocrText);
assert.equal(json.report.collectionRecords.length,1);
const csv=exporter.buildCsvExport(input,gateExport);
assert.equal(csv.ok,true);
const injection=exporter.buildCsvExport({...input,ocrText:'=HYPERLINK("https://evil.example")'},gateExport);
assert.ok(injection.content.includes("'=HYPERLINK"),'CSV formula injection must not execute');
assert.ok(csv.content.includes('舊'));
assert.ok(csv.content.includes('學'));
assert.equal(JSON.parse(exporter.buildJsonExport(input,gateExport).content).historyRecords.length,1);
assert.ok(exporter.buildMarkdownExport(input,gateExport).content.includes('舊學'));
const html=fs.readFileSync('tools/old-kanji-ocr-scanner/index.html','utf8');
for(const asset of ['okj-report-engine.js','okj-export-engine.js','okj-report-export-ui.js'])
  assert.ok(html.includes('/assets/'+asset));
const ui=fs.readFileSync('assets/okj-report-export-ui.js','utf8');
for(const needle of ["refreshProState({productId:PRODUCT,featureId:feature})",
  "recheck('okj.history')","recheck('okj.collections')",
  "reports.buildMarkdownReport(","exporter.buildCsvExport("])
  assert.ok(ui.includes(needle),'UI missing '+needle);
assert.doesNotMatch(ui,/gtag\(|amazon\.co\.jp|api\/billing\/create-checkout-session/);
console.log('Old Kanji actual report and advanced export output, guards, CSV injection and OCR UI PASS');
