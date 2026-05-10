(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app) return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const grid = app.querySelector('.result-grid');
  const search = app.querySelector('[data-search]');
  const detailPanel = app.querySelector('[data-detail-panel]');
  const detailTitle = app.querySelector('[data-detail-title]');
  const detailEmpty = app.querySelector('[data-detail-empty]');
  const detailContent = app.querySelector('[data-detail-content]');
  const countEl = app.querySelector('[data-count]');
  const compareList = app.querySelector('[data-compare-list]');
  const compareEmpty = app.querySelector('[data-compare-empty]');
  const compareDiff = app.querySelector('[data-compare-diff]');
  const compareHeading = app.querySelector('[data-compare-heading]');
  const compareStatus = app.querySelector('[data-compare-status]');
  if (!grid) return;

  const txt = {
    en: {
      badge: 'Extended', detail: 'Detail', compare: 'Add compare', added: 'Added extended pattern to compare.',
      hidden: 'Extended examples hidden by current filters/search.', shown: (n) => `${n} extended examples shown`,
      sample: 'Extended case', category: 'Category', best: 'Best for', avoid: 'Avoid when', prompt: 'Handoff prompt', note: 'Implementation note'
    },
    ja: {
      badge: '拡張例', detail: '詳細', compare: '比較に追加', added: '拡張例を比較に追加しました。',
      hidden: '現在の検索/フィルターでは拡張例は非表示です。', shown: (n) => `拡張例 ${n}件表示`,
      sample: '拡張ケース', category: 'カテゴリ', best: '向いている場面', avoid: '避けたい場面', prompt: '引き継ぎプロンプト', note: '実装メモ'
    }
  }[lang];

  const data = [
    ['welcome-checklist','onboarding','Welcome checklist','ウェルカムチェックリスト','A short checklist that gives new users a clear path to activation.','新規ユーザーが有効化まで迷わないための短いチェックリスト。','New product setup, SaaS trial activation, admin onboarding.','SaaS初期設定、無料トライアル、有効化導線。','When the task has only one step or should be completed automatically.','タスクが1つだけ、または自動完了すべき場合。'],
    ['setup-progress-tracker','onboarding','Setup progress tracker','セットアップ進捗トラッカー','Shows how much of the required setup is complete.','必要な初期設定がどこまで完了しているかを示すUI。','Multi-step setup and onboarding flows.','複数ステップの初期設定やオンボーディング。','When progress cannot be measured honestly.','進捗を正確に測れない場合。'],
    ['empty-dashboard-first-action','onboarding','Empty dashboard first action','空ダッシュボードの初回アクション','Turns an empty dashboard into a guided first action.','空のダッシュボードを初回アクション導線に変える。','New users with no data yet.','まだデータがない新規ユーザー。','When the empty state needs explanation before action.','行動前に説明が必要な空状態。'],
    ['guided-tour-coachmark','onboarding','Guided tour coachmark','ガイドツアーのコーチマーク','A small contextual hint anchored to a UI element.','UI要素に紐づく短い文脈ヒント。','Introducing one unfamiliar control at a time.','見慣れない操作を一つずつ紹介する場合。','Long explanations or required training flows.','長い説明や必須研修の代用。'],
    ['permission-explainer','onboarding','Permission request explainer','権限リクエスト説明','Explains why a browser or account permission is needed before asking.','権限要求前に、なぜ必要かを説明するUI。','Camera, microphone, location, file, and notification permissions.','カメラ、マイク、位置情報、ファイル、通知権限。','When permission is not actually required.','権限が本当に必要でない場合。'],
    ['import-wizard','onboarding','Import data wizard','データインポートウィザード','Guides users through upload, mapping, validation, and import.','アップロード、対応付け、検証、取り込みを案内するUI。','CSV imports, migrations, batch setup.','CSV取り込み、移行、初期登録。','Tiny single-field imports.','小さな単一項目の取り込み。'],
    ['template-picker','onboarding','Template picker','テンプレート選択','Lets users start from a prebuilt project or page structure.','既成のプロジェクト/ページ構造から開始できるUI。','Project creation and repeatable workflows.','プロジェクト作成や反復ワークフロー。','When templates would constrain expert users.','熟練者の自由度を奪う場合。'],
    ['activation-banner','onboarding','Activation milestone banner','有効化マイルストーンバナー','Celebrates or marks a meaningful setup milestone.','意味のある初期達成地点を示すバナー。','Activation moments and trial motivation.','有効化瞬間やトライアル継続の動機付け。','Every tiny action; it becomes noisy.','細かすぎる全行動。ノイズになる。'],

    ['command-palette','search','Command palette','コマンドパレット','Keyboard-first launcher for actions, navigation, and search.','操作、移動、検索をまとめるキーボード中心UI。','Power users and dense tools.','高密度ツールやパワーユーザー向け。','Simple sites with only a few pages.','数ページだけの単純サイト。'],
    ['saved-search','search','Saved search','保存済み検索','Stores a reusable query or filter combination.','検索条件やフィルター条件を保存するUI。','Repeated monitoring and operational workflows.','定期確認や運用監視。','One-off searches.','一回限りの検索。'],
    ['recent-search-chips','search','Recent search chips','最近の検索チップ','Shows recent queries as quick repeat actions.','最近の検索語を再実行しやすいチップにする。','Search-heavy tools and dashboards.','検索頻度が高いツールやダッシュボード。','Sensitive search terms without clear privacy handling.','センシティブ検索語の扱いが曖昧な場合。'],
    ['filter-summary-bar','search','Filter summary bar','フィルター要約バー','Summarizes active filters above results.','現在の絞り込み条件を結果上部に要約するUI。','Complex filtering with multiple facets.','複数条件の複雑な絞り込み。','Very small filters with obvious state.','状態が明らかな小さなフィルター。'],
    ['no-result-recovery','search','No result recovery','検索結果なしの回復導線','Suggests ways to recover from an empty search result.','検索結果なしから回復する提案UI。','Search boxes, directories, and marketplaces.','検索、ディレクトリ、マーケットプレイス。','When zero results is expected and final.','0件が当然で最終状態の場合。'],
    ['facet-count-list','search','Facet count list','ファセット件数リスト','Shows how many results remain per filter option.','各フィルター選択肢の残件数を示すUI。','Catalogs, logs, analytics filters.','カタログ、ログ、分析フィルター。','When counts are expensive or stale.','件数算出が重い/古い場合。'],
    ['sort-relevance-note','search','Sort relevance note','並び替えと関連度説明','Explains why results are sorted in a certain way.','結果がなぜその順番なのかを説明するUI。','Search, AI results, recommendation lists.','検索、AI結果、推薦リスト。','When ranking logic is obvious or fixed.','順位が明らか/固定の場合。'],
    ['categorized-suggestions','search','Categorized suggestions','カテゴリ付き検索サジェスト','Groups autocomplete suggestions by type.','サジェストを種類別に分けて表示するUI。','Large products with pages, docs, users, and actions.','ページ、ドキュメント、ユーザー、操作が混在する大規模UI。','Tiny search scopes.','検索対象が少ない場合。'],

    ['kpi-card-row','dashboard','KPI card row','KPIカード列','A compact row of headline metrics.','主要指標を横並びで見せるUI。','Dashboards and weekly reporting pages.','ダッシュボードや週次レポート。','When metrics need detailed explanation first.','指標の説明が先に必要な場合。'],
    ['trend-delta-badge','dashboard','Trend delta badge','トレンド差分バッジ','Shows increase/decrease against a previous period.','前期間比の増減を示すバッジ。','KPI cards and metric tables.','KPIカードや指標テーブル。','When the comparison baseline is unclear.','比較基準が曖昧な場合。'],
    ['drilldown-side-panel','dashboard','Drilldown side panel','ドリルダウン用サイドパネル','Opens detailed context without leaving the dashboard.','画面遷移せず詳細文脈を開くUI。','Analytics, admin tools, issue triage.','分析、管理画面、課題整理。','When the detail requires a full workflow.','詳細側で大きな作業が必要な場合。'],
    ['data-freshness-indicator','dashboard','Data freshness indicator','データ鮮度表示','Shows when data was last updated.','データの最終更新時刻や鮮度を示すUI。','Dashboards, API status, live data pages.','ダッシュボード、API状態、ライブデータ。','Static marketing pages.','静的なLP。'],
    ['chart-annotation','dashboard','Chart annotation','チャート注釈','Adds context to a spike, dip, or change on a chart.','チャートの急増/急落/変化に文脈を加えるUI。','Reports and incident retrospectives.','レポートや障害振り返り。','When annotations clutter dense charts.','注釈でチャートが読みにくくなる場合。'],
    ['segment-comparison-table','dashboard','Segment comparison table','セグメント比較テーブル','Compares metrics across groups or cohorts.','グループやコホートごとの指標を比較するUI。','Growth, product, sales dashboards.','成長、プロダクト、営業ダッシュボード。','When rows need visual exploration instead.','視覚探索の方が適切な場合。'],
    ['export-status-notice','dashboard','Export status notice','エクスポート状態通知','Explains export progress, delay, or completion.','出力処理の進行、遅延、完了を説明するUI。','CSV/PDF/report exports.','CSV、PDF、レポート出力。','Instant tiny downloads.','即時完了する小さなDL。'],
    ['alert-threshold-editor','dashboard','Alert threshold editor','アラート閾値エディタ','Lets users define when alerts should trigger.','通知が発火する条件を編集するUI。','Monitoring, finance, inventory, analytics.','監視、金融、在庫、分析。','When users cannot understand the metric.','ユーザーが指標を理解できない場合。'],

    ['ai-suggestion-card','ai','AI suggestion card','AI提案カード','Presents an AI recommendation with context and actions.','AIの提案を理由と操作つきで表示するUI。','Copilots, writing tools, review workflows.','Copilot、文章支援、レビュー作業。','High-risk automatic decisions without review.','確認なしの高リスク自動判断。'],
    ['review-before-apply','ai','Review-before-apply queue','適用前レビューキュー','Collects AI changes for human approval.','AI変更を人間承認前に並べるUI。','Bulk edits, code changes, data cleanup.','一括編集、コード変更、データ整理。','Low-risk cosmetic suggestions only.','低リスクな装飾提案のみの場合。'],
    ['generated-draft-diff','ai','Generated draft diff','生成ドラフト差分','Shows what AI changed before applying it.','AIが何を変えたか適用前に示すUI。','Text editing, code edits, policy updates.','文章編集、コード編集、規約更新。','When there is no original baseline.','比較元がない場合。'],
    ['confidence-explanation','ai','Confidence explanation block','信頼度説明ブロック','Explains why a result may be reliable or uncertain.','結果が信頼できる/不確かな理由を説明するUI。','AI search, classification, recommendations.','AI検索、分類、推薦。','When confidence would imply false certainty.','信頼度が過信を招く場合。'],
    ['undo-automation','ai','Undo automation action','自動化操作の取り消し','Provides a clear rollback path after automation.','自動処理後に戻せる導線を提供するUI。','AI agents, bulk changes, workflow automation.','AIエージェント、一括変更、自動化。','Irreversible legal/financial actions.','取り消せない法務/金融操作。'],
    ['prompt-template-picker','ai','Prompt template picker','プロンプトテンプレート選択','Lets users choose a prompt structure by intent.','目的別にプロンプト構造を選ぶUI。','AI writing, coding, research tools.','AI文章、開発、調査ツール。','When users already have a fixed workflow.','既に固定ワークフローがある場合。'],
    ['agent-activity-timeline','ai','Agent activity timeline','エージェント活動タイムライン','Shows what an AI agent did step by step.','AIエージェントの実行過程を時系列で示すUI。','Long-running AI tasks and automations.','長時間のAIタスクや自動化。','Single instant responses.','単発即時応答。'],
    ['human-approval-gate','ai','Human approval gate','人間承認ゲート','Requires explicit approval before applying AI output.','AI出力適用前に明示的な承認を求めるUI。','Risky writes, publishing, billing, deletion.','書き込み、公開、請求、削除など。','Purely informational AI summaries.','情報要約のみの場合。'],

    ['plan-sticky-cta','account','Plan comparison sticky CTA','プラン比較の固定CTA','Keeps upgrade action visible while comparing plans.','プラン比較中もアップグレード導線を固定表示するUI。','Pricing pages and upgrade flows.','価格ページやアップグレード導線。','When it blocks comparison content.','比較内容を邪魔する場合。'],
    ['upgrade-reason-banner','account','Upgrade reason banner','アップグレード理由バナー','Explains why a feature requires upgrade.','なぜアップグレードが必要かを説明するUI。','Feature gates and usage limits.','機能制限、利用上限。','When the feature should remain free.','無料提供すべき機能の場合。'],
    ['usage-limit-meter','account','Usage limit meter','利用上限メーター','Shows usage against a plan limit.','プラン上限に対する使用量を示すUI。','API usage, storage, credits, seats.','API、ストレージ、クレジット、席数。','Unlimited plans without real limits.','実質無制限のプラン。'],
    ['billing-history-table','account','Billing history table','請求履歴テーブル','Lists invoices, receipts, and payment status.','請求書、領収書、支払い状態を並べるUI。','Account billing pages.','アカウント請求ページ。','One-time anonymous purchases only.','匿名の単発購入のみ。'],
    ['payment-failure-recovery','account','Payment failure recovery','支払い失敗時の回復導線','Guides users to fix failed payments.','支払い失敗を回復するための導線。','Subscriptions and checkout flows.','サブスクや決済導線。','When no retry path exists.','再試行手段がない場合。'],
    ['cancel-feedback-step','account','Cancel flow feedback step','解約理由フィードバック','Collects cancellation reason without trapping users.','ユーザーを閉じ込めず解約理由を聞くUI。','Subscription cancellation.','サブスク解約。','Dark-pattern retention flows.','解約妨害のような導線。'],
    ['team-permission-matrix','account','Team permission matrix','チーム権限表','Shows roles and permissions in a matrix.','ロールと権限を表形式で示すUI。','Team settings and admin pages.','チーム設定や管理画面。','Very small two-role products.','2ロール程度の小規模製品。'],
    ['security-settings-checklist','account','Security settings checklist','セキュリティ設定チェックリスト','Shows recommended security setup steps.','推奨セキュリティ設定をチェックリスト化するUI。','Account security, admin onboarding.','アカウント保護、管理者オンボーディング。','When security controls are not user configurable.','ユーザーが設定できない場合。']
  ];

  const state = { compare: [] };

  function makeCard(item) {
    const [slug, category, enName, jaName, enSummary, jaSummary, enBest, jaBest, enAvoid, jaAvoid] = item;
    const name = lang === 'ja' ? jaName : enName;
    const summary = lang === 'ja' ? jaSummary : enSummary;
    const best = lang === 'ja' ? jaBest : enBest;
    const avoid = lang === 'ja' ? jaAvoid : enAvoid;
    const card = document.createElement('article');
    card.className = 'pattern-card extended-pattern-card';
    card.dataset.extended = 'true';
    card.dataset.extendedSlug = slug;
    card.dataset.extendedText = `${slug} ${category} ${enName} ${jaName} ${enSummary} ${jaSummary}`.toLowerCase();
    card.innerHTML = `<h3>${name}</h3><p>${summary}</p><div class="card-sample-wrap"><div class="sample-label">${txt.sample}</div><div class="sample-shell sample-mini"><div class="sample-grid"><span>${txt.badge}</span><span>${category}</span><span>Pro memo</span><span>Prompt</span></div></div></div><div class="card-meta"><span class="meta">${txt.category}: ${category}</span><span class="meta">Extended</span></div><div class="card-actions"><button type="button" class="btn" data-ext-detail>${txt.detail}</button><button type="button" class="btn" data-ext-compare>${txt.compare}</button></div>`;
    card.querySelector('[data-ext-detail]').addEventListener('click', () => showDetail(item));
    card.querySelector('[data-ext-compare]').addEventListener('click', () => addCompare(item));
    return card;
  }

  function showDetail(item) {
    const [slug, category, enName, jaName, enSummary, jaSummary, enBest, jaBest, enAvoid, jaAvoid] = item;
    const name = lang === 'ja' ? jaName : enName;
    const summary = lang === 'ja' ? jaSummary : enSummary;
    const best = lang === 'ja' ? jaBest : enBest;
    const avoid = lang === 'ja' ? jaAvoid : enAvoid;
    if (detailTitle) detailTitle.textContent = name;
    if (detailEmpty) detailEmpty.hidden = true;
    if (detailContent) detailContent.hidden = false;
    setText('[data-detail-what]', summary);
    setText('[data-detail-use-case]', best);
    setText('[data-detail-best]', best);
    setText('[data-detail-not-for]', avoid);
    setText('[data-detail-similar]', lang === 'ja' ? '同カテゴリの拡張例と比較してください。' : 'Compare with other extended examples in the same category.');
    setText('[data-detail-practical-intent]', lang === 'ja' ? 'UI選定を実装判断に変えるための拡張ケースです。' : 'Extended case for turning UI selection into an implementation decision.');
    setText('[data-detail-novice]', name);
    setText('[data-detail-prompt]', buildPrompt(item));
    setText('[data-detail-implementation]', buildNote(item));
    const sample = app.querySelector('[data-detail-sample]');
    if (sample) sample.innerHTML = `<div class="sample-shell sample-large"><div class="sample-detail-guide"><p><strong>${txt.category}</strong>: ${category}</p><p><strong>${txt.best}</strong>: ${best}</p></div><div class="sample-grid"><span>${name}</span><span>${txt.badge}</span><span>Decision memo</span><span>Checklist</span></div><p class="sample-detail-tip">${txt.prompt}: ${buildPrompt(item)}</p></div>`;
    detailPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setText(selector, value) {
    const el = app.querySelector(selector);
    if (el) el.textContent = value;
  }

  function buildPrompt(item) {
    const [slug, category, enName, jaName, enSummary, jaSummary, enBest, jaBest, enAvoid, jaAvoid] = item;
    if (lang === 'ja') return `${jaName}を使うUI案を実装してください。目的は「${jaBest}」。避けるべき場面は「${jaAvoid}」。アクセシビリティ、モバイル表示、空状態、エラー状態、実装後の確認項目を含めてください。`;
    return `Implement a UI concept using ${enName}. The goal is: ${enBest}. Avoid using it when: ${enAvoid}. Include accessibility, mobile behavior, empty state, error state, and implementation review checks.`;
  }

  function buildNote(item) {
    const [slug, category, enName, jaName, enSummary, jaSummary, enBest, jaBest, enAvoid, jaAvoid] = item;
    return lang === 'ja'
      ? `カテゴリ: ${category}。実装時は、文脈説明、ユーザー操作の戻し方、状態表示、アクセシビリティを確認してください。`
      : `Category: ${category}. Review context copy, reversal path, state feedback, and accessibility before shipping.`;
  }

  function addCompare(item) {
    const slug = item[0];
    state.compare = state.compare.filter((x) => x[0] !== slug);
    state.compare.unshift(item);
    state.compare = state.compare.slice(0, 2);
    renderCompare();
    if (compareStatus) compareStatus.textContent = txt.added;
  }

  function renderCompare() {
    if (!compareList) return;
    compareList.innerHTML = '';
    state.compare.forEach((item) => {
      const name = lang === 'ja' ? item[3] : item[2];
      const summary = lang === 'ja' ? item[5] : item[4];
      const box = document.createElement('article');
      box.className = 'compare-item';
      box.innerHTML = `<h4>${name}</h4><p>${summary}</p><p><strong>${txt.category}</strong>: ${item[1]}</p>`;
      compareList.appendChild(box);
    });
    if (compareEmpty) compareEmpty.hidden = state.compare.length > 0;
    if (compareHeading) compareHeading.textContent = lang === 'ja' ? `比較 (${state.compare.length}/2)` : `Compare (${state.compare.length}/2)`;
    if (compareDiff) {
      compareDiff.hidden = state.compare.length < 2;
      if (state.compare.length === 2) {
        const a = lang === 'ja' ? state.compare[0][3] : state.compare[0][2];
        const b = lang === 'ja' ? state.compare[1][3] : state.compare[1][2];
        compareDiff.innerHTML = `<h4>${lang === 'ja' ? '拡張比較メモ' : 'Extended comparison memo'}</h4><p>${lang === 'ja' ? `${a}は${state.compare[0][7]}に向き、${b}は${state.compare[1][7]}に向きます。` : `${a} fits ${state.compare[0][6]}; ${b} fits ${state.compare[1][6]}.`}</p>`;
      }
    }
  }

  function renderExtended() {
    if (!grid) return;
    grid.querySelectorAll('[data-extended="true"]').forEach((node) => node.remove());
    const q = (search?.value || '').trim().toLowerCase();
    const visible = data.filter((item) => !q || `${item.join(' ')}`.toLowerCase().includes(q));
    visible.forEach((item) => grid.appendChild(makeCard(item)));
    if (countEl && q && visible.length) countEl.textContent += ` + ${txt.shown(visible.length)}`;
  }

  let renderTimer = null;
  const schedule = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderExtended, 120);
  };
  search?.addEventListener('input', schedule);
  app.querySelectorAll('[data-filter-group], [data-select-filter]').forEach((el) => el.addEventListener('click', schedule));
  new MutationObserver(schedule).observe(grid, { childList: true });
  window.setTimeout(renderExtended, 250);
})();