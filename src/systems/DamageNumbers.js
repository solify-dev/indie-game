import { GameConfig } from '../config/GameConfig.js';

const CFG = GameConfig.damageNumbers;

export class DamageNumbers {
  constructor() {
    this._pool = [];
  }

  add(worldX, worldY, value) {
    this._pool.push({
      x:     worldX,
      y:     worldY,
      value,
      age:   0,
      drift: (Math.random() - 0.5) * CFG.drift, // horizontal spread
    });
  }

  update(dt) {
    for (const n of this._pool) n.age += dt;
    this._pool = this._pool.filter(n => n.age < CFG.lifetime);
  }

  draw(ctx, camera) {
    for (const n of this._pool) {
      const t     = n.age / CFG.lifetime;       // 0 → 1
      const alpha = 1 - t * t;                  // quadratic fade
      const rise  = n.age * CFG.riseSpeed;
      const drift = n.drift * n.age;

      const { x: sx, y: sy } = camera.toScreen(n.x + drift, n.y - rise);

      ctx.save();
      ctx.globalAlpha  = alpha;
      ctx.font         = `bold ${CFG.fontSize}px monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle  = '#331a00';
      ctx.lineWidth    = 3;
      ctx.strokeText(n.value, sx, sy);
      ctx.fillStyle = '#ffe855';
      ctx.fillText(n.value, sx, sy);
      ctx.restore();
    }
  }
}
