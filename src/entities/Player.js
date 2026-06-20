import { getPlayerSprite } from '../assets/ProceduralSprites.js';

const SPRITE_SIZE    = 182;
const COLLISION_R    = 22;   // hitbox radius — intentionally smaller than sprite
const BASE_SPEED     = 220;  // world pixels per second

export class Player {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.speed  = BASE_SPEED;
    this.hp     = 100;
    this.maxHp  = 100;
    this.level  = 1;
    this.xp     = 0;
    this.xpToNext        = 100;
    this.collisionRadius = COLLISION_R;

    this.facing  = 1;  // 1 = right, -1 = left (used for sprite flip)
    this._sprite = getPlayerSprite();
  }

  update(dt, input) {
    const { dx, dy } = input.getMovementVector();
    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;
    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
  }

  draw(ctx, camera) {
    const { x: sx, y: sy } = camera.toScreen(this.x, this.y);
    const half = SPRITE_SIZE / 2;

    ctx.save();
    ctx.translate(sx, sy);
    if (this.facing === -1) ctx.scale(-1, 1); // mirror when moving left
    ctx.drawImage(this._sprite, -half, -half, SPRITE_SIZE, SPRITE_SIZE);
    ctx.restore();
  }
}
