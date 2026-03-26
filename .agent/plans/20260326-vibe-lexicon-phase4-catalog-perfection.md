# ExecPlan — Vibe Lexicon phase 4 catalog perfection

## Scope
- `tools/vibe-lexicon/data/terms.js`
- `tools/vibe-lexicon/app.js`
- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`

## Files to touch
- Data quality pass for existing 36 terms only (no additions beyond 36).
- Search ranking and matching hardening without changing approved layout.
- Public-facing copy polish for EN/JA index pages.

## High-level steps
1. Inspect current 36-term dataset and identify weaker fields (search phrases, compare guides, detail clarity, EN/JA parity).
2. Patch term content for weaker terms and strengthen compare guidance (especially weak/noisy pairs).
3. Improve search behavior for real-world vague phrasing while preserving filters/detail/compare/favorites/recent features.
4. Polish index copy in EN/JA to remove placeholder/internal tone.
5. Run regression checks (term count, JS parse, compare cap behavior by code review).
6. Capture QA evidence and summarize improvements.

## Manual verification steps
- Open EN and JA index pages; verify no layout redesign and 36 terms still present.
- Test search with vague/beginner/practical/bad-vs-better wording and confirm useful matches.
- Open detail panel for multiple terms and verify stronger practical guidance.
- Add two terms to compare; confirm compare insights are specific and cap remains 2.
- Confirm favorites/recent/prompt copy still operate.
- Check mobile viewport for detail readability and compare tray usability.
