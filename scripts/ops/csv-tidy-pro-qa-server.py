"""CI-only local fixture server for CSV Tidy Pro browser acceptance.

This is not used by Cloudflare Pages or by production billing functions.
It serves actual repository files and returns simulated entitlements only for
the single hard-coded fake Checkout session. Never deploy as a billing API.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, parse_qs
import argparse
import json


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # CI-only: block third-party trackers/ads so browser navigation cannot
        # depend on external DNS or unrelated resource load completion.
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self' blob: data:; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "connect-src 'self'; "
            "img-src 'self' blob: data:; "
            "font-src 'self' data:; frame-src 'self'"
        )
        super().end_headers()

    def do_GET(self):
        uri = urlsplit(self.path)
        if uri.path != "/api/billing/entitlement":
            return super().do_GET()
        query = parse_qs(uri.query)
        product = query.get("productId", [""])[0]
        session = query.get("sessionId", [""])[0]
        active = product == "csv_tidy.pro_v1" and session == "cs_test_QAFIXTURE"
        payload = {
            "ok": True,
            "productId": product,
            "active": active,
            "source": "server",
            "state": "pro-active" if active else "restore-required",
            "features": [
                "csvTidy.savedPresets",
                "csvTidy.batchApply",
                "csvTidy.batchReport",
            ] if active else [],
        }
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
