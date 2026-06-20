import { Entity }         from '../core/Entity.js';
import { GameConfig }     from '../config/GameConfig.js';
import { getEnemySprite } from '../assets/ProceduralSprites.js';
import { normalise }      from '../core/MathUtils.js';

const { SPRITE_SIZE } = GameConfig;

export class Enemy extends Entity {
  constructor(x, y, type = 'slime', { hpScale = 1, speedScale = 1 } = {}) {
    super(x, y);

    const def = GameConfig.enemies[type] ?? GameConfig.enemies.slime;
    this.type          = type;
    this.speed         = def.speed  * speedScale;
    this.hp            = Math.round(def.hp * hpScale);
    this.maxHp         = this.hp;
    this.radius        = def.collisionRadius;
    this.contactDamage = def.contactDamage;
    this.xpValue       = def.xpValue;

    this._flashTimer = 0;
    this._sprite     = getEnemySprite(type);
  }

  // amount   – HP to remove
  // kbx/kby  – knockback impulse in px/s (velocity added immediately)
  takeDamage(amount, kbx = 0, kby = 0) {
    this.hp -= amount;
    this.vx += kbx;
    this.vy += kby;
    this._flashTimer = 0.1;
    if (this.hp <= 0) this.active = false;
  }

  update(dt, player) {
    // Chase the player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dir = normalise(dx, dy);
    this.x += dir.x * this.speed * dt;
    this.y += dir.y * this.speed * dt;

    // Apply and rapidly decay knockback velocity
    this._applyVelocity(dt);
    const friction = Math.pow(0.02, dt); // approaches zero quickly
    this.vx *= friction;
    this.vy *= friction;

    if (this._flashTimer > 0) this._flashTimer -= dt;
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const half = SPRITE_SIZE / 2;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.drawImage(this._sprite, -half, -half, SPRITE_SIZE, SPRITE_SIZE);

    // White flash overlay on hit
    if (this._flashTimer > 0) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Health bar — only shown once the enemy has been damaged
    if (this.hp < this.maxHp) {
      this._drawHealthBar(ctx, sx, sy);
    }
  }

  _drawHealthBar(ctx, sx, sy) {
    const bw = 60;
    const bh = 6;
    const bx = sx - bw / 2;
    const by = sy - this.radius - 18;

    ctx.fillStyle = '#331111';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ee3333';
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
    ctx.strokeStyle = '#222';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, by, bw, bh);
  }
}
