import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportPath = process.env.OPERATIONAL_BATCH_REPORT || 'operational-batch-1-report.json';
const targetSlugs = [
  'pdf2csv-local',
  'pdf-page-tools-mini',
  'csv-tidy',
  'exif-cleaner-mini',
  'image-redact',
  'filetype-sniffer',
  'webp-avif-converter',
  'color-replace',
  'screenshot-stitcher',
  'rename-wizard',
  'metadatasnap',
  'image-compression-inspector',
  'og-image-maker',
  'old-kanji-ocr-scanner',
  'url-title-collector',
];

function unique(values) {
  return [...new Set(values)];
}

function localPathFromUrl(value) {
  if (!value || /^(?:https?:)?\/\//i.test(value) || /^(?:data:|mailto:|tel:|#)/i.test(value)) return null;
  return value.split(/[?#]/, 1)[0];
}

function resolveLocal(pageDir, value) {
  const cleaned = localPathFromUrl(value);
  if (!cleaned) return null;
  return cleaned.startsWith('/')
    ? path.join(root, cleaned.replace(/^\/+/, ''))
    : path.resolve(pageDir, cleaned);
}

function matches(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

function checkJsSyntax(filePath, isModule) {
  const source = fs.readFileSync(filePath, 'utf8');
  const args = isModule
    ? ['--input-type=module', '--check']
    : ['--check', filePath];
  const result = isModule
    ? spawnSync(process.execPath, args, { input: source, encoding: 'utf8' })
    : spawnSync(process.execPath, args, { encoding: 'utf8' });
  return result.status === 0 ? null : (result.stderr || result.stdout || 'Unknown JavaScript syntax error').trim();
}

const tools = [];
let errorCount = 0;
let warningCount = 0;

for (const slug of targetSlugs) {
  const toolDir = path.join(root, 'tools', slug);
  const indexPath = path.join(toolDir, 'index.html');
  const item = {
    slug,
    index_exists: fs.existsSync(indexPath),
    scripts: [],
    errors: [],
    warnings: [],
  };

  if (!item.index_exists) {
    item.errors.push(`Missing tools/${slug}/index.html`);
    tools.push(item);
    errorCount += item.errors.length;
    continue;
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const ids = matches(html, /\bid=["']([^"']+)["']/gi);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) item.errors.push(`Duplicate HTML ids: ${duplicateIds.join(', ')}`);

  const localAssets = [
    ...matches(html, /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
    ...matches(html, /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi),
    ...matches(html, /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
  ];
  for (const asset of unique(localAssets)) {
    const resolved = resolveLocal(toolDir, asset);
    if (resolved && !fs.existsSync(resolved)) {
      item.errors.push(`Missing local asset: ${asset}`);
    }
  }

  const scriptTags = [...html.matchAll(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi)];
  const htmlIdSet = new Set(ids);
  const domRefs = new Set();

  for (const tag of scriptTags) {
    const attributes = `${tag[1]} ${tag[3]}`;
    const src = tag[2];
    const filePath = resolveLocal(toolDir, src);
    if (!filePath || !fs.existsSync(filePath) || path.extname(filePath).toLowerCase() !== '.js') continue;

    const isModule = /\btype=["']module["']/i.test(attributes);
    const syntaxError = checkJsSyntax(filePath, isModule);
    item.scripts.push({ src, module: isModule, syntax_ok: !syntaxError });
    if (syntaxError) item.errors.push(`JavaScript syntax error in ${src}: ${syntaxError}`);

    const js = fs.readFileSync(filePath, 'utf8');
    for (const id of matches(js, /getElementById\(\s*["']([^"']+)["']\s*\)/g)) domRefs.add(id);
    for (const id of matches(js, /querySelector\(\s*["']#([A-Za-z][\w:-]*)["']\s*\)/g)) domRefs.add(id);
  }

  const missingDomRefs = [...domRefs].filter((id) => !htmlIdSet.has(id));
  if (missingDomRefs.length) {
    item.warnings.push(`DOM ids referenced by local JS but not present in index.html: ${missingDomRefs.join(', ')}`);
  }

  const fileInputs = [...html.matchAll(/<input\b[^>]*type=["']file["'][^>]*>/gi)];
  if (fileInputs.length && item.scripts.length === 0) {
    item.warnings.push('File input is present but no local JavaScript file is referenced.');
  }

  errorCount += item.errors.length;
  warningCount += item.warnings.length;
  tools.push(item);
}

const report = {
  generated_at: new Date().toISOString(),
  target_count: targetSlugs.length,
  error_count: errorCount,
  warning_count: warningCount,
  tools,
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  target_count: report.target_count,
  error_count: report.error_count,
  warning_count: report.warning_count,
}, null, 2));

if (errorCount > 0) process.exitCode = 1;
