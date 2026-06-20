import { Entity }        from '../core/Entity.js';
import { GameConfig }    from '../config/GameConfig.js';
import { getPlayerSprite } from '../assets/ProceduralSprites.js';

const { SPRITE_SIZE } = GameConfig;
const CFG = GameConfig.player;

export class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.radius = CFG.collisionRadius;
    this.speed  = CFG.speed;
    this.hp     = CFG.hp;
    this.maxHp  = CFG.hp;
    this.level  = 1;
    this.xp     = 0;
    this.xpToNext = CFG.xpToNextBase;

    this.facing     = 1;   // 1 = right, -1 = left (used to mirror sprite)
    this._iTimer    = 0;   // counts down during invincibility frames
    this._hurtTimer = 0;   // counts down during the red hurt-flash
    this._sprite    = getPlayerSprite();
  }

  // Called by XPGem when collected.
  // Handles level-up so gem logic stays simple.
  gainXP(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp       -= this.xpToNext;
      this.level    += 1;
      this.xpToNext  = Math.floor(this.xpToNext * CFG.xpScaling);
    }
  }

  // Returns true when damage actually applied (false during iframes).
  takeDamage(amount) {
    if (this._iTimer > 0) return false;
    this.hp         = Math.max(0, this.hp - amount);
    this._iTimer    = CFG.iframes;
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

    // Blink every 0.1 s while invincible to signal iframes
    if (this._iTimer > 0 && Math.floor(this._iTimer / 0.1) % 2 === 0) return;

    ctx.save();
    ctx.translate(sx, sy);
    if (this.facing === -1) ctx.scale(-1, 1);
    ctx.drawImage(this._sprite, -half, -half, SPRITE_SIZE, SPRITE_SIZE);

    // Red tint on fresh hit
    if (this._hurtTimer > 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle   = '#ff2020';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this._drawHpBar(ctx, sx, sy);
  }

  _drawHpBar(ctx, sx, sy) {
    const bw  = 70;
    const bh  = 7;
    const bx  = sx - bw / 2;
    const by  = sy - this.radius - 52;  // sit above the sprite head
    const pct = this.hp / this.maxHp;

    ctx.fillStyle = '#1a0000';
    ctx.fillRect(bx, by, bw, bh);

    // Green → orange → red as HP drops
    const g = Math.round(pct * 200);
    ctx.fillStyle = `rgb(220,${g},30)`;
    ctx.fillRect(bx, by, bw * pct, bh);

    ctx.strokeStyle = '#555';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, by, bw, bh);
  }
}
