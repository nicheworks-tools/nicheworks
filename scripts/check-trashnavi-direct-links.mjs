import { readFile } from 'node:fs/promises';

const FILE = 'tools/trashnavi/data/direct-waste-links.json';
const STRICT = process.env.TRASHNAVI_STRICT_LINK_CHECK === '1';
const TIMEOUT_MS = Number(process.env.TRASHNAVI_LINK_TIMEOUT_MS || 10000);

const text = await readFile(FILE, 'utf8');
const rows = JSON.parse(text);

if (!Array.isArray(rows)) {
  throw new Error(`${FILE}: root value must be an array`);
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
        'user-agent': 'NicheWorks-TrashNavi-LinkCheck/1.0 (+https://nicheworks.app/tools/trashnavi/)'
      }
    });
    return { ok: res.ok, status: res.status, finalUrl: res.url };
  } catch (error) {
    return { ok: false, status: 0, error: error.name === 'AbortError' ? 'timeout' : error.message };
  } finally {
    clear();
  }
}

async function check(row, index) {
  const label = `${row.pref || ''} ${row.city || ''} ${row.type || ''}`.trim();
  if (!/^https?:\/\//.test(row.url || '')) {
    return { index, label, url: row.url, level: 'error', message: 'invalid URL format' };
  }

  let result = await request(row.url, 'HEAD');
  if ([0, 403, 405, 429].includes(result.status)) {
    result = await request(row.url, 'GET');
  }

  if (result.ok) {
    return { index, label, url: row.url, level: 'ok', status: result.status, finalUrl: result.finalUrl };
  }

  const hardBroken = [404, 410].includes(result.status);
  return {
    index,
    label,
    url: row.url,
    level: hardBroken ? 'error' : 'warn',
    status: result.status,
    message: result.error || `HTTP ${result.status}`,
  };
}

const results = [];
for (let i = 0; i < rows.length; i += 1) {
  // Sequential requests are slower but kinder to municipal websites.
  // This file is small enough for scheduled/manual checks.
  // eslint-disable-next-line no-await-in-loop
  results.push(await check(rows[i], i));
}

const errors = results.filter((x) => x.level === 'error');
const warnings = results.filter((x) => x.level === 'warn');
const ok = results.filter((x) => x.level === 'ok');

console.log(`TrashNavi direct link check: ${ok.length} ok, ${warnings.length} warnings, ${errors.length} errors`);

for (const item of warnings) {
  console.warn(`WARN [${item.index}] ${item.label}: ${item.message} (${item.url})`);
}
for (const item of errors) {
  console.error(`ERROR [${item.index}] ${item.label}: ${item.message} (${item.url})`);
}

if (STRICT && errors.length > 0) {
  process.exit(1);
}
