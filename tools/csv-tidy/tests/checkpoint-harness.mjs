// Test-only VM boundary: execute production functions; do not emulate browser layout.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
export const plain = value => JSON.parse(JSON.stringify(value));
export function element() {
  const children = new Map(), listeners = new Map();
  return {
    value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
    checked: false, dataset: {}, style: {}, children: [], offsetParent: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener(type, fn) { listeners.set(type, [...(listeners.get(type) || []), fn]); },
    dispatch(type, event = {}) { for (const fn of listeners.get(type) || []) fn({ target: this, ...event }); },
    appendChild(child) { this.children.push(child); }, insertAdjacentElement() {}, setAttribute() {},
    click() {}, remove() {},
    querySelector(selector) { if (!children.has(selector)) children.set(selector, element()); return children.get(selector); },
    querySelectorAll() { return []; },
  };
}
export function harness(Decoder = TextDecoder) {
  const nodes = new Map(), blobs = [];
  const get = id => { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); };
  const document = {
    querySelector: get, querySelectorAll: () => [], getElementById: id => get('#' + id),
    createElement: () => element(), addEventListener() {}, body: element(), readyState: 'loading',
  };
  const sandbox = {
    document, navigator: { language: 'en' }, console, TextDecoder: Decoder, Blob,
    URL: { createObjectURL(blob) { blobs.push(blob); return 'blob:test'; }, revokeObjectURL() {} },
    // Timers are deliberately not executed: tests call the relevant production function directly.
    setTimeout() { return 1; }, clearTimeout() {},
    FileReader: class { readAsArrayBuffer(file) { this.result = file.bytes.buffer.slice(file.bytes.byteOffset, file.bytes.byteOffset + file.bytes.byteLength); this.onload(); } },
  };
  sandbox.window = sandbox;
  let source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const needle = '  document.addEventListener("DOMContentLoaded", init);';
  assert.ok(source.includes(needle));
  source = source.replace(needle, 'globalThis.api = { state, els, guessDelimiter, guessEncoding, decodeArrayBuffer, parseCSV, stringifyCSV, buildOutputPreview, handleFile, downloadCSV, applyTemplate, bindUI, renderColsList };' + needle);
  vm.runInNewContext(source, sandbox);
  const api = sandbox.api;
  api.state.ui.lang = 'en';
  get('#outDelimiter').value = 'input'; get('#quotePolicy').value = 'auto';
  get('#previewRows').value = '20';
  async function load(text, encoding = 'utf-8', delimiter = ',') {
    const bytes = typeof text === 'string' ? Buffer.from(text) : Buffer.from(text);
    api.state.input.encoding = encoding; api.state.input.delimiter = delimiter;
    await api.handleFile({ name: 'fixture.csv', bytes });
    return bytes;
  }
  return { ...api, load, nodes, get, blobs, sandbox };
}
export function summaryHarness(h) {
  const source = fs.readFileSync(new URL('../complete.js', import.meta.url), 'utf8');
  vm.runInNewContext(source.replace('  function install(){', '  globalThis.summaryAPI = { renderSummary, excludedNames, confirmExcluded, summaryModel };\n  function install(){'), h.sandbox);
  return { box: h.get('#csvTidyOutputSummary'), ...h.sandbox.summaryAPI };
}
