(function () {
  const root = document.body;
  if (!root) return;

  const lang = root.dataset.lang || 'en';
  const app = root.querySelector('[data-ui-atlas-root]');
  if (!app) return;
  app.classList.remove('detail-open');

  const labels = {
    en: {
      shown: (count) => `${count} patterns shown`,
      remove: 'Remove',
      compareFull: 'Compare tray is full (max 2). Remove one item first.',
      copied: 'Prompt copied.',
      copyFailed: 'Copy failed. Please copy manually.',
      favoriteOn: '★ Favorited',
      favoriteOff: '☆ Favorite',
      noFavorites: 'No favorites yet.',
      noRecent: 'No recent views yet.',
      compareDiff: 'Readable comparison',
      compareDecision: 'Decision hint',
      purpose: 'Purpose',
      mobile: 'Mobile fit',
      difficulty: 'Difficulty',
      openDetail: 'Open detail',
      addCompare: 'Add compare',
      sample: 'Live sample',
      compareBetter: 'Best for',
      compareAvoid: 'Avoid when',
      compareChoose: (name) => `Choose ${name} when`,
      compareInstead: (name) => `Use ${name} instead when`,
      categoryNames: {
        acquisition: 'Acquisition',
        navigation: 'Navigation',
        'disclosure-feedback': 'Disclosure & feedback',
        'inputs-forms': 'Inputs & forms',
        'data-display': 'Data display',
        'layout-structure': 'Layout & structure'
      },
      mobileNames: { high: 'High', medium: 'Medium', low: 'Low' },
      difficultyNames: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
      purposeNames: {
        confirmation: 'Confirmation / risky action',
        'quick-action': 'Quick action',
        'content-discovery': 'Content discovery',
        'mode-switch': 'Mode switch'
      }
    },
    ja: {
      shown: (count) => `${count} 件表示`,
      remove: '削除',
      compareFull: '比較トレイは2件までです。1件削除してから追加してください。',
      copied: 'プロンプトをコピーしました。',
      copyFailed: 'コピーに失敗しました。手動でコピーしてください。',
      favoriteOn: '★ お気に入り済み',
      favoriteOff: '☆ お気に入り',
      noFavorites: 'お気に入りはまだありません。',
      noRecent: '最近見た項目はまだありません。',
      compareDiff: '実用比較',
      compareDecision: '選び方の目安',
      purpose: '用途',
      mobile: 'モバイル適性',
      difficulty: '実装難易度',
      openDetail: '詳細',
      addCompare: '比較に追加',
      sample: 'ライブサンプル',
      compareBetter: '向いている場面',
      compareAvoid: '避けたい場面',
      compareChoose: (name) => `${name}を選ぶ場面`,
      compareInstead: (name) => `${name}より他を優先する場面`,
      categoryNames: {
        acquisition: '集客・CV',
        navigation: 'ナビゲーション',
        'disclosure-feedback': '開示・フィードバック',
        'inputs-forms': '入力フォーム',
        'data-display': '情報表示',
        'layout-structure': 'レイアウト構成'
      },
      mobileNames: { high: '高い', medium: '中', low: '低い' },
      difficultyNames: { easy: '易しい', medium: '中', hard: '難しい' },
      purposeNames: {
        confirmation: '確認・リスク操作',
        'quick-action': '短い操作',
        'content-discovery': '情報探索',
        'mode-switch': 'モード切替'
      }
    }
  };
  const t = labels[lang] || labels.en;
  const sampleFallbackText = {
    en: {
      cardNote: 'Sample preview is temporarily unavailable.',
      detailNote: 'Sample preview is temporarily unavailable. Detail guidance below remains available.'
    },
    ja: {
      cardNote: 'サンプルプレビューを一時的に表示できません。',
      detailNote: 'サンプルプレビューを一時的に表示できません。下の詳細テキストは引き続き確認できます。'
    }
  };
  const sampleFallback = sampleFallbackText[lang] || sampleFallbackText.en;

  const search = app.querySelector('[data-search]');
  const categoryChips = Array.from(app.querySelectorAll('[data-filter-group="category"]'));
  const selectFilters = Array.from(app.querySelectorAll('[data-select-filter]'));
  const gridEl = app.querySelector('.result-grid');
  const countEl = app.querySelector('[data-count]');
  const compareList = app.querySelector('[data-compare-list]');
  const compareEmpty = app.querySelector('[data-compare-empty]');
  const compareDiff = app.querySelector('[data-compare-diff]');
  const favoritesList = app.querySelector('[data-favorites-list]');
  const recentList = app.querySelector('[data-recent-list]');
  const copyState = app.querySelector('[data-copy-state]');

  const detailEls = {
    title: app.querySelector('[data-detail-title]'),
    sample: app.querySelector('[data-detail-sample]'),
    what: app.querySelector('[data-detail-what]'),
    useCase: app.querySelector('[data-detail-use-case]'),
    best: app.querySelector('[data-detail-best]'),
    notFor: app.querySelector('[data-detail-not-for]'),
    similar: app.querySelector('[data-detail-similar]'),
    practicalIntent: app.querySelector('[data-detail-practical-intent]'),
    novice: app.querySelector('[data-detail-novice]'),
    prompt: app.querySelector('[data-detail-prompt]'),
    implementation: app.querySelector('[data-detail-implementation]'),
    favBtn: app.querySelector('[data-toggle-favorite]')
  };

  const storage = {
    favorites: `ui-atlas:${lang}:favorites`,
    recent: `ui-atlas:${lang}:recent`
  };

  const safeJsonParse = (value, fallback) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  };

  let activeCategory = 'all';
  let activeFilters = { purpose: 'all', mobileFit: 'all', difficulty: 'all' };
  let compareIds = [];
  let currentId = null;
  let favorites = safeJsonParse(localStorage.getItem(storage.favorites), []);
  let recent = safeJsonParse(localStorage.getItem(storage.recent), []);

  let cards = [];
  let records = [];
  let byId = new Map();
  let bySlug = new Map();

  const badge = (text) => `<span class="mini-badge">${text}</span>`;

  function normalizeRecord(pattern) {
    const useJa = lang === 'ja';
    return {
      id: pattern.id,
      slug: pattern.slug,
      name: useJa ? pattern.name_ja : pattern.name_en,
      nameJa: pattern.name_ja,
      aliases: [...(pattern.aliases_en || []), ...(pattern.aliases_ja || [])].join(', '),
      novice: useJa ? pattern.novice_wording_ja : pattern.novice_wording_en,
      usecase: useJa ? pattern.use_case_ja : pattern.use_case_en,
      practicalIntent: useJa ? pattern.practical_intent_ja : pattern.practical_intent_en,
      summary: useJa ? pattern.summary_short_ja : pattern.summary_short_en,
      best: useJa ? pattern.best_for_ja : pattern.best_for_en,
      notFor: useJa ? pattern.not_for_ja : pattern.not_for_en,
      prompt: useJa ? pattern.short_prompt_ja : pattern.short_prompt_en,
      notes: useJa ? pattern.short_impl_note_ja : pattern.short_impl_note_en,
      category: pattern.category,
      purpose: pattern.purpose,
      mobileFit: pattern.mobile_fit,
      difficulty: pattern.difficulty,
      similarSlugs: pattern.similar_patterns || [],
      sampleType: pattern.sample_type || 'card-list',
      sampleVariant: pattern.sample_variant || 'default',
      sampleConfig: pattern.sample_config || {}
    };
  }

  function sampleMarkup(record, large) {
    const compact = large ? '' : 'mini';
    const p = (a, b) => (lang === 'ja' ? b : a);
    const cfg = record.sampleConfig || {};
    const c = (key, fallbackEn, fallbackJa) => {
      const localized = cfg[`${key}_${lang}`];
      if (typeof localized === 'string' && localized.trim()) return localized.trim();
      const raw = cfg[key];
      if (typeof raw === 'string' && raw.trim()) return raw.trim();
      return p(fallbackEn, fallbackJa);
    };
    let core = '';
    switch (record.sampleType) {
      case 'modal': core = `<button class="mini-btn" data-sample-open="modal">${c('trigger', 'Open modal', 'モーダルを開く')}</button><div class="sample-modal" data-sample-modal><div class="sample-modal-card"><h4>${c('title', 'Confirm publish', '公開確認')}</h4><p>${c('body', 'This is a working modal sample.', '実際に動くモーダルサンプルです。')}</p><button class="mini-btn" data-sample-close>${c('close', 'Close', '閉じる')}</button></div></div>`; break;
      case 'bottom-sheet': core = `<button class="mini-btn" data-sample-open="sheet">${c('trigger', 'Open sheet', 'シートを開く')}</button><div class="sample-sheet" data-sample-sheet><div class="sheet-handle"></div><p>${c('body', 'Bottom sheet content', 'ボトムシート内容')}</p><button class="mini-btn" data-sample-close>${c('close', 'Done', '閉じる')}</button></div>`; break;
      case 'accordion': core = `<div class="sample-acc"><button data-sample-acc>${p('Why use this?', 'なぜ使う?')}</button><div>${p('Shows and hides content interactively.', '内容を開閉して表示できます。')}</div><button data-sample-acc>${p('Mobile behavior', 'モバイル挙動')}</button><div>${p('Tap again to collapse.', '再タップで閉じます。')}</div></div>`; break;
      case 'tabs': core = `<div class="sample-tabs"><div><button data-tab="a" class="is-on">${p('Overview', '概要')}</button><button data-tab="b">${p('Specs', '仕様')}</button></div><p data-tab-panel>${p('Overview content', '概要コンテンツ')}</p></div>`; break;
      case 'segmented': core = `<div class="sample-segmented"><button class="is-on">A</button><button>B</button><button>C</button></div>`; break;
      case 'tooltip': core = `<button class="mini-btn tooltip-anchor" data-tooltip>${c('trigger', 'Hover/focus me', 'ホバー/フォーカス')}</button><span class="sample-tooltip">${c('text', 'Real tooltip', 'ツールチップ')}</span>`; break;
      case 'popover': core = `<button class="mini-btn" data-sample-pop>${c('trigger', 'Toggle popover', 'ポップオーバー')}</button><div class="sample-popover" data-popover>${c('body', 'Anchored popover panel', 'アンカー付きパネル')}</div>`; break;
      case 'toast': core = `<button class="mini-btn" data-sample-toast>${c('trigger', 'Show toast', 'トースト表示')}</button><div class="sample-toast" data-toast>${c('body', 'Saved successfully', '保存しました')}</div>`; break;
      case 'select': core = `<label>${p('Plan', 'プラン')}<select><option>Free</option><option>Pro</option></select></label>`; break;
      case 'checkbox': core = `<label><input type="checkbox" checked> ${p('Email updates', '更新通知')}</label><label><input type="checkbox"> ${p('SMS alerts', 'SMS通知')}</label>`; break;
      case 'radio': core = `<label><input type="radio" name="r-${record.id}" checked> ${p('Monthly', '月額')}</label><label><input type="radio" name="r-${record.id}"> ${p('Yearly', '年額')}</label>`; break;
      case 'switch': core = `<button class="switch" data-switch aria-pressed="false"><span></span></button>`; break;
      case 'otp': core = `<div class="otp">${'<input maxlength="1" inputmode="numeric">'.repeat(6)}</div>`; break;
      case 'pricing': core = `<div class="sample-pricing"><article><h4>Free</h4><strong>$0</strong></article><article class="is-on"><h4>Pro</h4><strong>$19</strong></article><article><h4>Team</h4><strong>$49</strong></article></div>`; break;
      case 'comparison': core = `<table class="sample-table"><tr><th>Feature</th><th>A</th><th>B</th></tr><tr><td>Export</td><td>✓</td><td>✓</td></tr><tr><td>Team</td><td>-</td><td>✓</td></tr></table>`; break;
      case 'hero': core = `<section class="sample-hero"><h4>${c('title', 'Launch faster', 'より速く立ち上げ')}</h4><p>${c('body', 'Ship with confidence.', '安心して公開。')}</p><button class="mini-btn">${c('cta', 'Start now', '始める')}</button></section>`; break;
      case 'feature-list': core = `<ul class="sample-features"><li>${badge('⚡')} Fast setup</li><li>${badge('🔒')} Secure defaults</li><li>${badge('📈')} Better metrics</li></ul>`; break;
      case 'cta': core = `<div class="sample-cta"><p>${c('body', 'Ready to improve conversion?', 'コンバージョンを改善しますか?')}</p><button class="mini-btn">${c('cta', 'Try free', '無料で試す')}</button></div>`; break;
      case 'empty-state': core = `<div class="sample-empty"><strong>${c('title', 'No items yet', 'データがありません')}</strong><button class="mini-btn">${c('cta', 'Create one', '作成')}</button></div>`; break;
      case 'skeleton': core = `<div class="sample-skeleton"><span></span><span></span><span></span></div>`; break;
      case 'progress': core = `<div class="sample-progress"><div style="width:${large ? 62 : 45}%"></div></div>`; break;
      case 'alert': core = `<p class="sample-alert">${p('Warning: Unsaved changes', '警告: 未保存の変更があります')}</p>`; break;
      case 'drawer': core = `<button class="mini-btn" data-sample-open="drawer">${c('trigger', 'Open drawer', 'ドロワー開く')}</button><aside class="sample-drawer" data-sample-drawer><button data-sample-close>×</button><p>${c('item_1', 'Filters', '絞り込み')}</p><p>${c('item_2', 'Sort by newest', '新着順')}</p></aside>`; break;
      case 'sidebar': core = `<div class="sample-split"><aside><p>Inbox</p><p>Draft</p></aside><section><p>${p('Main content', 'メイン')}</p></section></div>`; break;
      case 'hamburger': core = `<button class="mini-btn" data-sample-open="ham">${c('trigger', '☰', '☰')}</button><div class="sample-ham" data-sample-ham><a href="#">${c('item_1', 'Docs', 'ドキュメント')}</a><a href="#">${c('item_2', 'Pricing', '料金')}</a><a href="#">${c('item_3', 'Account', 'アカウント')}</a></div>`; break;
      case 'fab': core = `<div class="sample-fixed"><button class="sample-fab">＋</button></div>`; break;
      case 'sticky-cta': core = `<div class="sample-fixed"><div class="sample-sticky-cta"><span>${p('Limited offer', '期間限定')}</span><button class="mini-btn">${p('Join', '参加')}</button></div></div>`; break;
      case 'navbar': core = `<nav class="sample-navbar"><a class="is-on">Home</a><a>Docs</a><a>Pricing</a></nav>`; break;
      case 'breadcrumb': core = `<nav class="sample-bc"><span>Home</span>›<span>Library</span>›<strong>UI Atlas</strong></nav>`; break;
      case 'pagination': core = `<div class="sample-pagination"><button>‹</button><button class="is-on">1</button><button>2</button><button>3</button><button>›</button></div>`; break;
      case 'tab-bar': core = `<nav class="sample-tabbar"><button class="is-on">🏠</button><button>🔎</button><button>⭐</button><button>⚙️</button></nav>`; break;
      case 'text-input': core = `<label>${c('label', 'Work email', '仕事用メール')}<input type="email" placeholder="${c('placeholder', 'name@company.com', 'name@company.com')}"></label>`; break;
      case 'textarea': core = `<label>${c('label', 'Issue details', '問題の詳細')}<textarea rows="2">${c('value', 'Steps to reproduce the issue...', '再現手順を入力してください...')}</textarea></label>`; break;
      case 'combobox': core = `<label>${c('label', 'Assign member', '担当者を選択')}<input list="cb-${record.id}" placeholder="${c('placeholder', 'Type a name', '名前で検索')}"><datalist id="cb-${record.id}"><option>${c('opt_1', 'Aiko Tanaka', '田中 愛子')}</option><option>${c('opt_2', 'Ken Watanabe', '渡辺 健')}</option><option>${c('opt_3', 'Mina Sato', '佐藤 美奈')}</option></datalist></label>`; break;
      case 'date-picker': core = `<label>${p('Date', '日付')}<input type="date"></label>`; break;
      case 'validation': core = `<label>${c('label', 'Username', 'ユーザー名')}<input value="${c('value', 'ab', 'ab')}"><small>${c('hint', 'Must be at least 3 characters.', '3文字以上で入力してください。')}</small></label>`; break;
      case 'step-form': core = `<div class="sample-steps"><span class="is-on">1</span><span>2</span><span>3</span><p>${p('Step 1: Account', 'ステップ1: アカウント')}</p></div>`; break;
      case 'contact': core = `<form class="sample-contact"><input placeholder="Name"><input placeholder="Email"><button class="mini-btn">Send</button></form>`; break;
      case 'testimonial': core = `<blockquote class="sample-testimonial">“${c('quote', 'We cut weekly reporting time from 4 hours to 35 minutes.', '週次レポート作成時間が4時間から35分になりました。')}”<cite>— ${c('author', 'Ops Manager, Northwind', 'Northwind社 オペレーション責任者')}</cite></blockquote>`; break;
      case 'footer': core = `<footer class="sample-footer"><a>Terms</a><a>Privacy</a><a>Contact</a></footer>`; break;
      case 'carousel': core = `<div class="sample-carousel"><button data-carousel="prev">‹</button><div data-carousel-track><span class="is-on">1</span><span>2</span><span>3</span></div><button data-carousel="next">›</button></div>`; break;
      case 'timeline': core = `<ol class="sample-timeline"><li><strong>Plan</strong></li><li><strong>Build</strong></li><li><strong>Ship</strong></li></ol>`; break;
      case 'table': core = `<table class="sample-table"><tr><th>${c('h1', 'User', 'ユーザー')}</th><th>${c('h2', 'Role', '権限')}</th></tr><tr><td>${c('r1c1', 'Ana', '山田')}</td><td>${c('r1c2', 'Admin', '管理者')}</td></tr><tr><td>${c('r2c1', 'Ken', '佐藤')}</td><td>${c('r2c2', 'Editor', '編集者')}</td></tr></table>`; break;
      case 'list-view': core = `<ul class="sample-list"><li>${c('item_1', 'Invoice #1024 · Overdue', '請求 #1024 ・期限超過')}</li><li>${c('item_2', 'Contract renewal · Due Friday', '契約更新 ・金曜期限')}</li><li>${c('item_3', 'New lead · Requested demo', '新規リード ・デモ希望')}</li></ul>`; break;
      case 'card-list': core = `<div class="sample-grid"><span>${c('mini_label', 'Card A', 'カードA')}</span><span>${p('Card B', 'カードB')}</span><span>${p('Card C', 'カードC')}</span><span>${p('Card D', 'カードD')}</span></div>`; break;
      case 'grid-layout': core = `<div class="sample-grid"><span></span><span></span><span></span><span></span></div>`; break;
      case 'split-view': core = `<div class="sample-split"><aside>${c('left', 'Project files', 'プロジェクト一覧')}</aside><section>${c('right', 'Selected file preview', '選択ファイルのプレビュー')}</section></div>`; break;
      case 'sticky-sidebar': core = `<div class="sample-sticky"><main>${c('main', 'Long article body', '長文本文')}</main><aside>${c('side', 'Sticky table of contents', '追従目次')}</aside></div>`; break;
      case 'spinner':
      default:
        core = `<div class="sample-spinner ${compact}"></div>`;
    }
    if (!large) return core;
    return `<div class="sample-detail-guide"><p><strong>${p('Scenario', '想定シーン')}</strong>: ${c('context', record.usecase, record.usecase)}</p><p><strong>${p('Watch for', '確認ポイント')}</strong>: ${c('focus', record.practicalIntent, record.practicalIntent)}</p></div>${core}<p class="sample-detail-tip">${p('Tip: interact with this sample to see practical behavior.', 'ヒント: このサンプルを操作して、実務での動きを確認してください。')}</p>`;
  }

  function wireSampleInteractions(host) {
    host.querySelectorAll('[data-sample-acc]').forEach((btn) => {
      btn.addEventListener('click', () => btn.classList.toggle('is-open'));
    });
    host.querySelectorAll('.sample-acc button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = btn.nextElementSibling;
        if (panel) panel.classList.toggle('is-open');
      });
    });
    host.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.sample-tabs');
        wrap?.querySelectorAll('[data-tab]').forEach((el) => el.classList.remove('is-on'));
        btn.classList.add('is-on');
        const panel = wrap?.querySelector('[data-tab-panel]');
        if (panel) panel.textContent = btn.dataset.tab === 'a' ? (lang === 'ja' ? '概要コンテンツ' : 'Overview content') : (lang === 'ja' ? '仕様コンテンツ' : 'Specs content');
      });
    });
    host.querySelectorAll('.sample-segmented button').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.parentElement?.querySelectorAll('button').forEach((el) => el.classList.remove('is-on'));
        btn.classList.add('is-on');
      });
    });
    host.querySelectorAll('[data-sample-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-sample-open');
        const map = { modal: '[data-sample-modal]', sheet: '[data-sample-sheet]', drawer: '[data-sample-drawer]', ham: '[data-sample-ham]' };
        const panel = host.querySelector(map[type] || '');
        panel?.classList.add('is-open');
      });
    });
    host.querySelectorAll('[data-sample-close]').forEach((btn) => btn.addEventListener('click', () => {
      host.querySelectorAll('.is-open').forEach((node) => node.classList.remove('is-open'));
    }));
    host.querySelectorAll('[data-sample-modal]').forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.remove('is-open');
      });
    });
    host.querySelectorAll('[data-sample-pop]').forEach((btn) => btn.addEventListener('click', () => {
      host.querySelector('[data-popover]')?.classList.toggle('is-open');
    }));
    host.querySelectorAll('[data-sample-toast]').forEach((btn) => btn.addEventListener('click', () => {
      const toast = host.querySelector('[data-toast]');
      if (!toast) return;
      toast.classList.add('is-open');
      window.setTimeout(() => toast.classList.remove('is-open'), 1200);
    }));
    host.querySelectorAll('[data-switch]').forEach((btn) => btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!on));
      btn.classList.toggle('is-on', !on);
    }));
    host.querySelectorAll('[data-carousel]').forEach((btn) => btn.addEventListener('click', () => {
      const track = host.querySelector('[data-carousel-track]');
      if (!track) return;
      const items = Array.from(track.querySelectorAll('span'));
      const active = items.findIndex((el) => el.classList.contains('is-on'));
      const dir = btn.getAttribute('data-carousel') === 'next' ? 1 : -1;
      const next = (active + dir + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('is-on', i === next));
    }));
  }

  function renderSample(container, record, large) {
    if (!container) return;
    container.innerHTML = `<div class="sample-shell ${large ? 'sample-large' : 'sample-mini'}" data-sample-shell>${sampleMarkup(record, large)}</div>`;
    wireSampleInteractions(container);
  }

  function renderSampleFallback(container, record, large) {
    if (!container || !record) return;
    const fallbackNote = large ? sampleFallback.detailNote : sampleFallback.cardNote;
    container.innerHTML = `
      <div class="sample-shell ${large ? 'sample-large' : 'sample-mini'} sample-fallback-shell">
        <div class="sample-fallback" role="status" aria-live="polite">
          <strong>${record.name}</strong>
          <p>${fallbackNote}</p>
        </div>
      </div>
    `;
  }

  function renderSampleSafely(container, record, large) {
    try {
      renderSample(container, record, large);
      return true;
    } catch (_error) {
      renderSampleFallback(container, record, large);
      return false;
    }
  }

  function createCard(record) {
    const article = document.createElement('article');
    article.className = 'pattern-card';
    article.dataset.card = '';
    Object.assign(article.dataset, {
      id: record.id,
      name: record.name,
      nameJa: record.nameJa,
      aliases: record.aliases,
      novice: record.novice,
      usecase: record.usecase,
      practicalIntent: record.practicalIntent,
      category: record.category,
      purpose: record.purpose,
      mobileFit: record.mobileFit,
      difficulty: record.difficulty,
      summary: record.summary,
      best: record.best,
      notFor: record.notFor,
      prompt: record.prompt,
      notes: record.notes,
      slug: record.slug
    });

    article.innerHTML = `
      <h3>${record.name}</h3>
      <p>${record.summary}</p>
      <div class="card-sample-wrap">
        <div class="sample-label">${t.sample}</div>
        <div class="card-sample" data-card-sample></div>
      </div>
      <div class="card-meta">
        <span class="meta-tag">${t.categoryNames[record.category] || record.category}</span>
        <span class="meta-tag">${t.mobile}: ${t.mobileNames[record.mobileFit] || record.mobileFit}</span>
        <span class="meta-tag">${t.difficulty}: ${t.difficultyNames[record.difficulty] || record.difficulty}</span>
      </div>
      <div class="card-actions">
        <button class="btn" data-open-detail type="button">${t.openDetail}</button>
        <button class="btn primary" data-add-compare type="button">${t.addCompare}</button>
      </div>
    `;
    renderSampleSafely(article.querySelector('[data-card-sample]'), record, false);
    return article;
  }

  function cardData(card) {
    return {
      id: card.dataset.id || '', name: card.dataset.name || '', nameJa: card.dataset.nameJa || '', aliases: card.dataset.aliases || '',
      novice: card.dataset.novice || '', usecase: card.dataset.usecase || '', practicalIntent: card.dataset.practicalIntent || '',
      summary: card.dataset.summary || '', best: card.dataset.best || '', notFor: card.dataset.notFor || '', prompt: card.dataset.prompt || '',
      notes: card.dataset.notes || '', category: card.dataset.category || '', purpose: card.dataset.purpose || '',
      mobileFit: card.dataset.mobileFit || '', difficulty: card.dataset.difficulty || '', slug: card.dataset.slug || ''
    };
  }

  function saveLocal() {
    localStorage.setItem(storage.favorites, JSON.stringify(favorites.slice(0, 5)));
    localStorage.setItem(storage.recent, JSON.stringify(recent.slice(0, 8)));
  }
  function updateCount(visible) { if (countEl) countEl.textContent = t.shown(visible); }
  function setFavoriteButtonState(id) { if (detailEls.favBtn) detailEls.favBtn.textContent = favorites.includes(id) ? t.favoriteOn : t.favoriteOff; }
  function addRecent(id) { recent = [id, ...recent.filter((item) => item !== id)].slice(0, 8); saveLocal(); renderRecents(); }

  function renderMiniList(target, ids, emptyText) {
    if (!target) return;
    target.innerHTML = '';
    if (!ids.length) {
      const p = document.createElement('p');
      p.className = 'muted-small';
      p.textContent = emptyText;
      target.appendChild(p);
      return;
    }
    ids.forEach((id) => {
      const card = byId.get(id);
      if (!card) return;
      const button = document.createElement('button');
      button.className = 'mini-item';
      button.type = 'button';
      button.textContent = card.dataset.name || '';
      button.addEventListener('click', function () { openDetail(card); });
      target.appendChild(button);
    });
  }

  function renderFavorites() { renderMiniList(favoritesList, favorites, t.noFavorites); }
  function renderRecents() { renderMiniList(recentList, recent, t.noRecent); }

  function renderCompare() {
    if (!compareList || !compareEmpty || !compareDiff) return;
    compareList.innerHTML = '';
    if (!compareIds.length) {
      compareEmpty.hidden = false;
      compareDiff.hidden = true;
      compareDiff.innerHTML = '';
      return;
    }

    compareEmpty.hidden = true;
    compareIds.forEach((id) => {
      const card = byId.get(id);
      if (!card) return;
      const data = cardData(card);
      const item = document.createElement('div');
      item.className = 'compare-item';
      item.innerHTML = `<strong>${data.name}</strong><button class="btn" type="button">${t.remove}</button>`;
      item.querySelector('button')?.addEventListener('click', () => toggleCompare(card));
      compareList.appendChild(item);
    });

    if (compareIds.length === 2) {
      const left = cardData(byId.get(compareIds[0]));
      const right = cardData(byId.get(compareIds[1]));
      const mobileLeft = t.mobileNames[left.mobileFit] || left.mobileFit;
      const mobileRight = t.mobileNames[right.mobileFit] || right.mobileFit;
      const diffLeft = t.difficultyNames[left.difficulty] || left.difficulty;
      const diffRight = t.difficultyNames[right.difficulty] || right.difficulty;
      const score = (item, other) => {
        let points = 0;
        if (item.mobileFit === 'high') points += 2;
        else if (item.mobileFit === 'medium') points += 1;
        if (item.difficulty === 'easy') points += 2;
        else if (item.difficulty === 'medium') points += 1;
        if (item.purpose === other.purpose) points += 1;
        return points;
      };
      const leftScore = score(left, right);
      const rightScore = score(right, left);
      const decisionLine = leftScore === rightScore
        ? `${t.compareChoose(left.name)} ${left.best} / ${t.compareChoose(right.name)} ${right.best}`
        : leftScore > rightScore
          ? `${t.compareChoose(left.name)} ${left.best}`
          : `${t.compareChoose(right.name)} ${right.best}`;
      compareDiff.hidden = false;
      compareDiff.innerHTML = `
        <h4>${t.compareDiff}: ${left.name} × ${right.name}</h4>
        <ul>
          <li><strong>${t.compareChoose(left.name)}</strong> ${left.best}</li>
          <li><strong>${t.compareInstead(left.name)}</strong> ${left.notFor}</li>
          <li><strong>${t.compareChoose(right.name)}</strong> ${right.best}</li>
          <li><strong>${t.compareInstead(right.name)}</strong> ${right.notFor}</li>
          <li><strong>${t.purpose}</strong>: ${left.name} ${(t.purposeNames[left.purpose] || left.purpose)} / ${right.name} ${(t.purposeNames[right.purpose] || right.purpose)}</li>
          <li><strong>${t.mobile}</strong>: ${left.name} ${mobileLeft} / ${right.name} ${mobileRight}</li>
          <li><strong>${t.difficulty}</strong>: ${left.name} ${diffLeft} / ${right.name} ${diffRight}</li>
          <li><strong>${t.compareDecision}</strong>: ${decisionLine}</li>
        </ul>
      `;
    } else {
      compareDiff.hidden = true;
      compareDiff.innerHTML = '';
    }
  }

  function refreshCompareButtons() {
    cards.forEach((card) => {
      const btn = card.querySelector('[data-add-compare]');
      if (!btn) return;
      btn.classList.toggle('active', compareIds.includes(card.dataset.id || ''));
    });
  }

  function openDetail(card) {
    const data = cardData(card);
    currentId = data.id;
    detailEls.title.textContent = data.name;
    detailEls.what.textContent = data.summary;
    detailEls.useCase.textContent = data.usecase;
    detailEls.best.textContent = data.best;
    detailEls.notFor.textContent = data.notFor;

    const matched = bySlug.get(data.slug);
    if (matched?.similarSlugs.length) {
      const names = matched.similarSlugs.map((slug) => bySlug.get(slug)?.name || slug).join(', ');
      detailEls.similar.textContent = names;
    } else {
      detailEls.similar.textContent = '-';
    }

    detailEls.prompt.textContent = data.prompt;
    detailEls.practicalIntent.textContent = data.practicalIntent;
    detailEls.novice.textContent = data.novice;
    detailEls.implementation.textContent = data.notes;
    setFavoriteButtonState(currentId);
    addRecent(currentId);
    app.classList.add('detail-open');
    if (matched) renderSampleSafely(detailEls.sample, matched, true);
    else renderSampleFallback(detailEls.sample, data, true);
  }

  async function copyPrompt() {
    if (!currentId) return;
    const card = byId.get(currentId);
    const prompt = card?.dataset.prompt || '';
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      if (copyState) copyState.textContent = t.copied;
    } catch (_error) {
      if (copyState) copyState.textContent = t.copyFailed;
    }
  }

  function toggleCompare(card) {
    const id = card.dataset.id || '';
    if (!id) return;
    if (compareIds.includes(id)) compareIds = compareIds.filter((item) => item !== id);
    else if (compareIds.length < 2) compareIds.push(id);
    else { if (copyState) copyState.textContent = t.compareFull; return; }
    refreshCompareButtons();
    renderCompare();
  }

  function toggleFavorite() {
    if (!currentId) return;
    favorites = favorites.includes(currentId) ? favorites.filter((id) => id !== currentId) : [currentId, ...favorites.filter((id) => id !== currentId)].slice(0, 5);
    saveLocal();
    setFavoriteButtonState(currentId);
    renderFavorites();
  }

  function applyFilters() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const data = cardData(card);
      const haystack = [
        data.name, data.nameJa, data.aliases, data.summary, data.best, data.notFor,
        data.usecase, data.novice, data.practicalIntent, t.purposeNames[data.purpose] || data.purpose
      ].join(' ').toLowerCase();
      const categoryOk = activeCategory === 'all' || data.category === activeCategory;
      const purposeOk = activeFilters.purpose === 'all' || data.purpose === activeFilters.purpose;
      const mobileOk = activeFilters.mobileFit === 'all' || data.mobileFit === activeFilters.mobileFit;
      const diffOk = activeFilters.difficulty === 'all' || data.difficulty === activeFilters.difficulty;
      const queryOk = !query || haystack.includes(query);
      const show = categoryOk && purposeOk && mobileOk && diffOk && queryOk;
      card.hidden = !show;
      if (show) visible += 1;
    });
    updateCount(visible);
  }

  function attachCardEvents() {
    if (!gridEl) return;
    gridEl.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const detailButton = target.closest('[data-open-detail]');
      if (detailButton) {
        const card = detailButton.closest('[data-card]');
        if (card instanceof HTMLElement) openDetail(card);
        return;
      }
      const compareButton = target.closest('[data-add-compare]');
      if (compareButton) {
        const card = compareButton.closest('[data-card]');
        if (card instanceof HTMLElement) toggleCompare(card);
      }
    });
  }

  async function loadDataset() {
    const dataUrl = lang === 'ja' ? '../data/patterns.free.v1.json' : 'data/patterns.free.v1.json';
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`Dataset load failed: ${response.status}`);
    const payload = await response.json();
    records = (Array.isArray(payload.patterns) ? payload.patterns : []).map(normalizeRecord);
    bySlug = new Map(records.map((record) => [record.slug, record]));

    if (!gridEl) return;
    gridEl.innerHTML = '';
    records.forEach((record) => gridEl.appendChild(createCard(record)));

    cards = Array.from(app.querySelectorAll('[data-card]'));
    byId = new Map(cards.map((card) => [card.dataset.id, card]));
    applyFilters();
    renderCompare();
    renderFavorites();
    renderRecents();
  }

  categoryChips.forEach((chip) => chip.addEventListener('click', function () {
    activeCategory = chip.dataset.filter || 'all';
    categoryChips.forEach((c) => c.classList.toggle('active', c === chip));
    applyFilters();
  }));

  selectFilters.forEach((select) => select.addEventListener('change', function () {
    const name = select.dataset.selectFilter;
    if (!name) return;
    activeFilters[name] = select.value || 'all';
    applyFilters();
  }));

  search?.addEventListener('input', applyFilters);
  detailEls.favBtn?.addEventListener('click', toggleFavorite);
  app.querySelector('[data-copy-prompt]')?.addEventListener('click', copyPrompt);
  app.querySelector('[data-close-detail]')?.addEventListener('click', () => app.classList.remove('detail-open'));
  app.querySelector('[data-toggle-filters]')?.addEventListener('click', () => app.classList.toggle('filters-open'));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      app.querySelectorAll('.sample-modal.is-open,.sample-sheet.is-open,.sample-drawer.is-open,.sample-ham.is-open').forEach((el) => el.classList.remove('is-open'));
    }
  });

  attachCardEvents();
  loadDataset().catch(() => {
    updateCount(0);
    renderCompare();
    renderFavorites();
    renderRecents();
  });
})();
