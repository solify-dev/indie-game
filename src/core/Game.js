import { Input }            from './Input.js';
import { Camera }           from './Camera.js';
import { Player }           from '../entities/Player.js';
import { XPGem }            from '../entities/XPGem.js';
import { drawBackground }   from '../systems/Renderer.js';
import { UISystem }         from '../systems/UISystem.js';
import { Spawner }          from '../systems/Spawner.js';
import { WeaponSystem }     from '../systems/WeaponSystem.js';
import { CollisionSystem }  from '../systems/CollisionSystem.js';
import { DamageNumbers }    from '../systems/DamageNumbers.js';

const GAME_W      = 1920;
const GAME_H      = 1080;
const SHAKE_DECAY = 0.88; // per-frame exponential decay

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    canvas.width  = GAME_W;
    canvas.height = GAME_H;

    // Systems that survive a reset
    this.input     = new Input();
    this.camera    = new Camera(GAME_W, GAME_H);
    this.ui        = new UISystem(GAME_W, GAME_H);
    this.collision = new CollisionSystem();

    this._shake  = 0;
    this._lastTs = null;

    this._setupScaling();
    window.addEventListener('resize', () => this._setupScaling());
    window.addEventListener('keydown', e => {
      if (e.code === 'KeyR' && this.state === 'gameover') this._reset();
    });

    this._reset();
  }

  // Re-initialise all per-run state without touching canvas / input / UI
  _reset() {
    this.player      = new Player(0, 0);
    this.enemies     = [];
    this.projectiles = [];
    this.xpGems      = [];
    this.spawner     = new Spawner();
    this.weapons     = new WeaponSystem();
    this.dmgNums     = new DamageNumbers();

    this.elapsed = 0;
    this.kills   = 0;
    this.fps     = 0;
    this._fpsAcc = 0;
    this._fpsCnt = 0;
    this._shake  = 0;
    this._lastTs = null;
    this.state   = 'playing'; // 'playing' | 'gameover'

    this.camera.follow(0, 0);
  }

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
    const dt = this._lastTs === null
      ? 0
      : Math.min((timestamp - this._lastTs) / 1000, 0.1);
    this._lastTs = timestamp;

    if (this.state === 'playing') this._update(dt);
    this._draw();

    requestAnimationFrame(ts => this._loop(ts));
  }

  _update(dt) {
    this.elapsed += dt;

    // Rolling FPS
    this._fpsAcc += dt;
    this._fpsCnt += 1;
    if (this._fpsAcc >= 1) {
      this.fps     = this._fpsCnt;
      this._fpsAcc = 0;
      this._fpsCnt = 0;
    }

    this.player.update(dt, this.input);
    this.camera.follow(this.player.x, this.player.y);

    this.spawner.update(
      dt, this.elapsed, this.enemies,
      this.player, GAME_W, GAME_H,
    );

    for (const e of this.enemies)     e.update(dt, this.player);
    for (const p of this.projectiles) p.update(dt);
    for (const g of this.xpGems)      g.update(dt, this.player);
    this.dmgNums.update(dt);

    this.weapons.update(dt, this.player, this.enemies, this.projectiles);

    const result = this.collision.update(
      this.player, this.enemies, this.projectiles,
      GAME_W, GAME_H, this.camera,
    );

    this.kills  += result.kills;
    this._shake += result.shakeAmount;

    // Spawn XP gems for newly killed enemies (still in array, not yet purged)
    for (const e of this.enemies) {
      if (!e.active) {
        this.xpGems.push(new XPGem(e.x, e.y, e.xpValue));
      }
    }

    for (const dn of result.damageNumbers) {
      this.dmgNums.add(dn.x, dn.y, dn.value);
    }

    this._shake *= SHAKE_DECAY;
    if (this._shake < 0.5) this._shake = 0;

    // Purge dead entities
    this.enemies     = this.enemies.filter(e => e.active);
    this.projectiles = this.projectiles.filter(p => p.active);
    this.xpGems      = this.xpGems.filter(g => g.active);

    if (this.player.isDead) this.state = 'gameover';
  }

  _draw() {
    const { ctx } = this;

    // Apply screen shake as a canvas translation
    ctx.save();
    if (this._shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this._shake * 2,
        (Math.random() - 0.5) * this._shake * 2,
      );
    }

    drawBackground(ctx, this.camera, GAME_W, GAME_H);

    for (const g of this.xpGems)      g.draw(ctx, this.camera);
    for (const e of this.enemies)     e.draw(ctx, this.camera);
    for (const p of this.projectiles) p.draw(ctx, this.camera);
    this.player.draw(ctx, this.camera);
    this.dmgNums.draw(ctx, this.camera);

    ctx.restore(); // end shake transform — HUD is drawn without shake

    this.ui.drawHUD(ctx, this.player, this.elapsed, this.fps, this.kills);

    if (this.state === 'gameover') {
      this.ui.drawGameOver(ctx, this.elapsed, this.kills, this.player.level);
    }
  }
}
