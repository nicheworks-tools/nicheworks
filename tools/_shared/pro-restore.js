(() => {
  'use strict';
  const STRIPE_URL = 'https://buy.stripe.com/bJe14p2QV1M13dz5kjcV208';
  const slug = location.pathname.split('/tools/')[1]?.split('/')[0] || 'tool';
  const key = 'nw_pro_' + slug.replace(/-/g, '_');
  const $ = (id) => document.getElementById(id);
  const hasPro = () => {
    try { return localStorage.getItem(key) === '1' || !!localStorage.getItem('nw_pro_key'); }
    catch (_) { return false; }
  };
  const activate = () => {
    const url = new URL(location.href);
    if (url.searchParams.get('pro') === '1') {
      try { localStorage.setItem(key, '1'); } catch (_) {}
      url.searchParams.delete('pro');
      history.replaceState({}, '', url.toString());
    }
  };
  const toast = (text) => {
    let el = $('toast') || document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { el.hidden = true; }, 2400);
  };
  const box = () => {
    if ($('nwProRestoreBox')) return;
    const el = document.createElement('section');
    el.id = 'nwProRestoreBox';
    el.className = 'nw-note pro-restore-box';
    el.innerHTML = `<strong>Pro</strong><p data-pro-status></p><p><a class="btn primary" href="${STRIPE_URL}" target="_blank" rel="noopener">Unlock Pro / Proを購入</a></p><p class="nw-muted">After payment, open this page with <code>?pro=1</code>. 決済後、このページを <code>?pro=1</code> 付きで開くとこの端末で有効になります。</p>`;
    const target = document.querySelector('main .card, main .nw-card, main .panel, main section');
    target?.parentNode?.insertBefore(el, target.nextSibling);
  };
  const status = () => {
    box();
    document.body.classList.toggle('is-pro', hasPro());
    document.querySelectorAll('[data-pro-status]').forEach((el) => {
      el.textContent = hasPro() ? 'Pro active on this device. / この端末でPro解放済みです。' : 'Pro features are locked until purchase. / Pro機能は購入後に解放されます。';
    });
  };
  const guard = (e) => {
    if (hasPro()) return true;
    e?.preventDefault?.();
    e?.stopImmediatePropagation?.();
    status();
    toast('Pro限定機能です。購入後に ?pro=1 で解放してください。');
    return false;
  };
  const download = (name, text, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const textOf = (...ids) => ids.map((id) => $(id)?.value || $(id)?.textContent || '').filter(Boolean).join('\n\n');
  const stamp = () => new Date().toISOString().slice(0, 10);
  function addButton(afterId, label, onClick) {
    const after = $(afterId);
    if (!after || $('nwProBtn_' + afterId)) return;
    const btn = document.createElement('button');
    btn.id = 'nwProBtn_' + afterId;
    btn.type = 'button';
    btn.className = 'btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick, true);
    after.parentNode.appendChild(btn);
  }
  function init() {
    activate();
    status();
    if (slug === 'incident-update-generator') addButton('downloadBtn', 'Pro: Save Markdown pack', (e) => { if (!guard(e)) return; download('incident-update-pro-' + stamp() + '.md', '# Incident Update Pro Pack\n\n' + textOf('outputCustomerJa','outputInternalJa','outputSocialJa','outputCustomerEn','outputInternalEn','outputSocialEn'), 'text/markdown;charset=utf-8'); });
    if (slug === 'membership-offer-builder') addButton('copyOfferBtn', 'Pro: Save Markdown', (e) => { if (!guard(e)) return; const out = $('offerOutput')?.value || ''; if (!out.trim()) return toast('先に提案を作成してください。'); download('membership-offer-pro-' + stamp() + '.md', out, 'text/markdown;charset=utf-8'); });
    if (slug === 'moving-lease-final-check') ['btnSaveTxt','btnPrint'].forEach((id) => $(id)?.addEventListener('click', guard, true));
    if (slug === 'contract-risk-highlighter') ['downloadMdBtn','downloadPdfBtn'].forEach((id) => $(id)?.addEventListener('click', guard, true));
    if (slug === 'outsource-spec-generator') ['packBtn','exportBtn'].forEach((id) => $(id)?.addEventListener('click', guard, true));
    if (slug === 'lp-skeleton-generator') ['downloadMd','downloadHtml'].forEach((id) => $(id)?.addEventListener('click', guard, true));
    if (slug === 'ats-paste-doctor') {
      const buy = $('buyProLink'); if (buy) { buy.href = STRIPE_URL; buy.removeAttribute('aria-disabled'); buy.removeAttribute('tabindex'); }
      ['proCard','proTools'].forEach((id) => { const el = $(id); if (el) { el.hidden = false; el.removeAttribute('aria-hidden'); } });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
