import { Entity }      from '../core/Entity.js';
import { GameConfig }  from '../config/GameConfig.js';
import { getGemSprite } from '../assets/ProceduralSprites.js';
import { distance }    from '../core/MathUtils.js';

const CFG = GameConfig.gems;

export class XPGem extends Entity {
  constructor(x, y, value = 1) {
    super(x, y);
    this.value  = value;
    this.radius = CFG.collectRadius;

    // Larger gems for higher XP values
    this._size   = value >= 3 ? 48 : 32;
    this._sprite = getGemSprite(value >= 3 ? 'large' : 'small');
    this._age    = Math.random() * Math.PI * 2; // phase offset so gems don't all bob in sync
  }

  update(dt, player) {
    this._age += CFG.bobSpeed * dt;

    const d = distance(this.x, this.y, player.x, player.y);

    // Fly toward player once inside magnet radius
    if (d < CFG.magnetRadius && d > 0) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      this.x += (dx / d) * CFG.magnetSpeed * dt;
      this.y += (dy / d) * CFG.magnetSpeed * dt;
    }

    // Collect on contact — player handles the XP and leveling
    if (d < player.radius + this._size / 2) {
      player.gainXP(this.value);
      this.active = false;
    }
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const bob  = Math.sin(this._age) * 4;  // gentle up/down hover
    const half = this._size / 2;

    ctx.save();
    ctx.drawImage(this._sprite, sx - half, sy - half + bob, this._size, this._size);
    ctx.restore();
  }
}
