# ATS Paste Doctor | UI spec (Common Layout v3 aligned)

## 1. Layout order (must)
1) Header: title + subtitle + JP/EN toggle
2) ad-top slot (required)
3) Intro text (NO buttons here)
4) Main tool card
5) Results area (progress + errors + counts/warnings + output + actions + preview)
6) Pro card (Buy / unlocked state)
7) ad-bottom slot
8) Footer (privacy + disclaimers + donate links)

## 2. Main tool card (PC vs Mobile)
### PC (>=769px)
- 2-column grid:
  - Left: Input + Options + Process button
  - Right: Results summary (Counts/Warn) + Output actions + Preview

### Mobile (<=480px)
- Force 1-column
- Buttons stack vertically
- Output actions become full-width

## 3. Key components
### 3.1 Input panel
- Title: Input
- textarea with placeholder examples (must switch with JP/EN)
- Helper microcopy: “Runs locally. Not uploaded.”

### 3.2 Options panel
- Mode segmented control (3 buttons)
- Optional “character limit” numeric input (optional feature; can be kept)
- Process button (primary)
- Small note: “May take up to ~1s” (optional)

### 3.3 Results panel
- Progress bar row (hidden by default)
- Error box (red border; What/How short)
- Counts list (compact)
- Warnings list (compact; show only when >0)
- Output textarea (readonly)
- Actions:
  - Copy (free)
  - Download TXT (free)
  - Reset (mandatory)
- ATS preview:
  - Fixed height = ~2 lines
  - scrollable

### 3.4 Pro card
- State A (locked):
  - Title: “Pro unlock ($2.99 one-time)”
  - Bullet list:
    - Hide ads UI
    - Higher max length
    - PDF export 🔒
    - Templates (3) 🔒
    - History (10) 🔒
  - CTA button “Buy Pro”
  - How-to unlock note: “Return with ?pro=1”
- State B (unlocked):
  - Show “Pro unlocked”
  - Show Pro features panels:
    - PDF export button (enabled)
    - Templates: 3 slots (save/recall)
    - History list (max 10)

## 4. Navigation links
- Place “HowTo / Usage” links:
  - In footer nav OR near header (small, not ad-adjacent)
- HowTo must link back to tool via `../` and to usage if exists.

## 5. SEO elements
- Tool page: title/desc/canonical/OG
- HowTo pages: title contains problem phrase + tool name; canonical points to howto itself.
- FAQPage schema ONLY if actual FAQ exists.
