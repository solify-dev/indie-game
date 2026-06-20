const LIFETIME  = 0.85; // seconds
const RISE_SPEED = 80;  // world px/s upward

export class DamageNumbers {
  constructor() {
    this._numbers = [];
  }

  add(worldX, worldY, value) {
    this._numbers.push({
      x: worldX,
      y: worldY,
      value,
      age: 0,
      // Slight random horizontal drift so overlapping numbers spread out
      dx: (Math.random() - 0.5) * 40,
    });
  }

  update(dt) {
    for (const n of this._numbers) n.age += dt;
    this._numbers = this._numbers.filter(n => n.age < LIFETIME);
  }

  draw(ctx, camera) {
    for (const n of this._numbers) {
      const t  = n.age / LIFETIME;          // 0 → 1
      const alpha = 1 - t * t;             // fade out
      const rise  = n.age * RISE_SPEED;
      const drift = n.dx * n.age;

      const { x: sx, y: sy } = camera.toScreen(n.x + drift, n.y - rise);

      ctx.save();
      ctx.globalAlpha  = alpha;
      ctx.font         = `bold ${Math.round(26 + t * -6)}px monospace`;
      ctx.fillStyle    = '#ffe855';
      ctx.strokeStyle  = '#331a00';
      ctx.lineWidth    = 3;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(`${n.value}`, sx, sy);
      ctx.fillText(`${n.value}`, sx, sy);
      ctx.restore();
    }
  }
}
