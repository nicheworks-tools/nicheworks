(() => {
  'use strict';
  const PRODUCT = 'okj.toolkit_pro';
  const parts = location.pathname.split('/').filter(Boolean);
  const slug = parts[0] === 'tools' ? parts[1] : '';
  const strings = {
    ja: {
      heading: 'Old Kanji Toolkit Pro',
      lead: '複数件の一括処理・保存・案件整理のためのProです。現在の無料機能とAmazon資料案内はそのままです。',
      buy: 'Old Kanji Toolkit Proを購入',
      active: 'Pro利用権利を確認しました',
      busy: '安全な決済ページを準備しています…',
      failure: '決済を開始できませんでした。後ほどお試しください。',
      disclaimer: '決済はStripeで行われます。氏名・入力内容・OCR本文は送信しません。',
      priceLabel: '買い切り'
    },
    en: {
      heading: 'Old Kanji Toolkit Pro',
      lead: 'Batch, saved research and workspaces. Existing Free tools and Amazon resources remain unchanged.',
      buy: 'Buy Old Kanji Toolkit Pro',
      active: 'Pro entitlement verified',
      busy: 'Opening secure checkout…',
      failure: 'Checkout is currently unavailable. Please try again later.',
      disclaimer: 'Payment is handled by Stripe. Tool input, names and OCR text are not sent.',
      priceLabel: 'one-time'
    }
  };
  function locale() { return String(document.documentElement.lang || 'ja').startsWith('en') ? 'en' : 'ja'; }
  function copy(name) { return strings[locale()][name]; }
  function visible(el) {
    if (!el || el.hidden) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }
  function enabled(rule) {
    if (!rule || rule.type === 'always') return true;
    const el = document.querySelector(rule.selector);
    if (!el) return false;
    if (rule.type === 'visible') return visible(el);
    if (rule.type === 'content') return el.childElementCount > 0 || String(el.textContent || '').trim().length > 0;
    if (rule.type === 'visible-content') return visible(el) && (el.childElementCount > 0 || String(el.textContent || '').trim().length > 0);
    return false;
  }
  async function boot() {
    const catalog = window.NWOldKanjiAmazonContextCatalog?.[slug];
    if (!catalog || !window.NicheWorksProEntitlement) return;

    // A hidden/unapproved product is never advertised to Free users.
    let available;
    try {
      const response = await fetch('/api/billing/product-availability?productId=' + encodeURIComponent(PRODUCT), { cache: 'no-store' });
      if (!response.ok) return;
      available = await response.json();
    } catch { return; }
    if (available?.productId !== PRODUCT || available.available !== true || !available.price?.currency) return;

    const panel = document.createElement('section');
    panel.className = 'old-kanji-pro-sales';
    panel.dataset.okjProState = 'for-sale';
    panel.setAttribute('aria-label','Old Kanji Toolkit Pro checkout');
    panel.hidden = true;

    const heading = document.createElement('h2');
    const lead = document.createElement('p');
    const price = document.createElement('p');
    const button = document.createElement('button');
    const detail = document.createElement('p');
    const status = document.createElement('p');
    status.setAttribute('aria-live','polite');
    button.type='button';
    button.setAttribute('data-okj-pro-cta','');
    panel.append(heading,lead,price,button,detail,status);

    const anchor = document.querySelector('.old-kanji-amazon-panel') ||
      document.querySelector(catalog.anchor)?.closest('section') ||
      document.querySelector(catalog.anchor);
    if (anchor) anchor.after(panel);
    else (document.querySelector('main') || document.body).append(panel);

    let purchased = false;
    try {
      const verified = await window.NicheWorksProEntitlement.refreshProState({productId:PRODUCT});
      purchased = Boolean(verified.active);
    } catch { purchased = false; }

    function render() {
      panel.hidden = !enabled(catalog.activation);
      if (panel.hidden) return;
      heading.textContent = copy('heading');
      lead.textContent = copy('lead');
      const amount = Number(available.price.amount);
      const formatted = new Intl.NumberFormat(locale()==='ja'?'ja-JP':'en-US',{
        style:'currency',currency:available.price.currency
      }).format(amount);
      price.textContent = formatted + ' · ' + copy('priceLabel');
      button.hidden = purchased;
      button.textContent = purchased ? copy('active') : copy('buy');
      detail.textContent = copy('disclaimer');
      if (purchased) status.textContent = copy('active');
    }
    button.addEventListener('click', async () => {
      if (purchased || button.disabled || panel.hidden) return;
      button.disabled = true;
      status.textContent = copy('busy');
      try {
        const response = await fetch('/api/billing/create-checkout-session',{
          method:'POST',headers:{'content-type':'application/json'},
          body:JSON.stringify({productId:PRODUCT,returnPath:location.pathname})
        });
        const data = await response.json();
        if (!response.ok || !data.ok || typeof data.url !== 'string') throw new Error('checkout_rejected');
        const checkout = new URL(data.url);
        if (checkout.protocol !== 'https:' || checkout.hostname !== 'checkout.stripe.com') throw new Error('invalid_checkout_domain');
        location.assign(checkout.href);
      } catch {
        status.textContent = copy('failure');
        button.disabled = false;
      }
    });
    function rerender() { queueMicrotask(render); }
    document.addEventListener('input', rerender, true);
    document.addEventListener('change', rerender, true);
    document.addEventListener('click', () => { setTimeout(render, 40); setTimeout(render, 350); }, true);
    const active = catalog.activation?.selector ? document.querySelector(catalog.activation.selector) : null;
    if (active) new MutationObserver(rerender).observe(active,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
    new MutationObserver(rerender).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();