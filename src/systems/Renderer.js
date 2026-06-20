const TILE = 120; // grid cell size in world pixels

// Draws an infinite-feeling scrolling grid background.
export function drawBackground(ctx, camera, gameWidth, gameHeight) {
  // Dark base fill
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  // Grid lines — offset by camera position so they scroll with the world
  const offsetX = ((-camera.x) % TILE + TILE) % TILE;
  const offsetY = ((-camera.y) % TILE + TILE) % TILE;

  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth   = 1;

  for (let x = offsetX - TILE; x < gameWidth + TILE; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gameHeight);
    ctx.stroke();
  }
  for (let y = offsetY - TILE; y < gameHeight + TILE; y += TILE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gameWidth, y);
    ctx.stroke();
  }

  // Subtle dark vignette around the edges
  const vignette = ctx.createRadialGradient(
    gameWidth / 2, gameHeight / 2, gameHeight * 0.2,
    gameWidth / 2, gameHeight / 2, gameHeight * 0.85,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
}
