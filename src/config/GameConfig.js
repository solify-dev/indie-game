// Central configuration for all tunable values.
// Change numbers here rather than hunting through entity files.

export const GameConfig = {

  // ── Canvas ────────────────────────────────────────────────────────────────
  WIDTH:       1920,
  HEIGHT:      1080,
  SPRITE_SIZE: 182,   // source size of all character/enemy sprites (px)

  // ── Player ────────────────────────────────────────────────────────────────
  player: {
    speed:           220,  // world px / second
    hp:              100,
    collisionRadius: 22,   // smaller than sprite so the game feels fair
    iframes:         0.7,  // invincibility seconds after being hit
    xpToNextBase:    100,  // XP needed for level 2
    xpScaling:       1.15, // multiplier applied to xpToNext each level-up
  },

  // ── Enemies ───────────────────────────────────────────────────────────────
  enemies: {
    slime: {
      speed:           65,
      hp:              40,
      collisionRadius: 26,
      contactDamage:   8,
      xpValue:         2,
    },
    bat: {
      speed:           155,
      hp:              18,
      collisionRadius: 18,
      contactDamage:   12,
      xpValue:         1,
    },
  },

  // ── Weapon (starter orb shooter) ─────────────────────────────────────────
  weapon: {
    fireRate:           0.6,   // seconds between shots
    projectileSpeed:    620,   // world px / second
    projectileDamage:   12,
    projectileRadius:   10,    // collision radius
    projectileLifetime: 1.8,   // seconds before auto-removal
    knockbackForce:     420,   // px / second impulse applied to hit enemy
  },

  // ── Spawner ───────────────────────────────────────────────────────────────
  spawner: {
    margin:   160,  // px outside the visible area where enemies spawn
    baseRate: 0.8,  // enemies per second at t=0
    maxRate:  6,    // cap
    rampTime: 30,   // seconds to reach max rate

    // [minElapsedSeconds, { type: weight, … }]
    // First matching row (from bottom) wins.
    schedule: [
      [  0, { slime: 1,    bat: 0    }],
      [ 30, { slime: 0.75, bat: 0.25 }],
      [ 90, { slime: 0.5,  bat: 0.5  }],
      [180, { slime: 0.35, bat: 0.65 }],
    ],
  },

  // ── XP Gems ───────────────────────────────────────────────────────────────
  gems: {
    magnetRadius: 90,   // px from player that pulls gems in
    magnetSpeed:  380,  // px / second when magnetised
    bobSpeed:     2.2,  // radians / second for hover animation
    collectRadius: 16,  // px overlap that counts as "collected"
  },

  // ── Damage Numbers ────────────────────────────────────────────────────────
  damageNumbers: {
    lifetime:   0.85,  // seconds
    riseSpeed:  80,    // world px / second upward
    drift:      40,    // max horizontal drift px
    fontSize:   26,
  },

  // ── Renderer ──────────────────────────────────────────────────────────────
  renderer: {
    background:  '#0d0d1a',
    gridSize:    120,   // world px per grid cell
    gridColour:  'rgba(255,255,255,0.045)',
  },

  // ── Screen shake ─────────────────────────────────────────────────────────
  shake: {
    onHit:  7,     // magnitude added when player is hit
    decay:  0.88,  // multiplied each frame (exponential decay)
  },
};
