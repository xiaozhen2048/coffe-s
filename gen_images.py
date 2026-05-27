#!/usr/bin/env python3
"""批量生成游戏图片素材 - 使用 Pollinations AI API"""
import urllib.request
import urllib.parse
import os
import time

BASE = "/Users/wb/Downloads/NewGame/img"
STYLE = "warm hand-drawn casual cooking game art style, soft lighting, rich warm brown tones, clean outlines, mobile game asset, white background, no text, no watermark"

def gen(url, path):
    if os.path.exists(path):
        print(f"  SKIP (exists): {os.path.basename(path)}")
        return
    print(f"  Generating: {os.path.basename(path)} ...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=120).read()
        with open(path, 'wb') as f:
            f.write(data)
        print(f"  OK: {os.path.basename(path)} ({len(data)} bytes)")
    except Exception as e:
        print(f"  FAIL: {os.path.basename(path)} - {e}")

def enc(prompt):
    return urllib.parse.quote(prompt + ", " + STYLE)

def url512(prompt):
    return f"https://image.pollinations.ai/prompt/{enc(prompt)}?width=512&height=512&nologo=true"

def url_portrait(prompt):
    return f"https://image.pollinations.ai/prompt/{enc(prompt)}?width=750&height=1334&nologo=true"

# ========== 评委头像 ==========
print("\n=== 评委头像 ===")
judges = [
    ("judge_tian.png", "Elderly Japanese man in his 70s, gentle smile, wearing brown barista apron over white shirt, round glasses, short gray hair, half-body portrait"),
    ("judge_james.png", "British man in his 40s, bald head, well-groomed beard, wearing navy blazer over white dress shirt, confident expression holding coffee cup, half-body portrait"),
    ("judge_suzuki.png", "Young Japanese woman in her 20s, ponytail, bright smile, wearing stylish beige cafe uniform, bright eyes, half-body portrait"),
    ("judge_park.png", "Korean woman in her 30s, elegant bob haircut, soft professional expression, wearing cream-colored blouse, delicate silver necklace, half-body portrait"),
    ("judge_andre.png", "French man in his 50s, silver hair styled back, thin mustache, wearing black turtleneck, sophisticated warm demeanor, half-body portrait"),
]
for fn, prompt in judges:
    gen(url512(prompt), os.path.join(BASE, "judges", fn))
    time.sleep(1)

# ========== 咖啡豆 ==========
print("\n=== 咖啡豆 ===")
beans = [
    ("bean_basic.png", "Burlap sack of mixed medium-roast coffee beans, some beans scattered on wooden table, simple rustic look"),
    ("bean_yirgacheffe.png", "Small cloth bag of light-roast Ethiopian coffee beans, green-blue bag with Ethiopian pattern, beans visible, floral motifs"),
    ("bean_geisha.png", "Premium gold-accented pouch of rare Geisha coffee beans, medium-light roast, elegant packaging"),
    ("bean_mandheling.png", "Dark brown kraft bag of Sumatra Mandheling dark-roast coffee beans, rich oily beans, earthy packaging"),
]
for fn, prompt in beans:
    gen(url512(prompt), os.path.join(BASE, "beans", fn))
    time.sleep(1)

# ========== 装备 ==========
print("\n=== 装备 ===")
equips = [
    ("cone_plastic.png", "White plastic V60 coffee dripper with spiral ridges, front angle view, simple affordable look"),
    ("cone_ceramic.png", "Matte red-brown ceramic V60 coffee dripper with smooth glaze, spiral ridges, premium artisan look"),
    ("paper_bleached.png", "Stack of white bleached cone-shaped coffee filter papers, slightly translucent, crisp white"),
    ("paper_bamboo.png", "Stack of natural unbleached brown cone-shaped coffee filter papers, slightly textured, eco-friendly"),
    ("carafe_glass.png", "Clear glass coffee server carafe with handle, transparent with subtle light reflections, simple design"),
    ("carafe_crystal.png", "Elegant crystal glass coffee server with diamond-cut patterns, sparkling reflections, premium luxurious"),
    ("scale_basic.png", "Simple black digital kitchen scale with LCD screen, compact budget look"),
    ("scale_precision.png", "Silver precision digital scale with large backlit LCD, professional lab-grade, metal platform"),
    ("grinder_ceramic.png", "Classic wooden-handle manual coffee grinder with ceramic burrs, brass and wood body, small drawer, vintage"),
    ("grinder_steel.png", "Sleek stainless steel manual coffee grinder with steel burrs, modern minimalist, metal crank handle"),
    ("grinder_electric.png", "Compact electric coffee grinder with transparent bean hopper on top, stainless steel body, modern appliance"),
    ("kettle_basic.png", "Simple brushed stainless steel gooseneck kettle, long thin spout, basic handle"),
    ("kettle_temp.png", "Premium gooseneck kettle with digital temperature display base, matte black body, sleek modern"),
    ("glass_basic.png", "Plain clear glass coffee mug, simple cylindrical shape, transparent with subtle highlights"),
    ("glass_crystal.png", "Elegant crystal-cut glass coffee mug with faceted surface, sparkling refractive light, premium barware"),
]
for fn, prompt in equips:
    gen(url512(prompt), os.path.join(BASE, "equipment", fn))
    time.sleep(1)

# ========== 场景背景 ==========
print("\n=== 场景背景 ===")
gen(url_portrait("Cozy warm-lit coffee shop interior, wooden counter in foreground, shelves with coffee jars and equipment, warm amber pendant lights, soft bokeh, comfortable atmosphere, empty counter space in center"), os.path.join(BASE, "scene", "background.png"))

# ========== 成品咖啡 ==========
print("\n=== 成品咖啡 ===")
coffees = [
    ("coffee_bright.png", "Glass cup of light amber pour-over coffee, bright translucent, hint of citrus, clean crisp, on wooden table with soft morning light"),
    ("coffee_sour.png", "Glass cup of deep dark brown pour-over coffee, rich bold appearance, strong body, intense color, on dark wood table"),
    ("coffee_caramel.png", "Glass cup of warm caramel-brown pour-over coffee, golden-brown crema on top, sweet mellow, gentle steam rising"),
]
for fn, prompt in coffees:
    gen(url512(prompt), os.path.join(BASE, "coffee", fn))
    time.sleep(1)

print("\n=== 全部完成! ===")
