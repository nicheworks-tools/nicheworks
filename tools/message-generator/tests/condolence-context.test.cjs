"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const sandbox = {
  document: { addEventListener() {} },
  window: {},
  navigator: {},
  Math: Object.create(Math)
};
sandbox.Math.random = () => 0;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const generate = (purpose, culture, formality, relationship) =>
  vm.runInContext(
    `generateMessage(${JSON.stringify({ purpose, culture, formality, relationship, keywords: "" })})`,
    sandbox
  );

test("condolences omit generic relationship gratitude and ordinary sign-offs", () => {
  for (const culture of ["japan", "english", "eu"]) {
    for (const formality of ["high", "medium", "casual"]) {
      for (const relationship of ["friend", "family", "boss", "client"]) {
        const result = generate("funeral", culture, formality, relationship);
        assert.ok(result);
        assert.doesNotMatch(result, /ありがとう|よろしく|拝啓|敬具|Dear Sir|Hi there|Cheers|Thank you for your continued|I really value our friendship|I am grateful for your support/);
        if (culture !== "japan") assert.match(result, /With sympathy,/);
      }
    }
  }
});

test("ordinary thank-you messages still include relationship wording", () => {
  assert.match(generate("thank_you", "japan", "medium", "boss"), /ご指導いただき/);
  assert.match(generate("thank_you", "english", "medium", "friend"), /friendship/);
});
