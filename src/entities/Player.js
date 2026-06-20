import { getPlayerSprite } from '../assets/ProceduralSprites.js';

const SPRITE_SIZE = 182;
const COLLISION_R = 22;
const BASE_SPEED  = 220;
const IFRAMES     = 0.7;  // invincibility seconds after a hit

export class Player {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.speed  = BASE_SPEED;
    this.hp     = 100;
    this.maxHp  = 100;
    this.level  = 1;
    this.xp     = 0;
    this.xpToNext        = 100;
    this.collisionRadius = COLLISION_R;

    this.facing       = 1;   // 1=right, -1=left
    this._iTimer      = 0;   // invincibility timer
    this._hurtTimer   = 0;   // red-flash timer
    this._sprite      = getPlayerSprite();
  }

  // Returns true if damage was actually applied (not during iframes)
  takeDamage(amount) {
    if (this._iTimer > 0) return false;
    this.hp         = Math.max(0, this.hp - amount);
    this._iTimer    = IFRAMES;
    this._hurtTimer = 0.3;
    return true;
  }

  get isDead() { return this.hp <= 0; }

  update(dt, input) {
    const { dx, dy } = input.getMovementVector();
    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;
    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;

    if (this._iTimer    > 0) this._iTimer    -= dt;
    if (this._hurtTimer > 0) this._hurtTimer -= dt;
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const half = SPRITE_SIZE / 2;

    // Blink every 0.1s while invincible
    if (this._iTimer > 0 && Math.floor(this._iTimer / 0.1) % 2 === 0) return;

    ctx.save();
    ctx.translate(sx, sy);
    if (this.facing === -1) ctx.scale(-1, 1);
    ctx.drawImage(this._sprite, -half, -half, SPRITE_SIZE, SPRITE_SIZE);

    // Red hurt flash
    if (this._hurtTimer > 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle   = '#ff2020';
      ctx.beginPath();
      ctx.arc(0, 0, COLLISION_R + 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // HP bar above player sprite (always visible)
    this._drawHpBar(ctx, sx, sy);
  }

  _drawHpBar(ctx, sx, sy) {
    const bw  = 70;
    const bh  = 7;
    const bx  = sx - bw / 2;
    const by  = sy - COLLISION_R - 52; // just above the sprite head

    const pct = this.hp / this.maxHp;

    ctx.fillStyle = '#1a0000';
    ctx.fillRect(bx, by, bw, bh);

    // Colour shifts red→orange→green
    const g = Math.round(pct * 200);
    ctx.fillStyle = `rgb(220,${g},30)`;
    ctx.fillRect(bx, by, bw * pct, bh);

    ctx.strokeStyle = '#555';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, by, bw, bh);
  }
}
