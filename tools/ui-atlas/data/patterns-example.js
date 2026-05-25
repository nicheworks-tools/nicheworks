// UI Atlas canonical pattern record examples.
// This file is a migration reference, not the active catalog yet.
// Target active catalog: tools/ui-atlas/data/patterns.js

export const UI_ATLAS_PATTERN_EXAMPLES = [
  {
    id: 'confirmation-dialog',
    slug: 'confirmation-dialog',
    status: 'active',
    tier: 'free',

    name_en: 'Confirmation dialog',
    name_ja: '確認ダイアログ',
    aliases_en: ['confirm modal', 'destructive action dialog', 'are you sure dialog'],
    aliases_ja: ['確認モーダル', '削除確認', '実行前確認'],

    category: 'feedback-status',
    subcategory: 'confirmation',
    purpose: ['confirmation', 'risk-reduction', 'review-before-apply'],

    summary_en: 'A blocking dialog that asks the user to confirm a meaningful, risky, or irreversible action before it is applied.',
    summary_ja: '重要・危険・取り消しにくい操作を実行する前に、ユーザーへ明示的な確認を求めるUIです。',
    beginner_wording_en: 'Use this when the user needs one last chance to stop before a serious action.',
    beginner_wording_ja: '重大な操作の前に、最後に止まれる機会を作るUIです。',

    best_for_en: 'Deleting data, changing permissions, publishing, billing changes, and irreversible operations.',
    best_for_ja: 'データ削除、権限変更、公開、請求変更、取り消しにくい操作。',
    not_for_en: 'Low-risk actions, frequent small interactions, or actions where undo is enough.',
    not_for_ja: '低リスク操作、頻繁な小操作、Undoで十分な操作。',

    similar_patterns: ['inline-warning', 'toast-with-action', 'bottom-sheet-confirmation'],
    compare_notes_en: 'Use a confirmation dialog when the action must be blocked until the user decides. Use toast or inline warning when the action is low risk or easily reversible.',
    compare_notes_ja: 'ユーザーが判断するまで操作を止める必要がある場合は確認ダイアログを使います。低リスク・取り消し可能ならトーストやインライン警告を検討します。',

    short_ai_prompt_en: 'Create an accessible confirmation dialog for a risky action with clear consequence copy and cancel/confirm actions.',
    short_ai_prompt_ja: '危険操作用のアクセシブルな確認ダイアログを作成し、影響範囲の説明とキャンセル/実行ボタンを含めてください。',
    handoff_prompt_en: 'Implement a confirmation dialog for a risky or irreversible action. Include clear title, consequence copy, cancel path, distinct destructive action, focus trap, Escape behavior, focus return, loading state after submit, and mobile layout.',
    handoff_prompt_ja: '危険または取り消しにくい操作用の確認ダイアログを実装してください。明確なタイトル、影響範囲の説明、キャンセル導線、危険操作ボタンの区別、フォーカストラップ、Escape挙動、フォーカス復帰、送信後ローディング、モバイル表示を含めてください。',

    implementation_note_en: 'Do not rely only on color. Keep cancel visible. Prevent double-submit after confirmation.',
    implementation_note_ja: '色だけに依存せず、キャンセルを見える位置に残し、確認後の二重送信を防いでください。',
    accessibility_note_en: 'Use dialog semantics, label the dialog, trap focus while open, support Escape, and restore focus after close.',
    accessibility_note_ja: 'dialog semantics、ラベル付け、開いている間のフォーカストラップ、Escape対応、閉じた後のフォーカス復帰を確認してください。',
    mobile_note_en: 'Use enough vertical space for consequence copy and keep primary/cancel actions reachable at narrow widths.',
    mobile_note_ja: '影響範囲の説明が読める高さを確保し、狭い画面でも実行/キャンセルが押しやすい状態にしてください。',

    mobile_fit: 'medium',
    difficulty: 'medium',
    content_density: 'medium',
    risk_level: 'high',

    sample_type: 'modal',
    sample_config: {
      title_en: 'Delete project?',
      title_ja: 'プロジェクトを削除しますか？',
      body_en: 'This cannot be undone.',
      body_ja: 'この操作は元に戻せません。'
    },

    pro_memo_template_en: 'Use Confirmation dialog because the action is risky and must be explicitly confirmed. Reject toast-only confirmation because it can be missed.',
    pro_memo_template_ja: 'この操作は危険で明示的な確認が必要なため、確認ダイアログを採用します。見落とされる可能性があるため、トーストのみの確認は却下します。',

    related_tools: ['motion-atlas', 'ai-interaction-atlas'],
    tags: ['confirmation', 'modal', 'destructive-action', 'accessibility']
  },
  {
    id: 'ai-suggestion-card',
    slug: 'ai-suggestion-card',
    status: 'active',
    tier: 'free',

    name_en: 'AI suggestion card',
    name_ja: 'AI提案カード',
    aliases_en: ['copilot suggestion', 'AI recommendation card', 'assistant suggestion'],
    aliases_ja: ['AI提案', 'Copilot提案', 'AIおすすめカード'],

    category: 'ai-interaction',
    subcategory: 'suggestion',
    purpose: ['review-before-apply', 'handoff', 'status-feedback'],

    summary_en: 'A card that presents an AI-generated suggestion with enough context for the user to accept, edit, reject, or inspect it.',
    summary_ja: 'AIが生成した提案を、受け入れ・編集・却下・確認できる文脈つきカードとして表示するUIです。',
    beginner_wording_en: 'Use this when AI is helping but the user should stay in control.',
    beginner_wording_ja: 'AIが補助するが、最終判断はユーザーに残したい時のUIです。',

    best_for_en: 'Draft suggestions, cleanup recommendations, review queues, and assistant-style product guidance.',
    best_for_ja: '下書き提案、修正提案、レビューキュー、アシスタント型の案内。',
    not_for_en: 'Automatic high-risk changes, irreversible actions, or results that require strict proof.',
    not_for_ja: '高リスクな自動変更、取り消せない操作、厳密な根拠が必要な結果。',

    similar_patterns: ['review-before-apply', 'generated-draft-diff', 'human-approval-gate'],
    compare_notes_en: 'Use AI suggestion card for lightweight review. Use generated draft diff when the exact before/after change matters.',
    compare_notes_ja: '軽い確認にはAI提案カードを使います。変更前後の差分が重要な場合は生成ドラフト差分を使います。',

    short_ai_prompt_en: 'Create an AI suggestion card with rationale, accept, edit, reject, and inspect actions.',
    short_ai_prompt_ja: '理由、受け入れ、編集、却下、確認アクションを持つAI提案カードを作成してください。',
    handoff_prompt_en: 'Implement an AI suggestion card that keeps the user in control. Include AI rationale, confidence wording without overclaiming, accept/edit/reject actions, inspect details, undo path when applied, and accessible button labels.',
    handoff_prompt_ja: 'ユーザーが主導権を持てるAI提案カードを実装してください。AIの理由、過剰に断定しない信頼度表現、受け入れ/編集/却下、詳細確認、適用後の取り消し導線、アクセシブルなボタンラベルを含めてください。',

    implementation_note_en: 'Do not imply the AI result is guaranteed. Always provide review and reversal paths for meaningful changes.',
    implementation_note_ja: 'AI結果を保証されたものに見せないでください。意味のある変更には確認と取り消し導線を用意してください。',
    accessibility_note_en: 'Ensure suggestion status, action labels, and generated content are clear to keyboard and screen-reader users.',
    accessibility_note_ja: '提案状態、操作ラベル、生成内容がキーボード操作・スクリーンリーダー利用者にも明確に伝わるようにしてください。',
    mobile_note_en: 'Keep the rationale concise and avoid placing accept/reject buttons too close together on narrow screens.',
    mobile_note_ja: '理由文を短く保ち、狭い画面で受け入れ/却下ボタンが近すぎないようにしてください。',

    mobile_fit: 'high',
    difficulty: 'medium',
    content_density: 'medium',
    risk_level: 'medium',

    sample_type: 'ai-suggestion',
    sample_config: {
      title_en: 'Suggested improvement',
      title_ja: '改善提案',
      body_en: 'AI found a shorter version of this message.',
      body_ja: 'AIがこの文面の短縮案を見つけました。'
    },

    pro_memo_template_en: 'Use AI suggestion card because the AI output should be reviewed before applying. Reject auto-apply because the user needs control and reversal.',
    pro_memo_template_ja: 'AI出力は適用前に確認すべきなので、AI提案カードを採用します。ユーザーの制御と取り消しが必要なため、自動適用は却下します。',

    related_tools: ['ai-interaction-atlas', 'motion-atlas'],
    tags: ['ai', 'suggestion', 'review', 'handoff']
  }
];
