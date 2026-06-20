import { Enemy }       from '../entities/Enemy.js';
import { GameConfig }  from '../config/GameConfig.js';

const CFG = GameConfig.spawner;

// How many enemies to spawn per second at a given elapsed time.
function spawnRate(elapsed) {
  return Math.min(CFG.baseRate + elapsed / CFG.rampTime, CFG.maxRate);
}

// Pick a random type from a { type: weight } map.
function weightedRandom(weights) {
  const entries = Object.entries(weights);
  const total   = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [type, w] of entries) {
    r -= w;
    if (r <= 0) return type;
  }
  return entries[0][0];
}

export class Spawner {
  constructor() {
    this._acc = 0; // accumulated time toward next spawn
  }

  update(dt, elapsed, enemies, player, gameW, gameH) {
    const interval = 1 / spawnRate(elapsed);
    this._acc += dt;

    // Spawn one enemy for each full interval that has passed
    while (this._acc >= interval) {
      this._acc -= interval;
      this._spawnOne(elapsed, enemies, player, gameW, gameH);
    }
  }

  _spawnOne(elapsed, enemies, player, gameW, gameH) {
    // Find which weight row applies (last row where elapsed >= threshold wins)
    let weights = CFG.schedule[0][1];
    for (const [threshold, w] of CFG.schedule) {
      if (elapsed >= threshold) weights = w;
    }

    // Spawn on the border of a rectangle that's slightly larger than the screen,
    // at a random angle from the player so enemies come from all directions.
    const angle = Math.random() * Math.PI * 2;
    const hw    = gameW / 2 + CFG.margin;
    const hh    = gameH / 2 + CFG.margin;
    const tx    = Math.cos(angle);
    const ty    = Math.sin(angle);

    // Scale the unit direction so it lands on the rect border
    const scale = Math.min(
      Math.abs(tx) > 0.001 ? hw / Math.abs(tx) : Infinity,
      Math.abs(ty) > 0.001 ? hh / Math.abs(ty) : Infinity,
    );

    const ex   = player.x + tx * scale;
    const ey   = player.y + ty * scale;
    const type = weightedRandom(weights);

    enemies.push(new Enemy(ex, ey, type));
  }
}
