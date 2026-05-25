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


def iter_targets(root: Path) -> list[Path]:
    patterns = [
        "robots.txt",
        "sitemap*.xml",
        "*.html",
        "en/*.html",
        "tools/**/*.html",
    ]
    files: list[Path] = []
    for pattern in patterns:
        for path in root.glob(pattern):
            if path.is_file() and not should_exclude(path):
                files.append(path)
    unique = sorted(set(files))
    return unique


def rel_path(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def canonical_url(root: Path, path: Path) -> str:
    rel = Path(rel_path(root, path))
    if rel.name == "index.html":
        parent = rel.parent.as_posix()
        if parent == ".":
            return f"{ROOT}/"
        return f"{ROOT}/{parent.strip('/')}/"
    return f"{ROOT}/{rel.as_posix()}"


def replace_domains(text: str) -> tuple[str, int]:
    changed = 0
    for old in OLD_DOMAINS:
        if old in text:
            text = text.replace(old, "nicheworks.app")
            changed += 1
    return text, changed


def update_tag_value(tag: str, attr_re: re.Pattern[str], new_value: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return match.group(0).split("=")[0] + f'="{new_value}"'

    return attr_re.sub(repl, tag, count=1)


def ensure_head_tags(html: str, url: str) -> tuple[str, bool, bool]:
    canonical_match = RE_CANONICAL.search(html)
    og_match = RE_OG_URL.search(html)

    changed = False

    if canonical_match:
        tag = canonical_match.group(0)
        updated = update_tag_value(tag, RE_CANONICAL_HREF, url)
        if updated != tag:
            html = html.replace(tag, updated, 1)
            changed = True
    if og_match:
        tag = og_match.group(0)
        updated = update_tag_value(tag, RE_META_CONTENT, url)
        if updated != tag:
            html = html.replace(tag, updated, 1)
            changed = True

    inserts: list[str] = []
    if not canonical_match:
        inserts.append(f'  <link rel="canonical" href="{url}">')
    if not og_match:
        inserts.append(f'  <meta property="og:url" content="{url}">')

    if inserts:
        head_close = re.search(r"</head>", html, re.IGNORECASE)
        if head_close:
            insert_block = "\n" + "\n".join(inserts) + "\n"
            html = html[: head_close.start()] + insert_block + html[head_close.start() :]
            changed = True

    return html, bool(canonical_match), bool(og_match)


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


def summarize_health(root: Path, tools_html: list[Path]) -> dict[str, int]:
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
    return {
        "tools_total": len(tools_html),
        "bad_head_urls": bad,
        "missing_canonical": missing_canonical,
        "missing_og": missing_og,
        "contains_pages_dev": pages_dev,
    }


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    targets = iter_targets(root)
    tools_html = [p for p in targets if "tools" in p.parts and p.suffix == ".html"]

    before = summarize_health(root, tools_html)

    changed_files: list[str] = []

    for path in targets:
        text = path.read_text(encoding="utf-8")
        original = text
        text, _ = replace_domains(text)

        if path.suffix == ".html":
            url = canonical_url(root, path)
            text, _, _ = ensure_head_tags(text, url)

        if text != original:
            path.write_text(text, encoding="utf-8")
            changed_files.append(rel_path(root, path))

    after = summarize_health(root, tools_html)

    print("== Head URL Fix Summary ==")
    print("Before:")
    print(
        f"  tools html total: {before['tools_total']}",
        f"bad head urls: {before['bad_head_urls']}",
        f"contains pages.dev: {before['contains_pages_dev']}",
        f"missing canonical: {before['missing_canonical']}",
        f"missing og:url: {before['missing_og']}",
        sep="\n  ",
    )
    print("After:")
    print(
        f"  tools html total: {after['tools_total']}",
        f"bad head urls: {after['bad_head_urls']}",
        f"contains pages.dev: {after['contains_pages_dev']}",
        f"missing canonical: {after['missing_canonical']}",
        f"missing og:url: {after['missing_og']}",
        sep="\n  ",
    )
    print(f"Changed files: {len(changed_files)}")


if __name__ == "__main__":
    main()
