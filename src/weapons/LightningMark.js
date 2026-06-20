import { WeaponBase } from './WeaponBase.js';

const BOLT_DURATION = 0.38; // seconds a bolt visual stays on screen
const BOLT_SEGMENTS = 7;    // number of jagged line segments per bolt

const DEF = {
  name:        'Lightning Mark',
  icon:        '⚡',
  description: 'Calls down lightning on random enemies on screen.',
  maxLevel:    8,
  //           strikes  damage  cooldown
  stats: [
    { strikes: 1, damage: 20, cooldown: 2.5 },
    { strikes: 1, damage: 28, cooldown: 2.2 },
    { strikes: 2, damage: 28, cooldown: 2.0 },
    { strikes: 2, damage: 36, cooldown: 1.8 },
    { strikes: 3, damage: 36, cooldown: 1.6 },
    { strikes: 3, damage: 46, cooldown: 1.4 },
    { strikes: 4, damage: 46, cooldown: 1.2 },
    { strikes: 5, damage: 60, cooldown: 1.0 },
  ],
};

export class LightningMark extends WeaponBase {
  static DEF = DEF;

  constructor() {
    super('lightning_mark', DEF);
    this._cooldown = 1.2;
    this._bolts    = []; // [{x, y, jags[], progress}]
  }

  update(dt, player, enemies) {
    const s = this.stats;

    for (const b of this._bolts) b.progress += dt / BOLT_DURATION;
    this._bolts = this._bolts.filter(b => b.progress < 1);

    if (this._cooldown > 0) { this._cooldown -= dt; return; }

    // Pick random active enemies to strike
    const active  = enemies.filter(e => e.active);
    const targets = this._pickRandom(active, s.strikes);

    for (const t of targets) {
      const damage = Math.round(s.damage * player.weaponDamageMulti);
      t.takeDamage(damage);

      // Pre-generate jag offsets so the bolt doesn't flicker each frame
      const jags = Array.from({ length: BOLT_SEGMENTS - 1 },
        () => (Math.random() - 0.5) * 32,
      );
      this._bolts.push({ x: t.x, y: t.y, jags, progress: 0 });
    }

    this._cooldown = s.cooldown / player.weaponFireRateMulti;
  }

  draw(ctx, camera) {
    for (const bolt of this._bolts) {
      this._drawBolt(ctx, camera, bolt);
    }
  }

  _drawBolt(ctx, camera, bolt) {
    const { x: ex, y: ey } = camera.toScreen(bolt.x, bolt.y);
    const startY = ey - 220; // bolt originates from above the screen
    const t      = bolt.progress;

    // Bright flash at start, fade toward end
    const alpha = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;

    ctx.save();
    ctx.strokeStyle = `rgba(200,140,255,${alpha})`;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = `rgba(160,80,255,${alpha * 0.9})`;
    ctx.shadowBlur  = 18;

    // Jagged path from top to target
    ctx.beginPath();
    ctx.moveTo(ex, startY);
    for (let i = 1; i < BOLT_SEGMENTS; i++) {
      const segY = startY + (ey - startY) * (i / BOLT_SEGMENTS);
      ctx.lineTo(ex + bolt.jags[i - 1], segY);
    }
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Impact flash circle at target
    if (t < 0.35) {
      const flashR = 28 * (1 - t / 0.35);
      ctx.fillStyle = `rgba(220,180,255,${alpha * 0.55})`;
      ctx.beginPath();
      ctx.arc(ex, ey, flashR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Pick up to n random elements from arr without replacement
  _pickRandom(arr, n) {
    const copy   = arr.slice();
    const result = [];
    while (result.length < n && copy.length > 0) {
      const i = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(i, 1)[0]);
    }
    return result;
  }
}
