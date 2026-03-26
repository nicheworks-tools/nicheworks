window.VIBE_LEXICON_TERMS = [
  {
    "id": "modern",
    "term": {
      "en": "Modern",
      "ja": "今っぽい"
    },
    "aliases": {
      "en": [
        "current",
        "fresh",
        "not outdated",
        "clean look"
      ],
      "ja": [
        "今風",
        "モダン",
        "古く見えるのを直したい"
      ]
    },
    "searchPhrases": {
      "en": [
        "make it look 2026",
        "this UI feels old",
        "refresh this page",
        "less cluttered but still useful"
      ],
      "ja": [
        "古く見える画面を直したい",
        "令和っぽい見た目にしたい",
        "ゴチャゴチャ感を減らしたい",
        "今どきのUIにしたい"
      ]
    },
    "category": {
      "en": "Style goal",
      "ja": "雰囲気語"
    },
    "termType": {
      "en": "Vague term",
      "ja": "曖昧語"
    },
    "useCase": {
      "en": "UI cleanup",
      "ja": "UI改善"
    },
    "beginner": {
      "en": "Usually means cleaner spacing, fewer accents, and clearer visual priorities.",
      "ja": "多くの場合は、余白整理・色数の整理・優先度の明確化を指します。"
    },
    "practicalIntent": {
      "en": "Increase spacing, reduce decorative effects, and keep one primary action per section.",
      "ja": "余白を増やし、装飾を抑え、各セクションの主アクションを1つに絞る。"
    },
    "practicalUseCase": {
      "en": "Use when redesigning old dashboards or landing pages that feel noisy and dated.",
      "ja": "古い管理画面や、情報過多で古く見えるLPの再設計に有効です。"
    },
    "plainExplanation": {
      "en": "“Modern” is shorthand for cleaner hierarchy and calmer visual decisions, not trendy decoration.",
      "ja": "「今っぽい」は流行の装飾ではなく、階層と視線誘導を整えることです。"
    },
    "commonMisuse": {
      "en": "Adding flashy gradients and motion without fixing structure or readability.",
      "ja": "構造を直さず、グラデーションや動きだけ増やしてしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Expand section spacing",
        "Limit accent colors to 1–2",
        "Keep one dominant CTA per block",
        "Reduce decorative shadows and strokes"
      ],
      "ja": [
        "セクション余白を広げる",
        "アクセント色を1〜2色に絞る",
        "各ブロックの主CTAを1つにする",
        "装飾的な影や線を減らす"
      ]
    },
    "badRequest": {
      "en": "Make everything modern.",
      "ja": "全体を今っぽくして。"
    },
    "betterRequest": {
      "en": "Refactor this page to feel modern: widen spacing, reduce accent colors, and enforce one primary CTA per section.",
      "ja": "このページを今っぽく見せるため、余白を広げ、アクセント色を減らし、各セクションの主CTAを1つに統一してください。"
    },
    "badBetterWhy": {
      "en": "The bad request gives no execution criteria. The better request adds concrete layout, color, and CTA constraints so AI can produce measurable changes.",
      "ja": "悪い依頼は評価基準がなく、実装がぶれます。良い依頼は余白・色・CTAの制約を明示し、AI出力を検証可能にします。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Modernize this dashboard: cleaner spacing, fewer accent colors, and one clear primary action per panel.",
        "lp": "Modernize this landing page by reducing clutter, clarifying heading hierarchy, and narrowing each block to one CTA.",
        "form": "Modernize this form: simplify visual noise, increase field spacing, and keep one clear submit path.",
        "mobile": "For mobile, modernize with one-column flow, larger spacing rhythm, and a single dominant CTA."
      },
      "ja": {
        "ui": "この管理画面を今っぽく整理してください。余白を広げ、アクセント色を減らし、パネルごとに主アクションを1つにしてください。",
        "lp": "このLPを今っぽくしてください。情報ノイズを減らし、見出し階層を明確化し、各ブロックのCTAを1つに絞ってください。",
        "form": "このフォームを今っぽくしてください。装飾ノイズを抑え、項目余白を広げ、送信導線を1本にしてください。",
        "mobile": "モバイルでは1カラムで再構成し、余白リズムを広めにし、主要CTAを1つにしてください。"
      }
    },
    "compareRelationships": [
      "refined",
      "minimal",
      "visual-hierarchy"
    ],
    "compareGuides": {
      "refined": {
        "en": {
          "difference": "Modern refreshes overall feel; Refined controls precision and consistency.",
          "whenToUse": "Use Modern first for dated screens, then Refined for premium finishing.",
          "practicality": "Refined is usually more practical for final QA because rules are tighter."
        },
        "ja": {
          "difference": "今っぽいは全体更新、洗練は精度と統一の調整です。",
          "whenToUse": "古さの解消は今っぽい、仕上げ品質は洗練を使います。",
          "practicality": "最終調整では、基準が明確な洗練の方が実務で扱いやすいです。"
        }
      },
      "visual-hierarchy": {
        "en": {
          "difference": "Modern is a style target; Visual hierarchy is a specific readability mechanism.",
          "whenToUse": "Use hierarchy wording when you need actionable structure decisions.",
          "practicality": "Visual hierarchy is more practical because it can be measured by scan order."
        },
        "ja": {
          "difference": "今っぽいは雰囲気語、視覚階層は構造語です。",
          "whenToUse": "実装指示を具体化したい時は視覚階層を使います。",
          "practicality": "視線順序で評価できるため、視覚階層の方が実務的です。"
        }
      }
    }
  },
  {
    "id": "refined",
    "term": {
      "en": "Refined",
      "ja": "洗練された"
    },
    "aliases": {
      "en": [
        "polished",
        "elegant",
        "high-quality look"
      ],
      "ja": [
        "上品",
        "整っている",
        "雑に見えるのを直す"
      ]
    },
    "searchPhrases": {
      "en": [
        "make it feel premium without flashy effects",
        "looks amateur",
        "clean but high-end"
      ],
      "ja": [
        "安っぽく見えるのを直したい",
        "上品にしたい",
        "プレミアム感を出したい"
      ]
    },
    "category": {
      "en": "Style goal",
      "ja": "雰囲気語"
    },
    "termType": {
      "en": "Vague term",
      "ja": "曖昧語"
    },
    "useCase": {
      "en": "Brand page",
      "ja": "ブランド訴求"
    },
    "beginner": {
      "en": "Means consistency and restraint, not decoration-heavy “luxury”.",
      "ja": "派手さより、整合性と節度を高める表現です。"
    },
    "practicalIntent": {
      "en": "Unify typography rhythm, spacing scale, and component stroke/weight rules.",
      "ja": "タイポ、余白スケール、線や太さのルールを統一する。"
    },
    "practicalUseCase": {
      "en": "Useful for pricing, trust pages, and premium B2B product sites.",
      "ja": "価格ページや信頼訴求ページ、高単価B2Bサイトで有効です。"
    },
    "plainExplanation": {
      "en": "Refined design feels intentional because every visual rule stays consistent.",
      "ja": "洗練は、見た目のルールを一貫させて「意図」を感じさせる状態です。"
    },
    "commonMisuse": {
      "en": "Replacing clarity with thin text and low-contrast “minimal luxury”.",
      "ja": "可読性を犠牲にして細字・低コントラストへ寄せること。"
    },
    "vagueToPractical": {
      "en": [
        "Define typography scale and stick to it",
        "Normalize card padding and radius",
        "Reduce random line styles",
        "Standardize icon weight"
      ],
      "ja": [
        "文字サイズ階層を固定する",
        "カード余白と角丸を統一",
        "線の種類を減らす",
        "アイコンの太さを揃える"
      ]
    },
    "badRequest": {
      "en": "Make it refined.",
      "ja": "もっと洗練させて。"
    },
    "betterRequest": {
      "en": "Make this page feel refined by standardizing typography scale, spacing increments, and component stroke weight across all sections.",
      "ja": "全セクションで文字階層・余白単位・線の太さを統一し、洗練された印象にしてください。"
    },
    "badBetterWhy": {
      "en": "The better version lists consistency targets. This prevents AI from returning random decorative tweaks.",
      "ja": "良い依頼は統一対象を明示し、AIが場当たり的な装飾調整に逃げるのを防ぎます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Refine this UI with strict spacing increments, consistent typography rhythm, and reduced visual noise.",
        "lp": "Refine this LP by aligning heading/body rhythm, cleaning component borders, and removing decorative excess.",
        "form": "Refine this form using consistent field spacing, coherent label hierarchy, and minimal stroke variation.",
        "mobile": "For mobile, refine by reducing noise and maintaining a consistent text-and-spacing rhythm."
      },
      "ja": {
        "ui": "このUIを洗練してください。余白単位を統一し、文字リズムを揃え、視覚ノイズを減らしてください。",
        "lp": "このLPを洗練してください。見出しと本文のリズムを揃え、線の使い方を統一し、過剰装飾を減らしてください。",
        "form": "このフォームを洗練してください。項目間余白、ラベル階層、線の太さを一貫させてください。",
        "mobile": "モバイルではノイズを抑え、文字と余白のリズムを一貫させてください。"
      }
    },
    "compareRelationships": [
      "modern",
      "premium",
      "minimal"
    ],
    "compareGuides": {
      "premium": {
        "en": {
          "difference": "Refined describes execution quality; Premium describes brand positioning and trust cues.",
          "whenToUse": "Use Premium when messaging and pricing perception matter, Refined when UI polish quality is the issue.",
          "practicality": "Refined is usually more actionable in a design task brief."
        },
        "ja": {
          "difference": "洗練は実装品質、プレミアムはブランド印象の語です。",
          "whenToUse": "価格印象や信頼訴求が課題ならプレミアム、UI品質調整なら洗練を使います。",
          "practicality": "制作指示では洗練の方が具体化しやすいです。"
        }
      }
    }
  },
  {
    "id": "readable",
    "term": {
      "en": "Readable",
      "ja": "読みやすい"
    },
    "aliases": {
      "en": [
        "easy to read",
        "text clarity",
        "less eye strain"
      ],
      "ja": [
        "見やすい",
        "読み疲れしない",
        "文字が追いやすい"
      ]
    },
    "searchPhrases": {
      "en": [
        "text feels dense",
        "people skip paragraphs",
        "hard to read on mobile"
      ],
      "ja": [
        "文字が詰まって読みにくい",
        "文章を飛ばし読みされる",
        "スマホで読みづらい"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Docs & forms",
      "ja": "テキスト改善"
    },
    "beginner": {
      "en": "Focuses on line length, line height, contrast, and heading rhythm.",
      "ja": "行長・行間・コントラスト・見出しリズムを整える語です。"
    },
    "practicalIntent": {
      "en": "Reduce cognitive load by improving typography structure and scan flow.",
      "ja": "タイポ構造と視線導線を整え、認知負荷を下げる。"
    },
    "practicalUseCase": {
      "en": "Use for onboarding docs, settings pages, and long-form explanations.",
      "ja": "オンボーディング文書、設定画面、長文説明ページに向きます。"
    },
    "plainExplanation": {
      "en": "Readable means users can find key points quickly without re-reading.",
      "ja": "読みやすい状態は、読み返し無しで要点へ到達できる状態です。"
    },
    "commonMisuse": {
      "en": "Increasing font size only, while keeping poor hierarchy and dense blocks.",
      "ja": "文字サイズだけ上げて、階層や密度を改善しないこと。"
    },
    "vagueToPractical": {
      "en": [
        "Limit paragraph width",
        "Increase body line-height",
        "Use subheadings every 2–4 paragraphs",
        "Surface summary bullets first"
      ],
      "ja": [
        "1行文字数を抑える",
        "本文行間を広げる",
        "2〜4段落ごとに小見出しを置く",
        "先に要点箇条書きを置く"
      ]
    },
    "badRequest": {
      "en": "Make it easier to read.",
      "ja": "読みやすくして。"
    },
    "betterRequest": {
      "en": "Improve readability by shortening line length, increasing line-height, and restructuring sections with clear subheadings and bullet summaries.",
      "ja": "1行文字数を短くし、行間を広げ、小見出しと要点箇条書きでセクションを再構成して可読性を改善してください。"
    },
    "badBetterWhy": {
      "en": "The better request names measurable typography and structure changes, so output quality can be reviewed objectively.",
      "ja": "良い依頼は測定可能な文字組みと構成条件を示すため、出力品質を客観評価できます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Improve readability: stronger heading hierarchy, shorter text blocks, and better line spacing.",
        "lp": "Make this LP readable with concise sections, clear heading rhythm, and scan-first bullet summaries.",
        "form": "Improve form readability by grouping related fields and simplifying helper text.",
        "mobile": "For mobile readability, reduce block length, widen spacing rhythm, and keep high text contrast."
      },
      "ja": {
        "ui": "可読性を改善してください。見出し階層を強化し、文章ブロックを短くし、行間を整えてください。",
        "lp": "このLPの可読性を上げてください。セクションを短くし、見出しリズムを揃え、先に要点箇条書きを置いてください。",
        "form": "フォーム可読性を改善してください。関連項目をまとめ、補助文を簡潔にしてください。",
        "mobile": "モバイル可読性を上げるため、ブロック長を短くし、余白を広げ、高コントラストを保ってください。"
      }
    },
    "compareRelationships": [
      "scannable",
      "visual-hierarchy",
      "minimal"
    ]
  },
  {
    "id": "scannable",
    "term": {
      "en": "Scannable",
      "ja": "流し読みしやすい"
    },
    "aliases": {
      "en": [
        "easy to scan",
        "quick skim",
        "find key points fast"
      ],
      "ja": [
        "要点を拾いやすい",
        "ざっと読める",
        "見出しで追える"
      ]
    },
    "searchPhrases": {
      "en": [
        "users do not read everything",
        "need quick glance understanding",
        "too much text wall"
      ],
      "ja": [
        "全部読まれない",
        "パッと見で理解させたい",
        "文章の壁になっている"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Content UX",
      "ja": "情報設計"
    },
    "beginner": {
      "en": "Scannable focuses on information chunking and visual entry points.",
      "ja": "流し読みしやすさは、情報の分割と入口の作り方に関する語です。"
    },
    "practicalIntent": {
      "en": "Create clear chunk boundaries, headings, and summary-first structure.",
      "ja": "情報の塊を分け、見出しと要約先出し構造を作る。"
    },
    "practicalUseCase": {
      "en": "Best for FAQ, product specs, comparisons, and policy pages.",
      "ja": "FAQ、仕様比較、ポリシー説明などで効果的です。"
    },
    "plainExplanation": {
      "en": "Scannable copy helps users understand enough in seconds before deciding to read more.",
      "ja": "流し読みしやすい構成は、数秒で必要情報へ到達できる状態です。"
    },
    "commonMisuse": {
      "en": "Overusing bold text without structural grouping.",
      "ja": "構造を変えず太字だけ増やすこと。"
    },
    "vagueToPractical": {
      "en": [
        "Add descriptive subheadings",
        "Start each block with one-line summary",
        "Use table/list where comparison exists",
        "Break long paragraphs into chunks"
      ],
      "ja": [
        "説明的な小見出しを追加",
        "各ブロック冒頭に1行要約を置く",
        "比較は表や箇条書きにする",
        "長文段落を分割する"
      ]
    },
    "badRequest": {
      "en": "Make this content scannable.",
      "ja": "流し読みしやすくして。"
    },
    "betterRequest": {
      "en": "Restructure this content for scanning: summary-first blocks, descriptive subheadings, and list/table formatting for comparisons.",
      "ja": "このコンテンツを流し読み向けに再構成してください。要約先出し、小見出し強化、比較箇所は箇条書きまたは表にしてください。"
    },
    "badBetterWhy": {
      "en": "The better request specifies content architecture, not just visual style.",
      "ja": "良い依頼は見た目ではなく、情報アーキテクチャの変更点を指定しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Make this settings UI scannable with clear grouping labels and short summaries per group.",
        "lp": "Make this LP scannable using summary-first sections and descriptive subheadings.",
        "form": "Make this form scannable by chunking fields and labeling each block by user goal.",
        "mobile": "For mobile scanning, use short blocks, sticky section labels, and summary-first text."
      },
      "ja": {
        "ui": "この設定UIを流し読みしやすくしてください。グループ見出しを明確にし、各ブロック冒頭に短い要約を置いてください。",
        "lp": "このLPを流し読み向けにしてください。要約先出し構成と説明的な小見出しを使ってください。",
        "form": "このフォームを流し読み向けにし、入力項目を目的別に分割して見出しを付けてください。",
        "mobile": "モバイルでは短いブロック化と要約先出しで、流し読みしやすくしてください。"
      }
    },
    "compareRelationships": [
      "readable",
      "visual-hierarchy"
    ]
  },
  {
    "id": "visual-hierarchy",
    "term": {
      "en": "Visual hierarchy",
      "ja": "視覚階層"
    },
    "aliases": {
      "en": [
        "priority clarity",
        "what to look at first",
        "attention order"
      ],
      "ja": [
        "優先度がわかる",
        "どこから見るか明確",
        "情報の強弱"
      ]
    },
    "searchPhrases": {
      "en": [
        "users do not know where to look",
        "everything feels equally loud",
        "main action is buried"
      ],
      "ja": [
        "どこを見ればいいか分からない",
        "全部同じ強さに見える",
        "主導線が埋もれている"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "UI structure",
      "ja": "構造改善"
    },
    "beginner": {
      "en": "Defines visual priority order: first glance, second glance, and detail layers.",
      "ja": "視線の優先順位（最初に見る/次に見る/詳細）を設計する語です。"
    },
    "practicalIntent": {
      "en": "Control heading scale, contrast, spacing, and CTA prominence to guide attention.",
      "ja": "見出しサイズ・コントラスト・余白・CTA強度で視線を誘導する。"
    },
    "practicalUseCase": {
      "en": "Use when users miss key CTA or cannot identify the page purpose quickly.",
      "ja": "主CTAが見つからない、ページ目的が伝わらない時に使います。"
    },
    "plainExplanation": {
      "en": "Visual hierarchy is the execution layer behind terms like modern, clean, and premium.",
      "ja": "視覚階層は「今っぽい」「きれい」の裏側にある実装レイヤーです。"
    },
    "commonMisuse": {
      "en": "Making headlines bigger without reducing competing visual noise.",
      "ja": "見出しだけ大きくして競合ノイズを残すこと。"
    },
    "vagueToPractical": {
      "en": [
        "Define one dominant element per viewport",
        "Separate section tiers with spacing",
        "Lower contrast for secondary text",
        "Limit competing button styles"
      ],
      "ja": [
        "1画面1主役を定義する",
        "余白で階層を分ける",
        "補助情報のコントラストを下げる",
        "ボタン種別の競合を減らす"
      ]
    },
    "badRequest": {
      "en": "Make it easier to understand at a glance.",
      "ja": "ひと目で分かるようにして。"
    },
    "betterRequest": {
      "en": "Strengthen visual hierarchy so users see page purpose first, then value points, then a single primary CTA.",
      "ja": "視覚階層を強化し、ページ目的→価値ポイント→主CTAの順で視線が流れるようにしてください。"
    },
    "badBetterWhy": {
      "en": "The better request defines intended scan order, giving AI a target flow to build around.",
      "ja": "良い依頼は視線順序を定義し、AI出力の誘導設計を具体化します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Improve visual hierarchy: one dominant headline, clear secondary labels, and one primary CTA.",
        "lp": "Rebuild LP hierarchy so value prop appears first, proof second, and CTA third with clear visual separation.",
        "form": "Improve form hierarchy by emphasizing section purpose, then fields, then submit action.",
        "mobile": "For mobile, enforce one dominant item per screen and reduce competing visual weights."
      },
      "ja": {
        "ui": "視覚階層を改善してください。主見出しを1つに絞り、補助ラベルを整理し、主CTAを明確化してください。",
        "lp": "LPの視覚階層を再設計してください。価値提案→根拠→CTAの順で明確に分離してください。",
        "form": "フォーム階層を改善し、セクション目的→入力項目→送信導線の順で強弱を付けてください。",
        "mobile": "モバイルでは1画面1主役を徹底し、競合する強調要素を減らしてください。"
      }
    },
    "compareRelationships": [
      "modern",
      "scannable",
      "clear-cta"
    ]
  },
  {
    "id": "clear-cta",
    "term": {
      "en": "Clear CTA",
      "ja": "CTA明確化"
    },
    "aliases": {
      "en": [
        "strong call to action",
        "clear next step",
        "action clarity"
      ],
      "ja": [
        "行動導線を明確に",
        "次の一歩を明確に",
        "CTAが分かりにくい"
      ]
    },
    "searchPhrases": {
      "en": [
        "users do not click",
        "too many buttons",
        "main action unclear"
      ],
      "ja": [
        "ボタンが押されない",
        "ボタンが多すぎる",
        "次に何をすべきか分からない"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/転換"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Landing page CTA",
      "ja": "CV導線"
    },
    "beginner": {
      "en": "Makes the next user action obvious and low-friction.",
      "ja": "ユーザーの次アクションを迷わせず、実行しやすくする語です。"
    },
    "practicalIntent": {
      "en": "Reduce CTA competition and align each button label with user intent.",
      "ja": "CTA競合を減らし、ボタン文言を利用者意図に合わせる。"
    },
    "practicalUseCase": {
      "en": "Useful for landing pages, pricing pages, and onboarding completion steps.",
      "ja": "LP、料金ページ、オンボ完了導線で効果的です。"
    },
    "plainExplanation": {
      "en": "A clear CTA is not louder color alone; it is clearer choice architecture.",
      "ja": "CTA明確化は色を派手にすることではなく、選択構造を明瞭化することです。"
    },
    "commonMisuse": {
      "en": "Adding more buttons and expecting higher conversion.",
      "ja": "ボタン数を増やしてCV改善を狙うこと。"
    },
    "vagueToPractical": {
      "en": [
        "Keep one primary CTA per section",
        "Rewrite labels with action + outcome",
        "Demote secondary actions visually",
        "Place reassurance near CTA"
      ],
      "ja": [
        "セクションごとの主CTAを1つにする",
        "ボタンを「行動+結果」で書く",
        "副導線の強度を下げる",
        "CTA付近に安心材料を置く"
      ]
    },
    "badRequest": {
      "en": "Make the CTA better.",
      "ja": "CTAを良くして。"
    },
    "betterRequest": {
      "en": "Improve CTA clarity by keeping one primary action per section, rewriting labels with user outcome, and visually demoting secondary actions.",
      "ja": "CTAを明確化するため、各セクションの主アクションを1つにし、ボタン文言を成果ベースに書き換え、副導線の強度を下げてください。"
    },
    "badBetterWhy": {
      "en": "The better request defines both content and hierarchy changes, which directly impact click behavior.",
      "ja": "良い依頼は文言変更と視覚階層変更を同時指定し、クリック行動に直結します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Clarify CTA flow: one primary action, explicit button outcome labels, and subdued secondary actions.",
        "lp": "Improve LP conversion by reducing CTA choices and rewriting primary button text around user outcome.",
        "form": "For this form, make submit action unmistakable and demote cancel/reset actions.",
        "mobile": "On mobile, keep one sticky primary CTA and avoid competing fixed actions."
      },
      "ja": {
        "ui": "CTA導線を明確化してください。主アクションを1つにし、ボタン文言を成果ベースへ修正し、副導線を弱めてください。",
        "lp": "LPのCV改善のため、CTA選択肢を減らし、主ボタン文言をユーザー成果起点で書き換えてください。",
        "form": "このフォームでは送信ボタンを明確化し、キャンセルやリセットの強度を下げてください。",
        "mobile": "モバイルでは固定主CTAを1つにし、競合する固定導線を避けてください。"
      }
    },
    "compareRelationships": [
      "conversion-focused",
      "visual-hierarchy"
    ]
  },
  {
    "id": "conversion-focused",
    "term": {
      "en": "Conversion-focused",
      "ja": "CV重視"
    },
    "aliases": {
      "en": [
        "increase signups",
        "conversion optimization",
        "action-oriented"
      ],
      "ja": [
        "成約率を上げたい",
        "登録率改善",
        "CVR改善"
      ]
    },
    "searchPhrases": {
      "en": [
        "improve signup rate",
        "more demo bookings",
        "too many drop-offs before submit"
      ],
      "ja": [
        "登録率を上げたい",
        "問い合わせ完了率を上げたい",
        "途中離脱が多い"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/転換"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Landing page CTA",
      "ja": "CV導線"
    },
    "beginner": {
      "en": "Prioritizes message clarity, trust cues, and friction reduction toward one outcome.",
      "ja": "1つの成果に向け、訴求明確化・不安解消・摩擦低減を行う語です。"
    },
    "practicalIntent": {
      "en": "Align value proposition, proof, and action path to reduce conversion friction.",
      "ja": "価値訴求・根拠・行動導線を揃え、CVの摩擦を減らす。"
    },
    "practicalUseCase": {
      "en": "Use for SaaS trial signup pages, lead-gen LPs, and checkout pre-step pages.",
      "ja": "SaaS体験登録、リード獲得LP、購入前導線で有効です。"
    },
    "plainExplanation": {
      "en": "Conversion-focused wording makes every section support one business goal.",
      "ja": "CV重視は、各セクションを1つの成果に向けて整列させる考え方です。"
    },
    "commonMisuse": {
      "en": "Forcing urgency everywhere and reducing trust.",
      "ja": "煽り表現を多用して信頼を落とすこと。"
    },
    "vagueToPractical": {
      "en": [
        "Define one primary conversion event",
        "Match headline to user pain",
        "Add trust proof near decision points",
        "Cut non-critical distractions"
      ],
      "ja": [
        "主CVイベントを1つ定義",
        "見出しをユーザー課題に合わせる",
        "意思決定箇所に信頼要素を置く",
        "非本質なノイズを削る"
      ]
    },
    "badRequest": {
      "en": "Make this page convert better.",
      "ja": "このページのCVを上げて。"
    },
    "betterRequest": {
      "en": "Optimize this page for trial signup conversion: sharpen pain-to-value headline, add social proof near CTA, and remove non-critical distractions.",
      "ja": "体験登録CV向上のため、課題→価値の見出しを強化し、CTA近くに社会的証明を追加し、不要要素を削除してください。"
    },
    "badBetterWhy": {
      "en": "The better request names target conversion event and specific leverage points, improving output relevance.",
      "ja": "良い依頼は対象CVイベントと改善レバーを指定し、出力の的外れを防ぎます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Rework this onboarding UI for conversion: reduce friction, surface trust cues, and emphasize completion action.",
        "lp": "Make this LP conversion-focused with a sharper value proposition, stronger proof, and one clear signup path.",
        "form": "Increase form completion by clarifying benefits, reducing optional fields, and making the submit action confidence-building.",
        "mobile": "For mobile conversion, reduce scroll friction and keep the value + CTA loop visible."
      },
      "ja": {
        "ui": "このオンボーディングUIをCV重視で再設計してください。摩擦を減らし、信頼要素を見せ、完了導線を強調してください。",
        "lp": "このLPをCV重視化してください。価値訴求を鋭くし、根拠を強め、登録導線を1本化してください。",
        "form": "フォーム完了率を上げるため、便益を明確化し、任意項目を減らし、送信時の安心感を高めてください。",
        "mobile": "モバイルCV改善として、スクロール摩擦を減らし、価値訴求とCTAを常に近接させてください。"
      }
    },
    "compareRelationships": [
      "clear-cta",
      "premium"
    ]
  },
  {
    "id": "balanced-spacing",
    "term": {
      "en": "Balanced spacing",
      "ja": "余白バランス"
    },
    "aliases": {
      "en": [
        "better spacing",
        "less cramped",
        "air in layout"
      ],
      "ja": [
        "余白を整える",
        "詰まり感を減らす",
        "窮屈さ解消"
      ]
    },
    "searchPhrases": {
      "en": [
        "layout feels cramped",
        "sections are too close",
        "cards feel crowded"
      ],
      "ja": [
        "レイアウトが詰まっている",
        "セクション間隔が狭い",
        "カードが窮屈"
      ]
    },
    "category": {
      "en": "Layout & spacing",
      "ja": "レイアウト/余白"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Layout tuning",
      "ja": "余白調整"
    },
    "beginner": {
      "en": "Controls rhythm so sections breathe without wasting space.",
      "ja": "狭すぎず広すぎない余白リズムを作る語です。"
    },
    "practicalIntent": {
      "en": "Set spacing scale and apply it consistently across sections and components.",
      "ja": "余白スケールを定義し、セクションと要素に一貫適用する。"
    },
    "practicalUseCase": {
      "en": "Use when pages feel dense, inconsistent, or visually noisy.",
      "ja": "密度過多・統一不足・ノイズ感があるページに有効です。"
    },
    "plainExplanation": {
      "en": "Balanced spacing improves comprehension because grouping boundaries become obvious.",
      "ja": "余白バランスが整うと、情報のまとまり境界が明確になります。"
    },
    "commonMisuse": {
      "en": "Adding random large gaps without hierarchy intent.",
      "ja": "意図なく大きな余白だけ増やすこと。"
    },
    "vagueToPractical": {
      "en": [
        "Define 8px/12px/16px rhythm tiers",
        "Increase spacing between different section levels",
        "Keep tighter spacing within same group",
        "Align card/header paddings"
      ],
      "ja": [
        "8/12/16px等の段階を定義",
        "階層が変わる境界は余白を広げる",
        "同グループ内は余白を狭める",
        "カード/見出し余白を統一する"
      ]
    },
    "badRequest": {
      "en": "Add more whitespace.",
      "ja": "余白を増やして。"
    },
    "betterRequest": {
      "en": "Balance spacing using a fixed scale: tighter within groups, wider between sections, and consistent card/header padding.",
      "ja": "固定余白スケールで余白を調整してください。グループ内は狭く、セクション間は広く、カードと見出し余白は統一してください。"
    },
    "badBetterWhy": {
      "en": "The better request converts “more whitespace” into a spacing system that AI can apply consistently.",
      "ja": "良い依頼は「余白を増やす」を余白システムへ変換し、AIの適用一貫性を高めます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Rebalance spacing with clear inner-vs-outer spacing rules and consistent card paddings.",
        "lp": "Improve LP spacing rhythm so each section boundary is clear and easy to scan.",
        "form": "Adjust form spacing to separate field groups clearly while keeping related fields tight.",
        "mobile": "On mobile, keep spacing rhythm generous but consistent to prevent cramped scanning."
      },
      "ja": {
        "ui": "内側余白と外側余白のルールを分けて、余白バランスを再調整してください。",
        "lp": "セクション境界が分かるようにLPの余白リズムを整えてください。",
        "form": "関連項目は密に、グループ間は広くしてフォーム余白を調整してください。",
        "mobile": "モバイルでは窮屈さを防ぎつつ、余白リズムを一貫させてください。"
      }
    },
    "compareRelationships": [
      "minimal",
      "visual-hierarchy"
    ]
  },
  {
    "id": "minimal",
    "term": {
      "en": "Minimal",
      "ja": "ミニマル"
    },
    "aliases": {
      "en": [
        "simplified",
        "reduced UI",
        "remove clutter"
      ],
      "ja": [
        "シンプル",
        "要素を削る",
        "ごちゃつき解消"
      ]
    },
    "searchPhrases": {
      "en": [
        "too many elements",
        "looks busy",
        "need cleaner screen"
      ],
      "ja": [
        "要素が多すぎる",
        "画面がうるさい",
        "もっとシンプルにしたい"
      ]
    },
    "category": {
      "en": "Style goal",
      "ja": "雰囲気語"
    },
    "termType": {
      "en": "Vague term",
      "ja": "曖昧語"
    },
    "useCase": {
      "en": "Page simplification",
      "ja": "UI整理"
    },
    "beginner": {
      "en": "Means reducing competing elements, not removing necessary guidance.",
      "ja": "必要情報を残しつつ、競合要素を減らす表現です。"
    },
    "practicalIntent": {
      "en": "Remove redundant elements and keep one clear purpose per area.",
      "ja": "冗長要素を減らし、エリアごとの目的を1つに保つ。"
    },
    "practicalUseCase": {
      "en": "Useful when users report cognitive overload or visual fatigue.",
      "ja": "認知負荷や視覚疲労が高い画面で有効です。"
    },
    "plainExplanation": {
      "en": "Minimal design makes the important thing unmistakable by reducing competition.",
      "ja": "ミニマルは重要要素を目立たせるために競合を減らす設計です。"
    },
    "commonMisuse": {
      "en": "Deleting contextual help and harming completion rate.",
      "ja": "補助情報まで削って完了率を下げること。"
    },
    "vagueToPractical": {
      "en": [
        "Remove duplicate controls",
        "Consolidate repetitive cards",
        "Limit icon and color variations",
        "Retain essential helper text only"
      ],
      "ja": [
        "重複操作を削除",
        "似たカードを統合",
        "アイコン/色のバリエーションを制限",
        "必要な補助文は残す"
      ]
    },
    "badRequest": {
      "en": "Make it minimal.",
      "ja": "ミニマルにして。"
    },
    "betterRequest": {
      "en": "Simplify this screen by removing redundant controls, consolidating repetitive sections, and preserving only guidance that supports task completion.",
      "ja": "冗長操作を削除し、重複セクションを統合しつつ、完了に必要な補助情報だけ残してミニマル化してください。"
    },
    "badBetterWhy": {
      "en": "The better request protects usability while reducing clutter.",
      "ja": "良い依頼は「削る」だけでなく、使いやすさ維持条件を含みます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Make this UI minimal by removing duplicate controls and keeping one clear purpose per panel.",
        "lp": "Simplify this LP with shorter sections, fewer visual decorations, and one CTA focus per block.",
        "form": "Make this form minimal but usable: essential fields only, clear helper text, and one submit path.",
        "mobile": "For mobile minimalism, keep one task focus per screen and avoid competing UI chrome."
      },
      "ja": {
        "ui": "このUIをミニマル化してください。重複操作を減らし、パネルごとの目的を1つにしてください。",
        "lp": "このLPを簡潔化してください。セクションを短くし、装飾を減らし、ブロックごとのCTAを1つにしてください。",
        "form": "このフォームを使いやすさを保ったままミニマル化してください。必須項目中心で、送信導線を1本化してください。",
        "mobile": "モバイルでは1画面1目的を徹底し、競合するUI装飾を抑えてください。"
      }
    },
    "compareRelationships": [
      "modern",
      "balanced-spacing",
      "readable"
    ]
  },
  {
    "id": "premium",
    "term": {
      "en": "Premium",
      "ja": "プレミアム感"
    },
    "aliases": {
      "en": [
        "high-end",
        "luxury feel",
        "trustworthy quality"
      ],
      "ja": [
        "高級感",
        "上質感",
        "信頼感を高めたい"
      ]
    },
    "searchPhrases": {
      "en": [
        "looks cheap",
        "need more trust before pricing",
        "higher-value brand feel"
      ],
      "ja": [
        "安っぽく見える",
        "価格に見合う印象にしたい",
        "信頼感を上げたい"
      ]
    },
    "category": {
      "en": "Style goal",
      "ja": "雰囲気語"
    },
    "termType": {
      "en": "Vague term",
      "ja": "曖昧語"
    },
    "useCase": {
      "en": "Brand page",
      "ja": "ブランド訴求"
    },
    "beginner": {
      "en": "Premium combines visual restraint with trust signals and proof quality.",
      "ja": "プレミアム感は節度ある見た目と信頼要素の質で作ります。"
    },
    "practicalIntent": {
      "en": "Strengthen credibility cues, polish typography, and remove discount-style urgency noise.",
      "ja": "信頼要素を強化し、タイポを整え、安売り感のある煽りを減らす。"
    },
    "practicalUseCase": {
      "en": "Useful for enterprise pricing pages and high-ticket service LPs.",
      "ja": "法人向け価格ページや高単価サービスLPに向きます。"
    },
    "plainExplanation": {
      "en": "Premium is not expensive-looking effects; it is calm confidence supported by proof.",
      "ja": "プレミアム感は派手さではなく、根拠に支えられた落ち着いた自信です。"
    },
    "commonMisuse": {
      "en": "Adding dark gradients and gold accents without trust content.",
      "ja": "信頼情報なしで色演出だけ豪華にすること。"
    },
    "vagueToPractical": {
      "en": [
        "Show concrete trust badges/testimonials",
        "Improve typography consistency",
        "Use restrained color system",
        "Rewrite copy with confidence over hype"
      ],
      "ja": [
        "具体的な信頼要素を提示",
        "文字組みの一貫性を上げる",
        "色設計を節度ある構成にする",
        "煽りではなく根拠重視の文言へ変更"
      ]
    },
    "badRequest": {
      "en": "Make this look premium.",
      "ja": "高級感を出して。"
    },
    "betterRequest": {
      "en": "Create a premium feel by tightening typography consistency, adding concrete trust proof near pricing, and replacing hype-heavy copy with confident factual language.",
      "ja": "プレミアム感を出すため、文字組みを統一し、価格周辺に信頼根拠を追加し、煽り文言を根拠ベースの表現へ置き換えてください。"
    },
    "badBetterWhy": {
      "en": "The better request ties aesthetics to trust mechanics, which improves business relevance.",
      "ja": "良い依頼は見た目と信頼構築を結びつけ、事業成果につながる改善になります。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Elevate this interface to a premium tone through disciplined typography, restrained color use, and stronger trust cues.",
        "lp": "Make this LP premium by reducing hype, increasing credibility proof, and sharpening polished consistency.",
        "form": "Give this form a premium tone with clear trust microcopy and calm, consistent visual rhythm.",
        "mobile": "On mobile, premium feel should come from clean rhythm, confidence-oriented copy, and visible trust signals."
      },
      "ja": {
        "ui": "このUIをプレミアム寄りに調整してください。タイポ統一、節度ある配色、信頼要素強化を行ってください。",
        "lp": "このLPのプレミアム感を高めてください。煽りを減らし、信頼根拠を増やし、全体の整合性を強化してください。",
        "form": "このフォームにプレミアム感を持たせてください。安心できる補助文と落ち着いた視覚リズムを整えてください。",
        "mobile": "モバイルでは整った余白リズムと信頼要素の見せ方でプレミアム感を作ってください。"
      }
    },
    "compareRelationships": [
      "refined",
      "conversion-focused"
    ]
  },
  {
    "id": "concise-form",
    "term": {
      "en": "Concise form",
      "ja": "フォーム簡潔化"
    },
    "aliases": {
      "en": [
        "shorter form",
        "reduce fields",
        "fewer inputs"
      ],
      "ja": [
        "入力項目を減らす",
        "フォームを短く",
        "離脱を減らすフォーム"
      ]
    },
    "searchPhrases": {
      "en": [
        "form abandonment is high",
        "too many questions",
        "users give up halfway"
      ],
      "ja": [
        "フォーム離脱が多い",
        "質問が多すぎる",
        "途中で入力をやめる"
      ]
    },
    "category": {
      "en": "Form & validation",
      "ja": "フォーム/検証"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Form optimization",
      "ja": "フォーム改善"
    },
    "beginner": {
      "en": "Removes non-essential fields and clarifies why each required input exists.",
      "ja": "不要項目を削り、必須入力の理由を明確化する語です。"
    },
    "practicalIntent": {
      "en": "Lower completion friction while preserving required business data.",
      "ja": "必要データを維持しつつ、入力摩擦を下げる。"
    },
    "practicalUseCase": {
      "en": "Use for inquiry, signup, and onboarding forms with drop-off issues.",
      "ja": "問い合わせ、登録、オンボーディングフォームの離脱対策に有効です。"
    },
    "plainExplanation": {
      "en": "Concise forms ask less, explain better, and complete faster.",
      "ja": "簡潔なフォームは「聞く量を減らし、説明を明確にし、完了を早くする」設計です。"
    },
    "commonMisuse": {
      "en": "Removing required fields without updating business process.",
      "ja": "業務要件を確認せず必須項目を削ること。"
    },
    "vagueToPractical": {
      "en": [
        "Audit each field for necessity",
        "Convert optional long text into selectable options",
        "Use progressive disclosure",
        "Clarify required vs optional labels"
      ],
      "ja": [
        "各項目の必要性を棚卸しする",
        "自由記述を選択式に置換する",
        "段階表示を導入する",
        "必須/任意を明確にする"
      ]
    },
    "badRequest": {
      "en": "Make this form less annoying.",
      "ja": "このフォームを面倒じゃなくして。"
    },
    "betterRequest": {
      "en": "Shorten this form by removing low-value fields, clarifying required inputs, and moving advanced questions to a later step.",
      "ja": "低優先度項目を削除し、必須入力を明確化し、詳細質問は後段へ移動してフォームを短くしてください。"
    },
    "badBetterWhy": {
      "en": "The better request balances UX and data needs by specifying what to remove and what to defer.",
      "ja": "良い依頼は削減対象と後段移動対象を明示し、UXと業務要件を両立します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Optimize this form for completion: remove non-essential fields and clarify required inputs.",
        "lp": "On this LP form, shorten the first step and defer advanced questions after conversion.",
        "form": "Make this form concise by auditing field necessity and collapsing optional complexity.",
        "mobile": "For mobile, keep first-step fields minimal and reveal extra questions only when needed."
      },
      "ja": {
        "ui": "このフォームを完了重視で最適化してください。不要項目を削り、必須入力を明確にしてください。",
        "lp": "LPフォームは初回入力を短くし、詳細質問をCV後へ回してください。",
        "form": "項目必要性を棚卸しし、任意の複雑入力を畳んでフォームを簡潔化してください。",
        "mobile": "モバイルでは初回入力項目を最小化し、必要時のみ追加質問を表示してください。"
      }
    },
    "compareRelationships": [
      "inline-validation",
      "conversion-focused"
    ]
  },
  {
    "id": "inline-validation",
    "term": {
      "en": "Inline validation",
      "ja": "リアルタイム検証"
    },
    "aliases": {
      "en": [
        "form error clarity",
        "live validation",
        "input feedback"
      ],
      "ja": [
        "入力エラーをすぐ表示",
        "リアルタイムエラー案内",
        "検証メッセージ改善"
      ]
    },
    "searchPhrases": {
      "en": [
        "users fail on submit",
        "error message is unclear",
        "form feels frustrating"
      ],
      "ja": [
        "送信時にエラーが多い",
        "エラーメッセージが分かりにくい",
        "フォーム体験がストレス"
      ]
    },
    "category": {
      "en": "Form & validation",
      "ja": "フォーム/検証"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Form optimization",
      "ja": "フォーム改善"
    },
    "beginner": {
      "en": "Shows validation feedback at the right moment, with actionable wording.",
      "ja": "適切なタイミングで、修正方法がわかる検証メッセージを出す語です。"
    },
    "practicalIntent": {
      "en": "Reduce correction loops by surfacing errors near fields with fix instructions.",
      "ja": "項目付近で修正方法つきエラーを表示し、再入力ループを減らす。"
    },
    "practicalUseCase": {
      "en": "Best for signup/payment forms where submit failures hurt conversion.",
      "ja": "登録/決済フォームなど、送信失敗がCVに直結する場面で有効です。"
    },
    "plainExplanation": {
      "en": "Good validation says what is wrong, why, and how to fix it immediately.",
      "ja": "良い検証は「何が」「なぜ」「どう直すか」を即時に示します。"
    },
    "commonMisuse": {
      "en": "Showing red errors from first keystroke and increasing anxiety.",
      "ja": "入力開始直後から赤エラーを連発して不安を増やすこと。"
    },
    "vagueToPractical": {
      "en": [
        "Validate on blur for most fields",
        "Use positive confirmation for correct input",
        "Write fix-oriented error text",
        "Keep focus on first failing field on submit"
      ],
      "ja": [
        "基本はフォーカスアウト時に検証",
        "正しい入力には肯定フィードバックを出す",
        "エラー文を修正指示型にする",
        "送信時は最初のエラー項目へフォーカス"
      ]
    },
    "badRequest": {
      "en": "Improve form validation.",
      "ja": "フォーム検証を改善して。"
    },
    "betterRequest": {
      "en": "Implement inline validation that shows fix-oriented messages near fields, validates on blur, and auto-focuses the first failing input on submit.",
      "ja": "項目近接で修正指示型メッセージを表示し、基本はフォーカスアウト時に検証し、送信時は最初のエラー項目へ自動フォーカスするよう実装してください。"
    },
    "badBetterWhy": {
      "en": "The better request sets timing, placement, and message style, which directly changes error recovery speed.",
      "ja": "良い依頼は検証タイミング・表示位置・文言方針を定義し、エラー回復速度を上げます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Upgrade validation UX: field-level feedback, blur timing, and clear fix instructions per error.",
        "lp": "For LP signup, reduce submit failures with inline validation and concise, actionable error wording.",
        "form": "Implement inline validation with friendly success states and fix-focused error copy.",
        "mobile": "On mobile forms, show short inline errors and focus-jump to the first blocking field."
      },
      "ja": {
        "ui": "検証UXを改善してください。項目単位表示、フォーカスアウト検証、修正指示つきエラー文を実装してください。",
        "lp": "LP登録フォームの送信失敗を減らすため、リアルタイム検証と簡潔な修正ガイド文を導入してください。",
        "form": "肯定フィードバックを含むリアルタイム検証と、修正指示型エラー文を実装してください。",
        "mobile": "モバイルフォームでは短いエラー文を項目近接で表示し、最初の阻害項目へフォーカス移動してください。"
      }
    },
    "compareRelationships": [
      "concise-form",
      "readable"
    ]
  },
  {
    "id": "mobile-first",
    "term": {
      "en": "Mobile-first",
      "ja": "モバイル優先"
    },
    "aliases": {
      "en": [
        "mobile optimized",
        "phone-first",
        "small-screen first"
      ],
      "ja": [
        "スマホ優先",
        "モバイル最適化",
        "スマホで使いやすく"
      ]
    },
    "searchPhrases": {
      "en": [
        "desktop looks fine but mobile breaks",
        "too hard to tap on phone",
        "mobile bounce is high"
      ],
      "ja": [
        "PCは良いがスマホで崩れる",
        "スマホで押しにくい",
        "モバイル離脱が高い"
      ]
    },
    "category": {
      "en": "Mobile & responsive",
      "ja": "モバイル/レスポンシブ"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Responsive UX",
      "ja": "レスポンシブ改善"
    },
    "beginner": {
      "en": "Designs core flow for small screens first, then scales up to desktop.",
      "ja": "先に小画面で主要導線を成立させ、後からPCへ拡張する考え方です。"
    },
    "practicalIntent": {
      "en": "Prioritize thumb-friendly actions, short blocks, and vertical task flow.",
      "ja": "親指操作しやすい導線、短い情報ブロック、縦方向タスクフローを優先する。"
    },
    "practicalUseCase": {
      "en": "Use when mobile traffic is high and completion is lower than desktop.",
      "ja": "モバイル流入が多く、完了率がPCより低い場合に有効です。"
    },
    "plainExplanation": {
      "en": "Mobile-first prevents desktop assumptions from breaking real-world phone usage.",
      "ja": "モバイル優先は、PC前提設計によるスマホ破綻を防ぎます。"
    },
    "commonMisuse": {
      "en": "Only shrinking desktop UI without rethinking interaction flow.",
      "ja": "PC UIを縮小するだけで操作設計を見直さないこと。"
    },
    "vagueToPractical": {
      "en": [
        "Design key task in one-column flow",
        "Increase tap targets to mobile-safe size",
        "Reduce simultaneous choices per screen",
        "Keep key CTA reachable without precision taps"
      ],
      "ja": [
        "主要タスクを1カラムで設計",
        "タップ領域をモバイル安全サイズへ",
        "1画面の同時選択肢を減らす",
        "精密操作不要で主CTAに到達できるようにする"
      ]
    },
    "badRequest": {
      "en": "Make this mobile friendly.",
      "ja": "スマホ対応して。"
    },
    "betterRequest": {
      "en": "Rebuild this flow mobile-first: one-column task sequence, thumb-friendly tap targets, and fewer competing actions per screen.",
      "ja": "この導線をモバイル優先で再構成してください。1カラムのタスク順序、親指で押しやすいタップ領域、1画面あたりの選択肢削減を行ってください。"
    },
    "badBetterWhy": {
      "en": "The better request defines interaction constraints unique to mobile, improving practical output quality.",
      "ja": "良い依頼はモバイル特有の操作制約を定義し、実運用で使える出力になります。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Redesign this flow mobile-first with one-column priority and thumb-friendly interactions.",
        "lp": "Optimize this LP for mobile-first scanning: shorter sections, clearer headings, and immediate CTA visibility.",
        "form": "Make this form mobile-first with larger tap targets, fewer fields per screen, and clear progress flow.",
        "mobile": "Audit this screen for mobile-first UX and rewrite layout for thumb-zone-friendly completion."
      },
      "ja": {
        "ui": "この導線をモバイル優先で再設計してください。1カラム優先と親指操作性を重視してください。",
        "lp": "このLPをモバイル優先で最適化してください。セクション短縮、見出し明確化、CTA即視認を行ってください。",
        "form": "このフォームをモバイル優先化してください。タップ領域拡大、1画面項目数削減、進行導線明確化を行ってください。",
        "mobile": "この画面をモバイル優先UXで監査し、親指操作しやすい完了導線へ再構成してください。"
      }
    },
    "compareRelationships": [
      "responsive",
      "concise-form"
    ]
  },
  {
    "id": "responsive",
    "term": {
      "en": "Responsive clarity",
      "ja": "レスポンシブ整合"
    },
    "aliases": {
      "en": [
        "breakpoint consistency",
        "cross-device consistency",
        "layout breaks on tablet"
      ],
      "ja": [
        "画面幅ごとの整合",
        "タブレットで崩れる",
        "デバイス差分を減らす"
      ]
    },
    "searchPhrases": {
      "en": [
        "layout breaks at tablet size",
        "desktop and mobile feel like different products",
        "components jump between breakpoints"
      ],
      "ja": [
        "タブレット幅で崩れる",
        "PCとスマホで別物に見える",
        "ブレークポイントで要素が飛ぶ"
      ]
    },
    "category": {
      "en": "Mobile & responsive",
      "ja": "モバイル/レスポンシブ"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Responsive UX",
      "ja": "レスポンシブ改善"
    },
    "beginner": {
      "en": "Ensures structure, hierarchy, and interaction stay coherent across breakpoints.",
      "ja": "ブレークポイントをまたいでも構造・階層・操作を一貫させる語です。"
    },
    "practicalIntent": {
      "en": "Define breakpoint behavior per component and preserve information priority order.",
      "ja": "要素ごとのブレークポイント挙動を定義し、情報優先順位を維持する。"
    },
    "practicalUseCase": {
      "en": "Useful when tablet or landscape views suffer from layout instability.",
      "ja": "タブレットや横向き表示で崩れが出る場合に有効です。"
    },
    "plainExplanation": {
      "en": "Responsive clarity means users should not relearn the interface on each screen size.",
      "ja": "レスポンシブ整合は、画面幅が変わっても再学習不要な設計です。"
    },
    "commonMisuse": {
      "en": "Only adding media queries without content-priority rules.",
      "ja": "メディアクエリ追加だけで情報優先度を定義しないこと。"
    },
    "vagueToPractical": {
      "en": [
        "Map component behavior by breakpoint",
        "Preserve CTA position logic across devices",
        "Test tablet and landscape layouts explicitly",
        "Avoid abrupt typography jumps"
      ],
      "ja": [
        "要素単位でブレークポイント挙動を設計",
        "デバイス間でCTA配置ロジックを維持",
        "タブレット/横向きを明示テスト",
        "タイポサイズの急変を避ける"
      ]
    },
    "badRequest": {
      "en": "Fix responsive issues.",
      "ja": "レスポンシブを直して。"
    },
    "betterRequest": {
      "en": "Stabilize responsive behavior by defining component rules per breakpoint, preserving CTA priority, and validating tablet/landscape layouts.",
      "ja": "ブレークポイントごとの要素ルールを定義し、CTA優先順位を維持しつつ、タブレット/横向き表示を検証してレスポンシブ崩れを改善してください。"
    },
    "badBetterWhy": {
      "en": "The better request clarifies where to test and what must stay consistent across devices.",
      "ja": "良い依頼は検証対象と維持すべき整合条件を明確にします。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Fix responsive clarity by defining component behavior at each breakpoint and preserving hierarchy.",
        "lp": "Normalize this LP across breakpoints so messaging order and CTA priority remain consistent.",
        "form": "Ensure this form stays coherent on tablet/mobile with stable grouping and CTA placement.",
        "mobile": "Audit responsive behavior on phone/tablet landscape and correct component jumps."
      },
      "ja": {
        "ui": "ブレークポイントごとの要素挙動を定義し、階層整合を保ってレスポンシブを改善してください。",
        "lp": "このLPを画面幅ごとに正規化し、訴求順序とCTA優先度を一貫させてください。",
        "form": "このフォームがタブレット/モバイルでもグルーピングとCTA位置を維持できるよう調整してください。",
        "mobile": "スマホ/タブレット横向きの崩れを監査し、要素ジャンプを修正してください。"
      }
    },
    "compareRelationships": [
      "mobile-first",
      "visual-hierarchy"
    ]
  },
  {
    "id": "tone-consistent",
    "term": {
      "en": "Tone-consistent",
      "ja": "トーン一貫"
    },
    "aliases": {
      "en": [
        "voice consistency",
        "same brand voice",
        "unified tone"
      ],
      "ja": [
        "文体を揃える",
        "トーン統一",
        "ブランドらしい話し方"
      ]
    },
    "searchPhrases": {
      "en": [
        "copy feels inconsistent across pages",
        "voice and tone mismatch",
        "brand voice drift"
      ],
      "ja": [
        "画面ごとに言い回しが違う",
        "トーンがちぐはぐ",
        "ブランド文体がぶれている"
      ]
    },
    "category": {
      "en": "Style goal",
      "ja": "雰囲気語"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Messaging quality",
      "ja": "文言品質"
    },
    "beginner": {
      "en": "Keeps wording style, confidence level, and sentence rhythm aligned across screens.",
      "ja": "画面やセクションをまたいで、語調・断定度・文のリズムを揃える語です。"
    },
    "practicalIntent": {
      "en": "Define voice rules and normalize CTA, helper text, and error wording under one style guide.",
      "ja": "ボイスルールを定義し、CTA・補助文・エラー文を同じ文体規則で統一する。"
    },
    "practicalUseCase": {
      "en": "Useful when product pages, forms, and emails feel disconnected in tone.",
      "ja": "LP・フォーム・通知文が別人格に見える時の統一に有効です。"
    },
    "plainExplanation": {
      "en": "Tone consistency builds trust because the product feels managed, not stitched together.",
      "ja": "トーン一貫は「継ぎはぎ感」を消し、運用が行き届いた印象を作ります。"
    },
    "commonMisuse": {
      "en": "Forcing identical wording everywhere and losing context sensitivity.",
      "ja": "文脈差を無視して全画面を同一文にしてしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Choose one voice spectrum (friendly ↔ formal)",
        "Define CTA verb style (start/manage/continue)",
        "Standardize helper-text length and politeness",
        "Review error messages for same tone level"
      ],
      "ja": [
        "声色の軸を1つ決める（親しみ↔フォーマル）",
        "CTAの動詞スタイルを統一する",
        "補助文の長さと丁寧度を揃える",
        "エラーメッセージの温度感を揃える"
      ]
    },
    "badRequest": {
      "en": "Make the copy feel more consistent.",
      "ja": "文言をもっと統一して。"
    },
    "betterRequest": {
      "en": "Normalize tone across this flow: unify CTA verb style, helper-text politeness, and error message confidence level.",
      "ja": "この導線のトーンを統一してください。CTA動詞、補助文の丁寧度、エラーメッセージの断定度を同じ基準に揃えてください。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Unify this UI tone with one clear brand voice and consistent CTA verbs.",
        "lp": "Rewrite this LP in one coherent tone: same confidence level and sentence rhythm.",
        "form": "Standardize form labels, helper text, and errors into one consistent tone.",
        "mobile": "On mobile, keep copy short but tone-consistent across all states."
      },
      "ja": {
        "ui": "このUIの文体を統一し、ブランドらしい声色とCTA動詞を揃えてください。",
        "lp": "このLPを同じ温度感のトーンで再文言化し、断定度と文リズムを一致させてください。",
        "form": "フォームのラベル・補助文・エラー文を同一トーンで統一してください。",
        "mobile": "モバイルでは短文にしつつ、全状態でトーン一貫を保ってください。"
      }
    },
    "compareRelationships": [
      "clear-cta",
      "plain-language",
      "trust-signals"
    ],
    "badBetterWhy": {
      "en": "The better request points to controllable tone components, so revisions become reviewable.",
      "ja": "良い依頼は統一対象を部品化しているため、レビュー可能な修正になります。"
    },
    "compareGuides": {
      "plain-language": {
        "en": {
          "difference": "Tone-consistent controls voice alignment; Plain language controls comprehension simplicity.",
          "whenToUse": "Use tone-consistent for brand coherence, plain language for understanding speed.",
          "practicality": "Combining both usually improves trust and completion rates."
        },
        "ja": {
          "difference": "トーン一貫は文体整合、プレーン言語は理解容易性の語です。",
          "whenToUse": "ブランド統一ならトーン一貫、理解速度改善ならプレーン言語を使います。",
          "practicality": "両方を併用すると信頼感と完了率が上がりやすいです。"
        }
      }
    }
  },
  {
    "id": "trust-signals",
    "term": {
      "en": "Trust signals",
      "ja": "信頼シグナル"
    },
    "aliases": {
      "en": [
        "credibility cues",
        "reassurance elements",
        "proof and safety cues"
      ],
      "ja": [
        "安心材料",
        "信頼要素",
        "根拠表示"
      ]
    },
    "searchPhrases": {
      "en": [
        "users hesitate before submitting",
        "page feels suspicious",
        "need more credibility"
      ],
      "ja": [
        "送信前に不安で止まる",
        "ページが怪しく見える",
        "信頼感を上げたい"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/コンバージョン"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Conversion optimization",
      "ja": "CV改善"
    },
    "beginner": {
      "en": "Adds proof, safety, and expectation-setting near decisions.",
      "ja": "意思決定直前で、根拠・安全性・期待値を示して不安を下げる語です。"
    },
    "practicalIntent": {
      "en": "Place testimonials, security notes, and policy reassurance next to high-friction CTAs.",
      "ja": "高摩擦CTA周辺に実績・安全性・ポリシー安心文を配置する。"
    },
    "practicalUseCase": {
      "en": "Use for signup, payment, and consultation forms with trust drop-offs.",
      "ja": "登録・決済・相談フォームでの不安離脱対策に有効です。"
    },
    "plainExplanation": {
      "en": "Trust signals answer “Is this safe and worth it?” before the click.",
      "ja": "信頼シグナルはクリック前の「安全か・価値があるか」を解消します。"
    },
    "commonMisuse": {
      "en": "Dumping generic badges without context or relevance.",
      "ja": "関連性のないバッジを並べるだけで根拠説明をしないこと。"
    },
    "vagueToPractical": {
      "en": [
        "Add concrete social proof near CTA",
        "State security/privacy handling in plain words",
        "Show response time or support availability",
        "Link refund/cancellation policy where hesitation occurs"
      ],
      "ja": [
        "CTA付近に具体的な実績根拠を置く",
        "セキュリティ・個人情報の扱いを平易に明示",
        "返信時間やサポート可用性を表示",
        "迷う箇所に返金/解約ポリシー導線を置く"
      ]
    },
    "badRequest": {
      "en": "Make users trust this page more.",
      "ja": "もっと信頼されるページにして。"
    },
    "betterRequest": {
      "en": "Increase conversion trust by placing concrete proof, privacy reassurance, and support-response expectations next to the primary CTA.",
      "ja": "主CTA周辺に具体的実績、個人情報の安心説明、サポート応答目安を配置して信頼CVを高めてください。"
    },
    "badBetterWhy": {
      "en": "The better request turns trust into explicit reassurance components that can be tested.",
      "ja": "良い依頼は信頼を検証可能な安心要素へ分解しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Add trust signals to this UI: concrete proof, privacy reassurance, and support expectations near key actions.",
        "lp": "Strengthen LP trust with proof blocks, realistic claims, and policy reassurance near CTA.",
        "form": "Reduce form anxiety by adding why-we-ask explanations and data handling reassurance.",
        "mobile": "On mobile, keep trust cues concise and directly adjacent to the submit CTA."
      },
      "ja": {
        "ui": "このUIに信頼シグナルを追加してください。主要操作の近くに実績根拠・安心説明・サポート目安を置いてください。",
        "lp": "このLPの信頼感を強化してください。根拠ブロックとポリシー安心文をCTA付近に配置してください。",
        "form": "フォーム不安を下げるため、取得理由とデータ取扱い説明を追加してください。",
        "mobile": "モバイルでは信頼要素を短文化し、送信CTA直近に配置してください。"
      }
    },
    "compareRelationships": [
      "conversion-focused",
      "clear-cta",
      "premium"
    ],
    "compareGuides": {}
  },
  {
    "id": "plain-language",
    "term": {
      "en": "Plain language",
      "ja": "プレーン言語"
    },
    "aliases": {
      "en": [
        "simple wording",
        "easy language",
        "no jargon"
      ],
      "ja": [
        "やさしい言葉",
        "専門用語を減らす",
        "平易な説明"
      ]
    },
    "searchPhrases": {
      "en": [
        "copy is too technical",
        "users do not understand terms",
        "too much jargon"
      ],
      "ja": [
        "専門用語が多すぎる",
        "説明が難しい",
        "一般ユーザーに伝わらない"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Copy clarity",
      "ja": "文言改善"
    },
    "beginner": {
      "en": "Rewrites complex wording into direct, user-centered language.",
      "ja": "難しい表現を、利用者視点の平易な言葉へ置き換える語です。"
    },
    "practicalIntent": {
      "en": "Reduce interpretation effort by replacing jargon with concrete actions and outcomes.",
      "ja": "専門語を具体行動と結果表現へ置換し、解釈コストを下げる。"
    },
    "practicalUseCase": {
      "en": "Useful for onboarding, pricing, and policy explanations.",
      "ja": "オンボーディング、料金説明、規約案内の理解改善に有効です。"
    },
    "plainExplanation": {
      "en": "Plain language is not childish; it is precise wording with less ambiguity.",
      "ja": "プレーン言語は幼稚化ではなく、曖昧さを減らす精密な平易化です。"
    },
    "commonMisuse": {
      "en": "Over-shortening and deleting necessary conditions or risks.",
      "ja": "短文化しすぎて条件や注意点を削除すること。"
    },
    "vagueToPractical": {
      "en": [
        "Replace jargon with user task words",
        "Prefer active verbs over abstract nouns",
        "Split long legal-like sentences",
        "Explain required terms with quick examples"
      ],
      "ja": [
        "専門語をユーザー行動語に変える",
        "抽象名詞より動詞中心にする",
        "法律調の長文を分割する",
        "必須用語は短い具体例で補足する"
      ]
    },
    "badRequest": {
      "en": "Use simpler words.",
      "ja": "もっと簡単な言葉で。"
    },
    "betterRequest": {
      "en": "Rewrite this section in plain language: remove jargon, use action-first verbs, and keep required conditions explicit.",
      "ja": "このセクションをプレーン言語で書き直してください。専門語を減らし、行動中心の動詞にし、必要条件は明示してください。"
    },
    "badBetterWhy": {
      "en": "The better request protects accuracy while improving comprehension.",
      "ja": "良い依頼は正確性を維持したまま理解しやすさを上げます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Rewrite this UI copy in plain language with action-first phrasing and zero jargon.",
        "lp": "Simplify this LP copy so first-time visitors understand value in one pass.",
        "form": "Use plain language for labels and helper text so users can complete fields without guessing.",
        "mobile": "For mobile, keep plain-language copy short, concrete, and immediately actionable."
      },
      "ja": {
        "ui": "このUI文言をプレーン言語で再文言化し、専門語を避けて行動中心にしてください。",
        "lp": "このLP文言を初見で理解できる平易表現へ書き換えてください。",
        "form": "フォームのラベルと補助文を平易化し、迷わず入力できるようにしてください。",
        "mobile": "モバイルでは短く具体的なプレーン言語にしてください。"
      }
    },
    "compareRelationships": [
      "readable",
      "scannable",
      "tone-consistent"
    ],
    "compareGuides": {}
  },
  {
    "id": "progressive-disclosure",
    "term": {
      "en": "Progressive disclosure",
      "ja": "段階的開示"
    },
    "aliases": {
      "en": [
        "show details later",
        "step-by-step reveal",
        "hide advanced options"
      ],
      "ja": [
        "必要時だけ表示",
        "段階表示",
        "詳細は後出し"
      ]
    },
    "searchPhrases": {
      "en": [
        "screen feels overwhelming",
        "too many options at once",
        "users freeze at first view"
      ],
      "ja": [
        "最初の画面が情報過多",
        "選択肢が多すぎる",
        "見た瞬間に迷う"
      ]
    },
    "category": {
      "en": "Layout & spacing",
      "ja": "レイアウト/余白"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Complex UI simplification",
      "ja": "複雑UI整理"
    },
    "beginner": {
      "en": "Shows only what is needed now, then reveals more when relevant.",
      "ja": "今必要な情報だけ先に見せ、必要時に詳細を開示する設計語です。"
    },
    "practicalIntent": {
      "en": "Lower initial cognitive load while keeping advanced controls accessible.",
      "ja": "初期認知負荷を下げつつ、上級操作は失わない。"
    },
    "practicalUseCase": {
      "en": "Best for settings, checkout options, and advanced filters.",
      "ja": "設定画面、決済オプション、高度フィルタに有効です。"
    },
    "plainExplanation": {
      "en": "Progressive disclosure improves momentum by reducing first-step complexity.",
      "ja": "段階的開示は最初の判断量を減らし、進行モメンタムを作ります。"
    },
    "commonMisuse": {
      "en": "Hiding critical information that users need to decide safely.",
      "ja": "意思決定に必須の情報まで隠してしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Show primary path first",
        "Collapse advanced controls under clear labels",
        "Reveal dependent fields only after trigger choices",
        "Keep summary of hidden defaults visible"
      ],
      "ja": [
        "主要導線を先に表示",
        "詳細設定を明示ラベルで折りたたむ",
        "選択に応じて関連項目だけ開示",
        "隠れている初期値は要約表示する"
      ]
    },
    "badRequest": {
      "en": "Make this less overwhelming.",
      "ja": "ごちゃつきを減らして。"
    },
    "betterRequest": {
      "en": "Apply progressive disclosure: surface the primary path first, collapse advanced options, and reveal dependent fields only after user choices.",
      "ja": "段階的開示を適用してください。主要導線を先に見せ、詳細オプションを畳み、依存項目は選択後にのみ表示してください。"
    },
    "badBetterWhy": {
      "en": "The better request defines reveal logic, not just visual simplification.",
      "ja": "良い依頼は見た目ではなく開示ロジックを指定しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Use progressive disclosure so default users see a simple path while advanced controls remain available.",
        "lp": "On this LP flow, reveal deeper details after initial intent actions.",
        "form": "Reduce form overwhelm with stepwise field reveal and dependency-based sections.",
        "mobile": "On mobile, show only essential controls first and expand details on demand."
      },
      "ja": {
        "ui": "段階的開示で、通常ユーザーには簡潔導線を先に見せ、詳細操作は残してください。",
        "lp": "このLP導線では、初回アクション後に詳細情報を順次開示してください。",
        "form": "フォームを段階表示にして、依存項目を選択後に開示してください。",
        "mobile": "モバイルでは必須操作を先に表示し、詳細は必要時のみ展開してください。"
      }
    },
    "compareRelationships": [
      "scannable",
      "cognitive-load",
      "concise-form"
    ],
    "compareGuides": {}
  },
  {
    "id": "cognitive-load",
    "term": {
      "en": "Cognitive load",
      "ja": "認知負荷"
    },
    "aliases": {
      "en": [
        "mental effort",
        "thinking burden",
        "too much to process"
      ],
      "ja": [
        "頭の負担",
        "考える量が多い",
        "判断負荷"
      ]
    },
    "searchPhrases": {
      "en": [
        "users hesitate too long",
        "decision fatigue in flow",
        "interface feels mentally heavy"
      ],
      "ja": [
        "判断に時間がかかる",
        "選択疲れが起きる",
        "画面が重たく感じる"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Flow optimization",
      "ja": "導線最適化"
    },
    "beginner": {
      "en": "Measures how much users must remember, compare, and decide at each step.",
      "ja": "各ステップで必要な記憶・比較・判断量を最小化する観点です。"
    },
    "practicalIntent": {
      "en": "Reduce simultaneous decisions and make next actions obvious.",
      "ja": "同時判断数を減らし、次の行動を明確にする。"
    },
    "practicalUseCase": {
      "en": "Useful for onboarding and settings flows with drop-offs.",
      "ja": "オンボーディングや設定導線の離脱改善に有効です。"
    },
    "plainExplanation": {
      "en": "Lower cognitive load means users spend energy on goals, not interface decoding.",
      "ja": "認知負荷を下げると、UI解読ではなく目的達成に集中できます。"
    },
    "commonMisuse": {
      "en": "Oversimplifying and hiding useful context users still need.",
      "ja": "簡略化しすぎて必要文脈まで削ること。"
    },
    "vagueToPractical": {
      "en": [
        "Limit choices per step",
        "Keep labels explicit and action-oriented",
        "Use defaults for low-risk decisions",
        "Show progress and next-step expectation"
      ],
      "ja": [
        "1ステップの選択肢数を抑える",
        "ラベルを具体行動語にする",
        "低リスク選択は初期値を用意",
        "進行状況と次ステップを明示"
      ]
    },
    "badRequest": {
      "en": "Make this easier to think through.",
      "ja": "考えやすくして。"
    },
    "betterRequest": {
      "en": "Reduce cognitive load by cutting simultaneous decisions, setting safe defaults, and clarifying next-step labels in each section.",
      "ja": "同時判断数を減らし、安全な初期値を設定し、各セクションの次アクションラベルを明確化して認知負荷を下げてください。"
    },
    "badBetterWhy": {
      "en": "The better request identifies decision mechanics that can be measured and tested.",
      "ja": "良い依頼は判断負荷の発生源を特定して検証可能にします。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Lower cognitive load: fewer choices per step, clearer labels, and obvious next actions.",
        "lp": "Reduce landing-page decision fatigue by clarifying one path per section.",
        "form": "Cut form cognitive load with smart defaults and explicit field instructions.",
        "mobile": "On mobile, minimize mental switching by keeping one clear decision per screen."
      },
      "ja": {
        "ui": "認知負荷を下げてください。ステップごとの選択肢を絞り、次アクションを明確化してください。",
        "lp": "LPの判断疲れを減らすため、各セクションを1導線で明確化してください。",
        "form": "フォーム認知負荷を下げるため、初期値と明確な入力指示を入れてください。",
        "mobile": "モバイルでは1画面1判断を徹底し、思考の切替を減らしてください。"
      }
    },
    "compareRelationships": [
      "readable",
      "progressive-disclosure",
      "visual-hierarchy"
    ],
    "compareGuides": {}
  },
  {
    "id": "heading-rhythm",
    "term": {
      "en": "Heading rhythm",
      "ja": "見出しリズム"
    },
    "aliases": {
      "en": [
        "heading cadence",
        "section title consistency",
        "heading hierarchy rhythm"
      ],
      "ja": [
        "見出し階層のリズム",
        "タイトル粒度を揃える",
        "見出しの流れ"
      ]
    },
    "searchPhrases": {
      "en": [
        "headings feel random",
        "section titles are inconsistent",
        "hard to follow long page"
      ],
      "ja": [
        "見出しがバラバラ",
        "タイトル粒度が不揃い",
        "長いページを追いにくい"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Long-page structure",
      "ja": "長文構成"
    },
    "beginner": {
      "en": "Aligns heading levels and spacing so users can predict section flow.",
      "ja": "見出しレベルと間隔を揃え、読み進め方を予測しやすくする語です。"
    },
    "practicalIntent": {
      "en": "Standardize section/title depth and maintain consistent block pacing.",
      "ja": "見出し深度とブロック間隔を標準化し、読解テンポを安定させる。"
    },
    "practicalUseCase": {
      "en": "Useful for docs, feature pages, and FAQs.",
      "ja": "ドキュメント、機能説明、FAQで効果的です。"
    },
    "plainExplanation": {
      "en": "Good heading rhythm is a navigation system for eyes, not decoration.",
      "ja": "見出しリズムは装飾ではなく視線ナビゲーションです。"
    },
    "commonMisuse": {
      "en": "Using bold text as fake headings without semantic structure.",
      "ja": "構造化せず太字だけで見出し風にすること。"
    },
    "vagueToPractical": {
      "en": [
        "Define H1/H2/H3 purpose rules",
        "Keep consistent spacing above/below headings",
        "Use descriptive headings not vague labels",
        "Limit depth to avoid nesting chaos"
      ],
      "ja": [
        "H1/H2/H3の役割を定義する",
        "見出し上下余白を統一する",
        "抽象語ではなく説明的見出しにする",
        "入れ子深度を抑える"
      ]
    },
    "badRequest": {
      "en": "Fix heading structure.",
      "ja": "見出しを整えて。"
    },
    "betterRequest": {
      "en": "Normalize heading rhythm with clear H1-H3 roles, consistent spacing intervals, and descriptive section titles across the page.",
      "ja": "ページ全体でH1〜H3の役割を定義し、見出し余白間隔と説明的タイトルを統一して見出しリズムを整えてください。"
    },
    "badBetterWhy": {
      "en": "The better request defines hierarchy mechanics, not just visual styling.",
      "ja": "良い依頼は見た目ではなく階層運用ルールを指定しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Improve heading rhythm with consistent hierarchy depth and spacing cadence.",
        "lp": "Rewrite LP section titles with descriptive headings and stable rhythm.",
        "form": "Use heading rhythm to separate form sections and reduce confusion.",
        "mobile": "On mobile, tighten heading rhythm while keeping hierarchy obvious."
      },
      "ja": {
        "ui": "見出し階層と余白間隔を統一し、見出しリズムを改善してください。",
        "lp": "LPの見出しを説明的に書き換え、リズムを安定させてください。",
        "form": "フォームのセクション分割に見出しリズムを使い、迷いを減らしてください。",
        "mobile": "モバイルでは階層が分かる範囲で見出しリズムを簡潔化してください。"
      }
    },
    "compareRelationships": [
      "readable",
      "scannable",
      "visual-hierarchy"
    ],
    "compareGuides": {}
  },
  {
    "id": "whitespace-rhythm",
    "term": {
      "en": "Whitespace rhythm",
      "ja": "余白リズム"
    },
    "aliases": {
      "en": [
        "spacing rhythm",
        "consistent spacing scale",
        "breathing room"
      ],
      "ja": [
        "余白の呼吸感",
        "間隔スケール統一",
        "詰まり感を減らす"
      ]
    },
    "searchPhrases": {
      "en": [
        "layout feels cramped",
        "spacing is inconsistent",
        "content blocks collide"
      ],
      "ja": [
        "画面が窮屈",
        "余白が不揃い",
        "要素が詰まって見える"
      ]
    },
    "category": {
      "en": "Layout & spacing",
      "ja": "レイアウト/余白"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Layout cleanup",
      "ja": "レイアウト整理"
    },
    "beginner": {
      "en": "Uses a spacing scale so visual groups and hierarchy become obvious.",
      "ja": "余白単位を規格化し、グループ境界と階層差を見える化する語です。"
    },
    "practicalIntent": {
      "en": "Standardize spacing increments between related and unrelated elements.",
      "ja": "関連要素内外で間隔差を定義し、余白で意味を伝える。"
    },
    "practicalUseCase": {
      "en": "Useful for dense dashboards, settings pages, and long forms.",
      "ja": "密度の高いダッシュボード、設定画面、長いフォームで有効です。"
    },
    "plainExplanation": {
      "en": "Whitespace rhythm is the invisible structure that makes UI feel organized.",
      "ja": "余白リズムは、UIを整って見せる見えない骨格です。"
    },
    "commonMisuse": {
      "en": "Adding random empty space without hierarchy logic.",
      "ja": "階層意図なく空白だけ増やすこと。"
    },
    "vagueToPractical": {
      "en": [
        "Define 4/8/12/16 spacing scale",
        "Use tighter gaps inside groups, wider gaps between groups",
        "Align card padding and section margins",
        "Audit inconsistent one-off spacing values"
      ],
      "ja": [
        "4/8/12/16など余白スケールを定義",
        "グループ内は狭く、グループ間は広くする",
        "カード内余白とセクション外余白を統一",
        "場当たり的な単発余白値を棚卸しする"
      ]
    },
    "badRequest": {
      "en": "Add more whitespace.",
      "ja": "余白を増やして。"
    },
    "betterRequest": {
      "en": "Apply whitespace rhythm using a fixed spacing scale and clear inside-group vs between-group spacing rules.",
      "ja": "固定余白スケールを導入し、グループ内外の間隔ルールを定義して余白リズムを整えてください。"
    },
    "badBetterWhy": {
      "en": "The better request adds spacing logic, avoiding arbitrary visual drift.",
      "ja": "良い依頼は余白の論理を与え、場当たり調整を防ぎます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Normalize whitespace rhythm with a consistent spacing scale and clear grouping gaps.",
        "lp": "Improve LP readability with wider section rhythm and tighter intra-block spacing.",
        "form": "Tune form spacing rhythm to separate sections while keeping fields visually connected.",
        "mobile": "On mobile, preserve whitespace rhythm with compact but consistent spacing steps."
      },
      "ja": {
        "ui": "余白スケールを統一し、グループ境界が分かる余白リズムにしてください。",
        "lp": "LPはセクション間を広く、ブロック内を適切に詰めて余白リズムを改善してください。",
        "form": "フォームはセクション分離と項目連続性を両立する余白リズムに調整してください。",
        "mobile": "モバイルでは省スペースでも一貫した余白ステップを維持してください。"
      }
    },
    "compareRelationships": [
      "balanced-spacing",
      "modern",
      "visual-balance"
    ],
    "compareGuides": {}
  },
  {
    "id": "cta-clarity",
    "term": {
      "en": "CTA clarity",
      "ja": "CTA明確化"
    },
    "aliases": {
      "en": [
        "clear action label",
        "button clarity",
        "what happens next"
      ],
      "ja": [
        "行動が分かるCTA",
        "ボタン文言明確化",
        "次に何が起きるか明示"
      ]
    },
    "searchPhrases": {
      "en": [
        "button text is vague",
        "users dont know what clicking does",
        "CTA feels risky"
      ],
      "ja": [
        "ボタン文言が曖昧",
        "押した後が分からない",
        "CTAが不安"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/コンバージョン"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "CTA optimization",
      "ja": "CTA改善"
    },
    "beginner": {
      "en": "Makes CTA labels explicit about action and expected outcome.",
      "ja": "CTA文言で操作内容と結果を具体的に示す語です。"
    },
    "practicalIntent": {
      "en": "Replace generic labels with intent + outcome wording.",
      "ja": "汎用ボタン文言を、意図＋結果が分かる表現へ置換する。"
    },
    "practicalUseCase": {
      "en": "Useful for signup, quote, booking, and submit actions.",
      "ja": "登録、見積、予約、送信などの主要アクションで有効です。"
    },
    "plainExplanation": {
      "en": "Clear CTA wording reduces hesitation because users can predict consequences.",
      "ja": "CTAが明確だと結果予測ができ、不安クリックが減ります。"
    },
    "commonMisuse": {
      "en": "Overly long CTA labels that become hard to scan.",
      "ja": "説明を詰め込み過ぎてCTAが読みづらくなること。"
    },
    "vagueToPractical": {
      "en": [
        "Use verb-first CTA labels",
        "State immediate outcome near CTA",
        "Differentiate submit vs save actions clearly",
        "Align CTA text with page promise"
      ],
      "ja": [
        "動詞先頭のCTAにする",
        "CTA近くで直後の結果を説明する",
        "送信と保存を明確に分ける",
        "ページ訴求とCTA文言を一致させる"
      ]
    },
    "badRequest": {
      "en": "Make this button better.",
      "ja": "このボタンを改善して。"
    },
    "betterRequest": {
      "en": "Improve CTA clarity by rewriting button labels with verb + outcome wording and adding a short expectation note next to the primary action.",
      "ja": "CTA明確化のため、ボタン文言を動詞＋結果で書き換え、主アクション横に短い期待値説明を追加してください。"
    },
    "badBetterWhy": {
      "en": "The better request gives text constraints that directly reduce uncertainty.",
      "ja": "良い依頼は不安低減に直結する文言制約を明示します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Rewrite CTAs for clarity: explicit action verbs and predictable outcomes.",
        "lp": "Increase LP CTA clarity with outcome-specific labels and nearby reassurance text.",
        "form": "Clarify form CTAs by separating save/submit intent and adding next-step expectations.",
        "mobile": "On mobile, keep CTA labels short but explicit about what happens after tap."
      },
      "ja": {
        "ui": "CTAを明確化してください。動詞中心で結果が分かる文言にしてください。",
        "lp": "LPのCTA文言を結果明示型にし、近接位置に短い安心説明を追加してください。",
        "form": "フォームCTAの保存/送信意図を分離し、次ステップを明示してください。",
        "mobile": "モバイルでは短くても結果が分かるCTA文言にしてください。"
      }
    },
    "compareRelationships": [
      "clear-cta",
      "cta-priority",
      "conversion-focused"
    ],
    "compareGuides": {}
  },
  {
    "id": "cta-priority",
    "term": {
      "en": "CTA priority",
      "ja": "CTA優先順位"
    },
    "aliases": {
      "en": [
        "primary vs secondary action",
        "action hierarchy",
        "too many CTAs"
      ],
      "ja": [
        "主副CTA整理",
        "CTAの強弱",
        "ボタンが多すぎる"
      ]
    },
    "searchPhrases": {
      "en": [
        "too many buttons compete",
        "users click wrong action",
        "primary CTA gets ignored"
      ],
      "ja": [
        "ボタンが競合している",
        "意図しない操作が多い",
        "主CTAが埋もれる"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/コンバージョン"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Action hierarchy",
      "ja": "導線優先度"
    },
    "beginner": {
      "en": "Defines one primary CTA and controls visual weight of secondary actions.",
      "ja": "主CTAを1つ定義し、副CTAの強さを調整する語です。"
    },
    "practicalIntent": {
      "en": "Reduce action competition by ranking CTAs per section and viewport.",
      "ja": "セクション・画面単位でCTA順位を決め、競合を減らす。"
    },
    "practicalUseCase": {
      "en": "Useful for landing pages and account settings with multiple choices.",
      "ja": "複数選択肢が並ぶLPや設定画面で有効です。"
    },
    "plainExplanation": {
      "en": "Priority means users can tell which action matters most right now.",
      "ja": "優先順位設計は「今押すべき行動」を即時理解させるためのものです。"
    },
    "commonMisuse": {
      "en": "Styling all CTAs as equally prominent “to be safe”.",
      "ja": "念のためで全CTAを同強度にしてしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Define one primary CTA per section",
        "Downgrade secondary actions to text/ghost style",
        "Separate destructive actions visually and spatially",
        "Keep CTA order consistent across breakpoints"
      ],
      "ja": [
        "各セクションで主CTAを1つ定義",
        "副操作はテキスト/ゴースト化する",
        "破壊的操作は視覚・位置で分離",
        "ブレークポイント間でCTA順序を維持する"
      ]
    },
    "badRequest": {
      "en": "Make the CTA stand out more.",
      "ja": "CTAをもっと目立たせて。"
    },
    "betterRequest": {
      "en": "Set CTA priority by keeping one primary action per section, visually downgrading secondary actions, and isolating destructive options.",
      "ja": "CTA優先順位を設定してください。各セクションで主操作を1つに絞り、副操作を弱め、破壊的操作は分離してください。"
    },
    "badBetterWhy": {
      "en": "The better request solves competition, not just color emphasis.",
      "ja": "良い依頼は色強調ではなく競合解消を目的化しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Rebuild CTA hierarchy with one primary action and clearly secondary alternatives.",
        "lp": "Improve conversion by enforcing one dominant CTA per LP section.",
        "form": "Set form action priority: primary submit, secondary save, separated destructive actions.",
        "mobile": "On mobile, avoid CTA crowding and keep one dominant tap target per screen."
      },
      "ja": {
        "ui": "主副CTAの階層を再設計し、主操作を明確化してください。",
        "lp": "LP各セクションで主CTAを1つに絞り、CV導線を強化してください。",
        "form": "フォームの操作優先度を整理し、送信を主操作にしてください。",
        "mobile": "モバイルではCTA密集を避け、1画面1主CTAを徹底してください。"
      }
    },
    "compareRelationships": [
      "clear-cta",
      "conversion-focused",
      "visual-hierarchy"
    ],
    "compareGuides": {}
  },
  {
    "id": "frictionless-checkout",
    "term": {
      "en": "Frictionless checkout",
      "ja": "決済摩擦低減"
    },
    "aliases": {
      "en": [
        "checkout friction",
        "faster purchase flow",
        "payment completion"
      ],
      "ja": [
        "決済離脱対策",
        "購入導線短縮",
        "支払い完了率"
      ]
    },
    "searchPhrases": {
      "en": [
        "users drop during checkout",
        "purchase flow feels long",
        "payment step confusion"
      ],
      "ja": [
        "決済途中で離脱する",
        "購入導線が長い",
        "支払い手順が分かりにくい"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/コンバージョン"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Checkout optimization",
      "ja": "決済最適化"
    },
    "beginner": {
      "en": "Removes checkout blockers like surprise costs, unclear steps, and excessive inputs.",
      "ja": "追加費用の不意打ち、手順不明、入力過多など決済阻害要因を減らす語です。"
    },
    "practicalIntent": {
      "en": "Shorten purchase path and minimize uncertainty at payment decisions.",
      "ja": "購入完了までの手数を減らし、支払い判断の不安を下げる。"
    },
    "practicalUseCase": {
      "en": "Use for ecommerce and subscription checkout flows.",
      "ja": "ECやサブスク申込の決済導線で有効です。"
    },
    "plainExplanation": {
      "en": "Frictionless checkout means fewer surprises and fewer steps to complete payment.",
      "ja": "決済摩擦低減は「驚きの削減」と「手順短縮」の両立です。"
    },
    "commonMisuse": {
      "en": "Hiding important fees in the name of smoothness.",
      "ja": "スムーズさを理由に重要費用を隠すこと。"
    },
    "vagueToPractical": {
      "en": [
        "Show total cost early",
        "Display checkout step count",
        "Support guest checkout when possible",
        "Autofill billing/shipping where safe"
      ],
      "ja": [
        "合計費用を早期表示する",
        "決済ステップ数を明示する",
        "可能ならゲスト購入を許可する",
        "安全範囲で住所入力補完を使う"
      ]
    },
    "badRequest": {
      "en": "Make checkout smoother.",
      "ja": "決済をもっとスムーズにして。"
    },
    "betterRequest": {
      "en": "Reduce checkout friction by showing total cost upfront, cutting redundant fields, and clarifying step progress and payment expectations.",
      "ja": "合計費用の先出し、重複項目削減、ステップ進行と支払い期待値の明示で決済摩擦を下げてください。"
    },
    "badBetterWhy": {
      "en": "The better request pinpoints high-impact friction points in checkout behavior.",
      "ja": "良い依頼は決済離脱に効く阻害点を具体指定しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Optimize checkout flow for fewer steps, clearer totals, and faster completion.",
        "lp": "Strengthen purchase conversion by reducing checkout friction and uncertainty.",
        "form": "Simplify checkout form inputs and clearly explain payment outcomes before submit.",
        "mobile": "On mobile checkout, keep fields minimal and cost summary always visible."
      },
      "ja": {
        "ui": "決済導線を最適化し、手順短縮・合計明示・完了速度向上を実現してください。",
        "lp": "購入CV向上のため、決済摩擦と不安要因を減らしてください。",
        "form": "決済フォーム項目を簡略化し、送信前に支払い結果を明確化してください。",
        "mobile": "モバイル決済は入力最小化し、費用サマリーを常時確認可能にしてください。"
      }
    },
    "compareRelationships": [
      "conversion-focused",
      "concise-form",
      "trust-signals"
    ],
    "compareGuides": {}
  },
  {
    "id": "error-prevention",
    "term": {
      "en": "Error prevention",
      "ja": "入力ミス予防"
    },
    "aliases": {
      "en": [
        "prevent mistakes",
        "preemptive validation",
        "avoid user errors"
      ],
      "ja": [
        "ミスを未然に防ぐ",
        "誤入力防止",
        "先回り検証"
      ]
    },
    "searchPhrases": {
      "en": [
        "users keep making same mistakes",
        "too many correction loops",
        "input rules are unclear"
      ],
      "ja": [
        "同じ入力ミスが多発",
        "修正ループが多い",
        "入力ルールが分かりにくい"
      ]
    },
    "category": {
      "en": "Form & validation",
      "ja": "フォーム/検証"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Form reliability",
      "ja": "フォーム信頼性"
    },
    "beginner": {
      "en": "Designs fields so mistakes are less likely before submission.",
      "ja": "送信後に直させる前に、ミス自体を起こしにくくする設計語です。"
    },
    "practicalIntent": {
      "en": "Use constraints, formatting hints, and defaults to prevent avoidable errors.",
      "ja": "制約・書式ヒント・初期値で回避可能な入力ミスを防ぐ。"
    },
    "practicalUseCase": {
      "en": "Useful for payment, identity, and address-heavy forms.",
      "ja": "決済、本人情報、住所入力フォームで有効です。"
    },
    "plainExplanation": {
      "en": "Best validation catches errors early; best UX prevents them entirely.",
      "ja": "最良の検証は早期発見、最良のUXは未然防止です。"
    },
    "commonMisuse": {
      "en": "Blocking users too aggressively with strict early errors.",
      "ja": "早すぎる厳格エラーで入力体験を阻害すること。"
    },
    "vagueToPractical": {
      "en": [
        "Provide format examples inside fields",
        "Use input masks where appropriate",
        "Preselect common defaults safely",
        "Disable impossible options dynamically"
      ],
      "ja": [
        "入力欄に書式例を表示",
        "必要に応じて入力マスクを使う",
        "一般的な初期値を安全に設定",
        "成立しない選択肢を動的に無効化"
      ]
    },
    "badRequest": {
      "en": "Reduce errors in this form.",
      "ja": "このフォームのエラーを減らして。"
    },
    "betterRequest": {
      "en": "Prevent input errors by adding format examples, safe defaults, and dynamic constraints before users reach submit.",
      "ja": "送信前に書式例・安全な初期値・動的制約を導入し、入力ミスを未然に防いでください。"
    },
    "badBetterWhy": {
      "en": "The better request shifts from after-the-fact correction to preventive design.",
      "ja": "良い依頼は事後修正から予防設計へ焦点を移します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Prevent common user errors with input constraints and proactive guidance.",
        "lp": "For LP forms, reduce mistakes with clear formatting hints and safe defaults.",
        "form": "Implement error-prevention patterns before submit, not only inline error messages.",
        "mobile": "On mobile, use keyboard-specific fields and format hints to prevent mistypes."
      },
      "ja": {
        "ui": "入力制約と先回りガイドでユーザーミスを予防してください。",
        "lp": "LPフォームで書式ヒントと安全初期値を使い、誤入力を減らしてください。",
        "form": "送信後エラーだけでなく、送信前の予防パターンを実装してください。",
        "mobile": "モバイルではキーボード最適化と書式ヒントで誤入力を防いでください。"
      }
    },
    "compareRelationships": [
      "inline-validation",
      "concise-form",
      "helper-text"
    ],
    "compareGuides": {}
  },
  {
    "id": "helper-text",
    "term": {
      "en": "Helper text quality",
      "ja": "補助文品質"
    },
    "aliases": {
      "en": [
        "field guidance copy",
        "microcopy clarity",
        "instruction text"
      ],
      "ja": [
        "入力補助文",
        "マイクロコピー",
        "説明文の分かりやすさ"
      ]
    },
    "searchPhrases": {
      "en": [
        "users dont know what to input",
        "form labels are ambiguous",
        "too many support questions"
      ],
      "ja": [
        "何を入れるか分からない",
        "ラベルが曖昧",
        "問い合わせが増える"
      ]
    },
    "category": {
      "en": "Form & validation",
      "ja": "フォーム/検証"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Form guidance",
      "ja": "入力支援"
    },
    "beginner": {
      "en": "Improves field-level guidance so users can complete input correctly first time.",
      "ja": "項目ごとの補助文を改善し、初回で正しく入力できる状態を作る語です。"
    },
    "practicalIntent": {
      "en": "Write short, context-specific hints and examples near ambiguous fields.",
      "ja": "曖昧項目の近くに、短く具体的な入力ヒントを置く。"
    },
    "practicalUseCase": {
      "en": "Useful for compliance fields, business forms, and B2B onboarding.",
      "ja": "要件が厳しい申込項目やB2B登録で有効です。"
    },
    "plainExplanation": {
      "en": "Good helper text answers “what format, why needed, and what happens next.”",
      "ja": "良い補助文は「形式・理由・次の影響」を短く答えます。"
    },
    "commonMisuse": {
      "en": "Writing long legal paragraphs as helper text.",
      "ja": "補助文に長い規約文を入れてしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Keep helper text under one short sentence",
        "Place examples directly below the field",
        "Explain why sensitive info is requested",
        "Remove redundant generic hints"
      ],
      "ja": [
        "補助文は短文1つを基本にする",
        "具体例を項目直下に置く",
        "機微情報は取得理由を明示する",
        "汎用的で重複するヒントを削る"
      ]
    },
    "badRequest": {
      "en": "Improve helper text.",
      "ja": "補助文を改善して。"
    },
    "betterRequest": {
      "en": "Rewrite helper text to be short and field-specific, with format examples and reason-for-input notes on sensitive fields.",
      "ja": "補助文を短く項目特化で書き直し、書式例を追加し、機微項目には取得理由を明記してください。"
    },
    "badBetterWhy": {
      "en": "The better request defines length, placement, and purpose of helper text.",
      "ja": "良い依頼は補助文の長さ・配置・役割を具体化します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Upgrade microcopy quality with concise, field-specific helper text and examples.",
        "lp": "Improve LP form completion by rewriting helper text around confusing fields.",
        "form": "Rewrite helper text for clarity: format hints, reason notes, and minimal wording.",
        "mobile": "On mobile, keep helper text ultra-short and visible without extra taps."
      },
      "ja": {
        "ui": "マイクロコピー品質を上げ、項目特化の短い補助文と例を追加してください。",
        "lp": "LPフォームの迷いやすい項目の補助文を再文言化し、完了率を上げてください。",
        "form": "補助文を明確化してください。書式ヒント・理由説明・簡潔文を徹底してください。",
        "mobile": "モバイルでは補助文を極短にし、追加タップなしで見えるようにしてください。"
      }
    },
    "compareRelationships": [
      "inline-validation",
      "error-prevention",
      "plain-language"
    ],
    "compareGuides": {}
  },
  {
    "id": "tap-target-safe",
    "term": {
      "en": "Tap-target safety",
      "ja": "タップ領域安全"
    },
    "aliases": {
      "en": [
        "touch target size",
        "tap accuracy",
        "small button issues"
      ],
      "ja": [
        "押しやすいサイズ",
        "タップ精度改善",
        "ボタンが小さい"
      ]
    },
    "searchPhrases": {
      "en": [
        "users miss buttons on mobile",
        "mis-taps are common",
        "small controls cause errors"
      ],
      "ja": [
        "スマホで押し間違いが多い",
        "ボタンが小さすぎる",
        "誤タップが発生する"
      ]
    },
    "category": {
      "en": "Mobile & responsive",
      "ja": "モバイル/レスポンシブ"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Mobile interaction",
      "ja": "モバイル操作性"
    },
    "beginner": {
      "en": "Ensures controls are large and spaced enough for reliable finger taps.",
      "ja": "指で確実に押せるサイズと間隔を確保する語です。"
    },
    "practicalIntent": {
      "en": "Reduce mis-taps by increasing target area and spacing around interactive elements.",
      "ja": "タップ領域拡大と間隔確保で誤操作を減らす。"
    },
    "practicalUseCase": {
      "en": "Useful for nav bars, filters, and dense mobile forms.",
      "ja": "ナビ、フィルタ、密集フォームのモバイル改善に有効です。"
    },
    "plainExplanation": {
      "en": "Tap-target safety protects speed and confidence for thumb interaction.",
      "ja": "タップ領域安全は親指操作の速度と安心感を守ります。"
    },
    "commonMisuse": {
      "en": "Making buttons larger without increasing spacing between them.",
      "ja": "ボタンだけ大きくして隣接間隔を増やさないこと。"
    },
    "vagueToPractical": {
      "en": [
        "Set minimum target size for all controls",
        "Add spacing between adjacent taps",
        "Expand hit area beyond icon glyph",
        "Prioritize high-frequency actions in thumb zone"
      ],
      "ja": [
        "全操作要素に最小タップサイズを設定",
        "隣接ボタン間隔を確保",
        "アイコン外側まで当たり判定を広げる",
        "高頻度操作を親指ゾーンに置く"
      ]
    },
    "badRequest": {
      "en": "Make buttons easier to tap.",
      "ja": "ボタンを押しやすくして。"
    },
    "betterRequest": {
      "en": "Improve tap-target safety by enforcing minimum control size, larger hit areas, and spacing between adjacent mobile actions.",
      "ja": "最小タップサイズ、当たり判定拡張、隣接操作間隔の確保でタップ領域安全性を改善してください。"
    },
    "badBetterWhy": {
      "en": "The better request specifies concrete interaction constraints, not subjective feel.",
      "ja": "良い依頼は主観ではなく操作制約を明示しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Increase mobile tap safety with larger targets, better spacing, and clearer touch hierarchy.",
        "lp": "Audit LP CTA and navigation targets for reliable thumb tapping.",
        "form": "Improve form tap safety for checkboxes, radios, and submit actions.",
        "mobile": "For mobile-first UX, enforce tap-target safety across all interactive controls."
      },
      "ja": {
        "ui": "モバイル操作性向上のため、タップ領域拡大と間隔最適化を行ってください。",
        "lp": "LPのCTAとナビを監査し、親指で確実に押せるサイズにしてください。",
        "form": "フォームのチェック項目と送信操作のタップ安全性を改善してください。",
        "mobile": "全インタラクティブ要素でタップ領域安全基準を適用してください。"
      }
    },
    "compareRelationships": [
      "mobile-first",
      "thumb-zone",
      "responsive"
    ],
    "compareGuides": {}
  },
  {
    "id": "thumb-zone",
    "term": {
      "en": "Thumb-zone alignment",
      "ja": "親指ゾーン配置"
    },
    "aliases": {
      "en": [
        "thumb reachability",
        "reachable controls",
        "one-hand usability"
      ],
      "ja": [
        "親指で届く配置",
        "片手操作しやすい",
        "到達性改善"
      ]
    },
    "searchPhrases": {
      "en": [
        "important actions are too high on screen",
        "hard one-handed use",
        "users stretch awkwardly to tap"
      ],
      "ja": [
        "重要操作が上すぎる",
        "片手操作しにくい",
        "無理な持ち替えが必要"
      ]
    },
    "category": {
      "en": "Mobile & responsive",
      "ja": "モバイル/レスポンシブ"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Mobile ergonomics",
      "ja": "モバイル人間工学"
    },
    "beginner": {
      "en": "Places key actions where thumbs naturally reach on typical devices.",
      "ja": "主要操作を親指が自然に届く領域へ配置する設計語です。"
    },
    "practicalIntent": {
      "en": "Improve one-hand completion by relocating primary actions to reachable areas.",
      "ja": "主操作を到達しやすい領域へ移し、片手完了率を上げる。"
    },
    "practicalUseCase": {
      "en": "Useful for checkout, chat, and frequent-action mobile screens.",
      "ja": "決済、チャット、高頻度操作画面で有効です。"
    },
    "plainExplanation": {
      "en": "If users must stretch or re-grip often, flow friction rises quickly.",
      "ja": "持ち替えや指伸ばしが増えると、導線摩擦は急増します。"
    },
    "commonMisuse": {
      "en": "Moving everything to bottom and causing visual clutter.",
      "ja": "全部を下部へ寄せて混雑を招くこと。"
    },
    "vagueToPractical": {
      "en": [
        "Place primary CTA in lower reachable zone",
        "Keep top area for context, not frequent taps",
        "Use sticky bottom action for key tasks",
        "Test reachability on large-screen phones"
      ],
      "ja": [
        "主CTAを下部到達ゾーンに配置",
        "上部は情報表示中心にする",
        "主要タスクに固定下部アクションを使う",
        "大画面端末で到達性検証を行う"
      ]
    },
    "badRequest": {
      "en": "Make this easier to use with one hand.",
      "ja": "片手で使いやすくして。"
    },
    "betterRequest": {
      "en": "Align the flow to thumb-zone ergonomics by relocating primary actions to reachable lower areas and reducing high-position frequent taps.",
      "ja": "親指ゾーン設計に合わせ、主操作を下部到達域へ移し、高位置の頻繁操作を減らして片手操作性を改善してください。"
    },
    "badBetterWhy": {
      "en": "The better request identifies reachability as a layout constraint with testable impact.",
      "ja": "良い依頼は到達性を検証可能な制約として定義します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Reposition mobile controls for thumb-zone reachability and one-hand completion.",
        "lp": "Place LP mobile CTA in a reachable sticky zone without blocking content.",
        "form": "Move form next actions into thumb-friendly zones and reduce top-tap dependency.",
        "mobile": "Optimize this screen for thumb-zone alignment on large phones."
      },
      "ja": {
        "ui": "親指到達性を基準にモバイル操作配置を再設計してください。",
        "lp": "モバイルLPのCTAを到達しやすい固定領域へ配置しつつ、本文を妨げないでください。",
        "form": "フォームの次アクションを親指ゾーンへ移し、上部依存を減らしてください。",
        "mobile": "大画面スマホで片手完了しやすい親指ゾーン配置へ最適化してください。"
      }
    },
    "compareRelationships": [
      "tap-target-safe",
      "mobile-first",
      "content-priority-mobile"
    ],
    "compareGuides": {}
  },
  {
    "id": "content-priority-mobile",
    "term": {
      "en": "Mobile content priority",
      "ja": "モバイル情報優先順位"
    },
    "aliases": {
      "en": [
        "mobile content order",
        "small-screen priority",
        "what appears first on phone"
      ],
      "ja": [
        "スマホ表示順",
        "小画面優先度",
        "先に見せる情報"
      ]
    },
    "searchPhrases": {
      "en": [
        "important info is buried on mobile",
        "desktop order fails on phone",
        "mobile users miss key points"
      ],
      "ja": [
        "スマホで重要情報が埋もれる",
        "PC順序のままでは伝わらない",
        "要点が見逃される"
      ]
    },
    "category": {
      "en": "Mobile & responsive",
      "ja": "モバイル/レスポンシブ"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Mobile content strategy",
      "ja": "モバイル情報設計"
    },
    "beginner": {
      "en": "Reorders sections so phone users see decision-critical information first.",
      "ja": "スマホで判断に必要な情報を先頭へ再配置する語です。"
    },
    "practicalIntent": {
      "en": "Prioritize value, proof, and action order for vertical scrolling behavior.",
      "ja": "縦スクロール前提で、価値→根拠→行動の順を最適化する。"
    },
    "practicalUseCase": {
      "en": "Useful for LP, pricing pages, and feature comparisons on mobile-heavy traffic.",
      "ja": "モバイル流入が多いLP、料金ページ、比較ページに有効です。"
    },
    "plainExplanation": {
      "en": "Mobile priority is not shrinking content; it is reordering for faster decisions.",
      "ja": "モバイル優先は縮小ではなく、意思決定速度のための並び替えです。"
    },
    "commonMisuse": {
      "en": "Simply hiding sections on mobile without strategic reordering.",
      "ja": "戦略なくモバイルでセクションを削るだけの対応。"
    },
    "vagueToPractical": {
      "en": [
        "Move key value statement above fold",
        "Surface one proof element before long detail",
        "Place primary CTA after value confirmation",
        "Defer deep specs behind expandable sections"
      ],
      "ja": [
        "主要価値提案をファーストビューに置く",
        "長文前に根拠要素を1つ先出しする",
        "価値確認後に主CTAを配置する",
        "詳細仕様は展開セクションへ後置する"
      ]
    },
    "badRequest": {
      "en": "Make this page better on mobile.",
      "ja": "このページをスマホ向けに改善して。"
    },
    "betterRequest": {
      "en": "Reorder mobile content priority so value and proof appear first, then action, while deep details are deferred to expandable sections.",
      "ja": "モバイル情報優先順位を再設計し、価値提案と根拠を先出しし、その後に主アクションを置き、詳細は展開セクションへ後置してください。"
    },
    "badBetterWhy": {
      "en": "The better request defines an explicit mobile decision sequence.",
      "ja": "良い依頼はモバイルでの判断順序を明示します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Prioritize mobile content so users see key value and next action immediately.",
        "lp": "Reorder LP mobile sections for value-proof-CTA sequence.",
        "form": "On mobile forms, show critical instructions first and defer edge-case details.",
        "mobile": "Audit and rewrite this screen with explicit mobile content priority rules."
      },
      "ja": {
        "ui": "モバイルで要点と次アクションが先に見える情報順へ再設計してください。",
        "lp": "LPのモバイル表示順を価値→根拠→CTAへ最適化してください。",
        "form": "モバイルフォームでは重要説明を先出しし、例外詳細は後置してください。",
        "mobile": "この画面をモバイル情報優先ルールに沿って再構成してください。"
      }
    },
    "compareRelationships": [
      "mobile-first",
      "scannable",
      "responsive"
    ],
    "compareGuides": {}
  },
  {
    "id": "breakpoint-flow",
    "term": {
      "en": "Breakpoint flow continuity",
      "ja": "ブレークポイント導線連続性"
    },
    "aliases": {
      "en": [
        "flow continuity across sizes",
        "responsive flow consistency",
        "cross-breakpoint UX"
      ],
      "ja": [
        "画面幅をまたぐ導線整合",
        "レスポンシブ導線連続",
        "ブレークポイント連続性"
      ]
    },
    "searchPhrases": {
      "en": [
        "flow changes too much between desktop and mobile",
        "users relearn at each device size",
        "tablet flow feels broken"
      ],
      "ja": [
        "端末ごとに導線が変わりすぎる",
        "デバイスごとに再学習が必要",
        "タブレット導線が破綻"
      ]
    },
    "category": {
      "en": "Mobile & responsive",
      "ja": "モバイル/レスポンシブ"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Responsive flow design",
      "ja": "レスポンシブ導線設計"
    },
    "beginner": {
      "en": "Keeps task sequence and decision points consistent across screen sizes.",
      "ja": "画面幅が変わってもタスク順序と判断点を連続させる語です。"
    },
    "practicalIntent": {
      "en": "Preserve user mental model while adapting layout per breakpoint.",
      "ja": "レイアウトを変えても、利用者の操作モデルは維持する。"
    },
    "practicalUseCase": {
      "en": "Useful for multi-step flows spanning desktop, tablet, and mobile.",
      "ja": "PC・タブレット・モバイルを横断する多段導線に有効です。"
    },
    "plainExplanation": {
      "en": "Users should recognize the same journey even when component layout shifts.",
      "ja": "構成が変わっても「同じ旅路」と分かることが連続性です。"
    },
    "commonMisuse": {
      "en": "Using unrelated layouts at each breakpoint for visual novelty.",
      "ja": "見た目優先で端末ごとに別導線にしてしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Map step sequence once and apply to all breakpoints",
        "Keep primary CTA placement logic consistent",
        "Maintain stable labels and icon meaning across sizes",
        "Test handoff between tablet portrait and landscape"
      ],
      "ja": [
        "ステップ順序を先に定義し全幅へ適用",
        "主CTA配置ロジックを端末間で維持",
        "ラベルとアイコン意味を幅ごとに変えない",
        "タブレット縦横切替時の導線を検証"
      ]
    },
    "badRequest": {
      "en": "Make responsive flow better.",
      "ja": "レスポンシブ導線を改善して。"
    },
    "betterRequest": {
      "en": "Ensure breakpoint flow continuity by preserving step sequence and CTA logic across desktop, tablet, and mobile layouts.",
      "ja": "PC・タブレット・モバイルでステップ順序とCTAロジックを維持し、ブレークポイント導線連続性を確保してください。"
    },
    "badBetterWhy": {
      "en": "The better request protects user mental model across devices.",
      "ja": "良い依頼はデバイスをまたぐ操作モデルを守ります。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Keep flow continuity across breakpoints while adapting layout details.",
        "lp": "Maintain value-to-CTA journey consistency on desktop, tablet, and mobile.",
        "form": "Preserve form step logic across breakpoints with stable labels and actions.",
        "mobile": "Audit cross-breakpoint flow continuity and fix relearning points."
      },
      "ja": {
        "ui": "レイアウト差があっても導線連続性を保つよう調整してください。",
        "lp": "LPの価値提示からCTAまでの流れを全ブレークポイントで一貫させてください。",
        "form": "フォームのステップ論理を幅ごとに崩さず維持してください。",
        "mobile": "ブレークポイント跨ぎで再学習が起きる箇所を特定し修正してください。"
      }
    },
    "compareRelationships": [
      "responsive",
      "mobile-first"
    ],
    "compareGuides": {}
  },
  {
    "id": "visual-balance",
    "term": {
      "en": "Visual balance",
      "ja": "視覚バランス"
    },
    "aliases": {
      "en": [
        "weight balance",
        "element balance",
        "visual equilibrium"
      ],
      "ja": [
        "要素の重さバランス",
        "見た目の偏り調整",
        "視覚均衡"
      ]
    },
    "searchPhrases": {
      "en": [
        "one side feels too heavy",
        "layout looks unstable",
        "too many heavy elements in one area"
      ],
      "ja": [
        "片側だけ重く見える",
        "画面が不安定に見える",
        "強い要素が偏っている"
      ]
    },
    "category": {
      "en": "Layout & spacing",
      "ja": "レイアウト/余白"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Layout polish",
      "ja": "配置調整"
    },
    "beginner": {
      "en": "Balances visual weight so users are not pulled to the wrong area.",
      "ja": "視覚的な重さの偏りを減らし、視線の暴走を防ぐ語です。"
    },
    "practicalIntent": {
      "en": "Distribute contrast, size, and density to support intended scan flow.",
      "ja": "コントラスト・サイズ・密度を分配し、狙った視線順を維持する。"
    },
    "practicalUseCase": {
      "en": "Useful for hero sections, dashboards, and dense cards.",
      "ja": "ヒーロー領域、ダッシュボード、密集カードで有効です。"
    },
    "plainExplanation": {
      "en": "Balanced layouts feel calm and trustworthy because nothing screams unexpectedly.",
      "ja": "視覚バランスが整うと、不意な強調が減り落ち着いた印象になります。"
    },
    "commonMisuse": {
      "en": "Centering everything equally and losing hierarchy.",
      "ja": "均等配置に寄せすぎて階層を失うこと。"
    },
    "vagueToPractical": {
      "en": [
        "Audit dominant elements per viewport",
        "Counter heavy visual blocks with whitespace or lighter neighbors",
        "Avoid stacking multiple high-contrast modules",
        "Use grid alignment to stabilize rhythm"
      ],
      "ja": [
        "画面ごとの主役要素を棚卸しする",
        "重い要素は余白や軽い要素で釣り合わせる",
        "高コントラスト要素の連続配置を避ける",
        "グリッド整列でリズムを安定させる"
      ]
    },
    "badRequest": {
      "en": "Balance this layout.",
      "ja": "レイアウトのバランスを取って。"
    },
    "betterRequest": {
      "en": "Improve visual balance by reducing clustered heavy elements, redistributing contrast, and using spacing to stabilize scan flow.",
      "ja": "重い要素の偏りを減らし、コントラスト配分と余白調整で視線フローを安定させて視覚バランスを改善してください。"
    },
    "badBetterWhy": {
      "en": "The better request names specific weight controls instead of aesthetic preference.",
      "ja": "良い依頼は好みではなく重み調整要素を指定しています。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Refine visual balance by redistributing heavy elements and stabilizing contrast rhythm.",
        "lp": "Balance hero and proof sections so attention flow feels intentional.",
        "form": "Balance form visual weight so fields, labels, and CTA do not compete.",
        "mobile": "On mobile, keep visual balance with one dominant element per screen."
      },
      "ja": {
        "ui": "重い要素の偏りを減らし、視覚バランスを整えてください。",
        "lp": "ヒーローと根拠セクションの重みを調整し、意図した視線流れを作ってください。",
        "form": "フォームで項目・ラベル・CTAの競合を減らし、視覚バランスを取ってください。",
        "mobile": "モバイルでは1画面1主役を維持し、視覚バランスを保ってください。"
      }
    },
    "compareRelationships": [
      "balanced-spacing",
      "visual-hierarchy",
      "whitespace-rhythm"
    ],
    "compareGuides": {}
  },
  {
    "id": "information-scent",
    "term": {
      "en": "Information scent",
      "ja": "情報の匂い"
    },
    "aliases": {
      "en": [
        "predictive labels",
        "navigation clues",
        "can users predict destination"
      ],
      "ja": [
        "行き先が予測できる文言",
        "ナビの手がかり",
        "情報の匂い"
      ]
    },
    "searchPhrases": {
      "en": [
        "users click wrong links",
        "menu labels are vague",
        "people cannot predict where to find things"
      ],
      "ja": [
        "リンク先が予測できない",
        "メニュー文言が曖昧",
        "どこに情報があるか分からない"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Navigation clarity",
      "ja": "ナビ明確化"
    },
    "beginner": {
      "en": "Improves labels so users can predict destination before clicking.",
      "ja": "クリック前に行き先を予測できるラベル設計の語です。"
    },
    "practicalIntent": {
      "en": "Use descriptive labels and preview hints to reduce navigation mistakes.",
      "ja": "説明的ラベルと予告情報で遷移ミスを減らす。"
    },
    "practicalUseCase": {
      "en": "Useful for menu structures, help centers, and settings IA.",
      "ja": "メニュー構造、ヘルプセンター、設定IAで有効です。"
    },
    "plainExplanation": {
      "en": "Strong information scent means users follow the right path faster.",
      "ja": "情報の匂いが強いほど、ユーザーは正しい導線を速く辿れます。"
    },
    "commonMisuse": {
      "en": "Making labels catchy but ambiguous for marketing tone.",
      "ja": "訴求優先で曖昧なラベルにしてしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Rename vague labels with outcome-based wording",
        "Add short sublabels for ambiguous categories",
        "Align menu terms with on-page heading terms",
        "Test first-click success with realistic tasks"
      ],
      "ja": [
        "曖昧ラベルを結果ベース文言へ改名",
        "曖昧カテゴリに短い補足ラベルを追加",
        "メニュー語とページ見出し語を一致させる",
        "実タスクで初回クリック成功率を検証する"
      ]
    },
    "badRequest": {
      "en": "Improve navigation labels.",
      "ja": "ナビのラベルを改善して。"
    },
    "betterRequest": {
      "en": "Strengthen information scent by replacing vague menu labels with outcome-based wording and adding short sublabels where destination is unclear.",
      "ja": "情報の匂いを強化するため、曖昧なメニュー語を結果ベース文言へ置換し、行き先が曖昧な箇所には短い補足ラベルを追加してください。"
    },
    "badBetterWhy": {
      "en": "The better request targets prediction quality, not just wording preference.",
      "ja": "良い依頼は文言の好みではなく予測可能性を改善します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Improve information scent with descriptive labels and clear destination cues.",
        "lp": "Clarify LP internal navigation so users can predict each section outcome.",
        "form": "Use information scent for form step labels so users know what comes next.",
        "mobile": "On mobile menus, increase information scent with concise but predictive labels."
      },
      "ja": {
        "ui": "説明的ラベルと行き先手がかりで情報の匂いを強化してください。",
        "lp": "LP内ナビを予測しやすい文言にし、各セクションの到達価値を明示してください。",
        "form": "フォームステップ名の情報の匂いを上げ、次に何が来るか分かるようにしてください。",
        "mobile": "モバイルメニューで短くても予測可能なラベルにしてください。"
      }
    },
    "compareRelationships": [
      "scannable",
      "plain-language",
      "visual-hierarchy"
    ],
    "compareGuides": {}
  },
  {
    "id": "form-reassurance",
    "term": {
      "en": "Form reassurance",
      "ja": "フォーム安心設計"
    },
    "aliases": {
      "en": [
        "submission reassurance",
        "anxiety-reducing form copy",
        "what happens after submit"
      ],
      "ja": [
        "送信後の安心説明",
        "フォーム不安低減",
        "送信後の流れ説明"
      ]
    },
    "searchPhrases": {
      "en": [
        "users fear submitting forms",
        "people worry about spam",
        "hesitation at final submit"
      ],
      "ja": [
        "送信前に不安が強い",
        "営業連絡が怖い",
        "最終送信で止まる"
      ]
    },
    "category": {
      "en": "Form & validation",
      "ja": "フォーム/検証"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Conversion reassurance",
      "ja": "CV安心化"
    },
    "beginner": {
      "en": "Adds concise reassurance around privacy, response time, and next steps.",
      "ja": "個人情報・返信目安・次の流れを短く示して送信不安を下げる語です。"
    },
    "practicalIntent": {
      "en": "Reduce submit hesitation by clarifying post-submit expectations.",
      "ja": "送信後の期待値を明確にし、最終躊躇を減らす。"
    },
    "practicalUseCase": {
      "en": "Useful for contact, quote, and consultation forms.",
      "ja": "問い合わせ、見積、相談フォームで有効です。"
    },
    "plainExplanation": {
      "en": "Users convert faster when uncertainty after submit is removed.",
      "ja": "送信後の不確実性が減るほど、送信率は上がりやすくなります。"
    },
    "commonMisuse": {
      "en": "Adding reassuring claims without actual operational backing.",
      "ja": "運用根拠のない安心文言を置くこと。"
    },
    "vagueToPractical": {
      "en": [
        "State response SLA near submit",
        "Clarify no-spam/no-pressure policy",
        "Explain exactly what happens after submit",
        "Keep reassurance copy short and credible"
      ],
      "ja": [
        "送信ボタン近くに返信目安を表示",
        "営業連絡方針を明確化する",
        "送信後の流れを具体的に示す",
        "安心文は短く根拠ある表現にする"
      ]
    },
    "badRequest": {
      "en": "Make people less nervous about this form.",
      "ja": "このフォームの不安を減らして。"
    },
    "betterRequest": {
      "en": "Add form reassurance near submit: response-time expectation, contact policy, and a clear post-submit next-step explanation.",
      "ja": "送信ボタン付近に安心情報を追加してください。返信目安、連絡ポリシー、送信後の次ステップを明記してください。"
    },
    "badBetterWhy": {
      "en": "The better request ties reassurance to concrete expectations users can trust.",
      "ja": "良い依頼は安心を具体期待値に落とし込み、信頼可能にします。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Add concise reassurance copy around form submit to reduce anxiety.",
        "lp": "Improve LP form conversion with realistic reassurance near the final CTA.",
        "form": "Clarify what happens after submit and when users will hear back.",
        "mobile": "On mobile forms, keep reassurance visible right above the submit button."
      },
      "ja": {
        "ui": "送信直前の安心文を追加し、フォーム不安を低減してください。",
        "lp": "LPフォームの最終CTA近くに現実的な安心情報を配置してください。",
        "form": "送信後の流れと返信時期を明確化してください。",
        "mobile": "モバイルフォームでは送信ボタン直上に安心説明を表示してください。"
      }
    },
    "compareRelationships": [
      "trust-signals",
      "inline-validation",
      "conversion-focused"
    ],
    "compareGuides": {}
  },
  {
    "id": "semantic-grouping",
    "term": {
      "en": "Semantic grouping",
      "ja": "意味グルーピング"
    },
    "aliases": {
      "en": [
        "logical grouping",
        "related fields together",
        "section grouping"
      ],
      "ja": [
        "意味単位でまとめる",
        "関連項目を近づける",
        "論理グループ化"
      ]
    },
    "searchPhrases": {
      "en": [
        "fields feel randomly ordered",
        "users get lost in long forms",
        "related options are far apart"
      ],
      "ja": [
        "項目順がバラバラ",
        "長いフォームで迷う",
        "関連項目が離れている"
      ]
    },
    "category": {
      "en": "Layout & spacing",
      "ja": "レイアウト/余白"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Information architecture",
      "ja": "情報設計"
    },
    "beginner": {
      "en": "Organizes content by user intent and task meaning, not implementation order.",
      "ja": "実装都合ではなく、ユーザーの意図と意味単位で配置する語です。"
    },
    "practicalIntent": {
      "en": "Cluster related content and label each cluster by decision purpose.",
      "ja": "関連情報をまとまり化し、判断目的でラベル付けする。"
    },
    "practicalUseCase": {
      "en": "Useful for settings pages and multi-section forms.",
      "ja": "設定画面や多セクションフォームで有効です。"
    },
    "plainExplanation": {
      "en": "Good grouping reduces context-switching and improves completion confidence.",
      "ja": "意味グルーピングは文脈切替を減らし、完了確信を高めます。"
    },
    "commonMisuse": {
      "en": "Grouping by backend data model instead of user tasks.",
      "ja": "バックエンド項目順でグループ化してしまうこと。"
    },
    "vagueToPractical": {
      "en": [
        "Map user tasks before arranging sections",
        "Keep related fields visually close",
        "Add section headers that express intent",
        "Order groups by user decision sequence"
      ],
      "ja": [
        "配置前にユーザータスクを整理する",
        "関連項目を視覚的に近接させる",
        "目的が分かるセクション見出しを置く",
        "ユーザー判断順でグループ順序を決める"
      ]
    },
    "badRequest": {
      "en": "Organize this form better.",
      "ja": "このフォームを整理して。"
    },
    "betterRequest": {
      "en": "Apply semantic grouping: cluster related fields by user task, label each group by intent, and reorder groups to match decision flow.",
      "ja": "意味グルーピングを適用してください。関連項目をタスク単位でまとめ、意図見出しを付け、判断順にグループを並べ替えてください。"
    },
    "badBetterWhy": {
      "en": "The better request aligns structure with user mental model rather than visual cleanup only.",
      "ja": "良い依頼は見た目整理ではなく、利用者の思考順へ構造を合わせます。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Reorganize this UI using semantic grouping around user goals.",
        "lp": "Group LP information by decision stage, not internal team structure.",
        "form": "Rebuild form sections with semantic grouping and intent-based headers.",
        "mobile": "On mobile, keep semantic groups compact and sequential."
      },
      "ja": {
        "ui": "ユーザー目的ベースの意味グルーピングでUIを再整理してください。",
        "lp": "LP情報を社内都合ではなく意思決定段階でグループ化してください。",
        "form": "フォームを意味グルーピングで再構成し、意図見出しを付けてください。",
        "mobile": "モバイルでは意味グループを短く連続表示してください。"
      }
    },
    "compareRelationships": [
      "scannable",
      "visual-hierarchy"
    ],
    "compareGuides": {}
  },
  {
    "id": "above-the-fold-focus",
    "term": {
      "en": "Above-the-fold focus",
      "ja": "ファーストビュー焦点"
    },
    "aliases": {
      "en": [
        "hero focus",
        "first-screen priority",
        "top viewport messaging"
      ],
      "ja": [
        "ファーストビュー設計",
        "初画面の焦点",
        "冒頭訴求優先"
      ]
    },
    "searchPhrases": {
      "en": [
        "first screen is cluttered",
        "users dont get value quickly",
        "hero section feels weak"
      ],
      "ja": [
        "初画面が情報過多",
        "価値がすぐ伝わらない",
        "ヒーローが弱い"
      ]
    },
    "category": {
      "en": "CTA & conversion",
      "ja": "CTA/コンバージョン"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "LP optimization",
      "ja": "LP最適化"
    },
    "beginner": {
      "en": "Makes first viewport communicate value, audience, and next action quickly.",
      "ja": "初画面で価値・対象・次行動を素早く伝える語です。"
    },
    "practicalIntent": {
      "en": "Prioritize hero message clarity and keep one dominant CTA above fold.",
      "ja": "ヒーロー訴求の明快化と、ファーストビューでの主CTA一本化を行う。"
    },
    "practicalUseCase": {
      "en": "Useful for acquisition LP and campaign pages.",
      "ja": "集客LPやキャンペーンページで効果的です。"
    },
    "plainExplanation": {
      "en": "If first screen fails, deeper content rarely gets read.",
      "ja": "初画面で伝わらないと、下層コンテンツは読まれにくくなります。"
    },
    "commonMisuse": {
      "en": "Stuffing all proof and features into the hero area.",
      "ja": "ヒーローに要素を詰め込みすぎること。"
    },
    "vagueToPractical": {
      "en": [
        "State value proposition in one sentence",
        "Place one primary CTA in immediate view",
        "Add one proof cue without crowding",
        "Defer details to lower sections"
      ],
      "ja": [
        "価値提案を1文で提示",
        "初画面内に主CTAを1つ置く",
        "根拠要素は1つに絞る",
        "詳細は下部セクションに回す"
      ]
    },
    "badRequest": {
      "en": "Improve the hero section.",
      "ja": "ヒーローを改善して。"
    },
    "betterRequest": {
      "en": "Strengthen above-the-fold focus with a one-line value proposition, one visible primary CTA, and one concise proof cue.",
      "ja": "ファーストビュー焦点を強化してください。1文価値提案、視認可能な主CTA1つ、簡潔な根拠要素1つに絞ってください。"
    },
    "badBetterWhy": {
      "en": "The better request controls first-screen density while preserving conversion essentials.",
      "ja": "良い依頼は初画面の密度を制御しつつCV要件を維持します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Improve first-screen focus with one value message and one dominant action.",
        "lp": "Refactor above-the-fold content for instant value understanding and clear CTA.",
        "form": "For form pages, keep first viewport focused on purpose and immediate start action.",
        "mobile": "On mobile, optimize fold focus with concise value copy and one visible CTA."
      },
      "ja": {
        "ui": "初画面の焦点を改善し、価値メッセージと主アクションを1つに絞ってください。",
        "lp": "ファーストビューを再設計し、価値即理解と明確CTAを実現してください。",
        "form": "フォームページの初画面は目的説明と開始CTAに集中させてください。",
        "mobile": "モバイルのファーストビューは短い価値訴求とCTA1つで構成してください。"
      }
    },
    "compareRelationships": [
      "clear-cta",
      "visual-hierarchy",
      "conversion-focused"
    ],
    "compareGuides": {}
  },
  {
    "id": "empty-state-guidance",
    "term": {
      "en": "Empty-state guidance",
      "ja": "空状態ガイダンス"
    },
    "aliases": {
      "en": [
        "empty state UX",
        "no data guidance",
        "first-use guidance"
      ],
      "ja": [
        "空状態UX",
        "データなし画面ガイド",
        "初回利用案内"
      ]
    },
    "searchPhrases": {
      "en": [
        "blank screens confuse users",
        "no results state is useless",
        "first-time users do nothing"
      ],
      "ja": [
        "空画面で止まる",
        "検索結果なし時の案内が弱い",
        "初回ユーザーが動けない"
      ]
    },
    "category": {
      "en": "Readability",
      "ja": "可読性"
    },
    "termType": {
      "en": "Practical term",
      "ja": "実務語"
    },
    "useCase": {
      "en": "Onboarding UX",
      "ja": "初回導線"
    },
    "beginner": {
      "en": "Designs no-data and no-result states to guide the next meaningful action.",
      "ja": "データなし・結果なし状態で次の行動を明示する語です。"
    },
    "practicalIntent": {
      "en": "Turn dead-end states into actionable, low-friction next steps.",
      "ja": "行き止まり状態を、摩擦の低い次アクションへ変換する。"
    },
    "practicalUseCase": {
      "en": "Useful for dashboards, search pages, and new accounts.",
      "ja": "ダッシュボード、検索画面、新規アカウントで有効です。"
    },
    "plainExplanation": {
      "en": "A good empty state answers “why this is empty” and “what to do now.”",
      "ja": "良い空状態は「なぜ空か」と「今何をするか」を同時に示します。"
    },
    "commonMisuse": {
      "en": "Showing cute illustrations without clear next actions.",
      "ja": "雰囲気イラストだけで行動案内を出さないこと。"
    },
    "vagueToPractical": {
      "en": [
        "Explain the empty condition in one line",
        "Offer one primary next action",
        "Provide optional secondary help link",
        "Use contextual examples to reduce guesswork"
      ],
      "ja": [
        "空状態の理由を1文で示す",
        "主となる次アクションを1つ提示",
        "補助ヘルプ導線を任意で追加",
        "文脈に合う例を示して迷いを減らす"
      ]
    },
    "badRequest": {
      "en": "Make empty states better.",
      "ja": "空状態を改善して。"
    },
    "betterRequest": {
      "en": "Improve empty-state guidance by explaining why no data appears, offering one primary next action, and adding contextual examples.",
      "ja": "空状態ガイダンスを改善してください。データがない理由を示し、主アクションを1つ提示し、文脈例を追加してください。"
    },
    "badBetterWhy": {
      "en": "The better request converts passive states into actionable micro-flows.",
      "ja": "良い依頼は空状態を行動可能なミニ導線へ変換します。"
    },
    "shortPrompt": {
      "en": {
        "ui": "Rewrite empty states with clear cause and one next action.",
        "lp": "For no-result states, provide immediate alternatives and clear recovery paths.",
        "form": "When no options exist, guide users with actionable empty-state instructions.",
        "mobile": "On mobile empty states, keep message short and next action obvious."
      },
      "ja": {
        "ui": "空状態文言を再設計し、理由説明と次アクションを明確化してください。",
        "lp": "結果なし状態では代替導線と回復手段を即提示してください。",
        "form": "選択肢がない状態でも行動可能な案内を表示してください。",
        "mobile": "モバイル空状態では短文で次アクションを明示してください。"
      }
    },
    "compareRelationships": [
      "scannable",
      "plain-language",
      "information-scent"
    ],
    "compareGuides": {}
  }
];
