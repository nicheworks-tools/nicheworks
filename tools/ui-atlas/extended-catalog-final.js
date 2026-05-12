(function(){
  const root=document.body;
  const app=document.querySelector('[data-ui-atlas-root]');
  if(!root||!app)return;
  const lang=root.dataset.lang==='ja'?'ja':'en';
  const grid=app.querySelector('.result-grid');
  const search=app.querySelector('[data-search]');
  if(!grid)return;
  const t=lang==='ja'?{badge:'拡張例',detail:'詳細',sample:'拡張ケース',category:'カテゴリ',best:'向いている場面',prompt:'引き継ぎプロンプト'}:{badge:'Extended',detail:'Detail',sample:'Extended case',category:'Category',best:'Best for',prompt:'Handoff prompt'};
  const groups={
    onboarding:[['welcome-checklist','Welcome checklist','ウェルカムチェックリスト'],['setup-progress-tracker','Setup progress tracker','セットアップ進捗トラッカー'],['empty-dashboard-first-action','Empty dashboard first action','空ダッシュボードの初回アクション'],['guided-tour-coachmark','Guided tour coachmark','ガイドツアーのコーチマーク'],['permission-explainer','Permission request explainer','権限リクエスト説明'],['import-wizard','Import data wizard','データインポートウィザード'],['template-picker','Template picker','テンプレート選択'],['activation-banner','Activation milestone banner','有効化マイルストーンバナー']],
    search:[['command-palette','Command palette','コマンドパレット'],['saved-search','Saved search','保存済み検索'],['recent-search-chips','Recent search chips','最近の検索チップ'],['filter-summary-bar','Filter summary bar','フィルター要約バー'],['no-result-recovery','No result recovery','検索結果なしの回復導線'],['facet-count-list','Facet count list','ファセット件数リスト'],['sort-relevance-note','Sort relevance note','並び替えと関連度説明'],['categorized-suggestions','Categorized suggestions','カテゴリ付き検索サジェスト']],
    dashboard:[['kpi-card-row','KPI card row','KPIカード列'],['trend-delta-badge','Trend delta badge','トレンド差分バッジ'],['drilldown-side-panel','Drilldown side panel','ドリルダウン用サイドパネル'],['data-freshness-indicator','Data freshness indicator','データ鮮度表示'],['chart-annotation','Chart annotation','チャート注釈'],['segment-comparison-table','Segment comparison table','セグメント比較テーブル'],['export-status-notice','Export status notice','エクスポート状態通知'],['alert-threshold-editor','Alert threshold editor','アラート閾値エディタ']],
    ai:[['ai-suggestion-card','AI suggestion card','AI提案カード'],['review-before-apply','Review-before-apply queue','適用前レビューキュー'],['generated-draft-diff','Generated draft diff','生成ドラフト差分'],['confidence-explanation','Confidence explanation block','信頼度説明ブロック'],['undo-automation','Undo automation action','自動化操作の取り消し'],['prompt-template-picker','Prompt template picker','プロンプトテンプレート選択'],['agent-activity-timeline','Agent activity timeline','エージェント活動タイムライン'],['human-approval-gate','Human approval gate','人間承認ゲート']],
    account:[['plan-sticky-cta','Plan comparison sticky CTA','プラン比較の固定CTA'],['upgrade-reason-banner','Upgrade reason banner','アップグレード理由バナー'],['usage-limit-meter','Usage limit meter','利用上限メーター'],['billing-history-table','Billing history table','請求履歴テーブル'],['payment-failure-recovery','Payment failure recovery','支払い失敗時の回復導線'],['cancel-feedback-step','Cancel flow feedback step','解約理由フィードバック'],['team-permission-matrix','Team permission matrix','チーム権限表'],['security-settings-checklist','Security settings checklist','セキュリティ設定チェックリスト']],
    admin:[['bulk-action-toolbar','Bulk action toolbar','一括操作ツールバー'],['audit-log-timeline','Audit log timeline','監査ログタイムライン'],['role-change-confirmation','Role change confirmation','権限変更確認']],
    mobile:[['mobile-filter-sheet','Mobile filter sheet','モバイル絞り込みシート'],['swipeable-card-stack','Swipeable card stack','スワイプカードスタック']],
    system:[['offline-sync-banner','Offline sync banner','オフライン同期バナー'],['inline-permission-status','Inline permission status','権限状態のインライン表示']],
    compliance:[['policy-warning-callout','Policy warning callout','ポリシー警告コールアウト'],['evidence-attachment-list','Evidence attachment list','証拠添付リスト']]
  };
  const desc={
    onboarding:['Guides new users toward setup, activation, and first value.','新規ユーザーを初期設定、有効化、最初の価値まで案内するUI。'],
    search:['Improves discovery, recovery, and repeat use in search-heavy products.','検索が多い製品で、発見、回復、再利用を助けるUI。'],
    dashboard:['Turns metrics and operational state into readable decisions.','指標や運用状態を判断しやすくするUI。'],
    ai:['Keeps AI output reviewable, explainable, and reversible.','AI出力を確認可能、説明可能、取り消し可能にするUI。'],
    account:['Clarifies billing, permissions, limits, and account risk.','請求、権限、上限、アカウントリスクを明確にするUI。'],
    admin:['Supports safe batch operations, auditability, and role changes.','一括操作、監査、権限変更を安全に扱うUI。'],
    mobile:['Adapts dense choices and review work to small screens.','高密度な選択や確認作業を小画面に適応させるUI。'],
    system:['Explains device, browser, sync, and permission state.','端末、ブラウザ、同期、権限状態を説明するUI。'],
    compliance:['Warns about policy risk and keeps evidence reviewable.','ポリシーリスクを警告し、証拠確認を扱いやすくするUI。']
  };
  const avoid={
    onboarding:['When the product should complete setup automatically.','自動で完了できる初期設定の場合。'],search:['When the result set is tiny and obvious.','対象が少なく状態が明らかな場合。'],dashboard:['When the metric needs written explanation before visualization.','可視化前に説明が必要な指標の場合。'],ai:['When AI output is purely informational and low risk.','AI出力が低リスクな情報表示だけの場合。'],account:['When the change is low risk and reversible.','変更が低リスクで取り消せる場合。'],admin:['When a simple single-row action is enough.','単一行の操作だけで十分な場合。'],mobile:['When the interaction needs dense side-by-side comparison.','横並びの高密度比較が必要な場合。'],system:['When no user action or status decision is needed.','ユーザーが判断や操作をする必要がない場合。'],compliance:['When warning copy would be generic noise.','警告文が一般的なノイズになる場合。']
  };
  const data=Object.entries(groups).flatMap(([category,items])=>items.map(item=>({slug:item[0],category,name_en:item[1],name_ja:item[2],summary_en:desc[category][0],summary_ja:desc[category][1],best_en:category+' workflows, product tools, and implementation handoffs.',best_ja:category+' 系のワークフロー、プロダクトUI、実装引き継ぎ。',avoid_en:avoid[category][0],avoid_ja:avoid[category][1]})));
  function setText(sel,value){const el=app.querySelector(sel);if(el)el.textContent=value;}
  function prompt(item){return lang==='ja'?`${item.name_ja}を実装してください。用途は「${item.best_ja}」。避ける場面は「${item.avoid_ja}」。モバイル、アクセシビリティ、空状態、エラー状態、実装後の確認項目を含めてください。`:`Implement ${item.name_en}. Use it for: ${item.best_en}. Avoid it when: ${item.avoid_en}. Include mobile behavior, accessibility, empty state, error state, and implementation review checks.`;}
  function showDetail(item){
    const name=lang==='ja'?item.name_ja:item.name_en, summary=lang==='ja'?item.summary_ja:item.summary_en, best=lang==='ja'?item.best_ja:item.best_en, no=lang==='ja'?item.avoid_ja:item.avoid_en;
    const title=app.querySelector('[data-detail-title]'), empty=app.querySelector('[data-detail-empty]'), content=app.querySelector('[data-detail-content]');
    if(title)title.textContent=name; if(empty)empty.hidden=true; if(content)content.hidden=false;
    setText('[data-detail-what]',summary); setText('[data-detail-use-case]',best); setText('[data-detail-best]',best); setText('[data-detail-not-for]',no); setText('[data-detail-similar]',lang==='ja'?'同カテゴリのUIと比較してください。':'Compare with UI patterns in the same category.'); setText('[data-detail-practical-intent]',lang==='ja'?'UI選定を実装判断に変えるための拡張ケースです。':'Extended case for turning UI selection into an implementation decision.'); setText('[data-detail-novice]',name); setText('[data-detail-prompt]',prompt(item)); setText('[data-detail-implementation]',lang==='ja'?'文脈説明、戻し方、状態表示、アクセシビリティを確認してください。':'Review context copy, reversal path, state feedback, and accessibility before shipping.');
    const sample=app.querySelector('[data-detail-sample]'); if(sample)sample.innerHTML=`<div class="sample-shell sample-large"><div class="sample-detail-guide"><p><strong>${t.category}</strong>: ${item.category}</p><p><strong>${t.best}</strong>: ${best}</p></div><div class="sample-grid"><span>${name}</span><span>${t.badge}</span><span>Decision memo</span><span>Checklist</span></div><p class="sample-detail-tip">${t.prompt}: ${prompt(item)}</p></div>`;
    app.classList.add('detail-open'); app.querySelector('[data-detail-panel]')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function card(item){const name=lang==='ja'?item.name_ja:item.name_en, summary=lang==='ja'?item.summary_ja:item.summary_en, best=lang==='ja'?item.best_ja:item.best_en; const el=document.createElement('article'); el.className='pattern-card extended-pattern-card'; el.dataset.extended='true'; el.dataset.extendedText=[item.slug,item.category,item.name_en,item.name_ja,item.summary_en,item.summary_ja,item.best_en,item.best_ja].join(' ').toLowerCase(); el.innerHTML=`<h3>${name}</h3><p>${summary}</p><div class="card-sample-wrap"><div class="sample-label">${t.sample}</div><div class="sample-shell sample-mini"><div class="sample-grid"><span>${t.badge}</span><span>${item.category}</span><span>Review</span><span>Handoff</span></div></div></div><div class="card-meta"><span class="meta-tag">${t.category}: ${item.category}</span><span class="meta-tag">Extended</span></div><p><strong>${t.best}</strong>: ${best}</p><div class="card-actions"><button type="button" class="btn detail-btn" data-detail-ext>${t.detail}</button></div>`; el.querySelector('[data-detail-ext]').addEventListener('click',()=>showDetail(item)); return el;}
  function render(){grid.querySelectorAll('[data-extended="true"]').forEach(n=>n.remove()); const q=(search?.value||'').trim().toLowerCase(); data.filter(item=>!q||item.slug.includes(q)||item.category.includes(q)||item.name_en.toLowerCase().includes(q)||item.name_ja.includes(q)).forEach(item=>grid.appendChild(card(item)));}
  let timer=null; function schedule(){clearTimeout(timer);timer=setTimeout(render,100);} search?.addEventListener('input',schedule); setTimeout(render,200);
})();
