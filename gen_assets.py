#!/usr/bin/env python3
"""用 PIL 绘制游戏素材 —— 暖色调卡牌风格"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import os, math

BASE = "/Users/wb/Downloads/NewGame/img"
os.makedirs(BASE + "/judges", exist_ok=True)
os.makedirs(BASE + "/beans", exist_ok=True)
os.makedirs(BASE + "/equipment", exist_ok=True)
os.makedirs(BASE + "/scene", exist_ok=True)
os.makedirs(BASE + "/coffee", exist_ok=True)
os.makedirs(BASE + "/ui", exist_ok=True)

# Color palette - warm coffee shop
C_CREAM = (255, 248, 240)
C_WOOD = (139, 90, 43)
C_DARK_WOOD = (80, 45, 20)
C_GOLD = (200, 169, 81)
C_GOLD_LIGHT = (230, 200, 120)
C_COFFEE = (101, 67, 33)
C_COFFEE_LIGHT = (160, 120, 70)
C_DARK = (26, 13, 8)
C_RED = (180, 70, 70)
C_GREEN = (100, 160, 80)
C_BLUE = (80, 120, 180)
C_WHITE = (255, 255, 255)
C_BG = (40, 25, 15)
C_CARD = (50, 35, 25)
C_CARD_LIGHT = (70, 50, 35)

try:
    FONT = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 28)
    FONT_SM = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 20)
    FONT_LG = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 36)
    FONT_EMOJI = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 80)
    FONT_EMOJI_MD = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 60)
    FONT_EMOJI_SM = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 40)
except:
    FONT = ImageFont.load_default()
    FONT_SM = FONT
    FONT_LG = FONT
    FONT_EMOJI = FONT
    FONT_EMOJI_MD = FONT
    FONT_EMOJI_SM = FONT

def round_rect(draw, xy, r, fill=None, outline=None):
    """Draw rounded rectangle"""
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, r, fill=fill, outline=outline)

def card_bg(size=(300, 300), color=C_CARD):
    img = Image.new('RGBA', size, (0,0,0,0))
    d = ImageDraw.Draw(img)
    round_rect(d, (10, 10, size[0]-10, size[1]-10), 20, fill=color)
    # inner highlight
    round_rect(d, (12, 12, size[0]-12, 28), 16, fill=(255,255,255,30))
    # shadow
    shadow = Image.new('RGBA', size, (0,0,0,0))
    sd = ImageDraw.Draw(shadow)
    round_rect(sd, (14, 14, size[0]-6, size[1]-6), 20, fill=(0,0,0,80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    img = Image.alpha_composite(shadow, img)
    return img

def add_center_emoji(img, emoji, font=None, y_off=0):
    if font is None: font = FONT_EMOJI
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0,0), emoji, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    x = (img.width - tw) / 2
    y = (img.height - th) / 2 + y_off
    # shadow
    d.text((x+2, y+2), emoji, font=font, fill=(0,0,0,60))
    d.text((x, y), emoji, font=font, embedded_color=True)
    return img

def add_label(img, text, y=None, font=None, color=C_CREAM):
    if font is None: font = FONT_SM
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0,0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (img.width - tw) / 2
    if y is None: y = img.height - 40
    # bg pill
    round_rect(d, (x-12, y-8, x+tw+12, y+bbox[3]-bbox[1]+8), 14, fill=(0,0,0,120))
    d.text((x, y), text, font=font, fill=color)
    return img

# ==========================================
# UI 元素
# ==========================================
print("=== UI 元素 ===")

# Logo
img = Image.new('RGBA', (400, 80), (0,0,0,0))
d = ImageDraw.Draw(img)
bbox = d.textbbox((0,0), "☕", font=FONT_EMOJI)
d.text((20, 5), "☕", font=FONT_EMOJI, embedded_color=True)
d.text((105, 18), "手冲咖啡大赛", font=FONT_LG, fill=C_GOLD)
img.save(BASE + "/ui/logo.png")
print("  logo.png")

# Button gold
for name, w, text, bg, fg in [
    ("btn_gold", 220, None, C_GOLD, C_DARK),
    ("btn_brown", 180, None, C_WOOD, C_CREAM),
    ("btn_outline", 180, None, (0,0,0,0), C_GOLD),
]:
    img = Image.new('RGBA', (w+40, 60), (0,0,0,0))
    d = ImageDraw.Draw(img)
    if bg == (0,0,0,0):
        round_rect(d, (2,2,w+36,58), 28, outline=fg, fill=(0,0,0,0))
    else:
        round_rect(d, (2,2,w+36,58), 28, fill=bg)
    if text:
        bbox = d.textbbox((0,0), text, font=FONT)
        tw = bbox[2]-bbox[0]
        d.text(((img.width-tw)/2, 14), text, font=FONT, fill=fg)
    img.save(BASE + f"/ui/{name}.png")
    print(f"  {name}.png")

# Card backgrounds
for name, c in [("card_dark", C_CARD), ("card_light", C_CARD_LIGHT), ("card_gold", (60,50,30))]:
    img = card_bg(color=c)
    img.save(BASE + f"/ui/{name}.png")

print("  card backgrounds done")

# ==========================================
# 评委头像
# ==========================================
print("\n=== 评委头像 ===")
judges_data = [
    ("judge_tian", "🧑‍🍳", "田口护", (180, 140, 100)),
    ("judge_james", "🤵", "James", (120, 140, 180)),
    ("judge_suzuki", "👩‍🦰", "铃木树", (200, 150, 150)),
    ("judge_park", "👩‍💼", "朴恩星", (150, 140, 180)),
    ("judge_andre", "🧔", "André", (160, 150, 130)),
]

for fn, emoji, name, bg_color in judges_data:
    img = Image.new('RGBA', (256, 256), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Circle bg
    cx, cy, r = 128, 110, 90
    d.ellipse((cx-r, cy-r, cx+r, cy+r), fill=bg_color)
    d.ellipse((cx-r+3, cy-r+3, cx+r-3, cy+r-3), fill=tuple(min(v+30,255) for v in bg_color))
    # Emoji
    bbox = d.textbbox((0,0), emoji, font=FONT_EMOJI)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text((cx-tw/2+2, cy-th/2+2), emoji, font=FONT_EMOJI, fill=(0,0,0,60))
    d.text((cx-tw/2, cy-th/2), emoji, font=FONT_EMOJI, embedded_color=True)
    # Name
    bbox = d.textbbox((0,0), name, font=FONT)
    tw = bbox[2]-bbox[0]
    round_rect(d, (cx-tw/2-14, 210, cx+tw/2+14, 246), 16, fill=(0,0,0,150))
    d.text((cx-tw/2, 212), name, font=FONT, fill=C_GOLD)
    img.save(BASE + f"/judges/{fn}.png")
    print(f"  {fn}.png")

# ==========================================
# 咖啡豆卡片
# ==========================================
print("\n=== 咖啡豆 ===")
beans_data = [
    ("bean_basic", "🫘", "基础拼配", "混合·无限使用", (160, 130, 90)),
    ("bean_yirgacheffe", "🌸", "耶加雪菲", "花果香·高级豆", (140, 170, 140)),
    ("bean_geisha", "👑", "瑰夏", "稀有·顶级风味", (200, 180, 100)),
    ("bean_mandheling", "🍫", "曼特宁", "浓郁醇厚·经典", (120, 80, 60)),
]
for fn, emoji, name, desc, bg_color in beans_data:
    img = card_bg(size=(256, 280), color=C_CARD)
    d = ImageDraw.Draw(img)
    # Emoji in circle
    cx, cy = 148, 90
    d.ellipse((cx-50, cy-50, cx+50, cy+50), fill=bg_color)
    bbox = d.textbbox((0,0), emoji, font=FONT_EMOJI)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text((cx-tw/2, cy-th/2-2), emoji, font=FONT_EMOJI, embedded_color=True)
    # Name
    bbox = d.textbbox((0,0), name, font=FONT)
    tw = bbox[2]-bbox[0]
    d.text((148-tw/2, 165), name, font=FONT, fill=C_GOLD)
    # Desc
    bbox = d.textbbox((0,0), desc, font=FONT_SM)
    tw = bbox[2]-bbox[0]
    d.text((148-tw/2, 200), desc, font=FONT_SM, fill=(180,160,140))
    img.save(BASE + f"/beans/{fn}.png")
    print(f"  {fn}.png")

# ==========================================
# 装备图标
# ==========================================
print("\n=== 装备 ===")
equips_data = [
    ("cone_plastic", "☕", "塑料V60", (220,220,210)),
    ("cone_ceramic", "🫖", "陶瓷V60", (200,120,80)),
    ("paper_bleached", "📄", "漂白滤纸", (240,240,235)),
    ("paper_bamboo", "📜", "竹浆滤纸", (210,190,150)),
    ("carafe_glass", "🫗", "玻璃分享壶", (200,210,230)),
    ("carafe_crystal", "💎", "水晶分享壶", (220,210,240)),
    ("scale_basic", "⚖️", "基础电子秤", (80,80,85)),
    ("scale_precision", "⚖️", "精密电子秤", (160,160,165)),
    ("grinder_ceramic", "🪵", "陶瓷芯磨豆器", (170,130,80)),
    ("grinder_steel", "⚙️", "钢芯磨豆器", (180,180,185)),
    ("grinder_electric", "🔌", "电动磨豆器", (140,140,150)),
    ("kettle_basic", "🫖", "基础手冲壶", (190,180,160)),
    ("kettle_temp", "🌡️", "温控手冲壶", (60,60,65)),
    ("glass_basic", "🥛", "基础玻璃杯", (200,210,230)),
    ("glass_crystal", "🥂", "水晶玻璃杯", (210,200,230)),
]
for fn, emoji, name, bg_color in equips_data:
    img = card_bg(size=(200, 200), color=C_CARD)
    d = ImageDraw.Draw(img)
    cx, cy = 120, 80
    d.ellipse((cx-45, cy-45, cx+45, cy+45), fill=bg_color)
    bbox = d.textbbox((0,0), emoji, font=FONT_EMOJI_MD)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text((cx-tw/2, cy-th/2-2), emoji, font=FONT_EMOJI_MD, embedded_color=True)
    bbox = d.textbbox((0,0), name, font=FONT_SM)
    tw = bbox[2]-bbox[0]
    d.text((120-tw/2, 145), name, font=FONT_SM, fill=C_CREAM)
    img.save(BASE + f"/equipment/{fn}.png")
    print(f"  {fn}.png")

# ==========================================
# 场景背景
# ==========================================
print("\n=== 场景背景 ===")
img = Image.new('RGB', (750, 1334), C_BG)
d = ImageDraw.Draw(img)
# Warm gradient background
for y in range(1334):
    t = y / 1334
    r = int(40*(1-t) + 15*t)
    g = int(25*(1-t) + 10*t)
    b = int(15*(1-t) + 8*t)
    d.line([(0,y), (750,y)], fill=(r,g,b))

# Shelves
for sx, sy, sw in [(50, 200, 300), (400, 150, 300), (100, 500, 250)]:
    d.rounded_rectangle((sx, sy, sx+sw, sy+15), 5, fill=(60,40,20))
    # items on shelf
    for i in range(3):
        ix = sx + 30 + i*90
        d.ellipse((ix, sy-30, ix+40, sy), fill=(80,55,30))
        d.ellipse((ix+5, sy-25, ix+35, sy-5), fill=(100,70,40))

# Counter
d.rounded_rectangle((0, 900, 750, 930), 0, fill=C_WOOD)
d.rectangle((0, 930, 750, 1334), fill=(60,35,15))

# Warm lights
for lx in [150, 375, 600]:
    d.ellipse((lx-40, 30, lx+40, 90), fill=(255,220,150,40))
    d.ellipse((lx-20, 40, lx+20, 75), fill=(255,240,200,60))

# Vignette
for y in range(1334):
    for x in range(750):
        dx = abs(x-375)/375
        dy = abs(y-667)/667
        v = (dx*dx + dy*dy) * 0.3
        if v > 0:
            px = img.getpixel((x,y))
            img.putpixel((x,y), tuple(max(0, int(p*(1-v))) for p in px))

img.save(BASE + "/scene/background.png")
print("  background.png")

# ==========================================
# 成品咖啡
# ==========================================
print("\n=== 成品咖啡 ===")
coffee_data = [
    ("coffee_bright", "🍋", "明亮果酸", (200, 150, 60), (240, 210, 140)),
    ("coffee_sour", "🍫", "厚重酸苦", (60, 35, 15), (100, 60, 30)),
    ("coffee_caramel", "🍯", "甜感焦糖", (180, 130, 60), (220, 180, 100)),
]
for fn, emoji, name, cup_color, coffee_color in coffee_data:
    img = Image.new('RGBA', (300, 300), (0,0,0,0))
    d = ImageDraw.Draw(img)
    # Cup
    cx, cy = 150, 160
    cup_w, cup_top, cup_bot = 80, 100, 90
    # cup body
    d.polygon([
        (cx-cup_w, cup_top-20),
        (cx-cup_bot, cup_top+80),
        (cx+cup_bot, cup_top+80),
        (cx+cup_w, cup_top-20),
    ], fill=(255,255,255,180))
    # coffee inside
    d.ellipse((cx-cup_w+3, cup_top-18, cx+cup_w-3, cup_top+5), fill=coffee_color)
    # steam
    for sx, sy in [(cx-15, cup_top-40), (cx+10, cup_top-55), (cx-5, cup_top-70)]:
        d.ellipse((sx-8, sy-8, sx+8, sy+8), fill=(255,255,255,100))
    # emoji
    bbox = d.textbbox((0,0), emoji, font=FONT_EMOJI_SM)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text((cx-tw/2, cup_top-100), emoji, font=FONT_EMOJI_SM, embedded_color=True)
    # name
    bbox = d.textbbox((0,0), name, font=FONT)
    tw = bbox[2]-bbox[0]
    round_rect(d, (cx-tw/2-12, cup_top+90, cx+tw/2+12, cup_top+130), 14, fill=(0,0,0,140))
    d.text((cx-tw/2, cup_top+93), name, font=FONT, fill=C_GOLD)
    # saucer
    d.ellipse((cx-55, cup_top+78, cx+55, cup_top+92), fill=(220,210,200,180))
    img.save(BASE + f"/coffee/{fn}.png")
    print(f"  {fn}.png")

# ==========================================
# 配方卡片
# ==========================================
print("\n=== 配方卡片 ===")
recipes_data = [
    ("recipe_bright", "🍋", "明亮果酸", "15g · 研磨#4 · 1:16 · 快速"),
    ("recipe_sour", "🍫", "厚重酸苦", "18g · 研磨#6 · 1:14 · 中速"),
    ("recipe_caramel", "🍯", "甜感焦糖", "20g · 研磨#7 · 1:12 · 慢速"),
]
for fn, emoji, name, params in recipes_data:
    img = card_bg(size=(280, 160), color=C_CARD)
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0,0), emoji, font=FONT_EMOJI_MD)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text((30-th/2, 50-th/2), emoji, font=FONT_EMOJI_MD, embedded_color=True)
    d.text((100, 35), name, font=FONT, fill=C_GOLD)
    d.text((100, 75), params, font=FONT_SM, fill=(180,160,140))
    img.save(BASE + f"/ui/{fn}.png")
    print(f"  {fn}.png")

print("\n=== 全部完成! ===")
