import { GameConfig }       from '../config/GameConfig.js';
import { Input }            from './Input.js';
import { Camera }           from './Camera.js';
import { Player }           from '../entities/Player.js';
import { XPGem, gemTypeForValue } from '../entities/XPGem.js';
import { drawBackground }   from '../systems/Renderer.js';
import { UISystem }         from '../systems/UISystem.js';
import { WaveDirector }     from '../systems/WaveDirector.js';
import { WeaponSystem }     from '../systems/WeaponSystem.js';
import { CollisionSystem }  from '../systems/CollisionSystem.js';
import { DamageNumbers }    from '../systems/DamageNumbers.js';
import { UpgradeSystem }    from '../systems/UpgradeSystem.js';
import { PassiveSystem }    from '../systems/PassiveSystem.js';

const { WIDTH: GW, HEIGHT: GH } = GameConfig;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    canvas.width  = GW;
    canvas.height = GH;

    // Systems that survive across resets
    this.input     = new Input();
    this.camera    = new Camera(GW, GH);
    this.ui        = new UISystem(GW, GH);
    this.collision = new CollisionSystem();

    this._lastTs   = null;
    this._cardRects = [];  // bounding boxes of the current level-up cards
    this._hoverCard = -1;  // index of card the mouse is over (-1 = none)

    this._setupScaling();
    window.addEventListener('resize', () => this._setupScaling());

    // Keyboard: R to restart, 1/2/3 to pick upgrade
    window.addEventListener('keydown', e => this._onKey(e));

    // Mouse: hover detection and card clicks
    canvas.addEventListener('mousemove', e => this._onMouseMove(e));
    canvas.addEventListener('click',     e => this._onMouseClick(e));

    this._reset();
  }

  _reset() {
    this.player      = new Player(0, 0);
    this.enemies     = [];
    this.projectiles = [];
    this.xpGems      = [];
    this.waveDir = new WaveDirector();
    this.weapons     = new WeaponSystem();
    this.passives    = new PassiveSystem();
    this.dmgNums     = new DamageNumbers();
    this.upgrades    = new UpgradeSystem();

    this.elapsed = 0;
    this.kills   = 0;
    this.fps     = 0;
    this._fpsAcc = 0;
    this._fpsCnt = 0;
    this._shake  = 0;
    this._lastTs = null;

    // Queued level-ups: if the player banks enough XP for 2+ levels at once,
    // we show the upgrade menu once per level rather than skipping any.
    this._pendingLevelUps = 0;
    this._levelUpChoices  = [];

    this.state = 'playing'; // 'playing' | 'levelup' | 'gameover'

    this._cardRects = [];
    this._hoverCard = -1;

    this.camera.follow(0, 0);
  }

  _setupScaling() {
    const scale = Math.min(window.innerWidth / GW, window.innerHeight / GH);
    this.canvas.style.width  = `${GW * scale}px`;
    this.canvas.style.height = `${GH * scale}px`;
  }

  start() {
    requestAnimationFrame(ts => this._loop(ts));
  }

  // ── Input handlers ────────────────────────────────────────────────────────
  _onKey(e) {
    if (e.code === 'KeyR' && this.state === 'gameover') {
      this._reset();
      return;
    }
    if (this.state === 'levelup') {
      const idx = { Digit1: 0, Digit2: 1, Digit3: 2 }[e.code];
      if (idx !== undefined) this._pickUpgrade(idx);
    }
  }

  // Convert a browser mouse event to internal canvas coordinates (1920×1080 space)
  _canvasPos(evt) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = GW / rect.width;
    const scaleY = GH / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top)  * scaleY,
    };
  }

  _onMouseMove(e) {
    if (this.state !== 'levelup') { this._hoverCard = -1; return; }
    const pos = this._canvasPos(e);
    this._hoverCard = -1;
    for (let i = 0; i < this._cardRects.length; i++) {
      const r = this._cardRects[i];
      if (pos.x >= r.x && pos.x <= r.x + r.w &&
          pos.y >= r.y && pos.y <= r.y + r.h) {
        this._hoverCard = i;
        break;
      }
    }
  }

  _onMouseClick(e) {
    if (this.state !== 'levelup') return;
    const pos = this._canvasPos(e);
    for (let i = 0; i < this._cardRects.length; i++) {
      const r = this._cardRects[i];
      if (pos.x >= r.x && pos.x <= r.x + r.w &&
          pos.y >= r.y && pos.y <= r.y + r.h) {
        this._pickUpgrade(i);
        return;
      }
    }
  }

  _pickUpgrade(index) {
    const choice = this._levelUpChoices[index];
    if (!choice) return;
    this.upgrades.apply(choice, this.player, this.weapons, this.passives);
    this._hoverCard = -1;

    if (this._pendingLevelUps > 0) {
      this._openLevelUpMenu();
    } else {
      this.state = 'playing';
    }
  }

  _openLevelUpMenu() {
    this._pendingLevelUps   -= 1;
    this._levelUpChoices     = this.upgrades.pickThree(this.weapons, this.passives);
    this._cardRects          = [];
    this.state               = 'levelup';
  }

  // ── Main loop ─────────────────────────────────────────────────────────────
  _loop(timestamp) {
    const dt = this._lastTs === null
      ? 0
      : Math.min((timestamp - this._lastTs) / 1000, 0.1);
    this._lastTs = timestamp;

    if (this.state === 'playing') this._update(dt);
    this._draw();

    requestAnimationFrame(ts => this._loop(ts));
  }

  // ── Update ────────────────────────────────────────────────────────────────
  _update(dt) {
    this.elapsed += dt;

    this._fpsAcc += dt; this._fpsCnt += 1;
    if (this._fpsAcc >= 1) { this.fps = this._fpsCnt; this._fpsAcc = 0; this._fpsCnt = 0; }

    this.player.update(dt, this.input);
    this.camera.follow(this.player.x, this.player.y);

    this.waveDir.update(dt, this.elapsed, this.enemies, this.player, GW, GH);

    for (const e of this.enemies)     e.update(dt, this.player);
    for (const p of this.projectiles) p.update(dt);
    for (const g of this.xpGems)      g.update(dt, this.player);
    this.dmgNums.update(dt);

    this.weapons.update(dt, this.player, this.enemies, this.projectiles);

    const result = this.collision.update(
      this.player, this.enemies, this.projectiles, GW, GH, this.camera,
    );
    this.kills  += result.kills;
    this._shake += result.shakeAmount;

    // Drop XP gems for newly killed enemies
    for (const e of this.enemies) {
      if (!e.active) {
        this.xpGems.push(new XPGem(e.x, e.y, gemTypeForValue(e.xpValue)));
      }
    }

    for (const dn of result.damageNumbers) this.dmgNums.add(dn.x, dn.y, dn.value);

    this._shake *= GameConfig.shake.decay;
    if (this._shake < 0.5) this._shake = 0;

    this.enemies     = this.enemies.filter(e => e.active);
    this.projectiles = this.projectiles.filter(p => p.active);
    this.xpGems      = this.xpGems.filter(g => g.active);

    // Check for level-ups — queue any extras so none are skipped
    while (this.player.canLevelUp) {
      this.player.levelUp();
      this._pendingLevelUps++;
    }
    if (this._pendingLevelUps > 0 && this.state === 'playing') {
      this._openLevelUpMenu();
    }

    if (this.player.isDead) this.state = 'gameover';
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  _draw() {
    const { ctx } = this;

    ctx.save();
    if (this._shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this._shake * 2,
        (Math.random() - 0.5) * this._shake * 2,
      );
    }

    drawBackground(ctx, this.camera, GW, GH);
    for (const g of this.xpGems)      g.draw(ctx, this.camera);
    for (const e of this.enemies)     e.draw(ctx, this.camera);
    for (const p of this.projectiles) p.draw(ctx, this.camera);
    this.player.draw(ctx, this.camera);
    this.weapons.draw(ctx, this.camera, this.player);
    this.dmgNums.draw(ctx, this.camera);

    ctx.restore(); // end shake before drawing UI

    const waveInfo = this.waveDir.getWaveInfo();
    this.ui.drawHUD(ctx, this.player, this.elapsed, this.fps, this.kills,
      this.weapons.getHUDInfo(), this.passives.getHUDInfo(), waveInfo);
    if (this.state === 'playing') this.ui.drawWaveBanner(ctx, waveInfo);

    if (this.state === 'levelup') {
      // drawLevelUp returns card rects for click/hover hit-testing
      this._cardRects = this.ui.drawLevelUp(ctx, this._levelUpChoices, this._hoverCard);
    }

    if (this.state === 'gameover') {
      this.ui.drawGameOver(ctx, this.elapsed, this.kills, this.player.level);
    }
  }
}
