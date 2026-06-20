import { PASSIVE_ITEMS } from '../passives/PassiveItems.js';

export class PassiveSystem {
  constructor() {
    this._owned = new Map(); // passiveId → current level (1-based)
  }

  // Apply one level of the passive to the player.
  addOrUpgrade(id, player) {
    const def = PASSIVE_ITEMS.find(p => p.id === id);
    if (!def) return;
    const current = this._owned.get(id) ?? 0;
    if (current >= def.maxLevel) return;
    this._owned.set(id, current + 1);
    def.apply(player);
  }

  // Cards for the level-up pool: new passives the player doesn't own,
  // plus upgrade cards for owned passives below max level.
  getUpgradeChoices() {
    return PASSIVE_ITEMS
      .filter(def => (this._owned.get(def.id) ?? 0) < def.maxLevel)
      .map(def => {
        const level = this._owned.get(def.id) ?? 0;
        return {
          type:         level === 0 ? 'new_passive' : 'passive_upgrade',
          id:           def.id,
          name:         def.name,
          icon:         def.icon,
          effectText:   def.effectText,
          currentLevel: level,
          maxLevel:     def.maxLevel,
        };
      });
  }

  // Summary for the HUD — only items the player actually owns.
  getHUDInfo() {
    return PASSIVE_ITEMS
      .filter(def => this._owned.has(def.id))
      .map(def => ({
        icon:     def.icon,
        name:     def.name,
        level:    this._owned.get(def.id),
        maxLevel: def.maxLevel,
      }));
  }
}
