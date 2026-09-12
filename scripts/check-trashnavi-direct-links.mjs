import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = 'tools/trashnavi/data';
const FILE_PATTERN = /^direct-waste-links.*\.json$/;
const STRICT = process.env.TRASHNAVI_STRICT_LINK_CHECK === '1';
const TIMEOUT_MS = Number(process.env.TRASHNAVI_LINK_TIMEOUT_MS || 10000);
const REPORT_PATH = String(process.env.TRASHNAVI_LINK_REPORT || '').trim();
const INVENTORY_ONLY = process.argv.includes('--inventory');

const fileNames = (await readdir(DATA_DIR)).filter((name) => FILE_PATTERN.test(name)).sort();
if (fileNames.length === 0) throw new Error('No TrashNavi direct-link datasets discovered');

const records = [];
const invalidRecords = [];
for (const fileName of fileNames) {
  const file = path.join(DATA_DIR, fileName);
  const rows = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(rows)) throw new Error(`${file}: root value must be an array`);
  rows.forEach((row, index) => {
    const url = String(row?.url || '').trim();
    const record = {
      file,
      index,
      pref: String(row?.pref || '').trim(),
      city: String(row?.city || '').trim(),
      type: String(row?.type || row?.link_type || '').trim(),
      linkType: String(row?.link_type || '').trim(),
      lgcode: String(row?.lgcode || '').trim(),
      url,
    };
    records.push(record);
    if (!/^https?:\/\//.test(url)) invalidRecords.push(record);
  });
}

const byUrl = new Map();
for (const record of records) {
  if (!/^https?:\/\//.test(record.url)) continue;
  if (!byUrl.has(record.url)) byUrl.set(record.url, []);
  byUrl.get(record.url).push(record);
}

console.log(`TrashNavi direct-link inventory: ${fileNames.length} datasets, ${records.length} records, ${byUrl.size} unique URLs, ${invalidRecords.length} invalid URLs`);
for (const fileName of fileNames) {
  const count = records.filter((row) => row.file === path.join(DATA_DIR, fileName)).length;
  console.log(`  - ${fileName}: ${count} records`);
}

if (invalidRecords.length > 0) {
  for (const item of invalidRecords) {
    console.error(`INVALID ${item.file}[${item.index}] ${item.pref} ${item.city}: ${item.url || '(empty)'}`);
  }
  process.exitCode = 1;
}

if (INVENTORY_ONLY) {
  if (REPORT_PATH) {
    await writeFile(REPORT_PATH, JSON.stringify({
      mode: 'inventory',
      datasets: fileNames,
      records: records.length,
      unique_urls: byUrl.size,
      invalid_urls: invalidRecords.length,
    }, null, 2) + '\n', 'utf8');
  }
  if (invalidRecords.length === 0) console.log('TrashNavi direct-link inventory validation: OK (no network requests)');
  process.exit();
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function request(url, method) {
  const { signal, clear } = timeoutSignal(TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal,
      headers: {
        'user-agent': 'NicheWorks-TrashNavi-LinkCheck/2.0 (+https://nicheworks.app/tools/trashnavi/)'
      }
    });
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      redirected: res.url !== url,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: '',
      redirected: false,
      error: error.name === 'AbortError' ? 'timeout' : error.message,
    };
  } finally {
    clear();
  }
}

async function checkUrl(url, refs) {
  let result = await request(url, 'HEAD');
  if ([0, 403, 405, 429].includes(result.status)) result = await request(url, 'GET');

  const hardBroken = [404, 410].includes(result.status);
  const level = result.ok ? 'ok' : hardBroken ? 'error' : 'warn';
  return {
    url,
    level,
    status: result.status,
    final_url: result.finalUrl || null,
    redirected: Boolean(result.ok && result.redirected),
    message: result.ok ? null : result.error || `HTTP ${result.status}`,
    refs,
  };
}

const results = [];
for (const [url, refs] of byUrl) {
  // Check one unique URL at a time to avoid burst traffic against municipal sites.
  // eslint-disable-next-line no-await-in-loop
  results.push(await checkUrl(url, refs));
}

const errors = results.filter((item) => item.level === 'error');
const warnings = results.filter((item) => item.level === 'warn');
const ok = results.filter((item) => item.level === 'ok');
const redirects = results.filter((item) => item.redirected);

console.log(`TrashNavi direct link check: ${ok.length} ok, ${redirects.length} redirects, ${warnings.length} warnings, ${errors.length} hard errors across ${results.length} unique URLs`);

for (const item of redirects) {
  console.log(`REDIRECT ${item.url} -> ${item.final_url} (${item.refs.length} record${item.refs.length === 1 ? '' : 's'})`);
}
for (const item of warnings) {
  const sample = item.refs[0];
  console.warn(`WARN ${sample.file}[${sample.index}] ${sample.pref} ${sample.city} ${sample.type}: ${item.message} (${item.url})`);
}
for (const item of errors) {
  const sample = item.refs[0];
  console.error(`ERROR ${sample.file}[${sample.index}] ${sample.pref} ${sample.city} ${sample.type}: ${item.message} (${item.url})`);
}

if (REPORT_PATH) {
  await writeFile(REPORT_PATH, JSON.stringify({
    generated_at: new Date().toISOString(),
    mode: 'network',
    strict: STRICT,
    timeout_ms: TIMEOUT_MS,
    datasets: fileNames,
    record_count: records.length,
    unique_url_count: results.length,
    counts: {
      ok: ok.length,
      redirects: redirects.length,
      warnings: warnings.length,
      hard_errors: errors.length,
      invalid_urls: invalidRecords.length,
    },
    results,
  }, null, 2) + '\n', 'utf8');
  console.log(`Report written: ${REPORT_PATH}`);
}

if (STRICT && errors.length > 0) process.exit(1);
