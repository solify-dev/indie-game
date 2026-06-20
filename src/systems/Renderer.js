import { GameConfig } from '../config/GameConfig.js';

const CFG = GameConfig.renderer;

// Draws the infinite-feeling scrolling grid background.
// The grid offsets by camera position each frame so it appears to scroll
// with the world even though the canvas is a fixed 1920×1080 buffer.
export function drawBackground(ctx, camera, gameWidth, gameHeight) {
  // Solid dark fill
  ctx.fillStyle = CFG.background;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  // Grid lines — modulo-offset keeps them snapping to world coordinates
  const tile    = CFG.gridSize;
  const offsetX = ((-camera.x) % tile + tile) % tile;
  const offsetY = ((-camera.y) % tile + tile) % tile;

  ctx.strokeStyle = CFG.gridColour;
  ctx.lineWidth   = 1;

  for (let x = offsetX - tile; x < gameWidth + tile; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gameHeight);
    ctx.stroke();
  }
  for (let y = offsetY - tile; y < gameHeight + tile; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gameWidth, y);
    ctx.stroke();
  }

  // Subtle vignette to draw the eye toward the centre
  const vignette = ctx.createRadialGradient(
    gameWidth / 2, gameHeight / 2, gameHeight * 0.2,
    gameWidth / 2, gameHeight / 2, gameHeight * 0.85,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
}
