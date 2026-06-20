// Base class for all weapons.
// Each weapon has a definition object (DEF) with name, icon, description,
// maxLevel, and a stats array (one entry per level).
// Subclasses override update() and draw() to implement weapon behaviour.

export class WeaponBase {
  constructor(id, def) {
    this.id    = id;
    this._def  = def;
    this.level = 1;
  }

  get maxLevel()    { return this._def.maxLevel; }
  get isMaxLevel()  { return this.level >= this.maxLevel; }
  get name()        { return this._def.name; }
  get icon()        { return this._def.icon; }
  get description() { return this._def.description; }

  // Stats object for the current level (0-indexed array by level-1)
  get stats() { return this._def.stats[this.level - 1]; }

  levelUp() {
    if (!this.isMaxLevel) this.level++;
  }

  // Override in subclasses.
  // dt       – delta time in seconds
  // player   – Player instance (read position / stat multipliers)
  // enemies  – live enemy array
  // projectiles – shared projectile array to push into
  update(dt, player, enemies, projectiles) {}

  // Override in subclasses for weapons with persistent visuals (blades, rings).
  // Called once per frame; player is passed so weapons know its world position.
  draw(ctx, camera, player) {}
}
