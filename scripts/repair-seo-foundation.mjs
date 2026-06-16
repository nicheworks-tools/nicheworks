import { spawnSync } from 'node:child_process';

console.log('[seo] Automatic repair has been disabled. Running the read-only SEO audit instead.');

const result = spawnSync(process.execPath, ['scripts/audit-seo.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

if (result.error) {
  console.error('[seo] Failed to start the SEO audit:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
