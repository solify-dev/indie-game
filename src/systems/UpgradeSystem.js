import { GameConfig } from '../config/GameConfig.js';

// ── Upgrade pool ──────────────────────────────────────────────────────────────
// To add a new upgrade: push a new entry into this array.
// apply(player, level) receives the NEW level (1 on first pick, 2 on second, …).

const UPGRADES = [
  {
    id:       'weapon_damage',
    name:     'Sharper Orbs',
    icon:     '⚔',
    maxLevel: 5,
    effectText: '+25% projectile damage',
    apply: (player) => {
      player.weaponDamageMulti += 0.25;
    },
  },
  {
    id:       'fire_rate',
    name:     'Rapid Fire',
    icon:     '⚡',
    maxLevel: 5,
    effectText: '+20% attack speed',
    apply: (player) => {
      player.weaponFireRateMulti += 0.20;
    },
  },
  {
    id:       'proj_speed',
    name:     'Swift Shots',
    icon:     '💨',
    maxLevel: 4,
    effectText: '+25% projectile speed',
    apply: (player) => {
      player.projectileSpeedMulti += 0.25;
    },
  },
  {
    id:       'move_speed',
    name:     'Fleet Feet',
    icon:     '👟',
    maxLevel: 5,
    effectText: '+10% movement speed',
    apply: (player) => {
      player.speed += GameConfig.player.speed * 0.10;
    },
  },
  {
    id:       'max_hp',
    name:     'Iron Body',
    icon:     '🛡',
    maxLevel: 5,
    effectText: '+25 max HP  (also heals)',
    apply: (player) => {
      player.maxHp += 25;
      player.hp    += 25; // heal the bonus amount too
    },
  },
  {
    id:       'heal',
    name:     'Life Surge',
    icon:     '❤',
    maxLevel: 3,
    effectText: 'Restore 30 HP now',
    apply: (player) => {
      player.hp = Math.min(player.maxHp, player.hp + 30);
    },
  },
  {
    id:       'magnet',
    name:     'Soul Pull',
    icon:     '🧲',
    maxLevel: 4,
    effectText: '+50 px XP magnet range',
    apply: (player) => {
      player.magnetRadius += 50;
    },
  },
];

// ── UpgradeSystem ─────────────────────────────────────────────────────────────
export class UpgradeSystem {
  constructor() {
    // Maps upgrade id → number of times taken
    this._owned = new Map();
  }

  // Returns an array of up to 3 upgrade choice objects (fewer if pool runs dry).
  // Each object has everything UISystem needs to draw the card.
  pickThree() {
    // Filter out fully-maxed upgrades
    const eligible = UPGRADES.filter(u => {
      const taken = this._owned.get(u.id) ?? 0;
      return taken < u.maxLevel;
    });

    // Shuffle in place using Fisher-Yates
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    // Build card data from the first 3 shuffled entries
    return eligible.slice(0, 3).map(u => ({
      id:           u.id,
      name:         u.name,
      icon:         u.icon,
      effectText:   u.effectText,
      currentLevel: this._owned.get(u.id) ?? 0,
      maxLevel:     u.maxLevel,
    }));
  }

  // Apply the chosen upgrade to the player and record it.
  apply(id, player) {
    const upgrade = UPGRADES.find(u => u.id === id);
    if (!upgrade) return;

    const newLevel = (this._owned.get(id) ?? 0) + 1;
    this._owned.set(id, newLevel);
    upgrade.apply(player, newLevel);
  }

  // How many times a given upgrade has been taken (0 if never).
  getLevel(id) {
    return this._owned.get(id) ?? 0;
  }
}
