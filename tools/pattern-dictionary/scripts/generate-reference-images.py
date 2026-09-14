#!/usr/bin/env python3
"""Generate deterministic 1536x1536 PNG reference-image candidates.

No third-party packages. Geometry is deliberately flat, front-on, text-free,
and repeated so thumbnails remain identifiable. Generated files are candidates
only; production review_state remains image_ready until visual review.
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


def chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)


def write_png(path: Path, rows):
    raw = bytearray()
    for row in rows:
        raw.append(0)
        for r, g, b in row:
            raw.extend((r, g, b))
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def tile_image(fn):
    tile = [[fn(x, y) for x in range(TILE)] for y in range(TILE)]
    for y in range(SIZE):
        trow = tile[y % TILE]
        yield [trow[x % TILE] for x in range(SIZE)]


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
    # 2:2 twill surface simulation with alternating four-thread dark/light bands.
    # The resulting broken checks are structural, not an arbitrary jagged icon.
    thread = 12
    ix, iy = x // thread, y // thread
    warp_dark = ((ix // 4) % 2) == 0
    weft_dark = ((iy // 4) % 2) == 0
    warp_on_top = ((ix + iy) % 4) < 2
    dark = warp_dark if warp_on_top else weft_dark
    return BLACK if dark else WHITE


def gingham(x, y):
    band = 48
    vx = (x % 96) < band
    hy = (y % 96) < band
    if vx and hy:
        return BLUE
    if vx or hy:
        return LIGHT_BLUE
    return WHITE


def chevron(x, y):
    # Parallel V bands. Distance to a triangle-wave centerline determines fill.
    period = 96
    xx = x % period
    tri = abs(xx - period / 2)
    center = 48 + tri
    dy = (y - center) % 96
    dy = min(dy, 96 - dy)
    return BLACK if dy < 18 else WHITE


def ichimatsu(x, y):
    q = 96
    return BLACK if ((x // q) + (y // q)) % 2 == 0 else WHITE


def seigaiha(x, y):
    # Staggered concentric semicircle fans, repeated as overlapping wave crests.
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
    # Equal circles overlap on a half-diameter lattice (shippo-tsunagi geometry).
    r = 68
    for cx in (-96, 0, 96, 192, 288):
        for cy in (-96, 0, 96, 192, 288):
            if abs(math.hypot(x - cx, y - cy) - r) <= 3.2:
                return INDIGO
    return WHITE


def kikko(x, y):
    # Regular hexagonal tortoiseshell lattice.
    h = 48
    v = math.sqrt(3) * h / 2
    segs = []
    for row in range(-2, 6):
        cy = row * (2 * v)
        offset = h * 1.5 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * (3 * h) + offset
            pts = [(cx + h, cy), (cx + h/2, cy + v), (cx - h/2, cy + v),
                   (cx - h, cy), (cx - h/2, cy - v), (cx + h/2, cy - v)]
            segs.extend([(pts[i][0], pts[i][1], pts[(i+1)%6][0], pts[(i+1)%6][1]) for i in range(6)])
    return INDIGO if on_segments(x, y, segs, 2.8) else WHITE


def asanoha(x, y):
    # Hexagon + radial/diagonal star construction used for hemp-leaf recognition.
    segs = []
    h = 48
    v = math.sqrt(3) * h / 2
    for row in range(-2, 6):
        cy = row * (2 * v)
        offset = h * 1.5 if row % 2 else 0
        for col in range(-2, 5):
            cx = col * (3 * h) + offset
            pts = [(cx + h, cy), (cx + h/2, cy + v), (cx - h/2, cy + v),
                   (cx - h, cy), (cx - h/2, cy - v), (cx + h/2, cy - v)]
            # outline plus center-to-vertices and opposite-vertex chords
            segs.extend([(pts[i][0], pts[i][1], pts[(i+1)%6][0], pts[(i+1)%6][1]) for i in range(6)])
            segs.extend([(cx, cy, px, py) for px, py in pts])
            segs.extend([(pts[i][0], pts[i][1], pts[i+3][0], pts[i+3][1]) for i in range(3)])
    return INDIGO if on_segments(x, y, segs, 2.2) else WHITE


GENERATORS = {
    "houndstooth": houndstooth,
    "gingham": gingham,
    "chevron": chevron,
    "seigaiha": seigaiha,
    "asanoha": asanoha,
    "shippo": shippo,
    "ichimatsu": ichimatsu,
    "kikko": kikko,
}

for pattern_id, fn in GENERATORS.items():
    path = OUT / f"{pattern_id}.png"
    write_png(path, tile_image(fn))
    print(f"generated {pattern_id}: {path} ({path.stat().st_size} bytes)")
