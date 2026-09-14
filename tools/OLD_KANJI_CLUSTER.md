# Old Kanji Search Cluster Contract

Status: canonical cluster contract for the current Old Kanji family.

This document supplements each tool's own `SPEC.md`. It defines search intent, handoffs, monetization boundaries, and measurement responsibilities so the eight tools behave as one coherent cluster instead of competing for the same generic `旧字体` query.

## Cluster objective

The user journey is:

`search need -> correct landing tool -> solve the immediate problem for free -> move to the next relevant Old Kanji tool only when needed -> expose Pro only to users with recurring/heavy workflows`

The generic discovery hub is **Old Kanji Reference**. Other pages must target narrower task intent and must not rewrite their title/H1/description to imitate the generic hub.

## Tool roles

| Tool | Primary search intent | Primary query family | Supporting query family | Explicit difference | Related-tool handoffs (2–4) |
| --- | --- | --- | --- | --- | --- |
| Old Kanji Reference | Look up one old/new kanji pair or browse/search the reference | `旧字体 一覧`, `旧字体 検索`, `旧字 検索`, `<漢字> 旧字体`, `<漢字> 旧字` | `旧字体 調べ方`, `昔の漢字 一覧`, readings/Unicode attached to known entries | Generic searchable reference/dictionary. It is **not** the full-text converter and not OCR. | Kanji Modernizer; Old Kanji OCR Scanner; Unicode Kanji Checker; Variant Kanji Compare |
| Kanji Modernizer | Convert pasted text between registered old and modern forms | `旧字体 変換`, `旧字体 変換サイト`, `旧字 新字 変換` | `新字体 旧字体 変換`, `文章 旧字体 変換` | Whole-text character mapping with ambiguity handling. It is **not** the lookup/list page. | Old Kanji Reference; Old Document Kanji Highlighter; Unicode Kanji Checker |
| Old Kanji OCR Scanner | Read a photographed/scanned image and inspect recognized old/variant forms | `旧字体 OCR`, `古文書 OCR 漢字`, `画像 旧字体 読み取り` | `旧漢字 画像 検索`, `旧字体 写真 読み取り` | Image input + browser OCR. It is **not** the text-only highlighter or generic reference. | Old Kanji Reference; Old Document Kanji Highlighter; Kanji Modernizer |
| Old Document Kanji Highlighter | Find registered old forms inside pasted historical text | `古文書 旧字体`, `文章 旧字体 検出`, `旧字体 ハイライト` | `古い文章 漢字 調べる`, `旧字 文章 チェック` | Text detection/highlighting of a document. It is **not** OCR and not general conversion. | Kanji Modernizer; Old Kanji Reference; Old Kanji OCR Scanner |
| Unicode Kanji Checker | Inspect code points/entities/UTF-16 and rendering concerns | `漢字 Unicode`, `旧字体 Unicode`, `異体字 Unicode` | `漢字 コードポイント`, `CJK compatibility ideograph` | Encoding/rendering inspection. It does not decide official/legal glyph validity. | Variant Kanji Compare; Old Kanji Reference; Kanji Modernizer |
| Variant Kanji Compare | Compare visually similar old/variant glyphs side-by-side | `異体字 比較`, `漢字 字形 比較`, `<字> <字> 違い` | `旧字体 異体字 違い`, `髙 高 違い`, `﨑 崎 違い` | Multi-glyph visual/code comparison. It is **not** the generic old/new dictionary. | Unicode Kanji Checker; Old Kanji Reference; Name Old Kanji Checker |
| Place Old Kanji Checker | Check place/address/station text for old/variant candidates | `地名 旧字体`, `住所 旧字体`, `駅名 旧字体` | `古地図 旧字体`, `地名 異体字` | Place/address-focused candidate check with official-use caution. | Old Kanji Reference; Kanji Modernizer; Name Old Kanji Checker |
| Name Old Kanji Checker | Check personal-name text for old/variant candidates | `名前 旧字体`, `人名 旧字体`, `苗字 旧字体` | `氏名 異体字`, `戸籍 旧字体` | Name-focused candidate check with explicit registry/legal caution. | Old Kanji Reference; Variant Kanji Compare; Unicode Kanji Checker |

## Anti-cannibalization rules

1. Only **Old Kanji Reference** targets the broad combination of `旧字体 + 一覧/検索/個別漢字lookup` as its primary intent.
2. Only **Kanji Modernizer** targets full-text `旧字体 変換` as its primary intent.
3. OCR, document highlighting, Unicode, variant comparison, name, and place pages keep their task-specific terms in title/H1/description.
4. Do not add generic keyword paragraphs to every page. Copy must describe actual current functionality.
5. Related links are task handoffs, not SEO link dumps: 2–4 per tool, after the main task/result area or near the footer, never a shared header navigation.

## Old Kanji Reference SEO contract

Old Kanji Reference is the priority organic entry page.

Required SERP message:
- it is a **free** searchable old-kanji reference;
- users can search/browse old and modern forms;
- richer entries can include reading/meaning/Unicode;
- full-text conversion belongs to Kanji Modernizer, not this page.

The page must keep a self-canonical URL and WebApplication structured data. FAQ markup is allowed only for FAQ content that is visibly present and accurately describes current behavior.

CTR work is a separate acceptance target from ranking work. The title/description should optimize clarity of task and free availability before brand language.

## Individual-kanji search demand

Do **not** mass-generate thin pages for every mapping.

An indexable per-kanji URL may be introduced later only when its source record can support standalone value such as:
- modern form;
- old/variant form(s);
- Unicode/code point information;
- reading when verified;
- usage/caution or compatibility note when supported;
- related characters where the bundled data supports the relation;
- direct handoff to the relevant lookup/conversion tool.

If a record only contains a bare pair, it remains inside the searchable Reference UI and must not become an SEO landing page solely to create inventory.

The first candidate wave, if implemented, must be small and evidence-led by actual Search Console demand (for example observed `<漢字> 旧字体` queries), then evaluated before expansion.

## Internal journey contract

Preferred task flow, where relevant:

`one character lookup -> document/text detection -> whole-text conversion -> image OCR -> Unicode/glyph inspection`

A tool does not need to expose every step. It should expose only the 2–4 next actions that logically follow its current task.

Anchor text must state the action, e.g. `文章全体を旧字体変換する`, `画像から旧字体を読み取る`, `Unicodeを確認する`, not generic `関連ツール` links alone.

## Free / Pro boundary

Free must remain genuinely useful and must solve the single/current task.

Current Free capabilities already shipped remain Free unless a separate product decision explicitly changes them. In particular, existing Old Kanji Reference CSV/JSON/Markdown/print actions remain Free under its current SPEC.

Pro is reserved for recurring/heavy workflow value such as:
- batch/multi-file or multi-record processing;
- saved histories and reusable saved sets;
- cross-session workspaces/collections;
- advanced comparison sets;
- batch OCR/crop/report workflows;
- report/audit/export packages beyond current shipped Free exports;
- team/business-oriented repeat workflows if introduced later.

While billing is unavailable, Pro UI must remain clearly disabled/unavailable and must not imply a purchasable feature exists.

## Revenue order

For the Old Kanji cluster, long-term priority is:
1. Pro for repeat/heavy users;
2. AdSense as broad supporting revenue;
3. OFUSE / Ko-fi as voluntary support.

Amazon is **contextual and optional**, not a cluster-wide requirement. Existing Old Kanji Reference dictionary/magnifier/book-stand links and Old Kanji OCR Scanner scanner/magnifier links may remain because they are task-adjacent. Do not add Amazon to the other six tools without a separate relevance case.

## Measurement contract

Evaluation must support, at minimum:
- sessions by tool;
- Organic Search sessions by landing tool;
- GSC impressions, clicks, CTR, and average position by landing page;
- internal Old Kanji tool handoff clicks;
- Pro CTA clicks when a real enabled CTA exists, and optionally disabled-Pro interest clicks only if the UI provides an explicit non-purchase interest control;
- OFUSE / Ko-fi clicks.

Existing GA4/analytics setup must be preserved. Only missing click events should be added in the measurement implementation PR.

Analytics must not send user-entered names, addresses, OCR text, pasted documents, searched kanji strings, image filenames, conversion content, or other tool payloads. Event parameters should be coarse identifiers such as source tool, destination tool, link role, or support provider.

## Evaluation cadence

After SEO/CTR/internal-link changes ship, evaluate settled data rather than same-day data. Compare at least one meaningful settled window against the pre-change baseline before making another title/meta rewrite.

Priority signals:
1. Old Kanji Reference CTR and clicks, especially queries already ranking on page 1–2.
2. Growth in relevant long-tail query impressions/clicks without query cannibalization among tools.
3. Internal handoff usage between the eight tools.
4. Pro/support interest only after the free task is being completed successfully.
