// ===========================
// 手冲咖啡模拟器 - UI 渲染
// ===========================

function $(id) { return document.getElementById(id); }

function UIRefresh() {
  var ptsEl = $('pts'); if (ptsEl) ptsEl.textContent = G.points;
  var rndEl = $('rnd'); if (rndEl) rndEl.textContent = G.round;
  var spdEl = $('speed-btn'); if (spdEl) spdEl.textContent = '⚡ 1倍速';

  ['idle','judge','prep','brewing','scoring','shop'].forEach(function(p) {
    var el = $('phase-'+p);
    if (el) el.classList.toggle('hidden', p !== G.phase);
  });

  if (G.phase === 'judge') renderJudge();
  if (G.phase === 'prep') renderPrep();
  if (G.phase === 'shop') renderShop();

  // Animate the visible card
  var visible = document.querySelector('#phase-' + G.phase + '.card');
  if (visible) {
    visible.classList.remove('rise-in');
    void visible.offsetWidth;
    visible.classList.add('rise-in');
  }
}

// ---- Judge ----

function renderJudge() {
  const j = G.judge;
  const f = FLAVORS[j.flavor];
  document.getElementById('judge-avatar').textContent = j.avatar;
  document.getElementById('judge-name').textContent = j.name;
  document.getElementById('judge-title').textContent = j.title;
  document.getElementById('judge-flavor').innerHTML =
    `<span class="flavor-tag" style="background:${f.bg};color:${f.color};border:1px solid ${f.color}40;">${f.icon} 偏好: ${f.name} — ${f.desc}</span>`;
  document.getElementById('judge-dialog').textContent = '「' + j.dialog + '」';

  // Dramatic entrance
  var card = document.getElementById('phase-judge');
  if (card) {
    card.classList.remove('entering');
    void card.offsetWidth;
    card.classList.add('entering');
  }
}

// ---- Preparation ----

let prepTab = 'equip';

function switchTab(tab) {
  prepTab = tab;
  document.querySelectorAll('#phase-prep .tab').forEach((t,i) => t.classList.toggle('active', (i===0 && tab==='equip') || (i===1 && tab==='recipe')));
  document.getElementById('prep-equip').classList.toggle('hidden', tab !== 'equip');
  document.getElementById('prep-recipe').classList.toggle('hidden', tab !== 'recipe');
}

function renderPrep() {
  // Equip tab
  document.getElementById('prep-equip').innerHTML = renderBeanPicker() + renderGrinderPicker() + renderAutoEquip() + renderSpeedPicker();
  // Recipe tab
  document.getElementById('prep-recipe').innerHTML = renderRecipePicker();
  switchTab(prepTab);
}

function renderBeanPicker() {
  const beans = EQUIPMENT.beans.map(b => {
    const owned = isOwned('beans', b.id);
    const uses = b.id === 'basic_blend' ? '∞' : (G.beanUses[b.id] || 0);
    const canUse = owned && hasBeanUses(b.id);
    const sel = G.selection.bean === b.id;
    return `<div class="ecard ${sel?'sel':''} ${!canUse?'locked':''}" onclick="${canUse?`pickBean('${b.id}')`:''}">
      <div class="ec-name">${b.name}</div>
      <div class="ec-tier ${b.tier}">${b.tier==='advanced'?'✦ 进阶':'基础'}</div>
      <div class="ec-effect">🍇 风味 +${b.flavorBonus} ${b.flavorMatch ? '| 适配'+FLAVORS[b.flavorMatch].name : ''}</div>
      <div class="ec-meta">${owned ? '✅ 拥有 · 剩余'+uses+'次' : '🔒 未拥有'}</div>
    </div>`;
  }).join('');
  return `<div class="card"><h2>🫘 咖啡豆</h2><div class="egrid">${beans}</div></div>`;
}

function pickBean(id) {
  if (!isOwned('beans',id) || !hasBeanUses(id)) return;
  G.selection.bean = id;
  renderPrep();
}

function renderGrinderPicker() {
  const grinders = EQUIPMENT.grinder.map(g => {
    const owned = isOwned('grinder', g.id);
    const sel = G.selection.grinder === g.id;
    return `<div class="ecard ${sel?'sel':''} ${!owned?'locked':''}" onclick="${owned?`pickGrinder('${g.id}')`:''}">
      <div class="ec-name">${g.name}</div>
      <div class="ec-tier ${g.tier}">${g.tier==='advanced'?'✦ 进阶':'基础'}</div>
      <div class="ec-effect">⏱ ${g.grindTime}s · 均匀度+${g.completionBonus}%</div>
      <div class="ec-meta">${owned ? '✅ 拥有' : '🔒 未拥有'}</div>
    </div>`;
  }).join('');
  return `<div class="card"><h2>⚙️ 磨豆器</h2><div class="egrid">${grinders}</div></div>`;
}

function pickGrinder(id) {
  if (!isOwned('grinder',id)) return;
  G.selection.grinder = id;
  renderPrep();
}

function renderAutoEquip() {
  const cats = ['filter_cone','filter_paper','carafe','scale','kettle','glass'];
  const items = cats.map(c => {
    const best = bestOwned(c);
    if (!best) return '';
    const meta = CATEGORY_META[c];
    let eff = '';
    if (c==='filter_cone'||c==='filter_paper'||c==='kettle') eff = `📐 +${best.completionBonus}%`;
    else if (c==='carafe'||c==='glass') eff = `✨ +${best.aestheticsBonus}`;
    else if (c==='scale') eff = `⚖️ ±${best.accuracy}g · +${best.completionBonus}%`;
    return `<div class="ecard sel">
      <div class="ec-name">${meta.icon} ${best.name}</div>
      <div class="ec-tier ${best.tier}">${best.tier==='advanced'?'✦ 进阶':'基础'}</div>
      <div class="ec-effect">${eff}</div>
    </div>`;
  }).join('');
  return `<div class="card"><h2>🔧 已装备（自动选用最佳）</h2><div class="egrid">${items}</div></div>`;
}

function renderSpeedPicker() {
  const opts = Object.values(SPEEDS).map(s => {
    const sel = G.selection.speed === s.id;
    return `<div class="speed-opt ${sel?'sel':''}" onclick="pickSpeed('${s.id}')">
      <div class="sp-icon">${s.icon}</div>
      <div class="sp-name">${s.name}</div>
      <div class="sp-time">${s.label}</div>
    </div>`;
  }).join('');
  return `<div class="card"><h2>💧 注水速度</h2><div class="speed-row">${opts}</div></div>`;
}

function pickSpeed(id) { G.selection.speed = id; renderPrep(); }

function renderRecipePicker() {
  const f = G.judge.flavor;
  const cards = RECIPES.map(r => {
    const match = r.flavor === f;
    const sel = G.selection.recipe && G.selection.recipe.id === r.id;
    const fl = FLAVORS[r.flavor];
    return `<div class="rcard ${sel?'sel':''}" onclick="pickRecipe('${r.id}')">
      <div class="rc-icon">${r.icon}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-flavor" style="background:${fl.bg};color:${fl.color};">${fl.name}风味</div>
      <div class="rc-match">${match ? '✅ 匹配评委偏好' : '⚠️ 不匹配'}</div>
      <div class="rc-params">${r.params}</div>
      <div class="rc-desc">${r.desc}</div>
    </div>`;
  }).join('');
  return `<div class="card"><h2>📋 手冲配方 <span style="font-size:12px;color:#888;">评委偏好: ${FLAVORS[f].name}</span></h2>
    <div class="rgrid">${cards}</div></div>`;
}

function pickRecipe(id) { G.selection.recipe = RECIPES.find(r=>r.id===id); renderPrep(); }

// ---- Brewing Steps ----

function renderBrewSteps(steps, activeIdx) {
  const el = document.getElementById('brew-steps');
  el.innerHTML = steps.map((s,i) => {
    let cls = 'bstep';
    if (i < activeIdx) cls += ' done';
    if (i === activeIdx) cls += ' active';
    const icon = i < activeIdx ? '✅' : (i === activeIdx ? '⏳' : '⬜');
    const time = i < activeIdx ? s.time+'s' : (i === activeIdx ? '...' : s.time+'s');
    return `<div class="${cls}"><span class="bs-icon">${s.icon}</span>
      <span class="bs-info"><b>${icon} ${s.name}</b><small>${s.detail}</small></span>
      <span class="bs-time">${time}</span></div>`;
  }).join('');
}

// ---- Scoring ----

function renderScoring(r) {
  const grade = r.finalScore >= 90 ? '🌟🌟🌟 卓越！大师级手冲！' :
    r.finalScore >= 75 ? '🌟🌟 优秀！非常美味！' :
    r.finalScore >= 60 ? '🌟 不错！还能更好！' :
    r.finalScore >= 40 ? '💪 一般，继续加油！' : '📚 需要更多练习...';

  document.getElementById('final-score').textContent = r.finalScore;
  document.getElementById('score-grade').textContent = grade;
  document.getElementById('points-earned').textContent = '+' + r.pointsEarned;

  // ---- Judge tasting reaction ----
  var face = document.getElementById('tasting-face');
  var action = document.getElementById('tasting-action');
  var reaction = getTastingReaction(r);
  face.textContent = reaction.face;
  face.className = 'tasting-face ' + reaction.animClass;
  action.textContent = reaction.action;
  action.style.color = reaction.color;

  const cls = (v, good, bad) => v ? 'good' : 'bad';
  const tcls = (t) => t <= 240 ? 'good' : (t <= 300 ? 'warn' : 'bad');
  document.getElementById('score-detail').innerHTML = `
    <div class="si"><span>🎯 配方匹配</span><b class="${cls(r.recipeMatch,'good','bad')}">${r.recipeMatch?'是':'否'} (${r.matchScore}分)</b></div>
    <div class="si"><span>🫘 咖啡豆品质</span><b class="${r.beanQualityBonus>=15?'good':'neutral'}">+${r.beanQualityBonus+r.beanMatchBonus} (${r.bean.name})</b></div>
    <div class="si"><span>📐 完成度</span><b class="${r.completion>=85?'good':r.completion>=75?'neutral':'bad'}">${r.completion}%</b></div>
    <div class="si"><span>✨ 美观加分</span><b class="good">+${r.aesthetics}</b></div>
    <div class="si"><span>⏱ 总耗时</span><b class="${tcls(r.totalTime)}">${r.totalTime}秒</b></div>
    <div class="si"><span>⏰ 时间惩罚</span><b class="${r.timePenalty===0?'good':'bad'}">${r.timePenalty>0?'-'+r.timePenalty:'0'}</b></div>
    <div class="si"><span>💧 注水速度</span><b class="${cls(r.speedMatch,'good','bad')}">${SPEEDS[G.selection.speed].name} ${r.speedMatch?'✅':'⚠️'}</b></div>
    <div class="si"><span>🍇 风味基础分</span><b class="neutral">${r.flavorBase}/70</b></div>`;
}

function getTastingReaction(r) {
  var s = r.finalScore;
  var t = r.totalTime;
  var recipeMatch = r.recipeMatch;

  if (!recipeMatch && s < 30) {
    return { face: '🤮', animClass: 'spit', action: '噗——！这是什么？！完全不对味！', color: '#E05555' };
  }
  if (s >= 95) {
    return { face: '🥹', animClass: 'love', action: '天哪...这是我喝过最好的手冲咖啡！', color: '#C8A951' };
  }
  if (s >= 90) {
    return { face: '😍', animClass: 'love', action: '太出色了！风味层次完美！', color: '#C8A951' };
  }
  if (s >= 80) {
    return { face: '😋', animClass: 'love', action: '非常好喝！我很满意这杯咖啡。', color: '#8CB86A' };
  }
  if (s >= 70) {
    return { face: '😊', animClass: '', action: '不错，是一杯好咖啡。', color: '#8CB86A' };
  }
  if (s >= 60) {
    return { face: '🙂', animClass: '', action: '还可以，中规中矩吧。', color: '#D4C4B0' };
  }
  if (s >= 45) {
    return { face: '🤨', animClass: '', action: '嗯...有几个地方可以改进。', color: '#E0A855' };
  }
  if (s >= 30) {
    return { face: '😟', animClass: 'hate', action: '不太好喝...你再练练吧。', color: '#E05555' };
  }
  return { face: '😫', animClass: 'hate', action: '太难喝了！你确定这是咖啡？', color: '#E05555' };
}

// ---- Shop ----

function goShop() {
  setPhase('shop');
  UIRefresh();
}

function renderShop() {
  document.getElementById('shop-pts').textContent = G.points;
  let html = '';
  Object.entries(EQUIPMENT).forEach(([cat, items]) => {
    const meta = CATEGORY_META[cat];
    html += `<div class="shop-cat">${meta.icon} ${meta.name}</div>`;
    items.forEach(it => {
      if (it.price === 0) return;
      const owned = isOwned(cat, it.id);
      const uses = cat==='beans' && owned ? (it.id==='basic_blend'?'∞':(G.beanUses[it.id]||0)) : null;
      const canBuy = !owned && G.points >= it.price;
      let eff = '';
      if (cat==='beans') eff = `🍇 风味 +${it.flavorBonus}`;
      else if (cat==='filter_cone'||cat==='filter_paper'||cat==='kettle') eff = `📐 精度 +${it.completionBonus}%`;
      else if (cat==='carafe'||cat==='glass') eff = `✨ 美观 +${it.aestheticsBonus}`;
      else if (cat==='scale') eff = `⚖️ ±${it.accuracy}g · +${it.completionBonus}%`;
      else if (cat==='grinder') eff = `⏱ ${it.grindTime}s · +${it.completionBonus}%`;
      html += `<div class="shop-item">
        <div><b>${it.name}</b><small>${it.detail}</small></div>
        <div class="shop-eff">${eff}</div>
        ${cat==='beans'&&!owned?'<small>购买得5次使用量</small>':''}
        <div class="shop-row"><span class="shop-price">💰 ${it.price}</span>
        ${owned?`<span class="owned-tag">✅ 已拥有${uses!==null?' ('+uses+'次)':''}</span>`
        :`<button class="btn btn-gold btn-sm" onclick="buyItem('${cat}','${it.id}')" ${!canBuy?'disabled':''}>${G.points>=it.price?'购买':'积分不足'}</button>`}</div>
      </div>`;
    });
  });
  document.getElementById('shop-grid').innerHTML = html;
}
