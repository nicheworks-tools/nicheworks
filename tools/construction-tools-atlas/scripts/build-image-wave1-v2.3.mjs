import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MANIFEST_PATH = path.join(ROOT, 'data', 'image-wave1-sources-v2.3.json');
const IMAGE_ROOT = path.join(ROOT, 'images');
const USER_AGENT = 'NicheWorks-Construction-Tools-Atlas/2.3 (+https://nicheworks.app/tools/construction-tools-atlas/)';
const MAX_BYTES = 25 * 1024 * 1024;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function fail(message) {
  throw new Error(message);
}

function sha1(buffer) {
  return createHash('sha1').update(buffer).digest('hex');
}

function imageMagickBinary() {
  const magick = spawnSync('magick', ['-version'], { stdio: 'ignore' });
  if (magick.status === 0) return 'magick';
  const convert = spawnSync('convert', ['-version'], { stdio: 'ignore' });
  if (convert.status === 0) return 'convert';
  fail('ImageMagick is required (magick or convert was not found).');
}

function convertImage(binary, source, target, geometry, quality) {
  const args = [
    source,
    '-auto-orient',
    '-colorspace', 'sRGB',
    '-strip',
    '-resize', geometry,
    '-quality', String(quality),
    '-define', 'webp:method=6',
    target
  ];
  const result = spawnSync(binary, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`ImageMagick failed for ${path.basename(target)}: ${result.stderr || result.stdout || 'unknown error'}`);
  }
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
  if (!id || !/^[a-z0-9_]+$/.test(id)) fail(`Invalid entry_id: ${id || '<missing>'}`);
  if (seen.has(id)) fail(`${id}: duplicate entry_id`);
  seen.add(id);
  for (const field of ['source_url', 'source_page', 'source_filename', 'license', 'license_url', 'author', 'attribution']) {
    if (!text(item?.[field])) fail(`${id}: ${field} is required`);
  }
  for (const field of ['source_url', 'source_page', 'license_url']) {
    const url = new URL(item[field]);
    if (url.protocol !== 'https:') fail(`${id}: ${field} must use https`);
  }
  if (item.subject_match !== 'matched') fail(`${id}: Wave 1 build requires subject_match=matched`);
  if (item.review_state !== 'reviewed' && item.review_state !== 'verified') fail(`${id}: Wave 1 build requires reviewed/verified source`);
  if (text(item.source_sha1) && !/^[a-f0-9]{40}$/.test(item.source_sha1)) fail(`${id}: source_sha1 must be 40 lowercase hex characters`);
  return id;
}

function attributionMarkdown(manifest, rows) {
  const lines = [
    '# Construction Tools Atlas — Image attribution',
    '',
    'This file is generated from `data/image-wave1-sources-v2.3.json` by `scripts/build-image-wave1-v2.3.mjs`.',
    '',
    'Runtime images are local derivatives. The build may auto-orient the source, resize it, strip metadata, and convert it to WebP. The original source file is retained beside each derivative.',
    '',
    '| Canonical entry | Author | License | Source | Source SHA-1 |',
    '| --- | --- | --- | --- | --- |'
  ];
  for (const row of rows) {
    const item = row.item;
    const safeAuthor = item.author.replaceAll('|', '\\|');
    const safeLicense = item.license.replaceAll('|', '\\|');
    lines.push(`| \`${item.entry_id}\` | ${safeAuthor} | [${safeLicense}](${item.license_url}) | [Wikimedia Commons](${item.source_page}) | \`${row.hash}\` |`);
  }
  lines.push('', `Source ledger version: \`${manifest.version}\`.`,'');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  if (manifest.schema !== 'cta-image-wave1-sources-v2.3') fail('Unexpected Wave 1 source ledger schema.');
  if (!Array.isArray(manifest.items) || manifest.items.length === 0) fail('Wave 1 source ledger must contain items.');

  const binary = imageMagickBinary();
  const seen = new Set();
  const rows = [];
  await fs.mkdir(IMAGE_ROOT, { recursive: true });

  for (const item of manifest.items) {
    const id = validateItem(item, seen);
    const dir = path.join(IMAGE_ROOT, id);
    await fs.mkdir(dir, { recursive: true });

    const buffer = await download(item);
    const hash = sha1(buffer);
    if (item.source_sha1 && hash !== item.source_sha1) {
      fail(`${id}: SHA-1 mismatch; expected ${item.source_sha1}, got ${hash}`);
    }

    const source = path.join(dir, item.source_filename);
    const primary = path.join(dir, 'primary.webp');
    const thumb = path.join(dir, 'thumb.webp');
    await fs.writeFile(source, buffer);
    convertImage(binary, source, primary, '960x720>', 82);
    convertImage(binary, source, thumb, '320x240>', 78);

    const [primaryStat, thumbStat] = await Promise.all([fs.stat(primary), fs.stat(thumb)]);
    if (!primaryStat.size || !thumbStat.size) fail(`${id}: generated WebP is empty`);
    rows.push({ item, hash });
    console.log(`${id}: source=${buffer.length}B primary=${primaryStat.size}B thumb=${thumbStat.size}B sha1=${hash}`);
  }

  await fs.writeFile(path.join(IMAGE_ROOT, 'ATTRIBUTION.md'), attributionMarkdown(manifest, rows), 'utf8');
  console.log(`Wave 1 image build complete: ${rows.length} canonical entries`);
}

main().catch((error) => {
  console.error(`Construction Tools Atlas Wave 1 image build: FAIL\n${error.stack || error.message || error}`);
  process.exit(1);
});
