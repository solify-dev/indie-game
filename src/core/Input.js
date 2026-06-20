// Tracks which keys are currently held. Exposes a normalised movement vector.
export class Input {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', e => { this.keys[e.code] = true; });
    window.addEventListener('keyup',   e => { this.keys[e.code] = false; });
  }

  isDown(code) {
    return !!this.keys[code];
  }

  // Returns a unit vector {dx, dy} from WASD / arrow keys.
  getMovementVector() {
    let dx = 0;
    let dy = 0;
    if (this.isDown('KeyW') || this.isDown('ArrowUp'))    dy -= 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown'))  dy += 1;
    if (this.isDown('KeyA') || this.isDown('ArrowLeft'))  dx -= 1;
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) dx += 1;

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) { dx /= len; dy /= len; }
    return { dx, dy };
  }
}
