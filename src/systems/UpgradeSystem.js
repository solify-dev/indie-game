// UpgradeSystem owns the level-up pool logic and applies chosen cards.
// All item/weapon definitions live in their own data files — this file
// only orchestrates: gather choices, shuffle, route apply() calls.

const HEAL_CARD = {
  type:         'heal',
  id:           'heal',
  name:         'Life Surge',
  icon:         '❤',
  effectText:   'Restore 40 HP now',
  currentLevel: 0,
  maxLevel:     1,
};

export class UpgradeSystem {
  /**
   * Build a pool of up to 3 choices from weapon and passive systems combined,
   * then shuffle and trim. Pads with heal cards if the pool has fewer than 3.
   */
  pickThree(weaponSystem, passiveSystem) {
    const pool = [
      ...weaponSystem.getUpgradeChoices(),
      ...passiveSystem.getUpgradeChoices(),
    ];
    this._shuffle(pool);
    const choices = pool.slice(0, 3);

    // Fallback: fill empty slots with heal cards so the menu is never empty
    while (choices.length < 3) {
      choices.push({ ...HEAL_CARD });
    }
    return choices;
  }

  /**
   * Apply a chosen card. Routes by choice.type to the right system.
   */
  apply(choice, player, weaponSystem, passiveSystem) {
    switch (choice.type) {
      case 'new_weapon':
        weaponSystem.addWeapon(choice.id);
        break;
      case 'weapon_upgrade':
        weaponSystem.upgradeWeapon(choice.id);
        break;
      case 'new_passive':
      case 'passive_upgrade':
        passiveSystem.addOrUpgrade(choice.id, player);
        break;
      case 'heal':
        player.hp = Math.min(player.maxHp, player.hp + 40);
        break;
    }
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
