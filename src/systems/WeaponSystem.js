// WeaponSystem is a manager.
// It holds the player's current weapon instances and delegates
// update / draw calls to each one.

import { ArcaneBolt }    from '../weapons/ArcaneBolt.js';
import { OrbitingBlade } from '../weapons/OrbitingBlade.js';
import { HolyPulse }     from '../weapons/HolyPulse.js';
import { LightningMark } from '../weapons/LightningMark.js';

// All weapons the game knows about.
// Add new weapon classes here when you create them.
const REGISTRY = {
  arcane_bolt:    ArcaneBolt,
  orbiting_blade: OrbitingBlade,
  holy_pulse:     HolyPulse,
  lightning_mark: LightningMark,
};

export class WeaponSystem {
  constructor() {
    // Map of weaponId → weapon instance (insertion order = display order)
    this._weapons = new Map();

    // Player starts with Arcane Bolt
    this.addWeapon('arcane_bolt');
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  addWeapon(id) {
    if (this._weapons.has(id)) return; // already owned
    const Cls = REGISTRY[id];
    if (!Cls) { console.warn(`Unknown weapon id: ${id}`); return; }
    this._weapons.set(id, new Cls());
  }

  upgradeWeapon(id) {
    this._weapons.get(id)?.levelUp();
  }

  hasWeapon(id)   { return this._weapons.has(id); }
  getWeapons()    { return [...this._weapons.values()]; }

  // Returns card data for the level-up menu:
  //   - weapon_upgrade entries for every owned weapon below max level
  //   - new_weapon entries for every unowned weapon
  getUpgradeChoices() {
    const choices = [];

    for (const [id, weapon] of this._weapons) {
      if (weapon.isMaxLevel) continue;
      choices.push({
        type:         'weapon_upgrade',
        id,
        name:         weapon.name,
        icon:         weapon.icon,
        effectText:   `Upgrade to Lv ${weapon.level + 1}`,
        currentLevel: weapon.level,
        maxLevel:     weapon.maxLevel,
      });
    }

    for (const [id, Cls] of Object.entries(REGISTRY)) {
      if (this._weapons.has(id)) continue;
      const def = Cls.DEF;
      choices.push({
        type:         'new_weapon',
        id,
        name:         def.name,
        icon:         def.icon,
        effectText:   def.description,
        currentLevel: 0,
        maxLevel:     def.maxLevel,
      });
    }

    return choices;
  }

  // Summary for the HUD weapon panel
  getHUDInfo() {
    return this.getWeapons().map(w => ({
      name:     w.name,
      icon:     w.icon,
      level:    w.level,
      maxLevel: w.maxLevel,
    }));
  }

  // ── Frame methods ───────────────────────────────────────────────────────────

  update(dt, player, enemies, projectiles) {
    for (const w of this._weapons.values()) {
      w.update(dt, player, enemies, projectiles);
    }
  }

  draw(ctx, camera, player) {
    for (const w of this._weapons.values()) {
      w.draw(ctx, camera, player);
    }
  }
}
