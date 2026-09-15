#!/usr/bin/env python3
import os, struct, zlib, math

W=H=1536
OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','assets','reference'))
os.makedirs(OUT,exist_ok=True)

WHITE=(247,246,241); BLACK=(28,29,31); CREAM=(238,226,197); INDIGO=(30,55,89)
NAVY=(31,48,77); BLUE=(55,101,157); RED=(170,48,48); DARK_RED=(112,32,36)
GREEN=(45,104,76); GOLD=(196,151,47); BURGUNDY=(112,43,61); GRAY=(116,118,120)
LIGHT_GRAY=(207,207,200); CHARCOAL=(48,51,55); BROWN=(108,75,49); TAN=(190,162,122)
YELLOW=(224,184,55); TEAL=(44,121,121)

def chunk(tag,data):
    return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)

def write_png(name,fn):
    comp=zlib.compressobj(9)
    parts=[]
    for y in range(H):
        row=bytearray([0])
        for x in range(W): row.extend(fn(x,y))
        parts.append(comp.compress(bytes(row)))
    parts.append(comp.flush())
    raw=b''.join(parts)
    data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',W,H,8,2,0,0,0))+chunk(b'IDAT',raw)+chunk(b'IEND',b'')
    path=os.path.join(OUT,name+'.png')
    with open(path,'wb') as f:f.write(data)
    print(name, len(data))

def mix(a,b,t=.5): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def near(v,target,width,period):
    d=abs((v-target+period/2)%period-period/2)
    return d<=width/2

def buffalo(x,y):
    # Broad crossing bands create the characteristic large plaid cue without collapsing into checkerboard.
    p=256; band=68
    vertical=(x%p)<band; horizontal=(y%p)<band
    if vertical and horizontal:return BLACK
    if vertical or horizontal:return DARK_RED
    return RED

def shepherd(x,y):
    # Small two-color check with subtle diagonal twill cue; deliberately much finer than Checkerboard.
    s=40
    cell=((x//s)+(y//s))%2
    twill=(x+y)%12<3
    if cell==0:return (52,53,55) if twill else BLACK
    return (222,221,214) if twill else WHITE

def windowpane(x,y):
    return NAVY if near(x,0,7,192) or near(y,0,7,192) else CREAM

def madras(x,y):
    base=CREAM
    vx=x%320; vy=y%288
    vc=None; hc=None
    if vx<44: vc=RED
    elif 96<=vx<126: vc=BLUE
    elif 198<=vx<214: vc=YELLOW
    if vy<38: hc=TEAL
    elif 88<=vy<122: hc=RED
    elif 208<=vy<226: hc=BLUE
    if vc and hc:return mix(vc,hc,.5)
    if vc:return mix(base,vc,.55)
    if hc:return mix(base,hc,.55)
    return base

def tattersall(x,y):
    if near(x,0,5,176) or near(y,0,5,176): return NAVY
    if near(x,88,5,176) or near(y,88,5,176): return BURGUNDY
    return CREAM

def gun_club(x,y):
    # Multitone small-check construction: broad brown pairs, fine green pairs, and a dark accent line.
    p=160; vx=x%p; vy=y%p
    vc=None; hc=None
    if vx<28: vc=BROWN
    elif 76<=vx<84: vc=GREEN
    if vy<28: hc=BROWN
    elif 76<=vy<84: hc=GREEN
    if vc and hc:return mix(vc,hc,.5)
    if vc:return mix(TAN,vc,.55)
    if hc:return mix(TAN,hc,.55)
    if near(x,120,3,p) or near(y,120,3,p):return (72,65,56)
    return CREAM

def prince_of_wales(x,y):
    micro=24
    gx=(x//micro)%6; gy=(y//micro)%6
    if (gx<2 and gy<2) or (gx>=3 and gy>=3): base=(93,94,96)
    elif (gx<3)^(gy<3): base=LIGHT_GRAY
    else: base=(180,181,178)
    if near(x,0,8,288) or near(y,0,8,288): return BURGUNDY
    return base

def pinstripe(x,y):
    return (225,226,218) if near(x,0,3,62) else NAVY

def chalk_stripe(x,y):
    d=abs((x+48)%96-48)
    if d<=3:return (230,230,220)
    if d<=7:return (151,153,150)
    return CHARCOAL

def bengal(x,y): return BLUE if (x//78)%2==0 else WHITE

def koushi(x,y):
    return INDIGO if near(x,0,6,108) or near(y,0,6,108) else WHITE

def awning(x,y): return GREEN if (x//168)%2==0 else WHITE

def regimental(x,y):
    t=(x+y)%300
    if t<105:return NAVY
    if t<180:return RED
    if t<204:return GOLD
    return CREAM

def breton(x,y):
    t=y%86
    return NAVY if t<26 else WHITE

def swiss_dot(x,y):
    cx=(x//78)*78+39; cy=(y//78)*78+39
    dx=x-cx; dy=y-cy
    if (dx-3)**2+(dy-3)**2<=11**2:return (204,203,194)
    if dx*dx+dy*dy<=10**2:return WHITE
    if dx*dx+dy*dy<=13**2:return (226,225,216)
    return (244,242,234)

def segdist(px,py,x1,y1,x2,y2):
    vx=x2-x1; vy=y2-y1; wx=px-x1; wy=py-y1
    c=vx*vx+vy*vy
    t=0 if c==0 else max(0,min(1,(wx*vx+wy*vy)/c))
    qx=x1+t*vx; qy=y1+t*vy
    return math.hypot(px-qx,py-qy)

def herringbone(x,y):
    tw=160; th=128
    tx=x%tw; ty=y%th
    # alternating short diagonal bars around a central spine; deliberately broken, not a continuous chevron
    if abs(tx-80)<=3:return BROWN
    for yy in (18,54,90,126):
        if segdist(tx,ty,78,yy,22,yy-30)<=5:return BROWN
        if segdist(tx,ty,82,yy+18,138,yy-12)<=5:return BROWN
    return CREAM

def tri(v,p):
    t=(v%p)/p
    return 4*abs(t-.5)-1

def zigzag(x,y):
    target=90+62*tri(x,256)
    yy=y%180
    return BLACK if abs(yy-target)<=7 else WHITE

def diamond(x,y):
    # Two diagonal line families make a continuous rhombus lattice with clean tile boundaries.
    p=192
    return BLACK if near(x+y,0,7,p) or near(x-y,0,7,p) else CREAM

def harlequin(x,y):
    # diagonal coordinate cells tessellate as filled diamonds
    u=int(math.floor((x+y)/128)); v=int(math.floor((x-y+4096)/128))
    k=(u+2*v)%3
    return (RED,BLACK,CREAM)[k]

def checkerboard(x,y):
    s=96
    return BLACK if ((x//s)+(y//s))%2 else WHITE

GENERATORS={
'buffalo-check':buffalo,'shepherd-check':shepherd,'windowpane-check':windowpane,'madras-check':madras,
'tattersall':tattersall,'gun-club-check':gun_club,'prince-of-wales-check':prince_of_wales,'pinstripe':pinstripe,
'chalk-stripe':chalk_stripe,'bengal-stripe':bengal,'koushi':koushi,'awning-stripe':awning,
'regimental-stripe':regimental,'breton-stripe':breton,'swiss-dot':swiss_dot,'herringbone':herringbone,
'zigzag':zigzag,'diamond':diamond,'harlequin':harlequin,'checkerboard':checkerboard}

if __name__=='__main__':
    for name,fn in GENERATORS.items():write_png(name,fn)
