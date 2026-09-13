import fs from 'node:fs';

const appPath = 'tools/reconcile/app.mjs';
let source = fs.readFileSync(appPath, 'utf8');

const reparseFrom = `    name: parsed.name,\n    size: parsed.size,\n    encoding: parsed.encoding,\n    delimiter: parsed.delimiter,\n    rawRows: parsed.rows,\n    sourceFile: file\n  };`;
const reparseTo = `    name: parsed.name,\n    size: parsed.size,\n    encoding: parsed.encoding,\n    delimiter: parsed.delimiter,\n    rawRows: parsed.rows,\n    sourceFile: current.sourceFile\n  };`;

if (!source.includes(reparseFrom)) {
  throw new Error('Reconcile reparse state block not found');
}
source = source.replace(reparseFrom, reparseTo);

const loadFrom = `    name: parsed.name,\n    size: parsed.size,\n    encoding: parsed.encoding,\n    delimiter: parsed.delimiter,\n    rawRows: parsed.rows\n  })) return;`;
const loadTo = `    name: parsed.name,\n    size: parsed.size,\n    encoding: parsed.encoding,\n    delimiter: parsed.delimiter,\n    rawRows: parsed.rows,\n    sourceFile: file\n  })) return;`;

if (!source.includes(loadFrom)) {
  throw new Error('Reconcile initial CSV state block not found');
}
source = source.replace(loadFrom, loadTo);
fs.writeFileSync(appPath, source);

const test = `import assert from 'node:assert/strict';\nimport fs from 'node:fs';\n\nconst source = fs.readFileSync(new URL('../app.mjs', import.meta.url), 'utf8');\n\nconst reparse = source.match(/async function reparseLoadedCsv\\(side\\) \\{[\\s\\S]*?\\n\\}/)?.[0] || '';\nassert.ok(reparse, 'reparseLoadedCsv must exist');\nassert.match(reparse, /readCsvFile\\(current\\.sourceFile/);\nassert.match(reparse, /sourceFile:\\s*current\\.sourceFile/);\nassert.doesNotMatch(reparse, /sourceFile:\\s*file\\b/);\n\nconst loadCsv = source.match(/async function loadCsv\\(side, file\\) \\{[\\s\\S]*?\\n\\}/)?.[0] || '';\nassert.ok(loadCsv, 'loadCsv must exist');\nassert.match(loadCsv, /sourceFile:\\s*file/);\n\nconsole.log('Reconcile CSV reparse source-file contract passed.');\n`;
fs.writeFileSync('tools/reconcile/tests/app-csv-reparse.test.mjs', test);

console.log('Applied Reconcile CSV reparse source-file fix.');
