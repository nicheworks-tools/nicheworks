# PR2 discovery slice (unverified in Chrome)

This incremental slice adds same-origin BFS discovery with URL normalization, dangerous-path filtering, per-origin permission request, stop control and selectable result list. It does **not** implement capture queue, ZIP or manifest. The crawler uses extension-origin fetch with the user's current browser credentials; CORS and site defenses can still reject requests. Never claim that login-only content or SPA-generated links are fully discoverable.

Static tests: run `node --test tests/discovery.test.mjs`. Chrome QA still required.
