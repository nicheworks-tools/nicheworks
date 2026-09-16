#!/usr/bin/env python3
"""Generate deterministic 1536x1536 recognition-reference PNGs for Pattern Dictionary Wave 5.
Qualified textile/technique/material terms are representative recognition references only.
"""
from pathlib import Path
import math, struct, zlib

SIZE=1536; TILE=192; REP=SIZE//TILE
OUT=Path(__file__).resolve().parents[1]/'assets'/'reference'; OUT.mkdir(parents=True,exist_ok=True)
WHITE=(249,248,244); CREAM=(239,226,198); BLACK=(27,28,28); NAVY=(29,48,86); INDIGO=(34,55,105)
BLUE=(50,92,164); RED=(171,50,48); DARK_RED=(115,37,40); GOLD=(214,164,45); GREEN=(45,105,61)
DARK_GREEN=(38,72,43); LIME=(111,135,56); TAN=(188,146,92); BROWN=(104,68,43); DARK_BROWN=(64,45,34)
GRAY=(116,118,116); PALE=(218,207,184); PINK=(207,87,125); ORANGE=(214,107,38); YELLOW=(235,194,43); PURPLE=(117,64,139)

def chunk(k,d): return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
def write_png(path,fn):
    tile=[[fn(x,y) for x in range(TILE)] for y in range(TILE)]
    raw=bytearray()
    for y in range(SIZE):
        raw.append(0); row=tile[y%TILE]; raw.extend(bytes(c for rgb in row for c in rgb)*REP)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',SIZE,SIZE,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(raw),9))+chunk(b'IEND',b'')
    path.write_bytes(png)
def seg(px,py,ax,ay,bx,by):
    vx,vy=bx-ax,by-ay; wx,wy=px-ax,py-ay; vv=vx*vx+vy*vy
    if vv==0:return math.hypot(px-ax,py-ay)
    t=max(0,min(1,(wx*vx+wy*vy)/vv)); return math.hypot(px-(ax+t*vx),py-(ay+t*vy))
def ellipse(x,y,cx,cy,rx,ry,a=0):
    ca,sa=math.cos(a),math.sin(a); dx,dy=x-cx,y-cy; u=dx*ca+dy*sa; v=-dx*sa+dy*ca
    return (u/rx)**2+(v/ry)**2<=1
def ring(x,y,cx,cy,r,w=2): return abs(math.hypot(x-cx,y-cy)-r)<=w
def flower(x,y,cx,cy,r,col=RED,n=6):
    if (x-cx)**2+(y-cy)**2<=(r*.24)**2:return GOLD
    for k in range(n):
        a=2*math.pi*k/n; px=cx+math.cos(a)*r*.62; py=cy+math.sin(a)*r*.62
        if (x-px)**2+(y-py)**2<=(r*.38)**2:return col
    return None
def line_mod(v,period,w=2): return abs((v+period/2)%period-period/2)<=w
def hsh(x,y,s=0):
    n=(x*73856093)^(y*19349663)^(s*83492791); n=(n^(n>>13))*1274126177; return (n^(n>>16))&0xffffffff

def suzani(x,y):
    xx,yy=x%192,y%192; bg=CREAM
    for cx,cy,r,c in ((48,48,29,RED),(144,48,27,DARK_RED),(48,144,27,DARK_RED),(144,144,29,RED)):
        d=math.hypot(xx-cx,yy-cy)
        if r-5<d<r+1:return c
        for k in range(8):
            a=2*math.pi*k/8; px=cx+math.cos(a)*r*.62; py=cy+math.sin(a)*r*.62
            if (xx-px)**2+(yy-py)**2<=(r*.24)**2:return PINK if k%2 else RED
        if d<6:return GOLD
    for a,b,c,d in ((48,77,96,96),(144,75,96,96),(48,115,96,96),(144,117,96,96)):
        if seg(xx,yy,a,b,c,d)<=2:return GREEN
    if ellipse(xx,yy,83,88,8,17,-.7) or ellipse(xx,yy,109,88,8,17,.7) or ellipse(xx,yy,83,106,8,17,.7) or ellipse(xx,yy,109,106,8,17,-.7):return GREEN
    return bg

def kente(x,y):
    xx,yy=x%192,y%192; strip=xx//32; local=x%32; block=(yy//24)%8
    palettes=[(GOLD,BLACK,RED,GREEN),(GREEN,YELLOW,BLACK,RED),(RED,GOLD,NAVY,WHITE),(BLUE,GOLD,RED,BLACK),(GOLD,GREEN,RED,BLACK),(BLACK,GOLD,GREEN,RED)]
    p=palettes[strip%len(palettes)]; base=p[block%4]
    if local in (0,1,30,31):return CREAM
    if strip%2==0 and ((local//4+yy//6)%2==0):return p[(block+1)%4]
    if strip%3==1 and abs((local-16)+((yy//6)%2)*8-4)<3:return p[(block+2)%4]
    return base

def bogolan(x,y):
    xx,yy=x%192,y%192; band=yy//32
    if band%2==0:
        if line_mod(xx+yy,32,3) or line_mod(xx-yy,32,3):return CREAM
        if (xx//16+yy//16)%4==0:return TAN
        return BLACK
    if band%4==1:
        if abs((xx%32)-16)<3:return BLACK
        if ((xx//16)%2==0 and abs((yy%32)-16)<3):return BLACK
        return CREAM
    if ring(xx,yy,(xx//48)*48+24,(yy//32)*32+16,9,3):return BLACK
    return TAN

def adire(x,y):
    xx,yy=x%192,y%192
    if ((xx//48)+(yy//48))%2==0:
        cx=(xx//48)*48+24; cy=(yy//48)*48+24; d=math.hypot(xx-cx,yy-cy)
        if 9<d<13 or 19<d<22:return WHITE
    else:
        if line_mod(xx+yy,24,2) or line_mod(xx-yy,24,2):return WHITE
    if (xx%48 in range(22,26)) or (yy%48 in range(22,26)):return BLUE
    return INDIGO

def kuba(x,y):
    xx,yy=x%96,y%96; c=TAN
    segs=[(4,18,42,18),(42,18,42,5),(42,5,78,5),(78,5,78,34),(78,34,58,34),(58,34,58,58),(58,58,88,58),(88,58,88,88),(88,88,48,88),(48,88,48,70),(48,70,13,70),(13,70,13,42),(13,42,31,42),(31,42,31,18)]
    for a,b,d,e in segs:
        if seg(xx,yy,a,b,d,e)<=4:return DARK_BROWN
    if ((xx//12+yy//12)%3==0) and min(xx%12,yy%12)<2:return BROWN
    return c

def sashiko(x,y):
    xx,yy=x%96,y%96
    # dotted running-stitch arcs + diamonds
    for cx,cy in ((0,48),(48,48),(96,48),(24,0),(72,0),(24,96),(72,96)):
        d=math.hypot(xx-cx,yy-cy)
        if abs(d-24)<1.8 and int((math.atan2(yy-cy,xx-cx)+math.pi)*9)%2==0:return WHITE
    if abs(abs(xx-48)+abs(yy-48)-42)<2 and int((xx+yy)/7)%2==0:return WHITE
    return INDIGO

def kantha(x,y):
    xx,yy=x%192,y%192
    # dense horizontal quilting stitches
    if yy%12 in (2,3) and (xx//10)%2==0:return DARK_RED
    for cx,cy,col in ((48,48,RED),(144,48,GREEN),(48,144,GREEN),(144,144,RED)):
        v=flower(xx,yy,cx,cy,18,col,6)
        if v:return v
    if seg(xx,yy,22,96,170,96)<=2 and (xx//9)%2==0:return BROWN
    return CREAM

def otomi(x,y):
    xx,yy=x%192,y%192
    # stylized deer/bird silhouettes plus flowers
    if ellipse(xx,yy,52,72,25,12) or ellipse(xx,yy,76,60,10,9) or (44<xx<51 and 78<yy<110) or (60<xx<67 and 78<yy<110):return RED
    if ellipse(xx,yy,132,112,24,10,-.2) or ellipse(xx,yy,151,97,9,8) or seg(xx,yy,113,108,99,96)<=6:return BLUE
    for cx,cy,col in ((126,35,GREEN),(35,145,PINK),(151,155,ORANGE)):
        v=flower(xx,yy,cx,cy,15,col,6)
        if v:return v
    if ellipse(xx,yy,100,152,8,20,.7) or ellipse(xx,yy,92,31,8,20,-.8):return GREEN
    return WHITE

def african_wax(x,y):
    xx,yy=x%96,y%96; bg=YELLOW
    if abs(abs(xx-48)+abs(yy-48)-34)<4:return NAVY
    for cx,cy,col in ((48,48,RED),(16,16,BLUE),(80,16,GREEN),(16,80,GREEN),(80,80,BLUE)):
        d=math.hypot(xx-cx,yy-cy)
        if d<9:return col
        if 11<d<15:return BLACK
    if line_mod(xx,48,2) or line_mod(yy,48,2):return ORANGE
    return bg

def block_print(x,y):
    xx,yy=x%64,y%64; ox=2 if (yy//64)%2 else 0; cx=32+ox; cy=32
    v=flower(xx,yy,cx,cy,17,DARK_RED,6)
    if v:return v
    if ring(xx,yy,cx,cy,24,2):return INDIGO
    if abs(xx-4)<2 or abs(yy-4)<2:return TAN
    return CREAM

def zebra(x,y):
    xx,yy=x%192,y%192; wave=18*math.sin(yy/25)+7*math.sin(yy/8)
    for base,w in ((15,9),(53,13),(95,8),(135,15),(176,10)):
        center=base+wave+8*math.sin((yy+base)/17)
        if abs(xx-center)<w*(.55+.35*math.sin(yy/31+base)):
            if ((yy+base)//70)%3==0 and abs(yy%70-35)<7:return WHITE
            return BLACK
    return WHITE

def tiger(x,y):
    xx,yy=x%192,y%192
    for base in (10,48,86,128,170):
        center=base+15*math.sin((yy+base)/34)
        width=max(2,13*(1-abs((yy%96)-48)/58))
        if abs(xx-center)<width:return BLACK
    if 72<yy<88 and (xx%96)<25:return WHITE
    return ORANGE

def snake(x,y):
    xx,yy=x%48,y%42; row=(y//21)%2; cx=((x//24)*24+(12 if row==0 else 0))%48; cy=(y//21)*21+10
    # hex/scale lattice
    if line_mod(x*.866+y*.5,21,1.8) or line_mod(x*.866-y*.5,21,1.8):return DARK_BROWN
    d=math.hypot(xx-24,yy-21)
    if d<7:return BROWN
    if ((x//48+y//42)%3)==0 and d<13:return TAN
    return CREAM

def cow(x,y):
    xx,yy=x%192,y%192
    blobs=((31,34,27,20,.3),(121,28,32,22,-.5),(73,104,38,27,.2),(157,127,28,39,-.4),(21,165,30,24,.1),(112,178,31,18,.7))
    for cx,cy,rx,ry,a in blobs:
        if ellipse(xx,yy,cx,cy,rx*(1+.12*math.sin((yy+cx)/9)),ry,a):return BLACK
    return WHITE

def giraffe(x,y):
    xx,yy=x%96,y%96
    centers=((18,18,20,16),(66,16,24,14),(39,50,23,19),(81,59,18,22),(12,77,18,20),(55,88,23,16))
    for cx,cy,rx,ry in centers:
        if ellipse(xx,yy,cx,cy,rx,ry,.1*math.sin(cx)):return BROWN
    return CREAM

def dalmatian(x,y):
    xx,yy=x%192,y%192
    spots=((18,18,8,6),(52,30,11,9),(92,16,7,10),(137,38,12,8),(174,19,7,7),(31,73,9,12),(77,68,8,7),(116,82,13,10),(163,75,9,7),(17,126,10,8),(61,119,7,11),(98,137,11,8),(146,120,8,12),(181,146,9,7),(44,169,12,8),(126,174,9,11))
    for i,(cx,cy,rx,ry) in enumerate(spots):
        if ellipse(xx,yy,cx,cy,rx,ry,(i%5)*.25):return BLACK
    return WHITE

def camouflage(x,y):
    xx,yy=x%192,y%192; bg=TAN
    blobs=[(25,27,45,24,.2,DARK_GREEN),(108,21,52,30,-.4,BROWN),(174,53,40,28,.5,BLACK),(56,87,55,32,-.1,GREEN),(139,101,54,28,.3,DARK_GREEN),(24,150,48,30,.6,BROWN),(105,157,58,31,-.5,BLACK),(177,165,41,31,.1,GREEN)]
    col=bg
    for cx,cy,rx,ry,a,c in blobs:
        if ellipse(xx,yy,cx,cy,rx*(1+.12*math.sin((yy+cx)/13)),ry*(1+.1*math.cos((xx+cy)/11)),a):col=c
    return col

def tie_dye(x,y):
    xx,yy=x%192,y%192; cx,cy=96,96; d=math.hypot(xx-cx,yy-cy); a=math.atan2(yy-cy,xx-cx)
    warped=d+13*math.sin(5*a)+5*math.sin(a*11)
    if warped<22:return WHITE
    bands=[(22,40,BLUE),(40,58,WHITE),(58,78,PURPLE),(78,98,WHITE),(98,122,PINK),(122,150,BLUE)]
    for lo,hi,c in bands:
        if lo<=warped<hi:return c
    return PURPLE

def marbling(x,y):
    xx,yy=x%192,y%192; phase=20*math.sin(yy/23)+9*math.sin(yy/8)
    v=(xx+phase)%48
    if v<7:return BLUE
    if 10<v<15:return CREAM
    if 19<v<25:return DARK_RED
    if 29<v<33:return GOLD
    if 37<v<43:return NAVY
    return WHITE

def terrazzo(x,y):
    xx,yy=x%192,y%192; bg=CREAM
    # deterministic scattered chips on coarse cells
    gx,gy=xx//24,yy//24; hx=hsh(gx,gy,7); cx=gx*24+4+(hx%16); cy=gy*24+4+((hx>>8)%16); rx=4+((hx>>16)%8); ry=3+((hx>>20)%7)
    cols=[BLACK,GRAY,TAN,RED,DARK_GREEN,PALE,NAVY]
    if ellipse(xx,yy,cx,cy,rx,ry,(hx%314)/100):return cols[(hx>>24)%len(cols)]
    # second tiny chip in alternate cells
    if (gx+gy)%2==0:
        hx2=hsh(gx,gy,19); cx2=gx*24+5+(hx2%14); cy2=gy*24+5+((hx2>>7)%14)
        if ellipse(xx,yy,cx2,cy2,3+(hx2%4),2+((hx2>>9)%4),.5):return cols[(hx2>>20)%len(cols)]
    return bg

FUN={'suzani':suzani,'kente':kente,'bogolan':bogolan,'adire':adire,'kuba-cloth':kuba,'sashiko':sashiko,'kantha':kantha,'otomi-embroidery':otomi,'african-wax-print':african_wax,'block-print':block_print,'zebra-print':zebra,'tiger-print':tiger,'snake-print':snake,'cow-print':cow,'giraffe-print':giraffe,'dalmatian-spots':dalmatian,'camouflage':camouflage,'tie-dye':tie_dye,'marbling':marbling,'terrazzo':terrazzo}
def tie_dye_v2(x,y):
    xx,yy=x%192,y%192; cx,cy=96,96; dx,dy=xx-cx,yy-cy; d=math.hypot(dx,dy); a=math.atan2(dy,dx)
    if d<9:return WHITE
    phase=(a+d/22+0.18*math.sin(d/9))%(2*math.pi)
    sector=int(phase/(2*math.pi/8))%8
    cols=[BLUE,WHITE,PURPLE,WHITE,PINK,WHITE,BLUE,WHITE]
    c=cols[sector]
    # pale resisted rings break the spiral organically
    if abs((d+5*math.sin(3*a))%38-19)<2.8:return WHITE
    return c

def marbling_v2(x,y):
    xx,yy=x%192,y%192
    u=xx+25*math.sin(yy/31)+8*math.sin((xx+yy)/17)+5*math.sin(yy/7)
    v=yy+13*math.sin(xx/29)
    z=(u+0.18*v)%76
    if z<10:return NAVY
    if z<18:return CREAM
    if z<32:return BLUE
    if z<39:return WHITE
    if z<52:return DARK_RED
    if z<60:return GOLD
    return CREAM

def write_png_scaled(path,fn,scale=1):
    tile_size=TILE*scale; rep=SIZE//tile_size
    tile=[[fn(x//scale,y//scale) for x in range(tile_size)] for y in range(tile_size)]
    raw=bytearray()
    for y in range(SIZE):
        raw.append(0); row=tile[y%tile_size]; raw.extend(bytes(c for rgb in row for c in rgb)*rep)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',SIZE,SIZE,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(raw),9))+chunk(b'IEND',b'')
    path.write_bytes(png)

FUN['tie-dye']=tie_dye_v2; FUN['marbling']=marbling_v2
SCALE2={'suzani','sashiko','kantha','otomi-embroidery','block-print','snake-print','cow-print','giraffe-print','dalmatian-spots','camouflage','tie-dye','marbling','terrazzo'}
for pid,fn in FUN.items():
    write_png_scaled(OUT/f'{pid}.png',fn,2 if pid in SCALE2 else 1); print(pid)
