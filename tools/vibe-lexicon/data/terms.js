window.VIBE_LEXICON_TERMS = [
  {
    id: 'modern',
    term: { en: 'Modern', ja: '今っぽい' },
    aliases: {
      en: ['current', 'fresh', 'not outdated', 'clean look'],
      ja: ['今風', 'モダン', '古く見えるのを直したい']
    },
    searchPhrases: {
      en: ['make it look 2026', 'this UI feels old', 'refresh this page', 'less cluttered but still useful'],
      ja: ['古く見える画面を直したい', '令和っぽい見た目にしたい', 'ゴチャゴチャ感を減らしたい', '今どきのUIにしたい']
    },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'UI cleanup', ja: 'UI改善' },
    beginner: {
      en: 'Usually means cleaner spacing, fewer accents, and clearer visual priorities.',
      ja: '多くの場合は、余白整理・色数の整理・優先度の明確化を指します。'
    },
    practicalIntent: {
      en: 'Increase spacing, reduce decorative effects, and keep one primary action per section.',
      ja: '余白を増やし、装飾を抑え、各セクションの主アクションを1つに絞る。'
    },
    practicalUseCase: {
      en: 'Use when redesigning old dashboards or landing pages that feel noisy and dated.',
      ja: '古い管理画面や、情報過多で古く見えるLPの再設計に有効です。'
    },
    plainExplanation: {
      en: '“Modern” is shorthand for cleaner hierarchy and calmer visual decisions, not trendy decoration.',
      ja: '「今っぽい」は流行の装飾ではなく、階層と視線誘導を整えることです。'
    },
    commonMisuse: {
      en: 'Adding flashy gradients and motion without fixing structure or readability.',
      ja: '構造を直さず、グラデーションや動きだけ増やしてしまうこと。'
    },
    vagueToPractical: {
      en: ['Expand section spacing', 'Limit accent colors to 1–2', 'Keep one dominant CTA per block', 'Reduce decorative shadows and strokes'],
      ja: ['セクション余白を広げる', 'アクセント色を1〜2色に絞る', '各ブロックの主CTAを1つにする', '装飾的な影や線を減らす']
    },
    badRequest: {
      en: 'Make everything modern.',
      ja: '全体を今っぽくして。'
    },
    betterRequest: {
      en: 'Refactor this page to feel modern: widen spacing, reduce accent colors, and enforce one primary CTA per section.',
      ja: 'このページを今っぽく見せるため、余白を広げ、アクセント色を減らし、各セクションの主CTAを1つに統一してください。'
    },
    badBetterWhy: {
      en: 'The bad request gives no execution criteria. The better request adds concrete layout, color, and CTA constraints so AI can produce measurable changes.',
      ja: '悪い依頼は評価基準がなく、実装がぶれます。良い依頼は余白・色・CTAの制約を明示し、AI出力を検証可能にします。'
    },
    shortPrompt: {
      en: {
        ui: 'Modernize this dashboard: cleaner spacing, fewer accent colors, and one clear primary action per panel.',
        lp: 'Modernize this landing page by reducing clutter, clarifying heading hierarchy, and narrowing each block to one CTA.',
        form: 'Modernize this form: simplify visual noise, increase field spacing, and keep one clear submit path.',
        mobile: 'For mobile, modernize with one-column flow, larger spacing rhythm, and a single dominant CTA.'
      },
      ja: {
        ui: 'この管理画面を今っぽく整理してください。余白を広げ、アクセント色を減らし、パネルごとに主アクションを1つにしてください。',
        lp: 'このLPを今っぽくしてください。情報ノイズを減らし、見出し階層を明確化し、各ブロックのCTAを1つに絞ってください。',
        form: 'このフォームを今っぽくしてください。装飾ノイズを抑え、項目余白を広げ、送信導線を1本にしてください。',
        mobile: 'モバイルでは1カラムで再構成し、余白リズムを広めにし、主要CTAを1つにしてください。'
      }
    },
    compareRelationships: ['refined', 'minimal', 'visual-hierarchy'],
    compareGuides: {
      refined: {
        en: { difference: 'Modern refreshes overall feel; Refined controls precision and consistency.', whenToUse: 'Use Modern first for dated screens, then Refined for premium finishing.', practicality: 'Refined is usually more practical for final QA because rules are tighter.' },
        ja: { difference: '今っぽいは全体更新、洗練は精度と統一の調整です。', whenToUse: '古さの解消は今っぽい、仕上げ品質は洗練を使います。', practicality: '最終調整では、基準が明確な洗練の方が実務で扱いやすいです。' }
      },
      'visual-hierarchy': {
        en: { difference: 'Modern is a style target; Visual hierarchy is a specific readability mechanism.', whenToUse: 'Use hierarchy wording when you need actionable structure decisions.', practicality: 'Visual hierarchy is more practical because it can be measured by scan order.' },
        ja: { difference: '今っぽいは雰囲気語、視覚階層は構造語です。', whenToUse: '実装指示を具体化したい時は視覚階層を使います。', practicality: '視線順序で評価できるため、視覚階層の方が実務的です。' }
      }
    }
  },
  {
    id: 'refined',
    term: { en: 'Refined', ja: '洗練された' },
    aliases: { en: ['polished', 'elegant', 'high-quality look'], ja: ['上品', '整っている', '雑に見えるのを直す'] },
    searchPhrases: {
      en: ['make it feel premium without flashy effects', 'looks amateur', 'clean but high-end'],
      ja: ['安っぽく見えるのを直したい', '上品にしたい', 'プレミアム感を出したい']
    },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'Brand page', ja: 'ブランド訴求' },
    beginner: { en: 'Means consistency and restraint, not decoration-heavy “luxury”.', ja: '派手さより、整合性と節度を高める表現です。' },
    practicalIntent: { en: 'Unify typography rhythm, spacing scale, and component stroke/weight rules.', ja: 'タイポ、余白スケール、線や太さのルールを統一する。' },
    practicalUseCase: { en: 'Useful for pricing, trust pages, and premium B2B product sites.', ja: '価格ページや信頼訴求ページ、高単価B2Bサイトで有効です。' },
    plainExplanation: { en: 'Refined design feels intentional because every visual rule stays consistent.', ja: '洗練は、見た目のルールを一貫させて「意図」を感じさせる状態です。' },
    commonMisuse: { en: 'Replacing clarity with thin text and low-contrast “minimal luxury”.', ja: '可読性を犠牲にして細字・低コントラストへ寄せること。' },
    vagueToPractical: {
      en: ['Define typography scale and stick to it', 'Normalize card padding and radius', 'Reduce random line styles', 'Standardize icon weight'],
      ja: ['文字サイズ階層を固定する', 'カード余白と角丸を統一', '線の種類を減らす', 'アイコンの太さを揃える']
    },
    badRequest: { en: 'Make it refined.', ja: 'もっと洗練させて。' },
    betterRequest: {
      en: 'Make this page feel refined by standardizing typography scale, spacing increments, and component stroke weight across all sections.',
      ja: '全セクションで文字階層・余白単位・線の太さを統一し、洗練された印象にしてください。'
    },
    badBetterWhy: {
      en: 'The better version lists consistency targets. This prevents AI from returning random decorative tweaks.',
      ja: '良い依頼は統一対象を明示し、AIが場当たり的な装飾調整に逃げるのを防ぎます。'
    },
    shortPrompt: {
      en: {
        ui: 'Refine this UI with strict spacing increments, consistent typography rhythm, and reduced visual noise.',
        lp: 'Refine this LP by aligning heading/body rhythm, cleaning component borders, and removing decorative excess.',
        form: 'Refine this form using consistent field spacing, coherent label hierarchy, and minimal stroke variation.',
        mobile: 'For mobile, refine by reducing noise and maintaining a consistent text-and-spacing rhythm.'
      },
      ja: {
        ui: 'このUIを洗練してください。余白単位を統一し、文字リズムを揃え、視覚ノイズを減らしてください。',
        lp: 'このLPを洗練してください。見出しと本文のリズムを揃え、線の使い方を統一し、過剰装飾を減らしてください。',
        form: 'このフォームを洗練してください。項目間余白、ラベル階層、線の太さを一貫させてください。',
        mobile: 'モバイルではノイズを抑え、文字と余白のリズムを一貫させてください。'
      }
    },
    compareRelationships: ['modern', 'premium', 'minimal'],
    compareGuides: {
      premium: {
        en: { difference: 'Refined describes execution quality; Premium describes brand positioning and trust cues.', whenToUse: 'Use Premium when messaging and pricing perception matter, Refined when UI polish quality is the issue.', practicality: 'Refined is usually more actionable in a design task brief.' },
        ja: { difference: '洗練は実装品質、プレミアムはブランド印象の語です。', whenToUse: '価格印象や信頼訴求が課題ならプレミアム、UI品質調整なら洗練を使います。', practicality: '制作指示では洗練の方が具体化しやすいです。' }
      }
    }
  },
  {
    id: 'readable',
    term: { en: 'Readable', ja: '読みやすい' },
    aliases: { en: ['easy to read', 'text clarity', 'less eye strain'], ja: ['見やすい', '読み疲れしない', '文字が追いやすい'] },
    searchPhrases: {
      en: ['text feels dense', 'people skip paragraphs', 'hard to read on mobile'],
      ja: ['文字が詰まって読みにくい', '文章を飛ばし読みされる', 'スマホで読みづらい']
    },
    category: { en: 'Readability', ja: '可読性' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Docs & forms', ja: 'テキスト改善' },
    beginner: { en: 'Focuses on line length, line height, contrast, and heading rhythm.', ja: '行長・行間・コントラスト・見出しリズムを整える語です。' },
    practicalIntent: { en: 'Reduce cognitive load by improving typography structure and scan flow.', ja: 'タイポ構造と視線導線を整え、認知負荷を下げる。' },
    practicalUseCase: { en: 'Use for onboarding docs, settings pages, and long-form explanations.', ja: 'オンボーディング文書、設定画面、長文説明ページに向きます。' },
    plainExplanation: { en: 'Readable means users can find key points quickly without re-reading.', ja: '読みやすい状態は、読み返し無しで要点へ到達できる状態です。' },
    commonMisuse: { en: 'Increasing font size only, while keeping poor hierarchy and dense blocks.', ja: '文字サイズだけ上げて、階層や密度を改善しないこと。' },
    vagueToPractical: {
      en: ['Limit paragraph width', 'Increase body line-height', 'Use subheadings every 2–4 paragraphs', 'Surface summary bullets first'],
      ja: ['1行文字数を抑える', '本文行間を広げる', '2〜4段落ごとに小見出しを置く', '先に要点箇条書きを置く']
    },
    badRequest: { en: 'Make it easier to read.', ja: '読みやすくして。' },
    betterRequest: {
      en: 'Improve readability by shortening line length, increasing line-height, and restructuring sections with clear subheadings and bullet summaries.',
      ja: '1行文字数を短くし、行間を広げ、小見出しと要点箇条書きでセクションを再構成して可読性を改善してください。'
    },
    badBetterWhy: {
      en: 'The better request names measurable typography and structure changes, so output quality can be reviewed objectively.',
      ja: '良い依頼は測定可能な文字組みと構成条件を示すため、出力品質を客観評価できます。'
    },
    shortPrompt: {
      en: {
        ui: 'Improve readability: stronger heading hierarchy, shorter text blocks, and better line spacing.',
        lp: 'Make this LP readable with concise sections, clear heading rhythm, and scan-first bullet summaries.',
        form: 'Improve form readability by grouping related fields and simplifying helper text.',
        mobile: 'For mobile readability, reduce block length, widen spacing rhythm, and keep high text contrast.'
      },
      ja: {
        ui: '可読性を改善してください。見出し階層を強化し、文章ブロックを短くし、行間を整えてください。',
        lp: 'このLPの可読性を上げてください。セクションを短くし、見出しリズムを揃え、先に要点箇条書きを置いてください。',
        form: 'フォーム可読性を改善してください。関連項目をまとめ、補助文を簡潔にしてください。',
        mobile: 'モバイル可読性を上げるため、ブロック長を短くし、余白を広げ、高コントラストを保ってください。'
      }
    },
    compareRelationships: ['scannable', 'visual-hierarchy', 'minimal']
  },
  {
    id: 'scannable',
    term: { en: 'Scannable', ja: '流し読みしやすい' },
    aliases: { en: ['easy to scan', 'quick skim', 'find key points fast'], ja: ['要点を拾いやすい', 'ざっと読める', '見出しで追える'] },
    searchPhrases: {
      en: ['users do not read everything', 'need quick glance understanding', 'too much text wall'],
      ja: ['全部読まれない', 'パッと見で理解させたい', '文章の壁になっている']
    },
    category: { en: 'Readability', ja: '可読性' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Content UX', ja: '情報設計' },
    beginner: { en: 'Scannable focuses on information chunking and visual entry points.', ja: '流し読みしやすさは、情報の分割と入口の作り方に関する語です。' },
    practicalIntent: { en: 'Create clear chunk boundaries, headings, and summary-first structure.', ja: '情報の塊を分け、見出しと要約先出し構造を作る。' },
    practicalUseCase: { en: 'Best for FAQ, product specs, comparisons, and policy pages.', ja: 'FAQ、仕様比較、ポリシー説明などで効果的です。' },
    plainExplanation: { en: 'Scannable copy helps users understand enough in seconds before deciding to read more.', ja: '流し読みしやすい構成は、数秒で必要情報へ到達できる状態です。' },
    commonMisuse: { en: 'Overusing bold text without structural grouping.', ja: '構造を変えず太字だけ増やすこと。' },
    vagueToPractical: {
      en: ['Add descriptive subheadings', 'Start each block with one-line summary', 'Use table/list where comparison exists', 'Break long paragraphs into chunks'],
      ja: ['説明的な小見出しを追加', '各ブロック冒頭に1行要約を置く', '比較は表や箇条書きにする', '長文段落を分割する']
    },
    badRequest: { en: 'Make this content scannable.', ja: '流し読みしやすくして。' },
    betterRequest: {
      en: 'Restructure this content for scanning: summary-first blocks, descriptive subheadings, and list/table formatting for comparisons.',
      ja: 'このコンテンツを流し読み向けに再構成してください。要約先出し、小見出し強化、比較箇所は箇条書きまたは表にしてください。'
    },
    badBetterWhy: {
      en: 'The better request specifies content architecture, not just visual style.',
      ja: '良い依頼は見た目ではなく、情報アーキテクチャの変更点を指定しています。'
    },
    shortPrompt: {
      en: {
        ui: 'Make this settings UI scannable with clear grouping labels and short summaries per group.',
        lp: 'Make this LP scannable using summary-first sections and descriptive subheadings.',
        form: 'Make this form scannable by chunking fields and labeling each block by user goal.',
        mobile: 'For mobile scanning, use short blocks, sticky section labels, and summary-first text.'
      },
      ja: {
        ui: 'この設定UIを流し読みしやすくしてください。グループ見出しを明確にし、各ブロック冒頭に短い要約を置いてください。',
        lp: 'このLPを流し読み向けにしてください。要約先出し構成と説明的な小見出しを使ってください。',
        form: 'このフォームを流し読み向けにし、入力項目を目的別に分割して見出しを付けてください。',
        mobile: 'モバイルでは短いブロック化と要約先出しで、流し読みしやすくしてください。'
      }
    },
    compareRelationships: ['readable', 'visual-hierarchy']
  },
  {
    id: 'visual-hierarchy',
    term: { en: 'Visual hierarchy', ja: '視覚階層' },
    aliases: { en: ['priority clarity', 'what to look at first', 'attention order'], ja: ['優先度がわかる', 'どこから見るか明確', '情報の強弱'] },
    searchPhrases: {
      en: ['users do not know where to look', 'everything feels equally loud', 'main action is buried'],
      ja: ['どこを見ればいいか分からない', '全部同じ強さに見える', '主導線が埋もれている']
    },
    category: { en: 'Readability', ja: '可読性' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'UI structure', ja: '構造改善' },
    beginner: { en: 'Defines visual priority order: first glance, second glance, and detail layers.', ja: '視線の優先順位（最初に見る/次に見る/詳細）を設計する語です。' },
    practicalIntent: { en: 'Control heading scale, contrast, spacing, and CTA prominence to guide attention.', ja: '見出しサイズ・コントラスト・余白・CTA強度で視線を誘導する。' },
    practicalUseCase: { en: 'Use when users miss key CTA or cannot identify the page purpose quickly.', ja: '主CTAが見つからない、ページ目的が伝わらない時に使います。' },
    plainExplanation: { en: 'Visual hierarchy is the execution layer behind terms like modern, clean, and premium.', ja: '視覚階層は「今っぽい」「きれい」の裏側にある実装レイヤーです。' },
    commonMisuse: { en: 'Making headlines bigger without reducing competing visual noise.', ja: '見出しだけ大きくして競合ノイズを残すこと。' },
    vagueToPractical: {
      en: ['Define one dominant element per viewport', 'Separate section tiers with spacing', 'Lower contrast for secondary text', 'Limit competing button styles'],
      ja: ['1画面1主役を定義する', '余白で階層を分ける', '補助情報のコントラストを下げる', 'ボタン種別の競合を減らす']
    },
    badRequest: { en: 'Make it easier to understand at a glance.', ja: 'ひと目で分かるようにして。' },
    betterRequest: {
      en: 'Strengthen visual hierarchy so users see page purpose first, then value points, then a single primary CTA.',
      ja: '視覚階層を強化し、ページ目的→価値ポイント→主CTAの順で視線が流れるようにしてください。'
    },
    badBetterWhy: {
      en: 'The better request defines intended scan order, giving AI a target flow to build around.',
      ja: '良い依頼は視線順序を定義し、AI出力の誘導設計を具体化します。'
    },
    shortPrompt: {
      en: {
        ui: 'Improve visual hierarchy: one dominant headline, clear secondary labels, and one primary CTA.',
        lp: 'Rebuild LP hierarchy so value prop appears first, proof second, and CTA third with clear visual separation.',
        form: 'Improve form hierarchy by emphasizing section purpose, then fields, then submit action.',
        mobile: 'For mobile, enforce one dominant item per screen and reduce competing visual weights.'
      },
      ja: {
        ui: '視覚階層を改善してください。主見出しを1つに絞り、補助ラベルを整理し、主CTAを明確化してください。',
        lp: 'LPの視覚階層を再設計してください。価値提案→根拠→CTAの順で明確に分離してください。',
        form: 'フォーム階層を改善し、セクション目的→入力項目→送信導線の順で強弱を付けてください。',
        mobile: 'モバイルでは1画面1主役を徹底し、競合する強調要素を減らしてください。'
      }
    },
    compareRelationships: ['modern', 'scannable', 'clear-cta']
  },
  {
    id: 'clear-cta',
    term: { en: 'Clear CTA', ja: 'CTA明確化' },
    aliases: { en: ['strong call to action', 'clear next step', 'action clarity'], ja: ['行動導線を明確に', '次の一歩を明確に', 'CTAが分かりにくい'] },
    searchPhrases: {
      en: ['users do not click', 'too many buttons', 'main action unclear'],
      ja: ['ボタンが押されない', 'ボタンが多すぎる', '次に何をすべきか分からない']
    },
    category: { en: 'CTA & conversion', ja: 'CTA/転換' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Landing page CTA', ja: 'CV導線' },
    beginner: { en: 'Makes the next user action obvious and low-friction.', ja: 'ユーザーの次アクションを迷わせず、実行しやすくする語です。' },
    practicalIntent: { en: 'Reduce CTA competition and align each button label with user intent.', ja: 'CTA競合を減らし、ボタン文言を利用者意図に合わせる。' },
    practicalUseCase: { en: 'Useful for landing pages, pricing pages, and onboarding completion steps.', ja: 'LP、料金ページ、オンボ完了導線で効果的です。' },
    plainExplanation: { en: 'A clear CTA is not louder color alone; it is clearer choice architecture.', ja: 'CTA明確化は色を派手にすることではなく、選択構造を明瞭化することです。' },
    commonMisuse: { en: 'Adding more buttons and expecting higher conversion.', ja: 'ボタン数を増やしてCV改善を狙うこと。' },
    vagueToPractical: {
      en: ['Keep one primary CTA per section', 'Rewrite labels with action + outcome', 'Demote secondary actions visually', 'Place reassurance near CTA'],
      ja: ['セクションごとの主CTAを1つにする', 'ボタンを「行動+結果」で書く', '副導線の強度を下げる', 'CTA付近に安心材料を置く']
    },
    badRequest: { en: 'Make the CTA better.', ja: 'CTAを良くして。' },
    betterRequest: {
      en: 'Improve CTA clarity by keeping one primary action per section, rewriting labels with user outcome, and visually demoting secondary actions.',
      ja: 'CTAを明確化するため、各セクションの主アクションを1つにし、ボタン文言を成果ベースに書き換え、副導線の強度を下げてください。'
    },
    badBetterWhy: {
      en: 'The better request defines both content and hierarchy changes, which directly impact click behavior.',
      ja: '良い依頼は文言変更と視覚階層変更を同時指定し、クリック行動に直結します。'
    },
    shortPrompt: {
      en: {
        ui: 'Clarify CTA flow: one primary action, explicit button outcome labels, and subdued secondary actions.',
        lp: 'Improve LP conversion by reducing CTA choices and rewriting primary button text around user outcome.',
        form: 'For this form, make submit action unmistakable and demote cancel/reset actions.',
        mobile: 'On mobile, keep one sticky primary CTA and avoid competing fixed actions.'
      },
      ja: {
        ui: 'CTA導線を明確化してください。主アクションを1つにし、ボタン文言を成果ベースへ修正し、副導線を弱めてください。',
        lp: 'LPのCV改善のため、CTA選択肢を減らし、主ボタン文言をユーザー成果起点で書き換えてください。',
        form: 'このフォームでは送信ボタンを明確化し、キャンセルやリセットの強度を下げてください。',
        mobile: 'モバイルでは固定主CTAを1つにし、競合する固定導線を避けてください。'
      }
    },
    compareRelationships: ['conversion-focused', 'visual-hierarchy']
  },
  {
    id: 'conversion-focused',
    term: { en: 'Conversion-focused', ja: 'CV重視' },
    aliases: { en: ['increase signups', 'conversion optimization', 'action-oriented'], ja: ['成約率を上げたい', '登録率改善', 'CVR改善'] },
    searchPhrases: {
      en: ['improve signup rate', 'more demo bookings', 'too many drop-offs before submit'],
      ja: ['登録率を上げたい', '問い合わせ完了率を上げたい', '途中離脱が多い']
    },
    category: { en: 'CTA & conversion', ja: 'CTA/転換' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Landing page CTA', ja: 'CV導線' },
    beginner: { en: 'Prioritizes message clarity, trust cues, and friction reduction toward one outcome.', ja: '1つの成果に向け、訴求明確化・不安解消・摩擦低減を行う語です。' },
    practicalIntent: { en: 'Align value proposition, proof, and action path to reduce conversion friction.', ja: '価値訴求・根拠・行動導線を揃え、CVの摩擦を減らす。' },
    practicalUseCase: { en: 'Use for SaaS trial signup pages, lead-gen LPs, and checkout pre-step pages.', ja: 'SaaS体験登録、リード獲得LP、購入前導線で有効です。' },
    plainExplanation: { en: 'Conversion-focused wording makes every section support one business goal.', ja: 'CV重視は、各セクションを1つの成果に向けて整列させる考え方です。' },
    commonMisuse: { en: 'Forcing urgency everywhere and reducing trust.', ja: '煽り表現を多用して信頼を落とすこと。' },
    vagueToPractical: {
      en: ['Define one primary conversion event', 'Match headline to user pain', 'Add trust proof near decision points', 'Cut non-critical distractions'],
      ja: ['主CVイベントを1つ定義', '見出しをユーザー課題に合わせる', '意思決定箇所に信頼要素を置く', '非本質なノイズを削る']
    },
    badRequest: { en: 'Make this page convert better.', ja: 'このページのCVを上げて。' },
    betterRequest: {
      en: 'Optimize this page for trial signup conversion: sharpen pain-to-value headline, add social proof near CTA, and remove non-critical distractions.',
      ja: '体験登録CV向上のため、課題→価値の見出しを強化し、CTA近くに社会的証明を追加し、不要要素を削除してください。'
    },
    badBetterWhy: {
      en: 'The better request names target conversion event and specific leverage points, improving output relevance.',
      ja: '良い依頼は対象CVイベントと改善レバーを指定し、出力の的外れを防ぎます。'
    },
    shortPrompt: {
      en: {
        ui: 'Rework this onboarding UI for conversion: reduce friction, surface trust cues, and emphasize completion action.',
        lp: 'Make this LP conversion-focused with a sharper value proposition, stronger proof, and one clear signup path.',
        form: 'Increase form completion by clarifying benefits, reducing optional fields, and making the submit action confidence-building.',
        mobile: 'For mobile conversion, reduce scroll friction and keep the value + CTA loop visible.'
      },
      ja: {
        ui: 'このオンボーディングUIをCV重視で再設計してください。摩擦を減らし、信頼要素を見せ、完了導線を強調してください。',
        lp: 'このLPをCV重視化してください。価値訴求を鋭くし、根拠を強め、登録導線を1本化してください。',
        form: 'フォーム完了率を上げるため、便益を明確化し、任意項目を減らし、送信時の安心感を高めてください。',
        mobile: 'モバイルCV改善として、スクロール摩擦を減らし、価値訴求とCTAを常に近接させてください。'
      }
    },
    compareRelationships: ['clear-cta', 'premium']
  },
  {
    id: 'balanced-spacing',
    term: { en: 'Balanced spacing', ja: '余白バランス' },
    aliases: { en: ['better spacing', 'less cramped', 'air in layout'], ja: ['余白を整える', '詰まり感を減らす', '窮屈さ解消'] },
    searchPhrases: {
      en: ['layout feels cramped', 'sections are too close', 'cards feel crowded'],
      ja: ['レイアウトが詰まっている', 'セクション間隔が狭い', 'カードが窮屈']
    },
    category: { en: 'Layout & spacing', ja: 'レイアウト/余白' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Layout tuning', ja: '余白調整' },
    beginner: { en: 'Controls rhythm so sections breathe without wasting space.', ja: '狭すぎず広すぎない余白リズムを作る語です。' },
    practicalIntent: { en: 'Set spacing scale and apply it consistently across sections and components.', ja: '余白スケールを定義し、セクションと要素に一貫適用する。' },
    practicalUseCase: { en: 'Use when pages feel dense, inconsistent, or visually noisy.', ja: '密度過多・統一不足・ノイズ感があるページに有効です。' },
    plainExplanation: { en: 'Balanced spacing improves comprehension because grouping boundaries become obvious.', ja: '余白バランスが整うと、情報のまとまり境界が明確になります。' },
    commonMisuse: { en: 'Adding random large gaps without hierarchy intent.', ja: '意図なく大きな余白だけ増やすこと。' },
    vagueToPractical: {
      en: ['Define 8px/12px/16px rhythm tiers', 'Increase spacing between different section levels', 'Keep tighter spacing within same group', 'Align card/header paddings'],
      ja: ['8/12/16px等の段階を定義', '階層が変わる境界は余白を広げる', '同グループ内は余白を狭める', 'カード/見出し余白を統一する']
    },
    badRequest: { en: 'Add more whitespace.', ja: '余白を増やして。' },
    betterRequest: {
      en: 'Balance spacing using a fixed scale: tighter within groups, wider between sections, and consistent card/header padding.',
      ja: '固定余白スケールで余白を調整してください。グループ内は狭く、セクション間は広く、カードと見出し余白は統一してください。'
    },
    badBetterWhy: {
      en: 'The better request converts “more whitespace” into a spacing system that AI can apply consistently.',
      ja: '良い依頼は「余白を増やす」を余白システムへ変換し、AIの適用一貫性を高めます。'
    },
    shortPrompt: {
      en: {
        ui: 'Rebalance spacing with clear inner-vs-outer spacing rules and consistent card paddings.',
        lp: 'Improve LP spacing rhythm so each section boundary is clear and easy to scan.',
        form: 'Adjust form spacing to separate field groups clearly while keeping related fields tight.',
        mobile: 'On mobile, keep spacing rhythm generous but consistent to prevent cramped scanning.'
      },
      ja: {
        ui: '内側余白と外側余白のルールを分けて、余白バランスを再調整してください。',
        lp: 'セクション境界が分かるようにLPの余白リズムを整えてください。',
        form: '関連項目は密に、グループ間は広くしてフォーム余白を調整してください。',
        mobile: 'モバイルでは窮屈さを防ぎつつ、余白リズムを一貫させてください。'
      }
    },
    compareRelationships: ['minimal', 'visual-hierarchy']
  },
  {
    id: 'minimal',
    term: { en: 'Minimal', ja: 'ミニマル' },
    aliases: { en: ['simplified', 'reduced UI', 'remove clutter'], ja: ['シンプル', '要素を削る', 'ごちゃつき解消'] },
    searchPhrases: {
      en: ['too many elements', 'looks busy', 'need cleaner screen'],
      ja: ['要素が多すぎる', '画面がうるさい', 'もっとシンプルにしたい']
    },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'Page simplification', ja: 'UI整理' },
    beginner: { en: 'Means reducing competing elements, not removing necessary guidance.', ja: '必要情報を残しつつ、競合要素を減らす表現です。' },
    practicalIntent: { en: 'Remove redundant elements and keep one clear purpose per area.', ja: '冗長要素を減らし、エリアごとの目的を1つに保つ。' },
    practicalUseCase: { en: 'Useful when users report cognitive overload or visual fatigue.', ja: '認知負荷や視覚疲労が高い画面で有効です。' },
    plainExplanation: { en: 'Minimal design makes the important thing unmistakable by reducing competition.', ja: 'ミニマルは重要要素を目立たせるために競合を減らす設計です。' },
    commonMisuse: { en: 'Deleting contextual help and harming completion rate.', ja: '補助情報まで削って完了率を下げること。' },
    vagueToPractical: {
      en: ['Remove duplicate controls', 'Consolidate repetitive cards', 'Limit icon and color variations', 'Retain essential helper text only'],
      ja: ['重複操作を削除', '似たカードを統合', 'アイコン/色のバリエーションを制限', '必要な補助文は残す']
    },
    badRequest: { en: 'Make it minimal.', ja: 'ミニマルにして。' },
    betterRequest: { en: 'Simplify this screen by removing redundant controls, consolidating repetitive sections, and preserving only guidance that supports task completion.', ja: '冗長操作を削除し、重複セクションを統合しつつ、完了に必要な補助情報だけ残してミニマル化してください。' },
    badBetterWhy: {
      en: 'The better request protects usability while reducing clutter.',
      ja: '良い依頼は「削る」だけでなく、使いやすさ維持条件を含みます。'
    },
    shortPrompt: {
      en: {
        ui: 'Make this UI minimal by removing duplicate controls and keeping one clear purpose per panel.',
        lp: 'Simplify this LP with shorter sections, fewer visual decorations, and one CTA focus per block.',
        form: 'Make this form minimal but usable: essential fields only, clear helper text, and one submit path.',
        mobile: 'For mobile minimalism, keep one task focus per screen and avoid competing UI chrome.'
      },
      ja: {
        ui: 'このUIをミニマル化してください。重複操作を減らし、パネルごとの目的を1つにしてください。',
        lp: 'このLPを簡潔化してください。セクションを短くし、装飾を減らし、ブロックごとのCTAを1つにしてください。',
        form: 'このフォームを使いやすさを保ったままミニマル化してください。必須項目中心で、送信導線を1本化してください。',
        mobile: 'モバイルでは1画面1目的を徹底し、競合するUI装飾を抑えてください。'
      }
    },
    compareRelationships: ['modern', 'balanced-spacing', 'readable']
  },
  {
    id: 'premium',
    term: { en: 'Premium', ja: 'プレミアム感' },
    aliases: { en: ['high-end', 'luxury feel', 'trustworthy quality'], ja: ['高級感', '上質感', '信頼感を高めたい'] },
    searchPhrases: {
      en: ['looks cheap', 'need more trust before pricing', 'higher-value brand feel'],
      ja: ['安っぽく見える', '価格に見合う印象にしたい', '信頼感を上げたい']
    },
    category: { en: 'Style goal', ja: '雰囲気語' },
    termType: { en: 'Vague term', ja: '曖昧語' },
    useCase: { en: 'Brand page', ja: 'ブランド訴求' },
    beginner: { en: 'Premium combines visual restraint with trust signals and proof quality.', ja: 'プレミアム感は節度ある見た目と信頼要素の質で作ります。' },
    practicalIntent: { en: 'Strengthen credibility cues, polish typography, and remove discount-style urgency noise.', ja: '信頼要素を強化し、タイポを整え、安売り感のある煽りを減らす。' },
    practicalUseCase: { en: 'Useful for enterprise pricing pages and high-ticket service LPs.', ja: '法人向け価格ページや高単価サービスLPに向きます。' },
    plainExplanation: { en: 'Premium is not expensive-looking effects; it is calm confidence supported by proof.', ja: 'プレミアム感は派手さではなく、根拠に支えられた落ち着いた自信です。' },
    commonMisuse: { en: 'Adding dark gradients and gold accents without trust content.', ja: '信頼情報なしで色演出だけ豪華にすること。' },
    vagueToPractical: {
      en: ['Show concrete trust badges/testimonials', 'Improve typography consistency', 'Use restrained color system', 'Rewrite copy with confidence over hype'],
      ja: ['具体的な信頼要素を提示', '文字組みの一貫性を上げる', '色設計を節度ある構成にする', '煽りではなく根拠重視の文言へ変更']
    },
    badRequest: { en: 'Make this look premium.', ja: '高級感を出して。' },
    betterRequest: {
      en: 'Create a premium feel by tightening typography consistency, adding concrete trust proof near pricing, and replacing hype-heavy copy with confident factual language.',
      ja: 'プレミアム感を出すため、文字組みを統一し、価格周辺に信頼根拠を追加し、煽り文言を根拠ベースの表現へ置き換えてください。'
    },
    badBetterWhy: {
      en: 'The better request ties aesthetics to trust mechanics, which improves business relevance.',
      ja: '良い依頼は見た目と信頼構築を結びつけ、事業成果につながる改善になります。'
    },
    shortPrompt: {
      en: {
        ui: 'Elevate this interface to a premium tone through disciplined typography, restrained color use, and stronger trust cues.',
        lp: 'Make this LP premium by reducing hype, increasing credibility proof, and sharpening polished consistency.',
        form: 'Give this form a premium tone with clear trust microcopy and calm, consistent visual rhythm.',
        mobile: 'On mobile, premium feel should come from clean rhythm, confidence-oriented copy, and visible trust signals.'
      },
      ja: {
        ui: 'このUIをプレミアム寄りに調整してください。タイポ統一、節度ある配色、信頼要素強化を行ってください。',
        lp: 'このLPのプレミアム感を高めてください。煽りを減らし、信頼根拠を増やし、全体の整合性を強化してください。',
        form: 'このフォームにプレミアム感を持たせてください。安心できる補助文と落ち着いた視覚リズムを整えてください。',
        mobile: 'モバイルでは整った余白リズムと信頼要素の見せ方でプレミアム感を作ってください。'
      }
    },
    compareRelationships: ['refined', 'conversion-focused']
  },
  {
    id: 'concise-form',
    term: { en: 'Concise form', ja: 'フォーム簡潔化' },
    aliases: { en: ['shorter form', 'reduce fields', 'fewer inputs'], ja: ['入力項目を減らす', 'フォームを短く', '離脱を減らすフォーム'] },
    searchPhrases: {
      en: ['form abandonment is high', 'too many questions', 'users give up halfway'],
      ja: ['フォーム離脱が多い', '質問が多すぎる', '途中で入力をやめる']
    },
    category: { en: 'Form & validation', ja: 'フォーム/検証' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Form optimization', ja: 'フォーム改善' },
    beginner: { en: 'Removes non-essential fields and clarifies why each required input exists.', ja: '不要項目を削り、必須入力の理由を明確化する語です。' },
    practicalIntent: { en: 'Lower completion friction while preserving required business data.', ja: '必要データを維持しつつ、入力摩擦を下げる。' },
    practicalUseCase: { en: 'Use for inquiry, signup, and onboarding forms with drop-off issues.', ja: '問い合わせ、登録、オンボーディングフォームの離脱対策に有効です。' },
    plainExplanation: { en: 'Concise forms ask less, explain better, and complete faster.', ja: '簡潔なフォームは「聞く量を減らし、説明を明確にし、完了を早くする」設計です。' },
    commonMisuse: { en: 'Removing required fields without updating business process.', ja: '業務要件を確認せず必須項目を削ること。' },
    vagueToPractical: {
      en: ['Audit each field for necessity', 'Convert optional long text into selectable options', 'Use progressive disclosure', 'Clarify required vs optional labels'],
      ja: ['各項目の必要性を棚卸しする', '自由記述を選択式に置換する', '段階表示を導入する', '必須/任意を明確にする']
    },
    badRequest: { en: 'Make this form less annoying.', ja: 'このフォームを面倒じゃなくして。' },
    betterRequest: {
      en: 'Shorten this form by removing low-value fields, clarifying required inputs, and moving advanced questions to a later step.',
      ja: '低優先度項目を削除し、必須入力を明確化し、詳細質問は後段へ移動してフォームを短くしてください。'
    },
    badBetterWhy: {
      en: 'The better request balances UX and data needs by specifying what to remove and what to defer.',
      ja: '良い依頼は削減対象と後段移動対象を明示し、UXと業務要件を両立します。'
    },
    shortPrompt: {
      en: {
        ui: 'Optimize this form for completion: remove non-essential fields and clarify required inputs.',
        lp: 'On this LP form, shorten the first step and defer advanced questions after conversion.',
        form: 'Make this form concise by auditing field necessity and collapsing optional complexity.',
        mobile: 'For mobile, keep first-step fields minimal and reveal extra questions only when needed.'
      },
      ja: {
        ui: 'このフォームを完了重視で最適化してください。不要項目を削り、必須入力を明確にしてください。',
        lp: 'LPフォームは初回入力を短くし、詳細質問をCV後へ回してください。',
        form: '項目必要性を棚卸しし、任意の複雑入力を畳んでフォームを簡潔化してください。',
        mobile: 'モバイルでは初回入力項目を最小化し、必要時のみ追加質問を表示してください。'
      }
    },
    compareRelationships: ['inline-validation', 'conversion-focused']
  },
  {
    id: 'inline-validation',
    term: { en: 'Inline validation', ja: 'リアルタイム検証' },
    aliases: { en: ['form error clarity', 'live validation', 'input feedback'], ja: ['入力エラーをすぐ表示', 'リアルタイムエラー案内', '検証メッセージ改善'] },
    searchPhrases: {
      en: ['users fail on submit', 'error message is unclear', 'form feels frustrating'],
      ja: ['送信時にエラーが多い', 'エラーメッセージが分かりにくい', 'フォーム体験がストレス']
    },
    category: { en: 'Form & validation', ja: 'フォーム/検証' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Form optimization', ja: 'フォーム改善' },
    beginner: { en: 'Shows validation feedback at the right moment, with actionable wording.', ja: '適切なタイミングで、修正方法がわかる検証メッセージを出す語です。' },
    practicalIntent: { en: 'Reduce correction loops by surfacing errors near fields with fix instructions.', ja: '項目付近で修正方法つきエラーを表示し、再入力ループを減らす。' },
    practicalUseCase: { en: 'Best for signup/payment forms where submit failures hurt conversion.', ja: '登録/決済フォームなど、送信失敗がCVに直結する場面で有効です。' },
    plainExplanation: { en: 'Good validation says what is wrong, why, and how to fix it immediately.', ja: '良い検証は「何が」「なぜ」「どう直すか」を即時に示します。' },
    commonMisuse: { en: 'Showing red errors from first keystroke and increasing anxiety.', ja: '入力開始直後から赤エラーを連発して不安を増やすこと。' },
    vagueToPractical: {
      en: ['Validate on blur for most fields', 'Use positive confirmation for correct input', 'Write fix-oriented error text', 'Keep focus on first failing field on submit'],
      ja: ['基本はフォーカスアウト時に検証', '正しい入力には肯定フィードバックを出す', 'エラー文を修正指示型にする', '送信時は最初のエラー項目へフォーカス']
    },
    badRequest: { en: 'Improve form validation.', ja: 'フォーム検証を改善して。' },
    betterRequest: {
      en: 'Implement inline validation that shows fix-oriented messages near fields, validates on blur, and auto-focuses the first failing input on submit.',
      ja: '項目近接で修正指示型メッセージを表示し、基本はフォーカスアウト時に検証し、送信時は最初のエラー項目へ自動フォーカスするよう実装してください。'
    },
    badBetterWhy: {
      en: 'The better request sets timing, placement, and message style, which directly changes error recovery speed.',
      ja: '良い依頼は検証タイミング・表示位置・文言方針を定義し、エラー回復速度を上げます。'
    },
    shortPrompt: {
      en: {
        ui: 'Upgrade validation UX: field-level feedback, blur timing, and clear fix instructions per error.',
        lp: 'For LP signup, reduce submit failures with inline validation and concise, actionable error wording.',
        form: 'Implement inline validation with friendly success states and fix-focused error copy.',
        mobile: 'On mobile forms, show short inline errors and focus-jump to the first blocking field.'
      },
      ja: {
        ui: '検証UXを改善してください。項目単位表示、フォーカスアウト検証、修正指示つきエラー文を実装してください。',
        lp: 'LP登録フォームの送信失敗を減らすため、リアルタイム検証と簡潔な修正ガイド文を導入してください。',
        form: '肯定フィードバックを含むリアルタイム検証と、修正指示型エラー文を実装してください。',
        mobile: 'モバイルフォームでは短いエラー文を項目近接で表示し、最初の阻害項目へフォーカス移動してください。'
      }
    },
    compareRelationships: ['concise-form', 'readable']
  },
  {
    id: 'mobile-first',
    term: { en: 'Mobile-first', ja: 'モバイル優先' },
    aliases: { en: ['mobile optimized', 'phone-first', 'small-screen first'], ja: ['スマホ優先', 'モバイル最適化', 'スマホで使いやすく'] },
    searchPhrases: {
      en: ['desktop looks fine but mobile breaks', 'too hard to tap on phone', 'mobile bounce is high'],
      ja: ['PCは良いがスマホで崩れる', 'スマホで押しにくい', 'モバイル離脱が高い']
    },
    category: { en: 'Mobile & responsive', ja: 'モバイル/レスポンシブ' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Responsive UX', ja: 'レスポンシブ改善' },
    beginner: { en: 'Designs core flow for small screens first, then scales up to desktop.', ja: '先に小画面で主要導線を成立させ、後からPCへ拡張する考え方です。' },
    practicalIntent: { en: 'Prioritize thumb-friendly actions, short blocks, and vertical task flow.', ja: '親指操作しやすい導線、短い情報ブロック、縦方向タスクフローを優先する。' },
    practicalUseCase: { en: 'Use when mobile traffic is high and completion is lower than desktop.', ja: 'モバイル流入が多く、完了率がPCより低い場合に有効です。' },
    plainExplanation: { en: 'Mobile-first prevents desktop assumptions from breaking real-world phone usage.', ja: 'モバイル優先は、PC前提設計によるスマホ破綻を防ぎます。' },
    commonMisuse: { en: 'Only shrinking desktop UI without rethinking interaction flow.', ja: 'PC UIを縮小するだけで操作設計を見直さないこと。' },
    vagueToPractical: {
      en: ['Design key task in one-column flow', 'Increase tap targets to mobile-safe size', 'Reduce simultaneous choices per screen', 'Keep key CTA reachable without precision taps'],
      ja: ['主要タスクを1カラムで設計', 'タップ領域をモバイル安全サイズへ', '1画面の同時選択肢を減らす', '精密操作不要で主CTAに到達できるようにする']
    },
    badRequest: { en: 'Make this mobile friendly.', ja: 'スマホ対応して。' },
    betterRequest: {
      en: 'Rebuild this flow mobile-first: one-column task sequence, thumb-friendly tap targets, and fewer competing actions per screen.',
      ja: 'この導線をモバイル優先で再構成してください。1カラムのタスク順序、親指で押しやすいタップ領域、1画面あたりの選択肢削減を行ってください。'
    },
    badBetterWhy: {
      en: 'The better request defines interaction constraints unique to mobile, improving practical output quality.',
      ja: '良い依頼はモバイル特有の操作制約を定義し、実運用で使える出力になります。'
    },
    shortPrompt: {
      en: {
        ui: 'Redesign this flow mobile-first with one-column priority and thumb-friendly interactions.',
        lp: 'Optimize this LP for mobile-first scanning: shorter sections, clearer headings, and immediate CTA visibility.',
        form: 'Make this form mobile-first with larger tap targets, fewer fields per screen, and clear progress flow.',
        mobile: 'Audit this screen for mobile-first UX and rewrite layout for thumb-zone-friendly completion.'
      },
      ja: {
        ui: 'この導線をモバイル優先で再設計してください。1カラム優先と親指操作性を重視してください。',
        lp: 'このLPをモバイル優先で最適化してください。セクション短縮、見出し明確化、CTA即視認を行ってください。',
        form: 'このフォームをモバイル優先化してください。タップ領域拡大、1画面項目数削減、進行導線明確化を行ってください。',
        mobile: 'この画面をモバイル優先UXで監査し、親指操作しやすい完了導線へ再構成してください。'
      }
    },
    compareRelationships: ['responsive', 'concise-form']
  },
  {
    id: 'responsive',
    term: { en: 'Responsive clarity', ja: 'レスポンシブ整合' },
    aliases: { en: ['breakpoint consistency', 'cross-device consistency', 'layout breaks on tablet'], ja: ['画面幅ごとの整合', 'タブレットで崩れる', 'デバイス差分を減らす'] },
    searchPhrases: {
      en: ['layout breaks at tablet size', 'desktop and mobile feel like different products', 'components jump between breakpoints'],
      ja: ['タブレット幅で崩れる', 'PCとスマホで別物に見える', 'ブレークポイントで要素が飛ぶ']
    },
    category: { en: 'Mobile & responsive', ja: 'モバイル/レスポンシブ' },
    termType: { en: 'Practical term', ja: '実務語' },
    useCase: { en: 'Responsive UX', ja: 'レスポンシブ改善' },
    beginner: { en: 'Ensures structure, hierarchy, and interaction stay coherent across breakpoints.', ja: 'ブレークポイントをまたいでも構造・階層・操作を一貫させる語です。' },
    practicalIntent: { en: 'Define breakpoint behavior per component and preserve information priority order.', ja: '要素ごとのブレークポイント挙動を定義し、情報優先順位を維持する。' },
    practicalUseCase: { en: 'Useful when tablet or landscape views suffer from layout instability.', ja: 'タブレットや横向き表示で崩れが出る場合に有効です。' },
    plainExplanation: { en: 'Responsive clarity means users should not relearn the interface on each screen size.', ja: 'レスポンシブ整合は、画面幅が変わっても再学習不要な設計です。' },
    commonMisuse: { en: 'Only adding media queries without content-priority rules.', ja: 'メディアクエリ追加だけで情報優先度を定義しないこと。' },
    vagueToPractical: {
      en: ['Map component behavior by breakpoint', 'Preserve CTA position logic across devices', 'Test tablet and landscape layouts explicitly', 'Avoid abrupt typography jumps'],
      ja: ['要素単位でブレークポイント挙動を設計', 'デバイス間でCTA配置ロジックを維持', 'タブレット/横向きを明示テスト', 'タイポサイズの急変を避ける']
    },
    badRequest: { en: 'Fix responsive issues.', ja: 'レスポンシブを直して。' },
    betterRequest: {
      en: 'Stabilize responsive behavior by defining component rules per breakpoint, preserving CTA priority, and validating tablet/landscape layouts.',
      ja: 'ブレークポイントごとの要素ルールを定義し、CTA優先順位を維持しつつ、タブレット/横向き表示を検証してレスポンシブ崩れを改善してください。'
    },
    badBetterWhy: {
      en: 'The better request clarifies where to test and what must stay consistent across devices.',
      ja: '良い依頼は検証対象と維持すべき整合条件を明確にします。'
    },
    shortPrompt: {
      en: {
        ui: 'Fix responsive clarity by defining component behavior at each breakpoint and preserving hierarchy.',
        lp: 'Normalize this LP across breakpoints so messaging order and CTA priority remain consistent.',
        form: 'Ensure this form stays coherent on tablet/mobile with stable grouping and CTA placement.',
        mobile: 'Audit responsive behavior on phone/tablet landscape and correct component jumps.'
      },
      ja: {
        ui: 'ブレークポイントごとの要素挙動を定義し、階層整合を保ってレスポンシブを改善してください。',
        lp: 'このLPを画面幅ごとに正規化し、訴求順序とCTA優先度を一貫させてください。',
        form: 'このフォームがタブレット/モバイルでもグルーピングとCTA位置を維持できるよう調整してください。',
        mobile: 'スマホ/タブレット横向きの崩れを監査し、要素ジャンプを修正してください。'
      }
    },
    compareRelationships: ['mobile-first', 'visual-hierarchy']
  }
];
