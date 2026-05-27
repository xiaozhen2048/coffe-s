// ===========================
// 手冲咖啡模拟器 - Canvas 动画 v4
// 大幅升级：比例优化、细节增强、粒子系统改进
// ===========================

let animCanvas, animCtx;
let steamParticles = [];
let dripParticles = [];
let fallingParticles = [];
let activeMonologue = null;

function clearParticles() {
  steamParticles = [];
  dripParticles = [];
  fallingParticles = [];
  activeMonologue = null;
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

// ---- Main Render ----

function updateCanvas(timer, total, activeStep) {
  if (!animCtx) return;
  var ctx = animCtx, W = animCanvas.width, H = animCanvas.height;
  ctx.clearRect(0, 0, W, H);

  // === Warm ambient background ===
  var bg = ctx.createRadialGradient(W/2, H*0.4, 10, W/2, H*0.45, W*0.7);
  bg.addColorStop(0, 'rgba(55,28,10,0.45)');
  bg.addColorStop(0.5, 'rgba(30,15,5,0.25)');
  bg.addColorStop(1, 'rgba(8,4,1,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Counter surface line
  var counterY = H - 30;
  var woodGrad = ctx.createLinearGradient(0, counterY, 0, H);
  woodGrad.addColorStop(0, 'rgba(120,75,40,0.7)');
  woodGrad.addColorStop(0.03, 'rgba(160,105,55,0.6)');
  woodGrad.addColorStop(0.06, 'rgba(100,65,35,0.8)');
  woodGrad.addColorStop(1, 'rgba(60,35,18,0.9)');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(0, counterY, W, H - counterY);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(80,50,25,0.15)';
  ctx.lineWidth = 1;
  for (var i = 0; i < 8; i++) {
    ctx.beginPath();
    var wy = counterY + 5 + i * 18;
    ctx.moveTo(0, wy);
    for (var wx = 0; wx < W; wx += 40) {
      ctx.lineTo(wx + 40, wy + Math.sin(wx*0.03 + i)*2);
    }
    ctx.stroke();
  }

  var cx = W / 2;

  // === Render equipment in layer order ===
  // Step 0: weigh, 1: grind, 2: setup, 3: pour, 4: serve
  if (activeStep <= 0) drawScale(ctx, cx, H);
  if (activeStep >= 0) drawWeighing(ctx, cx, H, timer, total, activeStep);
  if (activeStep >= 1) drawGrinding(ctx, cx, H, timer, total, activeStep);
  if (activeStep >= 2) {
    drawCarafe(ctx, cx, H, activeStep);
    drawDripper(ctx, cx, H, timer, total, activeStep);
  }
  if (activeStep >= 3) {
    drawKettleAndPour(ctx, cx, H, timer, total, activeStep);
    drawCoffeeLevel(ctx, cx, H, timer, total);
    drawSwirl(ctx, cx, H, timer, total);
    updateSteam(ctx, cx, H);
    updateDrips(ctx, cx, H, timer, total, activeStep);
    updateFalling(ctx, cx, H);
  }
  if (activeStep >= 4) drawServe(ctx, cx, H, timer, total);

  checkMonologue(timer);
}

// ==========================================
// SCALE - detailed kitchen scale
// ==========================================

function drawScale(ctx, cx, H) {
  var y = H - 28;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(cx, y+20, 70, 6, 0, 0, Math.PI*2); ctx.fill();

  // Platform top (stainless steel)
  var platGrad = ctx.createLinearGradient(cx, y-5, cx, y+5);
  platGrad.addColorStop(0, '#C8C8C8'); platGrad.addColorStop(0.3, '#E0E0E0');
  platGrad.addColorStop(0.5, '#EAEAEA'); platGrad.addColorStop(0.7, '#D8D8D8');
  platGrad.addColorStop(1, '#B0B0B0');
  ctx.fillStyle = platGrad;
  roundRect(ctx, cx-65, y-2, 130, 8, 3);

  // Platform body
  var bodyGrad = ctx.createLinearGradient(cx, y+6, cx, y+18);
  bodyGrad.addColorStop(0, '#3A3A3E'); bodyGrad.addColorStop(1, '#1A1A1E');
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, cx-55, y+6, 110, 14, 4);

  // LCD screen
  ctx.fillStyle = '#0A0A0E';
  roundRect(ctx, cx-28, y+8, 56, 10, 3);
  // Green LED text
  ctx.fillStyle = '#4ADE80';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('00.0 g', cx, y+16);

  // Feet
  for (var fx of [cx-48, cx+48]) {
    ctx.fillStyle = '#444';
    roundRect(ctx, fx-6, y+20, 12, 4, 2);
  }
}

// ==========================================
// WEIGHING - scoop beans onto scale
// ==========================================

function drawWeighing(ctx, cx, H, timer, total, activeStep) {
  if (activeStep !== 0) return;
  var progress = Math.min(timer / total * 10, 1);
  var scaleY = H - 28;

  // Bean bag on left
  var bagX = cx - 100, bagY = H - 210;
  var bagGrad = ctx.createLinearGradient(bagX, bagY-20, bagX, bagY+20);
  bagGrad.addColorStop(0, '#8B6914'); bagGrad.addColorStop(0.5, '#A07818');
  bagGrad.addColorStop(1, '#6B4E10');
  ctx.fillStyle = bagGrad;
  ctx.beginPath();
  ctx.moveTo(bagX-22, bagY-25);
  ctx.quadraticCurveTo(bagX-10, bagY-35, bagX+5, bagY-22);
  ctx.lineTo(bagX+18, bagY);
  ctx.quadraticCurveTo(bagX+25, bagY+15, bagX+10, bagY+22);
  ctx.lineTo(bagX-10, bagY+18);
  ctx.quadraticCurveTo(bagX-25, bagY+5, bagX-22, bagY-25);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1.5;
  ctx.stroke();

  // Bag fold
  ctx.fillStyle = '#7A5A10';
  ctx.beginPath();
  ctx.moveTo(bagX-22, bagY-25);
  ctx.quadraticCurveTo(bagX-5, bagY-30, bagX+5, bagY-22);
  ctx.quadraticCurveTo(bagX-5, bagY-22, bagX-22, bagY-25);
  ctx.fill();

  // Label on bag
  ctx.fillStyle = 'rgba(200,169,81,0.8)';
  ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('COFFEE', bagX+1, bagY+5);

  // Hand + scoop animation
  var scoopPhase = Math.min(progress * 2, 1);
  var returnPhase = Math.max(0, Math.min((progress - 0.4) * 3, 1));
  var handX, handY;

  if (scoopPhase < 0.5) {
    // Moving toward bag
    var t = scoopPhase * 2;
    handX = bagX + 10 + t * 30;
    handY = bagY - 10 - t * 20;
  } else {
    // Moving toward scale
    var t = (scoopPhase - 0.5) * 2;
    handX = bagX + 40 + t * 50;
    handY = bagY - 30 - t * 70;
  }

  // Arm
  ctx.strokeStyle = '#C89670'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bagX, bagY - 10);
  ctx.quadraticCurveTo(handX - 10, handY + 10, handX, handY);
  ctx.stroke();
  ctx.strokeStyle = '#D4A580'; ctx.lineWidth = 3;
  ctx.stroke();

  // Hand
  var skinGrad = ctx.createRadialGradient(handX, handY, 1, handX, handY, 8);
  skinGrad.addColorStop(0, '#E8C8A8'); skinGrad.addColorStop(1, '#C89670');
  ctx.fillStyle = skinGrad;
  ctx.beginPath(); ctx.arc(handX, handY, 8, 0, Math.PI*2); ctx.fill();

  // Scoop
  ctx.fillStyle = '#A0A0A0';
  ctx.beginPath(); ctx.ellipse(handX - 6, handY + 4, 10, 5, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath(); ctx.ellipse(handX - 6, handY + 2, 8, 3.5, -0.2, 0, Math.PI*2); ctx.fill();

  // Beans on scale
  var beanCount = Math.floor(progress * 18);
  for (var i = 0; i < Math.min(beanCount, 18); i++) {
    var bx = cx - 35 + (i % 6) * 13 + Math.sin(i * 2.1) * 5;
    var by = scaleY - 8 - Math.floor(i / 6) * 6 + Math.cos(i * 1.7) * 4;
    // Bean shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(bx + 1, by + 1, 4, 2.8, 0.5, 0, Math.PI*2); ctx.fill();
    // Bean body
    var beanGrad = ctx.createRadialGradient(bx - 1, by - 1, 0.5, bx, by, 4);
    beanGrad.addColorStop(0, '#7A5030'); beanGrad.addColorStop(0.5, '#5A3020');
    beanGrad.addColorStop(1, '#3A2010');
    ctx.fillStyle = beanGrad;
    ctx.beginPath(); ctx.ellipse(bx, by, 4, 2.8, 0.5, 0, Math.PI*2); ctx.fill();
    // Bean crease
    ctx.strokeStyle = 'rgba(30,15,5,0.4)'; ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(bx - 2, by - 0.5); ctx.quadraticCurveTo(bx, by + 1, bx + 1, by + 0.5);
    ctx.stroke();
  }

  // Falling beans
  if (scoopPhase > 0.2 && scoopPhase < 0.9) {
    for (var j = 0; j < 4; j++) {
      var fx = handX - 12 + Math.random() * 24;
      var fy = handY + 5 + Math.random() * 40;
      ctx.fillStyle = 'rgba(90,50,25,0.8)';
      ctx.beginPath(); ctx.ellipse(fx, fy, 3, 2, 0.6 + Math.random() * 0.4, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ==========================================
// GRINDING - detailed grinder with animation
// ==========================================

function drawGrinding(ctx, cx, H, timer, total, activeStep) {
  if (activeStep < 1) return;
  var gx = cx + 80, gy = H - 200;
  var grindProgress = activeStep === 1 ? Math.min(timer / total * 10, 1) : 1;

  // === Grinder body (wood+metal style) ===
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(gx, gy + 68, 30, 5, 0, 0, Math.PI*2); ctx.fill();

  // Wooden base
  var woodGrad = ctx.createLinearGradient(gx - 24, 0, gx + 24, 0);
  woodGrad.addColorStop(0, '#8B6B4A'); woodGrad.addColorStop(0.3, '#A08060');
  woodGrad.addColorStop(0.5, '#B09070'); woodGrad.addColorStop(0.7, '#A08060');
  woodGrad.addColorStop(1, '#7A5A3A');
  ctx.fillStyle = woodGrad;
  roundRect(ctx, gx - 24, gy + 38, 48, 30, 6);

  // Drawer
  ctx.fillStyle = '#6B5030';
  roundRect(ctx, gx - 14, gy + 62, 28, 8, 3);
  ctx.fillStyle = '#4A3020';
  ctx.beginPath(); ctx.arc(gx, gy + 66, 2.5, 0, Math.PI*2); ctx.fill();

  // Main body (brass/metal)
  var metalGrad = ctx.createLinearGradient(gx - 18, 0, gx + 18, 0);
  metalGrad.addColorStop(0, '#9A8A6A'); metalGrad.addColorStop(0.3, '#BAAA8A');
  metalGrad.addColorStop(0.5, '#CABB9A'); metalGrad.addColorStop(0.7, '#BAAA8A');
  metalGrad.addColorStop(1, '#8A7A5A');
  ctx.fillStyle = metalGrad;
  roundRect(ctx, gx - 18, gy + 10, 36, 30, 4);

  // Brand plate
  ctx.fillStyle = '#D4B896';
  roundRect(ctx, gx - 8, gy + 22, 16, 10, 2);
  ctx.fillStyle = '#6B5030';
  ctx.font = 'bold 5px serif'; ctx.textAlign = 'center';
  ctx.fillText('HARIO', gx, gy + 30);

  // Hopper (semi-transparent)
  var hopGrad = ctx.createLinearGradient(gx, gy - 10, gx, gy + 10);
  hopGrad.addColorStop(0, 'rgba(200,190,180,0.5)');
  hopGrad.addColorStop(1, 'rgba(160,150,140,0.3)');
  ctx.fillStyle = hopGrad;
  ctx.beginPath();
  ctx.moveTo(gx - 14, gy + 10);
  ctx.lineTo(gx - 11, gy - 25);
  ctx.quadraticCurveTo(gx, gy - 32, gx + 11, gy - 25);
  ctx.lineTo(gx + 14, gy + 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,80,60,0.4)'; ctx.lineWidth = 1.5;
  ctx.stroke();

  // Beans in hopper (decrease as grinding)
  var beansLeft = activeStep === 1 ? Math.max(0, 8 - Math.floor(grindProgress * 10)) : 0;
  for (var i = 0; i < beansLeft; i++) {
    var bx = gx - 5 + (i % 3) * 6;
    var by = gy - 18 + Math.floor(i / 3) * 6;
    ctx.fillStyle = '#4A2818';
    ctx.beginPath(); ctx.ellipse(bx, by, 3, 2, 0.4, 0, Math.PI*2); ctx.fill();
  }

  // === Rotating crank handle ===
  var crankSpeed = activeStep >= 2 ? 0 : 3.5;
  var angle = timer * crankSpeed;
  var px = gx + 16, py = gy + 5;
  // Crank arm
  ctx.strokeStyle = '#7A6A4A'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(angle) * 28, py + Math.sin(angle) * 3);
  ctx.stroke();
  // Knob
  var kx = px + Math.cos(angle) * 28;
  var ky = py + Math.sin(angle) * 3;
  var knobGrad = ctx.createRadialGradient(kx - 1, ky - 1, 1, kx, ky, 8);
  knobGrad.addColorStop(0, '#D4B896'); knobGrad.addColorStop(1, '#8B6B4A');
  ctx.fillStyle = knobGrad;
  ctx.beginPath(); ctx.arc(kx, ky, 8, 0, Math.PI*2); ctx.fill();

  // === Ground coffee in drawer ===
  if (grindProgress > 0.1) {
    var pileH = Math.min(grindProgress * 16, 16);
    var groundsGrad = ctx.createRadialGradient(gx, gy + 58, 0, gx, gy + 58, 14);
    groundsGrad.addColorStop(0, '#6B3A20'); groundsGrad.addColorStop(1, '#3A1A0A');
    ctx.fillStyle = groundsGrad;
    ctx.beginPath();
    ctx.ellipse(gx, gy + 60, 12 + pileH * 0.3, pileH * 0.4, 0, 0, Math.PI*2);
    ctx.fill();

    // Grounds texture dots
    for (var t = 0; t < 12; t++) {
      var tx = gx - 8 + (t % 4) * 6;
      var ty = gy + 58 - Math.random() * pileH;
      ctx.fillStyle = 'rgba(40,15,5,0.5)';
      ctx.beginPath(); ctx.arc(tx, ty, 1.2, 0, Math.PI*2); ctx.fill();
    }
  }

  // Falling grounds during grinding
  if (activeStep === 1 && grindProgress > 0.05 && grindProgress < 0.95) {
    for (var f = 0; f < 5; f++) {
      var ptx = gx - 6 + (f % 2) * 12;
      var pty = gy + 15 + Math.random() * 45;
      var ptAlpha = 0.4 + Math.random() * 0.4;
      ctx.fillStyle = 'rgba(80,40,20,' + ptAlpha + ')';
      ctx.beginPath(); ctx.arc(ptx, pty, 1.5, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ==========================================
// CARAFE - glass server with highlights
// ==========================================

function drawCarafe(ctx, cx, H, activeStep) {
  var bot = H - 28, top = bot - 150, wTop = 28, wBot = 38;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx, bot + 2, wBot + 4, 5, 0, 0, Math.PI*2); ctx.fill();

  // Glass body with gradient
  var gGrad = ctx.createLinearGradient(cx - wBot, 0, cx + wBot, 0);
  gGrad.addColorStop(0, 'rgba(170,195,215,0.15)');
  gGrad.addColorStop(0.2, 'rgba(210,230,248,0.32)');
  gGrad.addColorStop(0.45, 'rgba(235,245,255,0.38)');
  gGrad.addColorStop(0.55, 'rgba(235,245,255,0.38)');
  gGrad.addColorStop(0.8, 'rgba(210,230,248,0.32)');
  gGrad.addColorStop(1, 'rgba(170,195,215,0.15)');

  ctx.fillStyle = gGrad;
  ctx.strokeStyle = 'rgba(180,200,220,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - wTop, top);
  ctx.lineTo(cx - wBot, bot);
  ctx.quadraticCurveTo(cx, bot + 6, cx + wBot, bot);
  ctx.lineTo(cx + wTop, top);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rim
  ctx.strokeStyle = 'rgba(190,210,230,0.6)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(cx, top, wTop + 3, 6, 0, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx, top - 1, wTop + 1, 4, 0, 0, Math.PI*2); ctx.stroke();

  // Spout (left side)
  ctx.strokeStyle = 'rgba(190,210,230,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - wTop + 2, top + 4);
  ctx.quadraticCurveTo(cx - wTop - 18, top - 3, cx - wTop - 14, top + 8);
  ctx.stroke();

  // Handle (right side)
  ctx.strokeStyle = 'rgba(190,210,230,0.4)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + wTop + 4, top + 18);
  ctx.quadraticCurveTo(cx + wBot + 28, top + 30, cx + wBot + 22, top + 75);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + wTop + 5, top + 19);
  ctx.quadraticCurveTo(cx + wBot + 26, top + 30, cx + wBot + 20, top + 73);
  ctx.stroke();

  // Measurement marks
  for (var i = 0; i < 4; i++) {
    var my = bot - 10 - i * 35;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(cx - 30, my); ctx.lineTo(cx - 18, my); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.font = '7px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText((i + 1) * 100 + 'ml', cx - 19, my + 3);
  }
}

// ==========================================
// DRIPPER - V60 with filter & coffee bed
// ==========================================

function drawDripper(ctx, cx, H, timer, total, activeStep) {
  var carafeTop = H - 28 - 150;
  var dTop = carafeTop - 16;
  var dBot = carafeTop + 42;
  var dW = 34;

  // Filter paper above rim (white, slightly wavy)
  ctx.fillStyle = 'rgba(252,250,248,0.35)';
  ctx.beginPath();
  ctx.moveTo(cx - dW - 3, dTop - 8);
  ctx.quadraticCurveTo(cx - dW + 2, dTop - 2, cx - dW + 4, dTop + 4);
  ctx.lineTo(cx - dW + 4, dTop + 12);
  ctx.quadraticCurveTo(cx, dTop + 20, cx + dW - 4, dTop + 12);
  ctx.lineTo(cx + dW - 4, dTop + 4);
  ctx.quadraticCurveTo(cx + dW - 2, dTop - 2, cx + dW + 3, dTop - 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,195,185,0.3)'; ctx.lineWidth = 1;
  ctx.stroke();

  // V60 cone body (ceramic)
  var coneGrad = ctx.createLinearGradient(cx - dW, 0, cx + dW, 0);
  coneGrad.addColorStop(0, '#D8C4A8');
  coneGrad.addColorStop(0.25, '#EDE0D0');
  coneGrad.addColorStop(0.5, '#F5EDE2');
  coneGrad.addColorStop(0.75, '#E8D8C4');
  coneGrad.addColorStop(1, '#C0A888');

  ctx.fillStyle = coneGrad;
  ctx.strokeStyle = 'rgba(150,125,95,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - dW, dTop);
  ctx.lineTo(cx - 12, dBot);
  ctx.lineTo(cx + 12, dBot);
  ctx.lineTo(cx + dW, dTop);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spiral ribs
  ctx.strokeStyle = 'rgba(160,135,105,0.35)'; ctx.lineWidth = 1.2;
  for (var r = -3; r <= 3; r++) {
    var rx = cx + r * (dW - 10) / 3.5;
    ctx.beginPath();
    ctx.moveTo(rx, dTop + 6);
    ctx.lineTo(cx + r * 5, dBot - 4);
    ctx.stroke();
  }

  // Rim
  ctx.strokeStyle = 'rgba(160,130,100,0.65)'; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.ellipse(cx, dTop, dW + 1, 6, 0, 0, Math.PI*2); ctx.stroke();
  // Inner rim shadow
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(cx, dTop + 1, dW - 3, 4, 0, 0, Math.PI*2); ctx.stroke();

  // Bottom opening
  ctx.fillStyle = '#2A1808';
  ctx.beginPath(); ctx.arc(cx, dBot, 4, 0, Math.PI*2); ctx.fill();

  // Coffee bed (bloom + settled)
  drawCoffeeBed(ctx, cx, dTop, dBot, dW, timer, total, activeStep);
}

function drawCoffeeBed(ctx, cx, dTop, dBot, dW, timer, total, activeStep) {
  var bedY = dTop + 26;
  var bedW = dW - 8;

  if (activeStep >= 3) {
    // Blooming bed (swells during initial pour)
    var pourStart = total * 0.42;
    var pourElapsed = Math.max(0, timer - pourStart);
    var bloomPhase = Math.min(pourElapsed / 12, 1); // bloom within first 12s
    var bedH = 8 + bloomPhase * 8;
    if (bloomPhase > 1) bedH = 16 - Math.min((bloomPhase - 1) * 0.5, 10);

    var bedGrad = ctx.createRadialGradient(cx, bedY, 2, cx, bedY, bedW);
    bedGrad.addColorStop(0, '#4A2818');
    bedGrad.addColorStop(0.5, '#3A1A0A');
    bedGrad.addColorStop(1, '#2A1005');
    ctx.fillStyle = bedGrad;
    ctx.beginPath();
    ctx.ellipse(cx, bedY, bedW, Math.max(bedH, 5), 0, 0, Math.PI*2);
    ctx.fill();

    // Texture on bed
    for (var i = 0; i < 10; i++) {
      var tx = cx - bedW + 5 + i * (bedW * 2 / 10);
      var ty = bedY - 2 + Math.sin(i * 1.8) * 3;
      ctx.fillStyle = 'rgba(30,10,3,0.5)';
      ctx.beginPath(); ctx.arc(tx, ty, 2, 0, Math.PI*2); ctx.fill();
    }

    // Bubbles during bloom
    if (bloomPhase < 1 && activeStep === 3) {
      for (var b = 0; b < 3; b++) {
        var bPhase = (bloomPhase + b * 0.3) % 1;
        var bx = cx - 15 + b * 15;
        var by = bedY - bedH - bPhase * 10;
        ctx.fillStyle = 'rgba(200,170,140,' + ((1 - bPhase) * 0.4) + ')';
        ctx.beginPath(); ctx.arc(bx, by, 2 + (1 - bPhase) * 4, 0, Math.PI*2); ctx.fill();
      }
    }
  } else {
    // Dry bed
    ctx.fillStyle = '#3A1E0E';
    ctx.beginPath();
    ctx.ellipse(cx, bedY, bedW, 6, 0, 0, Math.PI*2);
    ctx.fill();

    for (var i = 0; i < 8; i++) {
      ctx.fillStyle = 'rgba(50,22,8,0.5)';
      ctx.beginPath();
      ctx.arc(cx - bedW + 4 + i * (bedW * 2 / 8), bedY + Math.cos(i) * 2, 2, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// ==========================================
// KETTLE & POUR - gooseneck kettle pouring
// ==========================================

function drawKettleAndPour(ctx, cx, H, timer, total, activeStep) {
  if (activeStep < 3) return;
  var pourStart = total * 0.42;
  var pourElapsed = Math.max(0, timer - pourStart);
  var pourDuration = total * 0.48;
  var pourPhase = Math.min(pourElapsed / Math.max(pourDuration, 1), 1.1);
  if (pourPhase <= 0.01) return;

  var kettle = bestOwned('kettle');
  var isTemp = kettle && kettle.id === 'kettle_temp';

  // Kettle position - moves in a controlled pouring arc
  var kx = cx + 45 + Math.sin(pourPhase * Math.PI * 0.8) * 22;
  var ky = H - 265 + Math.cos(pourPhase * 1.1) * 8;
  var spoutX = kx - 48, spoutY = ky + 10;

  // Dripper target
  var dripperTop = H - 28 - 150 - 16;
  var targetX = cx + Math.sin(pourPhase * 5.5) * 18;
  var targetY = dripperTop + 10;

  // === Kettle Body ===
  if (isTemp) {
    // Dark matte body (temp-controlled)
    var kg = ctx.createLinearGradient(kx - 32, 0, kx + 32, 0);
    kg.addColorStop(0, '#1A1A1E');
    kg.addColorStop(0.3, '#2E2E32');
    kg.addColorStop(0.5, '#3A3A3E');
    kg.addColorStop(0.7, '#2E2E32');
    kg.addColorStop(1, '#1A1A1E');
    ctx.fillStyle = kg;
  } else {
    // Brushed stainless steel
    var kg = ctx.createLinearGradient(kx - 32, 0, kx + 32, 0);
    kg.addColorStop(0, '#A0A0A5');
    kg.addColorStop(0.25, '#C8C8CD');
    kg.addColorStop(0.5, '#E0E0E3');
    kg.addColorStop(0.75, '#C0C0C5');
    kg.addColorStop(1, '#909095');
    ctx.fillStyle = kg;
  }
  ctx.beginPath(); ctx.ellipse(kx, ky, 32, 22, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = isTemp ? '#444' : '#909095'; ctx.lineWidth = 2;
  ctx.stroke();

  // Lid
  ctx.fillStyle = isTemp ? '#2A2A2E' : '#B8B8BD';
  ctx.beginPath(); ctx.arc(kx, ky - 18, 13, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = isTemp ? '#444' : '#999'; ctx.lineWidth = 1;
  ctx.stroke();

  // Lid knob
  ctx.fillStyle = isTemp ? '#444' : '#888';
  ctx.beginPath(); ctx.arc(kx, ky - 21, 5, 0, Math.PI*2); ctx.fill();

  // Temperature display
  if (isTemp) {
    ctx.fillStyle = '#0A0A0E';
    roundRect(ctx, kx - 12, ky + 5, 24, 10, 3);
    ctx.fillStyle = '#4ADE80'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('93°C', kx, ky + 13);
  }

  // === Gooseneck Spout ===
  ctx.strokeStyle = isTemp ? '#333' : '#B0B0B5'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(kx - 24, ky - 2);
  ctx.quadraticCurveTo(kx - 44, ky - 12, spoutX, spoutY);
  ctx.stroke();
  ctx.strokeStyle = isTemp ? '#444' : '#D0D0D5'; ctx.lineWidth = 1.5;
  ctx.stroke();

  // Spout tip
  ctx.fillStyle = isTemp ? '#222' : '#999';
  ctx.beginPath(); ctx.arc(spoutX, spoutY, 3.5, 0, Math.PI*2); ctx.fill();

  // === Handle ===
  ctx.strokeStyle = '#555'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(kx + 24, ky - 8);
  ctx.quadraticCurveTo(kx + 46, ky - 14, kx + 42, ky + 12);
  ctx.quadraticCurveTo(kx + 44, ky + 24, kx + 26, ky + 8);
  ctx.stroke();
  ctx.strokeStyle = '#777'; ctx.lineWidth = 1.5;
  ctx.stroke();

  // === Water Stream ===
  // Main stream
  var streamGrad = ctx.createLinearGradient(spoutX, spoutY, targetX, targetY);
  streamGrad.addColorStop(0, 'rgba(175,205,235,0.8)');
  streamGrad.addColorStop(0.4, 'rgba(155,190,220,0.85)');
  streamGrad.addColorStop(0.7, 'rgba(140,175,205,0.6)');
  streamGrad.addColorStop(1, 'rgba(130,165,195,0.2)');
  ctx.strokeStyle = streamGrad;
  ctx.lineWidth = 5 + Math.sin(pourPhase * 8) * 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(spoutX, spoutY);
  ctx.quadraticCurveTo(
    (spoutX + targetX) / 2 - 8,
    (spoutY + targetY) / 2 + 4,
    targetX, targetY
  );
  ctx.stroke();

  // Secondary thinner stream
  ctx.strokeStyle = 'rgba(185,215,240,0.4)';
  ctx.lineWidth = 2 + Math.sin(pourPhase * 10) * 1.5;
  ctx.beginPath();
  ctx.moveTo(spoutX - 3, spoutY + 1);
  ctx.quadraticCurveTo(
    (spoutX + targetX) / 2 - 12,
    (spoutY + targetY) / 2 + 7,
    targetX - 2, targetY + 1
  );
  ctx.stroke();

  // === Splash at target ===
  var splashAlpha = 0.4 + Math.random() * 0.35;
  var splashGrad = ctx.createRadialGradient(targetX, targetY, 1, targetX, targetY, 8);
  splashGrad.addColorStop(0, 'rgba(195,220,240,' + splashAlpha + ')');
  splashGrad.addColorStop(1, 'rgba(175,200,220,0)');
  ctx.fillStyle = splashGrad;
  ctx.beginPath(); ctx.arc(targetX, targetY, 8 + Math.random() * 4, 0, Math.PI*2); ctx.fill();

  // Splash droplets
  for (var d = 0; d < 4; d++) {
    var dx = targetX + (Math.random() - 0.5) * 20;
    var dy = targetY - Math.random() * 10;
    ctx.fillStyle = 'rgba(195,220,240,0.6)';
    ctx.beginPath(); ctx.arc(dx, dy, 0.8 + Math.random() * 1.5, 0, Math.PI*2); ctx.fill();
  }
}

// ==========================================
// COFFEE LEVEL in carafe
// ==========================================

function drawCoffeeLevel(ctx, cx, H, timer, total) {
  var pourStart = total * 0.42;
  var pourElapsed = Math.max(0, timer - pourStart);
  var pp = Math.min(pourElapsed / Math.max(total * 0.48, 1), 1);
  if (pp <= 0.05) return;

  var bot = H - 28;
  var maxH = 100;
  var fillH = Math.min(pp * maxH, maxH);
  var top = bot - fillH;
  var wTop = 28 + (fillH / maxH) * 10;
  var wBot = 38;

  // Coffee liquid
  var cg = ctx.createLinearGradient(0, top, 0, bot);
  cg.addColorStop(0, 'rgba(80,40,15,0.88)');
  cg.addColorStop(0.3, 'rgba(50,22,8,0.92)');
  cg.addColorStop(1, 'rgba(25,10,3,0.96)');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(cx - wTop, top);
  ctx.lineTo(cx - wBot, bot);
  ctx.quadraticCurveTo(cx, bot + 6, cx + wBot, bot);
  ctx.lineTo(cx + wTop, top);
  ctx.quadraticCurveTo(cx, top - 3, cx - wTop, top);
  ctx.fill();

  // Surface sheen
  var sheenGrad = ctx.createRadialGradient(cx, top, 0, cx, top, wTop);
  sheenGrad.addColorStop(0, 'rgba(255,210,160,0.18)');
  sheenGrad.addColorStop(1, 'rgba(200,160,100,0)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath(); ctx.ellipse(cx, top, wTop - 2, 3, 0, 0, Math.PI*2); ctx.fill();

  // Drip ring on surface
  ctx.strokeStyle = 'rgba(200,150,80,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx, top, wTop - 6, 2, 0, 0, Math.PI*2); ctx.stroke();
}

// ==========================================
// SWIRL - bloom agitation
// ==========================================

function drawSwirl(ctx, cx, H, timer, total) {
  var pStart = total * 0.44, pElapsed = Math.max(0, timer - pStart);
  if (pElapsed < 3) return;
  var y = H - 28 - 150 - 16 + 30;
  var angle = timer * 0.08;
  for (var i = 0; i < 4; i++) {
    var a = angle + i * 1.57;
    var sx = cx + Math.cos(a) * 14;
    var sy = y + Math.sin(a * 0.6) * 3;
    var alpha = 0.1 + Math.sin(timer * 0.15 + i) * 0.05;
    ctx.fillStyle = 'rgba(190,170,140,' + alpha + ')';
    ctx.beginPath(); ctx.arc(sx, sy, 2 + i * 0.8, 0, Math.PI*2); ctx.fill();
  }
}

// ==========================================
// STEAM - atmospheric steam particles
// ==========================================

function updateSteam(ctx, cx, H) {
  var dripperTop = H - 28 - 150 - 16;

  if (steamParticles.length < 55 && Math.random() < 0.55) {
    steamParticles.push({
      x: cx + (Math.random() - 0.5) * 55,
      y: dripperTop + Math.random() * 12,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.8,
      life: 1,
      size: 3 + Math.random() * 12,
      opacity: 0.08 + Math.random() * 0.18
    });
  }

  for (var i = steamParticles.length - 1; i >= 0; i--) {
    var p = steamParticles[i];
    p.x += p.vx + Math.sin(p.y * 0.015) * 0.4;
    p.y += p.vy;
    p.life -= 0.004;
    p.size += 0.03;
    if (p.life <= 0 || p.y < 30) { steamParticles.splice(i, 1); continue; }

    var alpha = p.life * p.opacity;
    var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    g.addColorStop(0, 'rgba(225,225,230,' + alpha + ')');
    g.addColorStop(0.5, 'rgba(210,210,218,' + (alpha * 0.55) + ')');
    g.addColorStop(1, 'rgba(190,190,200,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
  }
}

// ==========================================
// DRIPS - coffee dripping from V60
// ==========================================

function updateDrips(ctx, cx, H, timer, total, activeStep) {
  if (activeStep < 3 || activeStep > 4) return;
  var dBot = H - 28 - 150 + 42;
  var carafeTop = H - 28 - 150;
  var carafeBot = H - 28;
  var pourStart = total * 0.42;
  var pourElapsed = Math.max(0, timer - pourStart);
  if (pourElapsed < 6) return;

  if (Math.random() < 0.35 && dripParticles.length < 20) {
    dripParticles.push({
      x: cx + (Math.random() - 0.5) * 6,
      y: dBot,
      vy: 0.5 + Math.random() * 2.5,
      life: 1,
      size: 1.2 + Math.random() * 3,
      splashed: false
    });
  }

  for (var i = dripParticles.length - 1; i >= 0; i--) {
    var p = dripParticles[i];
    if (p.splashed) {
      p.x += p.vx || 0;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) { dripParticles.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(100,50,20,' + p.life + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    } else {
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= 0.01;
      if (p.y > carafeBot || p.life <= 0) {
        if (p.y > carafeTop + 20) {
          // Splash on hitting coffee surface
          for (var s = 0; s < 3; s++) {
            dripParticles.push({
              x: p.x + (Math.random() - 0.5) * 10,
              y: p.y,
              vy: -1.5 - Math.random() * 2,
              vx: (Math.random() - 0.5) * 2,
              life: 0.3,
              size: 1 + Math.random() * 1.5,
              splashed: true
            });
          }
        }
        dripParticles.splice(i, 1);
        continue;
      }

      // Main drop
      var dropGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      dropGrad.addColorStop(0, 'rgba(110,55,25,' + p.life + ')');
      dropGrad.addColorStop(1, 'rgba(70,30,10,' + (p.life * 0.5) + ')');
      ctx.fillStyle = dropGrad;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();

      // Drop tail
      ctx.fillStyle = 'rgba(85,38,12,' + (p.life * 0.4) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y - p.size * 1.5, p.size * 0.5, 0, Math.PI*2); ctx.fill();
    }
  }
}

// ==========================================
// FALLING - grounds falling from grinder
// ==========================================

function updateFalling(ctx, cx, H) {
  for (var i = fallingParticles.length - 1; i >= 0; i--) {
    var p = fallingParticles[i];
    p.y += p.vy;
    p.vy += 0.08;
    p.life -= 0.02;
    if (p.life <= 0) { fallingParticles.splice(i, 1); continue; }
    ctx.fillStyle = 'rgba(80,40,20,' + p.life + ')';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
  }
}

// ==========================================
// SERVE - pour from carafe to glass cup
// ==========================================

function drawServe(ctx, cx, H, timer, total) {
  var pourStart = total * 0.92;
  var serveElapsed = Math.max(0, timer - pourStart);
  var servePhase = Math.min(serveElapsed / (total * 0.08), 1);
  if (servePhase <= 0) servePhase = 0.01;

  var glassX = cx + 75;
  var glassY = H - 28;
  var carafeTop = H - 28 - 150;

  // === Glass Cup ===

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(glassX, glassY + 4, 22, 4, 0, 0, Math.PI*2); ctx.fill();

  // Glass body
  var gGrad = ctx.createLinearGradient(glassX - 20, 0, glassX + 20, 0);
  gGrad.addColorStop(0, 'rgba(190,205,225,0.15)');
  gGrad.addColorStop(0.3, 'rgba(225,240,252,0.30)');
  gGrad.addColorStop(0.5, 'rgba(240,248,255,0.32)');
  gGrad.addColorStop(0.7, 'rgba(225,240,252,0.30)');
  gGrad.addColorStop(1, 'rgba(190,205,225,0.15)');
  ctx.fillStyle = gGrad;
  ctx.strokeStyle = 'rgba(190,210,230,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(glassX - 16, glassY - 58);
  ctx.lineTo(glassX - 20, glassY);
  ctx.quadraticCurveTo(glassX, glassY + 6, glassX + 20, glassY);
  ctx.lineTo(glassX + 16, glassY - 58);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Rim
  ctx.strokeStyle = 'rgba(200,220,240,0.6)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(glassX, glassY - 58, 17, 5, 0, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(glassX, glassY - 59, 15, 3, 0, 0, Math.PI*2); ctx.stroke();

  // Glass base
  ctx.fillStyle = 'rgba(200,215,230,0.25)';
  roundRect(ctx, glassX - 14, glassY + 3, 28, 6, 3);
  roundRect(ctx, glassX - 17, glassY + 7, 34, 3, 2);

  // Handle
  ctx.strokeStyle = 'rgba(190,210,230,0.4)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(glassX + 14, glassY - 35);
  ctx.quadraticCurveTo(glassX + 34, glassY - 30, glassX + 32, glassY - 10);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
  ctx.stroke();

  // === Coffee filling glass ===
  if (servePhase > 0.1) {
    var fillH = Math.min(servePhase * 40, 40);
    var cTop = glassY - 5 - fillH;
    var cwTop = 16 + (fillH / 40) * 4;

    var cGrad = ctx.createLinearGradient(0, cTop, 0, glassY);
    cGrad.addColorStop(0, 'rgba(90,50,20,0.9)');
    cGrad.addColorStop(1, 'rgba(30,12,4,0.95)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(glassX - cwTop, cTop);
    ctx.lineTo(glassX - 20, glassY);
    ctx.quadraticCurveTo(glassX, glassY + 5, glassX + 20, glassY);
    ctx.lineTo(glassX + cwTop, cTop);
    ctx.quadraticCurveTo(glassX, cTop - 2, glassX - cwTop, cTop);
    ctx.fill();

    // Surface
    ctx.fillStyle = 'rgba(200,140,80,0.2)';
    ctx.beginPath(); ctx.ellipse(glassX, cTop, cwTop - 1, 2, 0, 0, Math.PI*2); ctx.fill();
  }

  // === Pouring stream from carafe ===
  if (servePhase > 0.05 && servePhase < 0.92) {
    var spoutX = cx - 44;
    var spoutY = carafeTop + 10;
    var targetX = glassX;
    var targetY = glassY - 58;

    ctx.strokeStyle = 'rgba(90,45,15,0.65)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(spoutX, spoutY);
    ctx.quadraticCurveTo((spoutX + targetX) / 2, spoutY - 20, targetX, targetY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(120,65,30,0.35)'; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(spoutX - 2, spoutY + 1);
    ctx.quadraticCurveTo((spoutX + targetX) / 2 - 3, spoutY - 16, targetX - 1, targetY);
    ctx.stroke();
  }

  // === Tilted carafe ===
  if (servePhase > 0.03 && servePhase < 0.96) {
    ctx.save();
    ctx.translate(cx, H - 28 - 75);
    ctx.rotate(-0.28 * servePhase);

    ctx.fillStyle = 'rgba(190,215,235,0.18)';
    ctx.strokeStyle = 'rgba(180,200,220,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, -75); ctx.lineTo(-38, 75);
    ctx.quadraticCurveTo(0, 82, 38, 75);
    ctx.lineTo(28, -75);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Coffee inside tilted carafe
    var remainingCoffee = 1 - servePhase;
    if (remainingCoffee > 0.1) {
      ctx.fillStyle = 'rgba(45,18,4,0.85)';
      ctx.beginPath();
      ctx.moveTo(-26, -30); ctx.lineTo(-36, 75);
      ctx.quadraticCurveTo(0, 80, 36, 75);
      ctx.lineTo(26, -30);
      ctx.quadraticCurveTo(0, -35, -26, -30);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ==========================================
// MONOLOGUE SYSTEM
// ==========================================

function checkMonologue(timer) {
  if (!G.brewMonologues || !G.brewMonologues.length) return;
  for (var i = G.brewMonologues.length - 1; i >= 0; i--) {
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

  var positiveIcons = ['😊', '😌', '😎', '🤩'];
  var uncertainIcons = ['🤔', '😅', '😰', '😬'];
  var isPositive = m.icon === '✅' || m.icon === '💧' || m.icon === '⚙️' || m.icon === '😊';
  face.textContent = isPositive
    ? positiveIcons[Math.floor(Math.random() * positiveIcons.length)]
    : uncertainIcons[Math.floor(Math.random() * uncertainIcons.length)];

  bubble.innerHTML = '<span class="mono-label">💭 内心独白</span>' + m.icon + ' ' + m.text;

  wrap.classList.add('visible');
  face.classList.remove('reacting');
  void face.offsetWidth;
  face.classList.add('reacting');
}

function hidePlayerMonologue() {
  var wrap = document.getElementById('player-monologue');
  if (wrap) wrap.classList.remove('visible');
}

// ==========================================
// HELPERS
// ==========================================

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
