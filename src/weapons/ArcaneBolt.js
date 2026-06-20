import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';
import { normalise }  from '../core/MathUtils.js';

const DEF = {
  name:        'Arcane Bolt',
  icon:        '✦',
  description: 'Fires at the nearest enemy. Gains pierce at higher levels.',
  maxLevel:    8,
  //           damage  cooldown  speed   pierce
  stats: [
    { damage: 12, cooldown: 0.60, speed: 620, pierce: 0 },
    { damage: 15, cooldown: 0.55, speed: 640, pierce: 0 },
    { damage: 18, cooldown: 0.50, speed: 660, pierce: 0 },
    { damage: 22, cooldown: 0.50, speed: 680, pierce: 1 },
    { damage: 26, cooldown: 0.45, speed: 700, pierce: 1 },
    { damage: 32, cooldown: 0.42, speed: 720, pierce: 2 },
    { damage: 38, cooldown: 0.38, speed: 750, pierce: 2 },
    { damage: 48, cooldown: 0.34, speed: 800, pierce: 3 },
  ],
};

export class ArcaneBolt extends WeaponBase {
  static DEF = DEF;

  constructor() {
    super('arcane_bolt', DEF);
    this._cooldown = 0;
  }

  update(dt, player, enemies, projectiles) {
    if (this._cooldown > 0) { this._cooldown -= dt; return; }

    // Find closest active enemy
    let nearest = null, bestDist = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      const dx = e.x - player.x, dy = e.y - player.y;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; nearest = e; }
    }
    if (!nearest) return;

    const s   = this.stats;
    const dir = normalise(nearest.x - player.x, nearest.y - player.y);

    // Global player multipliers let stat-upgrade cards affect all weapons
    const damage = Math.round(s.damage * player.weaponDamageMulti);
    const speed  = s.speed * player.projectileSpeedMulti;

    const p       = new Projectile(player.x, player.y, dir.x, dir.y, damage, speed);
    p.pierceLeft  = s.pierce;
    projectiles.push(p);

    this._cooldown = s.cooldown / player.weaponFireRateMulti;
  }

  // Projectiles draw themselves — no persistent visual here
  draw() {}
}
