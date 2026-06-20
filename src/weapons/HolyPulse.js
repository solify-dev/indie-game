import { WeaponBase } from './WeaponBase.js';

// How long the visual ring takes to fully expand and fade (seconds)
const RING_DURATION = 0.55;

const DEF = {
  name:        'Holy Pulse',
  icon:        '◎',
  description: 'Unleashes a ring of energy that damages all nearby enemies.',
  maxLevel:    8,
  //           radius  damage  cooldown
  stats: [
    { radius: 160, damage: 18, cooldown: 3.5 },
    { radius: 180, damage: 22, cooldown: 3.2 },
    { radius: 200, damage: 26, cooldown: 3.0 },
    { radius: 220, damage: 32, cooldown: 2.8 },
    { radius: 250, damage: 38, cooldown: 2.5 },
    { radius: 280, damage: 46, cooldown: 2.2 },
    { radius: 320, damage: 56, cooldown: 2.0 },
    { radius: 370, damage: 70, cooldown: 1.8 },
  ],
};

export class HolyPulse extends WeaponBase {
  static DEF = DEF;

  constructor() {
    super('holy_pulse', DEF);
    this._cooldown = 1.0; // shorter initial delay so player sees it quickly
    this._rings    = [];  // [{progress 0→1, maxRadius}]
  }

  update(dt, player, enemies) {
    const s = this.stats;

    // Update ring animations
    for (const r of this._rings) r.progress += dt / RING_DURATION;
    this._rings = this._rings.filter(r => r.progress < 1);

    if (this._cooldown > 0) { this._cooldown -= dt; return; }

    // Fire: deal damage instantly to all enemies in radius
    const r2 = s.radius * s.radius;
    for (const e of enemies) {
      if (!e.active) continue;
      const dx = e.x - player.x, dy = e.y - player.y;
      if (dx * dx + dy * dy <= r2) {
        const damage = Math.round(s.damage * player.weaponDamageMulti);
        e.takeDamage(damage);
      }
    }

    // Spawn expanding ring visual
    this._rings.push({ progress: 0, maxRadius: s.radius });
    this._cooldown = s.cooldown / player.weaponFireRateMulti;
  }

  draw(ctx, camera, player) {
    const { x: px, y: py } = camera.toScreen(player.x, player.y);

    for (const ring of this._rings) {
      const t      = ring.progress;           // 0 → 1
      const radius = ring.maxRadius * t;      // expands outward
      const alpha  = (1 - t) * 0.85;         // fades as it expands

      ctx.save();
      ctx.strokeStyle = `rgba(255,220,80,${alpha})`;
      ctx.lineWidth   = 4 * (1 - t * 0.6);
      ctx.shadowColor = `rgba(255,180,20,${alpha * 0.7})`;
      ctx.shadowBlur  = 20;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
