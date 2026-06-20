import { Input }          from './Input.js';
import { Camera }         from './Camera.js';
import { Player }         from '../entities/Player.js';
import { drawBackground } from '../systems/Renderer.js';
import { UISystem }       from '../systems/UISystem.js';

const GAME_W = 1920;
const GAME_H = 1080;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // Fix the internal drawing buffer to 1920×1080
    canvas.width  = GAME_W;
    canvas.height = GAME_H;

    this.input  = new Input();
    this.camera = new Camera(GAME_W, GAME_H);
    this.player = new Player(0, 0);
    this.ui     = new UISystem(GAME_W, GAME_H);

    this.elapsed  = 0;   // seconds since game start
    this.fps      = 0;
    this._fpsAcc  = 0;
    this._fpsCnt  = 0;
    this._lastTs  = null;

    this._setupScaling();
    window.addEventListener('resize', () => this._setupScaling());
  }

  // Scale CSS size to fill the window while maintaining 16:9.
  _setupScaling() {
    const scale = Math.min(
      window.innerWidth  / GAME_W,
      window.innerHeight / GAME_H,
    );
    this.canvas.style.width  = `${GAME_W * scale}px`;
    this.canvas.style.height = `${GAME_H * scale}px`;
  }

  start() {
    requestAnimationFrame(ts => this._loop(ts));
  }

  _loop(timestamp) {
    // Cap dt at 100ms so a tab-blur pause doesn't teleport the player
    const dt = this._lastTs === null
      ? 0
      : Math.min((timestamp - this._lastTs) / 1000, 0.1);
    this._lastTs = timestamp;

    this._update(dt);
    this._draw();

    requestAnimationFrame(ts => this._loop(ts));
  }

  _update(dt) {
    this.elapsed += dt;

    // Rolling FPS — recalculate once per second
    this._fpsAcc += dt;
    this._fpsCnt += 1;
    if (this._fpsAcc >= 1) {
      this.fps     = this._fpsCnt;
      this._fpsAcc = 0;
      this._fpsCnt = 0;
    }

    this.player.update(dt, this.input);
    this.camera.follow(this.player.x, this.player.y);
  }

  _draw() {
    const { ctx } = this;
    drawBackground(ctx, this.camera, GAME_W, GAME_H);
    this.player.draw(ctx, this.camera);
    this.ui.drawHUD(ctx, this.player, this.elapsed, this.fps);
  }
}
