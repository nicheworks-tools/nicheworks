(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app) return;
  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const grid = app.querySelector('.result-grid');
  const search = app.querySelector('[data-search]');
  const detailPanel = app.querySelector('[data-detail-panel]');
  if (!grid) return;

  const labels = {
    en: { badge: 'Extended', detail: 'Detail', compare: 'Add compare', category: 'Category', best: 'Best for', avoid: 'Avoid when', prompt: 'Handoff prompt', sample: 'Final case', added: 'Added final extended pattern to compare.' },
    ja: { badge: '拡張例', detail: '詳細', compare: '比較に追加', category: 'カテゴリ', best: '向いている場面', avoid: '避けたい場面', prompt: '引き継ぎプロンプト', sample: '追加ケース', added: '追加拡張例を比較に追加しました。' }
  }[lang];

  const data = [
    ['inline-validation-summary','forms','Inline validation summary','インライン検証サマリー','Shows all form errors near the submit area while keeping inline hints near each field.','フォーム全体のエラーを送信エリア付近にまとめつつ、各項目にも補足を残すUI。','Long forms, checkout forms, application forms.','長いフォーム、決済フォーム、申請フォーム。','Tiny forms with one or two fields.','1〜2項目だけの小さなフォーム。'],
    ['autosave-status-indicator','forms','Autosave status indicator','自動保存ステータス表示','Shows whether user input is saving, saved, or failed.','入力内容が保存中・保存済み・失敗のどれかを示すUI。','Editors, settings pages, dashboards with editable fields.','エディタ、設定画面、編集可能なダッシュボード。','One-shot forms that only save on submit.','送信時だけ保存する単発フォーム。'],
    ['bulk-action-toolbar','admin','Bulk action toolbar','一括操作ツールバー','Appears when multiple rows or items are selected.','複数行や複数項目を選択したときに表示される操作バー。','Tables, admin screens, inboxes, asset managers.','テーブル、管理画面、受信箱、素材管理。','When bulk actions are dangerous without review.','一括操作が危険で確認が必要な場合。'],
    ['row-detail-expander','admin','Row detail expander','行詳細エキスパンダー','Reveals secondary row details without leaving a table.','テーブルを離れずに行の補足情報を展開するUI。','Dense admin tables and audit logs.','高密度な管理テーブルや監査ログ。','When detail content is too complex for a row.','詳細内容が行内に収まらないほど複雑な場合。'],
    ['toast-with-action','feedback','Toast with action','アクション付きトースト','Confirms a result and offers a short reversible action.','結果を通知しつつ短い取り消し/追加操作を出すUI。','Undo, retry, view item, open details.','取り消し、再試行、項目表示、詳細表示。','Critical confirmations or legal notices.','重要確認や法務通知。'],
    ['system-status-banner','feedback','System status banner','システム状態バナー','Shows a persistent service-wide status or degradation notice.','サービス全体の状態や障害を継続表示するバナー。','Maintenance, degraded APIs, known issues.','メンテナンス、API劣化、既知問題。','Small inline validation errors.','小さな入力エラー。'],
    ['mobile-bottom-action-bar','mobile','Mobile bottom action bar','モバイル下部アクションバー','Keeps the primary action reachable on small screens.','小さい画面でも主要アクションを押しやすくする下部固定UI。','Checkout, booking, long detail pages.','決済、予約、長い詳細ページ。','When it covers important content or browser controls.','重要コンテンツやブラウザ操作を隠す場合。'],
    ['swipe-action-list','mobile','Swipe action list','スワイプ操作リスト','Lets mobile users reveal item actions with a swipe.','モバイルでスワイプにより項目操作を出すUI。','Inbox, task lists, lightweight item management.','受信箱、タスクリスト、軽量な項目管理。','When actions must be highly discoverable.','操作を常に見せる必要がある場合。'],
    ['audit-log-timeline','admin','Audit log timeline','監査ログタイムライン','Shows who changed what and when in chronological order.','誰が何をいつ変更したかを時系列で示すUI。','Admin, security, compliance, collaborative tools.','管理、セキュリティ、監査、共同編集ツール。','Simple user-facing history with no accountability needs.','責任追跡が不要な単純履歴。'],
    ['contextual-help-drawer','help','Contextual help drawer','文脈ヘルプドロワー','Provides help content without taking users away from the current task.','現在の作業から離れずにヘルプを表示するUI。','Complex settings, form guidance, professional tools.','複雑な設定、フォーム案内、業務ツール。','When the help text is short enough for inline copy.','短いヘルプ文で足りる場合。']
  ];

  const compareState = [];

  function textFor(item) {
    return {
      slug: item[0], category: item[1],
      name: lang === 'ja' ? item[3] : item[2],
      summary: lang === 'ja' ? item[5] : item[4],
      best: lang === 'ja' ? item[7] : item[6],
      avoid: lang === 'ja' ? item[9] : item[8]
    };
  }

  function promptFor(item) {
    const t = textFor(item);
    return lang === 'ja'
      ? `${t.name}を使うUIを実装してください。目的は「${t.best}」。避けたい場面は「${t.avoid}」。アクセシビリティ、モバイル表示、空状態、エラー状態、確認すべき受け入れ条件を含めてください。`
      : `Implement a UI using ${t.name}. The goal is: ${t.best}. Avoid it when: ${t.avoid}. Include accessibility, mobile behavior, empty state, error state, and acceptance criteria.`;
  }

  function openDetail(item) {
    const t = textFor(item);
    const set = (sel, val) => { const el = app.querySelector(sel); if (el) el.textContent = val; };
    const title = app.querySelector('[data-detail-title]');
    const empty = app.querySelector('[data-detail-empty]');
    const content = app.querySelector('[data-detail-content]');
    if (title) title.textContent = t.name;
    if (empty) empty.hidden = true;
    if (content) content.hidden = false;
    set('[data-detail-what]', t.summary);
    set('[data-detail-use-case]', t.best);
    set('[data-detail-best]', t.best);
    set('[data-detail-not-for]', t.avoid);
    set('[data-detail-similar]', lang === 'ja' ? '同カテゴリの追加拡張例と比較してください。' : 'Compare with final extended examples in the same category.');
    set('[data-detail-prompt]', promptFor(item));
    set('[data-detail-implementation]', lang === 'ja' ? `カテゴリ: ${t.category}。文脈説明、戻し方、状態表示、アクセシビリティを確認してください。` : `Category: ${t.category}. Review context copy, reversal path, state feedback, and accessibility.`);
    set('[data-detail-practical-intent]', lang === 'ja' ? 'UI選定を実装判断へ変える追加ケースです。' : 'Final extended case for converting UI selection into implementation decisions.');
    set('[data-detail-novice]', t.name);
    const sample = app.querySelector('[data-detail-sample]');
    if (sample) {
      sample.textContent = '';
      const box = document.createElement('div');
      box.className = 'sample-shell sample-large';
      box.innerHTML = `<p><strong>${labels.category}</strong>: ${t.category}</p><p><strong>${labels.best}</strong>: ${t.best}</p><div class="sample-grid"><span>${labels.badge}</span><span>${t.name}</span><span>Checklist</span><span>Prompt</span></div>`;
      sample.appendChild(box);
    }
    detailPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addCompare(item) {
    const t = textFor(item);
    compareState.unshift(item);
    const unique = [];
    const seen = new Set();
    compareState.forEach((x) => { if (!seen.has(x[0])) { seen.add(x[0]); unique.push(x); } });
    compareState.length = 0;
    unique.slice(0, 2).forEach((x) => compareState.push(x));
    const list = app.querySelector('[data-compare-list]');
    const empty = app.querySelector('[data-compare-empty]');
    const heading = app.querySelector('[data-compare-heading]');
    const status = app.querySelector('[data-compare-status]');
    const diff = app.querySelector('[data-compare-diff]');
    if (status) status.textContent = labels.added;
    if (empty) empty.hidden = compareState.length > 0;
    if (heading) heading.textContent = lang === 'ja' ? `比較 (${compareState.length}/2)` : `Compare (${compareState.length}/2)`;
    if (list) {
      list.textContent = '';
      compareState.forEach((x) => {
        const tx = textFor(x);
        const card = document.createElement('article');
        card.className = 'compare-item';
        card.innerHTML = `<h4>${tx.name}</h4><p>${tx.summary}</p><p><strong>${labels.category}</strong>: ${tx.category}</p>`;
        list.appendChild(card);
      });
    }
    if (diff) {
      diff.hidden = compareState.length < 2;
      if (compareState.length === 2) {
        const a = textFor(compareState[0]);
        const b = textFor(compareState[1]);
        diff.innerHTML = `<h4>${lang === 'ja' ? '追加比較メモ' : 'Final comparison memo'}</h4><p>${a.name}: ${a.best}</p><p>${b.name}: ${b.best}</p>`;
      }
    }
  }

  function makeCard(item) {
    const t = textFor(item);
    const card = document.createElement('article');
    card.className = 'pattern-card extended-pattern-card';
    card.dataset.extendedPlus = 'true';
    card.dataset.extendedText = `${item.join(' ')}`.toLowerCase();
    card.innerHTML = `<h3>${t.name}</h3><p>${t.summary}</p><div class="card-sample-wrap"><div class="sample-label">${labels.sample}</div><div class="sample-shell sample-mini"><div class="sample-grid"><span>${labels.badge}</span><span>${t.category}</span><span>Memo</span><span>Checklist</span></div></div></div><div class="card-meta"><span class="meta">${labels.category}: ${t.category}</span><span class="meta">+10</span></div><div class="card-actions"><button type="button" class="btn" data-plus-detail>${labels.detail}</button><button type="button" class="btn" data-plus-compare>${labels.compare}</button></div>`;
    card.querySelector('[data-plus-detail]').addEventListener('click', () => openDetail(item));
    card.querySelector('[data-plus-compare]').addEventListener('click', () => addCompare(item));
    return card;
  }

  function render() {
    grid.querySelectorAll('[data-extended-plus="true"]').forEach((node) => node.remove());
    const q = (search?.value || '').trim().toLowerCase();
    data.filter((item) => !q || item.join(' ').toLowerCase().includes(q)).forEach((item) => grid.appendChild(makeCard(item)));
  }

  let timer = null;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(render, 150); };
  search?.addEventListener('input', schedule);
  new MutationObserver(schedule).observe(grid, { childList: true });
  setTimeout(render, 350);
})();