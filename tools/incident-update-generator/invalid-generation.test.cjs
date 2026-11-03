const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("invalid generation clears stale audience drafts and disables export actions", () => {
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  const generate = source.match(/  const generateAll = \(\) => \{([\s\S]*?)\n  \};/);
  assert.ok(generate, "production generateAll exists");
  const body = generate[1];
  const invalid = body.match(/if \(missing\.length > 0\) \{([\s\S]*?)\n    \}/);
  assert.ok(invalid, "required-field validation branch exists");
  assert.match(invalid[1], /resetOutputs\("dirty"\)/);
  assert.doesNotMatch(invalid[1], /setGeneratedState\(false\)/);
  const reset = source.match(/  const resetOutputs = \(messageKey\) => \{([\s\S]*?)\n  \};/);
  assert.ok(reset, "production resetOutputs exists");
  assert.match(reset[1], /writeOutputs\(currentOutputs\)/);
  assert.match(reset[1], /setGeneratedState\(false\)/);
  assert.match(source, /const setGeneratedState = \(generated\) => \{[\s\S]*?byId\("downloadBtn"\)\.disabled = !generated/);
});
