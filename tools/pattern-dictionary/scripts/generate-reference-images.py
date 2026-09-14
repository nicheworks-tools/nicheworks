#!/usr/bin/env python3
"""Generate deterministic 1536x1536 PNG Reference Image candidates.

No third-party packages. Geometry is flat, front-on, text-free, and repeated so
thumbnails remain identifiable. Generated files are candidates only; records
remain image_ready until visual structural review advances them.
"""
from pathlib import Path
import math
import struct
import zlib

SIZE = 1536
TILE = 192
REPEATS = SIZE // TILE
OUT = Path(__file__).resolve().parents[1] / "assets" / "reference"
OUT.mkdir(parents=True, exist_ok=True)

WHITE = (248, 250, 252)
BLACK = (17, 24, 39)
INDIGO = (30, 58, 138)
BLUE = (52, 120, 176)
LIGHT_BLUE = (181, 215, 235)
RED = (145, 32, 45)
GREEN = (31, 78, 56)
NAVY = (22, 39, 72)
BURGUNDY = (116, 42, 57)
CREAM = (244, 235, 214)
GRAY = (133, 139, 148)
LIGHT_GRAY = (218, 221, 224)
TEAL = (13, 116, 115)


def chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)


def write_png(path: Path, fn):
    tile = [[fn(x, y) for x in range(TILE)] for y in range(TILE)]
    encoded_rows = [bytes(c for rgb in row for c in rgb) for row in tile]
    raw = bytearray()
    for y in range(SIZE):
        raw.append(0)
        raw.extend(encoded_rows[y % TILE] * REPEATS)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def dist_segment(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    vv = vx * vx + vy * vy
    if vv == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, (wx * vx + wy * vy) / vv))
    qx, qy = ax + t * vx, ay + t * vy
    return math.hypot(px - qx, py - qy)


def on_segments(x, y, segments, width=3.0):
    return any(dist_segment(x, y, *s) <= width for s in segments)


def houndstooth(x, y):
    # 2:2 twill surface simulation with four-thread dark/light bands.
    thread = 12
    ix, iy = x // thread, y // thread
    warp_dark = ((ix // 4) % 2) == 0
    weft_dark = ((iy // 4) % 2) == 0
    warp_on_top = ((ix + iy) % 4) < 2
    return BLACK if (warp_dark if warp_on_top else weft_dark) else WHITE


def gingham(x, y):
    vx = (x % 96) < 48
    hy = (y % 96) < 48
    if vx and hy:
        return BLUE
    if vx or hy:
        return LIGHT_BLUE
    return WHITE


def tartan_stripe(v):
    v %= 192
    if v < 54:
        return RED
    if v < 78:
        return NAVY
    if v < 132:
        return GREEN
    if v < 144:
        return NAVY
    if v < 180:
        return RED
    return NAVY


def tartan(x, y):
    wx, wy = tartan_stripe(x), tartan_stripe(y)
    if wx == wy:
        return wx
    # Twill-like crossing keeps both warp and weft stripe sequences visible.
    return wx if (((x // 4) + (y // 4)) % 4) < 2 else wy


def glen_check(x, y):
    # Fine checks grouped by heavier 96px and medium 48px divisions.
    lx, ly = x % 96, y % 96
    if lx < 5 or ly < 5:
        return BLACK
    if abs(lx - 48) < 4 or abs(ly - 48) < 4:
        return GRAY
    fine = ((x // 12) + (y // 12)) % 2
    block = ((x // 48) + (y // 48)) % 2
    if block:
        return LIGHT_GRAY if fine else WHITE
    return GRAY if fine else LIGHT_GRAY


def argyle(x, y):
    base = CREAM
    best = None
    # Staggered lozenges, alternating navy and burgundy.
    for row in range(-1, 4):
        cy = row * 96 + 48
        shift = 48 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * 96 + 48 + shift
            d = abs(x - cx) / 46 + abs(y - cy) / 42
            if d <= 1 and (best is None or d < best[0]):
                best = (d, NAVY if (row + col) % 2 == 0 else BURGUNDY)
    color = best[1] if best else base
    # Thin crossing diagonal lattice laid over the colored diamonds.
    d1 = (y - x) % 96
    d2 = (y + x) % 96
    if min(d1, 96-d1) < 2.2 or min(d2, 96-d2) < 2.2:
        return BLACK
    return color


def chevron(x, y):
    period = 96
    tri = abs((x % period) - period / 2)
    center = 48 + tri
    dy = (y - center) % 96
    dy = min(dy, 96 - dy)
    return BLACK if dy < 18 else WHITE


def polka_dot(x, y):
    spacing = 64
    cx = (x // spacing) * spacing + spacing / 2
    cy = (y // spacing) * spacing + spacing / 2
    return BLACK if math.hypot(x - cx, y - cy) <= 17 else WHITE


def moroccan_trellis(x, y):
    # Contemporary lantern/trellis market-label shape: rounded sides, pointed ends.
    for row in range(-1, 4):
        cy = row * 96 + 48
        shift = 48 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * 96 + 48 + shift
            dy = y - cy
            if -48 <= dy <= 48:
                t = (dy + 48) / 96
                half = 8 + 34 * (math.sin(math.pi * t) ** 0.68)
                if abs(abs(x - cx) - half) <= 2.8:
                    return TEAL
                if abs(dy) > 44 and abs(x - cx) <= 7:
                    return TEAL
    return WHITE


def ichimatsu(x, y):
    q = 96
    return BLACK if ((x // q) + (y // q)) % 2 == 0 else WHITE


def seigaiha(x, y):
    for row in range(-1, 4):
        cy = row * 96 + 96
        shift = 48 if row % 2 else 0
        for cx in (-96 + shift, 0 + shift, 96 + shift, 192 + shift, 288 + shift):
            if y <= cy + 2:
                d = math.hypot(x - cx, y - cy)
                for r in (28, 50, 72):
                    if abs(d - r) <= 3.2:
                        return INDIGO
    return WHITE


def shippo(x, y):
    r = 68
    for cx in (-96, 0, 96, 192, 288):
        for cy in (-96, 0, 96, 192, 288):
            if abs(math.hypot(x - cx, y - cy) - r) <= 3.2:
                return INDIGO
    return WHITE


def hex_segments(include_star=False):
    segs = []
    h = 48
    v = math.sqrt(3) * h / 2
    for row in range(-2, 6):
        cy = row * (2 * v)
        offset = h * 1.5 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * (3 * h) + offset
            pts = [(cx+h,cy),(cx+h/2,cy+v),(cx-h/2,cy+v),(cx-h,cy),(cx-h/2,cy-v),(cx+h/2,cy-v)]
            segs.extend([(pts[i][0],pts[i][1],pts[(i+1)%6][0],pts[(i+1)%6][1]) for i in range(6)])
            if include_star:
                segs.extend([(cx,cy,px,py) for px,py in pts])
                segs.extend([(pts[i][0],pts[i][1],pts[i+3][0],pts[i+3][1]) for i in range(3)])
    return segs

KIKKO_SEGMENTS = hex_segments(False)
ASANOHA_SEGMENTS = hex_segments(True)


def kikko(x, y):
    return INDIGO if on_segments(x, y, KIKKO_SEGMENTS, 2.8) else WHITE


def asanoha(x, y):
    return INDIGO if on_segments(x, y, ASANOHA_SEGMENTS, 2.2) else WHITE


GENERATORS = {
    "houndstooth": houndstooth,
    "gingham": gingham,
    "tartan": tartan,
    "glen-check": glen_check,
    "argyle": argyle,
    "chevron": chevron,
    "polka-dot": polka_dot,
    "moroccan-trellis": moroccan_trellis,
    "seigaiha": seigaiha,
    "asanoha": asanoha,
    "shippo": shippo,
    "ichimatsu": ichimatsu,
    "kikko": kikko,
}

for pattern_id, fn in GENERATORS.items():
    path = OUT / f"{pattern_id}.png"
    write_png(path, fn)
    print(f"generated {pattern_id}: {path} ({path.stat().st_size} bytes)")
