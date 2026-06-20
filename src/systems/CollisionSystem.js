import { GameConfig } from '../config/GameConfig.js';

function circlesOverlap(ax, ay, ar, bx, by, br) {
  const dx = bx - ax, dy = by - ay, r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

export class CollisionSystem {
  /**
   * Handles all collisions for one frame.
   *
   * Returns { kills, damageNumbers, shakeAmount }
   *   kills          – enemies killed this frame (for the counter)
   *   damageNumbers  – [{x, y, value}] positions for floating text
   *   shakeAmount    – > 0 when the player took a hit
   */
  update(player, enemies, projectiles, gameW, gameH, camera) {
    let kills         = 0;
    let shakeAmount   = 0;
    const damageNumbers = [];

    // ── Projectile vs Enemy ───────────────────────────────────────────────────
    for (const p of projectiles) {
      if (!p.active) continue;

      p.cullIfOffScreen(camera.x, camera.y, gameW, gameH);
      if (!p.active) continue;

      for (const e of enemies) {
        if (!e.active) continue;
        if (p._hitSet.has(e)) continue; // already hit by this projectile

        if (circlesOverlap(p.x, p.y, p.radius, e.x, e.y, e.radius)) {
          const kbx = p.dirX * p.knockbackForce;
          const kby = p.dirY * p.knockbackForce;
          e.takeDamage(p.damage, kbx, kby);
          damageNumbers.push({ x: e.x, y: e.y - e.radius, value: p.damage });
          p._hitSet.add(e);

          if (!e.active) kills++;

          // Pierce: continue through enemies until pierceLeft is exhausted
          if (p.pierceLeft > 0) {
            p.pierceLeft--;
          } else {
            p.active = false;
            break; // no point checking more enemies
          }
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
