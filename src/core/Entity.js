// Base class for every object that lives in the game world.
// All entities share: position, velocity, collision radius, active flag,
// and a consistent update / draw interface.

export class Entity {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.vx     = 0;   // velocity x  (px / second)
    this.vy     = 0;   // velocity y  (px / second)
    this.radius = 0;   // collision radius (px)
    this.active = true;
  }

  // Move by current velocity.  Call inside subclass update() when needed.
  _applyVelocity(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  // Override in subclasses.
  // eslint-disable-next-line no-unused-vars
  update(dt, ...args) {}

  // Override in subclasses.
  // eslint-disable-next-line no-unused-vars
  draw(ctx, camera) {}
}
