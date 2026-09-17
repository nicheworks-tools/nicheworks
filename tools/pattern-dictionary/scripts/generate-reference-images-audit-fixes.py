#!/usr/bin/env python3
"""Reference-image corrections found by the 2026-09-17 canonical-100 audit.

This pass only overrides images whose existing deterministic render materially
misstates the recognition structure. Broad technique/tradition entries remain
representative references, not claims of one universal canonical repeat.
"""
from pathlib import Path
import math, runpy

BASE=Path(__file__).resolve().parent
ns=runpy.run_path(str(BASE/'generate-reference-images-wave2.py'))
write_png=ns['write_png']
CREAM=ns['CREAM']; WHITE=ns['WHITE']; BLACK=ns['BLACK']; INDIGO=ns['INDIGO']; NAVY=ns['NAVY']
BURGUNDY=ns['BURGUNDY']; BROWN=ns['BROWN']; TAN=ns['TAN']
OUT=Path(__file__).resolve().parents[1]/'assets'/'reference'
DARK_RED=(104,34,36); GOLD=(198,153,55); BLUE=(58,95,151)


def near(v,target,width,period):
    return abs((v-target+period/2)%period-period/2)<=width/2


def dist(px,py,ax,ay,bx,by):
    vx,vy=bx-ax,by-ay; wx,wy=px-ax,py-ay; vv=vx*vx+vy*vy
    t=0 if vv==0 else max(0,min(1,(wx*vx+wy*vy)/vv))
    return math.hypot(px-(ax+t*vx),py-(ay+t*vy))


def point_in_poly(x,y,pts):
    inside=False; j=len(pts)-1
    for i,(xi,yi) in enumerate(pts):
        xj,yj=pts[j]
        if ((yi>y)!=(yj>y)) and x < (xj-xi)*(y-yi)/(yj-yi+1e-9)+xi:
            inside=not inside
        j=i
    return inside


def shepherd_check(x,y):
    s=8; ix=(x//s)%8; iy=(y//s)%8
    dark_x=ix<4; dark_y=iy<4
    if dark_x and dark_y:return BLACK
    if not dark_x and not dark_y:return WHITE
    return (92,92,92) if ((x+y)//4)%2==0 else (205,205,202)


def glen_check(x,y,overcheck=False):
    # Compound glen check: fine grouped checks plus stronger large framing.
    p=96; xx=x%p; yy=y%p
    ix=(xx//4)%12; iy=(yy//4)%12
    darkx=ix in (0,1,4,5,6,7); darky=iy in (0,1,4,5,6,7)
    if darkx and darky: val=45 if ((x+y)//4)%2==0 else 90
    elif darkx or darky: val=145 if ((x-y)//4)%2==0 else 188
    else: val=238
    if xx<2 or yy<2 or 46<=xx<48 or 46<=yy<48: val=min(val,100)
    if overcheck and (near(xx,24,4,p) or near(yy,24,4,p)):return BURGUNDY
    return (val,val,val)


def gun_club(x,y):
    # Fine multi-tone district check using cream/brown/black grouped yarns.
    def yarn(v):
        q=v%48
        if q<12:return CREAM
        if q<24:return BROWN
        if q<36:return (226,216,195)
        return BLACK
    a,b=yarn(x),yarn(y)
    top,other=(a,b) if ((x//4+y//4)%2==0) else (b,a)
    return tuple(int(top[i]*.68+other[i]*.32) for i in range(3))


def herringbone(x,y):
    # Reversing diagonal twill columns that meet as continuous V bands.
    col=48; c=(x//col)%2; xx=x%col
    v=(y+(xx if c==0 else -xx))%24
    if v<6:return BROWN
    if v<11:return TAN
    return CREAM


def kagome(x,y):
    # Three fine strip-edge families at 0/+60/-60 degrees give basket-eye geometry.
    rt3=math.sqrt(3)
    for v in (y,.5*y+rt3*.5*x,.5*y-rt3*.5*x):
        m=v%56
        if 9<=m<=11 or 45<=m<=47:return INDIGO
    return WHITE


def same_komon(x,y):
    # Fine dotted nested arcs, producing the sharkskin/same-komon recognition cue.
    xx=x%96; yy=y%96
    for cx,cy in ((0,96),(48,96),(96,96),(24,48),(72,48)):
        r=math.hypot(xx-cx,yy-cy)
        for rr in range(8,50,6):
            if abs(r-rr)<=1.15:
                a=(math.atan2(yy-cy,xx-cx)+2*math.pi)%(2*math.pi)
                if int(a*rr/2.7)%3==0:return WHITE
    return INDIGO


def tomoe(x,y):
    # Three comma-shaped tomoe with round heads and curved tapering tails.
    xx=x%96; yy=y%96; cx=cy=48
    for k in range(3):
        a0=2*math.pi*k/3-.25
        hx=cx+math.cos(a0)*18; hy=cy+math.sin(a0)*18
        if (xx-hx)**2+(yy-hy)**2<=12**2:return DARK_RED
        for j in range(1,13):
            t=j/12; a=a0+1.25*t; r=18+21*t
            tx=cx+math.cos(a)*r; ty=cy+math.sin(a)*r
            rad=max(2.0,8.5*(1-t))
            if (xx-tx)**2+(yy-ty)**2<=rad**2:return DARK_RED
    return CREAM


FLEUR_CENTER=[(48,8),(59,35),(55,52),(48,60),(41,52),(37,35)]
FLEUR_LEFT=[(42,54),(31,35),(15,27),(18,41),(29,53),(39,60)]
FLEUR_RIGHT=[(54,54),(65,35),(81,27),(78,41),(67,53),(57,60)]
FLEUR_BAND=[(24,56),(72,56),(72,66),(24,66)]
FLEUR_STEM=[(42,63),(54,63),(54,79),(66,85),(66,89),(48,82),(30,89),(30,85),(42,79)]
def fleur_de_lis(x,y):
    xx=x%96; yy=y%96
    return GOLD if any(point_in_poly(xx,yy,p) for p in (FLEUR_CENTER,FLEUR_LEFT,FLEUR_RIGHT,FLEUR_BAND,FLEUR_STEM)) else CREAM


def marbling(x,y):
    # Multi-vortex coordinate warp creates irregular fluid veins and curls rather
    # than the previous near-parallel wave bands.
    u,v=x%192,y%192
    for cx,cy,strength in ((62,62,18),(138,118,-15),(88,158,10)):
        dx,dy=u-cx,v-cy; r2=dx*dx+dy*dy+300; ang=strength/r2*100
        ca,sa=math.cos(ang),math.sin(ang)
        u,v=cx+dx*ca-dy*sa,cy+dx*sa+dy*ca
    f=math.sin(u/13+1.3*math.sin(v/21))+.75*math.sin(v/17+1.1*math.sin(u/29))+.45*math.sin((u+v)/9)
    if f>1.15:return NAVY
    if f>.65:return BLUE
    if f>.22:return CREAM
    if f>-.18:return GOLD
    if f>-.65:return DARK_RED
    if f>-1.1:return (117,83,67)
    return WHITE


def sayagata(x,y):
    # Interlocking manji/key-fret units rendered on a 45-degree lattice.
    rt2=math.sqrt(2); u=((x+y)/rt2)%64; v=((y-x)/rt2)%64
    segs=((32,8,32,56),(8,32,56,32),(32,8,56,8),(56,8,56,20),
          (56,32,56,56),(56,56,44,56),(32,56,8,56),(8,56,8,44),
          (8,32,8,8),(8,8,20,8))
    return DARK_RED if any(dist(u,v,*s)<=2.5 for s in segs) else WHITE


def giraffe(x,y):
    # Irregular polygonal patches separated by pale channels.
    xx=x%192; yy=y%192; pts=[]
    seeds=((18,18),(65,11),(118,25),(170,13),(35,61),(88,70),(148,64),(184,86),
           (15,119),(66,119),(122,128),(171,132),(36,173),(93,171),(149,180))
    for i,(cx,cy) in enumerate(seeds):pts.append(((xx-cx)**2+(yy-cy)**2,i))
    pts.sort(); d1,i1=pts[0]; d2,_=pts[1]
    if math.sqrt(d2)-math.sqrt(d1)<6:return CREAM
    return BROWN if i1%4 else TAN


def zebra(x,y):
    xx=x%192; yy=y%192
    for i,base in enumerate((8,43,81,121,160,196)):
        center=base+18*math.sin((yy+i*19)/31)+7*math.sin((yy+i*11)/9)
        taper=.55+.45*abs(math.sin((yy+i*17)/43)); width=(7+(i%3)*3)*taper
        if abs(xx-center)<width:return BLACK
        if i%2==0 and 52<yy%96<76:
            branch=center+14*(yy%96-52)/24
            if abs(xx-branch)<max(2,width*.55):return BLACK
    return WHITE

FUN={
    'shepherd-check':shepherd_check,
    'glen-check':lambda x,y:glen_check(x,y,False),
    'prince-of-wales-check':lambda x,y:glen_check(x,y,True),
    'gun-club-check':gun_club,
    'herringbone':herringbone,
    'kagome':kagome,
    'same-komon':same_komon,
    'tomoe':tomoe,
    'fleur-de-lis':fleur_de_lis,
    'marbling':marbling,
    'sayagata':sayagata,
    'giraffe-print':giraffe,
    'zebra-print':zebra,
}

if __name__=='__main__':
    for pid,fn in FUN.items():
        write_png(pid,fn)
        print('audit-corrected',pid)
