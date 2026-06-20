import { Projectile }  from '../entities/Projectile.js';
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
    if (!nearest) return; // no enemies yet — wait silently

    const dx  = nearest.x - player.x;
    const dy  = nearest.y - player.y;
    const dir = normalise(dx, dy);

    projectiles.push(new Projectile(player.x, player.y, dir.x, dir.y));
    this._cooldown = CFG.fireRate;
  }

  // Returns the closest active enemy, or null.
  _findNearest(player, enemies) {
    let nearest  = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const d  = dx * dx + dy * dy; // squared — fine for comparison
      if (d < bestDist) { bestDist = d; nearest = e; }
    }
    return nearest;
  }
}
