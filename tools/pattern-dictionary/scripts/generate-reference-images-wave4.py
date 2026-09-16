#!/usr/bin/env python3
"""Generate deterministic 1536px recognition-reference PNGs for Pattern Dictionary Wave 4.

Qualified style, technique, effect, and textile-tradition terms are rendered only as
representative recognition references, never as claims of one universal canonical repeat.
"""
from pathlib import Path
import math, struct, zlib

SIZE=1536; TILE=192; REP=SIZE//TILE
OUT=Path(__file__).resolve().parents[1]/'assets'/'reference'; OUT.mkdir(parents=True,exist_ok=True)
CREAM=(246,239,221); WHITE=(249,249,246); BLACK=(31,31,34); NAVY=(38,52,78); INDIGO=(35,58,105)
BLUE=(55,94,151); RED=(160,55,52); DARK_RED=(112,42,43); GOLD=(194,151,55); GREEN=(48,102,66)
DARK_GREEN=(28,76,49); TAN=(190,153,108); BROWN=(105,70,46); GRAY=(118,119,116); PALE=(216,211,196)
PINK=(190,98,119); ORANGE=(191,105,48)

def chunk(k,d): return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
def write_png(path,fn):
    tile=[[fn(x,y) for x in range(TILE)] for y in range(TILE)]
    raw=bytearray()
    for y in range(SIZE):
        raw.append(0)
        row=tile[y%TILE]
        raw.extend(bytes(c for rgb in row for c in rgb)*REP)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',SIZE,SIZE,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(raw),9))+chunk(b'IEND',b'')
    path.write_bytes(png)
def seg(px,py,ax,ay,bx,by):
    vx,vy=bx-ax,by-ay; wx,wy=px-ax,py-ay; vv=vx*vx+vy*vy
    if vv==0:return math.hypot(px-ax,py-ay)
    t=max(0,min(1,(wx*vx+wy*vy)/vv)); return math.hypot(px-(ax+t*vx),py-(ay+t*vy))
def ring(x,y,cx,cy,r,w=2): return abs(math.hypot(x-cx,y-cy)-r)<=w
def ellipse(x,y,cx,cy,rx,ry,a=0):
    ca,sa=math.cos(a),math.sin(a); dx,dy=x-cx,y-cy; u=dx*ca+dy*sa; v=-dx*sa+dy*ca
    return (u/rx)**2+(v/ry)**2<=1
def near_mod(v,target,width,period): return abs((v-target+period/2)%period-period/2)<=width/2
def flower(x,y,cx,cy,r,col=RED,n=6):
    if (x-cx)**2+(y-cy)**2<=(r*.28)**2:return GOLD
    for k in range(n):
        a=2*math.pi*k/n; px=cx+math.cos(a)*r*.62; py=cy+math.sin(a)*r*.62
        if (x-px)**2+(y-py)**2<=(r*.42)**2:return col
    return None

def baroque_scroll(x,y):
    xx,yy=x%96,y%96; base=48+24*math.sin((yy-8)/96*2*math.pi)
    if abs(xx-base)<=3:return BROWN
    for cx,cy in ((26,22),(70,70)):
        rr=math.hypot(xx-cx,yy-cy); a=(math.atan2(yy-cy,xx-cx)+2*math.pi)%(2*math.pi)
        if abs(rr-(4+3.2*a))<=2 and rr<26:return BROWN
    if ellipse(xx,yy,34,38,8,17,-.7) or ellipse(xx,yy,66,59,8,17,.7):return GREEN
    return CREAM

def chinoiserie(x,y):
    xx,yy=x%192,y%192
    # pavilion
    if 118<=xx<=169 and 113<=yy<=145 and (yy in range(141,146) or xx in range(118,122) or xx in range(165,170)):return BLUE
    if seg(xx,yy,108,113,144,88)<=3 or seg(xx,yy,144,88,179,113)<=3:return BLUE
    if 140<=xx<=148 and 123<=yy<=145:return BLUE
    # branch and blossoms
    if seg(xx,yy,14,166,70,108)<=3 or seg(xx,yy,70,108,97,48)<=3:return DARK_GREEN
    for args in ((42,137,13,RED),(76,96,12,PINK),(99,50,11,RED)):
        v=flower(xx,yy,*args,5)
        if v:return v
    # bird silhouette
    if seg(xx,yy,78,55,87,48)<=2 or seg(xx,yy,87,48,96,55)<=2:return BLACK
    return CREAM

def flame_stitch(x,y):
    xx=x%96; yy=y%96
    q=(xx//8)%12; center=48-abs(q-6)*6
    for off,col in ((0,RED),(8,ORANGE),(16,GOLD),(24,NAVY)):
        if abs((yy%96)-(center+off)%96)<=3:return col
    return CREAM

def tree_of_life(x,y):
    xx,yy=x%192,y%192
    if 91<=xx<=101 and 78<=yy<=172:return BROWN
    branches=[(96,105,55,78),(96,118,137,83),(96,138,57,125),(96,142,138,128),(96,93,96,48)]
    for a,b,c,d in branches:
        if seg(xx,yy,a,b,c,d)<=3:return BROWN
    for cx,cy,col in ((51,74,GREEN),(140,78,GREEN),(50,123,DARK_GREEN),(143,124,GREEN),(96,42,DARK_GREEN)):
        if ellipse(xx,yy,cx,cy,18,11):return col
        v=flower(xx,yy,cx+8,cy-4,10,RED,5)
        if v:return v
    return CREAM

def moire(x,y):
    xx,yy=x%192,y%192
    phase=17*math.sin(2*math.pi*yy/96)+7*math.sin(2*math.pi*yy/37)
    v=(xx+phase)%24
    if v<3:return GRAY
    if 9<v<11:return PALE
    return CREAM

def yagasuri(x,y):
    xx,yy=x%96,y%96
    # elongated arrow feather V with central shaft
    for shift in (0,48):
        cy=24+shift
        if seg(xx,yy,18,cy-20,48,cy)<=4 or seg(xx,yy,78,cy-20,48,cy)<=4:return INDIGO
        if seg(xx,yy,18,cy+20,48,cy)<=4 or seg(xx,yy,78,cy+20,48,cy)<=4:return INDIGO
        if abs(xx-48)<=2 and cy-20<=yy<=cy+20:return INDIGO
    return WHITE

def sayagata(x,y):
    xx,yy=x%64,y%64; w=5
    segments=[(0,16,32,16),(32,16,32,0),(48,0,48,32),(48,32,64,32),(16,32,48,32),(16,32,16,64),(0,48,32,48),(32,48,32,64)]
    for a,b,c,d in segments:
        if seg(xx,yy,a,b,c,d)<=w/2:return INDIGO
    return CREAM

def uroko(x,y):
    xx,yy=x%64,y%56; h=28
    pts=[(0,h),(32,0),(64,h),(32,56),(0,h)]
    for (a,b),(c,d) in zip(pts,pts[1:]):
        if seg(xx,yy,a,b,c,d)<=3:return DARK_RED
    if seg(xx,yy,0,h,64,h)<=2:return DARK_RED
    return CREAM

def tatewaku(x,y):
    xx,yy=x%96,y%96
    amp=17; center=48; curve=amp*math.sin(2*math.pi*yy/96)
    if abs(xx-(center-20+curve))<=3 or abs(xx-(center+20-curve))<=3:return GOLD
    return CREAM

def kagome(x,y):
    p=48
    a=near_mod(x,0,3,p)
    b=near_mod(x*.5+y*.866,0,3,p)
    c=near_mod(x*.5-y*.866,0,3,p)
    return INDIGO if a or b or c else WHITE

def kanoko(x,y):
    xx,yy=x%64,y%64
    for cx,cy in ((16,16),(48,16),(32,48)):
        r=math.hypot(xx-cx,yy-cy)
        if 7<=r<=11:return WHITE
        if r<7:return INDIGO
    return INDIGO

def hanabishi(x,y):
    xx,yy=x%96,y%96; cx=cy=48
    # diamond outline
    if abs(abs(xx-cx)/34+abs(yy-cy)/26-1)<.08:return INDIGO
    for dx,dy,a in ((0,-13,0),(13,0,math.pi/2),(0,13,0),(-13,0,math.pi/2)):
        if ellipse(xx,yy,cx+dx,cy+dy,8,15,a):return RED
    return CREAM

def same_komon(x,y):
    xx,yy=x%64,y%64
    centers=((0,64),(32,64),(64,64),(16,32),(48,32))
    for cx,cy in centers:
        r=math.hypot(xx-cx,yy-cy)
        for rr in (11,17,23,29):
            if abs(r-rr)<=1.3:
                ang=(math.atan2(yy-cy,xx-cx)+2*math.pi)%(2*math.pi)
                if int(ang*rr/3)%3==0:return WHITE
    return INDIGO

def nami_chidori(x,y):
    xx,yy=x%192,y%192
    # waves
    for cx in range(-24,220,48):
        for rr in (18,25,32):
            if yy>=120 and ring(xx,yy,cx,145,rr,2):return BLUE
    # flying birds
    for bx,by in ((52,54),(132,83)):
        if seg(xx,yy,bx-15,by,bx,by-8)<=3 or seg(xx,yy,bx,by-8,bx+15,by)<=3:return BLACK
        if seg(xx,yy,bx-10,by+2,bx,by+8)<=2 or seg(xx,yy,bx,by+8,bx+10,by+2)<=2:return BLACK
    return CREAM

def tomoe(x,y):
    xx,yy=x%96,y%96; cx=cy=48
    for k in range(3):
        a=2*math.pi*k/3; px=cx+math.cos(a)*17; py=cy+math.sin(a)*17
        if (xx-px)**2+(yy-py)**2<=11**2:return DARK_RED
        tx=cx+math.cos(a+.9)*28; ty=cy+math.sin(a+.9)*28
        if seg(xx,yy,px,py,tx,ty)<=5:return DARK_RED
    if (xx-cx)**2+(yy-cy)**2<=5**2:return CREAM
    return CREAM

def shibori(x,y):
    xx,yy=x%192,y%192
    for cx,cy,r in ((32,35,18),(95,28,13),(154,52,22),(52,112,25),(126,121,17),(178,151,20),(83,172,15)):
        d=math.hypot(xx-cx,yy-cy)
        if r-4<=d<=r+4:return WHITE
        if d<r-7:return INDIGO
    if abs(yy-(96+18*math.sin(xx/19)))<=3:return WHITE
    return INDIGO

def batik(x,y):
    xx,yy=x%192,y%192
    if near_mod(xx+yy,0,3,64) or near_mod(xx-yy,0,3,64):return TAN
    for cx,cy in ((48,48),(144,48),(96,144)):
        v=flower(xx,yy,cx,cy,24,DARK_RED,6)
        if v:return v
        if ring(xx,yy,cx,cy,34,3):return BROWN
    return CREAM

def bandhani(x,y):
    xx,yy=x%96,y%96
    # tiny dots define a large diamond grid
    for gx in range(8,96,12):
        for gy in range(8,96,12):
            if ((gx+gy)//12)%2==0 and (xx-gx)**2+(yy-gy)**2<=3**2:return WHITE
    if abs(abs(xx-48)+abs(yy-48)-34)<=3:return WHITE
    return DARK_RED

def ajrakh(x,y):
    xx,yy=x%96,y%96; cx=cy=48
    if near_mod(xx+yy,0,4,48) or near_mod(xx-yy,0,4,48):return DARK_RED
    r=math.hypot(xx-cx,yy-cy)
    if 16<=r<=20:return GOLD
    for k in range(8):
        a=2*math.pi*k/8; px=cx+math.cos(a)*27; py=cy+math.sin(a)*27
        if (xx-px)**2+(yy-py)**2<=7**2:return RED
    return INDIGO

def kalamkari(x,y):
    xx,yy=x%192,y%192
    curve=96+38*math.sin(2*math.pi*(yy-10)/180)
    if abs(xx-curve)<=3:return BROWN
    for cx,cy,a in ((70,35,-.7),(118,70,.7),(68,112,-.8),(124,150,.8)):
        if ellipse(xx,yy,cx,cy,10,23,a):return GREEN
        v=flower(xx,yy,cx+(10 if a>0 else -10),cy-5,13,RED,5)
        if v:return v
    # paisley-like curl
    cx,cy=154,52; r=math.hypot(xx-cx,yy-cy); a=(math.atan2(yy-cy,xx-cx)+2*math.pi)%(2*math.pi)
    if abs(r-(6+3.1*a))<=2 and r<28:return DARK_RED
    return CREAM

FUN={
'baroque-scroll':baroque_scroll,'chinoiserie':chinoiserie,'flame-stitch':flame_stitch,'tree-of-life':tree_of_life,'moire':moire,
'yagasuri':yagasuri,'sayagata':sayagata,'uroko':uroko,'tatewaku':tatewaku,'kagome':kagome,'kanoko':kanoko,'hanabishi':hanabishi,
'same-komon':same_komon,'nami-chidori':nami_chidori,'tomoe':tomoe,'shibori':shibori,'batik':batik,'bandhani':bandhani,'ajrakh':ajrakh,'kalamkari':kalamkari}
for pid,fn in FUN.items():
    write_png(OUT/f'{pid}.png',fn)
    print(pid)
