const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(id) {
  const v = (text) => ({ en: text, ja: text });
  return {
    id, term: v(id), aliases: v([]), searchPhrases: v([id]),
    category: v('UI'), termType: v('descriptor'), useCase: v('Design'),
    beginner: v('Beginner ' + id), practicalIntent: v('Intent ' + id),
    practicalUseCase: v('Use ' + id), plainExplanation: v('Meaning ' + id),
    commonMisuse: v('Avoid ' + id), vagueToPractical: v(['Specific ' + id]),
    badRequest: v('Bad ' + id), betterRequest: v('Better ' + id),
    badBetterWhy: v('Why ' + id), shortPrompt: { en: { ui: 'Prompt ' + id } },
    compareRelationships: [], compareGuides: {}
  };
}

function harness(saved = {}) {
  const callbacks = new Map();
  const elements = new Map();
  const clipboard = [];
  const proActions = ['fullPrompt', 'memo', 'avoid', 'handoff', 'markdown', 'json'];
  class Element {
    constructor(id) {
      this.id = id;
      this.dataset = {};
      this.style = {};
      this.children = [];
      this.className = '';
      this.textContent = '';
      this.value = '';
      this.disabled = false;
      this.hidden = false;
      this.parentNode = { insertBefore() {} };
      this.classList = {
        names: new Set(), add(n) { this.names.add(n); }, remove(n) { this.names.delete(n); },
        toggle(n, on) { if (on === undefined ? !this.names.has(n) : on) this.names.add(n); else this.names.delete(n); }
      };
    }
    get firstChild() { return this.children[0] || null; }
    addEventListener(event, fn) { callbacks.set(this.id + ':' + event, fn); }
    emit(event, value) { return callbacks.get(this.id + ':' + event)?.(value); }
    appendChild(child) { this.children.push(child); return child; }
    append(...children) { this.children.push(...children); }
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); }
    setAttribute(name, val) { this[name] = String(val); }
    removeAttribute(name) { delete this[name]; }
    scrollIntoView() {}
  }
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  const buttons = proActions.map(action => { const b = new Element('action-' + action); b.dataset.proAction = action; return b; });
  const root = get('body');
  root.dataset = { tool: 'vibe-lexicon', page: 'index', lang: 'en' };
  const document = {
    body: root,
    head: get('head'),
    documentElement: { dataset: {} },
    getElementById: get,
    createElement: tag => new Element(tag),
    createTextNode: text => ({ textContent: text }),
    querySelector: q => q === '.dashboard' ? get('dashboard') : null,
    querySelectorAll: q => q === '[data-pro-action]' ? buttons : [],
    addEventListener: (name, fn) => callbacks.set('document:' + name, fn)
  };
  const window = {
    VIBE_LEXICON_TERMS: [fixture('Alpha'), fixture('Beta')],
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}
  };
  const localStorage = {
    getItem(key) { return saved[key] || null; },
    setItem(key, val) { saved[key] = String(val); }
  };
  const navigator = {
    clipboard: { writeText: text => new Promise(resolve => clipboard.push({ text, resolve })) }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), {
    document, window, localStorage, navigator,
    setTimeout: () => 1, clearTimeout() {}, console
  }, { filename: 'app.js' });
  function search(value) {
    get('searchInput').value = value;
    get('searchInput').emit('input', { target: { value } });
  }
  function action(name) {
    const target = { closest: q => q === '[data-pro-action]' ? { dataset: { proAction: name } } : null };
    callbacks.get('document:click')({ target });
  }
  return { get, buttons, saved, clipboard, search, action };
}

test('malformed, non-array and stale persisted IDs never break the catalog', () => {
  for (const value of ['null', '{}', '42', '"string"', '{invalid', 'false']) {
    const h = harness({ 'nw-vl-favorites': value, 'nw-vl-recent': value });
    assert.equal(h.get('detailTitle').textContent, 'Alpha');
    assert.equal(h.get('statFav').textContent, '0');
  }
  const h = harness({
    'nw-vl-favorites': JSON.stringify(['Beta', 'Beta', null, 'missing', 'Alpha']),
    'nw-vl-recent': JSON.stringify(['missing', 'Beta', 2, 'Beta'])
  });
  assert.equal(h.get('statFav').textContent, '2');
  assert.match(h.get('vlProUnlockedOutput').textContent, /Alpha/);
});

test('filtering to a different valid term updates the selected detail and all export preview content', () => {
  const h = harness();
  h.search('Beta');
  assert.equal(h.get('detailTitle').textContent, 'Beta');
  assert.match(h.get('vlProUnlockedOutput').textContent, /Beta/);
  assert.doesNotMatch(h.get('vlProUnlockedOutput').textContent, /Term: Alpha/);
  assert.equal(h.buttons.find(b => b.dataset.proAction === 'markdown').disabled, false);
});

test('zero-result filters clear the old selection and block invalid exports without a paid gate', () => {
  const h = harness();
  h.search('no-results-xyz-92731');
  assert.match(h.get('detailTitle').textContent, /No terms match/);
  assert.doesNotMatch(h.get('vlProUnlockedOutput').textContent, /Term: Alpha/);
  assert.equal(h.get('copyPromptBtn').disabled, true);
  assert.equal(h.buttons.find(b => b.dataset.proAction === 'json').disabled, true);
  h.action('memo');
  assert.equal(h.clipboard.length, 0);
  h.search('');
  assert.equal(h.get('detailTitle').textContent, 'Alpha');
  assert.equal(h.buttons.find(b => b.dataset.proAction === 'json').disabled, false);
});

test('a delayed clipboard completion cannot resurrect an outdated work-pack preview', async () => {
  const h = harness();
  h.action('memo');
  assert.equal(h.clipboard.length, 1);
  assert.match(h.clipboard[0].text, /Term: Alpha/);
  h.search('Beta');
  h.clipboard[0].resolve();
  for (let i = 0; i < 8; i++) await Promise.resolve();
  assert.match(h.get('vlProUnlockedOutput').textContent, /Term: Beta/);
  assert.doesNotMatch(h.get('vlProUnlockedOutput').textContent, /Term: Alpha/);
});
