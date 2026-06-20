// Central configuration for all tunable values.
// Change numbers here rather than hunting through entity files.

export const GameConfig = {

  // ── Canvas ────────────────────────────────────────────────────────────────
  WIDTH:       1920,
  HEIGHT:      1080,
  SPRITE_SIZE: 182,

  // ── Player ────────────────────────────────────────────────────────────────
  player: {
    speed:           220,
    hp:              100,
    collisionRadius: 22,
    iframes:         0.7,   // invincibility seconds after a hit
    xpToNextBase:    100,   // XP required to reach level 2
    xpScaling:       1.15,  // xpToNext multiplier per level
  },

  // ── Enemies ───────────────────────────────────────────────────────────────
  enemies: {
    slime: {
      speed:           65,
      hp:              40,
      collisionRadius: 26,
      contactDamage:   8,
      xpValue:         5,   // drops a green gem
    },
    bat: {
      speed:           155,
      hp:              18,
      collisionRadius: 18,
      contactDamage:   12,
      xpValue:         1,   // drops a blue gem
    },
  },

  // ── Weapon (starter auto-shooter) ────────────────────────────────────────
  weapon: {
    fireRate:           0.6,
    projectileSpeed:    620,
    projectileDamage:   12,
    projectileRadius:   10,
    projectileLifetime: 1.8,
    knockbackForce:     420,
  },

  // ── XP Gems ───────────────────────────────────────────────────────────────
  gems: {
    // Gem types by XP value tier
    types: {
      blue:  { value: 1,  size: 32, primary: '#44aaff', secondary: '#0055cc' },
      green: { value: 5,  size: 40, primary: '#44ff88', secondary: '#009944' },
      red:   { value: 10, size: 48, primary: '#ff5544', secondary: '#aa1100' },
    },
    magnetRadius:  90,   // px — gems inside this radius get pulled toward player
    magnetSpeed:   380,  // px / second when magnetised
    bobSpeed:      2.2,  // radians / second for hover animation
    collectRadius: 16,   // px overlap with player that triggers collection
  },

  // ── Spawner ───────────────────────────────────────────────────────────────
  spawner: {
    margin:   160,
    baseRate: 0.8,
    maxRate:  6,
    rampTime: 30,
    schedule: [
      [  0, { slime: 1,    bat: 0    }],
      [ 30, { slime: 0.75, bat: 0.25 }],
      [ 90, { slime: 0.5,  bat: 0.5  }],
      [180, { slime: 0.35, bat: 0.65 }],
    ],
  },

  // ── Damage Numbers ────────────────────────────────────────────────────────
  damageNumbers: {
    lifetime:  0.85,
    riseSpeed: 80,
    drift:     40,
    fontSize:  26,
  },

  // ── Renderer ──────────────────────────────────────────────────────────────
  renderer: {
    background: '#0d0d1a',
    gridSize:   120,
    gridColour: 'rgba(255,255,255,0.045)',
  },

  // ── Screen shake ─────────────────────────────────────────────────────────
  shake: {
    onHit: 7,
    decay: 0.88,
  },
};
