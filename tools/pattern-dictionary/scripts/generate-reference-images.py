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


def write_png(path: Path, fn, tile_h=TILE):
    """Render a periodic recognition tile, repeat it, and write a 1536 square PNG."""
    tile = [[fn(x, y) for x in range(TILE)] for y in range(tile_h)]
    encoded_rows = [bytes(c for rgb in row for c in rgb) for row in tile]
    raw = bytearray()
    row_repeats = (SIZE + TILE - 1) // TILE
    for y in range(SIZE):
        raw.append(0)
        row = encoded_rows[y % tile_h] * row_repeats
        raw.extend(row[: SIZE * 3])
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
    return wx if (((x // 4) + (y // 4)) % 4) < 2 else wy


def glen_check(x, y):
    # Recognition-first Glen check: subtle small checks with unequal grouped fine
    # stripes plus stronger large overcheck lines. This deliberately avoids the
    # jagged diagonal surface used by the Houndstooth reference.
    micro = ((x // 8) + (y // 8)) % 2
    value = 225 if micro == 0 else 245
    for pos in (24, 28, 56, 60):
        dx = min((x - pos) % 96, (pos - x) % 96)
        dy = min((y - pos) % 96, (pos - y) % 96)
        if dx < 1.5 or dy < 1.5:
            value = min(value, 120)
    if (x % 96) < 4 or (y % 96) < 4:
        value = 45
    if 46 <= (x % 96) < 50 or 46 <= (y % 96) < 50:
        value = min(value, 80)
    return (value, value, value)


def argyle(x, y):
    base = CREAM
    best = None
    for row in range(-1, 4):
        cy = row * 96 + 48
        shift = 48 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * 96 + 48 + shift
            d = abs(x - cx) / 46 + abs(y - cy) / 42
            if d <= 1 and (best is None or d < best[0]):
                best = (d, NAVY if (row + col) % 2 == 0 else BURGUNDY)
    color = best[1] if best else base
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


MOROCCAN_POINTS = [
    (0,-48),(14,-35),(14,-27),(28,-27),(39,-13),(39,13),(28,27),(14,27),(14,35),(0,48),
    (-14,35),(-14,27),(-28,27),(-39,13),(-39,-13),(-28,-27),(-14,-27),(-14,-35),(0,-48)
]
MOROCCAN_SEGMENTS = [(*MOROCCAN_POINTS[i], *MOROCCAN_POINTS[i+1]) for i in range(len(MOROCCAN_POINTS)-1)]


def moroccan_trellis(x, y):
    for row in range(-1, 4):
        cy = row * 96 + 48
        shift = 48 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * 96 + 48 + shift
            if on_segments(x-cx, y-cy, MOROCCAN_SEGMENTS, 2.7):
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


def kikko_segments():
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
    return segs


def asanoha_segments():
    # Construct the hemp-leaf star from a triangular lattice by subdividing each
    # triangle from its centroid to all three vertices. 96x84 geometry stays close
    # to equilateral while giving an exact 192x168 repeat tile.
    segs = set()
    s = 96.0
    h = 84.0
    def point(i, j):
        return (i * s + (s / 2 if j % 2 else 0), j * h)
    def add(a, b):
        key = tuple(round(v, 3) for v in (*a, *b))
        rev = tuple(round(v, 3) for v in (*b, *a))
        if rev not in segs:
            segs.add(key)
    for j in range(-2, 5):
        for i in range(-3, 5):
            p = point(i, j)
            if j % 2 == 0:
                tris = [
                    (p, point(i, j+1), point(i-1, j+1)),
                    (p, point(i+1, j), point(i, j+1)),
                ]
            else:
                tris = [
                    (p, point(i, j+1), point(i+1, j+1)),
                    (p, point(i+1, j), point(i+1, j+1)),
                ]
            for tri in tris:
                for k in range(3):
                    add(tri[k], tri[(k+1) % 3])
                c = (sum(q[0] for q in tri)/3, sum(q[1] for q in tri)/3)
                for q in tri:
                    add(c, q)
    return list(segs)

KIKKO_SEGMENTS = kikko_segments()
ASANOHA_SEGMENTS = asanoha_segments()


def kikko(x, y):
    return INDIGO if on_segments(x, y, KIKKO_SEGMENTS, 2.8) else WHITE


def asanoha(x, y):
    return INDIGO if on_segments(x, y, ASANOHA_SEGMENTS, 2.2) else WHITE


GENERATORS = {
    "houndstooth": (houndstooth, TILE),
    "gingham": (gingham, TILE),
    "tartan": (tartan, TILE),
    "glen-check": (glen_check, TILE),
    "argyle": (argyle, TILE),
    "chevron": (chevron, TILE),
    "polka-dot": (polka_dot, TILE),
    "moroccan-trellis": (moroccan_trellis, TILE),
    "seigaiha": (seigaiha, TILE),
    "asanoha": (asanoha, 168),
    "shippo": (shippo, TILE),
    "ichimatsu": (ichimatsu, TILE),
    "kikko": (kikko, TILE),
}

for pattern_id, (fn, tile_h) in GENERATORS.items():
    path = OUT / f"{pattern_id}.png"
    write_png(path, fn, tile_h)
    print(f"generated {pattern_id}: {path} ({path.stat().st_size} bytes)")
