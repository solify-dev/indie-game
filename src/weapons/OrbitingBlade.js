import { WeaponBase } from './WeaponBase.js';

const DEF = {
  name:        'Orbiting Blade',
  icon:        '⊕',
  description: 'Blades orbit the player and slash enemies on contact.',
  maxLevel:    8,
  //           count  damage  orbitSpeed  radius  bladeSize  damageCooldown
  stats: [
    { count: 1, damage:  8, orbitSpeed: 1.8, radius: 100, bladeSize: 20, damageCooldown: 0.50 },
    { count: 1, damage: 11, orbitSpeed: 2.0, radius: 100, bladeSize: 22, damageCooldown: 0.50 },
    { count: 2, damage: 11, orbitSpeed: 2.0, radius: 110, bladeSize: 22, damageCooldown: 0.45 },
    { count: 2, damage: 14, orbitSpeed: 2.2, radius: 110, bladeSize: 24, damageCooldown: 0.45 },
    { count: 3, damage: 14, orbitSpeed: 2.4, radius: 120, bladeSize: 26, damageCooldown: 0.40 },
    { count: 3, damage: 18, orbitSpeed: 2.6, radius: 120, bladeSize: 28, damageCooldown: 0.40 },
    { count: 4, damage: 18, orbitSpeed: 2.8, radius: 130, bladeSize: 30, damageCooldown: 0.35 },
    { count: 4, damage: 24, orbitSpeed: 3.2, radius: 140, bladeSize: 32, damageCooldown: 0.30 },
  ],
};

export class OrbitingBlade extends WeaponBase {
  static DEF = DEF;

  constructor() {
    super('orbiting_blade', DEF);
    this._angle = 0;
    // Tracks when each enemy was last hit so the blade can't spam damage.
    // Key: enemy object reference → remaining cooldown seconds.
    this._hitCooldowns = new Map();
  }

  update(dt, player, enemies) {
    const s = this.stats;

    // Advance orbit angle
    this._angle += s.orbitSpeed * dt;

    // Decay per-enemy hit cooldowns
    for (const [e, t] of this._hitCooldowns) {
      if (!e.active) { this._hitCooldowns.delete(e); continue; }
      const next = t - dt;
      if (next <= 0) this._hitCooldowns.delete(e);
      else           this._hitCooldowns.set(e, next);
    }

    const blades = this._bladePositions(player, s);

    for (const blade of blades) {
      for (const e of enemies) {
        if (!e.active) continue;
        if (this._hitCooldowns.has(e)) continue;

        const dx   = blade.x - e.x, dy = blade.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < s.bladeSize + e.radius) {
          const damage = Math.round(s.damage * player.weaponDamageMulti);
          e.takeDamage(damage);
          this._hitCooldowns.set(e, s.damageCooldown);
        }
      }
    }
  }

  draw(ctx, camera, player) {
    const s      = this.stats;
    const blades = this._bladePositions(player, s);
    const { x: px, y: py } = camera.toScreen(player.x, player.y);

    // Faint orbit ring
    ctx.save();
    ctx.strokeStyle = 'rgba(100,200,255,0.13)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(px, py, s.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    for (const blade of blades) {
      const { x: bx, y: by } = camera.toScreen(blade.x, blade.y);
      // Rotate blade so it stays tangent to the orbit circle
      const angle = Math.atan2(by - py, bx - px) + Math.PI / 2;
      const hs    = s.bladeSize; // half-size

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);

      // Blade glow
      ctx.shadowColor = '#44ccff';
      ctx.shadowBlur  = 14;

      // Diamond-shaped blade
      const grd = ctx.createLinearGradient(0, -hs, 0, hs);
      grd.addColorStop(0,   '#aaeeff');
      grd.addColorStop(0.5, '#33bbff');
      grd.addColorStop(1,   '#aaeeff');
      ctx.fillStyle = grd;

      ctx.beginPath();
      ctx.moveTo(0,           -hs);
      ctx.lineTo(hs * 0.38,    0);
      ctx.lineTo(0,            hs);
      ctx.lineTo(-hs * 0.38,   0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // Returns world-space {x,y} for each blade this frame
  _bladePositions(player, s) {
    const blades = [];
    for (let i = 0; i < s.count; i++) {
      const angle = this._angle + (i / s.count) * Math.PI * 2;
      blades.push({
        x: player.x + Math.cos(angle) * s.radius,
        y: player.y + Math.sin(angle) * s.radius,
      });
    }
    return blades;
  }
}
