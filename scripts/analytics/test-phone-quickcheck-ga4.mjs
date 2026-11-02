import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./phone-quickcheck-ga4.gs', import.meta.url), 'utf8');
const formatDate = (date, _tz, fmt) => {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return fmt === 'yyyyMMdd' ? y + m + d : y + '-' + m + '-' + d;
};
function runHarness(failOnCall = -1) {
  const calls = [], writes = [];
  const sheet = {
    getRange(...coords) {
      return { setValues(values) { writes.push({ coords, values }); },
        setValue(value) { writes.push({ coords, value }); } };
    }
  };
  const context = {
    Date, Number, JSON,
    SpreadsheetApp: { openById: (id) => {
      assert.equal(id, '173S9-lYe45_kLr0nFDX-s5WxH_T_k8sDYGrMorwG5bE');
      return { getSheetByName: (name) => {
        assert.equal(name, 'Phone QuickCheck計測');
        return sheet;
      } };
    } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => '519938639' }) },
    Utilities: { formatDate },
    ScriptApp: { getOAuthToken: () => 'test-only' },
    UrlFetchApp: { fetch(url, request) {
      const body = JSON.parse(request.payload);
      assert.equal(url, 'https://analyticsdata.googleapis.com/v1beta/properties/519938639:runReport');
      assert.equal(request.headers.Authorization, 'Bearer test-only');
      assert.equal(body.dimensions[0].name, 'date');
      calls.push(body);
      const failure = calls.length === failOnCall;
      return {
        getResponseCode: () => failure ? 403 : 200,
        getContentText: () => failure ? '{"error":{"message":"auth rejected"}}' : '{"rows":[]}'
      };
    } }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { calls, writes, run: () => context.syncPhoneQuickCheckAnalytics() };
}

{
  const h = runHarness();
  const result = h.run();
  assert.equal(result.days, 56);
  assert.equal(h.calls.length, 4, 'exactly four first-party GA4 reports');
  const filters = h.calls.map(q => q.dimensionFilter.andGroup.expressions);
  assert.equal(filters[0][0].filter.stringFilter.value, 'page_view');
  assert.equal(filters[1][0].filter.fieldName, 'landingPage');
  assert.equal(filters[2][0].filter.stringFilter.value, 'affiliate_outbound');
  assert.equal(filters[3][0].filter.stringFilter.value, 'manualfinder_phone_quickcheck_click');
  const block = h.writes.find(x => x.values);
  assert.deepEqual(block.coords, [24, 1, 56, 7]);
  assert.equal(block.values.length, 56);
  assert.equal(block.values[0].length, 7);
  assert.ok(block.values.every(row => row.slice(1,5).every(x => x === 0)),
    'successful zero-row GA4 reports are legitimate zero observations');
  assert.equal(h.writes.length, 4, 'one fixed-row write plus three status updates');
}
{
  const h = runHarness(3);
  assert.throws(() => h.run(), /GA4 Data API HTTP 403/);
  assert.equal(h.calls.length, 3);
  assert.equal(h.writes.length, 0, 'failed API must not erase data or write fake zero');
}
console.log('Phone QuickCheck Apps Script GA4 adapter contract PASS: 4 scoped reports, 56 daily rows, error atomicity.');
