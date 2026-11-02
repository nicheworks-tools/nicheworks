/**
 * Additive Google Apps Script adapter for the existing NicheWorks daily report.
 * Paste into its EXISTING bound script and call after its current daily refresh.
 * Do not install a separate trigger.
 */
function syncPhoneQuickCheckAnalytics() {
  var spreadsheetId = '173S9-lYe45_kLr0nFDX-s5WxH_T_k8sDYGrMorwG5bE';
  var propertyId = PropertiesService.getScriptProperties().getProperty('GA4_PROPERTY_ID') || '519938639';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Phone QuickCheck計測');
  if (!sheet) throw new Error('Phone QuickCheck計測 tab absent: no data modified');
  if (!/^[0-9]+$/.test(propertyId)) throw new Error('GA4_PROPERTY_ID must be numeric');
  var tz = 'Asia/Tokyo';
  var today = new Date();
  var first = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 56);
  var last = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  function fmt(d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd'); }
  var startDate = fmt(first);
  var endDate = fmt(last);
  var token = ScriptApp.getOAuthToken();

  function equal(field, value) {
    return { filter: { fieldName: field, stringFilter: { matchType: 'EXACT', value: value, caseSensitive: true } } };
  }
  function prefix(field, value) {
    return { filter: { fieldName: field, stringFilter: { matchType: 'BEGINS_WITH', value: value, caseSensitive: true } } };
  }
  function query(metric, filters) {
    var url = 'https://analyticsdata.googleapis.com/v1beta/properties/' + propertyId + ':runReport';
    var body = {
      dateRanges: [{ startDate: startDate, endDate: endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: metric }],
      dimensionFilter: { andGroup: { expressions: filters } },
      limit: '1000'
    };
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    });
    var status = response.getResponseCode();
    var raw = response.getContentText();
    if (status !== 200) throw new Error('GA4 Data API HTTP ' + status + ': ' + raw.substring(0, 300));
    var data = JSON.parse(raw);
    if (data.error) throw new Error('GA4 Data API error: ' + JSON.stringify(data.error));
    var out = {};
    (data.rows || []).forEach(function (item) {
      var day = item.dimensionValues && item.dimensionValues[0] && item.dimensionValues[0].value;
      var value = Number(item.metricValues && item.metricValues[0] && item.metricValues[0].value);
      if (!/^[0-9]{8}$/.test(day || '') || !Number.isFinite(value) || value < 0) {
        throw new Error('Malformed GA4 daily row: ' + JSON.stringify(item));
      }
      out[day] = (out[day] || 0) + value;
    });
    return out;
  }

  // Fetch all reports BEFORE committing any data to the owned Sheet.
  var views = query('eventCount', [equal('eventName', 'page_view'), prefix('pagePath', '/tools/phone-quickcheck')]);
  var landing = query('sessions', [prefix('landingPage', '/tools/phone-quickcheck')]);
  var clicks = query('eventCount', [equal('eventName', 'affiliate_outbound'), prefix('pagePath', '/tools/phone-quickcheck')]);
  var referrals = query('eventCount', [equal('eventName', 'manualfinder_phone_quickcheck_click'), prefix('pagePath', '/tools/manual-finder')]);

  var values = [];
  for (var i = 0; i < 56; i++) {
    var d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    var key = Utilities.formatDate(d, tz, 'yyyyMMdd');
    values.push([new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      views[key] || 0, landing[key] || 0, clicks[key] || 0, referrals[key] || 0,
      'GA4 API 成功', 'Google公式Data API（注文・報酬は対象外）']);
  }
  sheet.getRange(24, 1, values.length, 7).setValues(values);
  sheet.getRange('B4').setValue('GA4公式API：直近56日を取得済み');
  sheet.getRange('B5').setValue(new Date());
  sheet.getRange('B17').setValue('GA4 API取得成功。Amazon注文・報酬は未取得です。');
  return { days: values.length, startDate: startDate, endDate: endDate };
}
