import { GameConfig } from '../config/GameConfig.js';

// ── Stat upgrades ─────────────────────────────────────────────────────────────
// These are passive bonuses applied to the Player object.
// Weapon-specific upgrades are handled via WeaponSystem.getUpgradeChoices().

const STAT_UPGRADES = [
  {
    id:       'weapon_damage',
    name:     'Arcane Power',
    icon:     '⚔',
    maxLevel: 5,
    effectText: '+25% damage (all weapons)',
    apply: (player) => { player.weaponDamageMulti += 0.25; },
  },
  {
    id:       'fire_rate',
    name:     'Swiftcast',
    icon:     '🌀',
    maxLevel: 5,
    effectText: '+20% attack speed (all weapons)',
    apply: (player) => { player.weaponFireRateMulti += 0.20; },
  },
  {
    id:       'proj_speed',
    name:     'Swift Shots',
    icon:     '💨',
    maxLevel: 4,
    effectText: '+25% projectile speed',
    apply: (player) => { player.projectileSpeedMulti += 0.25; },
  },
  {
    id:       'move_speed',
    name:     'Fleet Feet',
    icon:     '👟',
    maxLevel: 5,
    effectText: '+10% movement speed',
    apply: (player) => { player.speed += GameConfig.player.speed * 0.10; },
  },
  {
    id:       'max_hp',
    name:     'Iron Body',
    icon:     '🛡',
    maxLevel: 5,
    effectText: '+25 max HP  (also heals)',
    apply: (player) => { player.maxHp += 25; player.hp += 25; },
  },
  {
    id:       'heal',
    name:     'Life Surge',
    icon:     '❤',
    maxLevel: 3,
    effectText: 'Restore 30 HP now',
    apply: (player) => { player.hp = Math.min(player.maxHp, player.hp + 30); },
  },
  {
    id:       'magnet',
    name:     'Soul Pull',
    icon:     '🧲',
    maxLevel: 4,
    effectText: '+50 px XP magnet range',
    apply: (player) => { player.magnetRadius += 50; },
  },
];

// ── UpgradeSystem ─────────────────────────────────────────────────────────────
export class UpgradeSystem {
  constructor() {
    this._ownedStats = new Map(); // statId → times taken
  }

  /**
   * Build a pool of up to 3 choices from:
   *   1. Stat upgrades not yet maxed
   *   2. Weapon-level upgrades (from WeaponSystem)
   *   3. New weapons not yet owned (from WeaponSystem)
   *
   * The pool is shuffled, then trimmed to 3.
   */
  pickThree(weaponSystem) {
    const statCards = STAT_UPGRADES
      .filter(u => (this._ownedStats.get(u.id) ?? 0) < u.maxLevel)
      .map(u => ({
        type:         'stat',
        id:           u.id,
        name:         u.name,
        icon:         u.icon,
        effectText:   u.effectText,
        currentLevel: this._ownedStats.get(u.id) ?? 0,
        maxLevel:     u.maxLevel,
      }));

    const weaponCards = weaponSystem.getUpgradeChoices();

    const pool = [...statCards, ...weaponCards];
    this._shuffle(pool);
    return pool.slice(0, 3);
  }

  /**
   * Apply a chosen upgrade card.
   * choice.type determines which system handles it.
   */
  apply(choice, player, weaponSystem) {
    if (choice.type === 'stat') {
      const u = STAT_UPGRADES.find(s => s.id === choice.id);
      if (!u) return;
      const newLevel = (this._ownedStats.get(choice.id) ?? 0) + 1;
      this._ownedStats.set(choice.id, newLevel);
      u.apply(player, newLevel);
    } else if (choice.type === 'weapon_upgrade') {
      weaponSystem.upgradeWeapon(choice.id);
    } else if (choice.type === 'new_weapon') {
      weaponSystem.addWeapon(choice.id);
    }
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
