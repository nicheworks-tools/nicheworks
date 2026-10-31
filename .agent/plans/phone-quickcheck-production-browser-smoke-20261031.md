# Phone QuickCheck production browser smoke — 2026-10-31

## Objective
Close the gap between PR/CI verification of the GitHub static source and independently checking the actual Cloudflare Pages deployment at https://nicheworks.app/tools/phone-quickcheck/.

## Declared scope
- scripts/check-phone-quickcheck-production.mjs — a standalone Node 22 smoke verifier with no npm or framework dependencies.
- .github/workflows/phone-quickcheck-production-smoke.yml — GitHub Actions workflow triggered by changes to its own code on PR and by Phone QuickCheck changes to main; also manually dispatchable.
- .agent/plans/phone-quickcheck-production-browser-smoke-20261031.md — this plan.
No modifications to data, UI, pricing, ads, affiliate, analytics, shared specifications, other tools, Cloudflare settings or pages routing.

## Assertions and non-claims
1. Runner requests public HTML, app.js, style.css, phones.json and accessories.json via HTTP, with 8 attempts for post-deploy eventual consistency.
2. Assert public count matches repository, FCNT and Nothing records exist, negative wireless status is deployed, and assets are not stale or absent.
3. Launch runner preinstalled headless Google Chrome via Chrome DevTools Protocol (Node 22 built-in WebSocket; no Playwright or npm dependencies).
4. Check five actual viewport widths 320/390/414/768/1280: no horizontal document overflow, phone rows load, search for Phone (4b), mobile bottom-sheet/desktop detail visibility and close behavior, and JP/EN non-support text. Upload screenshots for separate manual visual review via GitHub's official upload-artifact action (7-day retention).
5. Failure to access public URL on the runner is reported as a failed public test; it is not automatically labeled an outage before checking Cloudflare/DNS. Passing does not establish perfect cross-browser visual quality or prove actual user device hardware.

## Resource controls
No new npm dependencies. Use preinstalled runner Chrome and Node, standard GitHub checkout/setup-node/upload-artifact actions only, a 10-minute job timeout, and lightweight screenshots. PR probe checks the previously deployed main (only when smoke workflow/script itself changes). Push-to-main checks post-deploy with retry. No API keys or changes to Cloudflare account.
