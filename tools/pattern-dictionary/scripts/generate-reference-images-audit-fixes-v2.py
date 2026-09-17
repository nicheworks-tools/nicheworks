#!/usr/bin/env python3
"""Second visual-audit refinement for Same Komon and Fleur-de-lis."""
from pathlib import Path
import math, runpy

BASE=Path(__file__).resolve().parent
ns=runpy.run_path(str(BASE/'generate-reference-images-audit-fixes.py'))
write_png=ns['write_png']; INDIGO=ns['INDIGO']; WHITE=ns['WHITE']; CREAM=ns['CREAM']; GOLD=ns['GOLD']; OUT=ns['OUT']


def ellipse(x,y,cx,cy,rx,ry,a=0):
    ca,sa=math.cos(a),math.sin(a); dx,dy=x-cx,y-cy
    u=dx*ca+dy*sa; v=-dx*sa+dy*ca
    return (u/rx)**2+(v/ry)**2<=1


def same_komon(x,y):
    # Same-komon recognition reference: extremely fine dots arranged in repeated
    # nested semicircular sharkskin fans. Stagger the fan rows so no horizontal
    # solid band forms at browse scale.
    xx=x%96; yy=y%96
    for row,cy in enumerate((24,72,120)):
        off=24 if row%2 else 0
        for cx in range(-48+off,145,48):
            if yy<=cy:
                dx=xx-cx; dy=yy-cy; r=math.hypot(dx,dy)
                for rr in (9,14,19,24,29):
                    if abs(r-rr)<=1.0:
                        a=math.atan2(dy,dx)
                        # discrete dots along each arc, not continuous lines
                        if int((a+math.pi)*rr/2.8)%3==0:
                            return WHITE
    return INDIGO


def fleur_de_lis(x,y):
    xx=x%96; yy=y%96; cx=48
    # Bold heraldic lily silhouette: tall central spear, two outward-curving
    # lateral petals, narrow waist, horizontal tie and a flared lower base.
    # Central spear/petal
    if yy>=8 and yy<=57:
        half=max(5,18-(yy-8)*0.22)
        if abs(xx-cx)<=half and yy>=8+abs(xx-cx)*1.5:return GOLD
    # Rounded lateral petals that flare outward and return toward the waist
    if ellipse(xx,yy,29,39,13,24,-.62):return GOLD
    if ellipse(xx,yy,67,39,13,24,.62):return GOLD
    # carve inner notches between center and side petals
    if ellipse(xx,yy,39,39,5,16,-.25):return CREAM
    if ellipse(xx,yy,57,39,5,16,.25):return CREAM
    # Tie/band and lower stem
    if 23<=xx<=73 and 55<=yy<=65:return GOLD
    if 42<=xx<=54 and 61<=yy<=82:return GOLD
    # Lower flared lobes
    if ellipse(xx,yy,34,70,15,9,-.25):return GOLD
    if ellipse(xx,yy,62,70,15,9,.25):return GOLD
    # Bottom point
    if 72<=yy<=89 and abs(xx-cx)<=max(2,10-(yy-72)*.45):return GOLD
    return CREAM

write_png('same-komon',same_komon)
write_png('fleur-de-lis',fleur_de_lis)
print('audit-v2 same-komon fleur-de-lis')
