# BichikuCheck — canonical product and audit specification

- **Slug:** `bichiku-check`
- **Display name (JA):** 防災備蓄チェック
- **Display name (EN):** BichikuCheck — Emergency Supplies for Japan
- **Implementation:** `tools/bichiku-check/`
- **Registry state:** active, registered public tool
- **Category:** disaster preparedness, home stockpile, go bag, emergency products
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

Public canonical URL: https://nicheworks.app/tools/bichiku-check/ . Additional crawlable locale-specific URLs: `/en/`, `/zh-cn/`, `/vi/`. Four independent translated pages use a common data/calculation implementation.

## 2. Purpose

日本の家庭や外国人居住者向けに、専用防災用品だけでなく普段の品や条件付き代用品を検討し、所有品を反映した備蓄不足を確認する。購入を強制せず、重要な不足品のみを任意でAmazon.co.jpで探せるようにする。

## 3. Inputs

Stay-home vs go-bag, adult/child/infant/pet members, 3/7/14-day home plan, power/water/heat outages, dietary restrictions; per-category and per-item quantities, manual targets, expiry dates, and selected deficits. For food requiring preparation water, each named food has its own total water litres and confirmed method, with a separate explicit safe-water confirmation. For assembling toilets, user explicitly confirms component compatibility, installation, sealed storage and disposal.

## 4. Processing behavior

Four steps: scenario → seven purpose-oriented shortage cards → named everyday/dedicated/substitute options → selected shopping items. Forty-four parent categories and eighty-one concrete options. Only verified equivalent quantities are credited; water-prepared foods require package-confirmed whole-stock water and a sufficient stored-water amount if water is unavailable. Other variants or conditional improvisations are not automatically counted. Toilets require complete usable assembly confirmation; sleep insulation and body warmth are distinct.

## 5. Outputs

Water L, staple-portion count, portable toilet use count, floor insulation and warmth, lighting/power, hygiene and evacuation goals. A selected shortlist of missing categories for fixed Amazon Japan search. Client-side printable results, CSV and copy. Product label/safety cautions and links to official guidance. Values are planning estimates and not food-safety, calorie or certified-equivalence scores.

## 6. Error behavior

Invalid/empty numeric inputs normalize to nonnegative bounded defaults. localStorage failure does not prevent tool usage. Expired entries are conservatively excluded from shortage credit. Unconfirmed or inadequately supplied water-prepared foods remain uncounted, including when a legacy global water volume is stored. No invented product price, stock or product-brand validation is shown.

## 7. Privacy/data handling

Personal household details and quantities are processed in browser JS, persisted in `bichiku-check-v1` in same-origin localStorage until reset. No custom personal-data backend. Affiliate URLs are static Japanese search terms + established `nicheworks09-22` tag; household inputs are excluded from outbound analytics/URL. Shared GA4, Cloudflare and AdSense scripts are separate service-level analytics/advertising.

## 8. Responsive contract

Mobile first at 320px, 360px, 375px, 390px, 414px: one stage, stacked card navigation, tap targets ~44px, no nested scrolling or horizontal overflow. At 768px remain within the mobile result layout; at 1280px use a two-column input/result composition. Browser screenshot/smoke CI covers these widths. Physical iPhone/Android tactile QA remains recommended; no claim it was completed.

## 9. Language contract

Japanese default, English, Simplified Chinese and Vietnamese independent locale pages. Shared calculation engine and curated item names. Original Japanese product search terms on Amazon Japan regardless of locale. Hreflang including x-default, canonical per locale. UI disclaimer notes local authorities and product labels override examples; professional native-speaking proofreading is an ongoing quality improvement.

## 10. SEO contract

Self-canonical on all four locale paths; index,follow, og:url and WebApplication structured data; x-default Japanese; all four routes included in the public sitemap and the canonical 90-tool index. No orphaned staging markers. No price/rating schema without sources.

## 11. Advertising contract

NicheWorks existing AdSense client `ca-pub-9879006623791275` loaded in the head. Ad slots are nonfloating. No guessed manual AdSense placement ID or assertion of real ad impressions. Amazon Japan affiliate searches are fixed reviewed queries, rendered on requested concrete item or deficit shopping output, with shared official Associates disclosure before shopping links and `rel=sponsored noopener`.

## 12. Donation/support contract

OFUSE and Ko-fi are both offered with links to https://ofuse.me/nicheworks and https://ko-fi.com/nicheworks . Both are optional and not integrated into safety criteria or readiness scores.

## 13. Help/usage/FAQ contract

The initial screen tells users to enter household scenario, inspect the seven goal gaps, choose owned item quantities, confirm necessary water and use condition for specific foods, and shortlist missing supplies only. Distinctions between emergency dedicated / everyday / improvised categories are explained inline. The full README under the tool directory documents constraints, sources, testing and rollback. No hidden paid account signup or form submission.

## 14. Functional acceptance tests

- Browser flow: setup → 7 result cards → food detail → quantity+method+water input → water result → shopping list → CSV/print/copy.
- Two adults × 7 days yields baseline 42 L, 42 staple portion occasions, 70 toilet uses, subject to individualized adjustment.
- Food requiring safe water is not credited until per-item quantities and verified whole-quantity water allocations fit available supply in a water outage.
- Secondary group shortages are not masked by a completed primary group.
- Toilets and mats are not deemed complete by unverified components / improvised materials.
- Chromium test passes at seven widths and four language routes. Node tests use `node --test tools/bichiku-check/tests/*.test.cjs`.
- Links to Japanese official disaster guidance remain present; no raw household data in Amazon URLs.

## 15. Explicit tool-specific exceptions

BichikuCheck is mobile-oriented; desktop uses a separate two-column result experience rather than a giant card grid. Four independent language URLs instead of a single JA/EN toggle are deliberate to serve residents with different reading languages. Required water and staple portions are general planning units, not a medically or nutritionally complete emergency supply. No manual AdSense slot ID is invented because it is not verified. No background reminder monitoring, product price API or notification infrastructure.


### 2026-11-03 production follow-up

Power-out mode requires explicit confirmation of an off-grid stove, sufficient fuel and a safe location before any heat-dependent food becomes usable; no-heat mode overrides confirmation. This is checked separately from food-specific drinking-water volume. Retail or safety claims are never inferred from merely checking a box. In the shopping step, only the first eight visible missing categories are initially selected, hidden categories are unchecked until chosen, and copy/CSV/print output only user-selected deficits (including any manually added after expanding).
