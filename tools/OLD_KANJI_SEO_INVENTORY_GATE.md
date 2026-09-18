# Old Kanji SEO Inventory Final Gate

Status: Completion Wave 18 reviewed inventory gate.

Review date: 2026-09-18

## Decision

The indexable individual-kanji inventory remains exactly **3 pages**:

1. `kanji/ga-kaku/` — 畫 → 画
2. `kanji/sho-shou/` — 將 → 将
3. `kanji/kyu-old/` — 舊 → 旧

**New pages authorized in Completion Wave 18: 0.**

The current dictionary audit contains **168 repository-side SEO candidates**. Those records are data-quality candidates only and are not publication inventory.

## Evidence basis

Each existing page continues to pass the three publication gates that were recorded when it was created:

| Page | Preserved settled-demand evidence | Current dictionary gate | Primary source |
| --- | --- | --- | --- |
| `ga-kaku/` | `計画 旧字体`: 11 impressions in the preserved 180-day GSC extraction; 10 impressions around position 8.9 in the preserved latest-30-day row | 畫 → 画, `old_to_modern`, `seoCandidate: true`, no record issues | Agency for Cultural Affairs 常用漢字表 |
| `sho-shou/` | `将 旧字体`: 1 impression in the preserved 180-day extraction and 1 in the preserved latest-30-day extraction | 將 → 将, `old_to_modern`, `seoCandidate: true`, no record issues | Agency for Cultural Affairs 常用漢字表 |
| `kyu-old/` | `旧 旧字体`: 1 impression in the preserved 180-day extraction | 舊 → 旧, `old_to_modern`, `seoCandidate: true`, no record issues | Agency for Cultural Affairs 常用漢字表 |

Demand evidence above is repository-preserved evidence from the Wave 1–3 ExecPlans. It is not presented as newly queried Search Console data.

## Fresh-demand availability

A fresh Google Search Console read was attempted during Completion Wave 18 through the connected GSC Wizard integration. The integration returned `payment_required` because its trial/subscription is inactive.

Therefore Wave 18 does **not** infer, extrapolate, or fabricate fresh demand. Without a fresh settled-demand read, no additional candidate can pass the demand gate in this wave.

## Current mechanical gate

`scripts/check-old-kanji-seo-inventory-gate.mjs` enforces:

- the filesystem individual-page inventory equals the three-page allowlist;
- the sitemap contains exactly those three individual pages, once each;
- each page is indexable, self-canonical, Article-structured, and retains the Culture Agency primary-source link;
- each page's current dictionary record remains `old_to_modern`, `seoCandidate: true`, and issue-free;
- the original authenticated-GSC demand evidence remains preserved in the Wave 1–3 ExecPlans;
- the cluster still requires both the dictionary/source gate and the demand gate;
- the repository candidate pool cannot be treated as automatic publication inventory.

## Reopen condition

A fourth individual page requires **both**:

1. a current safe dictionary/source record under the canonical publication rules; and
2. newly available settled Search Console demand supporting standalone value.

Until both are available, new indexable individual-kanji inventory remains blocked.
