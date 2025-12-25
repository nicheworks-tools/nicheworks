# ATS Paste Doctor | NicheWorks
Fix formatting issues before pasting into ATS/job application forms.
Free + Pro unlock ($2.99 one-time, USD)

## Goal
Users paste text (job summary / cover letter / bullet points) and the tool:
- detects common causes of form/ATS paste issues (bullets, weird spaces, invisible chars, mixed newlines)
- outputs a safer version to paste
- provides an "ATS-style 2-line textbox preview" to simulate tiny ATS input fields
No AI writing. No server. Browser-only.

## NicheWorks Common Spec v3 (must follow)
- Keep AdSense head script (do NOT remove).
- Keep ad-top and ad-bottom DOM slots (ad-top required). Pro can hide these slots via CSS display:none but script remains.
- Must have progress bar during processing and must have Reset button (mandatory).
- Must have placeholder examples in textarea (mandatory).
- Errors must be red bordered box with short What/How messages; on error, progress bar disappears immediately.
- Do NOT place buttons or progress UI directly under the ad-top slot.
- Do NOT hard-fix container width to 600px; use .nw-main max-width 960px.
- No FAQ schema unless there is an actual FAQ section (we have none for now).

## Pricing / Pro unlock (MVP)
- Price: $2.99 (one-time)
- Use Stripe Payment Link (placeholder URL in code).
- Unlock mechanism (MVP):
  - After purchase, user returns to this page with `?pro=1`
  - Detect `pro=1` and set localStorage key `nw_pro_ats_paste_doctor = "1"`
  - When Pro enabled: hide ad slots in UI (DOM remains), show "Pro unlocked".
- No server-side license validation in MVP.

## Features (Free)
### Input
- textarea input (max 30,000 chars; show error if too large)

### Options
- Output mode (segmented control):
  1) ATS-safe (default)
  2) Keep line breaks
  3) Clean (remove invisible chars)
- Optional character limit input (number; if set, show within/over status)

### Checks (auto, real-time or debounced)
Counts:
- total characters
- excluding spaces
- excluding line breaks
- lines
- paragraphs
- bullet lines
- consecutive spaces count (or flag)

Warnings:
- invisible chars (ZWSP, ZWJ/ZWNJ, BOM)
- NBSP (U+00A0) and other non-standard spaces
- control chars (C0/C1 excluding newline/tab per design)
- mixed newlines (CRLF + LF)
- possible joined words (heuristic warning; optional)

### Output
- readonly output textarea
- Copy output button (clipboard)
- Download .txt button (recommended by common spec)
- 2-line ATS preview box (fixed height ~2 lines, scrollable)
- Reset button (clears everything back to defaults)

### Progress
- When user clicks "Generate output" (or "Process"), show progress bar during processing.
- Use small delay (e.g., requestAnimationFrame + setTimeout(50-150ms)) so progress is visible even though processing is fast.

### i18n
- JP/EN toggle. Default: navigator.language starts with "ja" => JP else EN.
- Use `messages = { ja: {...}, en: {...} }` and data-i18n attributes.
- Placeholder must switch too.

## Pro Features (MVP minimal)
- Hide ads UI (ad-top/ad-bottom)
- Higher max length (e.g., 200,000 chars)
- Saved presets (optional in MVP; if too much, leave as "coming soon" locked UI)

## Layout (must)
Order:
1) Header (tool title + lang toggle)
2) ad-top slot
3) Intro text (no buttons)
4) Main tool card (input + options)
5) Results (progress + errors + output + actions)
6) Pro card (unlock)
7) ad-bottom slot
8) Footer (privacy note + donate placeholders)

## Files to implement
- index.html (static)
- style.css
- app.js
No build tools. No external frameworks.

## Done criteria
- Works on mobile 360px
- All common spec rules satisfied
- Free flow works: paste -> output -> copy/download -> preview
- Pro unlock by ?pro=1 works and hides ads
