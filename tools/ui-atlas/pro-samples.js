// UI Atlas Pro-only sample bank. Loaded directly by static HTML; no build step required.
(function () {
  window.UI_ATLAS_PRO_SAMPLES = [
  {
    "id": "permission-matrix",
    "slug": "permission-matrix",
    "name_en": "Permission matrix",
    "name_ja": "権限マトリクス",
    "category": "Complex Admin UI",
    "summary_en": "Permission matrix is a Pro-only UI sample for permissions across roles, resources, and actions. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "権限マトリクスは、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for admin teams reviewing access boundaries, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "権限マトリクスは、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for one-off permission toggles with only one role, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "権限マトリクスは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Permission matrix when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "権限マトリクスは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Permission matrix for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな権限マトリクスを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Permission matrix shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "権限マトリクス は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "role-change-confirmation",
      "bulk-action-review"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "role-change-confirmation",
    "slug": "role-change-confirmation",
    "name_en": "Role change confirmation",
    "name_ja": "ロール変更確認",
    "category": "Complex Admin UI",
    "summary_en": "Role change confirmation is a Pro-only UI sample for the before/after impact of changing a user role. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "ロール変更確認は、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for role upgrades, downgrades, and delegated admin changes, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "ロール変更確認は、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for low-risk profile edits, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "ロール変更確認は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Role change confirmation when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "ロール変更確認は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Role change confirmation for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなロール変更確認を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Role change confirmation shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "ロール変更確認 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "permission-matrix",
      "bulk-action-review"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "bulk-action-review",
    "slug": "bulk-action-review",
    "name_en": "Bulk action review",
    "name_ja": "一括操作レビュー",
    "category": "Complex Admin UI",
    "summary_en": "Bulk action review is a Pro-only UI sample for the selected records, action impact, and undo path before applying a bulk change. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "一括操作レビューは、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for admin bulk edits with irreversible or hard-to-audit consequences, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "一括操作レビューは、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for single-record edits, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "一括操作レビューは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Bulk action review when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "一括操作レビューは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Bulk action review for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな一括操作レビューを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Bulk action review shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "一括操作レビュー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "role-change-confirmation",
      "audit-log-detail"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "audit-log-detail",
    "slug": "audit-log-detail",
    "name_en": "Audit log detail",
    "name_ja": "監査ログ詳細",
    "category": "Complex Admin UI",
    "summary_en": "Audit log detail is a Pro-only UI sample for who changed what, when, from where, and why. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "監査ログ詳細は、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for security reviews, support investigations, and compliance traces, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "監査ログ詳細は、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for simple activity feeds with no investigation need, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "監査ログ詳細は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Audit log detail when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "監査ログ詳細は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Audit log detail for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな監査ログ詳細を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Audit log detail shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "監査ログ詳細 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "bulk-action-review",
      "admin-override-panel"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "admin-override-panel",
    "slug": "admin-override-panel",
    "name_en": "Admin override panel",
    "name_ja": "管理者オーバーライドパネル",
    "category": "Complex Admin UI",
    "summary_en": "Admin override panel is a Pro-only UI sample for a controlled way for privileged users to bypass a normal restriction with reason capture. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "管理者オーバーライドパネルは、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for support escalation and temporary exception workflows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "管理者オーバーライドパネルは、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for routine actions that should follow normal permission paths, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "管理者オーバーライドパネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Admin override panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "管理者オーバーライドパネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Admin override panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな管理者オーバーライドパネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Admin override panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "管理者オーバーライドパネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "audit-log-detail",
      "user-suspension-flow"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "high",
    "pro_only": true
  },
  {
    "id": "user-suspension-flow",
    "slug": "user-suspension-flow",
    "name_en": "User suspension flow",
    "name_ja": "ユーザー停止フロー",
    "category": "Complex Admin UI",
    "summary_en": "User suspension flow is a Pro-only UI sample for confirmation and communication steps for suspending account access. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "ユーザー停止フローは、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for abuse response, unpaid account holds, and security interventions, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "ユーザー停止フローは、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for temporary UI hiding or soft warnings, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "ユーザー停止フローは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use User suspension flow when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "ユーザー停止フローは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive User suspension flow for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなユーザー停止フローを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The User suspension flow shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "ユーザー停止フロー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "admin-override-panel",
      "data-export-request"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "data-export-request",
    "slug": "data-export-request",
    "name_en": "Data export request",
    "name_ja": "データエクスポート申請",
    "category": "Complex Admin UI",
    "summary_en": "Data export request is a Pro-only UI sample for request, scope, status, and delivery controls for exporting user or org data. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "データエクスポート申請は、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for GDPR exports, admin reporting, and queued large downloads, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "データエクスポート申請は、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for instant export of tiny public datasets, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "データエクスポート申請は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Data export request when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "データエクスポート申請は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Data export request for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなデータエクスポート申請を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Data export request shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "データエクスポート申請 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "user-suspension-flow",
      "organization-switcher"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "organization-switcher",
    "slug": "organization-switcher",
    "name_en": "Organization switcher",
    "name_ja": "組織スイッチャー",
    "category": "Complex Admin UI",
    "summary_en": "Organization switcher is a Pro-only UI sample for a safe selector for moving between organizations, workspaces, or tenants. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "組織スイッチャーは、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for multi-tenant SaaS where context mistakes are costly, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "組織スイッチャーは、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for single-workspace products, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "組織スイッチャーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Organization switcher when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "組織スイッチャーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Organization switcher for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな組織スイッチャーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Organization switcher shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "組織スイッチャー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "data-export-request",
      "workspace-billing-settings"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "workspace-billing-settings",
    "slug": "workspace-billing-settings",
    "name_en": "Workspace billing settings",
    "name_ja": "ワークスペース請求設定",
    "category": "Complex Admin UI",
    "summary_en": "Workspace billing settings is a Pro-only UI sample for billing ownership, plan, payment, and invoice controls scoped to a workspace. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "ワークスペース請求設定は、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for B2B SaaS workspaces with separate billing roles, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "ワークスペース請求設定は、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for personal account settings with no team billing, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "ワークスペース請求設定は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Workspace billing settings when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "ワークスペース請求設定は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Workspace billing settings for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなワークスペース請求設定を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Workspace billing settings shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "ワークスペース請求設定 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "organization-switcher",
      "danger-zone-panel"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "danger-zone-panel",
    "slug": "danger-zone-panel",
    "name_en": "Danger zone panel",
    "name_ja": "危険操作パネル",
    "category": "Complex Admin UI",
    "summary_en": "Danger zone panel is a Pro-only UI sample for a grouped area for destructive account, workspace, or data actions with friction. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "危険操作パネルは、複雑な管理画面で判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for settings pages that include delete, transfer, reset, or revoke actions, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "危険操作パネルは、複雑な管理画面で複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for ordinary preferences and reversible edits, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "危険操作パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Danger zone panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "危険操作パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Danger zone panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな危険操作パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Danger zone panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "危険操作パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "workspace-billing-settings"
    ],
    "rejected_alternatives": [
      "plain table",
      "single confirmation dialog"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "ai-suggestion-card",
    "slug": "ai-suggestion-card",
    "name_en": "AI suggestion card",
    "name_ja": "AI提案カード",
    "category": "AI / Agent UI",
    "summary_en": "AI suggestion card is a Pro-only UI sample for a concise recommendation from an AI system with reason, confidence, and action controls. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "AI提案カードは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for assistive workflows where users must stay in control, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "AI提案カードは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for fully automated decisions with no human review, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "AI提案カードは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use AI suggestion card when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "AI提案カードは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive AI suggestion card for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなAI提案カードを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The AI suggestion card shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "AI提案カード は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "ai-draft-diff",
      "human-approval-gate"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "ai-draft-diff",
    "slug": "ai-draft-diff",
    "name_en": "AI draft diff",
    "name_ja": "AI下書き差分",
    "category": "AI / Agent UI",
    "summary_en": "AI draft diff is a Pro-only UI sample for a side-by-side or inline comparison of original content and an AI-generated draft. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "AI下書き差分は、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for copy, code, policy, or message edits that need review, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "AI下書き差分は、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for tiny text suggestions where a diff would add noise, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "AI下書き差分は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use AI draft diff when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "AI下書き差分は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive AI draft diff for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなAI下書き差分を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The AI draft diff shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "AI下書き差分 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "ai-suggestion-card",
      "human-approval-gate"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "medium",
    "implementation_cost": "high",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "human-approval-gate",
    "slug": "human-approval-gate",
    "name_en": "Human approval gate",
    "name_ja": "人間承認ゲート",
    "category": "AI / Agent UI",
    "summary_en": "Human approval gate is a Pro-only UI sample for a checkpoint that pauses automation until an accountable human approves or rejects it. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "人間承認ゲートは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for high-impact agent actions and regulated workflows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "人間承認ゲートは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for low-risk suggestions that users can undo easily, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "人間承認ゲートは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Human approval gate when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "人間承認ゲートは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Human approval gate for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな人間承認ゲートを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Human approval gate shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "人間承認ゲート は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "ai-draft-diff",
      "agent-action-timeline"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "agent-action-timeline",
    "slug": "agent-action-timeline",
    "name_en": "Agent action timeline",
    "name_ja": "エージェント操作タイムライン",
    "category": "AI / Agent UI",
    "summary_en": "Agent action timeline is a Pro-only UI sample for a chronological record of agent decisions, tool calls, retries, and user approvals. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "エージェント操作タイムラインは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for debugging autonomous workflows and explaining outcomes, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "エージェント操作タイムラインは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for single-step AI responses, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "エージェント操作タイムラインは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Agent action timeline when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "エージェント操作タイムラインは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Agent action timeline for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなエージェント操作タイムラインを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Agent action timeline shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "エージェント操作タイムライン は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "human-approval-gate",
      "confidence-explanation-panel"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "medium",
    "implementation_cost": "high",
    "maintenance_cost": "high",
    "pro_only": true
  },
  {
    "id": "confidence-explanation-panel",
    "slug": "confidence-explanation-panel",
    "name_en": "Confidence explanation panel",
    "name_ja": "信頼度説明パネル",
    "category": "AI / Agent UI",
    "summary_en": "Confidence explanation panel is a Pro-only UI sample for an explanation of model confidence, uncertainty, and evidence behind a recommendation. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "信頼度説明パネルは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for AI-assisted review where users need calibration, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "信頼度説明パネルは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for deterministic system status messages, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "信頼度説明パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Confidence explanation panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "信頼度説明パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Confidence explanation panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな信頼度説明パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Confidence explanation panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "信頼度説明パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "agent-action-timeline",
      "ai-source-citation-block"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "ai-source-citation-block",
    "slug": "ai-source-citation-block",
    "name_en": "AI source citation block",
    "name_ja": "AI出典引用ブロック",
    "category": "AI / Agent UI",
    "summary_en": "AI source citation block is a Pro-only UI sample for a source list that connects generated claims to referenced documents or URLs. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "AI出典引用ブロックは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for research, support, legal, and knowledge-base answers, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "AI出典引用ブロックは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for creative writing with no source requirement, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "AI出典引用ブロックは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use AI source citation block when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "AI出典引用ブロックは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive AI source citation block for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなAI出典引用ブロックを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The AI source citation block shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "AI出典引用ブロック は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "confidence-explanation-panel",
      "prompt-refinement-panel"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "prompt-refinement-panel",
    "slug": "prompt-refinement-panel",
    "name_en": "Prompt refinement panel",
    "name_ja": "プロンプト改善パネル",
    "category": "AI / Agent UI",
    "summary_en": "Prompt refinement panel is a Pro-only UI sample for controls for rewriting, constraining, and previewing prompts before rerun. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "プロンプト改善パネルは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for power-user AI tooling and repeatable prompt workflows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "プロンプト改善パネルは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for simple chat boxes for casual users, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "プロンプト改善パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Prompt refinement panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "プロンプト改善パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Prompt refinement panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなプロンプト改善パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Prompt refinement panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "プロンプト改善パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "ai-source-citation-block",
      "ai-retry-regenerate-controls"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "ai-retry-regenerate-controls",
    "slug": "ai-retry-regenerate-controls",
    "name_en": "AI retry / regenerate controls",
    "name_ja": "AI再試行・再生成コントロール",
    "category": "AI / Agent UI",
    "summary_en": "AI retry / regenerate controls is a Pro-only UI sample for clear controls for retrying failed or unsatisfactory AI outputs with preserved context. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "AI再試行・再生成コントロールは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for AI generation flows with latency, failures, or version choice, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "AI再試行・再生成コントロールは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for static content that is not regenerated, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "AI再試行・再生成コントロールは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use AI retry / regenerate controls when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "AI再試行・再生成コントロールは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive AI retry / regenerate controls for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなAI再試行・再生成コントロールを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The AI retry / regenerate controls shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "AI再試行・再生成コントロール は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "prompt-refinement-panel",
      "ai-risk-warning"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "ai-risk-warning",
    "slug": "ai-risk-warning",
    "name_en": "AI risk warning",
    "name_ja": "AIリスク警告",
    "category": "AI / Agent UI",
    "summary_en": "AI risk warning is a Pro-only UI sample for a contextual warning for uncertain, sensitive, or potentially harmful AI output. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "AIリスク警告は、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for medical, legal, financial, policy, or user-impacting AI assistance, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "AIリスク警告は、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for generic marketing copy previews, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "AIリスク警告は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use AI risk warning when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "AIリスク警告は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive AI risk warning for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなAIリスク警告を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The AI risk warning shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "AIリスク警告 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "ai-retry-regenerate-controls",
      "agent-permission-request"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "agent-permission-request",
    "slug": "agent-permission-request",
    "name_en": "Agent permission request",
    "name_ja": "エージェント権限リクエスト",
    "category": "AI / Agent UI",
    "summary_en": "Agent permission request is a Pro-only UI sample for a permission prompt that explains what an agent wants to access or do. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "エージェント権限リクエストは、AI / Agent UIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for tool-using agents that need files, integrations, or external actions, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "エージェント権限リクエストは、AI / Agent UIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for manual workflows with no delegated action, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "エージェント権限リクエストは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Agent permission request when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "エージェント権限リクエストは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Agent permission request for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなエージェント権限リクエストを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Agent permission request shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "エージェント権限リクエスト は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "ai-risk-warning"
    ],
    "rejected_alternatives": [
      "generic chat message",
      "unexplained automation"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "plan-comparison-table",
    "slug": "plan-comparison-table",
    "name_en": "Plan comparison table",
    "name_ja": "プラン比較表",
    "category": "Billing / Account UI",
    "summary_en": "Plan comparison table is a Pro-only UI sample for a structured view of plans, prices, limits, and feature differences. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "プラン比較表は、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for conversion pages and account upgrades with multiple tiers, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "プラン比較表は、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for single-plan products, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "プラン比較表は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Plan comparison table when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "プラン比較表は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Plan comparison table for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなプラン比較表を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Plan comparison table shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "プラン比較表 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "usage-meter",
      "upgrade-prompt"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "usage-meter",
    "slug": "usage-meter",
    "name_en": "Usage meter",
    "name_ja": "使用量メーター",
    "category": "Billing / Account UI",
    "summary_en": "Usage meter is a Pro-only UI sample for a visual and textual indicator of consumed quota, remaining quota, and reset timing. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "使用量メーターは、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for metered billing, API credits, storage, and seats, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "使用量メーターは、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for unlimited services without quota pressure, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "使用量メーターは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Usage meter when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "使用量メーターは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Usage meter for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな使用量メーターを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Usage meter shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "使用量メーター は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "plan-comparison-table",
      "upgrade-prompt"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "upgrade-prompt",
    "slug": "upgrade-prompt",
    "name_en": "Upgrade prompt",
    "name_ja": "アップグレード促進",
    "category": "Billing / Account UI",
    "summary_en": "Upgrade prompt is a Pro-only UI sample for a contextual callout that explains a locked benefit and the next upgrade step. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "アップグレード促進は、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for free-to-paid conversion moments tied to user intent, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "アップグレード促進は、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for blocking critical workflows without an alternative, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "アップグレード促進は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Upgrade prompt when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "アップグレード促進は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Upgrade prompt for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなアップグレード促進を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Upgrade prompt shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "アップグレード促進 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "usage-meter",
      "payment-failure-recovery"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "medium",
    "implementation_cost": "low",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "payment-failure-recovery",
    "slug": "payment-failure-recovery",
    "name_en": "Payment failure recovery",
    "name_ja": "決済失敗リカバリー",
    "category": "Billing / Account UI",
    "summary_en": "Payment failure recovery is a Pro-only UI sample for a recovery flow for failed payment, grace period, retry, and payment method update. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "決済失敗リカバリーは、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for subscription products where access may be interrupted, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "決済失敗リカバリーは、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for one-time payments with no account access risk, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "決済失敗リカバリーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Payment failure recovery when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "決済失敗リカバリーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Payment failure recovery for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな決済失敗リカバリーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Payment failure recovery shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "決済失敗リカバリー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "upgrade-prompt",
      "invoice-history-table"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "invoice-history-table",
    "slug": "invoice-history-table",
    "name_en": "Invoice history table",
    "name_ja": "請求書履歴テーブル",
    "category": "Billing / Account UI",
    "summary_en": "Invoice history table is a Pro-only UI sample for a sortable list of invoices, statuses, amounts, and download links. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "請求書履歴テーブルは、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for B2B account pages and finance admin workflows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "請求書履歴テーブルは、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for consumer apps with no invoice documents, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "請求書履歴テーブルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Invoice history table when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "請求書履歴テーブルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Invoice history table for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな請求書履歴テーブルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Invoice history table shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "請求書履歴テーブル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "payment-failure-recovery",
      "seat-management-panel"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "seat-management-panel",
    "slug": "seat-management-panel",
    "name_en": "Seat management panel",
    "name_ja": "シート管理パネル",
    "category": "Billing / Account UI",
    "summary_en": "Seat management panel is a Pro-only UI sample for controls for adding, removing, inviting, and reallocating paid seats. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "シート管理パネルは、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for team SaaS products with per-seat pricing, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "シート管理パネルは、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for individual tools without team members, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "シート管理パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Seat management panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "シート管理パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Seat management panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなシート管理パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Seat management panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "シート管理パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "invoice-history-table",
      "trial-ending-banner"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "trial-ending-banner",
    "slug": "trial-ending-banner",
    "name_en": "Trial ending banner",
    "name_ja": "トライアル終了バナー",
    "category": "Billing / Account UI",
    "summary_en": "Trial ending banner is a Pro-only UI sample for a time-sensitive banner that explains remaining trial time and next steps. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "トライアル終了バナーは、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for trial conversion and account retention flows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "トライアル終了バナーは、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for permanent free plans without an expiration, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "トライアル終了バナーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Trial ending banner when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "トライアル終了バナーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Trial ending banner for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなトライアル終了バナーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Trial ending banner shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "トライアル終了バナー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "seat-management-panel",
      "cancellation-survey"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "medium",
    "implementation_cost": "low",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "cancellation-survey",
    "slug": "cancellation-survey",
    "name_en": "Cancellation survey",
    "name_ja": "解約アンケート",
    "category": "Billing / Account UI",
    "summary_en": "Cancellation survey is a Pro-only UI sample for a respectful exit survey that collects reason, optional feedback, and retention-safe alternatives. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "解約アンケートは、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for subscription cancellation funnels, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "解約アンケートは、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for mandatory feedback before urgent account closure, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "解約アンケートは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Cancellation survey when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "解約アンケートは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Cancellation survey for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな解約アンケートを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Cancellation survey shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "解約アンケート は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "trial-ending-banner",
      "downgrade-impact-warning"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "downgrade-impact-warning",
    "slug": "downgrade-impact-warning",
    "name_en": "Downgrade impact warning",
    "name_ja": "ダウングレード影響警告",
    "category": "Billing / Account UI",
    "summary_en": "Downgrade impact warning is a Pro-only UI sample for a warning that lists feature, data, quota, and collaboration impacts before plan downgrade. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "ダウングレード影響警告は、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for paid plan changes with data or access consequences, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "ダウングレード影響警告は、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for cosmetic preference changes, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "ダウングレード影響警告は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Downgrade impact warning when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "ダウングレード影響警告は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Downgrade impact warning for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなダウングレード影響警告を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Downgrade impact warning shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "ダウングレード影響警告 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "cancellation-survey",
      "billing-owner-transfer"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "billing-owner-transfer",
    "slug": "billing-owner-transfer",
    "name_en": "Billing owner transfer",
    "name_ja": "請求オーナー移管",
    "category": "Billing / Account UI",
    "summary_en": "Billing owner transfer is a Pro-only UI sample for a controlled handoff of billing responsibility, payment authority, and notifications. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "請求オーナー移管は、請求 / アカウントUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for organizations changing finance owners or admins, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "請求オーナー移管は、請求 / アカウントUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for simple display-name changes, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "請求オーナー移管は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Billing owner transfer when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "請求オーナー移管は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Billing owner transfer for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな請求オーナー移管を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Billing owner transfer shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "請求オーナー移管 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "downgrade-impact-warning"
    ],
    "rejected_alternatives": [
      "generic upsell banner",
      "receipt-only page"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "advanced-filter-builder",
    "slug": "advanced-filter-builder",
    "name_en": "Advanced filter builder",
    "name_ja": "高度フィルタビルダー",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Advanced filter builder is a Pro-only UI sample for a structured way to combine fields, operators, values, and groups. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "高度フィルタビルダーは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for large datasets where simple search is not enough, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "高度フィルタビルダーは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for small lists with three or fewer filters, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "高度フィルタビルダーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Advanced filter builder when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "高度フィルタビルダーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Advanced filter builder for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな高度フィルタビルダーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Advanced filter builder shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "高度フィルタビルダー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "saved-search-manager",
      "data-table-with-bulk-selection"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "high",
    "maintenance_cost": "high",
    "pro_only": true
  },
  {
    "id": "saved-search-manager",
    "slug": "saved-search-manager",
    "name_en": "Saved search manager",
    "name_ja": "保存検索マネージャー",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Saved search manager is a Pro-only UI sample for a list for naming, updating, sharing, and deleting reusable searches. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "保存検索マネージャーは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for repeat reporting workflows and team dashboards, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "保存検索マネージャーは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for one-off searches that users will not revisit, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "保存検索マネージャーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Saved search manager when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "保存検索マネージャーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Saved search manager for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな保存検索マネージャーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Saved search manager shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "保存検索マネージャー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "advanced-filter-builder",
      "data-table-with-bulk-selection"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "data-table-with-bulk-selection",
    "slug": "data-table-with-bulk-selection",
    "name_en": "Data table with bulk selection",
    "name_ja": "一括選択付きデータテーブル",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Data table with bulk selection is a Pro-only UI sample for a dense table with selection, row actions, bulk actions, and state feedback. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "一括選択付きデータテーブルは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for admin datasets that need repeated multi-row work, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "一括選択付きデータテーブルは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for simple card lists or marketing pages, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "一括選択付きデータテーブルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Data table with bulk selection when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "一括選択付きデータテーブルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Data table with bulk selection for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな一括選択付きデータテーブルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Data table with bulk selection shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "一括選択付きデータテーブル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "saved-search-manager",
      "drilldown-side-panel"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "high",
    "pro_only": true
  },
  {
    "id": "drilldown-side-panel",
    "slug": "drilldown-side-panel",
    "name_en": "Drilldown side panel",
    "name_ja": "ドリルダウンサイドパネル",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Drilldown side panel is a Pro-only UI sample for a side panel that reveals record details while preserving the table or chart context. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "ドリルダウンサイドパネルは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for investigation dashboards and master-detail workflows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "ドリルダウンサイドパネルは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for full-page tasks needing deep editing space, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "ドリルダウンサイドパネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Drilldown side panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "ドリルダウンサイドパネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Drilldown side panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなドリルダウンサイドパネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Drilldown side panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "ドリルダウンサイドパネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "data-table-with-bulk-selection",
      "kpi-anomaly-explanation"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "kpi-anomaly-explanation",
    "slug": "kpi-anomaly-explanation",
    "name_en": "KPI anomaly explanation",
    "name_ja": "KPI異常値説明",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "KPI anomaly explanation is a Pro-only UI sample for a panel that explains why a metric moved, including drivers and comparison context. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "KPI異常値説明は、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for executive dashboards and alert triage, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "KPI異常値説明は、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for raw metric displays with no trend analysis, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "KPI異常値説明は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use KPI anomaly explanation when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "KPI異常値説明は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive KPI anomaly explanation for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなKPI異常値説明を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The KPI anomaly explanation shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "KPI異常値説明 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "drilldown-side-panel",
      "chart-annotation-panel"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "chart-annotation-panel",
    "slug": "chart-annotation-panel",
    "name_en": "Chart annotation panel",
    "name_ja": "チャート注釈パネル",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Chart annotation panel is a Pro-only UI sample for controls for adding, editing, and reading notes tied to chart dates or values. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "チャート注釈パネルは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for analytics teams documenting launches, incidents, or experiments, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "チャート注釈パネルは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for static charts that never receive commentary, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "チャート注釈パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Chart annotation panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "チャート注釈パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Chart annotation panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなチャート注釈パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Chart annotation panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "チャート注釈パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "kpi-anomaly-explanation",
      "empty-dashboard-setup"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "empty-dashboard-setup",
    "slug": "empty-dashboard-setup",
    "name_en": "Empty dashboard setup",
    "name_ja": "空ダッシュボード初期設定",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Empty dashboard setup is a Pro-only UI sample for an empty state that guides users to connect data, choose widgets, or start from templates. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "空ダッシュボード初期設定は、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for first-run analytics and admin dashboard onboarding, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "空ダッシュボード初期設定は、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for dashboards that always have seeded data, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "空ダッシュボード初期設定は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Empty dashboard setup when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "空ダッシュボード初期設定は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Empty dashboard setup for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな空ダッシュボード初期設定を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Empty dashboard setup shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "空ダッシュボード初期設定 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "chart-annotation-panel",
      "report-export-drawer"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "low",
    "implementation_cost": "medium",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "report-export-drawer",
    "slug": "report-export-drawer",
    "name_en": "Report export drawer",
    "name_ja": "レポート出力ドロワー",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Report export drawer is a Pro-only UI sample for a drawer for choosing format, date range, recipients, and delivery timing. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "レポート出力ドロワーは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for reporting products with async export or scheduled delivery, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "レポート出力ドロワーは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for instant screenshot-style downloads only, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "レポート出力ドロワーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Report export drawer when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "レポート出力ドロワーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Report export drawer for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなレポート出力ドロワーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Report export drawer shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "レポート出力ドロワー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "empty-dashboard-setup",
      "compare-period-selector"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "compare-period-selector",
    "slug": "compare-period-selector",
    "name_en": "Compare period selector",
    "name_ja": "期間比較セレクター",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Compare period selector is a Pro-only UI sample for a selector for comparing current data against previous, custom, or year-over-year periods. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "期間比較セレクターは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for analytics pages where trends need explicit context, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "期間比較セレクターは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for single-date status screens, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "期間比較セレクターは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Compare period selector when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "期間比較セレクターは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Compare period selector for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな期間比較セレクターを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Compare period selector shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "期間比較セレクター は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "report-export-drawer",
      "data-freshness-banner"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "low",
    "pro_only": true
  },
  {
    "id": "data-freshness-banner",
    "slug": "data-freshness-banner",
    "name_en": "Data freshness banner",
    "name_ja": "データ鮮度バナー",
    "category": "Search / Data / Dashboard UI",
    "summary_en": "Data freshness banner is a Pro-only UI sample for a visible notice that explains when data was last updated and whether it is delayed. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "データ鮮度バナーは、検索 / データ / ダッシュボードUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for dashboards fed by ETL, imports, or third-party APIs, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "データ鮮度バナーは、検索 / データ / ダッシュボードUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for real-time interfaces with guaranteed freshness, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "データ鮮度バナーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Data freshness banner when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "データ鮮度バナーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Data freshness banner for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなデータ鮮度バナーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Data freshness banner shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "データ鮮度バナー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "compare-period-selector"
    ],
    "rejected_alternatives": [
      "single search box",
      "static chart"
    ],
    "risk_level": "medium",
    "implementation_cost": "low",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "consent-review-panel",
    "slug": "consent-review-panel",
    "name_en": "Consent review panel",
    "name_ja": "同意レビュー パネル",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Consent review panel is a Pro-only UI sample for a review surface for consent scope, timestamp, version, and user choice. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "同意レビュー パネルは、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for privacy, marketing, healthcare, and regulated consent workflows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "同意レビュー パネルは、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for non-sensitive preference toggles, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "同意レビュー パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Consent review panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "同意レビュー パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Consent review panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな同意レビュー パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Consent review panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "同意レビュー パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "policy-warning-banner",
      "privacy-setting-matrix"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "policy-warning-banner",
    "slug": "policy-warning-banner",
    "name_en": "Policy warning banner",
    "name_ja": "ポリシー警告バナー",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Policy warning banner is a Pro-only UI sample for a prominent warning that a user action or content may violate policy. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "ポリシー警告バナーは、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for moderation, marketplace, and enterprise governance flows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "ポリシー警告バナーは、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for minor hints that do not affect compliance, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "ポリシー警告バナーは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Policy warning banner when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "ポリシー警告バナーは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Policy warning banner for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなポリシー警告バナーを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Policy warning banner shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "ポリシー警告バナー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "consent-review-panel",
      "privacy-setting-matrix"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "low",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "privacy-setting-matrix",
    "slug": "privacy-setting-matrix",
    "name_en": "Privacy setting matrix",
    "name_ja": "プライバシー設定マトリクス",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Privacy setting matrix is a Pro-only UI sample for a matrix of visibility, data use, sharing, and notification controls. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "プライバシー設定マトリクスは、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for products with many privacy dimensions and audiences, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "プライバシー設定マトリクスは、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for simple public/private switches, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "プライバシー設定マトリクスは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Privacy setting matrix when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "プライバシー設定マトリクスは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Privacy setting matrix for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなプライバシー設定マトリクスを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Privacy setting matrix shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "プライバシー設定マトリクス は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "policy-warning-banner",
      "delete-account-checklist"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "high",
    "pro_only": true
  },
  {
    "id": "delete-account-checklist",
    "slug": "delete-account-checklist",
    "name_en": "Delete account checklist",
    "name_ja": "アカウント削除チェックリスト",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Delete account checklist is a Pro-only UI sample for a step-by-step checklist for consequences, exports, confirmations, and final deletion. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "アカウント削除チェックリストは、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for account deletion flows with data loss or billing implications, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "アカウント削除チェックリストは、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for temporary logout or app uninstall flows, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "アカウント削除チェックリストは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Delete account checklist when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "アカウント削除チェックリストは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Delete account checklist for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなアカウント削除チェックリストを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Delete account checklist shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "アカウント削除チェックリスト は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "privacy-setting-matrix",
      "sensitive-action-approval"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "sensitive-action-approval",
    "slug": "sensitive-action-approval",
    "name_en": "Sensitive action approval",
    "name_ja": "センシティブ操作承認",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Sensitive action approval is a Pro-only UI sample for an approval workflow for actions that require reviewer identity and rationale. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "センシティブ操作承認は、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for finance, security, HR, or regulated admin actions, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "センシティブ操作承認は、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for everyday reversible changes, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "センシティブ操作承認は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Sensitive action approval when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "センシティブ操作承認は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Sensitive action approval for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなセンシティブ操作承認を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Sensitive action approval shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "センシティブ操作承認 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "delete-account-checklist",
      "before-after-change-review"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "before-after-change-review",
    "slug": "before-after-change-review",
    "name_en": "Before/after change review",
    "name_ja": "変更前後レビュー",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Before/after change review is a Pro-only UI sample for a comparison view for reviewing configuration or content changes before publishing. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "変更前後レビューは、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for policy edits, pricing changes, workflow rules, and data mappings, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "変更前後レビューは、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for changes with no meaningful diff, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "変更前後レビューは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Before/after change review when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "変更前後レビューは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Before/after change review for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな変更前後レビューを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Before/after change review shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "変更前後レビュー は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "sensitive-action-approval",
      "legal-copy-confirmation"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "medium",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "legal-copy-confirmation",
    "slug": "legal-copy-confirmation",
    "name_en": "Legal copy confirmation",
    "name_ja": "法務文言確認",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Legal copy confirmation is a Pro-only UI sample for a confirmation UI that ensures required legal text is read and accepted. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "法務文言確認は、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for terms updates, regulated disclosures, and high-liability flows, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "法務文言確認は、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for casual tips or educational text, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "法務文言確認は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Legal copy confirmation when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "法務文言確認は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Legal copy confirmation for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブな法務文言確認を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Legal copy confirmation shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "法務文言確認 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "before-after-change-review",
      "incident-status-update-panel"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "incident-status-update-panel",
    "slug": "incident-status-update-panel",
    "name_en": "Incident status update panel",
    "name_ja": "インシデント状況更新パネル",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Incident status update panel is a Pro-only UI sample for a controlled form for publishing incident updates, severity, timeline, and next update time. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "インシデント状況更新パネルは、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for status pages and internal incident communications, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "インシデント状況更新パネルは、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for normal release notes, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "インシデント状況更新パネルは、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Incident status update panel when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "インシデント状況更新パネルは、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Incident status update panel for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなインシデント状況更新パネルを実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Incident status update panel shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "インシデント状況更新パネル は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "legal-copy-confirmation",
      "security-alert-detail"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  },
  {
    "id": "security-alert-detail",
    "slug": "security-alert-detail",
    "name_en": "Security alert detail",
    "name_ja": "セキュリティアラート詳細",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Security alert detail is a Pro-only UI sample for a detail view for severity, affected assets, evidence, and remediation steps. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "セキュリティアラート詳細は、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for security operations and account protection notifications, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "セキュリティアラート詳細は、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for low-importance notification feeds, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "セキュリティアラート詳細は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Security alert detail when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "セキュリティアラート詳細は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Security alert detail for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなセキュリティアラート詳細を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Security alert detail shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "セキュリティアラート詳細 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "incident-status-update-panel",
      "recovery-code-display"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "high",
    "maintenance_cost": "high",
    "pro_only": true
  },
  {
    "id": "recovery-code-display",
    "slug": "recovery-code-display",
    "name_en": "Recovery code display",
    "name_ja": "リカバリーコード表示",
    "category": "Compliance / Risk / Review UI",
    "summary_en": "Recovery code display is a Pro-only UI sample for a secure display for backup codes with copy, download, print, and confirmation steps. It helps teams expose the decision context, state, and next action instead of leaving the user to infer risk.",
    "summary_ja": "リカバリーコード表示は、コンプライアンス / リスク / レビューUIで判断材料、状態、次の操作を整理するPro専用UIサンプルです。ユーザーにリスクを推測させず、影響範囲と安全な進め方を明確にします。",
    "best_for_en": "Best for MFA setup and account recovery preparation, especially when product, support, design, and engineering need a shared implementation reference.",
    "best_for_ja": "リカバリーコード表示は、コンプライアンス / リスク / レビューUIで複数の関係者が同じ実装判断を共有し、操作前の確認、説明、証跡を揃える必要がある場面に向いています。",
    "not_for_en": "Not ideal for ordinary reference numbers, or for flows where extra explanation would slow down a low-risk task.",
    "not_for_ja": "リカバリーコード表示は、単発で低リスクな操作や、追加説明によって通常作業が遅くなる場面には向きません。簡単な表示だけで十分な場合は軽量なUIを選びます。",
    "pro_memo_template_en": "Use Recovery code display when the team must make the consequence, owner, and recovery path explicit before implementation. Record the selected state model, rejected alternatives, and the evidence that makes this pattern safer than a lighter UI.",
    "pro_memo_template_ja": "リカバリーコード表示は、実装前に影響範囲、責任者、復旧手段を明示する必要がある場合に採用します。状態モデル、却下した代替案、より軽いUIより安全と判断した根拠を記録します。",
    "codex_prompt_en": "Implement a responsive Recovery code display for UI Atlas Pro. Include default/loading/empty/error states, accessible labels, keyboard operation, visible focus, long-text handling, and copy that explains the main consequence before the primary action.",
    "codex_prompt_ja": "UI Atlas Pro向けにレスポンシブなリカバリーコード表示を実装してください。通常、読み込み中、空、エラー状態、アクセシブルなラベル、キーボード操作、見えるフォーカス、長文対応、主操作前に影響を説明する文言を含めてください。",
    "acceptance_criteria_en": [
      "The Recovery code display shows default, loading, empty, error, and completed states where relevant.",
      "Primary and secondary actions have clear hierarchy and safe confirmation copy.",
      "Risk, cost, or consequence information is visible before the user commits.",
      "Validation errors are inline, specific, and recoverable without losing input.",
      "Long names, IDs, timestamps, and localized strings wrap without breaking the card or table."
    ],
    "acceptance_criteria_ja": [
      "リカバリーコード表示 は必要に応じて通常、読み込み中、空、エラー、完了状態を表示する。",
      "主操作と副操作の優先順位が明確で、安全な確認文言がある。",
      "確定前にリスク、コスト、影響範囲が見える。",
      "入力エラーはインラインで具体的に表示され、入力内容を失わず修正できる。",
      "長い名称、ID、日時、多言語文言でもカードや表の外にはみ出さない。"
    ],
    "a11y_checklist_en": [
      "All controls are reachable and operable by keyboard in a logical order.",
      "Visible focus styles meet contrast expectations and are not hidden by sticky UI.",
      "Inputs, buttons, status badges, and destructive actions have explicit accessible names.",
      "Screen reader users receive status changes through appropriate live regions or text updates.",
      "Text, icons, warning colors, and disabled states keep sufficient contrast and do not rely on color alone."
    ],
    "a11y_checklist_ja": [
      "すべての操作要素にキーボードだけで論理的な順序で到達し操作できる。",
      "フォーカス表示は十分なコントラストを持ち、sticky UIに隠れない。",
      "入力、ボタン、状態バッジ、破壊的操作には明示的なアクセシブルネームがある。",
      "状態変化は適切なライブリージョンまたはテキスト更新でスクリーンリーダーに伝わる。",
      "文字、アイコン、警告色、disabled状態は十分なコントラストを保ち、色だけに依存しない。"
    ],
    "mobile_checklist_en": [
      "The layout works at 360px width without horizontal scrolling.",
      "Tap targets are at least 44px high or have equivalent spacing.",
      "Long labels, email addresses, IDs, and translated copy wrap inside the card.",
      "Sticky headers, footers, and action bars do not cover focused fields or alerts.",
      "Dense tables or matrices provide stacked, summarized, or scroll-contained alternatives."
    ],
    "mobile_checklist_ja": [
      "360px幅で横スクロールなしに利用できる。",
      "タップ領域は44px以上、または同等の余白を確保する。",
      "長いラベル、メールアドレス、ID、翻訳文言はカード内で折り返す。",
      "stickyヘッダー、フッター、操作バーがフォーカス中の項目や警告を隠さない。",
      "密な表やマトリクスには、縦積み、要約、または範囲内スクロールの代替表示を用意する。"
    ],
    "compare_candidates": [
      "security-alert-detail"
    ],
    "rejected_alternatives": [
      "plain warning text",
      "unchecked checkbox"
    ],
    "risk_level": "high",
    "implementation_cost": "medium",
    "maintenance_cost": "medium",
    "pro_only": true
  }
];
})();
