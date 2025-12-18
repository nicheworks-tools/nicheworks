import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { DEFAULT_PRO_RULES, scanAndRedact } from "../src/core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "testdata.generated.txt");
const EXPECTED_PATH = path.join(__dirname, "EXPECTED.json");

if (!fs.existsSync(DATA_PATH)) {
  console.log("testdata.generated.txt not found. Generating with generate_testdata.js…");
  await import(pathToFileURL(path.join(__dirname, "generate_testdata.js")));
}

const expected = JSON.parse(fs.readFileSync(EXPECTED_PATH, "utf8"));
const raw = fs.readFileSync(DATA_PATH, "utf8");

function parseCases(text) {
  const lines = text.split(/\r?\n/);
  const cases = [];
  let currentId = null;
  let buffer = [];

  const flush = () => {
    if (!currentId) return;
    const body = buffer.join("\n").trim();
    cases.push({ id: currentId, body });
    buffer = [];
  };

  for (const line of lines) {
    if (line.startsWith("#")) continue;
    const m = line.match(/^\[(?<id>[A-Z]-\d{2})\]/);
    if (m) {
      flush();
      currentId = m.groups.id;
      continue;
    }
    buffer.push(line);
  }
  flush();
  return cases;
}

const cases = parseCases(raw);

const proRuleVariants = {
  keep_last: { ...DEFAULT_PRO_RULES, mode: "keep_last" },
  replace_all: { ...DEFAULT_PRO_RULES, mode: "replace_all" },
};

let pass = 0;
let fail = 0;

function checkResult(caseId, modeLabel, actual, expectedCounts) {
  const ok =
    actual.total === expectedCounts.total && actual.types === expectedCounts.types;
  if (ok) {
    console.log(`✅ PASS ${caseId} [${modeLabel}]`);
    pass++;
  } else {
    console.log(
      `❌ FAIL ${caseId} [${modeLabel}] expected total=${expectedCounts.total}/types=${expectedCounts.types} ` +
        `actual total=${actual.total}/types=${actual.types}`,
    );
    fail++;
  }
}

for (const c of cases) {
  const exp = expected[c.id];
  if (!exp) {
    console.log(`⚠️  SKIP ${c.id} (no expectation defined)`);
    continue;
  }

  const freeRes = scanAndRedact(c.body, false, { ...DEFAULT_PRO_RULES });
  checkResult(c.id, "free", freeRes, exp.free);

  for (const [variant, rules] of Object.entries(proRuleVariants)) {
    const proRes = scanAndRedact(c.body, true, rules);
    checkResult(c.id, `pro:${variant}`, proRes, exp.pro);
  }
}

console.log("---");
console.log(`Done. PASS=${pass}, FAIL=${fail}`);

if (fail > 0) {
  process.exitCode = 1;
}
