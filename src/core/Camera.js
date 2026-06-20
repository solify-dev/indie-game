// The camera keeps the player centred on-screen.
// Every draw call offsets world coords by (camera.x, camera.y).
export class Camera {
  constructor(gameWidth, gameHeight) {
    this.x      = 0; // world-space top-left of the visible area
    this.y      = 0;
    this.width  = gameWidth;
    this.height = gameHeight;
  }

  // Centre the view on a world position.
  follow(worldX, worldY) {
    this.x = worldX - this.width  / 2;
    this.y = worldY - this.height / 2;
  }

  // World → screen
  toScreen(worldX, worldY) {
    return { x: worldX - this.x, y: worldY - this.y };
  }

  // Screen → world
  toWorld(screenX, screenY) {
    return { x: screenX + this.x, y: screenY + this.y };
  }
}
