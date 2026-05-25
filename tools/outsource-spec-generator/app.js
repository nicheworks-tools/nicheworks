(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  let generated = false;
  let lastProOutputs = {};

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';
  const isProActive = () => document.documentElement.dataset.proActive === 'true';
  const t = (ja, en) => lang() === 'ja' ? ja : en;

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      toast(t('言語設定を保存できませんでした。無料機能は利用できます。', 'Could not save the language preference. Free features still work.'));
    }
  }

  function applyLang(nextLang) {
    $$('[data-i18n]').forEach((element) => {
      element.style.display = element.dataset.i18n === nextLang ? '' : 'none';
    });
    $$('.nw-lang-switch button').forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === nextLang);
    });
    document.documentElement.lang = nextLang;
    safeStorageSet('nw_lang', nextLang);
  }

  function toast(message) {
    const element = $('toast');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      element.hidden = true;
    }, 2600);
  }

  function value(id) {
    return ($(id)?.value || '').trim();
  }

  function valueOrDefault(id, fallbackJa, fallbackEn) {
    return value(id) || t(fallbackJa, fallbackEn);
  }

  function listFrom(id) {
    return value(id).split(/\n|,|、/).map((item) => item.trim()).filter(Boolean);
  }

  function bullets(items, fallbackJa, fallbackEn) {
    const source = items.length ? items : [t(fallbackJa, fallbackEn)];
    return source.map((item) => `- ${item}`).join('\n');
  }

  function collectInput() {
    return {
      workType: value('workType'),
      purpose: value('purpose'),
      deliverables: listFrom('deliverables'),
      outOfScope: listFrom('outOfScope'),
      deadline: value('deadline'),
      budget: value('budget'),
      deliveryFormat: value('deliveryFormat'),
      acceptanceMethod: value('acceptanceMethod'),
      acceptancePeriod: value('acceptancePeriod'),
      communication: value('communication'),
      revisionRounds: value('revisionRounds'),
      paymentTerms: value('paymentTerms'),
      rightsUsage: value('rightsUsage'),
      portfolioPermission: value('portfolioPermission'),
      confidentiality: value('confidentiality'),
      mustHave: listFrom('mustHave'),
      references: listFrom('references'),
      packType: $('packType')?.value || 'web'
    };
  }

  function validateRequired() {
    const missing = [];
    if (!value('workType')) missing.push(t('作業種別', 'Work type'));
    if (!value('deliverables')) missing.push(t('成果物・範囲', 'Deliverables / scope'));
    if (!value('deadline')) missing.push(t('納期', 'Deadline'));
    if (!value('budget')) missing.push(t('予算', 'Budget'));
    if (!value('acceptanceMethod')) missing.push(t('検収方法', 'Acceptance method'));
    const hint = $('requiredHint');
    if (!hint) return missing.length === 0;
    if (missing.length) {
      hint.textContent = t(`必須項目を入力してください: ${missing.join('、')}`, `Please fill required fields: ${missing.join(', ')}`);
      hint.hidden = false;
      return false;
    }
    hint.hidden = true;
    return true;
  }

  function buildFreeSpec(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    const line = (label, val, fallback) => `- ${label}: ${val || fallback}`;
    if (ja) {
      return [
        '# 外注仕様書ドラフト（簡易版）',
        '',
        '## 基本情報',
        line('作業種別', input.workType, '未指定'),
        line('目的', input.purpose, '未指定'),
        line('納期', input.deadline, '未指定'),
        line('予算', input.budget, '未指定'),
        '',
        '## 成果物・範囲',
        bullets(input.deliverables, '未指定', 'Not specified'),
        '',
        '## 簡易受入基準',
        `- 検収方法: ${input.acceptanceMethod || '未指定'}`,
        `- 検収期間: ${input.acceptancePeriod || '未指定'}`,
        '- 成果物・範囲に記載された項目が確認できること',
        '- 参考資料・必須条件と大きな矛盾がないこと',
        '',
        '## 簡易修正ルール',
        `- 修正回数: ${input.revisionRounds || '未指定'}`,
        '- 仕様外の追加作業は別見積もりとして扱う',
        '- 不明点は納品前に確認し、合意内容をテキストで残す',
        '',
        '## 必須条件',
        bullets(input.mustHave, '未指定', 'Not specified'),
        '',
        '## 参考資料',
        bullets(input.references, '未指定', 'Not specified'),
        '',
        '> 注意: この出力は契約書ではありません。契約条件・権利・支払い条件は当事者間で確認してください。'
      ].join('\n');
    }
    return [
      '# Outsourcing Spec Draft (Free)',
      '',
      '## Basic info',
      line('Work type', input.workType, 'Not specified'),
      line('Purpose', input.purpose, 'Not specified'),
      line('Deadline', input.deadline, 'Not specified'),
      line('Budget', input.budget, 'Not specified'),
      '',
      '## Deliverables / scope',
      bullets(input.deliverables, '未指定', 'Not specified'),
      '',
      '## Lightweight acceptance criteria',
      `- Acceptance method: ${input.acceptanceMethod || 'Not specified'}`,
      `- Acceptance period: ${input.acceptancePeriod || 'Not specified'}`,
      '- Items listed in deliverables/scope can be verified',
      '- No major conflict with references or must-have requirements',
      '',
      '## Lightweight revision rules',
      `- Revision rounds: ${input.revisionRounds || 'Not specified'}`,
      '- Additional work outside the agreed scope should be estimated separately',
      '- Clarify questions before delivery and keep agreements in writing',
      '',
      '## Must-have requirements',
      bullets(input.mustHave, '未指定', 'Not specified'),
      '',
      '## References',
      bullets(input.references, '未指定', 'Not specified'),
      '',
      '> Note: This output is not a contract. Confirm legal terms, rights, and payment conditions separately.'
    ].join('\n');
  }

  function buildDeliverablePack(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    const packLabels = {
      web: ja ? 'Web / UI 成果物パック' : 'Web / UI deliverable pack',
      design: ja ? 'デザイン成果物パック' : 'Design deliverable pack',
      writing: ja ? 'ライティング成果物パック' : 'Writing deliverable pack'
    };
    if (ja) {
      return [
        `# ${packLabels[input.packType] || packLabels.web}`,
        '',
        '## 納品物',
        bullets(input.deliverables, '成果物一覧を入力してください', 'Enter deliverables'),
        '',
        '## 納品形式',
        `- ${input.deliveryFormat || '未指定'}`,
        '',
        '## 受け渡し時に添えるもの',
        '- 変更点サマリー',
        '- 確認済みチェック項目',
        '- 未対応・対象外項目のメモ',
        '- 利用素材・参考資料の一覧',
        '',
        '## 対象外',
        bullets(input.outOfScope, '未指定', 'Not specified')
      ].join('\n');
    }
    return [
      `# ${packLabels[input.packType] || packLabels.web}`,
      '',
      '## Deliverables',
      bullets(input.deliverables, '成果物一覧を入力してください', 'Enter deliverables'),
      '',
      '## Delivery format',
      `- ${input.deliveryFormat || 'Not specified'}`,
      '',
      '## Include with delivery',
      '- Summary of changes',
      '- Checked acceptance items',
      '- Notes for unresolved or out-of-scope items',
      '- List of assets and references used',
      '',
      '## Out of scope',
      bullets(input.outOfScope, '未指定', 'Not specified')
    ].join('\n');
  }

  function buildAcceptanceChecklist(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    if (ja) {
      return [
        '# 検収チェックリスト',
        '',
        `- [ ] 成果物・範囲: ${input.deliverables.join(' / ') || '未指定'}`,
        `- [ ] 納品形式: ${input.deliveryFormat || '未指定'}`,
        `- [ ] 検収方法: ${input.acceptanceMethod || '未指定'}`,
        `- [ ] 検収期間: ${input.acceptancePeriod || '未指定'}`,
        '- [ ] 必須条件と矛盾がない',
        '- [ ] 参考資料との差分が説明されている',
        '- [ ] 対象外範囲が混入していない',
        '- [ ] 修正依頼は合意した回数・範囲に収まっている',
        '- [ ] 支払い条件・権利/利用範囲・実績公開可否・秘密保持の確認が済んでいる'
      ].join('\n');
    }
    return [
      '# Acceptance checklist',
      '',
      `- [ ] Deliverables/scope: ${input.deliverables.join(' / ') || 'Not specified'}`,
      `- [ ] Delivery format: ${input.deliveryFormat || 'Not specified'}`,
      `- [ ] Acceptance method: ${input.acceptanceMethod || 'Not specified'}`,
      `- [ ] Acceptance period: ${input.acceptancePeriod || 'Not specified'}`,
      '- [ ] No conflict with must-have requirements',
      '- [ ] Differences from references are explained',
      '- [ ] Out-of-scope items are not included by accident',
      '- [ ] Revision requests stay within agreed rounds and scope',
      '- [ ] Payment terms, rights/usage, portfolio permission, and confidentiality are confirmed'
    ].join('\n');
  }

  function buildVendorQuestionList(locale = lang()) {
    const ja = locale === 'ja';
    if (ja) {
      return [
        '# 外注先への事前質問リスト',
        '',
        '- 着手前に不足している素材・情報はありますか？',
        '- 納期に影響しそうな前提やリスクはありますか？',
        '- 検収時に特に確認してほしいポイントはありますか？',
        '- 対象外範囲に含めるべき項目はありますか？',
        '- 修正依頼の受付方法と締切はどう設定しますか？',
        '- 納品形式・ファイル命名・共有方法に指定はありますか？',
        '- 権利/利用範囲、実績公開、秘密保持で確認すべき点はありますか？'
      ].join('\n');
    }
    return [
      '# Vendor preflight questions',
      '',
      '- Are any assets or details missing before kickoff?',
      '- Are there assumptions or risks that may affect the deadline?',
      '- Which points should be checked most carefully at acceptance?',
      '- Should anything else be explicitly out of scope?',
      '- How should revision requests be submitted and by when?',
      '- Are there requirements for delivery format, file names, or sharing?',
      '- Are rights/usage, portfolio permission, or confidentiality points unclear?'
    ].join('\n');
  }

  function buildRiskMemo(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    if (ja) {
      return [
        '# 発注前リスクメモ',
        '',
        `- 対象外範囲: ${input.outOfScope.join(' / ') || '未指定のため、追加作業化しやすい'}`,
        `- 納品形式: ${input.deliveryFormat || '未指定のため、受け渡し時に齟齬が出やすい'}`,
        `- 検収期間: ${input.acceptancePeriod || '未指定のため、検収完了日が曖昧になりやすい'}`,
        `- 支払い条件: ${input.paymentTerms || '未指定のため、請求タイミングを確認する'}`,
        `- 権利/利用範囲: ${input.rightsUsage || '未指定のため、商用利用・二次利用を確認する'}`,
        `- 実績公開: ${input.portfolioPermission || '未指定のため、公開可否を確認する'}`,
        `- 秘密保持: ${input.confidentiality || '未指定のため、共有範囲を確認する'}`
      ].join('\n');
    }
    return [
      '# Pre-order risk memo',
      '',
      `- Out of scope: ${input.outOfScope.join(' / ') || 'Not specified; likely to become extra work'}`,
      `- Delivery format: ${input.deliveryFormat || 'Not specified; may cause handoff mismatch'}`,
      `- Acceptance period: ${input.acceptancePeriod || 'Not specified; acceptance completion may be ambiguous'}`,
      `- Payment terms: ${input.paymentTerms || 'Not specified; confirm invoice timing'}`,
      `- Rights/usage: ${input.rightsUsage || 'Not specified; confirm commercial and secondary use'}`,
      `- Portfolio permission: ${input.portfolioPermission || 'Not specified; confirm publication rules'}`,
      `- Confidentiality: ${input.confidentiality || 'Not specified; confirm sharing boundaries'}`
    ].join('\n');
  }

  function buildCodexPrompt(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    if (ja) {
      return [
        '# Codex依頼文',
        '',
        `あなたは外注タスクの実装支援者です。作業種別は「${input.workType || '未指定'}」です。`,
        `目的: ${input.purpose || '未指定'}`,
        '',
        '## 実施範囲',
        bullets(input.deliverables, '未指定', 'Not specified'),
        '',
        '## 対象外',
        bullets(input.outOfScope, '未指定', 'Not specified'),
        '',
        '## 制約・検収',
        `- 納期: ${input.deadline || '未指定'}`,
        `- 予算: ${input.budget || '未指定'}`,
        `- 検収方法: ${input.acceptanceMethod || '未指定'}`,
        `- 必須条件: ${input.mustHave.join(' / ') || '未指定'}`,
        '',
        '不明点があれば作業前に質問してください。契約条件や法的判断は行わず、仕様の明確化に集中してください。'
      ].join('\n');
    }
    return [
      '# Codex task prompt',
      '',
      `You are helping implement an outsourced task. Work type: ${input.workType || 'Not specified'}.`,
      `Purpose: ${input.purpose || 'Not specified'}`,
      '',
      '## Scope',
      bullets(input.deliverables, '未指定', 'Not specified'),
      '',
      '## Out of scope',
      bullets(input.outOfScope, '未指定', 'Not specified'),
      '',
      '## Constraints / acceptance',
      `- Deadline: ${input.deadline || 'Not specified'}`,
      `- Budget: ${input.budget || 'Not specified'}`,
      `- Acceptance method: ${input.acceptanceMethod || 'Not specified'}`,
      `- Must-have requirements: ${input.mustHave.join(' / ') || 'Not specified'}`,
      '',
      'Ask questions before working if anything is unclear. Do not make legal judgments; focus on clarifying the specification.'
    ].join('\n');
  }

  function buildGithubIssue(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    if (ja) {
      return [
        `# ${input.workType || '外注タスク'}: ${input.purpose || '目的未指定'}`,
        '',
        '## 概要',
        `- 納期: ${input.deadline || '未指定'}`,
        `- 予算: ${input.budget || '未指定'}`,
        `- 連絡方法: ${input.communication || '未指定'}`,
        '',
        '## Scope',
        bullets(input.deliverables, '未指定', 'Not specified'),
        '',
        '## Out of scope',
        bullets(input.outOfScope, '未指定', 'Not specified'),
        '',
        '## Acceptance Criteria',
        buildAcceptanceChecklist('ja'),
        '',
        '## Notes',
        bullets(input.references, '未指定', 'Not specified')
      ].join('\n');
    }
    return [
      `# ${input.workType || 'Outsourced task'}: ${input.purpose || 'Purpose not specified'}`,
      '',
      '## Summary',
      `- Deadline: ${input.deadline || 'Not specified'}`,
      `- Budget: ${input.budget || 'Not specified'}`,
      `- Communication: ${input.communication || 'Not specified'}`,
      '',
      '## Scope',
      bullets(input.deliverables, '未指定', 'Not specified'),
      '',
      '## Out of scope',
      bullets(input.outOfScope, '未指定', 'Not specified'),
      '',
      '## Acceptance Criteria',
      buildAcceptanceChecklist('en'),
      '',
      '## Notes',
      bullets(input.references, '未指定', 'Not specified')
    ].join('\n');
  }

  function buildProHandoffPack(locale = lang()) {
    const ja = locale === 'ja';
    const input = collectInput();
    if (ja) {
      return [
        '# Full Outsource Handoff Pack',
        '',
        buildFreeSpec('ja'),
        '',
        '## 詳細条件',
        `- 納品形式: ${input.deliveryFormat || '未指定'}`,
        `- 連絡方法: ${input.communication || '未指定'}`,
        `- 支払い条件: ${input.paymentTerms || '未指定'}`,
        `- 権利/利用範囲: ${input.rightsUsage || '未指定'}`,
        `- 実績公開可否: ${input.portfolioPermission || '未指定'}`,
        `- 秘密保持: ${input.confidentiality || '未指定'}`,
        '',
        buildDeliverablePack('ja'),
        '',
        buildAcceptanceChecklist('ja'),
        '',
        buildVendorQuestionList('ja'),
        '',
        buildRiskMemo('ja'),
        '',
        buildCodexPrompt('ja'),
        '',
        buildGithubIssue('ja')
      ].join('\n');
    }
    return [
      '# Full Outsource Handoff Pack',
      '',
      buildFreeSpec('en'),
      '',
      '## Detailed terms',
      `- Delivery format: ${input.deliveryFormat || 'Not specified'}`,
      `- Communication: ${input.communication || 'Not specified'}`,
      `- Payment terms: ${input.paymentTerms || 'Not specified'}`,
      `- Rights / usage scope: ${input.rightsUsage || 'Not specified'}`,
      `- Portfolio permission: ${input.portfolioPermission || 'Not specified'}`,
      `- Confidentiality: ${input.confidentiality || 'Not specified'}`,
      '',
      buildDeliverablePack('en'),
      '',
      buildAcceptanceChecklist('en'),
      '',
      buildVendorQuestionList('en'),
      '',
      buildRiskMemo('en'),
      '',
      buildCodexPrompt('en'),
      '',
      buildGithubIssue('en')
    ].join('\n');
  }

  function updateFreeOutput() {
    $('outputJa').textContent = buildFreeSpec('ja');
    $('outputEn').textContent = buildFreeSpec('en');
    generated = true;
  }

  function showProOutput(key, builder) {
    if (!requirePro()) return;
    if (!generated) updateFreeOutput();
    lastProOutputs[key] = {
      ja: builder('ja'),
      en: builder('en')
    };
    $('proOutputJa').textContent = lastProOutputs[key].ja;
    $('proOutputEn').textContent = lastProOutputs[key].en;
    toast(t('Pro出力を生成しました。', 'Generated Pro output.'));
  }

  function requirePro() {
    if (isProActive()) return true;
    toast(t('Pro限定機能です。Buy Proから共通Proを有効化すると利用できます。', 'This is a Pro-only feature. Use Buy Pro to unlock common Pro.'));
    const firstBuy = document.querySelector('[data-pro-buy]');
    if (firstBuy) firstBuy.focus({ preventScroll: false });
    return false;
  }

  async function copyText(text, successMessage) {
    if (!text) {
      toast(t('先に出力を生成してください。', 'Generate output first.'));
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast(successMessage);
    } catch (error) {
      toast(t('コピーできませんでした。ブラウザの権限を確認してください。', 'Could not copy. Check browser permissions.'));
    }
  }

  function currentOutput(key, builder) {
    if (!lastProOutputs[key]) {
      lastProOutputs[key] = { ja: builder('ja'), en: builder('en') };
    }
    return lastProOutputs[key][lang()];
  }

  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportMarkdown() {
    if (!requirePro()) return;
    const locale = lang();
    const text = buildProHandoffPack(locale);
    download('outsource-handoff-pack.md', text, 'text/markdown;charset=utf-8');
    toast(t('Markdownを保存しました。', 'Markdown exported.'));
  }

  function exportJson() {
    if (!requirePro()) return;
    const locale = lang();
    const payload = {
      tool_id: 'outsource-spec-generator',
      entitlement: 'nicheworks_pro',
      generated_at: new Date().toISOString(),
      language: locale,
      input: collectInput(),
      outputs: {
        free_spec: buildFreeSpec(locale),
        handoff_pack: buildProHandoffPack(locale),
        deliverable_pack: buildDeliverablePack(locale),
        acceptance_checklist: buildAcceptanceChecklist(locale),
        vendor_questions: buildVendorQuestionList(locale),
        codex_prompt: buildCodexPrompt(locale),
        github_issue: buildGithubIssue(locale)
      }
    };
    download('outsource-handoff-pack.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    toast(t('JSONを保存しました。', 'JSON exported.'));
  }

  function initLanguage() {
    let initial = (navigator.language || '').startsWith('ja') ? 'ja' : 'en';
    const saved = safeStorageGet('nw_lang');
    if (saved === 'ja' || saved === 'en') initial = saved;
    $$('.nw-lang-switch button').forEach((button) => {
      button.addEventListener('click', () => applyLang(button.dataset.lang));
    });
    applyLang(initial);
  }

  function init() {
    initLanguage();
    $('outputJa').textContent = '必須項目を入力して「簡易仕様書を生成」を押してください。';
    $('outputEn').textContent = 'Fill in the required fields, then click Generate free spec.';
    $('proOutputJa').textContent = 'PreviewモードではPro出力のサンプルを確認できます。Pro解放後、ここに詳細パックを生成できます。';
    $('proOutputEn').textContent = 'Preview mode shows Pro samples. After Pro is unlocked, detailed packs appear here.';

    $('generateBtn').addEventListener('click', () => {
      if (!validateRequired()) return;
      updateFreeOutput();
      toast(t('簡易仕様書を生成しました。', 'Generated free spec.'));
    });
    $('copyBtn').addEventListener('click', () => {
      if (!generated) {
        if (!validateRequired()) return;
        updateFreeOutput();
      }
      copyText(lang() === 'ja' ? $('outputJa').textContent : $('outputEn').textContent, t('簡易仕様書をコピーしました。', 'Copied free spec.'));
    });

    $('handoffBtn').addEventListener('click', () => showProOutput('handoff', buildProHandoffPack));
    $('packBtn').addEventListener('click', () => showProOutput('deliverable', buildDeliverablePack));
    $('checklistBtn').addEventListener('click', () => showProOutput('checklist', buildAcceptanceChecklist));
    $('questionsBtn').addEventListener('click', () => showProOutput('questions', buildVendorQuestionList));
    $('codexBtn').addEventListener('click', () => showProOutput('codex', buildCodexPrompt));
    $('issueBtn').addEventListener('click', () => showProOutput('issue', buildGithubIssue));

    $('copyHandoffBtn').addEventListener('click', () => requirePro() && copyText(currentOutput('handoff', buildProHandoffPack), t('Full Handoff Packをコピーしました。', 'Copied full handoff pack.')));
    $('copyChecklistBtn').addEventListener('click', () => requirePro() && copyText(currentOutput('checklist', buildAcceptanceChecklist), t('検収チェックリストをコピーしました。', 'Copied acceptance checklist.')));
    $('copyQuestionsBtn').addEventListener('click', () => requirePro() && copyText(currentOutput('questions', buildVendorQuestionList), t('質問リストをコピーしました。', 'Copied vendor question list.')));
    $('copyCodexBtn').addEventListener('click', () => requirePro() && copyText(currentOutput('codex', buildCodexPrompt), t('Codex依頼文をコピーしました。', 'Copied Codex task.')));
    $('copyIssueBtn').addEventListener('click', () => requirePro() && copyText(currentOutput('issue', buildGithubIssue), t('GitHub Issueをコピーしました。', 'Copied GitHub Issue.')));
    $('exportBtn').addEventListener('click', exportMarkdown);
    $('jsonBtn').addEventListener('click', exportJson);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.OutsourceSpecGenerator = {
    buildFreeSpec,
    buildProHandoffPack,
    buildDeliverablePack,
    buildAcceptanceChecklist,
    buildVendorQuestionList,
    buildCodexPrompt,
    buildGithubIssue,
    exportMarkdown,
    exportJson
  };
})();
