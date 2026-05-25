# NicheWorks 20 Tools Batch — MASTER (pre-Codex)

## 0) Absolute rules
- Work only under `/tools/{slug}/` and `/tools/_template/` and `/tools/_codex/`.
- Do NOT change other tools or global structure.
- Vanilla JS only. No frameworks. No external libs.
- Smartphone-first. Must work at 360px width.
- JP/EN toggle on same page using `[data-i18n]`.
- Must include AdSense script (client fixed) in `<head>`:
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>`
- Must include `ad-top` (required) and `ad-bottom` (recommended).
- Must include donate links (both): OFUSE + Ko-fi.
- Must include canonical: `https://nicheworks.app/tools/{slug}/`
- Must include JSON-LD `WebApplication`.

## 1) Use template
For each tool:
- Copy `/tools/_template/` files into `/tools/{slug}/`
- Then edit meta/title/canonical/JSON-LD fields and tool UI content inside `#toolRoot`
- Add tool-specific logic at the bottom of `app.js` (keep template i18n + helpers)

## 2) Pro gating (no payment)
- Pro is enabled if `localStorage.getItem("nw_pro_key")` is truthy.
- Use `window.NW.hasPro()` helper if available.
- Free core must remain usable.
- Pro adds: batch, export, packs, comparisons — depending on tool spec.

## 3) Slug list
01 analytics-privacy-kit (free)
02 og-image-maker (pro)
03 lp-skeleton-generator (pro)
04 pages-deploy-guide (pro)
05 notion-form-design-kit (free)
06 form-tool-selector (free)
07 money-template-checker (pro)
08 mini-game-utility (free)
09 design-request-builder (free)
10 ops-weekly-report-generator (free)
11 outsource-spec-generator (pro)
12 niche-job-starter-kit (pro)
13 sponsor-page-builder (free)
14 habit-plan-generator (free)
15 incident-update-generator (pro)
16 newsletter-kit-generator (free)
17 microtool-launch-checklist (free)
18 cold-email-requirement-checker (pro)
19 membership-offer-builder (free)
20 growth-log-template-generator (free)

## 4) Tool specs (MVP)
### 01 Analytics Privacy Kit (Free)
Goal: Generate privacy-policy add-ons + consent/cookie copy for analytics.
Inputs: site type, analytics tool (GA4/CFA/Plausible/Other), region (JP/EU-ish), cookie yes/no, contact (optional).
Output: JP block + EN block + checklist. Copy buttons. Legal disclaimer.

### 02 OG Image Maker (Pro-lite)
Goal: Create OG PNG 1200x630 using Canvas template.
Inputs: title, subtitle (opt), url (opt), logo upload (opt), theme light/dark.
Free: preview + download PNG.
Pro: batch via CSV textarea (title,subtitle,url) + multi download (ZIP optional).
No external libs.

### 03 LP Skeleton Generator (Pro-lite)
Goal: Generate LP outline + copy skeleton JP/EN.
Inputs: product name, target, benefits bullets, price (opt), proof (opt), CTA.
Free: outline + short copy suggestions. Copy.
Pro: export Markdown + simple HTML skeleton snippet.

### 04 Pages Deploy Guide (Pro-lite)
Goal: Deploy checklist to Cloudflare Pages / GitHub Pages.
Inputs: platform, source (folder/zip), custom domain yes/no, output folder (root/dist/public).
Free: checklist + common errors.
Pro: symptom-based diagnosis tree + export MD.

### 05 Notion Form Design Kit (Free)
Goal: Generate Notion DB property design + workflow rules as “form replacement”.
Inputs: use case, needed fields (checkbox), status flow simple/detailed.
Output: property list, status pipeline, message templates JP/EN. Copy.

### 06 Form Tool Selector (Free)
Goal: Recommend form tools by requirements.
Inputs: checkboxes (upload/payments/notifications/multilingual/free-first/privacy).
Output: top 3 picks + reasons + “when NOT to use”.

### 07 Money Template Checker (Pro-lite)
Goal: Quick budget check + missing items warnings.
Inputs: monthly income, fixed costs, variable costs, savings target (optional).
Free: warnings + checklist.
Pro: template pack download (MD/CSV) + expanded checklist. Not financial advice.

### 08 Mini Game Utility (Free)
Goal: Timer + score log.
Features: timer, score input, history list, localStorage persist, export CSV (free ok), clear.

### 09 Design Request Builder (Free)
Goal: Generate design brief text JP/EN.
Inputs: purpose, size, deadline, references, must-have, avoid.
Output: copyable brief block.

### 10 Ops Weekly Report Generator (Free)
Goal: Weekly report template JP/EN.
Inputs: KPI, what changed, results, next actions.
Output: report block + copy.

### 11 Outsource Spec Generator (Pro-lite)
Goal: Generate outsource spec + acceptance + revision rules.
Inputs: work type, deliverables, deadline, budget, must-have, references.
Free: spec + acceptance criteria + revision rules.
Pro: deliverable packs (web/design/writing) + export MD.

### 12 Niche Job Starter Kit (Pro-lite)
Goal: Job post + screening questions + sheet columns.
Inputs: role, requirements, conditions, process, location/remote.
Free: job post template + screening questions.
Pro: sheet column CSV + variants pack.

### 13 Sponsor Page Builder (Free)
Goal: GitHub Sponsors page copy JP/EN.
Inputs: OSS summary, benefits, tiers count (3), corp support yes/no.
Output: sponsor page copy + tiers + FAQ.

### 14 Habit Plan Generator (Free)
Goal: Habit plan based on trigger/action/reward.
Inputs: goal, frequency, obstacles.
Output: plan + reminder copy JP/EN.

### 15 Incident Update Generator (Pro-lite)
Goal: Incident status updates JP/EN.
Inputs: service name, impact, start time, current status, next update time, contact (opt).
Free: templates (Investigating/Identified/Monitoring/Resolved).
Pro: postmortem template + timeline formatter + export MD.

### 16 Newsletter Kit Generator (Free)
Goal: Newsletter issue structure + subject ideas + CTA + sponsor pitch JP/EN.
Inputs: theme, audience, frequency.
Output: kit blocks + copy.

### 17 Microtool Launch Checklist (Free)
Goal: Checklist to launch microtools.
Inputs: tool type (converter/checker/generator/directory).
Output: checklist including SEO/meta, ads placement, donate, mobile test.

### 18 Cold Email Requirement Checker (Pro-lite)
Goal: Check cold email text quality risks.
Inputs: email text.
Free: warnings (length, unclear CTA, spammy phrases, missing context) + improvements.
Pro: compare 3 drafts + scoring + industry dictionary toggles.

### 19 Membership Offer Builder (Free)
Goal: Build membership offer structure JP/EN.
Inputs: topic, deliverables, frequency, time available.
Output: offer + pricing ranges + onboarding/retention copy.

### 20 Growth Log Template Generator (Free)
Goal: Format public growth log.
Inputs: PV, CTR, revenue, notes; optional anonymize toggle.
Output: formatted log JP/EN + copy + download MD (free ok).

## 5) Build order (batch)
- First: confirm `/tools/_template/` exists and is correct.
- Then build tools in batches of 5: 01–05, 06–10, 11–15, 16–20.
- After each batch, list created file paths.
