import { mkdir, writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://code4fukui.github.io/localgovjp/localgovjp.json';
const OUT_PATH = 'tools/trashnavi/data/localgovjp-lite.json';

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch ${SOURCE_URL}: HTTP ${response.status}`);
}

const source = await response.json();
if (!Array.isArray(source)) {
  throw new Error('localgovjp source is not an array');
}

const rows = source
  .map((row) => ({
    pref: String(row.pref || '').trim(),
    city: String(row.city || '').trim(),
    name: `${String(row.city || '').trim()} 公式サイト`,
    type: '自治体公式ページ',
    url: String(row.url || '').trim(),
    lgcode: String(row.lgcode || '').trim(),
  }))
  .filter((row) => row.pref && row.city && /^https?:\/\//.test(row.url));

await mkdir('tools/trashnavi/data', { recursive: true });
await writeFile(OUT_PATH, `${JSON.stringify(rows)}\n`, 'utf8');

console.log(`Wrote ${rows.length} records to ${OUT_PATH}`);
