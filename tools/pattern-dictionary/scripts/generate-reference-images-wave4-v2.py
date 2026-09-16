#!/usr/bin/env python3
"""Wave 4 reference image generator, review pass 2.
Runs the base deterministic generator, then replaces nine weak-recognition tiles.
"""
from pathlib import Path
import math, runpy
BASE=Path(__file__).resolve().parent
ns=runpy.run_path(str(BASE/'generate-reference-images-wave4.py'))
write_png=ns['write_png']; seg=ns['seg']; ring=ns['ring']; ellipse=ns['ellipse']; flower=ns['flower']; near_mod=ns['near_mod']
CREAM=ns['CREAM']; WHITE=ns['WHITE']; BLACK=ns['BLACK']; NAVY=ns['NAVY']; INDIGO=ns['INDIGO']; BLUE=ns['BLUE']; RED=ns['RED']; DARK_RED=ns['DARK_RED']; GOLD=ns['GOLD']; GREEN=ns['GREEN']; DARK_GREEN=ns['DARK_GREEN']; TAN=ns['TAN']; BROWN=ns['BROWN']; GRAY=ns['GRAY']; PALE=ns['PALE']; PINK=ns['PINK']; ORANGE=ns['ORANGE']; OUT=ns['OUT']

def chinoiserie2(x,y):
    xx,yy=x%192,y%192
    # larger two-tier pavilion
    if 116<=xx<=174 and 118<=yy<=166 and (xx<=121 or xx>=169 or yy>=161):return BLUE
    if seg(xx,yy,106,118,145,92)<=4 or seg(xx,yy,145,92,183,118)<=4:return BLUE
    if seg(xx,yy,119,101,145,82)<=3 or seg(xx,yy,145,82,171,101)<=3:return BLUE
    if 141<=xx<=149 and 133<=yy<=166:return BLUE
    # strong flowering branch
    for a,b,c,d in ((12,177,48,142),(48,142,74,92),(74,92,92,42),(48,142,25,105)):
        if seg(xx,yy,a,b,c,d)<=4:return DARK_GREEN
    for cx,cy,col in ((27,105,RED),(52,137,PINK),(76,88,RED),(94,43,PINK)):
        v=flower(xx,yy,cx,cy,14,col,5)
        if v:return v
    # two clearly visible birds
    for bx,by in ((72,52),(112,63)):
        if seg(xx,yy,bx-14,by,bx,by-9)<=3 or seg(xx,yy,bx,by-9,bx+14,by)<=3:return BLACK
    return CREAM

def flame2(x,y):
    xx,yy=x%192,y%192
    step=(xx//16)%12
    profile=[60,48,36,24,12,0,12,24,36,48,60,72][step]
    for base,col,w in ((18,RED,8),(34,ORANGE,8),(50,GOLD,8),(66,NAVY,8)):
        for rep in (-96,0,96,192):
            if abs(yy-(base+profile+rep))<=w/2:return col
    return CREAM

def tree2(x,y):
    xx,yy=x%192,y%192
    # broad trunk and branches, one complete tree per tile
    if 88<=xx<=104 and 88<=yy<=181:return BROWN
    branches=[(96,112,52,78),(96,118,140,76),(96,94,70,54),(96,94,122,52),(96,138,48,119),(96,139,146,117)]
    for a,b,c,d in branches:
        if seg(xx,yy,a,b,c,d)<=5:return BROWN
    leafs=((45,72,22,14,-.5),(68,49,21,13,.4),(121,47,21,13,-.4),(145,73,22,14,.5),(42,116,18,12,-.8),(150,114,18,12,.8),(96,33,22,14,0))
    for cx,cy,rx,ry,a in leafs:
        if ellipse(xx,yy,cx,cy,rx,ry,a):return GREEN
    for cx,cy,col in ((54,70,RED),(78,45,PINK),(114,43,RED),(138,70,GOLD),(96,29,PINK)):
        v=flower(xx,yy,cx,cy,11,col,5)
        if v:return v
    return CREAM

def moire2(x,y):
    xx,yy=x%192,y%192
    for k in range(-4,22):
        y1=k*12+10*math.sin(xx/17+k*.35)
        y2=k*12+10*math.sin(xx/20+k*.48)+4
        if abs(yy-y1)<=1.8:return GRAY
        if abs(yy-y2)<=1.4:return PALE
    return CREAM

def yagasuri2(x,y):
    xx,yy=x%96,y%96
    # separate downward arrow-feather units, avoiding X reading
    for cy in (20,68):
        if seg(xx,yy,16,cy-13,48,cy+17)<=5:return INDIGO
        if seg(xx,yy,80,cy-13,48,cy+17)<=5:return INDIGO
        if 45<=xx<=51 and cy+15<=yy<=cy+33:return INDIGO
        # feather notches
        if seg(xx,yy,27,cy-3,40,cy+9)<=2:return WHITE
        if seg(xx,yy,69,cy-3,56,cy+9)<=2:return WHITE
    return WHITE

def uroko2(x,y):
    xx,yy=x%64,y%56
    # true triangular lattice: horizontal + two diagonal families
    if near_mod(yy,0,3,56):return DARK_RED
    if near_mod(xx-(yy*32/56),0,3,64):return DARK_RED
    if near_mod(xx+(yy*32/56),0,3,64):return DARK_RED
    return CREAM

def kagome2(x,y):
    xx,yy=x%192,y%168
    # repeated six-point basket-eye stars, offset by row
    centers=[]
    for row,cy in enumerate((42,126)):
        off=48 if row%2 else 0
        for cx in (-48+off,48+off,144+off,240+off):centers.append((cx,cy))
    for cx,cy in centers:
        up=[(cx,cy-31),(cx-27,cy+16),(cx+27,cy+16)]
        dn=[(cx,cy+31),(cx-27,cy-16),(cx+27,cy-16)]
        for pts in (up,dn):
            for (a,b),(c,d) in zip(pts,pts[1:]+pts[:1]):
                if seg(xx,yy,a,b,c,d)<=3:return INDIGO
    return WHITE

def tomoe2(x,y):
    xx,yy=x%96,y%96; cx=cy=48
    for k in range(3):
        a=2*math.pi*k/3-.2; px=cx+math.cos(a)*20; py=cy+math.sin(a)*20
        if (xx-px)**2+(yy-py)**2<=13**2:return DARK_RED
        # broad tapering tail swept toward next quadrant
        for t in range(1,8):
            ta=a+.18*t; rad=20+3*t; tx=cx+math.cos(ta)*rad; ty=cy+math.sin(ta)*rad
            if (xx-tx)**2+(yy-ty)**2<=max(2,8-t)**2:return DARK_RED
    if (xx-cx)**2+(yy-cy)**2<=8**2:return CREAM
    return CREAM

def kalamkari2(x,y):
    xx,yy=x%192,y%192
    # hand-drawn vine with large floral and paisley forms
    curve=85+44*math.sin(2*math.pi*(yy-5)/185)
    if abs(xx-curve)<=4:return BROWN
    for cx,cy,a,col in ((50,38,-.7,RED),(124,78,.7,PINK),(55,128,-.8,RED),(132,166,.8,GOLD)):
        if ellipse(xx,yy,cx,cy,12,27,a):return GREEN
        v=flower(xx,yy,cx+(13 if a>0 else -13),cy-6,17,col,6)
        if v:return v
    for cx,cy,flip in ((151,38,1),(34,169,-1)):
        # large paisley: bulb plus curling neck
        if ellipse(xx,yy,cx,cy,18,28,.35*flip):return CREAM if ellipse(xx,yy,cx+4*flip,cy,10,18,.35*flip) else DARK_RED
        rr=math.hypot(xx-(cx+12*flip),yy-(cy-20)); aa=(math.atan2(yy-(cy-20),xx-(cx+12*flip))+2*math.pi)%(2*math.pi)
        if abs(rr-(4+2.2*aa))<=2 and rr<22:return DARK_RED
    return CREAM

for pid,fn in {'chinoiserie':chinoiserie2,'flame-stitch':flame2,'tree-of-life':tree2,'moire':moire2,'yagasuri':yagasuri2,'uroko':uroko2,'kagome':kagome2,'tomoe':tomoe2,'kalamkari':kalamkari2}.items():
    write_png(OUT/f'{pid}.png',fn)
    print('refined',pid)
