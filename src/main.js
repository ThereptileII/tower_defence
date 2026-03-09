const { BUILD_TYPES, ENEMY_WAVE, GRID, RESOURCE_TYPES, WORKER_CONFIG } = window.GameConfig;
const { Tower, Worker, WorkerStation, generateWave } = window.GameEntities;
const { createMap, findPath } = window.GameMap;
const { render } = window.GameRenderer;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const stationLabel = document.getElementById('selected-station');
const buildWorkerBtn = document.getElementById('build-worker');

const state = {
  map: createMap(),
  resources: { salvage: 200, wood: 0, ore: 0, crystal: 0 },
  lives: 15,
  wave: 0,
  enemies: [],
  towers: [],
  stations: [],
  workers: [],
  spawnQueue: [],
  spawnTimer: 0,
  selectedBuild: null,
  occupiedTowers: new Set(),
  occupiedStations: new Set(),
  hoverTile: null,
  projectiles: [],
  fastMode: false,
  stationCounter: 0,
  selectedStationId: null,
};

function formatCost(cost) {
  return Object.entries(cost)
    .map(([type, amount]) => `${type}:${amount}`)
    .join(' ');
}

function updateHud() {
  const resText = RESOURCE_TYPES.map((type) => `${type}: ${state.resources[type]}`).join(' | ');
  hud.innerHTML = [
    `Resources: ${resText}`,
    `Lives: ${state.lives}`,
    `Wave: ${state.wave}`,
    `Enemies Alive: ${state.enemies.length}`,
    `Stations: ${state.stations.length}`,
    `Workers: ${state.workers.length}`,
  ]
    .map((line) => `<li>${line}</li>`)
    .join('');

  const station = state.stations.find((s) => s.id === state.selectedStationId);
  stationLabel.textContent = station ? `Selected station: #${station.id} (${station.col},${station.row})` : 'Selected station: none';
}

function setBuild(type) {
  state.selectedBuild = type;
  document.querySelectorAll('[data-build]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.build === type);
  });
}

for (const button of document.querySelectorAll('[data-build]')) {
  const def = BUILD_TYPES[button.dataset.build];
  button.textContent = `${def.name} (${formatCost(def.cost)})`;
  button.addEventListener('click', () => setBuild(button.dataset.build));
}

document.getElementById('build-none').addEventListener('click', () => setBuild(null));

document.getElementById('fast-mode').addEventListener('change', (event) => {
  state.fastMode = event.target.checked;
});

document.getElementById('send-wave').addEventListener('click', () => {
  if (state.spawnQueue.length > 0 || state.enemies.length > 0) return;
  state.wave += 1;
  state.spawnQueue = generateWave(state.wave, state.map.pathPoints);
  state.spawnTimer = 0;
  updateHud();
});

function hasCost(cost) {
  return Object.entries(cost).every(([type, amount]) => state.resources[type] >= amount);
}

function spendCost(cost) {
  for (const [type, amount] of Object.entries(cost)) {
    state.resources[type] -= amount;
  }
}

function getTileFromMouse(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.floor(x / GRID.tileSize);
  const row = Math.floor(y / GRID.tileSize);
  if (col < 0 || col >= GRID.cols || row < 0 || row >= GRID.rows) return null;
  return { col, row };
}

canvas.addEventListener('mousemove', (event) => {
  state.hoverTile = getTileFromMouse(event);
});

function canBuild(col, row, buildDef) {
  const key = `${col},${row}`;
  if (state.map.pathTiles.has(key)) return false;

  if (buildDef.category === 'tower') {
    return !state.occupiedTowers.has(key);
  }

  return !state.occupiedStations.has(key);
}

function selectStationAt(tile) {
  const station = state.stations.find((s) => s.col === tile.col && s.row === tile.row);
  state.selectedStationId = station ? station.id : null;
  updateHud();
}

canvas.addEventListener('click', (event) => {
  const tile = getTileFromMouse(event);
  if (!tile) return;

  if (!state.selectedBuild) {
    selectStationAt(tile);
    return;
  }

  const buildDef = BUILD_TYPES[state.selectedBuild];
  if (!buildDef) return;
  if (!hasCost(buildDef.cost)) return;
  if (!canBuild(tile.col, tile.row, buildDef)) return;

  spendCost(buildDef.cost);
  const key = `${tile.col},${tile.row}`;

  if (buildDef.category === 'tower') {
    state.occupiedTowers.add(key);
    state.towers.push(new Tower(tile.col, tile.row, buildDef));
  } else {
    state.occupiedStations.add(key);
    const station = new WorkerStation(++state.stationCounter, tile.col, tile.row, buildDef);
    state.stations.push(station);
    state.selectedStationId = station.id;
  }

  updateHud();
});

function findNearestResourceNode(fromTile) {
  let best = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const node of state.map.resourceNodes) {
    const dist = Math.abs(node.col - fromTile.col) + Math.abs(node.row - fromTile.row);
    if (dist < bestDist) {
      best = node;
      bestDist = dist;
    }
  }
  return best;
}

const workerPathApi = {
  findWorkerPath(start, goal) {
    return findPath(start, goal, state.map.pathTiles);
  },
  findNearestStation(fromTile, stations) {
    if (stations.length === 0) return null;
    let nearest = stations[0];
    let bestDist = Number.POSITIVE_INFINITY;
    for (const station of stations) {
      const dist = Math.abs(fromTile.col - station.col) + Math.abs(fromTile.row - station.row);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = station;
      }
    }
    return nearest;
  },
};

buildWorkerBtn.textContent = `Build Worker (${formatCost(WORKER_CONFIG.cost)})`;
buildWorkerBtn.addEventListener('click', () => {
  const station = state.stations.find((s) => s.id === state.selectedStationId);
  if (!station) return;
  if (!hasCost(WORKER_CONFIG.cost)) return;

  const targetNode = findNearestResourceNode({ col: station.col, row: station.row });
  if (!targetNode) return;

  const pathToNode = workerPathApi.findWorkerPath({ col: station.col, row: station.row }, targetNode);
  if (pathToNode.length === 0) return;

  spendCost(WORKER_CONFIG.cost);
  state.workers.push(new Worker(station, targetNode, pathToNode));
  updateHud();
});

let lastTs = performance.now();
function gameLoop(ts) {
  const multiplier = state.fastMode ? 2 : 1;
  const delta = ((ts - lastTs) / 1000) * multiplier;
  lastTs = ts;

  state.projectiles = [];

  if (state.spawnQueue.length > 0) {
    state.spawnTimer += delta;
    while (state.spawnQueue.length > 0 && state.spawnTimer >= state.spawnQueue[0].spawnDelay) {
      const spawn = state.spawnQueue.shift();
      state.enemies.push(spawn.enemy);
    }
  }

  for (const enemy of state.enemies) {
    enemy.update(delta);
  }

  for (const tower of state.towers) {
    const shot = tower.update(delta, state.enemies);
    if (shot) state.projectiles.push(shot);
  }

  for (const worker of state.workers) {
    const payload = worker.update(delta, workerPathApi, state.stations);
    if (payload) {
      state.resources[payload.type] += payload.amount;
    }
  }

  const reachedEndCount = state.enemies.filter((enemy) => enemy.reachedEnd).length;
  if (reachedEndCount > 0) {
    state.lives -= reachedEndCount;
  }

  const before = state.enemies.length;
  state.enemies = state.enemies.filter((enemy) => enemy.health > 0 && !enemy.reachedEnd);
  const killed = before - state.enemies.length - reachedEndCount;
  if (killed > 0) state.resources.salvage += killed * ENEMY_WAVE.salvageBounty;

  if (state.lives <= 0) state.lives = 0;

  updateHud();
  render(ctx, state);

  if (state.lives > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('Defeat', canvas.width / 2 - 90, canvas.height / 2);
  }
}

updateHud();
requestAnimationFrame(gameLoop);
