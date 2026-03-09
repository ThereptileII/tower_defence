import { GRID, RESOURCE_COLORS } from './config.js';

function tileOrigin(col, row) {
  return { x: col * GRID.tileSize, y: row * GRID.tileSize };
}

function drawTerrain(ctx) {
  const width = GRID.cols * GRID.tileSize;
  const height = GRID.rows * GRID.tileSize;
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#3c6e3c');
  bgGradient.addColorStop(1, '#294f2a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < GRID.rows; row += 1) {
    for (let col = 0; col < GRID.cols; col += 1) {
      const { x, y } = tileOrigin(col, row);
      const shade = (col * 17 + row * 23) % 28;
      ctx.fillStyle = `rgba(173, 201, 119, ${0.04 + shade / 600})`;
      ctx.fillRect(x, y, GRID.tileSize, GRID.tileSize);
    }
  }
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(27, 55, 29, 0.35)';
  for (let x = 0; x <= GRID.cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * GRID.tileSize, 0);
    ctx.lineTo(x * GRID.tileSize, GRID.rows * GRID.tileSize);
    ctx.stroke();
  }
  for (let y = 0; y <= GRID.rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * GRID.tileSize);
    ctx.lineTo(GRID.cols * GRID.tileSize, y * GRID.tileSize);
    ctx.stroke();
  }
}

function drawPath(ctx, map) {
  for (const key of map.pathTiles) {
    const [col, row] = key.split(',').map(Number);
    const { x, y } = tileOrigin(col, row);
    ctx.fillStyle = '#9f7a4a';
    ctx.fillRect(x, y, GRID.tileSize, GRID.tileSize);
    ctx.fillStyle = 'rgba(79, 53, 27, 0.22)';
    ctx.fillRect(x + 2, y + 2, GRID.tileSize - 4, GRID.tileSize - 4);
    ctx.strokeStyle = 'rgba(66, 46, 24, 0.45)';
    ctx.strokeRect(x + 0.5, y + 0.5, GRID.tileSize - 1, GRID.tileSize - 1);
  }
}

function drawResources(ctx, map) {
  for (const node of map.resourceNodes) {
    const x = node.col * GRID.tileSize + GRID.tileSize / 2;
    const y = node.row * GRID.tileSize + GRID.tileSize / 2;

    const patch = ctx.createRadialGradient(x - 2, y - 2, 2, x, y, 18);
    patch.addColorStop(0, 'rgba(210, 190, 152, 0.7)');
    patch.addColorStop(1, 'rgba(64, 43, 24, 0.7)');
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fill();

    if (node.type === 'wood') {
      ctx.fillStyle = '#365f2f';
      ctx.beginPath();
      ctx.arc(x - 5, y + 1, 6, 0, Math.PI * 2);
      ctx.arc(x + 2, y - 3, 7, 0, Math.PI * 2);
      ctx.arc(x + 7, y + 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4b3621';
      ctx.fillRect(x - 1.5, y + 4, 3, 7);
    }

    if (node.type === 'ore') {
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 5);
      ctx.lineTo(x - 3, y - 7);
      ctx.lineTo(x + 2, y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 1, y + 7);
      ctx.lineTo(x + 5, y - 6);
      ctx.lineTo(x + 9, y + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();
    }

    if (node.type === 'crystal') {
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + 6, y - 1);
      ctx.lineTo(x + 2, y + 9);
      ctx.lineTo(x - 4, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c4b5fd';
      ctx.beginPath();
      ctx.moveTo(x + 1, y - 7);
      ctx.lineTo(x + 3.2, y - 2);
      ctx.lineTo(x, y + 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = RESOURCE_COLORS[node.type];
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 15, y - 15, 30, 30);
  }
}

function drawTower(ctx, tower) {
  const x = tower.col * GRID.tileSize + 5;
  const y = tower.row * GRID.tileSize + 5;
  const w = GRID.tileSize - 10;
  const h = GRID.tileSize - 10;

  ctx.fillStyle = 'rgba(25, 17, 12, 0.5)';
  ctx.fillRect(x + 3, y + h - 3, w - 2, 5);

  ctx.fillStyle = '#9a9284';
  ctx.fillRect(x, y + 6, w, h - 6);

  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#887f73' : '#a9a093';
    ctx.fillRect(x + 2, y + 8 + i * 8, w - 4, 3);
  }

  ctx.fillStyle = '#5e2418';
  ctx.beginPath();
  ctx.moveTo(x - 1, y + 7);
  ctx.lineTo(x + w / 2, y - 3);
  ctx.lineTo(x + w + 1, y + 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2f2418';
  ctx.fillRect(x + w / 2 - 2, y + 12, 4, 10);
  ctx.fillStyle = tower.def.color;
  ctx.fillRect(x + w / 2 + 2, y + 12, 7, 3);

  ctx.strokeStyle = tower.def.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + 6, w, h - 6);
  ctx.lineWidth = 1;
}

function drawStation(ctx, station, selectedStationId) {
  const x = station.col * GRID.tileSize + 6;
  const y = station.row * GRID.tileSize + 7;
  const w = GRID.tileSize - 12;
  const h = GRID.tileSize - 14;

  ctx.fillStyle = 'rgba(20, 15, 10, 0.45)';
  ctx.fillRect(x + 3, y + h - 1, w - 2, 4);

  ctx.fillStyle = '#6f4b2c';
  ctx.fillRect(x, y + 8, w, h - 8);
  ctx.fillStyle = '#4a2f1a';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(x + 2 + i * 8, y + 10, 4, h - 12);
  }

  ctx.fillStyle = '#9b2c1d';
  ctx.beginPath();
  ctx.moveTo(x - 1, y + 10);
  ctx.lineTo(x + w / 2, y - 2);
  ctx.lineTo(x + w + 1, y + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#24170e';
  ctx.fillRect(x + w / 2 - 4, y + 16, 8, 10);
  ctx.fillStyle = '#e2c98b';
  ctx.fillRect(x + w / 2 - 1.5, y + 20, 3, 2);

  ctx.strokeStyle = station.def.color;
  ctx.lineWidth = selectedStationId === station.id ? 3 : 1;
  ctx.strokeRect(x, y + 8, w, h - 8);
  ctx.lineWidth = 1;
}

export function render(ctx, state) {
  const { map, towers, stations, workers, enemies, projectiles, selectedBuild, hoverTile, selectedStationId } = state;
  ctx.clearRect(0, 0, GRID.cols * GRID.tileSize, GRID.rows * GRID.tileSize);
  drawTerrain(ctx);

  drawPath(ctx, map);
  drawGrid(ctx);
  drawResources(ctx, map);

  for (const tower of towers) {
    drawTower(ctx, tower);
  }

  for (const station of stations) {
    drawStation(ctx, station, selectedStationId);
  }

  for (const worker of workers) {
    ctx.fillStyle = worker.carryType ? RESOURCE_COLORS[worker.carryType] : '#e2e8f0';
    ctx.beginPath();
    ctx.arc(worker.x, worker.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3b2f20';
    ctx.stroke();
  }

  for (const enemy of enemies) {
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 7, 0, Math.PI * 2);
    ctx.fill();

    const barWidth = 22;
    const ratio = Math.max(0, enemy.health / enemy.maxHealth);
    ctx.fillStyle = '#111827';
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 18, barWidth, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 18, barWidth * ratio, 4);
  }

  for (const shot of projectiles) {
    ctx.strokeStyle = shot.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shot.fromX, shot.fromY);
    ctx.lineTo(shot.toX, shot.toY);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  if (selectedBuild && hoverTile) {
    const x = hoverTile.col * GRID.tileSize;
    const y = hoverTile.row * GRID.tileSize;
    ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
    ctx.fillRect(x, y, GRID.tileSize, GRID.tileSize);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.9)';
    ctx.strokeRect(x + 1, y + 1, GRID.tileSize - 2, GRID.tileSize - 2);
  }
}
