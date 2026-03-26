(function () {
  const root = document.body;
  if (!root) return;

  const lang = root.dataset.lang || 'en';
  const app = root.querySelector('[data-ui-atlas-root]');
  if (!app) return;

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
      purpose: 'Purpose',
      mobile: 'Mobile fit',
      difficulty: 'Difficulty',
      openDetail: 'Open detail',
      addCompare: 'Add compare',
      sample: 'Live sample',
      compareBetter: 'Best for',
      compareAvoid: 'Avoid when',
      categoryNames: { disclosure: 'Disclosure', navigation: 'Navigation', selection: 'Selection' },
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
      purpose: '用途',
      mobile: 'モバイル適性',
      difficulty: '実装難易度',
      openDetail: '詳細',
      addCompare: '比較に追加',
      sample: 'ライブサンプル',
      compareBetter: '向いている場面',
      compareAvoid: '避けたい場面',
      categoryNames: { disclosure: '展開/開示', navigation: 'ナビゲーション', selection: '選択' },
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
    summary: app.querySelector('[data-detail-summary]'),
    best: app.querySelector('[data-detail-best]'),
    notFor: app.querySelector('[data-detail-not-for]'),
    similar: app.querySelector('[data-detail-similar]'),
    prompt: app.querySelector('[data-detail-prompt]'),
    notes: app.querySelector('[data-detail-notes]'),
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
    switch (record.sampleType) {
      case 'modal': return `<button class="mini-btn" data-sample-open="modal">${p('Open modal', 'モーダルを開く')}</button><div class="sample-modal" data-sample-modal><div class="sample-modal-card"><h4>${p('Confirm publish', '公開確認')}</h4><p>${p('This is a working modal sample.', '実際に動くモーダルサンプルです。')}</p><button class="mini-btn" data-sample-close>${p('Close', '閉じる')}</button></div></div>`;
      case 'bottom-sheet': return `<button class="mini-btn" data-sample-open="sheet">${p('Open sheet', 'シートを開く')}</button><div class="sample-sheet" data-sample-sheet><div class="sheet-handle"></div><p>${p('Bottom sheet content', 'ボトムシート内容')}</p><button class="mini-btn" data-sample-close>${p('Done', '閉じる')}</button></div>`;
      case 'accordion': return `<div class="sample-acc"><button data-sample-acc>${p('Why use this?', 'なぜ使う?')}</button><div>${p('Shows and hides content interactively.', '内容を開閉して表示できます。')}</div><button data-sample-acc>${p('Mobile behavior', 'モバイル挙動')}</button><div>${p('Tap again to collapse.', '再タップで閉じます。')}</div></div>`;
      case 'tabs': return `<div class="sample-tabs"><div><button data-tab="a" class="is-on">${p('Overview', '概要')}</button><button data-tab="b">${p('Specs', '仕様')}</button></div><p data-tab-panel>${p('Overview content', '概要コンテンツ')}</p></div>`;
      case 'segmented': return `<div class="sample-segmented"><button class="is-on">A</button><button>B</button><button>C</button></div>`;
      case 'tooltip': return `<button class="mini-btn tooltip-anchor" data-tooltip>${p('Hover/focus me', 'ホバー/フォーカス')}</button><span class="sample-tooltip">${p('Real tooltip', 'ツールチップ')}</span>`;
      case 'popover': return `<button class="mini-btn" data-sample-pop>${p('Toggle popover', 'ポップオーバー')}</button><div class="sample-popover" data-popover>${p('Anchored popover panel', 'アンカー付きパネル')}</div>`;
      case 'toast': return `<button class="mini-btn" data-sample-toast>${p('Show toast', 'トースト表示')}</button><div class="sample-toast" data-toast>${p('Saved successfully', '保存しました')}</div>`;
      case 'select': return `<label>${p('Plan', 'プラン')}<select><option>Free</option><option>Pro</option></select></label>`;
      case 'checkbox': return `<label><input type="checkbox" checked> ${p('Email updates', '更新通知')}</label><label><input type="checkbox"> ${p('SMS alerts', 'SMS通知')}</label>`;
      case 'radio': return `<label><input type="radio" name="r-${record.id}" checked> ${p('Monthly', '月額')}</label><label><input type="radio" name="r-${record.id}"> ${p('Yearly', '年額')}</label>`;
      case 'switch': return `<button class="switch" data-switch aria-pressed="false"><span></span></button>`;
      case 'otp': return `<div class="otp">${'<input maxlength="1" inputmode="numeric">'.repeat(6)}</div>`;
      case 'pricing': return `<div class="sample-pricing"><article><h4>Free</h4><strong>$0</strong></article><article class="is-on"><h4>Pro</h4><strong>$19</strong></article><article><h4>Team</h4><strong>$49</strong></article></div>`;
      case 'comparison': return `<table class="sample-table"><tr><th>Feature</th><th>A</th><th>B</th></tr><tr><td>Export</td><td>✓</td><td>✓</td></tr><tr><td>Team</td><td>-</td><td>✓</td></tr></table>`;
      case 'hero': return `<section class="sample-hero"><h4>Launch faster</h4><p>${p('Ship with confidence.', '安心して公開。')}</p><button class="mini-btn">${p('Start now', '始める')}</button></section>`;
      case 'feature-list': return `<ul class="sample-features"><li>${badge('⚡')} Fast setup</li><li>${badge('🔒')} Secure defaults</li><li>${badge('📈')} Better metrics</li></ul>`;
      case 'cta': return `<div class="sample-cta"><p>${p('Ready to improve conversion?', 'コンバージョンを改善しますか?')}</p><button class="mini-btn">${p('Try free', '無料で試す')}</button></div>`;
      case 'empty-state': return `<div class="sample-empty"><strong>${p('No items yet', 'データがありません')}</strong><button class="mini-btn">${p('Create one', '作成')}</button></div>`;
      case 'skeleton': return `<div class="sample-skeleton"><span></span><span></span><span></span></div>`;
      case 'progress': return `<div class="sample-progress"><div style="width:${large ? 62 : 45}%"></div></div>`;
      case 'alert': return `<p class="sample-alert">${p('Warning: Unsaved changes', '警告: 未保存の変更があります')}</p>`;
      case 'drawer': return `<button class="mini-btn" data-sample-open="drawer">${p('Open drawer', 'ドロワー開く')}</button><aside class="sample-drawer" data-sample-drawer><button data-sample-close>×</button><p>Menu A</p><p>Menu B</p></aside>`;
      case 'sidebar': return `<div class="sample-split"><aside><p>Inbox</p><p>Draft</p></aside><section><p>${p('Main content', 'メイン')}</p></section></div>`;
      case 'hamburger': return `<button class="mini-btn" data-sample-open="ham">☰</button><div class="sample-ham" data-sample-ham><a href="#">Docs</a><a href="#">API</a></div>`;
      case 'fab': return `<div class="sample-fixed"><button class="sample-fab">＋</button></div>`;
      case 'sticky-cta': return `<div class="sample-fixed"><div class="sample-sticky-cta"><span>${p('Limited offer', '期間限定')}</span><button class="mini-btn">${p('Join', '参加')}</button></div></div>`;
      case 'navbar': return `<nav class="sample-navbar"><a class="is-on">Home</a><a>Docs</a><a>Pricing</a></nav>`;
      case 'breadcrumb': return `<nav class="sample-bc"><span>Home</span>›<span>Library</span>›<strong>UI Atlas</strong></nav>`;
      case 'pagination': return `<div class="sample-pagination"><button>‹</button><button class="is-on">1</button><button>2</button><button>3</button><button>›</button></div>`;
      case 'tab-bar': return `<nav class="sample-tabbar"><button class="is-on">🏠</button><button>🔎</button><button>⭐</button><button>⚙️</button></nav>`;
      case 'text-input': return `<label>${p('Email', 'メール')}<input type="email" placeholder="hello@example.com"></label>`;
      case 'textarea': return `<label>${p('Message', 'メッセージ')}<textarea rows="2">${p('Draft text', '下書きテキスト')}</textarea></label>`;
      case 'combobox': return `<label>${p('Search tag', 'タグ検索')}<input list="cb-${record.id}" placeholder="UI"><datalist id="cb-${record.id}"><option>UI</option><option>UX</option><option>Design</option></datalist></label>`;
      case 'date-picker': return `<label>${p('Date', '日付')}<input type="date"></label>`;
      case 'validation': return `<label>${p('Username', 'ユーザー名')}<input value="ab"><small>${p('Must be at least 3 characters.', '3文字以上で入力してください。')}</small></label>`;
      case 'step-form': return `<div class="sample-steps"><span class="is-on">1</span><span>2</span><span>3</span><p>${p('Step 1: Account', 'ステップ1: アカウント')}</p></div>`;
      case 'contact': return `<form class="sample-contact"><input placeholder="Name"><input placeholder="Email"><button class="mini-btn">Send</button></form>`;
      case 'testimonial': return `<blockquote class="sample-testimonial">“${p('Great workflow and clear UX.', '分かりやすく実務で使いやすい。')}”<cite>— Team</cite></blockquote>`;
      case 'footer': return `<footer class="sample-footer"><a>Terms</a><a>Privacy</a><a>Contact</a></footer>`;
      case 'carousel': return `<div class="sample-carousel"><button data-carousel="prev">‹</button><div data-carousel-track><span class="is-on">1</span><span>2</span><span>3</span></div><button data-carousel="next">›</button></div>`;
      case 'timeline': return `<ol class="sample-timeline"><li><strong>Plan</strong></li><li><strong>Build</strong></li><li><strong>Ship</strong></li></ol>`;
      case 'table': return `<table class="sample-table"><tr><th>User</th><th>Role</th></tr><tr><td>Ana</td><td>Admin</td></tr><tr><td>Ken</td><td>Editor</td></tr></table>`;
      case 'list-view': return `<ul class="sample-list"><li>Alpha</li><li>Bravo</li><li>Charlie</li></ul>`;
      case 'grid-layout': return `<div class="sample-grid"><span></span><span></span><span></span><span></span></div>`;
      case 'split-view': return `<div class="sample-split"><aside>${p('Folders', 'フォルダ')}</aside><section>${p('Preview pane', 'プレビュー')}</section></div>`;
      case 'sticky-sidebar': return `<div class="sample-sticky"><main>${p('Long article', '長文本文')}</main><aside>${p('Sticky TOC', '固定目次')}</aside></div>`;
      case 'spinner':
      default:
        return `<div class="sample-spinner ${compact}"></div>`;
    }
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
    renderSample(article.querySelector('[data-card-sample]'), record, false);
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
      compareDiff.hidden = false;
      compareDiff.innerHTML = `
        <h4>${t.compareDiff}: ${left.name} × ${right.name}</h4>
        <ul>
          <li><strong>${t.purpose}</strong>: ${(t.purposeNames[left.purpose] || left.purpose)} vs ${(t.purposeNames[right.purpose] || right.purpose)}</li>
          <li><strong>${t.compareBetter}</strong>: ${left.best} / ${right.best}</li>
          <li><strong>${t.compareAvoid}</strong>: ${left.notFor} / ${right.notFor}</li>
          <li><strong>${t.mobile}</strong>: ${(t.mobileNames[left.mobileFit] || left.mobileFit)} vs ${(t.mobileNames[right.mobileFit] || right.mobileFit)}</li>
          <li><strong>${t.difficulty}</strong>: ${(t.difficultyNames[left.difficulty] || left.difficulty)} vs ${(t.difficultyNames[right.difficulty] || right.difficulty)}</li>
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
    detailEls.summary.textContent = `${data.summary} ${data.usecase}`;
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
    detailEls.notes.textContent = `${data.notes} ${data.practicalIntent} ${data.novice}`;
    setFavoriteButtonState(currentId);
    addRecent(currentId);
    if (matched) renderSample(detailEls.sample, matched, true);
    app.classList.add('detail-open');
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
    cards.forEach((card) => {
      card.querySelector('[data-open-detail]')?.addEventListener('click', () => openDetail(card));
      card.querySelector('[data-add-compare]')?.addEventListener('click', () => toggleCompare(card));
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
    attachCardEvents();
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

  loadDataset().catch(() => {
    updateCount(0);
    renderCompare();
    renderFavorites();
    renderRecents();
  });
})();
