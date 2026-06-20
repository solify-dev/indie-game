import { getGemSprite } from '../assets/ProceduralSprites.js';

const MAGNET_RADIUS = 90;
const MAGNET_SPEED  = 380;
const BOB_SPEED     = 2.2; // radians/sec

export class XPGem {
  constructor(x, y, value = 1) {
    this.x      = x;
    this.y      = y;
    this.value  = value;
    this.active = true;
    this._age   = Math.random() * Math.PI * 2; // phase offset for bob
    this._sprite = getGemSprite(value >= 3 ? 'large' : 'small');
    this._size   = value >= 3 ? 48 : 32;
  }

  update(dt, player) {
    this._age += BOB_SPEED * dt;

    const dx  = player.x - this.x;
    const dy  = player.y - this.y;
    const d   = Math.sqrt(dx * dx + dy * dy);

    // Pull toward player when inside magnet radius
    if (d < MAGNET_RADIUS && d > 0) {
      this.x += (dx / d) * MAGNET_SPEED * dt;
      this.y += (dy / d) * MAGNET_SPEED * dt;
    }

    // Collect when touching player
    if (d < player.collisionRadius + this._size / 2) {
      player.xp += this.value;
      if (player.xp >= player.xpToNext) {
        player.xp       -= player.xpToNext;
        player.level    += 1;
        player.xpToNext  = Math.floor(player.xpToNext * 1.15);
      }
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
