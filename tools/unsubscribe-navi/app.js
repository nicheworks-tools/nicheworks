const STATE_LABELS = {
  verified: '検証済み',
  legacy_review_required: '要再確認',
  needs_review: '要再確認',
  retired: '終了・移行済み'
};

const CATEGORY_LABELS = {
  video_streaming: '動画配信',
  music_audio: '音楽・音声',
  cloud_productivity: 'クラウド・生産性',
  mobile_carrier: '通信・SIM',
  software_saas: 'ソフトウェア・SaaS',
  ai: 'AI',
  ebooks_media: '電子書籍・メディア',
  gaming: 'ゲーム',
  shopping_membership: '通販・会員サービス',
  other: 'その他'
};

const ADDITION_FILES = [
  './data/additions/2026-09-12-phase2-wave1.json',
  './data/additions/2026-09-12-phase2-wave2.json',
  './data/additions/2026-09-12-phase2-wave3.json',
  './data/additions/2026-09-12-phase2-wave4.json',
  './data/additions/2026-09-12-phase2-wave5.json',
  './data/additions/2026-09-12-phase2-wave6.json'
];

const REVERIFICATION_FILES = [
  './data/reverification/2026-09-12-wave1-media.json',
  './data/reverification/2026-09-12-wave1-cloud-software.json',
  './data/reverification/2026-09-12-wave1-carrier-hygiene.json',
  './data/reverification/2026-09-12-wave2-cleanup.json',
  './data/reverification/2026-09-12-wave3-phase1-close.json',
  './data/reverification/2026-09-12-wave4-post100-quality.json'
];

let database = { records: [] };

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`database load failed for ${url}: ${response.status}`);
  return response.json();
}

function buildDatabase(base, additions, overlays) {
  const byId = new Map((base.records || []).map((record) => [record.id, record]));

  for (const addition of additions) {
    for (const record of addition.records || []) {
      if (byId.has(record.id)) throw new Error(`duplicate addition id: ${record.id}`);
      byId.set(record.id, record);
    }
  }

  for (const overlay of overlays) {
    for (const record of overlay.records || []) {
      if (!byId.has(record.id)) throw new Error(`overlay targets unknown id: ${record.id}`);
      const previous = byId.get(record.id);
      byId.set(record.id, {
        ...previous,
        ...record,
        verification: {
          ...(previous.verification || {}),
          ...(record.verification || {})
        }
      });
    }
  }

  return {
    ...base,
    records: [...byId.values()]
  };
}

async function loadDatabase() {
  const loaded = await Promise.all([
    fetchJson('./data/services.json'),
    ...ADDITION_FILES.map(fetchJson),
    ...REVERIFICATION_FILES.map(fetchJson)
  ]);
  const base = loaded[0];
  const additions = loaded.slice(1, 1 + ADDITION_FILES.length);
  const overlays = loaded.slice(1 + ADDITION_FILES.length);
  return buildDatabase(base, additions, overlays);
}

function visibleRecords() {
  return database.records.filter((record) => record.publication_state !== 'placeholder');
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTokens(query) {
  const normalized = normalizeSearchText(query);
  return normalized ? normalized.split(' ') : [];
}

function buildCategoryOptions(records) {
  const select = document.getElementById('categoryFilter');
  const counts = new Map();
  for (const record of records) {
    if (!record.category) continue;
    counts.set(record.category, (counts.get(record.category) || 0) + 1);
  }

  const categories = [...counts.keys()]
    .sort((a, b) => (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b, 'ja'));

  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = `${CATEGORY_LABELS[category] || category}（${counts.get(category)}）`;
    select.appendChild(option);
  }
}

function updateStateOptionCounts(records) {
  const counts = {
    verified: records.filter((record) => record.publication_state === 'verified').length,
    review: records.filter((record) => ['legacy_review_required', 'needs_review'].includes(record.publication_state)).length,
    retired: records.filter((record) => record.publication_state === 'retired').length
  };

  const select = document.getElementById('stateFilter');
  for (const option of select.options) {
    if (!option.value) continue;
    const count = counts[option.value];
    if (Number.isInteger(count)) {
      const label = option.value === 'verified'
        ? '検証済み'
        : option.value === 'review'
          ? '要再確認'
          : '終了・移行済み';
      option.textContent = `${label}（${count}）`;
    }
  }
}

function matchesQuery(record, tokens) {
  if (!tokens.length) return true;
  const haystack = normalizeSearchText([
    record.name,
    ...(record.aliases || []),
    ...(record.keywords || []),
    record.summary,
    record.procedure_type,
    ...(record.billing_routes || []),
    CATEGORY_LABELS[record.category] || record.category
  ].filter(Boolean).join(' '));
  return tokens.every((token) => haystack.includes(token));
}

function matchesState(record, state) {
  if (!state) return true;
  if (state === 'review') {
    return ['legacy_review_required', 'needs_review'].includes(record.publication_state);
  }
  return record.publication_state === state;
}

function createCard(record) {
  const article = document.createElement('article');
  article.className = 'service-card';

  const head = document.createElement('div');
  head.className = 'service-head';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = record.name;
  const category = document.createElement('p');
  category.className = 'category';
  category.textContent = CATEGORY_LABELS[record.category] || record.category || 'その他';
  titleWrap.append(title, category);

  const badge = document.createElement('span');
  badge.className = `state-badge state-${record.publication_state}`;
  badge.textContent = STATE_LABELS[record.publication_state] || record.publication_state;
  head.append(titleWrap, badge);

  const summary = document.createElement('p');
  summary.className = 'service-summary';
  summary.textContent = record.summary || '公式情報を確認してください。';

  const actions = document.createElement('div');
  actions.className = 'service-actions';

  if (record.procedure_url) {
    const procedure = document.createElement('a');
    procedure.className = 'primary';
    procedure.href = record.procedure_url;
    procedure.target = '_blank';
    procedure.rel = 'noopener noreferrer';
    procedure.textContent = record.publication_state === 'verified' ? '公式の手続き情報' : '手続き・関連情報';
    actions.appendChild(procedure);
  }

  if (record.official_site_url) {
    const site = document.createElement('a');
    site.href = record.official_site_url;
    site.target = '_blank';
    site.rel = 'noopener noreferrer';
    site.textContent = '公式サイト';
    actions.appendChild(site);
  }

  const verification = document.createElement('p');
  verification.className = 'verification-note';
  if (record.publication_state === 'verified' && record.verification?.last_verified_at) {
    verification.textContent = `最終確認: ${record.verification.last_verified_at}`;
  } else if (record.publication_state === 'retired') {
    verification.textContent = '終了・移行済みサービスとして履歴を記録しています。';
  } else {
    verification.textContent = '現在の公式手順として再確認中です。';
  }

  article.append(head, summary, actions, verification);
  return article;
}

function updateClearFiltersButton(query, category, state) {
  const button = document.getElementById('clearFilters');
  button.hidden = !(query || category || state);
}

function render() {
  const root = document.getElementById('results');
  const rawQuery = document.getElementById('searchInput').value;
  const tokens = searchTokens(rawQuery);
  const category = document.getElementById('categoryFilter').value;
  const state = document.getElementById('stateFilter').value;
  const records = visibleRecords()
    .filter((record) => !category || record.category === category)
    .filter((record) => matchesState(record, state))
    .filter((record) => matchesQuery(record, tokens))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  root.replaceChildren();
  document.getElementById('resultCount').textContent = String(records.length);
  updateClearFiltersButton(tokens.length ? rawQuery : '', category, state);

  if (!records.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '該当するサービスが見つかりませんでした。検索語を減らすか、条件をクリアしてください。';
    root.appendChild(empty);
    return;
  }

  for (const record of records) root.appendChild(createCard(record));
}

function renderSummary(records) {
  const verified = records.filter((record) => record.publication_state === 'verified').length;
  const review = records.filter((record) => ['legacy_review_required', 'needs_review'].includes(record.publication_state)).length;
  const retired = records.filter((record) => record.publication_state === 'retired').length;
  const summary = document.getElementById('databaseSummary');
  summary.textContent = `収録 ${records.length}件 / 検証済み ${verified}件 / 再確認待ち ${review}件 / 終了・移行 ${retired}件`;
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('stateFilter').value = '';
  render();
  document.getElementById('searchInput').focus();
}

document.addEventListener('DOMContentLoaded', async () => {
  const results = document.getElementById('results');
  try {
    database = await loadDatabase();
    const records = visibleRecords();
    buildCategoryOptions(records);
    updateStateOptionCounts(records);
    renderSummary(records);
    render();

    document.getElementById('searchInput').addEventListener('input', render);
    document.getElementById('categoryFilter').addEventListener('change', render);
    document.getElementById('stateFilter').addEventListener('change', render);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
  } catch (error) {
    console.error(error);
    results.innerHTML = '<div class="empty">データベースを読み込めませんでした。</div>';
    document.getElementById('databaseSummary').textContent = 'データ読込エラー';
  }
});
