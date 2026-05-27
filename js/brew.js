// ===========================
// 手冲咖啡模拟器 - Canvas 动画 v3
// ===========================

let animCanvas, animCtx;
let steamParticles = [];
let dripParticles = [];
let swirlAngle = 0;
let activeMonologue = null;
let monologueAlpha = 0;

// Particle manager
function clearParticles() {
  steamParticles = [];
  dripParticles = [];
  swirlAngle = 0;
  activeMonologue = null;
  monologueAlpha = 0;
}

function initCanvas() {
  animCanvas = document.getElementById('brew-canvas');
  if (!animCanvas) return;
  animCtx = animCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!animCanvas) return;
  var r = animCanvas.parentElement.getBoundingClientRect();
  animCanvas.width = Math.max(r.width, 300);
  animCanvas.height = 520;
}

// ---- Main ----

function updateCanvas(timer, total, activeStep) {
  if (!animCtx) return;
  var ctx = animCtx, W = animCanvas.width, H = animCanvas.height;
  ctx.clearRect(0, 0, W, H);

  var progress = total > 0 ? Math.min(timer / total, 1) : 0;
  var cx = W / 2;

  // Warm background
  var bg = ctx.createRadialGradient(cx, H*0.45, 0, cx, H*0.45, W*0.65);
  bg.addColorStop(0, 'rgba(50,25,8,0.35)'); bg.addColorStop(1, 'rgba(8,4,1,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Monologue check
  checkMonologue(timer);

  // Draw equipment (bottom to top)
  // Step 0: weigh   Step 1: grind   Step 2: setup   Step 3: pour   Step 4: serve
  drawScale(ctx, cx, H);
  if (activeStep >= 0) drawWeighing(ctx, cx, H, timer, total, progress, activeStep);
  if (activeStep >= 1) drawGrinding(ctx, cx, H, timer, total, progress, activeStep);
  if (activeStep >= 2) {
    drawCarafe(ctx, cx, H, progress, activeStep);
    drawDripper(ctx, cx, H, timer, total, progress, activeStep);
    drawCoffeeBed(ctx, cx, H, timer, total, progress, activeStep);
  }
  if (activeStep >= 3) {
    drawKettleAndPour(ctx, cx, H, timer, total, progress, activeStep);
    drawCoffeeLevel(ctx, cx, H, timer, total, progress);
    drawSwirl(ctx, cx, H, timer, total, progress);
    updateSteam(ctx, cx, H);
    updateDrips(ctx, cx, H, timer, total, progress, activeStep);
  }
  if (activeStep >= 4) drawServe(ctx, cx, H, timer, total, progress);

  // Monologue overlay (HTML-based, kept for fallback)
  updatePlayerMonologue(timer);
}

// ==========================================
// SCALE
// ==========================================

function drawScale(ctx, cx, H) {
  var y = H - 50;
  // Platform
  ctx.fillStyle = '#2A2A2A'; roundRect(ctx, cx-60, y, 120, 18, 4);
  ctx.fillStyle = '#3A3A3A'; roundRect(ctx, cx-55, y-2, 110, 6, 2);
  // Body
  ctx.fillStyle = '#1E1E1E'; roundRect(ctx, cx-45, y-7, 90, 10, 3);
  // LED
  ctx.fillStyle = '#0A0A0A'; roundRect(ctx, cx-22, y-5, 44, 7, 2);
  ctx.fillStyle = '#4ADE80'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
  ctx.fillText('00.0g', cx, y);
  // Silicone feet
  ctx.fillStyle = '#444'; roundRect(ctx, cx-50, y+18, 10, 4, 2); roundRect(ctx, cx+40, y+18, 10, 4, 2);
}

// ==========================================
// WEIGHING (step 0) - scoop beans onto scale
// ==========================================

function drawWeighing(ctx, cx, H, timer, total, progress, step) {
  if (step !== 0) return;
  var y = H - 50;
  var phase = Math.min(progress * 10, 1); // only during weighing

  // Bean bag
  var bagX = cx - 85, bagY = H - 230;
  ctx.fillStyle = '#6B4E14'; ctx.beginPath();
  ctx.moveTo(bagX-18, bagY-15); ctx.quadraticCurveTo(bagX-12, bagY-30, bagX, bagY-25);
  ctx.lineTo(bagX+15, bagY-22); ctx.quadraticCurveTo(bagX+25, bagY-10, bagX+18, bagY+3);
  ctx.lineTo(bagX+5, bagY+15); ctx.quadraticCurveTo(bagX-5, bagY+18, bagX-18, bagY+3);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8A951'; ctx.font = '6px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('COFFEE', bagX+2, bagY-5);

  // Hand scooping from bag
  var handX = bagX + 15 + phase * 60;
  var handY = bagY - 5 - phase * 30;
  // Arm
  ctx.strokeStyle = '#C8A080'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bagX+5, bagY-10); ctx.lineTo(handX, handY); ctx.stroke();
  // Hand
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.arc(handX, handY, 7, 0, Math.PI*2); ctx.fill();
  // Scoop
  ctx.fillStyle = '#999'; ctx.beginPath(); ctx.ellipse(handX-4, handY+3, 7, 4, -0.3, 0, Math.PI*2); ctx.fill();

  // Beans on scale platform
  var beanCount = Math.floor(phase * 20);
  for (var i = 0; i < Math.min(beanCount, 20); i++) {
    var bx = cx - 30 + (i%5)*12 + Math.sin(i*1.7)*4;
    var by = y - 8 - Math.floor(i/5)*5 + Math.cos(i*2.1)*3;
    ctx.fillStyle = '#4A3020'; ctx.beginPath();
    ctx.ellipse(bx, by, 3.5, 2.5, 0.4, 0, Math.PI*2); ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(120,80,40,0.4)'; ctx.beginPath();
    ctx.arc(bx-0.5, by-1, 1.5, 0, Math.PI*2); ctx.fill();
  }

  // Beans falling (during mid-scoop)
  if (phase > 0.2 && phase < 0.8) {
    for (i = 0; i < 3; i++) {
      var fx = handX - 10 + Math.random()*20;
      var fy = handY + 8 + Math.random()*30;
      ctx.fillStyle = '#5A3A20'; ctx.beginPath();
      ctx.ellipse(fx, fy, 2.5, 1.8, 0.5+Math.random()*0.5, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ==========================================
// GRINDING (step 1) - detailed grinder
// ==========================================

function drawGrinding(ctx, cx, H, timer, total, progress, step) {
  if (step < 1) return;
  var gy = H - 240;
  var grindProgress = step === 1 ? Math.min(progress * 10, 1) : 1;

  // Grinder base
  var baseGrad = ctx.createLinearGradient(cx-26, gy, cx+26, gy);
  baseGrad.addColorStop(0, '#5A4A36'); baseGrad.addColorStop(0.3, '#6B5B44');
  baseGrad.addColorStop(0.5, '#7A6A50'); baseGrad.addColorStop(0.7, '#6B5B44');
  baseGrad.addColorStop(1, '#4A3A28');
  ctx.fillStyle = baseGrad;
  roundRect(ctx, cx-26, gy+8, 52, 28, 5);

  // Collection drawer
  ctx.fillStyle = '#4A3A2A'; roundRect(ctx, cx-14, gy+36, 28, 8, 3);

  // Main body
  var bodyGrad = ctx.createLinearGradient(cx-18, gy-20, cx+18, gy-20);
  bodyGrad.addColorStop(0, '#7A6A55'); bodyGrad.addColorStop(0.4, '#8B7B64');
  bodyGrad.addColorStop(1, '#5A4A38');
  ctx.fillStyle = bodyGrad; roundRect(ctx, cx-18, gy-15, 36, 26, 4);

  // Hopper
  ctx.fillStyle = '#8A7A60';
  ctx.beginPath();
  ctx.moveTo(cx-14, gy-15); ctx.lineTo(cx-10, gy-32);
  ctx.quadraticCurveTo(cx, gy-36, cx+10, gy-32);
  ctx.lineTo(cx+14, gy-15); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#5A4A38'; ctx.lineWidth = 1.5; ctx.stroke();

  // Beans in hopper (decrease as grinding progresses)
  var remaining = step === 1 ? Math.max(0, 6 - Math.floor(grindProgress * 8)) : 0;
  for (var i = 0; i < remaining; i++) {
    var bx = cx - 5 + (i%3)*5, by = gy - 27 + Math.floor(i/3)*5;
    ctx.fillStyle = '#3A2010'; ctx.beginPath();
    ctx.ellipse(bx, by, 2.2, 1.6, 0.3, 0, Math.PI*2); ctx.fill();
  }

  // Rotating handle
  var speed = step >= 2 ? 0 : 4;
  var angle = timer * speed;
  var px = cx + 18, py = gy - 5;
  ctx.strokeStyle = '#7A6040'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(angle)*32, py + Math.sin(angle)*3); ctx.stroke();
  // Handle knob
  var kx = px + Math.cos(angle)*32, ky = py + Math.sin(angle)*3;
  var knobGrad = ctx.createRadialGradient(kx, ky, 1, kx, ky, 7);
  knobGrad.addColorStop(0, '#C8A878'); knobGrad.addColorStop(1, '#7A5A38');
  ctx.fillStyle = knobGrad; ctx.beginPath(); ctx.arc(kx, ky, 7, 0, Math.PI*2); ctx.fill();

  // Ground coffee pile in drawer
  if (grindProgress > 0.15) {
    var pileH = Math.min(grindProgress * 12, 12);
    ctx.fillStyle = '#4A2818'; ctx.beginPath();
    ctx.ellipse(cx, gy+34, 12, pileH*0.4, 0, 0, Math.PI*2); ctx.fill();
    // Texture
    for (i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(60,25,10,0.6)'; ctx.beginPath();
      ctx.arc(cx-6+(i%3)*6, gy+33-Math.random()*pileH, 1.5, 0, Math.PI*2); ctx.fill();
    }
  }

  // Falling grounds particles (during grinding)
  if (step === 1 && grindProgress > 0.1 && grindProgress < 0.9) {
    for (i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(70,35,15,0.7)'; ctx.beginPath();
      ctx.arc(cx-4+(i%2)*8, gy+8+Math.random()*25, 1.2, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ==========================================
// CARAFE
// ==========================================

function drawCarafe(ctx, cx, H, progress, step) {
  var bot = H - 50, top = bot - 140, wTop = 26, wBot = 36;

  var g = ctx.createLinearGradient(cx-wBot, 0, cx+wBot, 0);
  g.addColorStop(0, 'rgba(180,200,220,0.12)'); g.addColorStop(0.25, 'rgba(220,235,250,0.28)');
  g.addColorStop(0.5, 'rgba(240,248,255,0.32)'); g.addColorStop(0.75, 'rgba(220,235,250,0.28)');
  g.addColorStop(1, 'rgba(180,200,220,0.12)');

  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(190,210,230,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx-wTop, top); ctx.lineTo(cx-wBot, bot);
  ctx.quadraticCurveTo(cx, bot+6, cx+wBot, bot);
  ctx.lineTo(cx+wTop, top); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Rim
  ctx.strokeStyle = 'rgba(200,220,240,0.55)'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(cx, top, wTop+2, 5, 0, 0, Math.PI*2); ctx.stroke();

  // Measurement marks
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8;
  for (var i = 0; i < 3; i++) {
    var my = bot - 20 - i*38; ctx.beginPath();
    ctx.moveTo(cx-28, my); ctx.lineTo(cx-18, my); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.font = '7px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText((i+1)*100+'ml', cx-19, my+3);
  }

  // Handle
  ctx.strokeStyle = 'rgba(190,210,230,0.35)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx+wTop+4, top+20);
  ctx.quadraticCurveTo(cx+wBot+25, top+30, cx+wBot+20, top+75); ctx.stroke();

  // Spout
  ctx.beginPath(); ctx.moveTo(cx-wTop-2, top+5);
  ctx.quadraticCurveTo(cx-wTop-18, top-2, cx-wTop-12, top+8); ctx.stroke();
}

// ==========================================
// DRIPPER (V60 cone)
// ==========================================

function drawDripper(ctx, cx, H, timer, total, progress, step) {
  var carafeTop = H - 50 - 140, dTop = carafeTop - 10, dBot = carafeTop + 38, dW = 32;

  var coneGrad = ctx.createLinearGradient(cx-dW, dTop, cx+dW, dTop);
  coneGrad.addColorStop(0, '#E0D0BA'); coneGrad.addColorStop(0.3, '#F0E5D5');
  coneGrad.addColorStop(0.5, '#F5EDE2'); coneGrad.addColorStop(0.7, '#E8D8C4');
  coneGrad.addColorStop(1, '#C8B498');

  ctx.fillStyle = coneGrad; ctx.strokeStyle = 'rgba(160,135,105,0.5)'; ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx-dW, dTop); ctx.lineTo(cx-11, dBot);
  ctx.lineTo(cx+11, dBot); ctx.lineTo(cx+dW, dTop); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Ribs
  ctx.strokeStyle = 'rgba(170,145,120,0.3)'; ctx.lineWidth = 1.2;
  for (var i = -3; i <= 3; i++) {
    var rx = cx + i*(dW-9)/3.5;
    ctx.beginPath(); ctx.moveTo(rx, dTop+8); ctx.lineTo(cx+i*4.5, dBot-3); ctx.stroke();
  }

  // Rim
  ctx.strokeStyle = 'rgba(170,140,110,0.6)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(cx, dTop, dW, 5.5, 0, 0, Math.PI*2); ctx.stroke();

  // Bottom hole
  ctx.fillStyle = '#3A2210'; ctx.beginPath(); ctx.arc(cx, dBot, 3.5, 0, Math.PI*2); ctx.fill();

  // Filter paper visible above rim
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-dW+2, dTop-2);
  ctx.quadraticCurveTo(cx, dTop+4, cx+dW-2, dTop-2); ctx.stroke();
}

function drawCoffeeBed(ctx, cx, H, timer, total, progress, step) {
  var dTop = H - 50 - 140 - 10, bedY = dTop + 22;
  ctx.fillStyle = '#3A1E0E'; ctx.beginPath();
  ctx.ellipse(cx, bedY, 26, 6, 0, 0, Math.PI*2); ctx.fill();
  // Texture
  for (var i = 0; i < 7; i++) {
    ctx.fillStyle = 'rgba(50,22,8,0.5)'; ctx.beginPath();
    ctx.arc(cx-20+i*7+Math.sin(i)*3, bedY+Math.cos(i)*2.5, 1.8, 0, Math.PI*2); ctx.fill();
  }
}

// ==========================================
// KETTLE & POURING (step 3)
// ==========================================

function drawKettleAndPour(ctx, cx, H, timer, total, progress, step) {
  if (step < 3) return;
  var pourStart = total * 0.42, pourElapsed = Math.max(0, timer - pourStart);
  var pourPhase = Math.min(pourElapsed / Math.max(total * 0.48, 1), 1.15);
  if (pourPhase <= 0.01) return;

  // Determine kettle type
  var kettleItem = G.selection && G.owned ? bestOwned('kettle') : null;
  var isTemp = kettleItem && kettleItem.id === 'kettle_temp';
  var kettle = bestOwned('kettle');

  var kx = cx + 42 + Math.sin(pourPhase*Math.PI*0.85)*28;
  var ky = H - 255 + Math.cos(pourPhase*1.05)*12;
  var spoutX = kx - 45, spoutY = ky + 12;
  var dripperTop = H - 50 - 140 - 10, targetX = cx + Math.sin(pourPhase*4.2)*16, targetY = dripperTop + 14;

  // Kettle body
  if (isTemp) {
    // Premium temp-controlled: dark body, LED screen
    var kg = ctx.createLinearGradient(kx-30, ky, kx+30, ky);
    kg.addColorStop(0, '#2A2A2A'); kg.addColorStop(0.4, '#3D3D3D');
    kg.addColorStop(0.5, '#4A4A4A'); kg.addColorStop(0.6, '#3D3D3D');
    kg.addColorStop(1, '#222');
    ctx.fillStyle = kg;
  } else {
    // Basic: brushed stainless steel
    var kg = ctx.createLinearGradient(kx-30, ky, kx+30, ky);
    kg.addColorStop(0, '#AAA'); kg.addColorStop(0.3, '#D0D0D0');
    kg.addColorStop(0.5, '#E8E8E8'); kg.addColorStop(0.7, '#C8C8C8');
    kg.addColorStop(1, '#999');
    ctx.fillStyle = kg;
  }
  ctx.beginPath(); ctx.ellipse(kx, ky, 30, 20, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = isTemp ? '#555' : '#888'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(kx, ky, 30, 20, 0, 0, Math.PI*2); ctx.stroke();

  // Lid
  ctx.fillStyle = isTemp ? '#3A3A3A' : '#B0B0B0';
  ctx.beginPath(); ctx.arc(kx, ky-16, 12, 0, Math.PI*2); ctx.fill();
  // Lid knob
  ctx.fillStyle = isTemp ? '#555' : '#888';
  ctx.beginPath(); ctx.arc(kx, ky-18, 4, 0, Math.PI*2); ctx.fill();

  // Temperature display (only temp-controlled)
  if (isTemp) {
    ctx.fillStyle = '#0A0A0A'; roundRect(ctx, kx-10, ky+4, 20, 9, 2);
    ctx.fillStyle = '#4ADE80'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
    ctx.fillText('93°C', kx, ky+11);
  }

  // Gooseneck spout
  ctx.strokeStyle = isTemp ? '#444' : '#AAA'; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.moveTo(kx-24, ky-2);
  ctx.quadraticCurveTo(kx-42, ky-10, spoutX, spoutY); ctx.stroke();
  // Spout tip
  ctx.fillStyle = isTemp ? '#333' : '#999';
  ctx.beginPath(); ctx.arc(spoutX, spoutY, 3, 0, Math.PI*2); ctx.fill();

  // Handle
  ctx.strokeStyle = '#555'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(kx+22, ky-6);
  ctx.quadraticCurveTo(kx+42, ky-12, kx+38, ky+10);
  ctx.quadraticCurveTo(kx+40, ky+20, kx+24, ky+6); ctx.stroke();

  // Water stream
  var sg = ctx.createLinearGradient(spoutX, spoutY, targetX, targetY);
  sg.addColorStop(0, 'rgba(175,205,235,0.75)'); sg.addColorStop(0.5, 'rgba(155,190,220,0.8)');
  sg.addColorStop(1, 'rgba(135,170,200,0.35)');
  ctx.strokeStyle = sg; ctx.lineWidth = 5.5+Math.sin(pourPhase*10)*2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(spoutX, spoutY);
  ctx.quadraticCurveTo((spoutX+targetX)/2-5, (spoutY+targetY)/2+3, targetX, targetY); ctx.stroke();

  // Secondary thin stream
  ctx.strokeStyle = 'rgba(175,205,235,0.35)'; ctx.lineWidth = 2.5+Math.sin(pourPhase*12)*1.2;
  ctx.beginPath(); ctx.moveTo(spoutX-2, spoutY+1);
  ctx.quadraticCurveTo((spoutX+targetX)/2-7, (spoutY+targetY)/2+5, targetX-1, targetY); ctx.stroke();

  // Splash
  ctx.fillStyle = 'rgba(185,210,235,'+(0.4+Math.random()*0.3)+')';
  ctx.beginPath(); ctx.arc(targetX, targetY, 6+Math.random()*3, 0, Math.PI*2); ctx.fill();
  // Droplets
  for (var i=0; i<3; i++) {
    ctx.fillStyle = 'rgba(195,220,240,0.55)'; ctx.beginPath();
    ctx.arc(targetX+(Math.random()-0.5)*18, targetY-Math.random()*7, 1.3, 0, Math.PI*2); ctx.fill();
  }
}

function drawSwirl(ctx, cx, H, timer, total, progress) {
  var pStart = total*0.44, pElapsed = Math.max(0, timer - pStart);
  if (pElapsed < 3) return;
  var y = H - 50 - 140 - 10 + 26;
  swirlAngle += 0.07;
  ctx.fillStyle = 'rgba(190,170,140,0.18)';
  for (var i=0; i<3; i++) {
    var a = swirlAngle+i*2.1, rx = cx+Math.cos(a)*12, ry = y+Math.sin(a*0.7)*3;
    ctx.beginPath(); ctx.arc(rx, ry, 2.5+i, 0, Math.PI*2); ctx.fill();
  }
}

function drawCoffeeLevel(ctx, cx, H, timer, total, progress) {
  var pStart = total*0.42, pElapsed = Math.max(0, timer - pStart);
  var pPhase = Math.min(pElapsed / Math.max(total*0.48, 1), 1);
  if (pPhase <= 0.04) return;

  var bot = H-50, maxH = 90, fillH = Math.min(pPhase*maxH, maxH), top = bot-fillH;
  var wTop = 26+(fillH/maxH)*10, wBot = 36;

  var cg = ctx.createLinearGradient(0, top, 0, bot);
  cg.addColorStop(0, 'rgba(45,18,4,0.85)'); cg.addColorStop(1, 'rgba(22,8,1,0.95)');
  ctx.fillStyle = cg; ctx.beginPath();
  ctx.moveTo(cx-wTop, top); ctx.lineTo(cx-wBot, bot);
  ctx.quadraticCurveTo(cx, bot+6, cx+wBot, bot);
  ctx.lineTo(cx+wTop, top);
  ctx.quadraticCurveTo(cx, top-3, cx-wTop, top); ctx.fill();

  // Surface sheen
  ctx.fillStyle = 'rgba(255,210,160,0.1)'; ctx.beginPath();
  ctx.ellipse(cx, top, wTop-2, 1.5, 0, 0, Math.PI*2); ctx.fill();
}

// Steam
function updateSteam(ctx, cx, H) {
  var top = H-50-140-10;
  if (steamParticles.length<45 && Math.random()<0.5) steamParticles.push({
    x:cx+(Math.random()-0.5)*45, y:top+Math.random()*8,
    vx:(Math.random()-0.5)*0.5, vy:-0.3-Math.random()*0.7, life:1, size:4+Math.random()*9, op:0.12+Math.random()*0.18
  });
  for (var i=steamParticles.length-1; i>=0; i--) {
    var p=steamParticles[i]; p.x+=p.vx+Math.sin(p.y*0.02)*0.3; p.y+=p.vy; p.life-=0.005; p.size+=0.025;
    if (p.life<=0||p.y<40) { steamParticles.splice(i,1); continue; }
    var a=p.life*p.op, g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
    g.addColorStop(0,'rgba(220,220,225,'+a+')'); g.addColorStop(0.6,'rgba(200,200,210,'+(a*0.5)+')');
    g.addColorStop(1,'rgba(180,180,190,0)'); ctx.fillStyle=g; ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
  }
}

// Drips
function updateDrips(ctx, cx, H, timer, total, progress, step) {
  if (step<3||step>4) return;
  var dBot = H-50-140+38, pStart=total*0.42, pElapsed=Math.max(0,timer-pStart);
  if (pElapsed<5) return;

  if (Math.random()<0.3 && dripParticles.length<18) dripParticles.push({
    x:cx+(Math.random()-0.5)*5, y:dBot, vy:0.6+Math.random()*2.5, life:1, size:1.5+Math.random()*2.5
  });

  var carafeTop=H-50-140, carafeBot=H-50;
  for (var i=dripParticles.length-1;i>=0;i--) {
    var p=dripParticles[i];
    if (p.vx!==undefined) { p.x+=p.vx; p.y+=p.vy; p.life-=0.03;
      if (p.life<=0) { dripParticles.splice(i,1); continue; }
      ctx.fillStyle='rgba(95,45,18,'+p.life+')'; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    } else {
      p.y+=p.vy; p.vy+=0.12; p.life-=0.012;
      if (p.y>carafeBot||p.life<=0) {
        if (p.y>carafeTop) { for (var j=0;j<2;j++) dripParticles.push({x:p.x+(Math.random()-0.5)*8,y:p.y,vy:-1-Math.random()*2,vx:(Math.random()-0.5)*1.5,life:0.25,size:1.3}); }
        dripParticles.splice(i,1); continue;
      }
      ctx.fillStyle='rgba(85,38,12,'+p.life+')'; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(75,30,8,'+(p.life*0.35)+')'; ctx.beginPath(); ctx.arc(p.x,p.y-p.size*1.3,p.size*0.6,0,Math.PI*2); ctx.fill();
    }
  }
}

// ==========================================
// SERVE (step 4) - pour from carafe to glass
// ==========================================

function drawServe(ctx, cx, H, timer, total, progress) {
  // Glass cup on the right side
  var glassX = cx + 70, glassY = H - 50;
  var servePhase = Math.min(progress * 10, 1);

  // Glass body
  var gGrad = ctx.createLinearGradient(glassX-18, 0, glassX+18, 0);
  gGrad.addColorStop(0, 'rgba(200,215,230,0.15)'); gGrad.addColorStop(0.5, 'rgba(235,245,255,0.28)');
  gGrad.addColorStop(1, 'rgba(200,215,230,0.15)');
  ctx.fillStyle = gGrad; ctx.strokeStyle = 'rgba(200,215,230,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(glassX-15, glassY-55); ctx.lineTo(glassX-18, glassY);
  ctx.quadraticCurveTo(glassX, glassY+5, glassX+18, glassY);
  ctx.lineTo(glassX+15, glassY-55); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Rim
  ctx.strokeStyle = 'rgba(200,215,230,0.55)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(glassX, glassY-55, 16, 4, 0, 0, Math.PI*2); ctx.stroke();
  // Base
  ctx.fillStyle = 'rgba(200,215,230,0.2)'; roundRect(ctx, glassX-12, glassY+2, 24, 5, 2);
  roundRect(ctx, glassX-15, glassY+5, 30, 3, 2);

  // Coffee in glass
  if (servePhase > 0.1) {
    var fillH = Math.min(servePhase*35, 35);
    var coffeeTop = glassY-5-fillH;
    ctx.fillStyle = 'rgba(40,18,5,0.9)'; ctx.beginPath();
    var wAtTop = 15+(fillH/35)*3;
    ctx.moveTo(glassX-wAtTop, coffeeTop);
    ctx.lineTo(glassX-18, glassY);
    ctx.quadraticCurveTo(glassX, glassY+4, glassX+18, glassY);
    ctx.lineTo(glassX+wAtTop, coffeeTop);
    ctx.quadraticCurveTo(glassX, coffeeTop-2, glassX-wAtTop, coffeeTop); ctx.fill();
  }

  // Pouring stream from carafe to glass (during transition)
  if (servePhase > 0.05 && servePhase < 0.9) {
    var carafeSpoutX = cx - 42, carafeSpoutY = H - 50 - 140 + 8;
    var glassRimX = glassX, glassRimY = glassY - 55;
    ctx.strokeStyle = 'rgba(80,35,10,0.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(carafeSpoutX, carafeSpoutY);
    ctx.quadraticCurveTo((carafeSpoutX+glassRimX)/2, carafeSpoutY-15, glassRimX, glassRimY); ctx.stroke();
  }

  // Tilted carafe during serving
  if (servePhase > 0.05 && servePhase < 0.95) {
    ctx.save(); ctx.translate(cx, H-50-70);
    ctx.rotate(-0.25 * servePhase);
    ctx.fillStyle = 'rgba(200,220,240,0.15)'; ctx.strokeStyle = 'rgba(190,210,230,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-26, -70); ctx.lineTo(-36, 70);
    ctx.quadraticCurveTo(0, 76, 36, 70); ctx.lineTo(26, -70); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}

// ==========================================
// MONOLOGUE (HTML player face + bubble)
// ==========================================

function checkMonologue(timer) {
  if (!G.brewMonologues || !G.brewMonologues.length) return;
  for (var i = G.brewMonologues.length-1; i >= 0; i--) {
    var m = G.brewMonologues[i];
    if (timer >= m.time && timer < m.time + 8) {
      if (activeMonologue !== m) {
        activeMonologue = m;
        showPlayerMonologue(m);
      }
      return;
    }
  }
  if (activeMonologue) {
    hidePlayerMonologue();
    activeMonologue = null;
  }
}

function showPlayerMonologue(m) {
  var wrap = document.getElementById('player-monologue');
  var bubble = document.getElementById('player-bubble');
  var face = document.getElementById('player-face');
  if (!wrap || !bubble || !face) return;

  var positiveIcons = ['😊','😌','😎','🤩','☺️'];
  var uncertainIcons = ['🤔','😅','😰','😬','🫣'];
  var isPositive = m.icon === '✅' || m.icon === '💧' || m.icon === '⚙️' || m.icon === '😊';
  face.textContent = isPositive
    ? positiveIcons[Math.floor(Math.random()*positiveIcons.length)]
    : uncertainIcons[Math.floor(Math.random()*uncertainIcons.length)];

  bubble.innerHTML = '<span class="mono-label">💭 内心独白</span>' + m.icon + ' ' + m.text;

  wrap.classList.add('visible');
  face.classList.remove('reacting'); void face.offsetWidth; face.classList.add('reacting');
}

function hidePlayerMonologue() {
  var wrap = document.getElementById('player-monologue');
  if (wrap) wrap.classList.remove('visible');
}

function updatePlayerMonologue(timer) {
  checkMonologue(timer);
}

// ==========================================
// HELPERS
// ==========================================

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); roundRectPath(ctx, x, y, w, h, r); ctx.fill(); }
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath();
}
