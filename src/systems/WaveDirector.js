import { Enemy }      from '../entities/Enemy.js';
import { GameConfig } from '../config/GameConfig.js';

const MAX_ENEMIES  = GameConfig.spawner.maxEnemies;
const MAX_RATE     = GameConfig.spawner.maxRate;
const SPAWN_MARGIN = GameConfig.spawner.margin;

// Data-driven wave table. Each entry activates when elapsed >= time.
const WAVES = [
  { time:   0, name: 'The Slimes Awaken',  spawnRate: 0.8, weights: { slime: 1 } },
  { time:  60, name: 'The Swarm',          spawnRate: 1.3, weights: { slime: 0.7,  bat: 0.3 } },
  { time: 120, name: 'Swift Shadows',      spawnRate: 1.9, weights: { slime: 0.35, bat: 0.45, crawler: 0.2 } },
  { time: 180, name: 'The Surge',          spawnRate: 2.8, weights: { slime: 0.25, bat: 0.25, crawler: 0.35, brute: 0.15 } },
  { time: 240, name: 'Iron Tide',          spawnRate: 3.5, weights: { slime: 0.15, bat: 0.2,  crawler: 0.3,  brute: 0.25, elite: 0.1 } },
  { time: 300, name: 'Endless Horde',      spawnRate: 4.5, weights: { slime: 0.1,  bat: 0.2,  crawler: 0.25, brute: 0.3,  elite: 0.15 } },
];

const BANNER_DURATION = 3.2; // seconds the wave name stays on screen

function weightedRandom(weights) {
  const entries = Object.entries(weights);
  const total   = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [type, w] of entries) { r -= w; if (r <= 0) return type; }
  return entries[0][0];
}

export class WaveDirector {
  constructor() {
    this._acc         = 0;
    this._waveIndex   = -1;  // -1 forces transition check on first update
    this._bannerText  = '';
    this._bannerTimer = 0;   // counts down from BANNER_DURATION to 0
  }

  update(dt, elapsed, enemies, player, gameW, gameH) {
    // Wave transition check
    const newIndex = this._getWaveIndex(elapsed);
    if (newIndex !== this._waveIndex) {
      this._waveIndex = newIndex;
      if (newIndex > 0) {           // skip banner at game start
        this._bannerText  = WAVES[newIndex].name;
        this._bannerTimer = BANNER_DURATION;
      }
    }

    if (this._bannerTimer > 0) this._bannerTimer -= dt;

    // Hard enemy cap — pause spawning, do not crash
    if (enemies.length >= MAX_ENEMIES) return;

    const wave     = WAVES[this._waveIndex];
    const rate     = this._spawnRate(elapsed, wave);
    const interval = 1 / rate;
    this._acc += dt;

    while (this._acc >= interval && enemies.length < MAX_ENEMIES) {
      this._acc -= interval;
      this._spawnOne(elapsed, enemies, player, gameW, gameH, wave);
    }
  }

  // Returns info the UI needs this frame.
  getWaveInfo() {
    const wave = WAVES[Math.max(0, this._waveIndex)];
    const t    = this._bannerTimer;
    let bannerAlpha = 0;
    if (t > 0) {
      const age  = BANNER_DURATION - t;  // time since banner appeared
      const fadeIn  = Math.min(age  / 0.35, 1);
      const fadeOut = Math.min(t    / 0.9,  1);
      bannerAlpha = fadeIn * fadeOut;
    }
    return {
      waveNumber:  this._waveIndex + 1,
      waveName:    wave.name,
      bannerText:  this._bannerText,
      bannerAlpha,
    };
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _getWaveIndex(elapsed) {
    let idx = 0;
    for (let i = 0; i < WAVES.length; i++) {
      if (elapsed >= WAVES[i].time) idx = i;
    }
    return idx;
  }

  _spawnRate(elapsed, wave) {
    // After the last wave boundary, keep scaling spawn rate
    const lateBonus = Math.max(0, elapsed - 300) / 60 * 0.35;
    return Math.min(wave.spawnRate + lateBonus, MAX_RATE);
  }

  _spawnOne(elapsed, enemies, player, gameW, gameH, wave) {
    // Smooth HP and speed scaling over the full run
    const hpScale    = 1 + elapsed / 300 * 0.55;
    const speedScale = 1 + elapsed / 300 * 0.18;
    const type       = weightedRandom(wave.weights);
    const { x, y }   = this._spawnPos(player, gameW, gameH);
    enemies.push(new Enemy(x, y, type, { hpScale, speedScale }));
  }

  _spawnPos(player, gameW, gameH) {
    const hw    = gameW / 2 + SPAWN_MARGIN;
    const hh    = gameH / 2 + SPAWN_MARGIN;
    const angle = Math.random() * Math.PI * 2;
    const tx    = Math.cos(angle);
    const ty    = Math.sin(angle);
    const scale = Math.min(
      Math.abs(tx) > 0.001 ? hw / Math.abs(tx) : Infinity,
      Math.abs(ty) > 0.001 ? hh / Math.abs(ty) : Infinity,
    );
    return { x: player.x + tx * scale, y: player.y + ty * scale };
  }
}
