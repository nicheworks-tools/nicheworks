import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skippedDirectories = new Set([
  '.git', '.github', 'node_modules', '.next', 'dist', 'build',
  'coverage', '_archive', 'templates', 'apps'
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

let changed = 0;
for (const file of collectHtml()) {
  const fileName = relative(file);
  if (fileName.includes('/mock/')) continue;

  const before = fs.readFileSync(file, 'utf8');
  const after = before
    .replace(/\bstable\s+content\s*=/gi, 'placeholder=')
    .replace(
      /https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\?client=/gi,
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='
    );

  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`Updated ${changed} HTML file(s).`);
