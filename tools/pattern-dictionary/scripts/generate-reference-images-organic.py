#!/usr/bin/env python3
"""Generate controlled representative candidates for the seven broad/organic entries.

These are recognition-oriented editorial representatives, not claims that broad
categories such as damask, arabesque, ikat or kilim have one canonical motif.
All outputs stay image_ready until separate visual/source review.
"""
from pathlib import Path
import math
import struct
import zlib

SIZE=1536
TILE=192
REPEATS=SIZE//TILE
OUT=Path(__file__).resolve().parents[1]/'assets'/'reference'
OUT.mkdir(parents=True,exist_ok=True)

CREAM=(244,235,214)
IVORY=(246,242,230)
GREEN=(31,92,60)
CHARCOAL=(49,52,58)
TEAL=(13,116,115)
BURGUNDY=(116,42,57)
TAN=(210,166,110)
BROWN=(98,61,38)
BLACK=(20,20,19)
INDIGO=(30,58,138)
WHITE=(248,250,252)
RED=(145,32,45)
NAVY=(22,39,72)


def chunk(kind,data):
    return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)


def write_png(path,fn):
    tile=[[fn(x,y) for x in range(TILE)] for y in range(TILE)]
    rows=[bytes(c for rgb in row for c in rgb) for row in tile]
    raw=bytearray()
    for y in range(SIZE):
        raw.append(0)
        raw.extend(rows[y%TILE]*REPEATS)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',SIZE,SIZE,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(raw),9))+chunk(b'IEND',b'')
    path.write_bytes(png)


def dist_segment(px,py,ax,ay,bx,by):
    vx,vy=bx-ax,by-ay
    wx,wy=px-ax,py-ay
    vv=vx*vx+vy*vy
    if vv==0:return math.hypot(px-ax,py-ay)
    t=max(0,min(1,(wx*vx+wy*vy)/vv))
    return math.hypot(px-(ax+t*vx),py-(ay+t*vy))


def rot_ellipse(x,y,cx,cy,rx,ry,a=0):
    dx,dy=x-cx,y-cy
    ca,sa=math.cos(a),math.sin(a)
    u=dx*ca+dy*sa
    v=-dx*sa+dy*ca
    return (u/rx)**2+(v/ry)**2<=1


def karakusa(x,y):
    # Recognition-oriented Japanese karakusa cue: light continuous scrolling vines
    # over a green ground, with repeated attached curls rather than isolated waves.
    for row in range(-1,4):
        cy=row*96+48
        vine=cy+23*math.sin(2*math.pi*x/96)
        if abs(y-vine)<=3.4:return CREAM
        for col in range(-1,5):
            cx=col*96+24
            base=cy+23*math.sin(2*math.pi*cx/96)
            side=1 if (row+col)%2==0 else -1
            ccx=cx+side*18
            ccy=base+side*17
            r=math.hypot(x-ccx,y-ccy)
            # Open curl plus a small terminal leaf gives a scrolling-vine reading.
            a=(math.atan2(y-ccy,x-ccx)+2*math.pi)%(2*math.pi)
            target=8+2.9*a
            if abs(r-target)<=2.6 and r<28:return CREAM
            if rot_ellipse(x,y,ccx+side*17,ccy+side*6,9,5,side*0.45):return CREAM
    return GREEN


def damask(x,y):
    # Bilaterally symmetric foliate medallion, deliberately large enough to read
    # as a damask-derived surface-design cue rather than a generic tiny flower.
    for cx,cy in ((48,48),(144,144),(-48,144),(240,48)):
        if rot_ellipse(x,y,cx,cy,13,35):return CHARCOAL
        for side in (-1,1):
            if rot_ellipse(x,y,cx+side*23,cy,15,28,side*0.35):return CHARCOAL
            if rot_ellipse(x,y,cx+side*34,cy-25,11,18,side*0.75):return CHARCOAL
            if rot_ellipse(x,y,cx+side*34,cy+25,11,18,-side*0.75):return CHARCOAL
        if rot_ellipse(x,y,cx,cy-40,20,12):return CHARCOAL
        if rot_ellipse(x,y,cx,cy+40,20,12):return CHARCOAL
        # Negative slit keeps the central mass visually articulated.
        if rot_ellipse(x,y,cx,cy,5,19):return CREAM
    return CREAM


def arabesque(x,y):
    # Interlaced multidirectional scroll network. This stays visually separate from
    # karakusa by using staggered teal scroll nodes and diagonal linking stems.
    for row in range(-1,4):
        cy=row*96+48
        shift=48 if row%2 else 0
        for col in range(-2,5):
            cx=col*96+48+shift
            dx,dy=x-cx,y-cy
            r=math.hypot(dx,dy)
            a=math.atan2(dy,dx)
            target=21+5*(a/math.pi)
            if 12<r<33 and abs(r-target)<=2.4:return TEAL
            if dist_segment(x,y,cx+23,cy-5,cx+48,cy-29)<=2.2:return TEAL
            if dist_segment(x,y,cx-23,cy+5,cx-48,cy+29)<=2.2:return TEAL
            if rot_ellipse(x,y,cx+39,cy-31,10,5,-0.45):return TEAL
            if rot_ellipse(x,y,cx-39,cy+31,10,5,-0.45):return TEAL
    return CREAM


def paisley_unit(x,y,cx,cy,mirror=False):
    dx=x-cx
    if mirror:dx=-dx
    dy=y-cy
    bulb=(dx/31)**2+((dy-10)/43)**2<=1
    hook=((dx-19)/18)**2+((dy+31)/30)**2<=1
    notch=((dx-7)/15)**2+((dy-4)/25)**2<=1
    outer=(bulb or hook) and not notch
    inner=((dx+3)/12)**2+((dy-14)/20)**2<=1
    return outer,inner


def paisley(x,y):
    for cx,cy,mirror in ((48,48,False),(144,144,True),(-48,144,True),(240,48,False)):
        outer,inner=paisley_unit(x,y,cx,cy,mirror)
        if inner:return CREAM
        if outer:return BURGUNDY
    return CREAM


ROSETTES=[(28,30,17,12,0.2),(82,24,14,19,1.0),(145,36,20,13,2.0),(50,92,19,15,2.6),(118,92,15,12,0.7),(172,105,18,20,1.8),(24,157,15,18,2.2),(92,154,21,14,0.1),(154,165,16,12,1.3)]
SOLID_SPOTS=[(63,55,5),(126,62,6),(17,112,5),(88,116,4),(145,132,5),(48,183,5)]


def leopard_print(x,y):
    for cx,cy,rx,ry,phase in ROSETTES:
        dx,dy=x-cx,y-cy
        angle=math.atan2(dy/ry if ry else 0,dx/rx if rx else 0)
        rr=math.sqrt((dx/rx)**2+(dy/ry)**2)
        target=1+0.10*math.sin(3*angle+phase)+0.06*math.sin(5*angle-phase)
        if abs(rr-target)<0.18:return BLACK
        if rr<0.42 and int(phase*10)%2==0:return BROWN
    for cx,cy,r in SOLID_SPOTS:
        if math.hypot(x-cx,y-cy)<=r:return BLACK
    return TAN


def ihash(a,b):
    n=(a*374761393+b*668265263)&0xffffffff
    n=(n^(n>>13))*1274126177&0xffffffff
    return (n^(n>>16))&0xffffffff


def ikat(x,y):
    # Representative geometric resist-dye appearance with deterministic feathered edges.
    color=WHITE
    for row in range(-1,4):
        cy=row*96+48
        shift=48 if row%2 else 0
        for col in range(-2,5):
            cx=col*96+48+shift
            dy=abs(y-cy)
            if dy>43:continue
            half=40-dy*0.78
            jitter=(ihash(y,row+col)%9)-4
            edge=abs(x-(cx+jitter))
            if edge<half-3:return INDIGO
            if edge<half+4 and ihash(x,y)%4!=0:return INDIGO
    return color


def kilim(x,y):
    # Representative flat-woven visual family: large stepped diamonds, horizontal
    # bands and hook-like terminals. It is explicitly not a claim of one kilim motif.
    if y<5 or 92<=y<98:return NAVY
    for cx,cy,color in ((48,48,RED),(144,48,NAVY),(96,144,RED)):
        dx=abs(x-cx)
        dy=abs(y-cy)
        qx=(dx//8)*8
        qy=(dy//8)*8
        if qx/58+qy/43<=1:
            if qx/29+qy/21<=1:return CREAM
            return color
        if 48<=dx<=62 and 20<=dy<=34:return color
    return CREAM


GENERATORS={
    'karakusa':karakusa,
    'damask':damask,
    'arabesque':arabesque,
    'paisley':paisley,
    'leopard-print':leopard_print,
    'ikat':ikat,
    'kilim':kilim,
}

for pattern_id,fn in GENERATORS.items():
    path=OUT/f'{pattern_id}.png'
    write_png(path,fn)
    print(f'generated {pattern_id}: {path} ({path.stat().st_size} bytes)')
