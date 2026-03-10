import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BUILD_TYPES, ENEMY_WAVE, GRID, RESOURCE_TYPES, WORKER_CONFIG } from './game/config.js';
import { createMap, findPath } from './game/map.js';
import { Tower, Worker, WorkerStation, generateWave } from './game/entities.js';
import { render } from './game/renderer.js';
import salvageIcon from './assets/icons/resource-salvage.svg';
import woodIcon from './assets/icons/resource-wood.svg';
import oreIcon from './assets/icons/resource-ore.svg';
import crystalIcon from './assets/icons/resource-crystal.svg';
import arrowTowerIcon from './assets/icons/tower-arrow.svg';
import cannonTowerIcon from './assets/icons/tower-cannon.svg';
import arcaneTowerIcon from './assets/icons/tower-arcane.svg';
import stationIcon from './assets/icons/structure-station.svg';

const initialState = () => ({
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
  selectedTowerTile: null,
  projectiles: [],
  fastMode: false,
  stationCounter: 0,
  selectedStationId: null,
});

const workerPathApi = {
  findWorkerPath(start, goal, pathTiles) {
    return findPath(start, goal, pathTiles);
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

function formatCost(cost) {
  return Object.entries(cost)
    .map(([type, amount]) => `${type}:${amount}`)
    .join(' ');
}

const buildIcons = {
  arrow: arrowTowerIcon,
  cannon: cannonTowerIcon,
  arcane: arcaneTowerIcon,
  station: stationIcon,
};

const resourceIcons = {
  salvage: salvageIcon,
  wood: woodIcon,
  ore: oreIcon,
  crystal: crystalIcon,
};

export default function App() {
  const canvasRef = useRef(null);
  const stateRef = useRef(initialState());
  const frameRef = useRef(0);
  const lastTsRef = useRef(performance.now());

  const [uiTick, setUiTick] = useState(0);
  const uiState = useMemo(() => {
    const state = stateRef.current;
    return {
      resources: state.resources,
      lives: state.lives,
      wave: state.wave,
      enemiesAlive: state.enemies.length,
      stations: state.stations,
      workers: state.workers.length,
      selectedStationId: state.selectedStationId,
      selectedBuild: state.selectedBuild,
      selectedTowerTile: state.selectedTowerTile,
      fastMode: state.fastMode,
      runtimeWarning: window.location.protocol === 'file:' ? 'You are running the source index.html directly. Use `npm run dev` for development or open `dist/index.html` after `npm run build` for the full single-file game.' : null,
    };
  }, [uiTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function tick(ts) {
      const state = stateRef.current;
      const multiplier = state.fastMode ? 2 : 1;
      const delta = ((ts - lastTsRef.current) / 1000) * multiplier;
      lastTsRef.current = ts;

      state.projectiles = [];

      if (state.spawnQueue.length > 0) {
        state.spawnTimer += delta;
        while (state.spawnQueue.length > 0 && state.spawnTimer >= state.spawnQueue[0].spawnDelay) {
          const spawn = state.spawnQueue.shift();
          state.enemies.push(spawn.enemy);
        }
      }

      for (const enemy of state.enemies) enemy.update(delta);
      for (const tower of state.towers) {
        const shot = tower.update(delta, state.enemies);
        if (shot) state.projectiles.push(shot);
      }

      for (const worker of state.workers) {
        const payload = worker.update(
          delta,
          {
            findWorkerPath: (start, goal) => workerPathApi.findWorkerPath(start, goal, state.map.pathTiles),
            findNearestStation: workerPathApi.findNearestStation,
          },
          state.stations,
        );
        if (payload) state.resources[payload.type] += payload.amount;
      }

      const reachedEndCount = state.enemies.filter((enemy) => enemy.reachedEnd).length;
      if (reachedEndCount > 0) state.lives -= reachedEndCount;

      const before = state.enemies.length;
      state.enemies = state.enemies.filter((enemy) => enemy.health > 0 && !enemy.reachedEnd);
      const killed = before - state.enemies.length - reachedEndCount;
      if (killed > 0) state.resources.salvage += killed * ENEMY_WAVE.salvageBounty;

      if (state.lives <= 0) state.lives = 0;
      render(ctx, state);

      if (state.lives > 0) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 50px sans-serif';
        ctx.fillText('Defeat', canvas.width / 2 - 90, canvas.height / 2);
      }

      setUiTick((v) => v + 1);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  function hasCost(cost) {
    return Object.entries(cost).every(([type, amount]) => stateRef.current.resources[type] >= amount);
  }

  function spendCost(cost) {
    for (const [type, amount] of Object.entries(cost)) {
      stateRef.current.resources[type] -= amount;
    }
  }

  function getTileFromMouse(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / GRID.tileSize);
    const row = Math.floor(y / GRID.tileSize);
    if (col < 0 || col >= GRID.cols || row < 0 || row >= GRID.rows) return null;
    return { col, row };
  }

  function findNearestResourceNode(fromTile) {
    const state = stateRef.current;
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



  function findTowerAt(tile) {
    const state = stateRef.current;
    return state.towers.find((tower) => tower.col === tile.col && tower.row === tile.row) || null;
  }

  function onUpgradeTower() {
    const state = stateRef.current;
    if (!state.selectedTowerTile) return;
    const tower = findTowerAt(state.selectedTowerTile);
    if (!tower) return;
    const upgradeCost = tower.getUpgradeCost();
    if (!hasCost(upgradeCost)) return;
    spendCost(upgradeCost);
    tower.upgrade();
    setUiTick((v) => v + 1);
  }

  function onCanvasClick(event) {
    const state = stateRef.current;
    const tile = getTileFromMouse(event);
    if (!tile) return;

    if (!state.selectedBuild) {
      const station = state.stations.find((s) => s.col === tile.col && s.row === tile.row);
      const tower = findTowerAt(tile);
      state.selectedStationId = station ? station.id : null;
      state.selectedTowerTile = tower ? { col: tower.col, row: tower.row } : null;
      setUiTick((v) => v + 1);
      return;
    }

    const buildDef = BUILD_TYPES[state.selectedBuild];
    if (!buildDef || !hasCost(buildDef.cost)) return;
    const key = `${tile.col},${tile.row}`;
    if (state.map.pathTiles.has(key)) return;

    if (state.occupiedTowers.has(key) || state.occupiedStations.has(key)) return;

    spendCost(buildDef.cost);

    if (buildDef.category === 'tower') {
      state.occupiedTowers.add(key);
      state.towers.push(new Tower(tile.col, tile.row, buildDef, state.selectedBuild));
      state.selectedTowerTile = { col: tile.col, row: tile.row };
    } else {
      state.occupiedStations.add(key);
      const station = new WorkerStation(++state.stationCounter, tile.col, tile.row, buildDef);
      state.stations.push(station);
      state.selectedStationId = station.id;
      state.selectedTowerTile = null;
    }

    setUiTick((v) => v + 1);
  }

  function onBuildWorker() {
    const state = stateRef.current;
    const station = state.stations.find((s) => s.id === state.selectedStationId);
    if (!station || !hasCost(WORKER_CONFIG.cost)) return;

    const targetNode = findNearestResourceNode({ col: station.col, row: station.row });
    if (!targetNode) return;

    const pathToNode = findPath({ col: station.col, row: station.row }, targetNode, state.map.pathTiles);
    if (pathToNode.length === 0) return;

    spendCost(WORKER_CONFIG.cost);
    state.workers.push(new Worker(station, targetNode, pathToNode));
    setUiTick((v) => v + 1);
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Frontier Bastion</h1>
        <p className="subtitle">Classic tower defence with workers and multi-resource economy.</p>
        {uiState.runtimeWarning ? <p className="runtime-warning">{uiState.runtimeWarning}</p> : null}

        <section>
          <h2>Build</h2>
          <div className="button-row">
            {Object.entries(BUILD_TYPES).map(([key, def]) => (
              <button
                key={key}
                type="button"
                data-active={uiState.selectedBuild === key}
                className={uiState.selectedBuild === key ? 'active' : ''}
                onClick={() => {
                  stateRef.current.selectedBuild = key;
                  setUiTick((v) => v + 1);
                }}
              >
                <span className="build-button">
                  <img src={buildIcons[key]} alt="" className="build-icon" />
                  <span>{def.name} ({formatCost(def.cost)})</span>
                </span>
              </button>
            ))}
          </div>
          <button
            id="build-none"
            className="secondary"
            type="button"
            onClick={() => {
              stateRef.current.selectedBuild = null;
              setUiTick((v) => v + 1);
            }}
          >
            Cancel Build
          </button>
        </section>

        <section>
          <h2>Workers</h2>
          <p>
            Selected station:{' '}
            {uiState.selectedStationId
              ? `#${uiState.stations.find((s) => s.id === uiState.selectedStationId)?.id}`
              : 'none'}
          </p>
          <button type="button" onClick={onBuildWorker}>
            Build Worker ({formatCost(WORKER_CONFIG.cost)})
          </button>
          <p className="hint">Tip: click a station tile to select it, then build workers.</p>
        </section>


        <section>
          <h2>Towers</h2>
          <p>
            Selected tower:{' '}
            {uiState.selectedTowerTile
              ? `(${uiState.selectedTowerTile.col}, ${uiState.selectedTowerTile.row})`
              : 'none'}
          </p>
          <button type="button" onClick={onUpgradeTower}>
            Upgrade Selected Tower
          </button>
          <p className="hint">Select a tower tile while build mode is canceled, then upgrade it.</p>
        </section>

        <section>
          <h2>Quick Start</h2>
          <button
            type="button"
            onClick={() => {
              const state = stateRef.current;
              const grants = { salvage: 220, wood: 90, ore: 90, crystal: 70 };
              for (const [type, amount] of Object.entries(grants)) state.resources[type] += amount;
              setUiTick((v) => v + 1);
            }}
          >
            Claim Starter Cache
          </button>
          <p className="hint">Gets your first stations and mixed towers online faster.</p>
        </section>

        <section>
          <h2>Wave Control</h2>
          <button
            type="button"
            onClick={() => {
              const state = stateRef.current;
              if (state.spawnQueue.length > 0 || state.enemies.length > 0) return;
              state.wave += 1;
              state.spawnQueue = generateWave(state.wave, state.map.pathPoints);
              state.spawnTimer = 0;
              setUiTick((v) => v + 1);
            }}
          >
            Start Next Wave
          </button>
          <label className="speed-toggle">
            <input
              type="checkbox"
              checked={uiState.fastMode}
              onChange={(event) => {
                stateRef.current.fastMode = event.target.checked;
                setUiTick((v) => v + 1);
              }}
            />{' '}
            Fast mode x2
          </label>
        </section>

        <section>
          <h2>Status</h2>
          <ul className="hud">
            <li className="resource-row">Resources:
              {RESOURCE_TYPES.map((type) => (
                <span key={type} className="resource-pill">
                  <img src={resourceIcons[type]} alt="" className="resource-icon" />
                  {type}: {uiState.resources[type]}
                </span>
              ))}
            </li>
            <li>Lives: {uiState.lives}</li>
            <li>Wave: {uiState.wave}</li>
            <li>Enemies Alive: {uiState.enemiesAlive}</li>
            <li>Stations: {uiState.stations.length}</li>
            <li>Workers: {uiState.workers}</li>
          </ul>
        </section>
      </aside>

      <main>
        <p className="hint">Build towers + stations, click a station, train workers, then launch waves.</p>
        <canvas
          ref={canvasRef}
          width="960"
          height="640"
          aria-label="Tower defence field"
          onMouseMove={(event) => {
            stateRef.current.hoverTile = getTileFromMouse(event);
          }}
          onClick={onCanvasClick}
        />
      </main>
    </div>
  );
}
