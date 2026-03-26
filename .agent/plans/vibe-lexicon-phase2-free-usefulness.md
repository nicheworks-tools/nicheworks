# ExecPlan — Vibe Lexicon phase 2 (free usefulness)

## Scope
- Target: `tools/vibe-lexicon` only
- No changes outside target scope except this plan file

## Files to touch
- `tools/vibe-lexicon/data/terms.js`
- `tools/vibe-lexicon/app.js`
- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`
- `tools/vibe-lexicon/styles.css` (if needed for compare/readability only)

## Steps
1. Audit current dataset/runtime behavior and identify weak points in search, compare, and detail quality.
2. Expand and strengthen seed term catalog with high-value terms and EN/JA parity.
3. Improve search matching logic to include intent/use-case/bad-better phrasing and fuzzy real-world wording.
4. Improve compare tray usefulness with explicit difference and when-to-use guidance while keeping free limit at 2.
5. Polish product-facing copy to remove placeholder/internal tone.
6. Run basic checks and prepare PR summary artifacts/examples.

## Manual verification
- Search with vague/beginner phrases and confirm relevant terms are returned.
- Open at least 10 terms and verify practical fields are natural in EN/JA.
- Compare 5 pairs and verify difference/when-to-use guidance is clear.
- Confirm favorites/recent/copy prompt still work and compare cap remains 2.
