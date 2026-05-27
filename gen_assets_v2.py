#!/usr/bin/env python3
"""手冲咖啡模拟器 - 插画风格素材生成 v2
   绘制真实图形：咖啡豆/V60滤杯/手冲壶/分享壶/磨豆器/电子秤/玻璃杯"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

BASE = "/Users/wb/Downloads/NewGame/img"
for d in ["judges","beans","equipment","scene","coffee","ui"]:
    os.makedirs(BASE+"/"+d, exist_ok=True)

# === Palette ===
BG  = (26,13,8)
CRD = (42,28,18)
CRL = (55,38,25)
GLD = (200,169,81)
GLL = (230,200,120)
CRM = (232,213,196)
MUT = (154,138,122)
WHT = (255,255,255)
BLK = (0,0,0)
WOD = (139,90,43)
DKW = (80,45,20)
COF = (101,67,33)
COFL= (160,120,70)
RED = (180,70,70)
GRN = (100,160,80)

try:
    F32 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 32)
    F24 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 24)
    F20 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 20)
    F16 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 16)
    F14 = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 14)
    E80 = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 80)
    E50 = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 50)
    E36 = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 36)
except:
    F32=F24=F20=F16=F14=ImageFont.load_default()
    E80=E50=E36=F32

def rr(d, xy, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(xy, r, fill=fill, outline=outline, width=width)

def circle(d, cx, cy, r, fill):
    d.ellipse((cx-r,cy-r,cx+r,cy+r), fill=fill)

def elip(d, xy, fill):
    d.ellipse(xy, fill=fill)

def txt(d, xy, text, font, fill, anchor=None):
    if anchor: d.text(xy, text, font=font, fill=fill, anchor=anchor)
    else: d.text(xy, text, font=font, fill=fill)

def txtc(d, cx, cy, text, font, fill):
    b = d.textbbox((0,0), text, font=font)
    d.text((cx-(b[2]-b[0])/2, cy-(b[3]-b[1])/2), text, font=font, fill=fill)

def grad_rect(d, x1, y1, x2, y2, c1, c2, vertical=True):
    """Draw a gradient rectangle"""
    steps = max(2, abs(y2-y1) if vertical else abs(x2-x1))
    for i in range(steps):
        t = i/(steps-1)
        r = int(c1[0]*(1-t)+c2[0]*t)
        g = int(c1[1]*(1-t)+c2[1]*t)
        b = int(c1[2]*(1-t)+c2[2]*t)
        if vertical:
            d.line([(x1, y1+i), (x2, y1+i)], fill=(r,g,b))
        else:
            d.line([(x1+i, y1), (x1+i, y2)], fill=(r,g,b))

def shadow(img, offset=4, blur=8):
    """Add drop shadow to image"""
    s = Image.new('RGBA', (img.width+blur*2, img.height+blur*2), (0,0,0,0))
    sd = ImageDraw.Draw(s)
    a = img.split()[3] if img.mode=='RGBA' else None
    if a:
        s2 = Image.new('RGBA', s.size, (0,0,0,0))
        s2.paste(img, (blur+offset, blur+offset), a)
        s2 = s2.filter(ImageFilter.GaussianBlur(blur))
        # darken
        arr = list(s2.split())
        arr[3] = arr[3].point(lambda x: x*0.6)
        s2 = Image.merge('RGBA', arr)
        s2.paste(img, (blur, blur), a)
        return s2
    return img

def new_img(w, h, bg=None):
    return Image.new('RGBA', (w, h), bg or (0,0,0,0))

# ============================================================
# 评委头像 - 手绘风格人物
# ============================================================
print("=== 评委头像 ===")

def draw_judge(fn, skin, hair_color, hair_style, shirt_color, glasses=False, beard=False, mustache=False, gender='m'):
    w, h = 256, 256
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, cy = 128, 100

    # Neck
    d.rectangle((cx-18, cy+40, cx+18, cy+72), fill=skin)

    # Head
    circle(d, cx, cy, 48, skin)

    # Hair
    if hair_style == 'bald':
        pass  # bald top
    elif hair_style == 'short':
        d.ellipse((cx-52, cy-52, cx+52, cy-18), fill=hair_color)
    elif hair_style == 'gray_short':
        d.ellipse((cx-52, cy-52, cx+52, cy-18), fill=hair_color)
    elif hair_style == 'ponytail':
        d.ellipse((cx-52, cy-52, cx+52, cy-18), fill=hair_color)
        d.rectangle((cx+20, cy-20, cx+35, cy+55), fill=hair_color)
    elif hair_style == 'bob':
        d.ellipse((cx-54, cy-50, cx+54, cy-8), fill=hair_color)
        d.rectangle((cx-54, cy-10, cx+54, cy+45), fill=hair_color)
    elif hair_style == 'silver':
        d.ellipse((cx-54, cy-50, cx+54, cy-15), fill=hair_color)
        # Side sweep
        d.polygon([(cx,cy-48),(cx+50,cy-35),(cx+45,cy-10),(cx-5,cy-30)], fill=hair_color)

    # Ears
    circle(d, cx-50, cy+5, 12, skin)
    circle(d, cx+50, cy+5, 12, skin)

    # Eyes
    ey = cy-5
    d.ellipse((cx-20, ey-6, cx-8, ey+6), fill=WHT)
    d.ellipse((cx+8, ey-6, cx+20, ey+6), fill=WHT)
    # pupils
    circle(d, cx-12, ey, 4, (40,25,10))
    circle(d, cx+16, ey, 4, (40,25,10))
    # eye shine
    circle(d, cx-10, ey-2, 2, WHT)
    circle(d, cx+18, ey-2, 2, WHT)

    # Glasses
    if glasses:
        d.ellipse((cx-28, ey-12, cx-4, ey+14), outline=(60,50,40), width=2)
        d.ellipse((cx+4, ey-12, cx+28, ey+14), outline=(60,50,40), width=2)
        d.line([(cx-4, ey+1), (cx+4, ey+1)], fill=(60,50,40), width=2)

    # Nose
    d.ellipse((cx-5, ey+4, cx+5, ey+18), fill=tuple(max(0,c-20) for c in skin))

    # Mouth
    my = ey+28
    d.arc((cx-12, my-4, cx+12, my+8), 0, 180, fill=(140,80,60), width=2)

    # Beard
    if beard:
        d.ellipse((cx-25, my-5, cx+25, cy+55), fill=hair_color)
    if mustache:
        d.ellipse((cx-20, my-6, cx+20, my+6), fill=hair_color)

    # Body/Shirt
    d.polygon([(cx-48, cy+68), (cx+48, cy+68), (cx+65, cy+140), (cx-65, cy+140)], fill=shirt_color)
    # Collar
    d.polygon([(cx-20, cy+68), (cx, cy+88), (cx+20, cy+68)], fill=tuple(max(0,c-30) for c in shirt_color))

    # Name plate
    rr(d, (cx-40, cy+150, cx+40, cy+185), 10, fill=(0,0,0,120))

    img.save(BASE+"/judges/"+fn)
    print(f"  {fn}")

# 田口护 - elderly Japanese, gray hair, glasses, gentle
draw_judge("judge_tian.png", (210,175,145), (120,120,120), 'gray_short', (120,80,50), glasses=True, gender='m')

# James Hoffmann - bald, beard, navy blazer
draw_judge("judge_james.png", (232,200,158), (100,80,60), 'bald', (30,40,80), beard=True, gender='m')

# 铃木树 - young woman, ponytail, beige shirt
draw_judge("judge_suzuki.png", (245,210,180), (40,25,15), 'ponytail', (200,180,150), gender='f')

# 朴恩星 - elegant, bob cut, cream blouse
draw_judge("judge_park.png", (250,225,200), (20,15,10), 'bob', (220,205,190), gender='f')

# André Meyer - silver hair, mustache, black turtleneck
draw_judge("judge_andre.png", (240,210,190), (160,150,140), 'silver', (30,30,35), mustache=True, gender='m')


# ============================================================
# 咖啡豆 - 画真正的咖啡豆
# ============================================================
print("\n=== 咖啡豆 ===")

def draw_coffee_bean(cx, cy, angle, size, color):
    """Draw a single coffee bean shape"""
    # Coffee bean = ellipse with S-curve line
    from PIL import Image as PILImage
    bean_img = PILImage.new('RGBA', (size*3, size*3), (0,0,0,0))
    bd = ImageDraw.Draw(bean_img)
    # Outer shape - elongated ellipse
    bw, bh = size, int(size*0.6)
    bd.ellipse((size*3//2-bw, size*3//2-bh, size*3//2+bw, size*3//2+bh), fill=color)
    # Highlight
    hl = tuple(min(255, c+40) for c in color)
    bd.ellipse((size*3//2-bw+4, size*3//2-bh+2, size*3//2, size*3//2+bh-2), fill=hl)
    # Center crease (S-curve)
    cx0, cy0 = size*3//2, size*3//2
    bd.arc((cx0-8, cy0-bh+4, cx0+8, cy0+bh-4), 250, 290, fill=tuple(max(0,c-30) for c in color), width=2)
    bd.arc((cx0-8, cy0-bh+4, cx0+8, cy0+bh-4), 70, 110, fill=tuple(max(0,c-30) for c in color), width=2)
    # Rotate and paste
    bean_img = bean_img.rotate(angle, center=(size*3//2, size*3//2), resample=Image.BILINEAR)
    img = Image.new('RGBA', (300,300), (0,0,0,0))
    # crop to fit
    crop = bean_img.crop((size//2, size//2, size*5//2, size*5//2))
    return crop.resize((40,40) if size<30 else (60,60))

def draw_bean_bag(fn, bag_color, accent, label, bean_color):
    w, h = 256, 280
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    # Card BG
    rr(d, (8,8,w-8,h-8), 18, fill=CRD)
    # Bag body
    bx, by = 88, 70
    bw, bh = 80, 100
    # Bag shape - slightly wider at top
    d.polygon([(bx-10, by-20),(bx+bw+10, by-20),(bx+bw+5, by+bh+10),(bx-5, by+bh+10)], fill=bag_color)
    # Bag fold at top
    d.rectangle((bx-10, by-20, bx+bw+10, by), fill=tuple(max(0,c-30) for c in bag_color))
    # Label
    rr(d, (bx+10, by+30, bx+bw-10, by+80), 6, fill=accent)
    txtc(d, bx+bw/2, by+55, label, F16, WHT)
    # Scattered beans around
    bean_positions = [(55,170,20,-15), (180,175,22,30), (150,200,18,10), (70,210,16,45), (120,215,20,-20)]
    for bpx, bpy, bs, ba in bean_positions:
        bean = draw_coffee_bean(bpx, bpy, ba, bs, bean_color)
        img.paste(bean, (bpx-20, bpy-20), bean)
    # Name
    txtc(d, 128, 255, label, F20, GLD)
    img.save(BASE+"/beans/"+fn)
    print(f"  {fn}")

draw_bean_bag("bean_basic.png", (160,130,90), (140,110,70), "基础", (120,80,40))
draw_bean_bag("bean_yirgacheffe.png", (100,160,120), (70,130,90), "耶加", (150,180,120))
draw_bean_bag("bean_geisha.png", (200,170,100), (180,140,60), "瑰夏", (170,200,140))
draw_bean_bag("bean_mandheling.png", (80,50,30), (60,35,20), "曼特宁", (50,30,15))


# ============================================================
# 装备 - 画真实形状（核心视觉升级）
# ============================================================
print("\n=== 装备 ===")

def eq_card(fn, w, h, draw_fn):
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    rr(d, (6,6,w-6,h-6), 14, fill=CRD)
    # Gold top line
    rr(d, (16,8,w-16,9), 1, fill=GLD)
    draw_fn(d, w, h)
    img.save(BASE+"/equipment/"+fn)
    print(f"  {fn}")

# V60 Dripper
def draw_cone(d, w, h, color, name):
    cx, cy = w//2, h//2-15
    # Cone shape
    tw, bw = 40, 18
    th = 55
    # Shadow first
    d.polygon([(cx-tw+2, cy+2), (cx-bw+2, cy+th+2), (cx+bw+2, cy+th+2), (cx+tw+2, cy+2)], fill=(0,0,0,40))
    # Main cone body
    d.polygon([(cx-tw, cy), (cx-bw, cy+th), (cx+bw, cy+th), (cx+tw, cy)], fill=color)
    # Highlight left side
    hl = tuple(min(255, c+35) for c in color)
    d.polygon([(cx-tw, cy), (cx-bw, cy+th), (cx, cy+th), (cx, cy)], fill=hl)
    # Rim
    d.ellipse((cx-tw, cy-8, cx+tw, cy+8), fill=tuple(min(255,c+20) for c in color))
    d.ellipse((cx-tw+3, cy-6, cx+tw-3, cy+6), fill=(30,20,15))
    # Spiral ridges inside
    for i, ry in enumerate(range(cy+5, cy+th-10, 8)):
        rw = tw-(tw-bw)*(i/7)
        d.arc((cx-rw, ry-3, cx+rw, ry+3), 0, 180, fill=tuple(max(0,c-20) for c in color), width=1)
    # Base ring
    d.ellipse((cx-bw-2, cy+th-4, cx+bw+2, cy+th+6), fill=tuple(max(0,c-40) for c in color))
    # Label
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("cone_plastic.png", 200, 200, lambda d,w,h: draw_cone(d,w,h,(230,225,215),"塑料V60"))
eq_card("cone_ceramic.png", 200, 200, lambda d,w,h: draw_cone(d,w,h,(200,120,80),"陶瓷V60"))

# Filter Paper
def draw_filter_paper(d, w, h, color, name):
    cx, cy = w//2, h//2-10
    # Stack of papers
    for i in range(4, 0, -1):
        yo = i*2
        shade = tuple(min(255, c+5*i) for c in color)
        d.polygon([(cx-35, cy+yo), (cx-20, cy+55+yo), (cx+20, cy+55+yo), (cx+35, cy+yo)], fill=shade)
    # Top sheet (most visible)
    d.polygon([(cx-35, cy), (cx-20, cy+55), (cx+20, cy+55), (cx+35, cy)], fill=color)
    d.polygon([(cx-32, cy+3), (cx-18, cy+52), (cx, cy+52), (cx, cy+3)], fill=tuple(min(255,c+30) for c in color))
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("paper_bleached.png", 200, 200, lambda d,w,h: draw_filter_paper(d,w,h,(245,242,238),"漂白滤纸"))
eq_card("paper_bamboo.png", 200, 200, lambda d,w,h: draw_filter_paper(d,w,h,(210,190,155),"竹浆滤纸"))

# Carafe
def draw_carafe(d, w, h, color, highlight, name):
    cx, cy = w//2, h//2-5
    r = 25  # body width
    # Shadow
    d.ellipse((cx-r+2, cy+35+2, cx+r+2, cy+38+2), fill=(0,0,0,60))
    # Body - wide at bottom, narrow at top
    d.polygon([(cx-r, cy+8), (cx-r+5, cy+35), (cx+r-5, cy+35), (cx+r, cy+8)], fill=color)
    # Highlight
    d.polygon([(cx-r+3, cy+10), (cx-r+7, cy+32), (cx-5, cy+32), (cx-5, cy+10)], fill=highlight)
    # Handle
    d.arc((cx+r-8, cy+10, cx+r+18, cy+40), 270, 90, fill=color, width=5)
    # Rim
    d.ellipse((cx-r-8, cy+2, cx+r+8, cy+16), outline=color, width=3)
    d.ellipse((cx-r-6, cy+4, cx+r+6, cy+14), fill=(0,0,0,15))
    # Spout
    d.polygon([(cx+r-5, cy+5), (cx+r+8, cy-8), (cx+r+3, cy+6)], fill=color)
    # Base
    d.ellipse((cx-r-3, cy+33, cx+r+3, cy+40), fill=color)
    # Liquid level
    d.ellipse((cx-r+4, cy+18, cx+r-4, cy+28), fill=(160,120,70,60))
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("carafe_glass.png", 200, 200, lambda d,w,h: draw_carafe(d,w,h,(190,200,215,180),(220,225,235,120),"玻璃分享壶"))
eq_card("carafe_crystal.png", 200, 200, lambda d,w,h: draw_carafe(d,w,h,(200,190,225,200),(230,220,245,150),"水晶分享壶"))

# Scale
def draw_scale(d, w, h, color, screen_color, name):
    cx, cy = w//2, h//2
    # Shadow
    d.ellipse((cx-35+2, cy+30+2, cx+35+2, cy+34+2), fill=(0,0,0,60))
    # Platform
    d.rectangle((cx-32, cy+15, cx+32, cy+30), fill=color)
    rr(d, (cx-30, cy+12, cx+30, cy+18), 3, fill=tuple(min(255,c+30) for c in color))
    # Body
    d.rectangle((cx-30, cy+30, cx+30, cy+45), fill=tuple(max(0,c-20) for c in color))
    # Screen
    rr(d, (cx-22, cy+32, cx+22, cy+42), 4, fill=screen_color)
    txtc(d, cx, cy+37, "0.0g", F14, (50,200,100))
    # Feet
    for fx in [cx-25, cx+25]:
        d.ellipse((fx-6, cy+43, fx+6, cy+50), fill=color)
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("scale_basic.png", 200, 200, lambda d,w,h: draw_scale(d,w,h,(70,70,75),(180,220,180),"基础电子秤"))
eq_card("scale_precision.png", 200, 200, lambda d,w,h: draw_scale(d,w,h,(160,160,165),(30,40,50),"精密电子秤"))

# Grinder
def draw_grinder(d, w, h, body_color, accent, hopper_color, name):
    cx, cy = w//2, h//2-10
    # Shadow
    d.ellipse((cx-22+2, cy+55+2, cx+22+2, cy+58+2), fill=(0,0,0,60))
    # Drawer
    d.rectangle((cx-18, cy+52, cx+18, cy+58), fill=accent)
    circle(d, cx, cy+55, 3, (0,0,0,80))
    # Main body
    d.rectangle((cx-22, cy+20, cx+22, cy+52), fill=body_color)
    # Highlight
    d.rectangle((cx-20, cy+22, cx-5, cy+50), fill=tuple(min(255,c+25) for c in body_color))
    # Hopper (transparent-ish on top)
    d.polygon([(cx-18, cy+20), (cx-22, cy-20), (cx+22, cy-20), (cx+18, cy+20)], fill=hopper_color)
    # Hopper highlight
    d.polygon([(cx-20, cy+18), (cx-22, cy-18), (cx-8, cy-18), (cx-8, cy+18)], fill=(255,255,255,50))
    # Beans in hopper
    for _ in range(5):
        bx = cx-8 + (_*6)
        by = cy-12 + (_%3)*4
        circle(d, bx, by, 4, (80,50,25))
    # Handle/Crank on top
    if '手动' in name:
        d.line([(cx, cy-20), (cx, cy-40)], fill=accent, width=3)
        circle(d, cx, cy-42, 5, accent)
    # Brand mark
    rr(d, (cx-8, cy+28, cx+8, cy+38), 4, fill=accent)
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("grinder_ceramic.png", 200, 200, lambda d,w,h: draw_grinder(d,w,h,(160,120,80),(120,80,40),(200,180,150,120),"陶瓷芯磨豆器"))
eq_card("grinder_steel.png", 200, 200, lambda d,w,h: draw_grinder(d,w,h,(180,178,175),(140,138,135),(210,208,205,140),"钢芯磨豆器"))
eq_card("grinder_electric.png", 200, 200, lambda d,w,h: draw_grinder(d,w,h,(150,148,155),(100,98,105),(200,198,205,140),"电动磨豆器"))

# Kettle
def draw_kettle(d, w, h, body_color, accent, name, temp_display=False):
    cx, cy = w//2, h//2-5
    # Shadow
    d.ellipse((cx-28+2, cy+35+2, cx+28+2, cy+38+2), fill=(0,0,0,60))
    # Body
    d.ellipse((cx-28, cy-20, cx+28, cy+38), fill=body_color)
    # Highlight
    d.ellipse((cx-26, cy-18, cx-8, cy+34), fill=tuple(min(255,c+30) for c in body_color))
    # Base
    d.ellipse((cx-26, cy+33, cx+26, cy+42), fill=accent)
    # Gooseneck spout
    d.line([(cx+20, cy-5), (cx+50, cy-40), (cx+65, cy-45)], fill=body_color, width=4)
    d.line([(cx+20, cy-3), (cx+50, cy-38), (cx+65, cy-43)], fill=tuple(min(255,c+40) for c in body_color), width=2)
    # Handle
    d.arc((cx-35, cy-25, cx-15, cy+20), 90, 270, fill=accent, width=5)
    # Lid
    d.ellipse((cx-15, cy-26, cx+15, cy-18), fill=accent)
    circle(d, cx, cy-22, 4, body_color)
    # Temp display
    if temp_display:
        rr(d, (cx+10, cy+10, cx+35, cy+28), 4, fill=(20,30,40))
        txt(d, (cx+12, cy+12), "92°C", F14, (100,200,255))
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("kettle_basic.png", 200, 200, lambda d,w,h: draw_kettle(d,w,h,(190,180,160),(150,140,120),"基础手冲壶"))
eq_card("kettle_temp.png", 200, 200, lambda d,w,h: draw_kettle(d,w,h,(50,50,55),(30,30,35),"温控手冲壶",True))

# Glass cup
def draw_glass(d, w, h, color, highlight, name):
    cx, cy = w//2, h//2-5
    # Shadow
    d.ellipse((cx-22+2, cy+40+2, cx+22+2, cx+43+2), fill=(0,0,0,60))
    # Body
    d.rectangle((cx-22, cy-15, cx+22, cy+40), fill=color)
    # Highlight
    d.rectangle((cx-20, cy-13, cx-8, cy+38), fill=highlight)
    # Right edge
    d.rectangle((cx+18, cy-13, cx+20, cy+38), fill=highlight)
    # Coffee inside
    d.rectangle((cx-18, cy+8, cx+18, cy+37), fill=(COF[0],COF[1],COF[2],160))
    # Coffee surface
    d.ellipse((cx-18, cy+5, cx+18, cy+12), fill=(COFL[0],COFL[1],COFL[2],180))
    # Rim
    d.ellipse((cx-24, cy-19, cx+24, cy-10), outline=color, width=3)
    d.ellipse((cx-23, cy-18, cx+23, cy-11), fill=(255,255,255,25))
    # Base
    d.ellipse((cx-20, cy+38, cx+20, cy+45), fill=color)
    # Handle
    d.arc((cx+18, cy+5, cx+38, cy+30), 270, 90, fill=color, width=4)
    # Steam
    for sx, sy in [(cx-8, cy-25), (cx+5, cy-32), (cx-2, cy-40)]:
        d.ellipse((sx-4, sy-4, sx+4, sy+4), fill=(255,255,255,50))
    txtc(d, cx, h-18, name, F14, MUT)

eq_card("glass_basic.png", 200, 200, lambda d,w,h: draw_glass(d,w,h,(200,200,210,180),(225,225,232,100),"基础玻璃杯"))
eq_card("glass_crystal.png", 200, 200, lambda d,w,h: draw_glass(d,w,h,(210,200,225,190),(235,228,240,120),"水晶玻璃杯"))


# ============================================================
# 场景背景 - 咖啡馆
# ============================================================
print("\n=== 场景背景 ===")
w, h = 750, 1334
img = new_img(w, h)
d = ImageDraw.Draw(img)

# Deep warm gradient
for y in range(h):
    t = y/h
    r = int(35*(1-t) + 12*t)
    g = int(22*(1-t) + 8*t)
    b = int(14*(1-t) + 6*t)
    d.line([(0,y),(w,y)], fill=(r,g,b))

# Warm glow center top
for y in range(h):
    t_y = y/h
    glow = max(0, 1 - t_y*1.5) * 0.3
    if glow > 0.01:
        d.line([(0,y),(w,y)], fill=(int(255*glow), int(200*glow), int(120*glow)), )

# Wall paneling
for px in range(0, w, 75):
    d.rectangle((px, 0, px+2, 450), fill=(50,35,22))

# Shelves
for sy, items in [(180, 5), (350, 4), (520, 3)]:
    # Shelf board
    d.rectangle((30, sy, w-30, sy+12), fill=(100,65,35))
    d.rectangle((30, sy, w-30, sy+2), fill=(130,85,45))
    # Brackets
    for bx in [60, w-60]:
        d.polygon([(bx, sy+12),(bx+8, sy+30),(bx-8, sy+30)], fill=(80,50,25))
    # Items on shelf
    for i in range(items):
        ix = 80 + i*(w-160)//items
        # Jar
        d.rectangle((ix-15, sy-40, ix+15, sy), fill=(140,180,200,120))
        d.ellipse((ix-17, sy-44, ix+17, sy-36), fill=(180,180,190,150))
        # Coffee beans in jar
        for _ in range(8):
            circle(d, ix-6+(_%4)*4, sy-25+(_//4)*8, 3, (60,35,15))

# Counter
counter_y = 950
d.rectangle((0, counter_y, w, counter_y+20), fill=(120,75,40))
d.rectangle((0, counter_y, w, counter_y+3), fill=(160,105,55))
d.rectangle((0, counter_y+20, w, h), fill=(55,30,15))

# Wood grain on counter
for _ in range(30):
    gx = _*25
    gy = counter_y+5 + (_%3)*4
    d.line([(gx,gy),(gx+18,gy)], fill=(140,90,50,40), width=1)

# Warm pendant lights
for lx in [120, 375, 630]:
    # Light glow
    for r in range(60, 0, -5):
        alpha = int(10 * (1-r/60))
        d.ellipse((lx-r, 10-r//2, lx+r, 10+r//2), fill=(255,220,150,alpha))
    # Fixture
    d.line([(lx,0),(lx,20)], fill=(60,50,40), width=3)
    d.ellipse((lx-15, 15, lx+15, 35), fill=(80,65,40))
    d.ellipse((lx-12, 18, lx+12, 32), fill=(255,230,180,60))

# Vignette effect
mask = Image.new('L', (w, h), 0)
md = ImageDraw.Draw(mask)
for y in range(h):
    for x in range(0, w, 4):
        dx = (x-w/2)/(w/2)
        dy = (y-h/2)/(h/2)
        v = int((dx*dx + dy*dy)*120)
        md.rectangle((x,y,x+4,y+1), fill=min(255,v))
img.putalpha(mask)

img.save(BASE+"/scene/background.png")
print("  background.png")


# ============================================================
# 成品咖啡
# ============================================================
print("\n=== 成品咖啡 ===")

def draw_coffee_cup(fn, coffee_color, name, label):
    w, h = 300, 300
    img = new_img(w, h)
    d = ImageDraw.Draw(img)
    cx, cy = 150, 140

    # Saucer shadow
    d.ellipse((cx-62, cy+60, cx+62, cy+72), fill=(0,0,0,50))
    # Saucer
    d.ellipse((cx-60, cy+58, cx+60, cy+70), fill=(235,230,225))
    d.ellipse((cx-50, cy+59, cx+50, cy+68), fill=(245,242,238))

    # Cup body
    d.rectangle((cx-35, cy-20, cx+35, cy+58), fill=(255,255,255,200))
    # Cup highlight
    d.rectangle((cx-33, cy-18, cx-10, cy+56), fill=(255,255,255,80))

    # Coffee
    d.rectangle((cx-30, cy+10, cx+30, cy+55), fill=coffee_color)
    # Surface
    sf = coffee_color
    d.ellipse((cx-30, cy+7, cx+30, cy+15), fill=(min(255,sf[0]+20), min(255,sf[1]+20), min(255,sf[2]+20), 180))
    # Crema ring
    d.ellipse((cx-28, cy+9, cx+28, cy+13), outline=(min(255,sf[0]+40), min(255,sf[1]+40), min(255,sf[2]+40), 200), width=1)

    # Rim
    d.ellipse((cx-37, cy-24, cx+37, cy-14), outline=(230,225,215), width=3)
    d.ellipse((cx-36, cy-23, cx+36, cy-15), fill=(255,255,255,30))

    # Handle
    d.arc((cx+32, cy+5, cx+55, cy+40), 270, 90, fill=(230,225,215), width=5)

    # Steam
    for sx, sy in [(cx-12, cy-30), (cx+8, cy-40), (cx-3, cy-50), (cx+15, cy-55)]:
        for i, r in enumerate(range(6, 2, -1)):
            d.ellipse((sx-r, sy-r, sx+r, sy+r), fill=(255,255,255,40-i*8))

    # Label
    rr(d, (cx-40, cy+80, cx+40, cy+112), 8, fill=(0,0,0,140))
    txtc(d, cx, cy+96, label, F16, GLD)

    img.save(BASE+"/coffee/"+fn)
    print(f"  {fn}")

draw_coffee_cup("coffee_bright.png", (200,160,60,180), "明亮果酸", "🍋 明亮果酸")
draw_coffee_cup("coffee_sour.png", (60,35,15,200), "厚重酸苦", "🍫 厚重酸苦")
draw_coffee_cup("coffee_caramel.png", (175,130,60,190), "甜感焦糖", "🍯 甜感焦糖")


# ============================================================
# UI 卡片
# ============================================================
print("\n=== UI 卡片 ===")

# Logo
img = new_img(400, 80)
d = ImageDraw.Draw(img)
circle(d, 40, 40, 28, (120,75,40))
circle(d, 40, 40, 22, (160,110,55))
txt(d, (80, 22), "手冲咖啡大赛", F32, GLD)
img.save(BASE+"/ui/logo.png")
print("  logo.png")

# Recipe cards
for fn, emoji, title, color1, color2 in [
    ("recipe_bright.png", "🍋", "明亮果酸", (255,200,50), (200,160,30)),
    ("recipe_sour.png", "🍫", "厚重酸苦", (150,200,100), (100,150,60)),
    ("recipe_caramel.png", "🍯", "甜感焦糖", (200,140,60), (160,100,30)),
]:
    img = new_img(280, 160)
    d = ImageDraw.Draw(img)
    rr(d, (4,4,276,156), 14, fill=CRD)
    # Gradient header
    for x in range(4, 277):
        t = (x-4)/273
        r = int(color1[0]*(1-t)+color2[0]*t)
        g = int(color1[1]*(1-t)+color2[1]*t)
        b = int(color1[2]*(1-t)+color2[2]*t)
        d.line([(x,4),(x,60)], fill=(r,g,b,80))
    rr(d, (4,4,276,60), 14, fill=(0,0,0,0))
    txtc(d, 140, 32, emoji, E36, (0,0,0,0))
    txtc(d, 140, 80, title, F24, GLD)
    txtc(d, 140, 115, title, F16, MUT)
    img.save(BASE+"/ui/"+fn)
    print(f"  {fn}")

print("\n=== 全部完成! ===")
