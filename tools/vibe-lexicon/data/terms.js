window.VIBE_LEXICON_TERMS = [
  {
    id: 'modern',
    term: { en: 'Modern', ja: '今っぽい' },
    aliases: {
      en: ['current', 'fresh', 'up-to-date'],
      ja: ['今風', 'モダン']
    },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'UI cleanup', ja: 'UI改善' },
    beginner: {
      en: 'Usually means reducing clutter and making hierarchy easier to scan.',
      ja: '多くの場合は「情報の整理」と「見た目のノイズ削減」を指します。'
    },
    practicalIntent: {
      en: 'Increase spacing, reduce accent colors, and narrow primary actions.',
      ja: '余白を増やし、色数を減らし、主アクションを絞る。'
    },
    practicalUseCase: {
      en: 'Useful when redesigning old dashboards or crowded landing pages.',
      ja: '古い管理画面や情報量の多いLPの整理に有効です。'
    },
    plainExplanation: {
      en: '“Modern” is often shorthand for cleaner spacing + simpler visual hierarchy.',
      ja: '「今っぽい」は、余白整理と階層の明確化をまとめた言い方です。'
    },
    commonMisuse: {
      en: 'Adding flashy effects without fixing structure.',
      ja: '構造を直さず演出だけ派手にすること。'
    },
    vagueToPractical: {
      en: ['Expand section spacing', 'Limit accent colors', 'Keep one dominant CTA', 'Reduce decorative shadows'],
      ja: ['セクション余白を広げる', 'アクセント色を絞る', '主CTAを1つにする', '装飾的な影を弱める']
    },
    badRequest: {
      en: 'Make everything modern.',
      ja: '全体を今っぽくして。'
    },
    betterRequest: {
      en: 'Refactor this page with more spacing, fewer accent colors, and one dominant CTA so it feels modern and easier to scan.',
      ja: 'ページ全体の余白を増やし、アクセント色を減らし、主CTAを1つにして、今っぽく見やすい構成にしてください。'
    },
    shortPrompt: {
      en: {
        ui: 'Make this dashboard feel modern: increase spacing, simplify cards, and prioritize one primary CTA.',
        lp: 'Make this landing page modern by reducing clutter, clarifying headings, and limiting accent colors.',
        form: 'Modernize this form: cleaner spacing, simpler helper text, and one clear submit action.',
        mobile: 'For mobile, prioritize one-column structure, larger spacing, and a single key CTA.'
      },
      ja: {
        ui: '管理画面を今っぽく整理してください。余白を広げ、カードを簡素化し、主CTAを1つに絞ってください。',
        lp: 'LPを今っぽくしてください。情報量を整理し、見出し階層を明確化し、アクセント色を絞ってください。',
        form: 'フォームを今っぽく改善してください。余白を広げ、補助文を簡潔にし、送信導線を明確化してください。',
        mobile: 'モバイルでは1カラム構成を優先し、余白を増やし、主要CTAを1つにしてください。'
      }
    },
    compareRelationships: ['refined', 'readable']
  },
  {
    id: 'refined',
    term: { en: 'Refined', ja: '洗練された' },
    aliases: { en: ['polished', 'elegant'], ja: ['上品', '整っている'] },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'Brand page', ja: 'LP改善' },
    beginner: { en: 'Means more control and consistency, not more decoration.', ja: '派手さではなく、整合性と節度を高める表現です。' },
    practicalIntent: { en: 'Unify typography rhythm, spacing rules, and visual weight.', ja: 'タイポ・余白・強弱のルールを統一する。' },
    practicalUseCase: { en: 'Useful for premium SaaS and B2B pages.', ja: 'B2Bや高単価サービスの訴求に向いています。' },
    plainExplanation: { en: 'Refined design feels deliberate, calm, and aligned.', ja: '洗練は「意図的で落ち着いた統一感」を作ることです。' },
    commonMisuse: { en: 'Increasing contrast noise while calling it premium.', ja: '強い装飾を増やして「洗練」と呼ぶこと。' },
    vagueToPractical: {
      en: ['Tighten typography scale', 'Standardize spacing increments', 'Reduce unnecessary outlines', 'Align component rhythm'],
      ja: ['文字階層を整理', '余白ルールを統一', '不要な線を減らす', 'コンポーネントのリズムを揃える']
    },
    badRequest: { en: 'Make it refined.', ja: 'もっと洗練させて。' },
    betterRequest: {
      en: 'Make this page feel refined by simplifying decorative elements, tightening typography hierarchy, and enforcing consistent spacing rules.',
      ja: '装飾要素を減らし、文字階層を整理し、余白ルールを統一して、洗練された印象にしてください。'
    },
    shortPrompt: {
      en: {
        ui: 'Refine this UI with stricter spacing rhythm, cleaner typography hierarchy, and less visual noise.',
        lp: 'Refine this LP by reducing decorative excess and clarifying headline-to-body hierarchy.',
        form: 'Refine this form with clean spacing, minimal strokes, and clear field grouping.',
        mobile: 'On mobile, refine by reducing visual noise and strengthening readable rhythm.'
      },
      ja: {
        ui: 'UIを洗練させてください。余白リズムを統一し、文字階層を明確化し、ノイズを減らしてください。',
        lp: 'LPを洗練させてください。装飾過多を抑え、見出しと本文の階層を明確にしてください。',
        form: 'フォームを洗練させてください。余白を整え、線を最小限にし、入力グループを分かりやすくしてください。',
        mobile: 'モバイルでは装飾ノイズを減らし、可読性のリズムを強化してください。'
      }
    },
    compareRelationships: ['modern', 'premium']
  },
  {
    id: 'readable',
    term: { en: 'Readable', ja: '読みやすい' },
    aliases: { en: ['easy to scan', 'clear text'], ja: ['見やすい', '読みにくいの改善'] },
    category: { en: 'Content clarity', ja: '可読性' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Docs & forms', ja: 'テキスト改善' },
    beginner: { en: 'Focuses on text legibility and scan speed.', ja: '文字の読みやすさと情報の追いやすさに集中する語です。' },
    practicalIntent: { en: 'Improve contrast, line length, heading rhythm, and paragraph spacing.', ja: 'コントラスト・行長・見出し階層・段落余白を改善する。' },
    practicalUseCase: { en: 'Useful for guides, settings screens, and long-form pages.', ja: 'ヘルプページや設定画面、長文ページで有効です。' },
    plainExplanation: { en: 'Readable design helps users find key points without fatigue.', ja: '読みやすさは「疲れずに要点へ到達できる設計」です。' },
    commonMisuse: { en: 'Only increasing font size without structure changes.', ja: '文字サイズだけ上げて構造を変えないこと。' },
    vagueToPractical: {
      en: ['Increase body line-height', 'Keep paragraphs short', 'Strengthen heading hierarchy', 'Use bullet summaries'],
      ja: ['本文行間を広げる', '段落を短くする', '見出し階層を強化する', '箇条書きで要点化する']
    },
    badRequest: { en: 'Make it easier to read.', ja: '読みやすくして。' },
    betterRequest: {
      en: 'Improve readability by increasing body line-height, shortening paragraph width, and clarifying heading hierarchy.',
      ja: '本文行間を広げ、1行の文字数を抑え、見出し階層を明確にして読みやすくしてください。'
    },
    shortPrompt: {
      en: {
        ui: 'Improve readability in this UI: stronger hierarchy, clearer labels, and better line spacing.',
        lp: 'Improve LP readability with concise sections, stronger headings, and scan-friendly summaries.',
        form: 'Make this form more readable by grouping fields clearly and simplifying helper text.',
        mobile: 'On mobile, improve readability with shorter sections, stronger spacing, and clear label contrast.'
      },
      ja: {
        ui: 'UIの可読性を改善してください。階層を明確にし、ラベルを読みやすくし、行間を調整してください。',
        lp: 'LPの可読性を改善してください。セクションを短くし、見出しを強化し、要点をスキャンしやすくしてください。',
        form: 'フォームの可読性を改善してください。項目を明確にグループ化し、補助文を簡潔にしてください。',
        mobile: 'モバイルではセクションを短くし、余白を広げ、ラベルの視認性を高めてください。'
      }
    },
    compareRelationships: ['modern', 'minimal']
  },
  {
    id: 'minimal',
    term: { en: 'Minimal', ja: 'ミニマル' },
    aliases: { en: ['simple', 'reduced'], ja: ['シンプル', '要素を削る'] },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'Page simplification', ja: 'UI整理' },
    beginner: { en: 'Minimal means fewer competing elements, not fewer features.', ja: 'ミニマルは機能削減ではなく、競合要素の整理です。' },
    practicalIntent: { en: 'Remove non-essential UI elements and increase focus per section.', ja: '不要要素を削り、各セクションの主目的を明確化する。' },
    practicalUseCase: { en: 'Useful when users feel cognitive overload.', ja: '画面がごちゃついて見える時に有効です。' },
    plainExplanation: { en: 'Minimal design lowers cognitive load by prioritizing essentials.', ja: 'ミニマル設計は、必要情報に集中しやすくします。' },
    commonMisuse: { en: 'Removing guidance and harming usability.', ja: '説明まで削って使いにくくすること。' },
    vagueToPractical: {
      en: ['Remove duplicate CTAs', 'Consolidate cards', 'Reduce icon noise', 'Increase whitespace'],
      ja: ['重複CTAを削除', 'カードを統合', 'アイコン過多を抑える', '余白を増やす']
    },
    badRequest: { en: 'Make it minimal.', ja: 'ミニマルにして。' },
    betterRequest: { en: 'Make the layout minimal by removing redundant UI blocks and keeping one clear action per section.', ja: '冗長なUIブロックを削り、各セクションで主要アクションを1つに絞ってミニマル化してください。' },
    shortPrompt: {
      en: {
        ui: 'Create a minimal UI by removing redundant controls and increasing whitespace around key actions.',
        lp: 'Make this LP minimal: fewer visual decorations, shorter sections, and one CTA focus per block.',
        form: 'Simplify this form into a minimal flow with only essential inputs and concise helper text.',
        mobile: 'On mobile, keep a minimal one-action-per-screen rhythm with generous spacing.'
      },
      ja: {
        ui: '冗長な操作要素を減らし、主要アクション周辺の余白を増やしてミニマルUIにしてください。',
        lp: 'LPをミニマル化してください。装飾を減らし、セクションを短くし、各ブロックのCTAを1つに絞ってください。',
        form: 'フォームをミニマル化してください。必須入力に絞り、補助文は簡潔にしてください。',
        mobile: 'モバイルでは1画面1アクションを意識し、余白を広めに取ってください。'
      }
    },
    compareRelationships: ['modern', 'readable']
  }
];
