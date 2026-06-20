import { Entity }          from '../core/Entity.js';
import { GameConfig }      from '../config/GameConfig.js';
import { getPlayerSprite } from '../assets/ProceduralSprites.js';

const { SPRITE_SIZE } = GameConfig;
const CFG = GameConfig.player;

export class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.radius   = CFG.collisionRadius;
    this.speed    = CFG.speed;
    this.hp       = CFG.hp;
    this.maxHp    = CFG.hp;
    this.level    = 1;
    this.xp       = 0;
    this.xpToNext = CFG.xpToNextBase;

    // Stat multipliers — modified by passives/upgrades
    this.weaponDamageMulti    = 1.0;
    this.weaponFireRateMulti  = 1.0;  // >1 fires faster
    this.projectileSpeedMulti = 1.0;
    this.magnetRadius         = GameConfig.gems.magnetRadius;
    this.luckMulti            = 1.0;  // used by Clover Coin; future chest/drop logic

    this.facing     = 1;
    this._iTimer    = 0;
    this._hurtTimer = 0;
    this._sprite    = getPlayerSprite();
  }

  // Add XP without leveling up — Game._update() drives level-ups
  // so it can pause the action at the right moment.
  gainXP(amount) {
    this.xp += amount;
  }

  // Advance one level. Called by Game after pausing for the upgrade menu.
  levelUp() {
    this.xp       -= this.xpToNext;
    this.level    += 1;
    this.xpToNext  = Math.floor(this.xpToNext * CFG.xpScaling);
  }

  // Returns true when damage was actually applied (false during iframes).
  takeDamage(amount) {
    if (this._iTimer > 0) return false;
    this.hp         = Math.max(0, this.hp - amount);
    this._iTimer    = CFG.iframes;
    this._hurtTimer = 0.3;
    return true;
  }

  get isDead()      { return this.hp <= 0; }
  get canLevelUp()  { return this.xp >= this.xpToNext; }

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

    // Blink every 0.1 s during invincibility frames
    if (this._iTimer > 0 && Math.floor(this._iTimer / 0.1) % 2 === 0) return;

    ctx.save();
    ctx.translate(sx, sy);
    if (this.facing === -1) ctx.scale(-1, 1);
    ctx.drawImage(this._sprite, -half, -half, SPRITE_SIZE, SPRITE_SIZE);

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
    const by  = sy - this.radius - 52;
    const pct = this.hp / this.maxHp;

    ctx.fillStyle = '#1a0000';
    ctx.fillRect(bx, by, bw, bh);
    const g = Math.round(pct * 200);
    ctx.fillStyle = `rgb(220,${g},30)`;
    ctx.fillRect(bx, by, bw * pct, bh);
    ctx.strokeStyle = '#555';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, by, bw, bh);
  }
}
