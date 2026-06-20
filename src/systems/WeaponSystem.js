import { Projectile } from '../entities/Projectile.js';
import { GameConfig }  from '../config/GameConfig.js';
import { normalise }   from '../core/MathUtils.js';

const CFG = GameConfig.weapon;

export class WeaponSystem {
  constructor() {
    this._cooldown = 0;
  }

  update(dt, player, enemies, projectiles) {
    if (this._cooldown > 0) {
      this._cooldown -= dt;
      return;
    }

    const nearest = this._findNearest(player, enemies);
    if (!nearest) return; // no enemies yet — wait

    const dir = normalise(nearest.x - player.x, nearest.y - player.y);

    // Read stat multipliers from the player so upgrades take effect immediately
    const damage = Math.round(CFG.projectileDamage * player.weaponDamageMulti);
    const speed  = CFG.projectileSpeed * player.projectileSpeedMulti;

    projectiles.push(new Projectile(player.x, player.y, dir.x, dir.y, damage, speed));

    // Higher fireRateMulti = shorter cooldown = faster shots
    this._cooldown = CFG.fireRate / player.weaponFireRateMulti;
  }

  _findNearest(player, enemies) {
    let nearest  = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; nearest = e; }
    }
    return nearest;
  }
}
