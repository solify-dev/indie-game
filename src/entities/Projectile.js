import { Entity }     from '../core/Entity.js';
import { GameConfig } from '../config/GameConfig.js';

const CFG = GameConfig.weapon;

export class Projectile extends Entity {
  constructor(x, y, dirX, dirY,
              damage = CFG.projectileDamage,
              speed  = CFG.projectileSpeed) {
    super(x, y);
    this.dirX   = dirX; // unit vector — used for knockback direction on hit
    this.dirY   = dirY;
    this.vx     = dirX * speed;
    this.vy     = dirY * speed;
    this.radius = CFG.projectileRadius;
    this.damage = damage;
    this.knockbackForce = CFG.knockbackForce;

    // Pierce: how many additional enemies this projectile passes through.
    // 0 = deactivate on first hit. Set by ArcaneBolt based on its level.
    this.pierceLeft = 0;

    // Tracks which enemy objects have already been hit so a piercing
    // projectile cannot hit the same enemy twice.
    this._hitSet = new Set();

    this._age = 0;
  }

  update(dt) {
    this._applyVelocity(dt);
    this._age += dt;
    if (this._age >= CFG.projectileLifetime) this.active = false;
  }

  cullIfOffScreen(camX, camY, gameW, gameH) {
    const MARGIN = 80;
    const sx = this.x - camX;
    const sy = this.y - camY;
    if (sx < -MARGIN || sx > gameW + MARGIN ||
        sy < -MARGIN || sy > gameH + MARGIN) {
      this.active = false;
    }
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const r = CFG.projectileRadius;

    const grd = ctx.createRadialGradient(sx, sy, 1, sx, sy, r * 2.2);
    grd.addColorStop(0,   'rgba(255,230,80,1)');
    grd.addColorStop(0.4, 'rgba(255,140,20,0.8)');
    grd.addColorStop(1,   'rgba(255,80,0,0)');

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, r * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, sy, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
}
