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

let database = { records: [] };

async function loadDatabase() {
  const response = await fetch('./data/services.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`database load failed: ${response.status}`);
  return response.json();
}

function visibleRecords() {
  return database.records.filter((record) => record.publication_state !== 'placeholder');
}

function buildCategoryOptions(records) {
  const select = document.getElementById('categoryFilter');
  const categories = [...new Set(records.map((record) => record.category).filter(Boolean))]
    .sort((a, b) => (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b, 'ja'));

  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = CATEGORY_LABELS[category] || category;
    select.appendChild(option);
  }
}

function matchesQuery(record, query) {
  if (!query) return true;
  const haystack = [
    record.name,
    ...(record.aliases || []),
    ...(record.keywords || []),
    record.summary,
    CATEGORY_LABELS[record.category] || record.category
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
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
    procedure.textContent = record.publication_state === 'verified' ? '公式の手続き情報' : '旧版の手続き候補';
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
    verification.textContent = '終了・移行状況を含めて記録しています。現在の契約可否は公式情報をご確認ください。';
  } else {
    verification.textContent = '単独版から移行した旧データです。現在の公式手順として再確認中です。';
  }

  article.append(head, summary, actions, verification);
  return article;
}

function render() {
  const root = document.getElementById('results');
  const query = document.getElementById('searchInput').value.trim();
  const category = document.getElementById('categoryFilter').value;
  const records = visibleRecords()
    .filter((record) => !category || record.category === category)
    .filter((record) => matchesQuery(record, query))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  root.replaceChildren();
  document.getElementById('resultCount').textContent = String(records.length);

  if (!records.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '該当するサービスが見つかりませんでした。';
    root.appendChild(empty);
    return;
  }

  for (const record of records) root.appendChild(createCard(record));
}

function renderSummary(records) {
  const verified = records.filter((record) => record.publication_state === 'verified').length;
  const review = records.filter((record) => ['legacy_review_required', 'needs_review'].includes(record.publication_state)).length;
  const summary = document.getElementById('databaseSummary');
  summary.textContent = `収録 ${records.length}件 / 検証済み ${verified}件 / 再確認待ち ${review}件`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const results = document.getElementById('results');
  try {
    database = await loadDatabase();
    const records = visibleRecords();
    buildCategoryOptions(records);
    renderSummary(records);
    render();

    document.getElementById('searchInput').addEventListener('input', render);
    document.getElementById('categoryFilter').addEventListener('change', render);
  } catch (error) {
    console.error(error);
    results.innerHTML = '<div class="empty">データベースを読み込めませんでした。</div>';
    document.getElementById('databaseSummary').textContent = 'データ読込エラー';
  }
});
