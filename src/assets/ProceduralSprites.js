// Generates and caches procedural 182×182 placeholder sprites.
// Replace the canvas draw calls with image loads when real art is ready.

const SPRITE_SIZE = 182;
const cache = {};

function makeCanvas(w = SPRITE_SIZE, h = SPRITE_SIZE) {
  const c = document.createElement('canvas');
  c.width  = w;
  c.height = h;
  return c;
}

// ── Player: glowing blue humanoid ────────────────────────────────────────────
export function getPlayerSprite() {
  if (cache.player) return cache.player;

  const c   = makeCanvas();
  const ctx = c.getContext('2d');
  const cx  = SPRITE_SIZE / 2;
  const cy  = SPRITE_SIZE / 2;

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 80);
  glow.addColorStop(0, 'rgba(80,160,255,0.35)');
  glow.addColorStop(1, 'rgba(80,160,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  // Body
  ctx.fillStyle = '#3a8fff';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 20, 22, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#5ab0ff';
  ctx.beginPath();
  ctx.arc(cx, cy - 22, 22, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — whites
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(cx - 8, cy - 24, 5, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(cx + 8, cy - 24, 5, 6,  0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — pupils
  ctx.fillStyle = '#001a33';
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 23, 3, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy - 23, 3, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#3a8fff';
  ctx.lineWidth   = 10;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy);     ctx.lineTo(cx - 40, cy + 28);
  ctx.moveTo(cx + 22, cy);     ctx.lineTo(cx + 40, cy + 28);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 50); ctx.lineTo(cx - 14, cy + 80);
  ctx.moveTo(cx + 10, cy + 50); ctx.lineTo(cx + 14, cy + 80);
  ctx.stroke();

  // Accent sparkle
  ctx.fillStyle = '#aaddff';
  ctx.beginPath();
  ctx.arc(cx + 18, cy - 36, 4, 0, Math.PI * 2);
  ctx.fill();

  cache.player = c;
  return c;
}

// ── Enemy sprite variants ─────────────────────────────────────────────────────
export function getEnemySprite(type = 'shambler') {
  const key = 'enemy_' + type;
  if (cache[key]) return cache[key];

  const c   = makeCanvas();
  const ctx = c.getContext('2d');
  const cx  = SPRITE_SIZE / 2;
  const cy  = SPRITE_SIZE / 2;

  const palette = {
    shambler: { body: '#cc2222', dark: '#881111', eye: '#ff6666' },
    rusher:   { body: '#cc6600', dark: '#993300', eye: '#ffcc44' },
    brute:    { body: '#662288', dark: '#441155', eye: '#dd44ff' },
  };
  const col = palette[type] || palette.shambler;

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
  glow.addColorStop(0, col.body + '55');
  glow.addColorStop(1, col.body + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  // Body
  ctx.fillStyle = col.body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 35, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = col.dark;
  ctx.beginPath();
  ctx.arc(cx, cy - 20, 28, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (glowing gradient)
  for (const ex of [cx - 10, cx + 10]) {
    const eg = ctx.createRadialGradient(ex, cy - 22, 1, ex, cy - 22, 8);
    eg.addColorStop(0, '#fff');
    eg.addColorStop(1, col.eye);
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(ex, cy - 22, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  ctx.strokeStyle = col.eye;
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.arc(cx, cy - 12, 12, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Claws
  ctx.strokeStyle = col.dark;
  ctx.lineWidth   = 6;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy + 5); ctx.lineTo(cx - 55, cy - 5);
  ctx.moveTo(cx - 35, cy + 5); ctx.lineTo(cx - 58, cy + 8);
  ctx.moveTo(cx + 35, cy + 5); ctx.lineTo(cx + 55, cy - 5);
  ctx.moveTo(cx + 35, cy + 5); ctx.lineTo(cx + 58, cy + 8);
  ctx.stroke();

  cache[key] = c;
  return c;
}

// ── XP Gem: glowing diamond ───────────────────────────────────────────────────
export function getGemSprite(size = 'small') {
  const key = 'gem_' + size;
  if (cache[key]) return cache[key];

  const dim = size === 'small' ? 32 : 48;
  const c   = makeCanvas(dim, dim);
  const ctx = c.getContext('2d');
  const cx  = dim / 2;
  const cy  = dim / 2;
  const r   = dim * 0.4;

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, r * 1.3);
  glow.addColorStop(0, 'rgba(0,255,180,0.6)');
  glow.addColorStop(1, 'rgba(0,255,180,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, dim, dim);

  // Diamond
  ctx.fillStyle = '#00ffaa';
  ctx.beginPath();
  ctx.moveTo(cx,     cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx,     cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(cx,           cy - r);
  ctx.lineTo(cx + r * 0.5, cy);
  ctx.lineTo(cx,           cy - r * 0.3);
  ctx.closePath();
  ctx.fill();

  cache[key] = c;
  return c;
}
