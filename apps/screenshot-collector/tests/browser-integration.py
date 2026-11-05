"""Chromium extension end-to-end QA: discovery, capture, ZIP and manifest."""
import asyncio
import io
import json
import os
import tempfile
import threading
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.async_api import async_playwright, expect

EXT = Path(__file__).resolve().parents[1] / "extension"
PAGES = {
    "/": '<title>Home</title><a href="/second">Second</a><a href="/third">Third</a><div style="height:1400px">Home page</div>',
    "/second": '<title>Second</title><a href="/third">Third</a><div style="height:1800px">Second page</div>',
    "/third": '<title>Third</title><div style="height:2200px">Third page</div>',
}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = ("<!doctype html><html><body>" + PAGES.get(self.path, "") + "</body></html>").encode()
        self.send_response(200 if self.path in PAGES else 404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):
        pass

async def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    root = f"http://127.0.0.1:{server.server_port}/"
    try:
        async with async_playwright() as p:
            with tempfile.TemporaryDirectory() as profile:
                browser = await p.chromium.launch_persistent_context(
                    profile, channel="chromium", headless=True,
                    args=[f"--disable-extensions-except={EXT}", f"--load-extension={EXT}",
                          "--no-sandbox", "--disable-dev-shm-usage"],
                    accept_downloads=True,
                )
                try:
                    worker = browser.service_workers[0] if browser.service_workers else await browser.wait_for_event("serviceworker", timeout=15000)
                    extension_id = worker.url.split("/")[2]
                    page = await browser.new_page()
                    await page.goto(f"chrome-extension://{extension_id}/collector.html")
                    await page.locator("#url").fill(root)
                    await page.locator("#max-pages").fill("3")
                    await page.locator("#discover").click()
                    await expect(page.locator("#discovery-status")).to_contain_text("Discovered 3 HTML pages", timeout=30000)
                    assert await page.locator("#pages input:checked").count() == 3
                    await page.locator("#batch-start").click()
                    await expect(page.locator("#batch-status")).to_contain_text("ZIP ready.", timeout=90000)
                    assert await page.locator("#batch-download").is_visible()
                    async with page.expect_download() as download_info:
                        await page.locator("#batch-download").click()
                    download = await download_info.value
                    with tempfile.TemporaryDirectory() as dest:
                        target = Path(dest) / "result.zip"
                        await download.save_as(target)
                        with zipfile.ZipFile(target) as archive:
                            assert archive.testzip() is None
                            names = archive.namelist()
                            assert len([x for x in names if x.endswith(".png")]) == 3, names
                            manifest = json.loads(archive.read("manifest.json"))
                            assert manifest["requested"] == 3
                            assert all(x["status"] == "saved" for x in manifest["results"]), manifest
                            for name in names:
                                if name.endswith(".png"):
                                    data = archive.read(name)
                                    assert data[:8] == b"\\x89PNG\\r\\n\\x1a\\n"
                            print(json.dumps({"result":"PASS","pages":3,"zip_entries":names,"manifest":manifest}, ensure_ascii=False))
                finally:
                    await browser.close()
    finally:
        server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
