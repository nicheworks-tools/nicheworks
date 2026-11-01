# PR1 manual capture evidence

Status: **NOT RUN**. Source and syntax checks alone are insufficient.

## Matrix
For each engine, record Chromium version, OS, permission prompt, URL, viewport CSS size, output PNG pixels, image height vs viewport, top/bottom marker visibility, lazy section text, sticky header duplication, errors, and result PASS/FAIL.

1. Serve `fixtures/tall-page.html` via HTTP on localhost; open the extension tab and capture with CDP.
2. Repeat using viewport-scroll mode. Expect possible permission rejection: record verbatim; do not grant global host permission silently.
3. Inspect lazy section for LOADED and both top/bottom markers.
4. Reject or close the origin permission prompt; ensure a clear error and no PNG.
5. Try a redirect to another origin; ensure it is rejected before capture.
6. Test a very tall document and an infinite-scroll page separately; record the limit/failure.
7. Check Chrome DevTools/debugger contention and whether an enterprise policy blocks attach.
8. Verify a fresh installation never transmits screenshot data or stores credentials.

## Release gate
PR1 is not PASS until both engines have recorded real screenshots or explicit permission/API failure evidence. Do not merge or publish based on code inspection alone.
