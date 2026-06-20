export class UISystem {
  constructor(gameWidth, gameHeight) {
    this.gw = gameWidth;
    this.gh = gameHeight;
  }

  // ── In-game HUD ─────────────────────────────────────────────────────────────
  drawHUD(ctx, player, elapsed, fps, kills) {
    const PAD = 30;

    // Title watermark
    ctx.save();
    ctx.font      = 'bold 36px monospace';
    ctx.fillStyle = 'rgba(100,160,255,0.18)';
    ctx.textAlign = 'center';
    ctx.fillText('AETHER SURVIVORS', this.gw / 2, 52);
    ctx.restore();

    // Timer
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
    ctx.save();
    ctx.font        = 'bold 48px monospace';
    ctx.fillStyle   = '#ffffff';
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(100,160,255,0.9)';
    ctx.shadowBlur  = 14;
    ctx.fillText(`${mins}:${secs}`, this.gw / 2, PAD + 44);
    ctx.restore();

    // Kill counter
    ctx.save();
    ctx.font        = 'bold 32px monospace';
    ctx.fillStyle   = '#ffdd55';
    ctx.textAlign   = 'right';
    ctx.shadowColor = 'rgba(255,200,0,0.6)';
    ctx.shadowBlur  = 8;
    ctx.fillText(`☆ ${kills}`, this.gw - PAD, PAD + 36);
    ctx.restore();

    // FPS
    ctx.save();
    ctx.font      = '20px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right';
    ctx.shadowBlur = 0;
    ctx.fillText(`FPS ${fps}`, this.gw - PAD, PAD + 62);
    ctx.restore();

    // HP bar (bottom-left, large)
    const barW = 360;
    const barH = 28;
    const bx   = PAD;
    const by   = this.gh - PAD - barH * 2 - 20;

    ctx.save();
    ctx.font      = '22px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'left';
    ctx.fillText('HP', bx, by - 7);
    ctx.restore();

    this._drawBar(ctx, bx, by,              barW, barH, player.hp / player.maxHp,       '#e03030', '#1a1a1a');
    this._drawBar(ctx, bx, by + barH + 10,  barW, barH, player.xp / player.xpToNext,    '#00cc88', '#1a1a1a');

    // HP numbers inside bar
    ctx.save();
    ctx.font      = 'bold 17px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.hp} / ${player.maxHp}`, bx + barW / 2, by + barH - 7);
    ctx.restore();

    ctx.save();
    ctx.font      = '22px monospace';
    ctx.fillStyle = '#aaffcc';
    ctx.textAlign = 'left';
    ctx.fillText(`Lv. ${player.level}`, bx + barW + 14, by + barH + 10 + 20);
    ctx.restore();

    // World position debug
    ctx.save();
    ctx.font      = '18px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.textAlign = 'right';
    ctx.fillText(
      `pos (${Math.round(player.x)}, ${Math.round(player.y)})`,
      this.gw - PAD, this.gh - PAD,
    );
    ctx.restore();
  }

  // ── Game Over screen ─────────────────────────────────────────────────────────
  drawGameOver(ctx, elapsed, kills, level) {
    const cx = this.gw / 2;
    const cy = this.gh / 2;

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, this.gw, this.gh);

    // Panel
    const pw = 680;
    const ph = 420;
    const px = cx - pw / 2;
    const py = cy - ph / 2;

    ctx.fillStyle   = '#0d0d1a';
    ctx.strokeStyle = '#4466aa';
    ctx.lineWidth   = 3;
    this._roundRect(ctx, px, py, pw, ph, 18);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.save();
    ctx.font        = 'bold 72px monospace';
    ctx.fillStyle   = '#ff4444';
    ctx.textAlign   = 'center';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur  = 24;
    ctx.fillText('GAME OVER', cx, py + 100);
    ctx.restore();

    // Divider
    ctx.strokeStyle = '#334466';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(px + 40, py + 118); ctx.lineTo(px + pw - 40, py + 118);
    ctx.stroke();

    // Stats
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
    const stats = [
      ['Time Survived', `${mins}:${secs}`],
      ['Enemies Killed', `${kills}`],
      ['Final Level',    `${level}`],
    ];

    ctx.save();
    ctx.font      = '34px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i < stats.length; i++) {
      const row = py + 170 + i * 56;
      ctx.fillStyle = '#8899bb';
      ctx.fillText(stats[i][0], px + 60, row);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText(stats[i][1], px + pw - 60, row);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    // Divider
    ctx.strokeStyle = '#334466';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(px + 40, py + 345); ctx.lineTo(px + pw - 40, py + 345);
    ctx.stroke();

    // Restart prompt (pulse opacity)
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);
    ctx.save();
    ctx.font        = 'bold 30px monospace';
    ctx.fillStyle   = `rgba(100,200,255,${pulse})`;
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(100,200,255,0.5)';
    ctx.shadowBlur  = 10;
    ctx.fillText('Press  R  to restart', cx, py + ph - 44);
    ctx.restore();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  _drawBar(ctx, x, y, w, h, fill, colour, bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colour;
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, fill)), h);
    ctx.strokeStyle = '#444';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x, y, w, h);
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h,     x, y + h - r,     r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y,         x + r, y,         r);
    ctx.closePath();
  }
}
