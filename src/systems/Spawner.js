import { Enemy } from '../entities/Enemy.js';

const SPAWN_MARGIN = 160; // px outside visible area

// [minTime, typeWeights]
const SCHEDULE = [
  [  0, { slime: 1,    bat: 0    }],
  [ 30, { slime: 0.75, bat: 0.25 }],
  [ 90, { slime: 0.5,  bat: 0.5  }],
  [180, { slime: 0.35, bat: 0.65 }],
];

function spawnRate(elapsed) {
  return Math.min(0.8 + elapsed / 30, 6);
}

function pickType(weights) {
  const entries = Object.entries(weights);
  const total   = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [type, w] of entries) {
    r -= w;
    if (r <= 0) return type;
  }
  return entries[0][0];
}

export class Spawner {
  constructor() {
    this._acc = 0;
  }

  update(dt, elapsed, enemies, player, gameW, gameH) {
    const interval = 1 / spawnRate(elapsed);
    this._acc += dt;
    while (this._acc >= interval) {
      this._acc -= interval;
      this._spawnOne(elapsed, enemies, player, gameW, gameH);
    }
  }

  _spawnOne(elapsed, enemies, player, gameW, gameH) {
    let weights = SCHEDULE[0][1];
    for (const [t, w] of SCHEDULE) {
      if (elapsed >= t) weights = w;
    }

    const angle = Math.random() * Math.PI * 2;
    const hw    = gameW / 2 + SPAWN_MARGIN;
    const hh    = gameH / 2 + SPAWN_MARGIN;
    const tx    = Math.cos(angle);
    const ty    = Math.sin(angle);
    const scale = Math.min(
      Math.abs(tx) > 0.001 ? hw / Math.abs(tx) : Infinity,
      Math.abs(ty) > 0.001 ? hh / Math.abs(ty) : Infinity,
    );

    const ex   = player.x + tx * scale;
    const ey   = player.y + ty * scale;
    const type = pickType(weights);
    enemies.push(new Enemy(ex, ey, type));
  }
}
