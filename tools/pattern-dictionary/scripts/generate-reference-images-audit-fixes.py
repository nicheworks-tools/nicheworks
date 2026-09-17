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
write_png=ns['write_png']; segdist=ns['segdist']
CREAM=ns['CREAM']; WHITE=ns['WHITE']; BLACK=ns['BLACK']; INDIGO=ns['INDIGO']; NAVY=ns['NAVY']
BURGUNDY=ns['BURGUNDY']; BROWN=ns['BROWN']; TAN=ns['TAN']; LIGHT_GRAY=ns['LIGHT_GRAY']; GRAY=ns['GRAY']
OUT=Path(__file__).resolve().parents[1]/'assets'/'reference'

RED=(160,50,48); DARK_RED=(104,34,36); GOLD=(198,153,55); BLUE=(58,95,151)


def near(v,target,width,period):
    d=abs((v-target+period/2)%period-period/2)
    return d<=width/2


def ellipse(x,y,cx,cy,rx,ry,a=0):
    ca,sa=math.cos(a),math.sin(a); dx,dy=x-cx,y-cy
    u=dx*ca+dy*sa; v=-dx*sa+dy*ca
    return (u/rx)**2+(v/ry)**2<=1


def shepherd_check(x,y):
    # Small balanced black/white shepherd-check cue: grouped light/dark yarns
    # with a fine broken-check/twill reading, not a large checkerboard.
    s=12
    ix=(x//s)%8; iy=(y//s)%8
    dark_x=ix<4; dark_y=iy<4
    if dark_x and dark_y:return BLACK
    if not dark_x and not dark_y:return WHITE
    return (90,90,90) if ((x+y)//6)%2==0 else (205,205,202)


def glen_check(x,y,overcheck=False):
    # Compound glen check: grouped fine checks with a larger framing grid.
    # Prince of Wales adds a contrasting large overcheck on top.
    p=192; xx=x%p; yy=y%p
    micro=8
    gx=(xx//micro)%12; gy=(yy//micro)%12
    # alternating 2/2 and 4/4 grouped regions create the compound small-check field
    a=(gx<2 or 6<=gx<10); b=(gy<2 or 6<=gy<10)
    if a and b: base=(54,54,56)
    elif a or b: base=(154,155,155)
    else: base=(232,232,228)
    # stronger glen framing lines
    if xx<4 or yy<4 or 92<=xx<96 or 92<=yy<96: base=(82,82,84)
    if overcheck and (near(xx,48,6,p) or near(yy,48,6,p)):
        return BURGUNDY
    return base


def gun_club(x,y):
    # Multi-tone small check built from a shepherd-check-like base. Earthy brown,
    # black and cream crossings stay fine-grained, matching the district-check cue.
    s=10; ix=(x//s)%12; iy=(y//s)%12
    vx = 0 if ix<4 else (1 if ix<8 else 2)
    vy = 0 if iy<4 else (1 if iy<8 else 2)
    cols=[CREAM,BROWN,BLACK]
    if vx==vy:return cols[vx]
    c1,c2=cols[vx],cols[vy]
    t=.50 if ((x+y)//5)%2 else .32
    return tuple(int(c1[i]*(1-t)+c2[i]*t) for i in range(3))


def herringbone(x,y):
    # Herringbone as reversing diagonal twill columns: adjacent columns reverse
    # direction and meet as continuous V bands, with no central "fish spine" icon.
    col=48; c=(x//col)%2; xx=x%col
    v=(y + (xx if c==0 else -xx))%24
    if v<6:return BROWN
    if 6<=v<11:return TAN
    return CREAM


def kagome(x,y):
    # Basket-weave cue: three strip families at 0/+60/-60 degrees. Double edges
    # produce a woven-strip reading instead of isolated six-point star outlines.
    rt3=math.sqrt(3)
    coords=(y, .5*y+rt3*.5*x, .5*y-rt3*.5*x)
    for v in coords:
        m=(v%48)
        if 7<=m<=12 or 36<=m<=41:return INDIGO
    return WHITE


def same_komon(x,y):
    # Same-komon/sharkskin cue: extremely fine white dots laid along nested
    # semicircular arcs on an indigo ground.
    xx=x%96; yy=y%72
    for cx,cy in ((0,72),(48,72),(96,72)):
        r=math.hypot(xx-cx,yy-cy)
        for rr in (14,20,26,32,38,44,50,56,62):
            if abs(r-rr)<=1.5:
                a=(math.atan2(yy-cy,xx-cx)+2*math.pi)%(2*math.pi)
                if int(a*rr/3.7)%2==0:return WHITE
    return INDIGO


def tomoe(x,y):
    # Three comma-shaped tomoe around a common center. Each unit has a round head
    # and a curved tapering tail, not three detached dots or straight tails.
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


def fleur_de_lis(x,y):
    xx=x%96; yy=y%96; cx=48
    # Bold heraldic three-petal silhouette with central spear, side petals,
    # waist band and lower flared base.
    if ellipse(xx,yy,cx,34,10,25): return GOLD
    if ellipse(xx,yy,30,43,11,27,-.62): return GOLD
    if ellipse(xx,yy,66,43,11,27,.62): return GOLD
    if 25<=xx<=71 and 54<=yy<=65:return GOLD
    if 42<=xx<=54 and 60<=yy<=82:return GOLD
    if ellipse(xx,yy,34,68,15,9,-.25):return GOLD
    if ellipse(xx,yy,62,68,15,9,.25):return GOLD
    # small cuts between petals keep the silhouette legible at thumbnail size
    if ellipse(xx,yy,39,41,4,14,-.25):return CREAM
    if ellipse(xx,yy,57,41,4,14,.25):return CREAM
    return CREAM


def marbling(x,y):
    # Irregular fluid veins with several interacting sinusoidal flows. This avoids
    # the previous near-parallel stripe reading.
    xx=x%192; yy=y%192
    flows=[]
    for k,(amp,freq,phase) in enumerate(((26,29,0),(17,17,1.3),(10,9,2.2))):
        u=xx + amp*math.sin((yy+phase*31)/freq) + 7*math.sin((xx+yy)/(13+k*4))
        flows.append(u)
    z=(flows[0]+.42*flows[1]+.18*flows[2])%88
    if z<8:return NAVY
    if z<15:return WHITE
    if z<31:return BLUE
    if z<38:return CREAM
    if z<52:return DARK_RED
    if z<61:return GOLD
    if z<70:return CREAM
    return (110,78,64)


def giraffe(x,y):
    # Irregular polygonal dark patches separated by light channels using a small
    # deterministic Voronoi field rather than round spots.
    xx=x%192; yy=y%192; pts=[]
    seeds=[(18,18),(65,11),(118,25),(170,13),(35,61),(88,70),(148,64),(184,86),(15,119),(66,119),(122,128),(171,132),(36,173),(93,171),(149,180)]
    for i,(cx,cy) in enumerate(seeds):
        d=(xx-cx)**2+(yy-cy)**2; pts.append((d,i))
    pts.sort(); d1,i1=pts[0]; d2,_=pts[1]
    if math.sqrt(d2)-math.sqrt(d1)<6:return CREAM
    return BROWN if i1%4 else TAN


def zebra(x,y):
    xx=x%192; yy=y%192
    # Tapered, irregular vertical/diagonal stripes with forks and varying width.
    for i,base in enumerate((8,43,81,121,160,196)):
        center=base+18*math.sin((yy+i*19)/31)+7*math.sin((yy+i*11)/9)
        taper=.55+.45*abs(math.sin((yy+i*17)/43))
        width=(7+(i%3)*3)*taper
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
    'giraffe-print':giraffe,
    'zebra-print':zebra,
}

if __name__=='__main__':
    for pid,fn in FUN.items():
        write_png(pid,fn)
        print('audit-corrected',pid)
