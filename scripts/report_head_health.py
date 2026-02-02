#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = "https://nicheworks.app"
OLD_DOMAINS = ["nicheworks.pages.dev", "pages.dev"]
EXCLUDE_DIRS = {".git", "node_modules", "_archive", ".agent"}
EXCLUDE_SUFFIXES = (".min.", ".map")

RE_CANONICAL = re.compile(
    r"<link\s+[^>]*rel=[\"']canonical[\"'][^>]*>", re.IGNORECASE
)
RE_CANONICAL_HREF = re.compile(r"href=[\"']([^\"']*)[\"']", re.IGNORECASE)
RE_OG_URL = re.compile(
    r"<meta\s+[^>]*property=[\"']og:url[\"'][^>]*>", re.IGNORECASE
)
RE_META_CONTENT = re.compile(r"content=[\"']([^\"']*)[\"']", re.IGNORECASE)


def should_exclude(path: Path) -> bool:
    if any(part in EXCLUDE_DIRS for part in path.parts):
        return True
    name = path.name
    return any(suffix in name for suffix in EXCLUDE_SUFFIXES)


def iter_tools_html(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.glob("tools/**/*.html"):
        if path.is_file() and not should_exclude(path):
            files.append(path)
    return sorted(files)


def canonical_url(root: Path, path: Path) -> str:
    rel = path.relative_to(root)
    if rel.name == "index.html":
        parent = rel.parent.as_posix()
        if parent == ".":
            return f"{ROOT}/"
        return f"{ROOT}/{parent.strip('/')}/"
    return f"{ROOT}/{rel.as_posix()}"


def head_health(html: str, url: str) -> tuple[bool, bool, bool]:
    canonical_match = RE_CANONICAL.search(html)
    og_match = RE_OG_URL.search(html)
    missing_canonical = canonical_match is None
    missing_og = og_match is None
    bad = False
    if canonical_match:
        href = RE_CANONICAL_HREF.search(canonical_match.group(0))
        if not href or href.group(1) != url:
            bad = True
    else:
        bad = True
    if og_match:
        content = RE_META_CONTENT.search(og_match.group(0))
        if not content or content.group(1) != url:
            bad = True
    else:
        bad = True
    return bad, missing_canonical, missing_og


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    tools_html = iter_tools_html(root)

    bad = 0
    missing_canonical = 0
    missing_og = 0
    pages_dev = 0

    for path in tools_html:
        html = path.read_text(encoding="utf-8")
        url = canonical_url(root, path)
        bad_flag, missing_c, missing_o = head_health(html, url)
        if bad_flag:
            bad += 1
        if missing_c:
            missing_canonical += 1
        if missing_o:
            missing_og += 1
        if any(domain in html for domain in OLD_DOMAINS):
            pages_dev += 1

    print("== Head Health Report (tools/*.html) ==")
    print(f"tools html total: {len(tools_html)}")
    print(f"bad head urls: {bad}")
    print(f"contains pages.dev: {pages_dev}")
    print(f"missing canonical: {missing_canonical}")
    print(f"missing og:url: {missing_og}")


if __name__ == "__main__":
    main()
