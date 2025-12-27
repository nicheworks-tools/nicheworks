# ATS Paste Doctor | NicheWorks
Fix formatting issues before pasting into ATS/job application forms.

Free + Pro unlock ($2.99 one-time, USD)

## 0. Must-follow (NicheWorks Common Spec v3)
- Keep AdSense head script (do NOT remove).
- Keep ad-top and ad-bottom DOM slots (ad-top required).
- Do NOT place buttons directly under ad-top.
- Must have progress bar during processing.
- Must have Reset button (mandatory).
- Errors: red bordered box with short What/How; on error, progress bar disappears immediately.
- Placeholder examples in textarea are mandatory.
- Responsive:
  - <=480px: buttons stack, multi-column -> 1 column
  - 481-768px: tablet simplified
  - >=769px: PC layout can be 2-column
- FAQPage schema only if there is an actual FAQ section.
- HowTo pages must follow Common Spec Chapter 11 template.

## 1. Goal
Users paste text (resume summary / cover letter / bullets) and the tool:
- detects common causes of form/ATS paste issues (bullets, weird spaces, invisible chars, mixed newlines)
- outputs a safer version to paste
- provides an "ATS-style 2-line textbox preview" to simulate tiny ATS input fields
No AI writing. No server. Browser-only.

## 2. Files
- /tools/ats-paste-doctor/index.html
- /tools/ats-paste-doctor/style.css
- /tools/ats-paste-doctor/app.js
- /tools/ats-paste-doctor/README.md
- /tools/ats-paste-doctor/usage.html (+ usage-en.html optional)
- /tools/ats-paste-doctor/howto/index.html
- /tools/ats-paste-doctor/howto/en/index.html

## 3. Free features (MVP)
### 3.1 Input
- textarea input
- max length: 30,000 chars (show error if too large)

### 3.2 Modes (segmented)
1) ATS-safe (default)
2) Keep line breaks
3) Clean (remove invisible chars)

### 3.3 Checks (debounced real-time)
Counts:
- total characters
- excluding spaces
- excluding line breaks
- lines
- paragraphs
- bullet lines
- consecutive spaces count

Warnings:
- invisible chars (ZWSP, ZWJ/ZWNJ, BOM)
- NBSP (U+00A0) and other non-standard spaces
- control chars (C0/C1 excluding newline/tab)
- mixed newlines (CRLF + LF)

### 3.4 Output
- readonly output textarea
- Copy output button (clipboard)
- Download .txt button
- ATS 2-line preview box (fixed height ~2 lines, scrollable)

### 3.5 Process UX
- Processing is triggered by user clicking "Process"
- While processing: show progress bar (force small delay so it’s visible)
- After processing: auto-scroll to results on mobile (recommended)

### 3.6 Reset (mandatory)
- Reset clears input, results, progress, errors, preview, and restores defaults.

## 4. Pro unlock ($2.99 one-time)
### 4.1 Pricing
- Price: $2.99 (USD, one-time)
- CTA: Stripe Payment Link (placeholder URL in code)

### 4.2 Unlock mechanism (MVP, no server validation)
- If user returns with `?pro=1`, set localStorage key:
  `nw_pro_ats_paste_doctor = "1"`
- Pro state is stored only on the device/browser.

### 4.3 Pro features
- Hide ads UI (ad-top/ad-bottom) via CSS/JS (DOM remains; script remains)
- Higher max length (e.g., 200,000 chars)
- PDF export (download)
- Template slots: 3 (save/recall)
- History: 10 items (localStorage), with delete/clear

## 5. Content pages (usage / howto)
- usage.html: detailed usage + FAQ (actual FAQ content).
  - If FAQ exists, insert FAQPage schema (JSON-LD) on the same page.
- howto pages:
  - howto/index.html (JP), howto/en/index.html (EN)
  - Must follow Chapter 11 template: Conclusion / Symptoms / Steps / Notes / Links.

## 6. Done criteria
- Works on mobile 360px
- Common Spec v3 rules satisfied
- Free flow works: paste -> output -> copy/download -> preview
- Pro unlock by ?pro=1 works
- Pro features work (PDF/templates/history) when Pro enabled
- usage/howto pages exist and are linked
