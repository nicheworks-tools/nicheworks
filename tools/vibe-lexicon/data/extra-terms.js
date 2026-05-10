(function () {
  'use strict';
  var base = Array.isArray(window.VIBE_LEXICON_TERMS) ? window.VIBE_LEXICON_TERMS : [];
  var used = new Set(base.map(function (item) { return item && item.id; }));

  function entry(id, en, ja, categoryEn, categoryJa, typeEn, typeJa, useEn, useJa, intentEn, intentJa, misuseEn, misuseJa) {
    return {
      id: id,
      term: { en: en, ja: ja },
      aliases: {
        en: [en.toLowerCase(), intentEn.split(' ').slice(0, 4).join(' '), useEn],
        ja: [ja, useJa, intentJa]
      },
      searchPhrases: {
        en: [intentEn, misuseEn, 'how to ask AI for ' + en.toLowerCase(), 'make this more ' + en.toLowerCase()],
        ja: [intentJa, misuseJa, ja + 'にしたい', 'AIに' + ja + 'を依頼したい']
      },
      category: { en: categoryEn, ja: categoryJa },
      termType: { en: typeEn, ja: typeJa },
      useCase: { en: useEn, ja: useJa },
      beginner: { en: intentEn, ja: intentJa },
      practicalIntent: { en: intentEn, ja: intentJa },
      practicalUseCase: { en: 'Use when ' + useEn.toLowerCase() + ' needs clearer execution criteria.', ja: useJa + 'で実装基準を明確にしたい時に使います。' },
      plainExplanation: { en: en + ' means giving AI a clearer target than a mood word.', ja: ja + 'は、雰囲気だけでなくAIが実行できる基準へ落とすための言葉です。' },
      commonMisuse: { en: misuseEn, ja: misuseJa },
      vagueToPractical: {
        en: ['Name the target surface', 'Add measurable constraints', 'Describe the desired user effect', 'Include one review criterion'],
        ja: ['対象画面を指定する', '測定できる制約を入れる', 'ユーザーへの効果を説明する', '確認基準を1つ入れる']
      },
      badRequest: { en: 'Make it ' + en.toLowerCase() + '.', ja: ja + 'にして。' },
      betterRequest: { en: 'Make this ' + useEn.toLowerCase() + ' more ' + en.toLowerCase() + ' by applying: ' + intentEn, ja: useJa + 'を' + ja + 'にするため、' + intentJa + '。' },
      badBetterWhy: { en: 'The better request turns a mood word into a concrete constraint set.', ja: '良い依頼は雰囲気語を具体的な制約と確認基準に変換しています。' },
      shortPrompt: {
        en: {
          ui: 'Improve this UI for ' + en.toLowerCase() + ': ' + intentEn,
          lp: 'Revise this landing page for ' + en.toLowerCase() + ': ' + intentEn,
          form: 'Improve this form for ' + en.toLowerCase() + ': ' + intentEn,
          mobile: 'Adapt the mobile version for ' + en.toLowerCase() + ': ' + intentEn
        },
        ja: {
          ui: 'このUIを' + ja + 'にしてください。' + intentJa + '。',
          lp: 'このLPを' + ja + 'にしてください。' + intentJa + '。',
          form: 'このフォームを' + ja + 'にしてください。' + intentJa + '。',
          mobile: 'モバイル版を' + ja + 'にしてください。' + intentJa + '。'
        }
      },
      compareRelationships: [],
      compareGuides: {}
    };
  }

  var extra = [
    entry('calm', 'Calm', '落ち着いた', 'Style goal', '雰囲気語', 'Vague term', '曖昧語', 'Brand page', 'ブランド訴求', 'Reduce loud colors, heavy shadows, and competing emphasis.', '強い色・重い影・過剰な強調を抑える', 'Making everything pale and low contrast.', '全体を薄くして読みにくくすること'),
    entry('bold', 'Bold', '大胆な', 'Style goal', '雰囲気語', 'Vague term', '曖昧語', 'Hero section', 'ヒーロー改善', 'Use larger hierarchy, stronger contrast, and fewer competing messages.', '大きな階層・強いコントラスト・少ない主張に整理する', 'Making every element oversized.', 'すべてを大きくして強弱を失うこと'),
    entry('premium', 'Premium', 'プレミアム感', 'Style goal', '雰囲気語', 'Vague term', '曖昧語', 'Pricing page', '価格ページ', 'Increase trust cues, consistency, spacing, and restrained visual detail.', '信頼要素・一貫性・余白・抑制された装飾を増やす', 'Adding gold gradients and luxury clichés.', '金色や高級風装飾だけを足すこと'),
    entry('friendly', 'Friendly', '親しみやすい', 'Tone', 'トーン', 'Vague term', '曖昧語', 'Onboarding', 'オンボーディング', 'Use warmer microcopy, lower pressure CTAs, and plain explanations.', '温かい文言・低圧なCTA・平易説明にする', 'Becoming childish or overly casual.', '幼稚または馴れ馴れしくすること'),
    entry('professional', 'Professional', 'プロっぽい', 'Tone', 'トーン', 'Vague term', '曖昧語', 'B2B page', 'B2Bページ', 'Use precise wording, evidence, consistent layout, and clear next steps.', '正確な文言・根拠・一貫レイアウト・明確な次導線にする', 'Using stiff jargon without clarity.', '硬い専門用語だけを増やすこと'),
    entry('trustworthy', 'Trustworthy', '信頼できる', 'Trust', '信頼性', 'Practical term', '実務語', 'Conversion page', 'CVページ', 'Surface proof, limitations, source context, and realistic expectations.', '根拠・制限・情報源・現実的な期待値を見せる', 'Adding badges without proof.', '根拠のないバッジを並べること'),
    entry('credible', 'Credible', '説得力がある', 'Trust', '信頼性', 'Practical term', '実務語', 'Landing page', 'LP改善', 'Connect claims to proof, examples, numbers, or visible methodology.', '主張を根拠・例・数値・方法論につなげる', 'Making stronger claims without evidence.', '根拠なしに強い主張をすること'),
    entry('transparent', 'Transparent', '透明性がある', 'Trust', '信頼性', 'Practical term', '実務語', 'Policy page', 'ポリシー説明', 'Explain data, limits, assumptions, and what the tool does not do.', 'データ・限界・前提・できないことを説明する', 'Hiding tradeoffs behind friendly copy.', '都合の悪い制限を隠すこと'),
    entry('actionable', 'Actionable', '実行しやすい', 'Instruction quality', '指示品質', 'Practical term', '実務語', 'AI prompt', 'AI依頼', 'Turn advice into steps, constraints, owners, and acceptance checks.', '助言を手順・制約・担当・受入基準に変換する', 'Giving motivational but non-specific advice.', '励ましだけで具体策がないこと'),
    entry('specific', 'Specific', '具体的', 'Instruction quality', '指示品質', 'Practical term', '実務語', 'AI prompt', 'AI依頼', 'Add scope, examples, constraints, and non-goals.', '範囲・例・制約・やらないことを入れる', 'Adding long text without narrowing the task.', '長文化しても範囲が絞れていないこと'),
    entry('concise', 'Concise', '簡潔', 'Copywriting', 'コピー改善', 'Practical term', '実務語', 'Microcopy', 'マイクロコピー', 'Remove repetition, keep the main message, and preserve required context.', '重複を削り、主文を残し、必要文脈を保つ', 'Deleting important caveats.', '重要な注意まで削ること'),
    entry('direct', 'Direct', '率直', 'Copywriting', 'コピー改善', 'Practical term', '実務語', 'CTA copy', 'CTA文言', 'State the action and result without vague persuasion.', '行動と結果を曖昧な説得なしで示す', 'Sounding rude or pushy.', 'きつい命令口調になること'),
    entry('human', 'Human', '人間味がある', 'Tone', 'トーン', 'Vague term', '曖昧語', 'Support copy', 'サポート文面', 'Use natural phrasing, empathy, and clear next steps.', '自然な表現・共感・次の行動を入れる', 'Over-apologizing or pretending intimacy.', '謝りすぎたり距離感を誤ること'),
    entry('confident', 'Confident', '自信がある', 'Tone', 'トーン', 'Vague term', '曖昧語', 'Sales copy', '販売文面', 'Use decisive structure, proof, and clear claims within limits.', '断定構造・根拠・範囲内の明確な主張にする', 'Overpromising outcomes.', '成果保証のように言い切ること'),
    entry('safe', 'Safe', '安全そう', 'Trust', '信頼性', 'Vague term', '曖昧語', 'Tool page', 'ツールページ', 'Explain local processing, stored data, external scripts, and user control.', 'ローカル処理・保存内容・外部タグ・ユーザー制御を説明する', 'Claiming perfect safety.', '完全安全と言い切ること'),
    entry('accessible', 'Accessible', 'アクセシブル', 'Accessibility', 'アクセシビリティ', 'Practical term', '実務語', 'UI review', 'UI確認', 'Check contrast, keyboard paths, labels, focus, and reduced motion.', 'コントラスト・キーボード・ラベル・フォーカス・動き軽減を確認する', 'Treating accessibility as only color contrast.', '色だけの問題にすること'),
    entry('keyboard-friendly', 'Keyboard-friendly', 'キーボード操作しやすい', 'Accessibility', 'アクセシビリティ', 'Practical term', '実務語', 'Form UX', 'フォームUX', 'Ensure focus order, visible focus, and no mouse-only actions.', 'フォーカス順・可視フォーカス・マウス専用操作なしにする', 'Only adding tabindex randomly.', 'tabindexを雑に足すこと'),
    entry('low-cognitive-load', 'Low cognitive load', '認知負荷が低い', 'UX quality', 'UX品質', 'Practical term', '実務語', 'Dashboard UX', 'ダッシュボードUX', 'Reduce choices, group related items, and show progressive detail.', '選択肢を減らし、関連項目をまとめ、段階表示にする', 'Hiding necessary information.', '必要情報まで隠すこと'),
    entry('discoverable', 'Discoverable', '見つけやすい', 'UX quality', 'UX品質', 'Practical term', '実務語', 'Navigation', 'ナビゲーション', 'Expose important actions through labels, placement, and predictable patterns.', '重要操作をラベル・配置・予測可能なパターンで見せる', 'Adding too many links everywhere.', 'リンクを増やしすぎること'),
    entry('forgiving', 'Forgiving', '失敗に強い', 'UX quality', 'UX品質', 'Practical term', '実務語', 'Error UX', 'エラーUX', 'Add undo, confirmation, safe defaults, and recovery messages.', '取消・確認・安全な初期値・復旧文言を入れる', 'Blocking every action with alerts.', '全操作に確認を出して邪魔にすること'),
    entry('conversion-focused', 'Conversion-focused', 'CV重視', 'Conversion', 'CV改善', 'Practical term', '実務語', 'Landing page', 'LP改善', 'Clarify one conversion goal, remove distractions, and support the CTA.', '1つのCV目標を明確にし、邪魔を減らし、CTAを支える', 'Turning the page into aggressive sales copy.', '押し売り感の強い文面にすること'),
    entry('low-friction', 'Low friction', '摩擦が少ない', 'Conversion', 'CV改善', 'Practical term', '実務語', 'Signup flow', '登録導線', 'Remove unnecessary fields, steps, decisions, and surprise requirements.', '不要な項目・手順・判断・予期しない条件を削る', 'Removing useful confirmation and context.', '必要な確認や文脈まで削ること'),
    entry('reassuring', 'Reassuring', '安心できる', 'Conversion', 'CV改善', 'Practical term', '実務語', 'Checkout', '決済導線', 'Add pricing clarity, cancellation notes, privacy cues, and support paths.', '価格・解約・プライバシー・サポート導線を明確にする', 'Adding vague comfort copy.', '根拠のない安心文言だけ足すこと'),
    entry('mobile-first', 'Mobile-first', 'モバイル優先', 'Mobile UX', 'モバイルUX', 'Practical term', '実務語', 'Mobile layout', 'モバイル画面', 'Design single-column flow, thumb-friendly actions, and compressed summaries.', '1カラム・親指操作・短い要約を基準にする', 'Simply shrinking the desktop layout.', 'PC画面を縮小するだけにすること'),
    entry('thumb-friendly', 'Thumb-friendly', '親指操作しやすい', 'Mobile UX', 'モバイルUX', 'Practical term', '実務語', 'Mobile UI', 'モバイルUI', 'Place primary actions within reachable zones and avoid tiny targets.', '主要操作を届きやすい位置に置き、小さいタップ領域を避ける', 'Moving everything to the bottom without priority.', '優先度なしに全部下へ置くこと'),
    entry('glanceable', 'Glanceable', '一目で分かる', 'Information design', '情報設計', 'Practical term', '実務語', 'Status page', 'ステータス表示', 'Show the most important state, change, and next action first.', '最重要状態・変化・次アクションを先に見せる', 'Using big numbers without context.', '文脈のない大きな数字だけ置くこと'),
    entry('structured', 'Structured', '構造化された', 'Information design', '情報設計', 'Practical term', '実務語', 'Docs', 'ドキュメント', 'Organize by goal, section, dependency, and review path.', '目的・セクション・依存関係・確認導線で整理する', 'Adding headings without changing order.', '見出しだけ足して順序を直さないこと'),
    entry('prioritized', 'Prioritized', '優先順位がある', 'Information design', '情報設計', 'Practical term', '実務語', 'Roadmap', 'ロードマップ', 'Rank by impact, urgency, dependency, and effort.', '影響・緊急度・依存・工数で順位付けする', 'Sorting by personal preference only.', '好みだけで並べること'),
    entry('consistent', 'Consistent', '一貫性がある', 'System quality', 'システム品質', 'Practical term', '実務語', 'Design system', 'デザインシステム', 'Reuse naming, spacing, components, states, and interaction rules.', '命名・余白・部品・状態・操作ルールを再利用する', 'Making everything identical.', '全部を同じ見た目にすること'),
    entry('maintainable', 'Maintainable', '保守しやすい', 'System quality', 'システム品質', 'Practical term', '実務語', 'Implementation', '実装', 'Reduce one-off logic, duplicate styles, and unclear ownership.', '個別ロジック・重複スタイル・不明な責任範囲を減らす', 'Over-abstracting too early.', '早すぎる抽象化をすること'),
    entry('resilient', 'Resilient', '壊れにくい', 'System quality', 'システム品質', 'Practical term', '実務語', 'Error handling', 'エラー処理', 'Handle empty, loading, failure, partial, and permission states.', '空・読込・失敗・部分成功・権限状態を扱う', 'Only handling the happy path.', '正常系だけ作ること'),
    entry('reviewable', 'Reviewable', 'レビューしやすい', 'Workflow', 'ワークフロー', 'Practical term', '実務語', 'AI output', 'AI出力', 'Separate assumptions, changes, risks, and acceptance checks.', '前提・変更点・リスク・受入基準を分ける', 'Returning polished text without rationale.', '理由なしの完成文だけ返すこと'),
    entry('decision-ready', 'Decision-ready', '判断できる', 'Workflow', 'ワークフロー', 'Practical term', '実務語', 'Report', 'レポート', 'Include options, tradeoffs, recommendation, and confidence level.', '選択肢・トレードオフ・推奨・確信度を含める', 'Listing information without a decision frame.', '情報だけ並べて判断軸がないこと'),
    entry('implementation-ready', 'Implementation-ready', '実装に移せる', 'Workflow', 'ワークフロー', 'Practical term', '実務語', 'Spec', '仕様書', 'Add files, states, acceptance criteria, and non-goals.', '対象ファイル・状態・受入基準・除外事項を入れる', 'Writing only a high-level concept.', '抽象方針だけで終わること'),
    entry('clear-scope', 'Clear scope', '範囲が明確', 'Workflow', 'ワークフロー', 'Practical term', '実務語', 'Task request', '作業依頼', 'Define included work, excluded work, affected files, and done state.', '含む作業・除外作業・影響ファイル・完了条件を定義する', 'Saying fix everything.', '全部直してと言うこと'),
    entry('edge-case-aware', 'Edge-case aware', '例外に強い', 'Quality', '品質', 'Practical term', '実務語', 'QA', 'QA', 'Ask for empty, long, malformed, duplicate, and permission edge cases.', '空・長文・不正形式・重複・権限の例外を確認する', 'Testing only normal examples.', '普通の例だけで確認すること'),
    entry('privacy-conscious', 'Privacy-conscious', 'プライバシー配慮', 'Trust', '信頼性', 'Practical term', '実務語', 'Data handling', 'データ扱い', 'Explain what is stored, where it runs, and what leaves the browser.', '保存内容・実行場所・ブラウザ外へ出る情報を説明する', 'Saying local-only while loading external scripts.', '外部タグがあるのに完全ローカルと言うこと'),
    entry('compliance-aware', 'Compliance-aware', 'コンプラ配慮', 'Trust', '信頼性', 'Practical term', '実務語', 'Public copy', '公開文面', 'Avoid guarantees, unsupported claims, and missing disclaimers.', '保証・未根拠主張・注意不足を避ける', 'Adding legal-looking text without accuracy.', '法務っぽい文を雑に足すこと'),
    entry('beginner-friendly', 'Beginner-friendly', '初心者向け', 'Audience fit', '対象者適合', 'Practical term', '実務語', 'Guide', 'ガイド', 'Use plain words, examples, step order, and visible next actions.', '平易語・例・手順順・次アクションを出す', 'Removing important details.', '重要情報を削ること'),
    entry('expert-friendly', 'Expert-friendly', '上級者向け', 'Audience fit', '対象者適合', 'Practical term', '実務語', 'Reference', 'リファレンス', 'Show dense controls, assumptions, shortcuts, and exportable details.', '高密度操作・前提・ショートカット・出力詳細を出す', 'Making the page cryptic.', '説明不足で分かりにくくすること'),
    entry('opinionated', 'Opinionated', '方針がある', 'Product voice', 'プロダクト表現', 'Vague term', '曖昧語', 'Product copy', 'プロダクト文面', 'Make a clear recommendation and explain when not to follow it.', '明確な推奨と適用しない場合を説明する', 'Pretending one answer fits all.', '万能解のように見せること'),
    entry('neutral', 'Neutral', '中立的', 'Product voice', 'プロダクト表現', 'Practical term', '実務語', 'Comparison', '比較', 'Present tradeoffs without pushing one option unfairly.', '片方を不当に推さずトレードオフを示す', 'Being vague to avoid judgment.', '判断を避けて曖昧にすること'),
    entry('memorable', 'Memorable', '印象に残る', 'Branding', 'ブランディング', 'Vague term', '曖昧語', 'Naming', '命名', 'Use contrast, specificity, rhythm, and repeatable phrases.', '対比・具体性・リズム・反復しやすさを使う', 'Forcing cleverness over clarity.', '分かりやすさより上手い言い回しを優先すること'),
    entry('distinctive', 'Distinctive', '差別化された', 'Branding', 'ブランディング', 'Vague term', '曖昧語', 'Positioning', 'ポジショニング', 'Name the contrast against alternatives and the reason to choose this.', '代替との差分と選ぶ理由を明示する', 'Claiming uniqueness without contrast.', '比較なしに唯一性を主張すること'),
    entry('useful', 'Useful', '役に立つ', 'Value', '価値', 'Vague term', '曖昧語', 'Tool page', 'ツールページ', 'Show the job, input, output, and when the result helps.', '用途・入力・出力・役立つ場面を示す', 'Only saying it saves time.', '時短と言うだけで具体性がないこと'),
    entry('practical', 'Practical', '実用的', 'Value', '価値', 'Practical term', '実務語', 'Tool page', 'ツールページ', 'Prioritize real workflows, copyable output, and clear limits.', '実作業・コピー可能出力・明確な限界を優先する', 'Adding features that look good but solve little.', '見栄えだけの機能を足すこと'),
    entry('shippable', 'Shippable', '公開できる', 'Shipping', '公開準備', 'Practical term', '実務語', 'Release check', 'リリース確認', 'Check broken states, copy accuracy, links, privacy notes, and analytics.', '壊れ状態・文言・リンク・注意・計測を確認する', 'Calling a prototype finished.', '試作品を完成扱いすること'),
    entry('polished', 'Polished', '仕上がっている', 'Shipping', '公開準備', 'Vague term', '曖昧語', 'Final QA', '最終確認', 'Remove rough placeholders, inconsistent spacing, broken labels, and dead links.', '仮文・余白ズレ・壊れラベル・死リンクを消す', 'Adding surface decoration only.', '表面装飾だけ足すこと')
  ];

  extra.forEach(function (item) {
    if (!used.has(item.id)) {
      used.add(item.id);
      base.push(item);
    }
  });
  window.VIBE_LEXICON_TERMS = base;
})();
