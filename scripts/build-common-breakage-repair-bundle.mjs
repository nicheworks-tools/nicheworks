import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputPath = process.env.COMMON_REPAIR_BUNDLE || 'common-breakage-repair-bundle.json';
const skippedDirectories = new Set([
  '.git',
  '.github',
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '_archive',
  'templates',
  'apps'
]);

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function collectHtml(directory = root) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(fullPath));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function shouldSkip(fileName) {
  return fileName.includes('/mock/');
}

const files = [];
for (const file of collectHtml()) {
  const fileName = relative(file);
  if (shouldSkip(fileName)) continue;

  const before = fs.readFileSync(file, 'utf8');
  const after = before
    .replace(/\bstable\s+content\s*=/gi, 'placeholder=')
    .replace(
      /https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\?client=/gi,
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='
    );

  if (after !== before) {
    files.push({
      path: fileName,
      content_base64: Buffer.from(after, 'utf8').toString('base64')
    });
  }
}

const bundle = {
  generated_at: new Date().toISOString(),
  changed_files: files.length,
  files
};
fs.writeFileSync(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
console.log(`Repair bundle created for ${files.length} file(s).`);
