import { GRID, RESOURCE_COLORS } from './config.js';

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
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
  ctx.fillStyle = '#374151';
  for (const key of map.pathTiles) {
    const [col, row] = key.split(',').map(Number);
    ctx.fillRect(col * GRID.tileSize, row * GRID.tileSize, GRID.tileSize, GRID.tileSize);
  }
}

function drawResources(ctx, map) {
  for (const node of map.resourceNodes) {
    const x = node.col * GRID.tileSize + GRID.tileSize / 2;
    const y = node.row * GRID.tileSize + GRID.tileSize / 2;
    ctx.fillStyle = RESOURCE_COLORS[node.type];
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function render(ctx, state) {
  const { map, towers, stations, workers, enemies, projectiles, selectedBuild, hoverTile, selectedStationId } = state;
  ctx.clearRect(0, 0, GRID.cols * GRID.tileSize, GRID.rows * GRID.tileSize);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, GRID.cols * GRID.tileSize, GRID.rows * GRID.tileSize);

  drawPath(ctx, map);
  drawGrid(ctx);
  drawResources(ctx, map);

  for (const tower of towers) {
    const x = tower.col * GRID.tileSize + 4;
    const y = tower.row * GRID.tileSize + 4;
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(x, y, GRID.tileSize - 8, GRID.tileSize - 8);
    ctx.strokeStyle = tower.def.color;
    ctx.strokeRect(x, y, GRID.tileSize - 8, GRID.tileSize - 8);
  }

  for (const station of stations) {
    const x = station.col * GRID.tileSize + 10;
    const y = station.row * GRID.tileSize + 10;
    ctx.fillStyle = '#14532d';
    ctx.fillRect(x, y, GRID.tileSize - 20, GRID.tileSize - 20);
    ctx.strokeStyle = station.def.color;
    ctx.lineWidth = selectedStationId === station.id ? 3 : 1;
    ctx.strokeRect(x, y, GRID.tileSize - 20, GRID.tileSize - 20);
    ctx.lineWidth = 1;
  }

  for (const worker of workers) {
    ctx.fillStyle = worker.carryType ? RESOURCE_COLORS[worker.carryType] : '#e2e8f0';
    ctx.beginPath();
    ctx.arc(worker.x, worker.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const enemy of enemies) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
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
    ctx.beginPath();
    ctx.moveTo(shot.fromX, shot.fromY);
    ctx.lineTo(shot.toX, shot.toY);
    ctx.stroke();
  }

  if (selectedBuild && hoverTile) {
    const x = hoverTile.col * GRID.tileSize;
    const y = hoverTile.row * GRID.tileSize;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.fillRect(x, y, GRID.tileSize, GRID.tileSize);
  }
}
