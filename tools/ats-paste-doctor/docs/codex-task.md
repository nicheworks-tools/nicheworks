# Codex Task: ATS Paste Doctor (Index 설명+FAQ → usage/howto → Pro)

## MUST FOLLOW (NicheWorks Common Spec v3)
- Keep AdSense script in <head>. Do not remove.
- Keep ad-top/ad-bottom DOM slots (ad-top required).
- Do NOT place buttons directly under ad-top.
- Breakpoints: 480px / 768px. <=480px: buttons stack, multi-columns -> 1 column.
- FAQ rules (if present):
  - 2–5 items only
  - place at the bottom of main content, just above internal links block
  - keep 40px+ distance from ads/donate blocks
  - FAQPage JSON-LD is optional/recommended ONLY if FAQ exists
- HowTo page template is fixed (Conclusion / Symptoms / Steps / Notes / Related links).

## Repo context
Tool exists already:
- /tools/ats-paste-doctor/index.html
- /tools/ats-paste-doctor/app.js
- /tools/ats-paste-doctor/style.css (or shared /style.css; edit the one actually used)

Current state:
- JP/EN toggle via data-i18n
- Free core works: process -> output -> copy/txt -> 2-line preview -> reset
- Pro unlock uses shared `/assets/nw-pro.js`, `NWPro.getLocalStatus()`, and the `nicheworks_pro` entitlement

Price: $2.99 one-time (USD). Keep existing CTA text.

---------------------------------------
PR-01 (TOP PRIORITY): index.html explanation + Free/Pro boundary + FAQ + help links
---------------------------------------
Goal: Make index page self-explanatory. User must understand how to use WITHOUT opening usage.

### Required additions to index.html
A) "Quick steps" section (text only, no buttons)
- Place AFTER the intro section (intro is already under ad-top)
- Content: 3 steps (Paste → Pick mode → Click Process → Copy/Download and check preview)
- Must be i18n (JP/EN) using data-i18n keys.

B) "Free vs Pro" tiny section (short bullets)
- Explain Free can: formatting + counts/warnings + Copy/TXT + preview
- Explain Pro adds: hide ads UI + higher limit + (future) templates/history/pdf (can be “coming soon”)
- Keep it short. i18n keys.

C) FAQ section ON index (2–5 items)
- Must be near the bottom of main content (before internal links/help block).
- Keep 40px+ distance from donate and ad slots.
- Use <details><summary>…</summary><div>…</div></details> for lightweight UI.
- i18n keys for each Q/A.

FAQ topics (use these 5, but you may trim to 4 if layout gets heavy):
1) Why do line breaks/bullets break when pasting into ATS?
2) Is my text uploaded or saved?
3) What does “ATS-safe / Keep line breaks / Clean” mean?
4) Why does it show warnings like invisible chars / mixed newlines?
5) How do I unlock Pro ($2.99) and what persists?

D) Internal links / help block (text links)
- Place immediately AFTER FAQ (FAQ is just above this block).
- Links:
  - usage.html (if exists later)
  - howto/index.html (if exists later)
  - NicheWorks Home (already footer has home; ok to add)
- Must NOT look like ads. No big buttons.

E) Optional: FAQPage JSON-LD
- Only if you can do it cleanly.
- If you add it, add ONE static JSON-LD block in <head> (keep short).
- If uncertain, skip in PR-01 (allowed).

### Required changes to app.js
- Add i18n keys for:
  - quick steps title + 3 steps
  - free/pro mini section title + bullets
  - faq title + q/a items
  - help links labels
- Ensure language toggle updates these.

### Required CSS
- Add minimal styles with unique classes:
  - .nw-steps, .nw-freepro, .nw-faq, .nw-help
- Respect spacing rule: FAQ area must be separated 40px from donate/ads.

Acceptance for PR-01:
- No buttons directly under ad-top.
- Index alone explains usage + has FAQ.
- JP/EN works for new sections.
- Mobile 360px OK.

---------------------------------------
PR-02: usage + howto pages (SEO + trust)
---------------------------------------
Create:
1) /tools/ats-paste-doctor/usage.html (JP)
2) /tools/ats-paste-doctor/howto/index.html (JP)
3) /tools/ats-paste-doctor/howto/en/index.html (EN)

Rules:
- HowTo body template fixed:
  1 Conclusion (2–3 lines)
  2 Symptoms (3–6 bullets)
  3 Steps (3 steps)
  4 Notes (short)
  5 Related links (must include ../ and ../usage.html if exists)
- Add meta title/description/canonical for each howto.
- Keep pages lightweight; no hype.

Acceptance:
- Links work:
  - howto -> ../ (tool)
  - howto -> ../usage.html
  - tool -> usage/howto links already exist from PR-01

---------------------------------------
PR-03: Pro feature expansion (after content pages)
---------------------------------------
Optional MVP expansions (only if time):
- Add “locked UI” for future Pro features (PDF/Templates/History) with 🔒 and short note.
- Real implementation can be later. Do NOT break existing Pro unlock.
