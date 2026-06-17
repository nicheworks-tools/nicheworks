import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.env.COMMON_BREAKAGE_REPORT || 'common-breakage-report.json';
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

const failures = [];
let checkedFiles = 0;

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

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

for (const file of collectHtml()) {
  const fileName = relative(file);
  if (fileName.includes('/mock/')) continue;

  checkedFiles += 1;
  const html = fs.readFileSync(file, 'utf8');
  const issues = [];

  if (/\bstable\s+content\s*=/i.test(html)) {
    issues.push('invalid stable content attribute');
  }

  if (/pagead2\.googlesyndication\.com\/pagead\/js\?client=/i.test(html)) {
    issues.push('malformed AdSense loader URL');
  }

  if (/ca-pub-(?:0{16}|1234567890123456)/i.test(html)) {
    issues.push('placeholder AdSense publisher ID');
  }

  if (countMatches(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/gi) > 1) {
    issues.push('duplicate canonical links');
  }

  if (countMatches(html, /<meta\b[^>]*name=["']robots["'][^>]*>/gi) > 1) {
    issues.push('duplicate robots meta tags');
  }

  if (/sitemap-review\.xml|review-only|tools-review|審査用ページ|審査専用/i.test(html)) {
    issues.push('review-only publishing remnant');
  }

  if (issues.length) failures.push({ file: fileName, issues });
}

const report = {
  checked_files: checkedFiles,
  failed_files: failures.length,
  failures
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  console.error(`Common breakage audit failed: ${failures.length} file(s)`);
  for (const item of failures) {
    console.error(`- ${item.file}: ${item.issues.join(', ')}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Common breakage audit passed: ${checkedFiles} HTML file(s) checked.`);
}
