import { Entity }      from '../core/Entity.js';
import { GameConfig }  from '../config/GameConfig.js';
import { getGemSprite } from '../assets/ProceduralSprites.js';
import { distance }    from '../core/MathUtils.js';

const GEMS = GameConfig.gems;

// Map an XP value to the correct gem type string
export function gemTypeForValue(value) {
  if (value >= 10) return 'red';
  if (value >= 5)  return 'green';
  return 'blue';
}

export class XPGem extends Entity {
  // type: 'blue' | 'green' | 'red'
  constructor(x, y, type = 'blue') {
    super(x, y);
    const def    = GEMS.types[type] ?? GEMS.types.blue;
    this.type    = type;
    this.value   = def.value;
    this.radius  = GEMS.collectRadius;
    this._size   = def.size;
    this._sprite = getGemSprite(type);
    this._age    = Math.random() * Math.PI * 2; // random phase so gems bob out of sync
  }

  update(dt, player) {
    this._age += GEMS.bobSpeed * dt;

    const d = distance(this.x, this.y, player.x, player.y);

    // Fly toward player once inside the player's magnet radius
    if (d < player.magnetRadius && d > 0) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      this.x += (dx / d) * GEMS.magnetSpeed * dt;
      this.y += (dy / d) * GEMS.magnetSpeed * dt;
    }

    // Collect on contact — Player.gainXP / levelUp handled by Game
    if (d < player.radius + this._size / 2) {
      player.gainXP(this.value);
      this.active = false;
    }
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const bob  = Math.sin(this._age) * 4;
    const half = this._size / 2;

    ctx.save();
    ctx.drawImage(this._sprite, sx - half, sy - half + bob, this._size, this._size);
    ctx.restore();
  }
}
