// Generates and caches procedural placeholder sprites.
// Swap with real image loads later — the function signatures stay the same.

import { GameConfig } from '../config/GameConfig.js';

const { SPRITE_SIZE } = GameConfig;
const cache = {};

function makeCanvas(w = SPRITE_SIZE, h = SPRITE_SIZE) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// ── Player: glowing blue humanoid ────────────────────────────────────────────
export function getPlayerSprite() {
  if (cache.player) return cache.player;

  const c = makeCanvas(), ctx = c.getContext('2d');
  const cx = SPRITE_SIZE / 2, cy = SPRITE_SIZE / 2;

  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 80);
  glow.addColorStop(0, 'rgba(80,160,255,0.35)');
  glow.addColorStop(1, 'rgba(80,160,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  ctx.fillStyle = '#3a8fff';
  ctx.beginPath(); ctx.ellipse(cx, cy + 20, 22, 32, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#5ab0ff';
  ctx.beginPath(); ctx.arc(cx, cy - 22, 22, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(cx - 8, cy - 24, 5, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(cx + 8, cy - 24, 5, 6,  0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#001a33';
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 23, 3, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy - 23, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a8fff'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy); ctx.lineTo(cx - 40, cy + 28);
  ctx.moveTo(cx + 22, cy); ctx.lineTo(cx + 40, cy + 28);
  ctx.moveTo(cx - 10, cy + 50); ctx.lineTo(cx - 14, cy + 80);
  ctx.moveTo(cx + 10, cy + 50); ctx.lineTo(cx + 14, cy + 80);
  ctx.stroke();

  ctx.fillStyle = '#aaddff';
  ctx.beginPath(); ctx.arc(cx + 18, cy - 36, 4, 0, Math.PI * 2); ctx.fill();

  cache.player = c;
  return c;
}

// ── Enemy sprites ─────────────────────────────────────────────────────────────
const ENEMY_PALETTE = {
  slime: { body: '#33bb44', dark: '#1a6625', eye: '#aaffaa' },
  bat:   { body: '#7733aa', dark: '#441166', eye: '#cc88ff' },
};

export function getEnemySprite(type) {
  if (cache[type]) return cache[type];

  const col = ENEMY_PALETTE[type] ?? ENEMY_PALETTE.slime;
  const c = makeCanvas(), ctx = c.getContext('2d');
  const cx = SPRITE_SIZE / 2, cy = SPRITE_SIZE / 2;

  const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 75);
  glow.addColorStop(0, col.body + '55'); glow.addColorStop(1, col.body + '00');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  ctx.fillStyle = col.body;
  ctx.beginPath(); ctx.ellipse(cx, cy + 10, 35, 40, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = col.dark;
  ctx.beginPath(); ctx.arc(cx, cy - 20, 28, 0, Math.PI * 2); ctx.fill();

  for (const ex of [cx - 10, cx + 10]) {
    const eg = ctx.createRadialGradient(ex, cy - 22, 1, ex, cy - 22, 8);
    eg.addColorStop(0, '#fff'); eg.addColorStop(1, col.eye);
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.arc(ex, cy - 22, 7, 0, Math.PI * 2); ctx.fill();
  }

  ctx.strokeStyle = col.eye; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy - 12, 12, 0.2, Math.PI - 0.2); ctx.stroke();

  ctx.strokeStyle = col.dark; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy + 5); ctx.lineTo(cx - 55, cy - 5);
  ctx.moveTo(cx - 35, cy + 5); ctx.lineTo(cx - 58, cy + 8);
  ctx.moveTo(cx + 35, cy + 5); ctx.lineTo(cx + 55, cy - 5);
  ctx.moveTo(cx + 35, cy + 5); ctx.lineTo(cx + 58, cy + 8);
  ctx.stroke();

  cache[type] = c;
  return c;
}

// ── XP Gems ───────────────────────────────────────────────────────────────────
// type: 'blue' | 'green' | 'red' — matches GameConfig.gems.types keys
export function getGemSprite(type) {
  if (cache['gem_' + type]) return cache['gem_' + type];

  const def = GameConfig.gems.types[type] ?? GameConfig.gems.types.blue;
  const dim = def.size;
  const c   = makeCanvas(dim, dim);
  const ctx = c.getContext('2d');
  const cx  = dim / 2, cy = dim / 2, r = dim * 0.4;

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, r * 1.4);
  glow.addColorStop(0, def.primary + 'aa');
  glow.addColorStop(1, def.primary + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, dim, dim);

  // Diamond body
  ctx.fillStyle = def.primary;
  ctx.beginPath();
  ctx.moveTo(cx,     cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx,     cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();

  // Inner shadow
  ctx.fillStyle = def.secondary + '88';
  ctx.beginPath();
  ctx.moveTo(cx,           cy);
  ctx.lineTo(cx + r * 0.7, cy);
  ctx.lineTo(cx,           cy + r);
  ctx.lineTo(cx - r * 0.7, cy);
  ctx.closePath();
  ctx.fill();

  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.moveTo(cx,           cy - r);
  ctx.lineTo(cx + r * 0.5, cy);
  ctx.lineTo(cx,           cy - r * 0.25);
  ctx.closePath();
  ctx.fill();

  cache['gem_' + type] = c;
  return c;
}
