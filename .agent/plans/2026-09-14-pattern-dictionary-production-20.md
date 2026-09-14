# Pattern Dictionary — canonical 20 productionization

## Goal

Raise the canonical 20-pattern Pattern Dictionary slice from prototype-curated to production-ready without expanding the pattern count.

## Fixed scope

Canonical IDs:

- houndstooth
- gingham
- tartan
- glen-check
- argyle
- chevron
- polka-dot
- moroccan-trellis
- seigaiha
- asanoha
- shippo
- ichimatsu
- kikko
- karakusa
- damask
- arabesque
- paisley
- leopard-print
- ikat
- kilim

Pattern Atlas is out of scope.

## Progress — 2026-09-15

- [x] Source verification ledger completed for 20/20. Seventeen terms are source-verified; Moroccan Trellis, Ikat, and Kilim remain explicitly qualified broad/modern categories rather than being overstated as one canonical motif.
- [x] Shared JA/EN production-content overlay completed for 20/20.
- [x] Production Reference Images generated at 1536×1536 PNG for 20/20.
- [x] Structural visual review completed for 20/20; weak Glen Check and Asanoha candidates were regenerated before promotion.
- [x] Image/content review state advanced to `reviewed`, not yet final `verified`.
- [x] Search regression expanded to mandatory Top1, typo tolerance, mixed JA/EN, zero-result, and HIGH/MEDIUM/LOW confidence behavior; runtime and test weighting are aligned.
- [x] Six canonical comparison guides implemented, including Argyle vs generic diamond family as a comparison concept rather than a 21st dictionary entry.
- [x] Browse/mobile contracts added; filters precede the image grid, mobile comparison panels stack, 40 JA/EN detail wrappers remain present and `noindex,follow` pending final verification.
- [x] Amazon commerce flow implemented as disabled-by-default configuration with 20/20 bilingual search queries. No fabricated tracking ID is committed; affiliate disclosure and sponsored search links activate only after a valid tracking ID is configured.
- [ ] Final normal CI / Cloudflare preview QA on the consolidated branch head.
- [ ] Promote eligible records from `reviewed` to final `verified` after final QA.
- [ ] Remove detail-page `noindex` only after final verified publication state.
- [ ] Merge/publish PR #796.

## Required sequence

1. Source-verify identity, JA/EN names, aliases, taxonomy, distinguishing structure, relationships, primary colors, and color role for all 20.
2. Move all 20 to `researched` only after evidence is recorded.
3. Produce production Reference Images at 1536×1536 PNG. Geometric/traditional motifs prefer canonical vector/SVG construction before rasterization; ornamental/organic motifs remain draft until structural review.
4. Complete JA/EN detail copy for all 40 static pages from the verified data model.
5. Expand search regression coverage for Top1, Top3, zero-result, confidence, mixed JA/EN, and visual descriptions.
6. Add Amazon search-link commerce only after the dictionary content, using current affiliate requirements at implementation time.
7. Finalize compare, browse, desktop and mobile UX.
8. Remove detail-page `noindex` only for records that reach verified/published state.
9. Run final browser QA and publish the 20-pattern production version.

## Guardrails

- Do not add the remaining 80 patterns in this PR.
- Do not treat current DEV images as production references.
- Do not promote AI-generated imagery without structural review.
- Do not dynamically recolor the reference image from user search terms.
- Do not hand-maintain 40 divergent detail-page bodies; render from shared verified data.
- Do not publish source-unverified assertions as settled facts.
- Do not place commerce before identification/detail content.
