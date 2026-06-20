import { Entity }      from '../core/Entity.js';
import { GameConfig }  from '../config/GameConfig.js';

const CFG = GameConfig.weapon;

export class Projectile extends Entity {
  constructor(x, y, dirX, dirY) {
    super(x, y);
    // Store direction unit vector — also used to calculate knockback direction on hit
    this.dirX   = dirX;
    this.dirY   = dirY;
    this.vx     = dirX * CFG.projectileSpeed;
    this.vy     = dirY * CFG.projectileSpeed;
    this.radius = CFG.projectileRadius;
    this.damage = CFG.projectileDamage;
    this.knockbackForce = CFG.knockbackForce;

    this._age = 0;
  }

  update(dt) {
    this._applyVelocity(dt);
    this._age += dt;
    if (this._age >= CFG.projectileLifetime) this.active = false;
  }

  // Deactivate if the projectile has scrolled off the visible area.
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

    // Glowing orb: outer halo + bright core
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
