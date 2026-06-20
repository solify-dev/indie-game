// Draws the in-game HUD and overlay screens onto the canvas.
export class UISystem {
  constructor(gameWidth, gameHeight) {
    this.gw = gameWidth;
    this.gh = gameHeight;
  }

  drawHUD(ctx, player, elapsed, fps) {
    const PAD = 30;

    // ── Title watermark (top-centre, subtle) ─────────────────────────────────
    ctx.save();
    ctx.font        = 'bold 36px monospace';
    ctx.fillStyle   = 'rgba(100,160,255,0.22)';
    ctx.textAlign   = 'center';
    ctx.fillText('AETHER SURVIVORS', this.gw / 2, 52);
    ctx.restore();

    // ── FPS counter (top-right) ───────────────────────────────────────────────
    ctx.save();
    ctx.font      = '24px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'right';
    ctx.fillText(`FPS: ${fps}`, this.gw - PAD, PAD + 20);
    ctx.restore();

    // ── Elapsed timer (top-centre) ────────────────────────────────────────────
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
    ctx.save();
    ctx.font      = 'bold 40px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(100,160,255,0.8)';
    ctx.shadowBlur  = 12;
    ctx.fillText(`${mins}:${secs}`, this.gw / 2, PAD + 36);
    ctx.restore();

    // ── HP bar (bottom-left) ──────────────────────────────────────────────────
    const barW = 320;
    const barH = 22;
    const bx   = PAD;
    const by   = this.gh - PAD - barH * 2 - 14;

    ctx.save();
    ctx.font      = '22px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'left';
    ctx.fillText('HP', bx, by - 6);
    ctx.restore();

    // Background track
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bx, by, barW, barH);
    // Fill
    ctx.fillStyle = '#e03030';
    ctx.fillRect(bx, by, barW * (player.hp / player.maxHp), barH);
    // Border
    ctx.strokeStyle = '#444';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, by, barW, barH);

    // ── XP bar ────────────────────────────────────────────────────────────────
    const xpBy = by + barH + 8;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bx, xpBy, barW, barH);
    ctx.fillStyle = '#00cc88';
    ctx.fillRect(bx, xpBy, barW * (player.xp / player.xpToNext), barH);
    ctx.strokeStyle = '#444';
    ctx.lineWidth   = 1;
    ctx.strokeRect(bx, xpBy, barW, barH);

    ctx.save();
    ctx.font      = '22px monospace';
    ctx.fillStyle = '#aaffcc';
    ctx.textAlign = 'left';
    ctx.fillText(`Lv. ${player.level}`, bx + barW + 14, xpBy + 16);
    ctx.restore();

    // ── Player world position (bottom-right, debug info) ─────────────────────
    ctx.save();
    ctx.font      = '20px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right';
    ctx.fillText(
      `pos (${Math.round(player.x)}, ${Math.round(player.y)})`,
      this.gw - PAD,
      this.gh - PAD,
    );
    ctx.restore();
  }
}
