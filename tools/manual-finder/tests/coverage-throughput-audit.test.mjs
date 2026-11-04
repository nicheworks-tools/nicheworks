import assert from 'node:assert/strict';
import {audit, readPublishedJs} from '../scripts/coverage-throughput-audit.mjs';

const row = (model, manualUrl) => ({maker:'Example', model, manualUrl, evidenceUrl:manualUrl});
const pass = {
  schemaVersion:1, maker:'Example', scopeId:'verified-scope', status:'coverage-pass-complete',
  allowedDomains:['example.com'],
  universe:{sourceUrls:['https://example.com/models'],declaredCount:3,models:['A','B','C']},
  records:[
    {model:'A',state:'direct',manualUrl:'https://example.com/a.pdf',evidenceUrls:['https://example.com/a.pdf']},
    {model:'B',state:'direct',manualUrl:'https://example.com/b.pdf',evidenceUrls:['https://example.com/b.pdf']},
    {model:'C',state:'held',reason:'unresolved',attemptedDiscovery:['manual_index','support_search'],evidenceUrls:['https://example.com/models']}
  ]
};
const a = row('A','https://example.com/a.pdf');
const b = row('B','https://example.com/b.pdf');
const result = audit({pass,before:[a],after:[a,b],elapsedSeconds:120});
assert.equal(result.valid,true,JSON.stringify(result.errors));
assert.equal(result.newlyPublished,1);
assert.equal(result.netPublishedChange,1);
assert.equal(result.verifiedNewRowsPerHour,30);
assert.equal(result.officialPopulation,3);
assert.equal(result.heldRate,1/3);
assert.deepEqual(result.states,{direct:2,shared:0,support_only:0,held:1});
assert.equal(audit({pass,before:[a,b],after:[a,b]}).newlyPublished,0,'rechecks are not new publications');
assert.equal(audit({pass,before:[a,b],after:[a]}).valid,false,'previous rows must not disappear');
assert.equal(audit({pass,before:[],after:[a,b,row('C','https://example.com/c.pdf')]}).valid,false,'held must not publish');
assert.equal(audit({pass,before:[],after:[a,row('B','https://example.com/WRONG.pdf')]}).valid,false,'destination drift fails closed');
assert.equal(audit({pass,before:[],after:[a,a]}).valid,false,'duplicate identities fail closed');
const incomplete=structuredClone(pass);incomplete.records.pop();
assert.equal(audit({pass:incomplete,before:[],after:[a]}).valid,false,'incomplete official population fails');
assert.equal(audit({pass,before:[],after:[a],elapsedSeconds:0}).valid,false);
const js='window.MANUALFINDER_COVERAGE_PASS_TEST = Object.freeze([{maker:"Example",model:"A"}]);';
assert.equal(readPublishedJs(js,'MANUALFINDER_COVERAGE_PASS_TEST').length,1);
assert.throws(()=>readPublishedJs(js,'constructor'));
console.log('ManualFinder throughput audit invariants passed.');
