    #!/usr/bin/env node
    import { runAnalyzer } from "./index.js";
    import path from "path";

    function printHelp() {
      console.log(`
Usage:
  wp-structure-analyzer --sql /path/to/site.sql [--wp-content /path/to/wp-content] [--out ./wp-structure-report]

Options:
  --sql         WordPress DB dump (.sql) file path (required)
  --wp-content  wp-content directory path (optional, plugins/themes/uploads解析用)
  --out         Output directory (default: ./wp-structure-report)
  --help        Show this help
`);
    }

    async function main() {
      const args = process.argv.slice(2);
      if (args.includes("--help") || args.length === 0) {
        printHelp();
        process.exit(0);
      }

      const getArg = (name: string, def?: string): string | undefined => {
        const idx = args.indexOf(name);
        if (idx === -1) return def;
        return args[idx + 1];
      };

      const sqlPath = getArg("--sql");
      if (!sqlPath) {
        console.error("[ERROR] --sql is required.");
        printHelp();
        process.exit(1);
      }

      const wpContent = getArg("--wp-content");
      const outDir = getArg("--out", "./wp-structure-report");

      try {
        const resolvedSql = path.resolve(sqlPath);
        const resolvedWpContent = wpContent ? path.resolve(wpContent) : undefined;
        const resolvedOut = path.resolve(outDir);

        console.log("[INFO] Running WP Structure Analyzer...");
        console.log(`  SQL:        ${resolvedSql}`);
        if (resolvedWpContent) console.log(`  wp-content: ${resolvedWpContent}`);
        console.log(`  out:        ${resolvedOut}`);

        await runAnalyzer({
          sqlPath: resolvedSql,
          wpContentPath: resolvedWpContent,
          outDir: resolvedOut
        });

        console.log("[INFO] Done. Open report.html in your browser.");
      } catch (e: any) {
        console.error("[ERROR] Analyzer failed:", e?.message || e);
        process.exit(1);
      }
    }

    main();
