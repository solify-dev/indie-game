import { GameConfig } from '../config/GameConfig.js';

// Returns true when two circles overlap.
// Uses squared distance — avoids an unnecessary sqrt.
function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = bx - ax;
  const dy = by - ay;
  const r  = ar + br;
  return dx * dx + dy * dy <= r * r;
}

export class CollisionSystem {
  /**
   * Checks all collisions for one frame.
   *
   * Returns:
   *   kills          – number of enemies killed this frame
   *   damageNumbers  – [{ x, y, value }] for the DamageNumbers system
   *   shakeAmount    – > 0 when the player took a hit
   */
  update(player, enemies, projectiles, gameW, gameH, camera) {
    let kills         = 0;
    let shakeAmount   = 0;
    const damageNumbers = [];

    // ── Projectile vs Enemy ───────────────────────────────────────────────────
    for (const p of projectiles) {
      if (!p.active) continue;

      // Remove projectiles that have left the visible area
      p.cullIfOffScreen(camera.x, camera.y, gameW, gameH);
      if (!p.active) continue;

      for (const e of enemies) {
        if (!e.active) continue;
        if (circlesOverlap(p.x, p.y, p.radius, e.x, e.y, e.radius)) {
          // Apply knockback in the projectile's travel direction
          const kbx = p.dirX * p.knockbackForce;
          const kby = p.dirY * p.knockbackForce;
          e.takeDamage(p.damage, kbx, kby);
          damageNumbers.push({ x: e.x, y: e.y - e.radius, value: p.damage });
          p.active = false;
          if (!e.active) kills++;
          break; // one projectile hits one enemy
        }
      }
    }

    // ── Enemy vs Player ───────────────────────────────────────────────────────
    for (const e of enemies) {
      if (!e.active) continue;
      if (circlesOverlap(e.x, e.y, e.radius, player.x, player.y, player.radius)) {
        const hit = player.takeDamage(e.contactDamage);
        if (hit) shakeAmount = GameConfig.shake.onHit;
      }
    }

    return { kills, damageNumbers, shakeAmount };
  }
}
