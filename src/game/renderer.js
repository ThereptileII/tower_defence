import { BUILD_TYPES, GRID, RESOURCE_COLORS } from './config.js';
import salvageIcon from '../assets/icons/resource-salvage.svg';
import woodIcon from '../assets/icons/resource-wood.svg';
import oreIcon from '../assets/icons/resource-ore.svg';
import crystalIcon from '../assets/icons/resource-crystal.svg';
import arrowTowerIcon from '../assets/icons/tower-arrow.svg';
import cannonTowerIcon from '../assets/icons/tower-cannon.svg';
import arcaneTowerIcon from '../assets/icons/tower-arcane.svg';


const resourceIconUrls = {
  salvage: salvageIcon,
  wood: woodIcon,
  ore: oreIcon,
  crystal: crystalIcon,
};

const towerIconUrls = {
  arrow: arrowTowerIcon,
  cannon: cannonTowerIcon,
  arcane: arcaneTowerIcon,
};

const imageCache = new Map();

function getImage(url) {
  if (!imageCache.has(url)) {
    const image = new Image();
    image.src = url;
    imageCache.set(url, image);
  }
  return imageCache.get(url);
}

function drawIcon(ctx, url, x, y, size) {
  if (!url) return;
  const image = getImage(url);
  if (image.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
  }
}

function drawTerrain(ctx) {
  const width = GRID.cols * GRID.tileSize;
  const height = GRID.rows * GRID.tileSize;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#37562f');
  gradient.addColorStop(1, '#223820');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawPath(ctx, map) {
  ctx.strokeStyle = '#927045';
  ctx.lineWidth = GRID.tileSize - 8;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  map.pathPoints.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  ctx.strokeStyle = '#b99462';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.lineWidth = 1;

}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
  for (let col = 0; col <= GRID.cols; col += 1) {
    const x = col * GRID.tileSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GRID.rows * GRID.tileSize);
    ctx.stroke();
  }
  for (let row = 0; row <= GRID.rows; row += 1) {
    const y = row * GRID.tileSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GRID.cols * GRID.tileSize, y);
    ctx.stroke();
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
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.stroke();
    drawIcon(ctx, resourceIconUrls[node.type], x, y, 24);
  }
}

function drawTower(ctx, tower, selectedTowerTile) {
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
  drawIcon(ctx, towerIconUrls[tower.kind], x + w / 2, y + 20, 16);

  ctx.strokeStyle = tower.def.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y + 6, w, h - 6);
  ctx.lineWidth = 1;

  if (tower.level > 1) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(x + 2, y + 6, 18, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px sans-serif';
    ctx.fillText(`L${tower.level}`, x + 4, y + 15);
  }

  if (selectedTowerTile && selectedTowerTile.col === tower.col && selectedTowerTile.row === tower.row) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 2, y + 4, w + 4, h - 2);
    ctx.lineWidth = 1;
  }
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
  const { map, towers, stations, workers, enemies, projectiles, selectedBuild, hoverTile, selectedStationId, selectedTowerTile, occupiedTowers, occupiedStations } = state;
  ctx.clearRect(0, 0, GRID.cols * GRID.tileSize, GRID.rows * GRID.tileSize);
  drawTerrain(ctx);

  drawPath(ctx, map);
  drawGrid(ctx);
  drawResources(ctx, map);

  for (const tower of towers) {
    drawTower(ctx, tower, selectedTowerTile);
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
    const buildDef = BUILD_TYPES[selectedBuild];
    const key = `${hoverTile.col},${hoverTile.row}`;
    const blocked = map.pathTiles.has(key) || occupiedTowers.has(key) || occupiedStations.has(key);

    if (buildDef?.category === 'tower') {
      const cx = x + GRID.tileSize / 2;
      const cy = y + GRID.tileSize / 2;
      ctx.fillStyle = blocked ? 'rgba(239, 68, 68, 0.13)' : 'rgba(125, 211, 252, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy, buildDef.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = blocked ? 'rgba(239, 68, 68, 0.6)' : 'rgba(125, 211, 252, 0.65)';
      ctx.stroke();
    }

    ctx.fillStyle = blocked ? 'rgba(239, 68, 68, 0.25)' : 'rgba(250, 204, 21, 0.22)';
    ctx.fillRect(x, y, GRID.tileSize, GRID.tileSize);
    ctx.strokeStyle = blocked ? 'rgba(239, 68, 68, 0.92)' : 'rgba(234, 179, 8, 0.9)';
    ctx.strokeRect(x + 1, y + 1, GRID.tileSize - 2, GRID.tileSize - 2);
  }
}
