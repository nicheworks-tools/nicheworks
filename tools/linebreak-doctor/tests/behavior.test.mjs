import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

const storage = new Map();
const documentStub = {
  title: '',
  documentElement: { lang: 'en' },
  body: {
    appendChild() {},
    removeChild() {},
  },
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() {
    return {
      dataset: {},
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {},
      append() {},
      appendChild() {},
      remove() {},
      focus() {},
      select() {},
      addEventListener() {},
      textContent: '',
      innerHTML: '',
      value: '',
    };
  },
  createDocumentFragment() {
    return { appendChild() {} };
  },
  execCommand() { return false; },
};

const sandbox = {
  console,
  document: documentStub,
  navigator: { language: 'en', clipboard: null },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  },
  setTimeout,
  clearTimeout,
  Blob,
  URL,
};
sandbox.window = {
  isSecureContext: false,
  setTimeout,
  clearTimeout,
};

const context = vm.createContext(sandbox);
vm.runInContext(source, context, { filename: 'tools/linebreak-doctor/app.js' });

const evaluate = (expression) => vm.runInContext(expression, context);

assert.equal(
  evaluate(`normalizeLineBreaks("alpha\\r\\nbeta\\rgamma")`),
  'alpha\nbeta\ngamma',
  'mixed CRLF/CR line endings should normalize to LF',
);

assert.equal(
  evaluate(`snsProfiles.find((item) => item.id === "X").formatter("  hello  \\r\\n\\r\\n\\r\\n world \\t", "plain-text")`),
  'hello\nworld',
  'X formatter should trim line edges and collapse repeated blank lines',
);

assert.equal(
  evaluate(`snsProfiles.find((item) => item.id === "Instagram").formatter("Hi😀\\nNext", "platform-safe")`),
  'Hi😀\u200B\nNext',
  'Instagram platform-safe mode should insert a zero-width space after emoji before newline',
);
assert.equal(
  evaluate(`snsProfiles.find((item) => item.id === "Instagram").formatter("Hi😀\\nNext", "plain-text")`),
  'Hi😀\nNext',
  'Instagram plain-text mode should not insert a zero-width space',
);

assert.equal(
  evaluate(`snsProfiles.find((item) => item.id === "Facebook").formatter("A\\n\\nB", "platform-safe")`),
  'A\n\u200B\nB',
  'Facebook platform-safe mode should preserve a blank line with a zero-width space',
);
assert.equal(
  evaluate(`snsProfiles.find((item) => item.id === "Facebook").formatter("A\\n\\nB", "plain-text")`),
  'A\n\nB',
  'Facebook plain-text mode should keep the blank line without invisible characters',
);

assert.deepEqual(
  JSON.parse(evaluate(`JSON.stringify(getDiagnostics("A\\n\\nB", "A\\n\\u200B\\nB"))`)),
  {
    lineBefore: 3,
    lineAfter: 3,
    blankBefore: 1,
    blankAfter: 1,
    zwspCount: 1,
    visibleChanged: false,
  },
  'diagnostics should report invisible-character insertion without claiming visible-content change',
);

console.log('LineBreak Doctor behavior test passed.');
