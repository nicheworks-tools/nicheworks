(() => {
  'use strict';

  const STRIPE = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const ENTITLEMENT = 'nicheworks_pro';
  const TOOL_ID = 'cold-email-requirement-checker';
  const $ = (id) => document.getElementById(id);
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';

  let proScriptPromise = null;

  function ensureNWPro() {
    if (window.NWPro && typeof window.NWPro.getLocalStatus === 'function') return Promise.resolve(true);
    if (proScriptPromise) return proScriptPromise;
    proScriptPromise = new Promise((resolve) => {
      const existing = document.querySelector('script[src="/assets/nw-pro.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(Boolean(window.NWPro)), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        if (window.NWPro) resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = '/assets/nw-pro.js';
      script.onload = () => resolve(Boolean(window.NWPro));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
    return proScriptPromise;
  }

  function readSharedPro() {
    try {
      if (!window.NWPro || typeof window.NWPro.getLocalStatus !== 'function') return false;
      const status = window.NWPro.getLocalStatus() || {};
      return Boolean(status.active && status.entitlement === ENTITLEMENT);
    } catch (_) {
      return false;
    }
  }

  function toast(message) {
    let el = $('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function requirePro() {
    if (readSharedPro()) return true;
    toast(lang() === 'ja'
      ? 'Pro限定機能です。共通NicheWorks Proをこのブラウザで有効化してください。'
      : 'Pro feature locked. Activate shared NicheWorks Pro in this browser.');
    render();
    return false;
  }

  function words(value) {
    return String(value || '').trim().split(/\s+/).filter(Boolean).length;
  }

  function lines(value) {
    return String(value || '').split('\n').map((x) => x.trim()).filter(Boolean);
  }

  function markdown() {
    const a = $('emailText')?.value || '';
    const b = $('proDraftB')?.value || '';
    const subject = $('emailSubject')?.value || '';
    return [
      '# Cold Email Pro Review', '',
      `Subject: ${subject}`, '',
      '## Draft A stats',
      `- Characters: ${a.length}`,
      `- Words/segments: ${words(a)}`,
      `- Lines: ${lines(a).length}`, '',
      '## Draft B stats',
      `- Characters: ${b.length}`,
      `- Words/segments: ${words(b)}`,
      `- Lines: ${lines(b).length}`, '',
      '## Draft A', a, '',
      '## Draft B', b, '',
      '## Note',
      'This is a structure review aid. It does not guarantee legal compliance, deliverability, reply rate, or sales results.'
    ].join('\n');
  }

  function download(name, text) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setProVisibility() {
    const pro = readSharedPro();
    const score = $('scoreValue')?.closest('.result-card');
    if (score) score.style.display = pro ? '' : 'none';
    const suggestions = $('suggestions')?.closest('.field');
    if (suggestions) suggestions.style.display = pro ? '' : 'none';
    const status = $('overallStatus');
    if (status && !pro) {
      status.textContent = lang() === 'ja'
        ? '無料チェックリスト利用中 — スコアと改善候補はPro'
        : 'Free checklist mode — score and suggestions are Pro';
    }
    document.body.classList.toggle('is-pro', pro);
    document.documentElement.dataset.proTool = TOOL_ID;
    document.documentElement.dataset.proActive = pro ? 'true' : 'false';
  }

  function buildBox() {
    if ($('coldProBox')) return;
    const root = $('toolRoot');
    if (!root) return;
    const box = document.createElement('section');
    box.id = 'coldProBox';
    box.className = 'nw-note';
    box.innerHTML = `
      <strong>Pro</strong>
      <p id="coldProMsg"></p>
      <p><a class="btn primary" href="${STRIPE}" target="_blank" rel="noopener">Unlock Pro / Proを購入</a></p>
      <p class="nw-muted">After purchase, complete the shared NicheWorks Pro activation in this browser. / 購入後は、このブラウザで共通NicheWorks Proの有効化を完了してください。</p>
      <div class="field"><label class="label" for="proDraftB">Pro: Draft B compare</label><textarea id="proDraftB" class="textarea" placeholder="Paste a second draft for comparison"></textarea></div>
      <div class="row"><button id="proCompareBtn" class="btn" type="button">Pro: Compare drafts</button><button id="proExportBtn" class="btn" type="button">Pro: Export Markdown</button></div>
      <pre id="proCompareOut" class="out"></pre>`;
    root.appendChild(box);

    $('proCompareBtn').addEventListener('click', () => {
      if (!requirePro()) return;
      const a = $('emailText')?.value || '';
      const b = $('proDraftB')?.value || '';
      $('proCompareOut').textContent = [
        'Draft comparison',
        `A: ${a.length} chars / ${words(a)} words`,
        `B: ${b.length} chars / ${words(b)} words`,
        `Difference: ${Math.abs(a.length - b.length)} chars`
      ].join('\n');
    });

    $('proExportBtn').addEventListener('click', () => {
      if (!requirePro()) return;
      download('cold-email-pro-review.md', markdown());
    });
  }

  function render() {
    buildBox();
    const msg = $('coldProMsg');
    const pro = readSharedPro();
    if (msg) {
      msg.textContent = pro
        ? 'Pro active: score, suggestions, draft compare, and Markdown export are unlocked. / Pro解放済み。'
        : 'Pro locks score, suggestions, draft compare, and Markdown export. / Proでスコア・改善候補・比較・保存を解放。';
    }
    setProVisibility();
  }

  async function init() {
    await ensureNWPro();
    const timer = setInterval(() => {
      if ($('toolRoot') && $('emailText')) {
        clearInterval(timer);
        render();
        const root = $('toolRoot');
        new MutationObserver(render).observe(root, { childList: true, subtree: true });
        document.addEventListener('click', () => setTimeout(render, 0));
      }
    }, 100);
  }

  window.addEventListener('storage', render);
  window.addEventListener('nw-pro-status-change', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
