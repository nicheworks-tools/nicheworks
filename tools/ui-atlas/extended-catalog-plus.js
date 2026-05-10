(function(){
  const root=document.body;
  const app=document.querySelector('[data-ui-atlas-root]');
  if(!root||!app)return;
  const grid=app.querySelector('.result-grid');
  const search=app.querySelector('[data-search]');
  const lang=root.dataset.lang==='ja'?'ja':'en';
  if(!grid)return;

  const txt={
    en:{badge:'Extended',detail:'Detail',sample:'Extended case',category:'Category',best:'Best for',avoid:'Avoid when',prompt:'Handoff prompt'},
    ja:{badge:'拡張例',detail:'詳細',sample:'拡張ケース',category:'カテゴリ',best:'向いている場面',avoid:'避けたい場面',prompt:'引き継ぎプロンプト'}
  }[lang];

  const data=[
    ['bulk-action-toolbar','admin','Bulk action toolbar','一括操作ツールバー','Appears when multiple rows are selected and exposes safe batch actions.','複数行を選択した時だけ表示され、安全な一括操作を出すUI。','Admin tables, moderation queues, CRM lists.','管理テーブル、モデレーション、CRMリスト。','When users may trigger destructive actions accidentally.','誤って破壊的操作を実行しやすい場合。'],
    ['audit-log-timeline','admin','Audit log timeline','監査ログタイムライン','Shows who changed what and when in a readable event stream.','誰が何をいつ変更したかを時系列で示すUI。','Security, admin, compliance, and enterprise settings.','セキュリティ、管理、コンプライアンス、企業設定。','When events need legal-grade export or tamper-proof storage.','法的証跡や改ざん耐性が必要な場合。'],
    ['role-change-confirmation','admin','Role change confirmation','権限変更確認','Confirms permission changes before applying them.','権限変更を適用する前に確認するUI。','Team management and organization settings.','チーム管理や組織設定。','Low-risk preference changes.','低リスクな表示設定変更。'],
    ['destructive-zone','account','Destructive action zone','破壊的操作ゾーン','Groups irreversible account actions away from normal settings.','取り消しにくい操作を通常設定から分離するUI。','Delete account, reset workspace, remove organization.','アカウント削除、ワークスペース初期化、組織削除。','Routine actions that users perform often.','頻繁に使う通常操作。'],
    ['mobile-filter-sheet','mobile','Mobile filter sheet','モバイル絞り込みシート','Moves complex filters into a bottom sheet on small screens.','複雑なフィルターをモバイルでは下部シートにまとめるUI。','Catalogs, maps, search, and marketplace pages.','カタログ、地図、検索、マーケットプレイス。','When two or three simple filters fit inline.','2〜3個の単純なフィルターで足りる場合。'],
    ['swipeable-card-stack','mobile','Swipeable card stack','スワイプカードスタック','Lets users review one item at a time with swipe gestures.','1件ずつスワイプで確認するカードUI。','Mobile review, matching, triage, and lightweight approvals.','モバイルレビュー、マッチング、仕分け、軽い承認。','Dense comparison or tasks needing exact selection.','高密度比較や正確な選択が必要な作業。'],
    ['offline-sync-banner','system','Offline sync banner','オフライン同期バナー','Explains offline state and pending sync clearly.','オフライン状態と同期待ちを明確に伝えるUI。','PWAs, field work apps, mobile tools, note apps.','PWA、現場作業アプリ、モバイルツール、メモアプリ。','Purely online tools with no offline behavior.','オフライン動作がないオンライン専用ツール。'],
    ['inline-permission-status','system','Inline permission status','権限状態のインライン表示','Shows whether browser, account, or integration permission is enabled.','ブラウザ、アカウント、連携権限の有効状態をその場で示すUI。','Camera, microphone, calendar, file, and API integrations.','カメラ、マイク、カレンダー、ファイル、API連携。','When status is obvious from the current screen.','現在画面だけで状態が明らかな場合。'],
    ['policy-warning-callout','compliance','Policy warning callout','ポリシー警告コールアウト','Warns about policy, privacy, or compliance risk before action.','操作前にポリシー、プライバシー、コンプライアンス上のリスクを知らせるUI。','Uploads, exports, emails, AI automation, and admin actions.','アップロード、書き出し、メール、AI自動化、管理操作。','Generic tips that do not change user behavior.','行動を変えない一般的なヒント。'],
    ['evidence-attachment-list','compliance','Evidence attachment list','証拠添付リスト','Shows attached evidence, source, timestamp, and review status.','添付証拠、出典、時刻、確認状態を一覧で示すUI。','Reports, claims, trust reviews, compliance workflows.','通報、申請、信頼性レビュー、コンプライアンス作業。','Simple comments with no verification requirement.','検証不要の単純コメント。']
  ];

  function setText(selector,value){const el=app.querySelector(selector);if(el)el.textContent=value;}
  function buildPrompt(item){return lang==='ja'?`${item[3]}を実装してください。用途は「${item[7]}」。避けるべき場面は「${item[9]}」。モバイル、アクセシビリティ、空状態、エラー状態、実装後の確認項目を含めてください。`:`Implement ${item[2]}. Use it for: ${item[6]}. Avoid it when: ${item[8]}. Include mobile behavior, accessibility, empty state, error state, and implementation review checks.`;}
  function showDetail(item){
    const name=lang==='ja'?item[3]:item[2];
    const summary=lang==='ja'?item[5]:item[4];
    const best=lang==='ja'?item[7]:item[6];
    const avoid=lang==='ja'?item[9]:item[8];
    const title=app.querySelector('[data-detail-title]');
    const empty=app.querySelector('[data-detail-empty]');
    const content=app.querySelector('[data-detail-content]');
    if(title)title.textContent=name;
    if(empty)empty.hidden=true;
    if(content)content.hidden=false;
    setText('[data-detail-what]',summary);
    setText('[data-detail-use-case]',best);
    setText('[data-detail-best]',best);
    setText('[data-detail-not-for]',avoid);
    setText('[data-detail-similar]',lang==='ja'?'同じカテゴリの管理・システム・コンプライアンス系UIと比較してください。':'Compare with admin, system, and compliance UI patterns in the same category.');
    setText('[data-detail-practical-intent]',lang==='ja'?'実務判断、確認、監査、権限管理に使う拡張UIケースです。':'Extended UI case for practical decisions, confirmation, audit, and permission-heavy workflows.');
    setText('[data-detail-novice]',name);
    setText('[data-detail-prompt]',buildPrompt(item));
    setText('[data-detail-implementation]',lang==='ja'?'実装時は、権限、戻し方、状態表示、誤操作防止、監査ログの必要性を確認してください。':'Review permissions, reversal path, state feedback, accidental action prevention, and audit log needs.');
    const sample=app.querySelector('[data-detail-sample]');
    if(sample)sample.innerHTML=`<div class="sample-shell sample-large"><div class="sample-detail-guide"><p><strong>${txt.category}</strong>: ${item[1]}</p><p><strong>${txt.best}</strong>: ${best}</p></div><div class="sample-grid"><span>${name}</span><span>${txt.badge}</span><span>Checklist</span><span>Handoff</span></div><p class="sample-detail-tip">${txt.prompt}: ${buildPrompt(item)}</p></div>`;
    app.classList.add('detail-open');
    app.querySelector('[data-detail-panel]')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function makeCard(item){
    const name=lang==='ja'?item[3]:item[2];
    const summary=lang==='ja'?item[5]:item[4];
    const best=lang==='ja'?item[7]:item[6];
    const card=document.createElement('article');
    card.className='pattern-card extended-pattern-card';
    card.dataset.uiPlus='true';
    card.dataset.extendedText=item.join(' ').toLowerCase();
    card.innerHTML=`<h3>${name}</h3><p>${summary}</p><div class="card-sample-wrap"><div class="sample-label">${txt.sample}</div><div class="sample-shell sample-mini"><div class="sample-grid"><span>${txt.badge}</span><span>${item[1]}</span><span>Review</span><span>Handoff</span></div></div></div><div class="card-meta"><span class="meta-tag">${txt.category}: ${item[1]}</span><span class="meta-tag">Extended</span></div><p><strong>${txt.best}</strong>: ${best}</p><div class="card-actions"><button type="button" class="btn detail-btn" data-plus-detail>${txt.detail}</button></div>`;
    card.querySelector('[data-plus-detail]').addEventListener('click',()=>showDetail(item));
    return card;
  }
  function render(){
    grid.querySelectorAll('[data-ui-plus="true"]').forEach((node)=>node.remove());
    const q=(search?.value||'').trim().toLowerCase();
    data.filter((item)=>!q||item.join(' ').toLowerCase().includes(q)).forEach((item)=>grid.appendChild(makeCard(item)));
  }
  let timer=null;
  function schedule(){clearTimeout(timer);timer=setTimeout(render,140);}
  search?.addEventListener('input',schedule);
  new MutationObserver(schedule).observe(grid,{childList:true});
  setTimeout(render,350);
})();
