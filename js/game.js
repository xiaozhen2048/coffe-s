// ===========================
// 手冲咖啡模拟器 - 游戏状态 & 核心逻辑
// ===========================

const G = {
  points: 500,
  round: 0,
  phase: 'idle', // idle | judge | prep | brewing | scoring | shop

  owned: {
    beans: ['basic_blend'],
    filter_cone: ['cone_plastic'],
    filter_paper: ['paper_bleached'],
    carafe: ['carafe_glass'],
    scale: ['scale_basic'],
    grinder: ['grinder_ceramic'],
    kettle: ['kettle_basic'],
    glass: ['glass_basic'],
  },
  beanUses: { basic_blend: Infinity },

  selection: {
    bean: 'basic_blend',
    grinder: 'grinder_ceramic',
    recipe: null,
    speed: 'medium',
  },

  judge: null,
  brewTotalTime: 0,
  brewTimer: 0,
  brewInterval: null,
  speedMult: 1,
};

function isOwned(cat, id) {
  return G.owned[cat] && G.owned[cat].includes(id);
}

function getEquip(cat, id) {
  return EQUIPMENT[cat].find(e => e.id === id);
}

function bestOwned(cat) {
  const ids = G.owned[cat];
  if (!ids || ids.length === 0) return null;
  const items = EQUIPMENT[cat].filter(e => ids.includes(e.id));
  return items[items.length - 1];
}

function hasBeanUses(id) {
  return id === 'basic_blend' || (G.beanUses[id] || 0) > 0;
}

function consumeBean(id) {
  if (id === 'basic_blend') return;
  if (G.beanUses[id] > 0) {
    G.beanUses[id]--;
    if (G.beanUses[id] <= 0) {
      G.owned.beans = G.owned.beans.filter(b => b !== id);
    }
  }
}

function setPhase(phase) {
  G.phase = phase;
}

// ---- Round flow ----

function startRound() {
  clearBrewTimer();
  G.brewTimer = 0;
  G.speedMult = 1;
  G.round++;

  // Auto-select best available bean
  const availableBeans = G.owned.beans.filter(b => hasBeanUses(b));
  G.selection = {
    bean: availableBeans.includes('basic_blend') ? 'basic_blend' : (availableBeans[0] || 'basic_blend'),
    grinder: G.owned.grinder[G.owned.grinder.length - 1] || 'grinder_ceramic',
    recipe: null,
    speed: 'medium',
  };

  G.judge = { ...JUDGES[Math.floor(Math.random() * JUDGES.length)] };
  const keys = Object.keys(FLAVORS);
  G.judge.flavor = keys[Math.floor(Math.random() * keys.length)];
  G.judge.dialog = G.judge.dialogs[Math.floor(Math.random() * G.judge.dialogs.length)];

  setPhase('judge');
  UIRefresh();
}

function goPrep() {
  setPhase('prep');
  UIRefresh();
}

function startBrewing() {
  if (!G.selection.recipe) { toast('请先选择一个配方'); return; }

  consumeBean(G.selection.bean);

  G.brewTimer = 0;
  G.speedMult = 1;
  const grinder = getEquip('grinder', G.selection.grinder);
  const scale = bestOwned('scale');
  const speed = SPEEDS[G.selection.speed];

  const steps = [
    { name: '称量咖啡豆', icon: '⚖️', detail: `目标${G.selection.recipe.beanWeight}g · 精度±${scale.accuracy}g`, time: scale.weighTime, key: 'weigh' },
    { name: '研磨咖啡豆', icon: '⚙️', detail: `研磨度#${G.selection.recipe.grindSize} · ${grinder.name}`, time: grinder.grindTime, key: 'grind' },
    { name: '装滤纸·放滤杯', icon: '📄', detail: '滤纸放入滤杯，置于分享壶上', time: 15, key: 'setup' },
    { name: '手冲注水', icon: '🫖', detail: `水粉比1:${G.selection.recipe.waterRatio} · ${speed.name}注水 · 水量${G.selection.recipe.beanWeight * G.selection.recipe.waterRatio}g`, time: speed.time, key: 'pour' },
    { name: '倒杯出品', icon: '🥛', detail: '将咖啡液倒入玻璃杯', time: 10, key: 'serve' },
  ];

  G.brewSteps = steps;
  G.brewTotalTime = steps.reduce((s, st) => s + st.time, 0);
  clearParticles();
  G.brewMonologues = generateMonologues();

  setPhase('brewing');
  UIRefresh();
  if (animCanvas) resizeCanvas();

  runBrewAnimation(steps);
}

function runBrewAnimation(steps) {
  const total = G.brewTotalTime;
  let curStep = -1;
  let stepElapsed = 0;
  const interval = 100;

  function renderActive(activeIdx) {
    renderBrewSteps(steps, activeIdx);
    const pct = Math.min((G.brewTimer / total) * 100, 100);
    document.getElementById('brew-progress').style.width = pct + '%';
    updateBrewTimerUI();
    updateCanvas(G.brewTimer, total, activeIdx);
  }

  G.brewInterval = setInterval(() => {
    const dt = (interval / 1000) * G.speedMult;
    G.brewTimer += dt;
    stepElapsed += dt;

    if (curStep < steps.length) {
      const dur = curStep >= 0 ? steps[curStep].time : 0;
      if (curStep < 0 || stepElapsed >= dur) {
        curStep++;
        stepElapsed = 0;
        if (curStep < steps.length) renderActive(curStep);
      }
    }

    const pct = Math.min((G.brewTimer / total) * 100, 100);
    document.getElementById('brew-progress').style.width = pct + '%';
    updateBrewTimerUI();
    updateCanvas(G.brewTimer, total, curStep >= steps.length ? steps.length : curStep);

    if (G.brewTimer >= total) {
      clearBrewTimer();
      G.brewTimer = total;
      updateBrewTimerUI();
      document.getElementById('brew-progress').style.width = '100%';
      renderBrewSteps(steps, steps.length);
      updateCanvas(total, total, steps.length);
      setTimeout(finishBrewing, 800);
    }
  }, interval);
}

function clearBrewTimer() {
  if (G.brewInterval) { clearInterval(G.brewInterval); G.brewInterval = null; }
}

function toggleSpeed() {
  if (G.speedMult === 1) { G.speedMult = 5; document.getElementById('speed-btn').textContent = '⚡ 5倍速'; }
  else if (G.speedMult === 5) { G.speedMult = 10; document.getElementById('speed-btn').textContent = '⚡ 10倍速'; }
  else { G.speedMult = 1; document.getElementById('speed-btn').textContent = '⚡ 1倍速'; }
}

function updateBrewTimerUI() {
  const t = Math.floor(G.brewTimer);
  const m = Math.floor(t / 60), s = t % 60;
  const el = document.getElementById('timer');
  el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  el.classList.remove('timer-warn', 'timer-danger');
  if (t > 300) el.classList.add('timer-danger');
  else if (t > 240) el.classList.add('timer-warn');
}

// ---- Monologue system ----

function generateMonologues() {
  const recipe = G.selection.recipe;
  const bean = getEquip('beans', G.selection.bean);
  const grinder = getEquip('grinder', G.selection.grinder);
  const recipeMatch = recipe.flavor === G.judge.flavor;
  const speedMatch = recipe.recommendSpeed === G.selection.speed;
  const beanTier = bean.tier;
  const grinderTier = grinder.tier;
  const grindTime = grinder.grindTime;

  const monos = [];

  // Accumulated time tracker for placing monologues
  const scale = bestOwned('scale');
  let t = scale.weighTime; // after weighing

  // --- Monologue 1: Grinding (~30% into grind step) ---
  t += grindTime * 0.3;

  const grindLines = {
    great: [
      '这钢芯研磨真是顺滑，每一粒都均匀细腻。',
      '研磨声清脆悦耳，颗粒度完美。',
      '好磨豆器就是不一样，手感流畅极了。',
    ],
    good: [
      '还可以，研磨速度挺快的。',
      '电动真省力，几秒钟就搞定了。',
      '研磨完成，颗粒看起来还行。',
    ],
    ok: [
      '嗯...这研磨声有点涩，是不是该升级磨豆器了？',
      '手动磨豆有点累，但为了好咖啡值得。',
      '感觉粗细不太均匀，但也将就吧。',
    ],
    bad: [
      '这研磨声听着就不太对...会不会太粗了？',
      '糟糕，颗粒大小很不均匀，萃取肯定会受影响。',
      '研磨花了这么久，手都酸了...下次得换个好的。',
    ],
  };

  const beanLines = {
    advanced_good: [
      '这豆子成色真不错，光是研磨就闻到花果香了。',
      '好豆子的香气就是不一样，已经开始期待了。',
    ],
    advanced: [
      '这豆子的品质，应该能出好风味。',
      '闻到豆香了，真不错。',
    ],
    basic: [
      '普通拼配豆，不过新鲜度还行。',
      '基础豆子，香气一般般。',
    ],
  };

  let grindQuality;
  if (grinderTier === 'advanced' && grindTime <= 30) grindQuality = 'good';       // electric
  else if (grinderTier === 'advanced' && grindTime <= 90) grindQuality = 'great'; // steel manual
  else grindQuality = 'bad'; // basic ceramic

  let grindText;
  if (grindQuality === 'great') {
    grindText = pick(grindLines.great);
    if (beanTier === 'advanced') grindText += ' ' + pick(beanLines.advanced_good);
    else grindText += ' ' + pick(beanLines.basic);
  } else if (grindQuality === 'good') {
    grindText = pick(grindLines.good);
    if (beanTier === 'advanced') grindText += ' ' + pick(beanLines.advanced);
  } else {
    grindText = pick(grindLines.bad);
    if (beanTier === 'advanced') grindText += ' 可惜了这么好的豆子。';
  }

  monos.push({ time: Math.floor(t), text: grindText, icon: '⚙️' });

  // --- Monologue 2: Setup/observation (~just before pour) ---
  t += grindTime * 0.5 + 15; // rest of grind + setup
  const setupLines = {
    match: [
      '滤纸贴合得很好，准备就绪。',
      '一切就绪，这个配方我很熟悉。',
      '看着滤杯里的咖啡粉，我已经等不及了。',
    ],
    nomatch: [
      '唔...这个配方跟评委的口味不太搭啊。',
      '虽然配方不匹配，但说不定有惊喜？',
      '评委可能不会喜欢这个方向...算了，先冲吧。',
    ],
  };
  monos.push({
    time: Math.floor(t),
    text: recipeMatch ? pick(setupLines.match) : pick(setupLines.nomatch),
    icon: recipeMatch ? '✅' : '🤔',
  });

  // --- Monologue 3: Mid-pour (~50% into pour) ---
  t += SPEEDS[G.selection.speed].time * 0.5;
  const pourLines = {
    fast: {
      match: [
        '快速注水，充分释放果酸，手法对了！',
        '水流轻盈，果香已经飘出来了。',
        '快速萃取前段风味，思路清晰！',
      ],
      nomatch: [
        '冲这么快...会不会萃取不足？',
        '这个速度好像不太适合这个配方。',
        '感觉水流太快了，评委可能会觉得淡。',
      ],
    },
    medium: {
      match: [
        '不疾不徐，均衡萃取，这就是我想表达的。',
        '中速注水，风味层次会很好。',
        '稳定的水流，每一滴都在计算之中。',
      ],
      nomatch: [
        '这个速度...好像既不够快也不够慢，有点尴尬。',
        '注水节奏不太对，要不要调整一下？',
      ],
    },
    slow: {
      match: [
        '慢速闷蒸，甜感会被充分激发出来。',
        '耐心等待，好咖啡值得花时间。',
        '甜美的焦糖香气已经开始弥漫了...',
      ],
      nomatch: [
        '这么慢...评委会不会等得不耐烦？',
        '冲得太慢了，风味可能会过萃。',
      ],
    },
  };
  const speedKey = G.selection.speed;
  const spd = pourLines[speedKey];
  monos.push({
    time: Math.floor(t),
    text: speedMatch ? pick(spd.match) : pick(spd.nomatch),
    icon: speedMatch ? '💧' : '😰',
  });

  // --- Monologue 4: Near finish (~85% through total) ---
  t = Math.floor(G.brewTotalTime * 0.88);
  const finishLines = {
    confident: [
      '差不多了，我能感觉到这是一杯好咖啡。',
      '香气扑鼻，这次应该能拿高分！',
      '我对这次出品很有信心。',
      '每个环节都很到位，静待评委品鉴。',
    ],
    uncertain: [
      '快好了...但心里有点没底。',
      '有几个地方可以做得更好，希望评委别太严格。',
      '不管怎样，先倒出来看看吧。',
      '还行吧...至少没翻车。',
    ],
  };

  // Determine overall confidence
  let confident = true;
  let score = 0;
  if (recipeMatch) score += 2;
  if (speedMatch) score += 1;
  if (beanTier === 'advanced') score += 2;
  if (grinderTier === 'advanced') score += 1;
  confident = score >= 3;

  monos.push({
    time: t,
    text: confident ? pick(finishLines.confident) : pick(finishLines.uncertain),
    icon: confident ? '😊' : '😅',
  });

  return monos;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Scoring ----

function calculateScore() {
  const recipe = G.selection.recipe;
  const bean = getEquip('beans', G.selection.bean);
  const grinder = getEquip('grinder', G.selection.grinder);
  const kettle = bestOwned('kettle');
  const cone = bestOwned('filter_cone');
  const paper = bestOwned('filter_paper');
  const scale = bestOwned('scale');
  const carafe = bestOwned('carafe');
  const glass = bestOwned('glass');

  const recipeMatch = recipe.flavor === G.judge.flavor;
  const matchScore = recipeMatch ? 50 : 20;
  const beanQualityBonus = bean.flavorBonus;
  const beanMatchBonus = (bean.flavorMatch && bean.flavorMatch === G.judge.flavor) ? 5 : 0;
  const flavorBase = matchScore + beanQualityBonus + beanMatchBonus;

  let completion = 0.70;
  completion += (cone.completionBonus + paper.completionBonus + grinder.completionBonus + scale.completionBonus + kettle.completionBonus) / 100;
  const spdMatch = recipe.recommendSpeed === G.selection.speed;
  if (!spdMatch) {
    const ord = ['fast', 'medium', 'slow'];
    const diff = Math.abs(ord.indexOf(recipe.recommendSpeed) - ord.indexOf(G.selection.speed));
    if (diff === 1) completion -= 0.02;
    else if (diff === 2) completion -= 0.05;
  }
  completion = Math.max(0.5, Math.min(0.92, completion));

  const aesthetics = carafe.aestheticsBonus + glass.aestheticsBonus;

  const totalTime = G.brewTotalTime;
  let timePen = 0;
  if (totalTime > 240) { timePen = Math.min((totalTime - 240) * 0.3, 15); if (totalTime > 300) timePen += 5; }

  const raw = (flavorBase * completion) + aesthetics - timePen;
  const finalScore = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    recipeMatch, matchScore, beanQualityBonus, beanMatchBonus,
    flavorBase, completion: Math.round(completion * 100), aesthetics, timePenalty: Math.round(timePen * 10) / 10,
    totalTime, finalScore, pointsEarned: Math.round(finalScore * 2), speedMatch: spdMatch,
    bean, grinder, kettle, cone, paper, scale, carafe, glass, recipe,
  };
}

function finishBrewing() {
  const r = calculateScore();
  G.points += r.pointsEarned;
  renderScoring(r);
  setPhase('scoring');
  UIRefresh();
}

// ---- Shop ----

function buyItem(cat, id) {
  if (isOwned(cat, id)) { toast('已拥有该装备'); return; }
  const item = getEquip(cat, id);
  if (!item) return;
  if (G.points < item.price) { toast('积分不足！'); return; }
  G.points -= item.price;
  if (cat === 'beans') { G.owned.beans.push(id); G.beanUses[id] = 5; toast('✅ 购买成功！（5次使用量）'); }
  else { G.owned[cat].push(id); toast('✅ 购买成功！'); }
  UIRefresh();
}

// ---- Toast ----

function toast(msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}
