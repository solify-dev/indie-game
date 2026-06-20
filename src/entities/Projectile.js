const RADIUS   = 10;
const SPEED    = 620;
const LIFETIME = 1.8;
const KNOCKBACK_FORCE = 420;

export class Projectile {
  constructor(x, y, dirX, dirY, damage = 12) {
    this.x      = x;
    this.y      = y;
    this.dirX   = dirX; // unit vector
    this.dirY   = dirY;
    this.damage = damage;
    this.speed  = SPEED;
    this.radius = RADIUS;
    this.knockbackForce = KNOCKBACK_FORCE;
    this.active = true;
    this._age   = 0;
  }

  update(dt) {
    this.x    += this.dirX * this.speed * dt;
    this.y    += this.dirY * this.speed * dt;
    this._age += dt;
    if (this._age >= LIFETIME) this.active = false;
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

    const grd = ctx.createRadialGradient(sx, sy, 1, sx, sy, RADIUS * 2.2);
    grd.addColorStop(0,   'rgba(255,230,80,1)');
    grd.addColorStop(0.4, 'rgba(255,140,20,0.8)');
    grd.addColorStop(1,   'rgba(255,80,0,0)');

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, RADIUS * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, sy, RADIUS * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }
}
