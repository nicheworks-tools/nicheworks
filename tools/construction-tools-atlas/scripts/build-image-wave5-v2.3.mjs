import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(ROOT, 'data');
const WAVE5_PATH = path.join(DATA, 'image-wave5-sources-v2.3.json');
const IMAGE_ROOT = path.join(ROOT, 'images');
const USER_AGENT = 'NicheWorks-Construction-Tools-Atlas/2.3 (+https://nicheworks.app/tools/construction-tools-atlas/)';
const MAX_BYTES = 25 * 1024 * 1024;

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function fail(message) { throw new Error(message); }
function sha1(buffer) { return createHash('sha1').update(buffer).digest('hex'); }

function imageMagickBinary() {
  const magick = spawnSync('magick', ['-version'], { stdio: 'ignore' });
  if (magick.status === 0) return 'magick';
  const convert = spawnSync('convert', ['-version'], { stdio: 'ignore' });
  if (convert.status === 0) return 'convert';
  fail('ImageMagick is required (magick or convert was not found).');
}

function convertImage(binary, source, target, geometry, quality) {
  const result = spawnSync(binary, [
    source,
    '-auto-orient',
    '-colorspace', 'sRGB',
    '-strip',
    '-resize', geometry,
    '-quality', String(quality),
    '-define', 'webp:method=6',
    target
  ], { encoding: 'utf8' });
  if (result.status !== 0) fail(`ImageMagick failed for ${path.basename(target)}: ${result.stderr || result.stdout || 'unknown error'}`);
}

async function download(item) {
  const response = await fetch(item.source_url, {
    redirect: 'follow',
    headers: { 'user-agent': USER_AGENT, accept: 'image/*' }
  });
  if (!response.ok) fail(`${item.entry_id}: source download failed (${response.status})`);
  const type = response.headers.get('content-type') || '';
  if (!type.toLowerCase().startsWith('image/')) fail(`${item.entry_id}: source is not an image (${type || 'missing content-type'})`);
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_BYTES) fail(`${item.entry_id}: source exceeds ${MAX_BYTES} bytes`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) fail(`${item.entry_id}: downloaded source is empty`);
  if (buffer.length > MAX_BYTES) fail(`${item.entry_id}: downloaded source exceeds ${MAX_BYTES} bytes`);
  return buffer;
}

function validateItem(item, seen) {
  const id = text(item?.entry_id);
  if (!/^[a-z0-9_]+$/.test(id)) fail(`Invalid Wave 5 entry_id: ${id || '<missing>'}`);
  if (seen.has(id)) fail(`${id}: duplicate entry_id`);
  seen.add(id);
  for (const field of ['source_url', 'source_page', 'source_filename', 'license', 'license_url', 'author', 'attribution', 'review_note', 'expected_sha1']) {
    if (!text(item?.[field])) fail(`${id}: ${field} is required`);
  }
  for (const field of ['source_url', 'source_page', 'license_url']) {
    const url = new URL(item[field]);
    if (url.protocol !== 'https:') fail(`${id}: ${field} must use https`);
  }
  if (!/\.(?:jpe?g|png)$/i.test(text(item.source_filename))) fail(`${id}: source_filename must be JPEG or PNG`);
  if (item.subject_match !== 'matched') fail(`${id}: Wave 5 build requires subject_match=matched`);
  if (!['reviewed', 'verified'].includes(item.review_state)) fail(`${id}: Wave 5 build requires reviewed/verified source`);
  if (!/^[a-f0-9]{40}$/.test(text(item.expected_sha1))) fail(`${id}: expected_sha1 must be 40 lowercase hex characters`);
  if (text(item.source_sha1) && !/^[a-f0-9]{40}$/.test(item.source_sha1)) fail(`${id}: source_sha1 must be 40 lowercase hex characters`);
  return id;
}

async function loadAllLedgers() {
  const names = (await fs.readdir(DATA))
    .filter((name) => /^image-wave\d+-sources-v2\.3\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const ledgers = [];
  for (const name of names) {
    const ledger = JSON.parse(await fs.readFile(path.join(DATA, name), 'utf8'));
    if (!Array.isArray(ledger.items)) fail(`${name}: items must be an array`);
    ledgers.push(ledger);
  }
  return ledgers;
}

function attributionMarkdown(ledgers, actualHashes) {
  const lines = [
    '# Construction Tools Atlas — Image attribution',
    '',
    'This file is generated from the reviewed Construction Tools Atlas raster source ledgers.',
    '',
    'Runtime images are local derivatives. The build may auto-orient the source, resize it, strip metadata, and convert it to WebP. The original source file is retained beside each derivative.',
    '',
    'For licensed sources, each generated WebP derivative is made available under the same license shown for that source below. For Public Domain or CC0 sources, NicheWorks does not assert new copyright restrictions over the mechanical WebP derivative.',
    '',
    '| Canonical entry | Attribution | License | Source | Source SHA-1 |',
    '| --- | --- | --- | --- | --- |'
  ];
  for (const ledger of ledgers) {
    for (const item of ledger.items || []) {
      const hash = actualHashes.get(item.entry_id) || text(item.source_sha1);
      if (!hash) fail(`${item.entry_id}: attribution generation requires a source SHA-1`);
      const safeAttribution = String(item.attribution).replaceAll('|', '\\|');
      const safeLicense = String(item.license).replaceAll('|', '\\|');
      lines.push(`| \`${item.entry_id}\` | ${safeAttribution} | [${safeLicense}](${item.license_url}) | [Wikimedia Commons](${item.source_page}) | \`${hash}\` |`);
    }
  }
  lines.push('', `Source ledger versions: ${ledgers.map((ledger) => `\`${ledger.version}\``).join(', ')}.`, '');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const wave5 = JSON.parse(await fs.readFile(WAVE5_PATH, 'utf8'));
  if (wave5.schema !== 'cta-image-wave5-sources-v2.3') fail('Unexpected Wave 5 source ledger schema.');
  if (!Array.isArray(wave5.items) || wave5.items.length === 0) fail('Wave 5 source ledger must contain items.');

  const binary = imageMagickBinary();
  const seen = new Set();
  const actualHashes = new Map();
  await fs.mkdir(IMAGE_ROOT, { recursive: true });

  for (const item of wave5.items) {
    const id = validateItem(item, seen);
    const dir = path.join(IMAGE_ROOT, id);
    await fs.mkdir(dir, { recursive: true });
    const buffer = await download(item);
    const hash = sha1(buffer);
    if (hash !== item.expected_sha1) fail(`${id}: Commons SHA-1 mismatch; expected ${item.expected_sha1}, got ${hash}`);
    if (item.source_sha1 && hash !== item.source_sha1) fail(`${id}: pinned SHA-1 mismatch; expected ${item.source_sha1}, got ${hash}`);
    item.source_sha1 = hash;
    const source = path.join(dir, item.source_filename);
    const primary = path.join(dir, 'primary.webp');
    const thumb = path.join(dir, 'thumb.webp');
    await fs.writeFile(source, buffer);
    convertImage(binary, source, primary, '960x720>', 82);
    convertImage(binary, source, thumb, '320x240>', 78);
    const [primaryStat, thumbStat] = await Promise.all([fs.stat(primary), fs.stat(thumb)]);
    if (!primaryStat.size || !thumbStat.size) fail(`${id}: generated WebP is empty`);
    actualHashes.set(id, hash);
    console.log(`${id}: source=${buffer.length}B primary=${primaryStat.size}B thumb=${thumbStat.size}B sha1=${hash}`);
  }

  await fs.writeFile(WAVE5_PATH, `${JSON.stringify(wave5, null, 2)}\n`, 'utf8');
  const ledgers = await loadAllLedgers();
  await fs.writeFile(path.join(IMAGE_ROOT, 'ATTRIBUTION.md'), attributionMarkdown(ledgers, actualHashes), 'utf8');
  console.log(`Wave 5 image build complete: ${wave5.items.length} canonical entries`);
}

main().catch((error) => {
  console.error(`Construction Tools Atlas Wave 5 image build: FAIL\n${error.stack || error.message || error}`);
  process.exit(1);
});
