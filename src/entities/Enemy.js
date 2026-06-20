import { getEnemySprite } from '../assets/ProceduralSprites.js';

const SPRITE_SIZE = 182;

export const ENEMY_TYPES = {
  slime: { speed: 65,  hp: 40,  collisionRadius: 26, contactDamage: 8,  xpValue: 2 },
  bat:   { speed: 155, hp: 18,  collisionRadius: 18, contactDamage: 12, xpValue: 1 },
};

export class Enemy {
  constructor(x, y, type = 'slime') {
    const def   = ENEMY_TYPES[type] || ENEMY_TYPES.slime;
    this.x      = x;
    this.y      = y;
    this.type   = type;
    this.speed  = def.speed;
    this.hp     = def.hp;
    this.maxHp  = def.hp;
    this.collisionRadius = def.collisionRadius;
    this.contactDamage   = def.contactDamage;
    this.xpValue = def.xpValue;
    this.active  = true;

    // Knockback velocity
    this._vx = 0;
    this._vy = 0;

    this._flashTimer = 0;
    this._sprite     = getEnemySprite(type);
  }

  takeDamage(amount, knockbackX = 0, knockbackY = 0) {
    this.hp -= amount;
    this._flashTimer = 0.1;
    this._vx = knockbackX;
    this._vy = knockbackY;
    if (this.hp <= 0) this.active = false;
  }

  update(dt, player) {
    // Chase player
    const dx  = player.x - this.x;
    const dy  = player.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      this.x += (dx / len) * this.speed * dt;
      this.y += (dy / len) * this.speed * dt;
    }

    // Apply and decay knockback
    this.x  += this._vx * dt;
    this.y  += this._vy * dt;
    this._vx *= Math.pow(0.02, dt); // rapid friction
    this._vy *= Math.pow(0.02, dt);

    if (this._flashTimer > 0) this._flashTimer -= dt;
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const half = SPRITE_SIZE / 2;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.drawImage(this._sprite, -half, -half, SPRITE_SIZE, SPRITE_SIZE);

    // White hit-flash overlay
    if (this._flashTimer > 0) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.collisionRadius + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Health bar (drawn in world space above the sprite)
    if (this.hp < this.maxHp) {
      const bw = 60;
      const bh = 6;
      const bx = sx - bw / 2;
      const by = sy - this.collisionRadius - 18;

      ctx.fillStyle = '#331111';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#ee3333';
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
      ctx.strokeStyle = '#222';
      ctx.lineWidth   = 1;
      ctx.strokeRect(bx, by, bw, bh);
    }
  }
}
