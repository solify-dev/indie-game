import { GameConfig } from '../config/GameConfig.js';

// Each passive applies a fixed delta per level when picked.
// `apply(player)` is called once per level gained.
export const PASSIVE_ITEMS = [
  {
    id:          'spellbook',
    name:        'Spellbook',
    icon:        '📖',
    description: 'Reduces all weapon cooldowns.',
    maxLevel:    5,
    effectText:  '+15% attack speed (all weapons)',
    apply: (player) => { player.weaponFireRateMulti += 0.15; },
  },
  {
    id:          'power_stone',
    name:        'Power Stone',
    icon:        '💎',
    description: 'Increases all weapon damage.',
    maxLevel:    5,
    effectText:  '+20% weapon damage',
    apply: (player) => { player.weaponDamageMulti += 0.20; },
  },
  {
    id:          'wind_boots',
    name:        'Wind Boots',
    icon:        '👟',
    description: 'Increases movement speed.',
    maxLevel:    5,
    effectText:  '+10% movement speed',
    apply: (player) => { player.speed += GameConfig.player.speed * 0.10; },
  },
  {
    id:          'magnet_charm',
    name:        'Magnet Charm',
    icon:        '🧲',
    description: 'Increases XP pickup range.',
    maxLevel:    4,
    effectText:  '+60 px XP magnet range',
    apply: (player) => { player.magnetRadius += 60; },
  },
  {
    id:          'iron_heart',
    name:        'Iron Heart',
    icon:        '🛡',
    description: 'Increases max HP (also heals).',
    maxLevel:    5,
    effectText:  '+30 max HP  (also heals)',
    apply: (player) => { player.maxHp += 30; player.hp = Math.min(player.hp + 30, player.maxHp); },
  },
  {
    id:          'clover_coin',
    name:        'Clover Coin',
    icon:        '🍀',
    description: 'Improves luck for future rewards.',
    maxLevel:    5,
    effectText:  '+20% luck',
    apply: (player) => { player.luckMulti += 0.20; },
  },
];
