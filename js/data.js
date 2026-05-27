// ===========================
// 手冲咖啡模拟器 - 游戏数据
// ===========================

const JUDGES = [
  { id: 'taguchi', name: '田口 护', title: '日本精品咖啡协会会长', avatar: '👨‍🍳', skin: '#D4A574', hair: '#555', style: 'classic',
    dialogs: ['让我尝尝你的手艺。好的手冲，一口就醉了。', '咖啡是艺术，也是科学。用心对待每一粒豆子。', '水温、研磨、手法，缺一不可。请开始吧。'] },
  { id: 'hoffmann', name: 'James Hoffmann', title: '世界咖啡师大赛冠军', avatar: '🧔', skin: '#E8C9A0', hair: '#8B7355', style: 'modern',
    dialogs: ['Show me what you\'ve got. I\'m looking for a balanced, clean cup.', 'The pour makes all the difference. Let\'s see your technique.', 'Precision is everything in pour-over. Impress me.'] },
  { id: 'suzuki', name: '铃木 树', title: '东京独立咖啡馆主理人', avatar: '👩‍🦰', skin: '#F5D5B8', hair: '#3A2A1A', style: 'artisan',
    dialogs: ['我喜欢有层次感的风味。请展现你的理解。', '温度和手法都很重要哦。用心去做吧。', '一杯好咖啡，能让人安静下来。拜托了。'] },
  { id: 'park', name: '朴 恩星', title: '韩国咖啡品鉴师', avatar: '👩', skin: '#FBE5D0', hair: '#1A1A1A', style: 'modern',
    dialogs: ['细节决定成败。我对研磨度很敏感。', '请用心对待每一个步骤。我在看着。', '好的咖啡不需要解释，喝一口就懂了。'] },
  { id: 'meyer', name: 'André Meyer', title: '法国咖啡烘焙师', avatar: '🧔‍♂️', skin: '#F0D5C0', hair: '#6B4A3A', style: 'classic',
    dialogs: ['Let the coffee speak for itself. No tricks, just skill.', 'A well-crafted cup is a work of art. Show me yours.', 'I appreciate precision and passion. Don\'t rush.'] },
];

const FLAVORS = {
  bright: { id: 'bright', name: '明亮', icon: '🍋', color: '#FFC832', bg: 'rgba(255,200,50,0.15)', desc: '清爽的果酸，如柑橘般的明亮感，适合浅烘焙' },
  sour:   { id: 'sour', name: '酸苦', icon: '🍫', color: '#96C864', bg: 'rgba(150,200,100,0.15)', desc: '厚重的酸苦平衡，层次丰富，适合中烘焙' },
  caramel:{ id: 'caramel', name: '焦糖', icon: '🍯', color: '#C88C3C', bg: 'rgba(200,140,60,0.15)', desc: '甜美的焦糖风味，口感圆润，适合深烘焙' },
};

const RECIPES = [
  { id: 'bright_recipe', name: '明亮果酸', flavor: 'bright', icon: '🍋',
    desc: '突出咖啡的果酸和花香，采用分段注水，快速萃取前段风味',
    beanWeight: 15, grindSize: 4, waterRatio: 16, recommendSpeed: 'fast',
    params: '豆重15g · 研磨度#4(中细) · 水粉比1:16 · 快速注水' },
  { id: 'sour_recipe', name: '厚重酸苦', flavor: 'sour', icon: '🍫',
    desc: '平衡酸苦，展现咖啡的厚重感与醇度，稳定中速注水',
    beanWeight: 18, grindSize: 6, waterRatio: 14, recommendSpeed: 'medium',
    params: '豆重18g · 研磨度#6(中) · 水粉比1:14 · 中速注水' },
  { id: 'caramel_recipe', name: '甜感焦糖', flavor: 'caramel', icon: '🍯',
    desc: '充分萃取甜味物质，焦糖般的甜美余韵，慢速闷蒸',
    beanWeight: 20, grindSize: 7, waterRatio: 12, recommendSpeed: 'slow',
    params: '豆重20g · 研磨度#7(中粗) · 水粉比1:12 · 慢速注水' },
];

const SPEEDS = {
  fast:   { id: 'fast',   name: '快速', icon: '💨', time: 60,  label: '60秒' },
  medium: { id: 'medium', name: '中速', icon: '💧', time: 120, label: '120秒' },
  slow:   { id: 'slow',   name: '慢速', icon: '🫧', time: 180, label: '180秒' },
};

const CATEGORY_META = {
  beans:         { name: '咖啡豆',   icon: '🫘', desc: '决定风味基调' },
  filter_cone:   { name: '滤杯',     icon: '🔻', desc: '影响萃取均匀度' },
  filter_paper:  { name: '滤纸',     icon: '📄', desc: '影响流速和纯净度' },
  carafe:        { name: '分享壶',   icon: '🫗', desc: '美观加分' },
  scale:         { name: '电子秤',   icon: '⚖️', desc: '称重精度' },
  grinder:       { name: '磨豆器',   icon: '⚙️', desc: '研磨均匀度和速度' },
  kettle:        { name: '手冲壶',   icon: '🫖', desc: '控温精度' },
  glass:         { name: '玻璃杯',   icon: '🥛', desc: '美观加分' },
};

const EQUIPMENT = {
  beans: [
    { id: 'basic_blend',  name: '基础拼配豆', tier: 'basic', price: 0,   flavorBonus: 0,  flavorMatch: null,     desc: '日常拼配，均衡稳定',                detail: '巴西+哥伦比亚拼配，坚果巧克力调性' },
    { id: 'yirgacheffe',  name: '耶加雪菲',   tier: 'advanced', price: 300, flavorBonus: 10, flavorMatch: 'bright',  desc: '埃塞俄比亚精品豆，柑橘花香四溢',    detail: '水洗处理，浅烘焙，茉莉花与柠檬香气' },
    { id: 'geisha',       name: '瑰夏',       tier: 'advanced', price: 500, flavorBonus: 20, flavorMatch: null,     desc: '巴拿马瑰夏，顶级花香甜感',          detail: '日晒处理，极浅烘焙，复合花果香' },
    { id: 'mandheling',   name: '曼特宁',     tier: 'advanced', price: 400, flavorBonus: 15, flavorMatch: 'caramel', desc: '印尼曼特宁，醇厚低酸',              detail: '湿刨法，深烘焙，黑巧克力与焦糖' },
  ],
  filter_cone: [
    { id: 'cone_plastic', name: '塑料V60滤杯', tier: 'basic',   price: 0,   completionBonus: 0, desc: '基础款，轻便实用',                  detail: 'AS树脂材质，螺旋肋骨设计' },
    { id: 'cone_ceramic', name: '陶瓷V60滤杯', tier: 'advanced',price: 300, completionBonus: 5, desc: '保温性好，萃取更稳定',              detail: '有田烧陶瓷，保温佳，萃取均匀' },
  ],
  filter_paper: [
    { id: 'paper_bleached', name: '漂白滤纸',   tier: 'basic',    price: 0,   completionBonus: 0, desc: '标准滤纸，经济实惠',                detail: '氧气漂白，无纸味' },
    { id: 'paper_bamboo',   name: '竹浆滤纸',   tier: 'advanced', price: 150, completionBonus: 3, desc: '天然竹浆，流速均匀',                detail: '竹纤维材质，水流更稳定' },
  ],
  carafe: [
    { id: 'carafe_glass',   name: '玻璃分享壶',   tier: 'basic',    price: 0,   aestheticsBonus: 1, desc: '普通玻璃材质',                    detail: '高硼硅玻璃，刻度清晰' },
    { id: 'carafe_crystal', name: '水晶分享壶',   tier: 'advanced', price: 250, aestheticsBonus: 5, desc: '晶莹剔透，颜值加分',              detail: '水晶玻璃，光影效果出众' },
  ],
  scale: [
    { id: 'scale_basic',     name: '基础电子秤',   tier: 'basic',    price: 0,   accuracy: 2,   completionBonus: 0, weighTime: 30, desc: '精度±2g，基础计时',              detail: '最大称重2kg，0.1g显示' },
    { id: 'scale_precision', name: '精密电子秤',   tier: 'advanced', price: 350, accuracy: 0.5, completionBonus: 3, weighTime: 20, desc: '精度±0.5g，称量更准更快',         detail: '最大称重3kg，0.01g显示，带计时' },
  ],
  grinder: [
    { id: 'grinder_ceramic',  name: '陶瓷芯手动磨豆器', tier: 'basic',    price: 0,   completionBonus: 0, grindTime: 120, desc: '入门款，研磨耗时',                detail: '陶瓷磨芯，均匀度一般' },
    { id: 'grinder_steel',    name: '钢芯手动磨豆器',   tier: 'advanced', price: 400, completionBonus: 8, grindTime: 90,  desc: '钢芯刀盘，均匀度高，研磨更快',    detail: '高品质钢芯，研磨一致性好' },
    { id: 'grinder_electric', name: '电动磨豆器',       tier: 'advanced', price: 800, completionBonus: 3, grindTime: 30,  desc: '极速研磨，省时利器',              detail: '电机驱动，30秒极速研磨' },
  ],
  kettle: [
    { id: 'kettle_basic', name: '基础手冲壶',   tier: 'basic',    price: 0,   completionBonus: 0, desc: '基础鹅颈壶，水流可控',            detail: '不锈钢材质，细长壶嘴' },
    { id: 'kettle_temp',  name: '温控手冲壶',   tier: 'advanced', price: 600, completionBonus: 3, desc: '精准控温±1°C，萃取更稳定',       detail: 'PID温控，设定温度精确出水' },
  ],
  glass: [
    { id: 'glass_basic',   name: '基础玻璃杯',   tier: 'basic',    price: 0,   aestheticsBonus: 1, desc: '简洁耐看',                        detail: '双层隔热设计' },
    { id: 'glass_crystal', name: '水晶玻璃杯',   tier: 'advanced', price: 200, aestheticsBonus: 3, desc: '透亮质感，提升出品档次',          detail: '水晶级玻璃，光影迷人' },
  ],
};
