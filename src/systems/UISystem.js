// Layout constants for the level-up card screen
const CARD_W    = 420;
const CARD_H    = 400;
const CARD_GAP  = 55;
const CARD_TOTAL_W = CARD_W * 3 + CARD_GAP * 2;

export class UISystem {
  constructor(gameWidth, gameHeight) {
    this.gw = gameWidth;
    this.gh = gameHeight;
  }

  // ── In-game HUD ─────────────────────────────────────────────────────────────
  drawHUD(ctx, player, elapsed, fps, kills, weaponHUD = [], passiveHUD = [], waveInfo = null) {
    const PAD = 30;

    // Title watermark
    ctx.save();
    ctx.font = 'bold 36px monospace'; ctx.fillStyle = 'rgba(100,160,255,0.18)';
    ctx.textAlign = 'center';
    ctx.fillText('AETHER SURVIVORS', this.gw / 2, 52);
    ctx.restore();

    // Timer
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
    ctx.save();
    ctx.font = 'bold 48px monospace'; ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(100,160,255,0.9)'; ctx.shadowBlur = 14;
    ctx.fillText(`${mins}:${secs}`, this.gw / 2, PAD + 44);
    ctx.restore();

    // Wave name — small subtitle under timer
    if (waveInfo) {
      ctx.save();
      ctx.font      = '22px monospace';
      ctx.fillStyle = 'rgba(160,200,255,0.5)';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(`Wave ${waveInfo.waveNumber}  ·  ${waveInfo.waveName}`, this.gw / 2, PAD + 76);
      ctx.restore();
    }

    // Kill counter
    ctx.save();
    ctx.font = 'bold 32px monospace'; ctx.fillStyle = '#ffdd55';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(255,200,0,0.6)'; ctx.shadowBlur = 8;
    ctx.fillText(`☆ ${kills}`, this.gw - PAD, PAD + 36);
    ctx.restore();

    // FPS
    ctx.save();
    ctx.font = '20px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right'; ctx.shadowBlur = 0;
    ctx.fillText(`FPS ${fps}`, this.gw - PAD, PAD + 62);
    ctx.restore();

    // HP bar
    const barW = 360, barH = 28;
    const bx = PAD, by = this.gh - PAD - barH * 2 - 20;

    ctx.save();
    ctx.font = '22px monospace'; ctx.fillStyle = '#aaaaaa'; ctx.textAlign = 'left';
    ctx.fillText('HP', bx, by - 7);
    ctx.restore();

    this._drawBar(ctx, bx, by,             barW, barH, player.hp / player.maxHp,    '#e03030', '#1a1a1a');
    this._drawBar(ctx, bx, by + barH + 10, barW, barH, player.xp / player.xpToNext, '#00cc88', '#1a1a1a');

    // HP numbers
    ctx.save();
    ctx.font = 'bold 17px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.hp} / ${player.maxHp}`, bx + barW / 2, by + barH - 7);
    ctx.restore();

    // Level label
    ctx.save();
    ctx.font = '22px monospace'; ctx.fillStyle = '#aaffcc'; ctx.textAlign = 'left';
    ctx.fillText(`Lv. ${player.level}`, bx + barW + 14, by + barH + 10 + 20);
    ctx.restore();

    // World pos debug
    ctx.save();
    ctx.font = '18px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.textAlign = 'right';
    ctx.fillText(
      `pos (${Math.round(player.x)}, ${Math.round(player.y)})`,
      this.gw - PAD, this.gh - PAD,
    );
    ctx.restore();

    // Combined weapon + passive inventory panel (top-left, below timer area)
    const allItems = [
      ...weaponHUD.map(w => ({ ...w, _section: 'weapon' })),
      ...passiveHUD.map(p => ({ ...p, _section: 'passive' })),
    ];
    if (allItems.length > 0) {
      const wx   = PAD;
      const wy   = PAD + 80;
      const itemH = 44, itemW = 260;
      const hasBoth = weaponHUD.length > 0 && passiveHUD.length > 0;
      const separatorH = hasBoth ? 16 : 0;
      const panelH = allItems.length * itemH + separatorH + 16;

      ctx.save();
      this._roundRect(ctx, wx - 8, wy - 8, itemW + 16, panelH, 8);
      ctx.fillStyle   = 'rgba(5,10,25,0.72)';
      ctx.strokeStyle = 'rgba(60,100,180,0.45)';
      ctx.lineWidth   = 1;
      ctx.fill(); ctx.stroke();

      let rowY = wy;
      let inPassiveSection = false;

      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];

        // Section divider between weapons and passives
        if (hasBoth && item._section === 'passive' && !inPassiveSection) {
          inPassiveSection = true;
          ctx.strokeStyle = 'rgba(80,160,80,0.35)';
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(wx, rowY + 4); ctx.lineTo(wx + itemW, rowY + 4);
          ctx.stroke();
          ctx.font = '15px monospace'; ctx.fillStyle = 'rgba(120,200,120,0.55)';
          ctx.textAlign = 'left';
          ctx.fillText('PASSIVES', wx, rowY + 14);
          rowY += separatorH;
        }

        const pipColour  = item._section === 'weapon' ? '#44aaff' : '#44cc88';
        const nameColour = item._section === 'weapon' ? '#aac8ff' : '#aaffcc';

        // Icon
        ctx.font = '26px serif'; ctx.textAlign = 'left';
        ctx.fillText(item.icon, wx, rowY + 28);

        // Name
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = nameColour;
        ctx.fillText(item.name, wx + 34, rowY + 20);

        // Level pips
        const pipW = 14, pipGap = 4;
        for (let p = 0; p < item.maxLevel; p++) {
          ctx.fillStyle   = p < item.level ? pipColour : '#182840';
          ctx.strokeStyle = '#2a4a66'; ctx.lineWidth = 1;
          ctx.fillRect(wx + 34 + p * (pipW + pipGap), rowY + 26, pipW, 6);
          ctx.strokeRect(wx + 34 + p * (pipW + pipGap), rowY + 26, pipW, 6);
        }

        rowY += itemH;
      }
      ctx.restore();
    }
  }

  // ── Level-Up card screen ─────────────────────────────────────────────────────
  // choices: array of up to 3 objects from UpgradeSystem.pickThree()
  // hoverIndex: which card (0/1/2) the mouse is over, or -1 for none
  // Returns an array of {x,y,w,h} rects so Game.js can do click hit-testing.
  drawLevelUp(ctx, choices, hoverIndex = -1) {
    // Dark pause overlay
    ctx.fillStyle = 'rgba(0,0,10,0.78)';
    ctx.fillRect(0, 0, this.gw, this.gh);

    // "LEVEL UP!" header
    ctx.save();
    ctx.font        = 'bold 80px monospace';
    ctx.fillStyle   = '#ffffff';
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(100,200,255,1)';
    ctx.shadowBlur  = 28;
    ctx.fillText('LEVEL  UP!', this.gw / 2, 200);
    ctx.restore();

    ctx.save();
    ctx.font      = '32px monospace';
    ctx.fillStyle = 'rgba(180,220,255,0.7)';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 0;
    ctx.fillText('Choose an upgrade', this.gw / 2, 258);
    ctx.restore();

    // Cards
    const startX = (this.gw - CARD_TOTAL_W) / 2;
    const startY = (this.gh - CARD_H) / 2 - 20;
    const rects  = [];

    for (let i = 0; i < choices.length; i++) {
      const cx = startX + i * (CARD_W + CARD_GAP);
      const cy = startY;
      this._drawCard(ctx, choices[i], cx, cy, i + 1, hoverIndex === i);
      rects.push({ x: cx, y: cy, w: CARD_W, h: CARD_H });
    }

    // Keyboard hint
    ctx.save();
    ctx.font      = '26px monospace';
    ctx.fillStyle = 'rgba(180,180,180,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('Press  1  /  2  /  3  or click a card', this.gw / 2, startY + CARD_H + 58);
    ctx.restore();

    return rects;
  }

  _drawCard(ctx, choice, x, y, keyNum, hovered) {
    const r = 16;

    // Accent colour per card type
    const accent =
      choice.type === 'new_weapon'
        ? { border: '#ffaa33', glow: 'rgba(255,160,40,0.5)',   bg: hovered ? '#251a0a' : '#18100a', name: hovered ? '#ffcc77' : '#ffdda0' }
      : choice.type === 'weapon_upgrade'
        ? { border: '#bb44ff', glow: 'rgba(160,60,255,0.45)',  bg: hovered ? '#1a0f28' : '#110a1e', name: hovered ? '#cc88ff' : '#ddb0ff' }
      : choice.type === 'new_passive'
        ? { border: '#33dd88', glow: 'rgba(40,210,120,0.45)',  bg: hovered ? '#0a1f14' : '#071410', name: hovered ? '#66ffbb' : '#aaffcc' }
      : choice.type === 'passive_upgrade'
        ? { border: '#22bbaa', glow: 'rgba(30,180,160,0.45)',  bg: hovered ? '#091a18' : '#061210', name: hovered ? '#55ddcc' : '#99eedd' }
      : choice.type === 'heal'
        ? { border: '#ff5566', glow: 'rgba(255,60,80,0.45)',   bg: hovered ? '#200a0c' : '#160608', name: hovered ? '#ff8899' : '#ffbbcc' }
      :   { border: '#4488ff', glow: 'rgba(80,160,255,0.5)',   bg: hovered ? '#1a2540' : '#0f172a', name: hovered ? '#88ccff' : '#cce0ff' };

    // Card background
    ctx.save();
    this._roundRect(ctx, x, y, CARD_W, CARD_H, r);
    ctx.fillStyle   = accent.bg;
    ctx.strokeStyle = hovered ? accent.border : '#2a3a5a';
    ctx.lineWidth   = hovered ? 3 : 2;
    ctx.fill();
    ctx.stroke();

    // Hover glow
    if (hovered) {
      ctx.shadowColor = accent.glow;
      ctx.shadowBlur  = 24;
      this._roundRect(ctx, x, y, CARD_W, CARD_H, r);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    const cx = x + CARD_W / 2;

    // Type badge strip at card top
    ctx.save();
    const badgeBg = hovered ? accent.border
      : choice.type === 'new_weapon'      ? '#aa6600'
      : choice.type === 'weapon_upgrade'  ? '#661199'
      : choice.type === 'new_passive'     ? '#1a6644'
      : choice.type === 'passive_upgrade' ? '#0f4a44'
      : choice.type === 'heal'            ? '#771122'
      : '#1a3a6a';
    ctx.fillStyle = badgeBg;
    ctx.fillRect(x + 1, y + 1, CARD_W - 2, 32);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(
      choice.type === 'new_weapon'      ? 'NEW WEAPON'      :
      choice.type === 'weapon_upgrade'  ? 'WEAPON UPGRADE'  :
      choice.type === 'new_passive'     ? 'NEW PASSIVE'     :
      choice.type === 'passive_upgrade' ? 'PASSIVE UPGRADE' :
      choice.type === 'heal'            ? 'RESTORE'         : 'UPGRADE',
      cx, y + 22,
    );
    ctx.restore();

    // Icon
    ctx.save();
    ctx.font      = '64px serif';
    ctx.textAlign = 'center';
    ctx.fillText(choice.icon, cx, y + 100);
    ctx.restore();

    // Upgrade name
    ctx.save();
    ctx.font        = 'bold 36px monospace';
    ctx.fillStyle   = accent.name;
    ctx.textAlign   = 'center';
    ctx.shadowColor = hovered ? accent.glow : 'transparent';
    ctx.shadowBlur  = hovered ? 8 : 0;
    ctx.fillText(choice.name, cx, y + 158);
    ctx.restore();

    // Divider line
    ctx.strokeStyle = '#2a3a5a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x + 40, y + 175); ctx.lineTo(x + CARD_W - 40, y + 175);
    ctx.stroke();

    // Effect text (wrap long lines)
    ctx.save();
    ctx.font      = '28px monospace';
    ctx.fillStyle = '#88ffcc';
    ctx.textAlign = 'center';
    this._wrapText(ctx, choice.effectText, cx, y + 226, CARD_W - 60, 36);
    ctx.restore();

    // Level indicator
    const taken = choice.currentLevel;
    const pips  = choice.maxLevel;
    const pipW  = 24, pipGap = 8;
    const pipTotalW = pips * pipW + (pips - 1) * pipGap;
    const pipStartX = cx - pipTotalW / 2;
    const pipY      = y + CARD_H - 82;

    for (let i = 0; i < pips; i++) {
      const px = pipStartX + i * (pipW + pipGap);
      ctx.fillStyle = i < taken ? '#44aaff' : '#1a2a44';
      ctx.strokeStyle = '#2a4a66';
      ctx.lineWidth = 1;
      ctx.fillRect(px, pipY, pipW, 8);
      ctx.strokeRect(px, pipY, pipW, 8);
    }

    // "NEW" badge or "Lv X/Y" label
    ctx.save();
    ctx.font      = '22px monospace';
    ctx.textAlign = 'center';
    if (taken === 0) {
      ctx.fillStyle = '#ffdd55';
      ctx.fillText('NEW', cx, pipY + 28);
    } else {
      ctx.fillStyle = 'rgba(180,200,220,0.6)';
      ctx.fillText(`Lv ${taken} / ${pips}`, cx, pipY + 28);
    }
    ctx.restore();

    // Keyboard shortcut badge
    ctx.save();
    this._roundRect(ctx, x + CARD_W / 2 - 30, y + CARD_H - 42, 60, 34, 8);
    ctx.fillStyle   = hovered ? '#2244aa' : '#152035';
    ctx.strokeStyle = hovered ? '#66aaff' : '#334466';
    ctx.lineWidth   = 1;
    ctx.fill(); ctx.stroke();
    ctx.font      = 'bold 24px monospace';
    ctx.fillStyle = hovered ? '#aaddff' : '#6688aa';
    ctx.textAlign = 'center';
    ctx.fillText(keyNum, cx, y + CARD_H - 18);
    ctx.restore();
  }

  // ── Game Over screen ─────────────────────────────────────────────────────────
  drawGameOver(ctx, elapsed, kills, level) {
    const cx = this.gw / 2, cy = this.gh / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, this.gw, this.gh);

    const pw = 680, ph = 440;
    const px = cx - pw / 2, py = cy - ph / 2;

    this._roundRect(ctx, px, py, pw, ph, 18);
    ctx.fillStyle = '#0d0d1a'; ctx.fill();
    ctx.strokeStyle = '#4466aa'; ctx.lineWidth = 3; ctx.stroke();

    ctx.save();
    ctx.font = 'bold 72px monospace'; ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 24;
    ctx.fillText('GAME OVER', cx, py + 100);
    ctx.restore();

    ctx.strokeStyle = '#334466'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 40, py + 120); ctx.lineTo(px + pw - 40, py + 120); ctx.stroke();

    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
    const stats = [
      ['Time Survived', `${mins}:${secs}`],
      ['Enemies Killed', `${kills}`],
      ['Final Level',    `${level}`],
    ];

    ctx.save();
    ctx.font = '34px monospace';
    for (let i = 0; i < stats.length; i++) {
      const row = py + 172 + i * 58;
      ctx.textAlign = 'left';  ctx.fillStyle = '#8899bb'; ctx.fillText(stats[i][0], px + 60, row);
      ctx.textAlign = 'right'; ctx.fillStyle = '#ffffff'; ctx.fillText(stats[i][1], px + pw - 60, row);
    }
    ctx.restore();

    ctx.strokeStyle = '#334466'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 40, py + 352); ctx.lineTo(px + pw - 40, py + 352); ctx.stroke();

    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);
    ctx.save();
    ctx.font = 'bold 30px monospace';
    ctx.fillStyle   = `rgba(100,200,255,${pulse})`;
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(100,200,255,0.5)'; ctx.shadowBlur = 10;
    ctx.fillText('Press  R  to restart', cx, py + ph - 44);
    ctx.restore();
  }

  drawWaveBanner(ctx, waveInfo) {
    if (!waveInfo || waveInfo.bannerAlpha <= 0) return;
    const a  = waveInfo.bannerAlpha;
    const cx = this.gw / 2;
    const cy = this.gh * 0.30;

    ctx.save();

    // Horizontal accent line behind text
    ctx.strokeStyle = `rgba(100,180,255,${a * 0.35})`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 460, cy - 10); ctx.lineTo(cx + 460, cy - 10);
    ctx.stroke();

    // Main banner text
    ctx.font        = 'bold 68px monospace';
    ctx.fillStyle   = `rgba(200,230,255,${a})`;
    ctx.textAlign   = 'center';
    ctx.shadowColor = `rgba(80,160,255,${a * 0.8})`;
    ctx.shadowBlur  = 28;
    ctx.fillText(waveInfo.bannerText, cx, cy + 30);

    // Subtitle
    ctx.font        = '28px monospace';
    ctx.fillStyle   = `rgba(140,190,255,${a * 0.7})`;
    ctx.shadowBlur  = 0;
    ctx.fillText('the enemy grows stronger', cx, cy + 72);

    ctx.restore();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  _drawBar(ctx, x, y, w, h, fill, colour, bg) {
    ctx.fillStyle = bg;   ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colour; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, fill)), h);
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);  ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);  ctx.arcTo(x, y + h,     x, y + h - r,     r);
    ctx.lineTo(x, y + r);      ctx.arcTo(x, y,         x + r, y,         r);
    ctx.closePath();
  }

  // Simple word-wrap: splits text at spaces and respects maxWidth
  _wrapText(ctx, text, cx, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, cx, y);
        line = word;
        y   += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, cx, y);
  }
}
