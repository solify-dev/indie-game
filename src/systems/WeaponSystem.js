import { Projectile } from '../entities/Projectile.js';

const FIRE_RATE = 0.6; // seconds between shots

export class WeaponSystem {
  constructor() {
    this._cooldown = 0;
  }

  update(dt, player, enemies, projectiles) {
    if (this._cooldown > 0) {
      this._cooldown -= dt;
      return;
    }

    // Nearest active enemy by squared distance
    let nearest  = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; nearest = e; }
    }

    if (!nearest) return; // no enemies — wait

    const dx  = nearest.x - player.x;
    const dy  = nearest.y - player.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    projectiles.push(new Projectile(player.x, player.y, dx / len, dy / len));
    this._cooldown = FIRE_RATE;
  }
}
