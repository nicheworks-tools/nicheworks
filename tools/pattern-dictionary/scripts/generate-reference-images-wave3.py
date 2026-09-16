#!/usr/bin/env python3
"""Generate deterministic 1536px recognition-reference PNGs for Pattern Dictionary Wave 3.

Qualified terms are rendered as representative recognition references only. They are
not claims that a broad curve family, weave, textile tradition, floral style, botanical
family, or ivy motif has one universal canonical repeat.
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

WHITE=(248,248,244); CREAM=(244,237,219); BLACK=(28,29,31); NAVY=(32,50,79)
BLUE=(48,92,150); INDIGO=(35,60,105); GREEN=(47,105,72); DARK_GREEN=(29,79,52)
TEAL=(47,123,125); GOLD=(198,154,58); TAN=(194,160,113); BROWN=(111,76,48)
RED=(166,54,59); BURGUNDY=(112,44,61); PINK=(201,102,126); YELLOW=(222,181,55)
PALE_GREEN=(165,191,145); GRAY=(112,116,118)

def chunk(kind,data):
    return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)

def write_png(path,fn):
    tile=[[fn(x,y) for x in range(TILE)] for y in range(TILE)]
    rows=[bytes(c for rgb in row for c in rgb) for row in tile]
    raw=bytearray()
    for y in range(SIZE):
        raw.append(0)
        raw.extend(rows[y%TILE]*REPEATS)
    png=(b'\x89PNG\r\n\x1a\n'
         +chunk(b'IHDR',struct.pack('>IIBBBBB',SIZE,SIZE,8,2,0,0,0))
         +chunk(b'IDAT',zlib.compress(bytes(raw),9))
         +chunk(b'IEND',b''))
    path.write_bytes(png)

def near(v,target,width,period=TILE):
    d=abs((v-target+period/2)%period-period/2)
    return d<=width/2

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

def ring_ellipse(x,y,cx,cy,rx,ry,w=3,a=0):
    dx,dy=x-cx,y-cy
    ca,sa=math.cos(a),math.sin(a)
    u=dx*ca+dy*sa
    v=-dx*sa+dy*ca
    q=(u/rx)**2+(v/ry)**2
    inner=(u/max(1,rx-w))**2+(v/max(1,ry-w))**2
    return q<=1 and inner>=1

def flower(x,y,cx,cy,r=13,color=RED,petals=5):
    dx,dy=x-cx,y-cy
    if dx*dx+dy*dy <= (r*.28)**2:return GOLD
    a=math.atan2(dy,dx)
    rr=math.hypot(dx,dy)
    for k in range(petals):
        ang=2*math.pi*k/petals
        px=cx+math.cos(ang)*r*.62; py=cy+math.sin(ang)*r*.62
        if (x-px)**2+(y-py)**2 <= (r*.45)**2:return color
    return None

def leaf(x,y,cx,cy,rx=10,ry=20,a=0,color=GREEN):
    return color if rot_ellipse(x,y,cx,cy,rx,ry,a) else None

def greek_key(x,y):
    p=96; xx=x%p; yy=y%p; w=7
    segments=[(0,18,72,18),(72,18,72,72),(72,72,24,72),(24,72,24,42),(24,42,54,42)]
    for ax,ay,bx,by in segments:
        if dist_segment(xx,yy,ax,ay,bx,by)<=w/2:return BLACK
    if dist_segment(xx,yy,0,18,0,96)<=w/2:return BLACK
    return WHITE

def quatrefoil(x,y):
    xx=x%96; yy=y%96; cx=cy=48
    for dx,dy in ((0,-19),(19,0),(0,19),(-19,0)):
        if ring_ellipse(xx,yy,cx+dx,cy+dy,22,22,5):return GREEN
    return CREAM

def ogee(x,y):
    xx=x%96; yy=y%96
    t=yy/96*math.pi
    half=15+22*math.sin(t)
    for cx in (0,96):
        if abs(abs(xx-cx)-half)<=3.2:return NAVY
    if abs(abs(xx-48)-(15+22*math.sin((yy+48)%96/96*math.pi)))<=3.2:return NAVY
    return CREAM

def lattice(x,y):
    p=72
    if near(x+y,0,5,p) or near(x-y,0,5,p):return BLACK
    return WHITE

def honeycomb(x,y):
    side=32
    h=28
    for col in range(-2,7):
        cx=col*48
        yoff=h if col%2 else 0
        for row in range(-2,6):
            cy=row*(2*h)+yoff
            pts=[(cx-side,cy),(cx-side//2,cy-h),(cx+side//2,cy-h),(cx+side,cy),
                 (cx+side//2,cy+h),(cx-side//2,cy+h)]
            for (ax,ay),(bx,by) in zip(pts,pts[1:]+pts[:1]):
                if dist_segment(x,y,ax,ay,bx,by)<=3:return GOLD
    return CREAM

def scallop(x,y):
    for row in range(-1,5):
        cy=row*48+24
        shift=24 if row%2 else 0
        for col in range(-2,7):
            cx=col*48+shift
            dx=x-cx; dy=y-cy
            r=24
            if dy>=-2 and abs(math.hypot(dx,dy)-r)<=3:return TEAL
    return CREAM

def basketweave(x,y):
    s=48; gx=(x//s)%2; gy=(y//s)%2
    lx=x%s; ly=y%s
    if (gx+gy)%2==0:
        if ly in range(9,39):
            return TAN if (ly//7)%2==0 else BROWN
        return CREAM
    else:
        if lx in range(9,39):
            return TAN if (lx//7)%2==0 else BROWN
        return CREAM

def hexagon(x,y):
    for row in range(-1,5):
        cy=row*72+36
        shift=40 if row%2 else 0
        for col in range(-2,5):
            cx=col*80+shift
            pts=[(cx-24,cy),(cx-12,cy-21),(cx+12,cy-21),(cx+24,cy),(cx+12,cy+21),(cx-12,cy+21)]
            for (ax,ay),(bx,by) in zip(pts,pts[1:]+pts[:1]):
                if dist_segment(x,y,ax,ay,bx,by)<=3:return BLACK
    return WHITE

def trellis(x,y):
    p=96
    d1=abs((x+y+48)%p-48)
    d2=abs((x-y+48)%p-48)
    if d1<=7 or d2<=7:return BLUE
    for cx in range(-96,289,96):
        for cy in range(-96,289,96):
            if (x-cx)**2+(y-cy)**2<=9**2:return BLUE
    return WHITE

def hishi(x,y):
    xx=x%96; yy=y%96
    dx=abs(xx-48); dy=abs(yy-48)
    q=dx/38+dy/28
    q2=dx/23+dy/15
    if abs(q-1)<=0.08 or abs(q2-1)<=0.12:return INDIGO
    if near(x+y,0,3,96) or near(x-y,0,3,96):return INDIGO
    return WHITE

def fleur_de_lis(x,y):
    xx=x%96; yy=y%96; cx=48
    if 12<=yy<=56 and abs(xx-cx) <= max(4, 15-(yy-12)*0.22):return GOLD
    if rot_ellipse(xx,yy,31,43,11,25,-0.62):return GOLD
    if rot_ellipse(xx,yy,65,43,11,25,0.62):return GOLD
    if rot_ellipse(xx,yy,40,43,5,16,-0.25):return CREAM
    if rot_ellipse(xx,yy,56,43,5,16,0.25):return CREAM
    if 27<=xx<=69 and 58<=yy<=67:return NAVY
    if 43<=xx<=53 and 64<=yy<=82:return NAVY
    if rot_ellipse(xx,yy,33,61,13,8,-0.25):return GOLD
    if rot_ellipse(xx,yy,63,61,13,8,0.25):return GOLD
    return CREAM

def toile_de_jouy(x,y):
    xx=x%192; yy=y%192
    if 143<=yy<=146:return BLUE
    if 31<=xx<=35 and 88<=yy<=143:return BLUE
    for cx,cy,rx,ry in ((33,74,22,14),(19,84,15,11),(47,86,16,12)):
        if ring_ellipse(xx,yy,cx,cy,rx,ry,2):return BLUE
    if (xx-96)**2+(yy-92)**2<=5**2:return BLUE
    if dist_segment(xx,yy,96,98,96,125)<=3:return BLUE
    if dist_segment(xx,yy,96,106,85,117)<=2:return BLUE
    if dist_segment(xx,yy,96,106,108,116)<=2:return BLUE
    if dist_segment(xx,yy,96,125,88,141)<=2:return BLUE
    if dist_segment(xx,yy,96,125,105,141)<=2:return BLUE
    if 132<=xx<=174 and 112<=yy<=143:return BLUE if (near(xx,132,3,999) or near(xx,174,3,999) or near(yy,143,3,999)) else CREAM
    if dist_segment(xx,yy,128,112,153,91)<=3 or dist_segment(xx,yy,153,91,178,112)<=3:return BLUE
    if 148<=xx<=157 and 126<=yy<=143:return BLUE
    if dist_segment(xx,yy,74,48,80,44)<=1.5 or dist_segment(xx,yy,80,44,86,48)<=1.5:return BLUE
    return CREAM

def chintz(x,y):
    xx=x%192; yy=y%192
    stems=[(14,154,55,115),(55,115,93,66),(55,115,74,170),
           (93,66,135,92),(93,66,146,27),(135,92,180,139)]
    for a,b,c,d in stems:
        if dist_segment(xx,yy,a,b,c,d)<=3:return DARK_GREEN
    blossoms=((42,126,24,RED,6),(93,67,22,PINK,5),(143,31,19,RED,6),
              (145,104,25,PINK,7),(177,143,18,YELLOW,5),(75,169,17,RED,5))
    for cx,cy,r,col,n in blossoms:
        v=flower(xx,yy,cx,cy,r,col,n)
        if v:return v
    leaves=((29,145,10,21,-.8),(64,99,10,23,.75),(81,82,9,21,-.7),
            (116,80,10,22,.65),(126,56,9,21,-.55),(158,120,10,23,.7),(94,145,9,20,-.8))
    for args in leaves:
        v=leaf(xx,yy,*args)
        if v:return v
    for cx,cy in ((18,42),(55,45),(116,151),(167,67),(24,92)):
        v=flower(xx,yy,cx,cy,8,BLUE,5)
        if v:return v
    return CREAM

def ditsy_floral(x,y):
    xx=x%192; yy=y%192
    items=((24,28,7,PINK),(78,18,6,RED),(139,37,7,PINK),(176,75,6,YELLOW),(50,88,7,RED),(112,102,6,PINK),(22,151,6,YELLOW),(86,160,7,PINK),(151,151,6,RED))
    for cx,cy,r,col in items:
        v=flower(xx,yy,cx,cy,r,col,5)
        if v:return v
        if dist_segment(xx,yy,cx,cy+r*.8,cx+4,cy+r*2)<=1.5:return GREEN
    return CREAM

def jacobean_floral(x,y):
    xx=x%192; yy=y%192
    target=96+36*math.sin(2*math.pi*(yy-20)/170)
    if abs(xx-target)<=4:return DARK_GREEN
    for cx,cy,r,col in ((72,42,24,RED),(121,95,28,BLUE),(67,150,24,YELLOW)):
        v=flower(xx,yy,cx,cy,r,col,6)
        if v:return v
    for args in ((98,62,12,25,.8),(96,128,12,25,-.8),(128,132,11,24,.6),(62,78,11,24,-.6)):
        v=leaf(xx,yy,*args)
        if v:return v
    for cx,cy in ((133,42),(52,114)):
        r=math.hypot(xx-cx,yy-cy)
        a=(math.atan2(yy-cy,xx-cx)+2*math.pi)%(2*math.pi)
        if abs(r-(5+3*a))<=2 and r<26:return DARK_GREEN
    return CREAM

MILLE=((12,16,7,RED),(38,23,6,YELLOW),(67,12,7,PINK),(96,30,6,RED),(126,15,7,BLUE),(158,27,6,YELLOW),(183,12,6,PINK),
       (22,55,6,BLUE),(52,66,7,RED),(83,54,6,YELLOW),(111,71,7,PINK),(143,57,6,RED),(174,72,7,BLUE),
       (10,100,6,YELLOW),(40,108,7,PINK),(72,92,6,RED),(101,113,7,BLUE),(132,99,6,YELLOW),(164,111,7,RED),
       (24,145,7,RED),(55,158,6,BLUE),(88,143,7,YELLOW),(118,165,6,PINK),(150,145,7,RED),(181,164,6,BLUE))
def millefleurs(x,y):
    xx=x%192; yy=y%192
    for cx,cy,r,col in MILLE:
        v=flower(xx,yy,cx,cy,r,col,5)
        if v:return v
        if dist_segment(xx,yy,cx,cy+r*.7,cx+(3 if cx%2 else -3),cy+r*2.2)<=1.5:return GREEN
        if rot_ellipse(xx,yy,cx+7,cy+r*1.7,4,8,.6):return GREEN
    return PALE_GREEN

def botanical_print(x,y):
    xx=x%192; yy=y%192
    stems=((25,184,72,18),(103,190,126,28),(149,180,178,58))
    for a,b,c,d in stems:
        if dist_segment(xx,yy,a,b,c,d)<=3:return DARK_GREEN
    leaves=((42,136,15,34,-.72),(55,98,16,36,.68),(68,58,15,34,-.65),
            (112,148,17,37,-.42),(122,105,16,35,.48),(126,62,15,33,-.38),
            (159,140,16,36,-.5),(169,98,15,34,.52),(178,69,13,30,-.45))
    for cx,cy,rx,ry,a in leaves:
        if rot_ellipse(xx,yy,cx,cy,rx,ry,a):
            vx=math.sin(a)*ry*.72; vy=math.cos(a)*ry*.72
            if dist_segment(xx,yy,cx-vx,cy-vy,cx+vx,cy+vy)<=1.6:return CREAM
            return GREEN
    return CREAM

def acanthus(x,y):
    xx=x%192; yy=y%192
    for cx,cy,flip in ((52,100,1),(140,92,-1)):
        if rot_ellipse(xx,yy,cx,cy,22,61,flip*.28):
            phase=int((yy-cy+70)//11)
            edge=abs(xx-cx)
            if edge>10 and ((phase+(1 if xx>cx else 0))%2==0) and edge>15:return CREAM
            return GREEN
        for k in range(-3,4):
            py=cy+k*15
            px=cx+flip*(23+6*(3-abs(k)))
            if rot_ellipse(xx,yy,px,py,14,26,flip*(.75 if k>=0 else -.75)):return GREEN
        tcx=cx+flip*9; tcy=cy-65
        r=math.hypot(xx-tcx,yy-tcy)
        a=(math.atan2(yy-tcy,xx-tcx)+2*math.pi)%(2*math.pi)
        if abs(r-(7+2.8*a))<=2.5 and r<29:return GOLD
    if rot_ellipse(xx,yy,96,102,10,38):return GOLD
    return CREAM

def medallion(x,y):
    xx=x%96; yy=y%96; cx=cy=48
    if ring_ellipse(xx,yy,cx,cy,34,28,5):return BURGUNDY
    if ring_ellipse(xx,yy,cx,cy,23,18,3):return GOLD
    for ang in (0,math.pi/2,math.pi,3*math.pi/2):
        px=cx+math.cos(ang)*14; py=cy+math.sin(ang)*10
        if rot_ellipse(xx,yy,px,py,5,9,ang):return BURGUNDY
    if (xx-cx)**2+(yy-cy)**2<=5**2:return GOLD
    return CREAM

def ivy(x,y):
    xx=x%192; yy=y%192
    vine_x=96+43*math.sin(2*math.pi*(yy-8)/172)
    if abs(xx-vine_x)<=3:return DARK_GREEN
    for idx,cy in enumerate((24,70,116,162)):
        cx=96+43*math.sin(2*math.pi*(cy-8)/172)
        side=-1 if idx%2 else 1
        lx=cx+side*37; ly=cy-5
        if dist_segment(xx,yy,cx,cy,lx-side*10,ly)<=2.5:return DARK_GREEN
        lobes=((0,-16,14),(side*14,-6,13),(-side*14,-6,13),(side*11,10,12),(-side*11,10,12))
        painted=False
        for dx,dy,r in lobes:
            if (xx-(lx+dx))**2+(yy-(ly+dy))**2<=r*r:
                painted=True
                break
        if painted or rot_ellipse(xx,yy,lx,ly+5,13,22):
            if dist_segment(xx,yy,lx,ly+16,lx,ly-12)<=1.7:return CREAM
            return GREEN
    return CREAM

GENERATORS={
'greek-key':greek_key,'quatrefoil':quatrefoil,'ogee':ogee,'lattice':lattice,
'honeycomb':honeycomb,'scallop':scallop,'basketweave':basketweave,'hexagon':hexagon,
'trellis':trellis,'hishi':hishi,'fleur-de-lis':fleur_de_lis,'toile-de-jouy':toile_de_jouy,
'chintz':chintz,'ditsy-floral':ditsy_floral,'jacobean-floral':jacobean_floral,
'millefleurs':millefleurs,'botanical-print':botanical_print,'acanthus':acanthus,
'medallion':medallion,'ivy':ivy,
}

if __name__=='__main__':
    for pattern_id,fn in GENERATORS.items():
        path=OUT/f'{pattern_id}.png'
        write_png(path,fn)
        print(f'generated {pattern_id}: {path} ({path.stat().st_size} bytes)')
