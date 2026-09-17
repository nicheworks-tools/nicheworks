#!/usr/bin/env python3
"""Second visual-audit refinement for Same Komon and Fleur-de-lis."""
from pathlib import Path
import math, runpy

BASE=Path(__file__).resolve().parent
ns=runpy.run_path(str(BASE/'generate-reference-images-audit-fixes.py'))
write_png=ns['write_png']; INDIGO=ns['INDIGO']; WHITE=ns['WHITE']; CREAM=ns['CREAM']; GOLD=ns['GOLD']; OUT=ns['OUT']


def point_in_poly(x,y,pts):
    inside=False; j=len(pts)-1
    for i,(xi,yi) in enumerate(pts):
        xj,yj=pts[j]
        if ((yi>y)!=(yj>y)) and x < (xj-xi)*(y-yi)/(yj-yi+1e-9)+xi:
            inside=not inside
        j=i
    return inside


def same_komon(x,y):
    # Same-komon/sharkskin recognition cue: tiny discrete white dots arranged
    # in dense, staggered nested semicircular fans on an indigo ground.
    xx=x%96; yy=y%96
    for row,cy in enumerate((32,64,96,128)):
        off=24 if row%2 else 0
        for cx in range(-48+off,145,48):
            if yy<=cy:
                r=math.hypot(xx-cx,yy-cy)
                for rr in (8,13,18,23,28):
                    if abs(r-rr)<=.9:
                        a=(math.atan2(yy-cy,xx-cx)+math.pi)
                        if int(a*rr/2.1)%4==0:return WHITE
    return INDIGO


CENTER=[(48,6),(58,34),(55,47),(48,57),(41,47),(38,34)]
LEFT=[(44,55),(38,43),(28,31),(14,24),(17,39),(27,51),(40,61)]
RIGHT=[(52,55),(58,43),(68,31),(82,24),(79,39),(69,51),(56,61)]
BAND=[(25,56),(71,56),(71,66),(25,66)]
LOWER_LEFT=[(43,63),(42,77),(27,84),(36,88),(48,80)]
LOWER_RIGHT=[(53,63),(54,77),(69,84),(60,88),(48,80)]
BOTTOM=[(43,76),(53,76),(53,83),(48,92),(43,83)]
def fleur_de_lis(x,y):
    xx=x%96; yy=y%96
    shapes=(CENTER,LEFT,RIGHT,BAND,LOWER_LEFT,LOWER_RIGHT,BOTTOM)
    return GOLD if any(point_in_poly(xx,yy,p) for p in shapes) else CREAM

write_png('same-komon',same_komon)
write_png('fleur-de-lis',fleur_de_lis)
print('audit-v2 same-komon fleur-de-lis')
