#!/usr/bin/env python3
"""Wave 4 reference generator, structural review pass 3.
Runs pass 2 and replaces Kagome and Nami Chidori with stronger recognition geometry.
"""
from pathlib import Path
import runpy
BASE=Path(__file__).resolve().parent
ns=runpy.run_path(str(BASE/'generate-reference-images-wave4-v2.py'))
write_png=ns['write_png']; seg=ns['seg']; ring=ns['ring']; ellipse=ns['ellipse']
INDIGO=ns['INDIGO']; BLUE=ns['BLUE']; BLACK=ns['BLACK']; WHITE=ns['WHITE']; CREAM=ns['CREAM']; OUT=ns['OUT']

def kagome3(x,y):
    xx,yy=x%192,y%168
    # tightly connected staggered six-point units: overlapping triangle network
    for row,cy in enumerate((28,84,140)):
        off=32 if row%2 else 0
        for cx in range(-64+off,257,64):
            up=[(cx,cy-27),(cx-25,cy+14),(cx+25,cy+14)]
            dn=[(cx,cy+27),(cx-25,cy-14),(cx+25,cy-14)]
            for pts in (up,dn):
                for (a,b),(c,d) in zip(pts,pts[1:]+pts[:1]):
                    if seg(xx,yy,a,b,c,d)<=3:return INDIGO
    return WHITE

def nami_chidori3(x,y):
    xx,yy=x%192,y%192
    # two staggered rows of nested upper semicircle waves
    for row,(cy,off) in enumerate(((154,0),(112,24))):
        for cx in range(-48+off,241,48):
            if yy<=cy:
                for rr in (15,22,29):
                    if ring(xx,yy,cx,cy,rr,2):return BLUE
    # larger plover silhouettes with body
    for bx,by in ((52,45),(135,70)):
        if ellipse(xx,yy,bx,by+4,7,4):return BLACK
        if seg(xx,yy,bx-20,by+2,bx-5,by-9)<=3:return BLACK
        if seg(xx,yy,bx-5,by-9,bx,by+2)<=3:return BLACK
        if seg(xx,yy,bx,by+2,bx+7,by-9)<=3:return BLACK
        if seg(xx,yy,bx+7,by-9,bx+22,by+2)<=3:return BLACK
    return CREAM

write_png(OUT/'kagome.png',kagome3)
write_png(OUT/'nami-chidori.png',nami_chidori3)
print('refined kagome and nami-chidori pass 3')
