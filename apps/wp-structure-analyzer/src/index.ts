import fs from "fs";
import { parseSqlDump } from "./sqlReader.js";
import { scanWpContent } from "./wpContentScanner.js";
import { generateReportFiles } from "./report.js";
import type { WPStructureReport } from "./types.js";

interface RunOptions {
  sqlPath: string;
  wpContentPath?: string;
  outDir: string;
}

export async function runAnalyzer(opts: RunOptions): Promise<void> {
  if (!fs.existsSync(opts.sqlPath)) {
    throw new Error(`SQL file not found: ${opts.sqlPath}`);
  }

  if (!fs.existsSync(opts.outDir)) {
    fs.mkdirSync(opts.outDir, { recursive: true });
  }

  const sqlContent = fs.readFileSync(opts.sqlPath, "utf8");

  const sqlData = parseSqlDump(sqlContent);

  const wpContentData = opts.wpContentPath
    ? scanWpContent(opts.wpContentPath)
    : { plugins: [], themes: [], media: null };

  const report: WPStructureReport = {
    generatedAt: new Date().toISOString(),
    tablePrefix: sqlData.tablePrefix,
    postTypes: sqlData.postTypes,
    metaKeys: sqlData.metaKeys,
    taxonomies: sqlData.taxonomies,
    plugins: wpContentData.plugins,
    themes: wpContentData.themes,
    media: wpContentData.media
  };

  generateReportFiles(report, opts.outDir);
}
