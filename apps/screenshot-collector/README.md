# Screenshot Collector — PR1 feasibility experiment

**Status: experimental, not released.** Local-only Chromium Manifest V3 extension, no accounts, payment or external services. This directory is not a static NicheWorks tool and is not registered on the mother ship.

## Install and run
1. Open `chrome://extensions` in a Chromium-based browser.
2. Enable Developer mode and choose **Load unpacked**. Select `apps/screenshot-collector/extension`.
3. Click the extension icon to open its dedicated management tab.
4. Enter an HTTP(S) URL, select CDP or scroll capture, click the capture button and approve that site's origin permission.
5. Inspect the preview and save the PNG. Both modes are **PoC only**; neither is guaranteed to work on all sites.

## Security and limitations
- The debugger permission is required in this PR1 build and is a strong browser permission. No optional debugger permission is available.
- The scroll path may fail because `captureVisibleTab` has stricter permission requirements than origin-scoped host access; the PoC reports the failure rather than escalating to `<all_urls>`.
- The capture tab is opened and closed per attempt. One tab is used at a time. A future batch queue will reuse a single tab across URLs.
- No crawling, batch ZIP, manifest, user profiles, cloud upload or paywall is implemented in PR1.
- Do not use on pages containing sensitive content unless you accept the debugger permission and local screenshot handling.
- The fixture must be served via HTTP(S), e.g. `python3 -m http.server 8765` from the `fixtures` directory, then use `http://localhost:8765/tall-page.html`.

## Next
Run manual QA in `QA.md`. Select the capture method only after comparing actual output and permission behavior. Free MVP first; optional Pro capabilities later, without artificial page-count restrictions.
