// Fast circle-circle overlap test (no sqrt)
function overlaps(ax, ay, ar, bx, by, br) {
  const dx = bx - ax;
  const dy = by - ay;
  const r  = ar + br;
  return dx * dx + dy * dy <= r * r;
}

export class CollisionSystem {
  /**
   * Returns { kills, damageNumbers, shakeAmount }
   * damageNumbers: Array of { x, y, value } for floating text
   * shakeAmount:   > 0 when the player was hit this frame
   */
  update(player, enemies, projectiles, xpGems, gameW, gameH, camera) {
    let kills          = 0;
    let shakeAmount    = 0;
    const damageNumbers = [];

    // ── Projectile vs Enemy ───────────────────────────────────────
    for (const p of projectiles) {
      if (!p.active) continue;
      p.cullIfOffScreen(camera.x, camera.y, gameW, gameH);
      if (!p.active) continue;

      for (const e of enemies) {
        if (!e.active) continue;
        if (overlaps(p.x, p.y, p.radius, e.x, e.y, e.collisionRadius)) {
          // Knockback direction = projectile direction
          const kbx = p.dirX * p.knockbackForce;
          const kby = p.dirY * p.knockbackForce;
          e.takeDamage(p.damage, kbx, kby);
          damageNumbers.push({ x: e.x, y: e.y - e.collisionRadius, value: p.damage });
          p.active = false;
          if (!e.active) kills++;
          break;
        }
      }
    }

    // ── Enemy vs Player ───────────────────────────────────────────
    for (const e of enemies) {
      if (!e.active) continue;
      if (overlaps(e.x, e.y, e.collisionRadius, player.x, player.y, player.collisionRadius)) {
        const hit = player.takeDamage(e.contactDamage);
        if (hit) shakeAmount = 7;
      }
    }

    return { kills, damageNumbers, shakeAmount };
  }
}
