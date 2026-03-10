import { ENEMY_WAVE, GRID, WORKER_CONFIG } from './config.js';
import { tileToWorld } from './map.js';

class Enemy {
  constructor(pathPoints, health, speed) {
    this.pathPoints = pathPoints;
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.pathIndex = 0;
    this.x = pathPoints[0].x;
    this.y = pathPoints[0].y;
    this.reachedEnd = false;
  }

  update(delta) {
    const target = this.pathPoints[this.pathIndex + 1];
    if (!target) {
      this.reachedEnd = true;
      return;
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) {
      this.pathIndex += 1;
      return;
    }

    const move = this.speed * delta;
    this.x += (dx / dist) * Math.min(move, dist);
    this.y += (dy / dist) * Math.min(move, dist);
  }
}

export class Tower {
  constructor(col, row, def) {
    this.col = col;
    this.row = row;
    this.x = col * GRID.tileSize + GRID.tileSize / 2;
    this.y = row * GRID.tileSize + GRID.tileSize / 2;
    this.def = def;
    this.cooldown = 0;
  }

  update(delta, enemies) {
    this.cooldown -= delta;
    if (this.cooldown > 0) return null;

    let target = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const enemy of enemies) {
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= this.def.range && dist < bestDist) {
        bestDist = dist;
        target = enemy;
      }
    }

    if (!target) return null;

    target.health -= this.def.damage;
    this.cooldown = 1 / this.def.fireRate;
    return { fromX: this.x, fromY: this.y, toX: target.x, toY: target.y, color: this.def.color };
  }
}

export class WorkerStation {
  constructor(id, col, row, def) {
    this.id = id;
    this.col = col;
    this.row = row;
    this.def = def;
  }
}

export class Worker {
  constructor(station, targetNode, pathToNode) {
    this.homeStationId = station.id;
    this.col = station.col;
    this.row = station.row;
    const world = tileToWorld(this.col, this.row);
    this.x = world.x;
    this.y = world.y;
    this.targetNode = targetNode;
    this.state = 'to_resource';
    this.path = pathToNode.slice(1);
    this.gatherTimer = 0;
    this.carryType = null;
    this.carryAmount = 0;
  }

  update(delta, paths, stations) {
    if (this.state === 'gathering') {
      this.gatherTimer += delta;
      if (this.gatherTimer >= WORKER_CONFIG.gatherDuration) {
        this.carryType = this.targetNode.type;
        this.carryAmount = WORKER_CONFIG.carryAmount;
        this.state = 'to_station';
        const nearest = paths.findNearestStation({ col: this.col, row: this.row }, stations);
        if (!nearest) {
          this.state = 'idle';
          return null;
        }
        this.homeStationId = nearest.id;
        this.path = paths.findWorkerPath({ col: this.col, row: this.row }, { col: nearest.col, row: nearest.row }).slice(1);
      }
      return null;
    }

    if (this.path.length > 0) {
      const next = this.path[0];
      const target = tileToWorld(next.col, next.row);
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 2) {
        this.x = target.x;
        this.y = target.y;
        this.col = next.col;
        this.row = next.row;
        this.path.shift();
      } else {
        const move = WORKER_CONFIG.speed * delta;
        this.x += (dx / dist) * Math.min(move, dist);
        this.y += (dy / dist) * Math.min(move, dist);
      }
      return null;
    }

    if (this.state === 'to_resource') {
      this.state = 'gathering';
      this.gatherTimer = 0;
      return null;
    }

    if (this.state === 'to_station') {
      const payload = { type: this.carryType, amount: this.carryAmount };
      this.carryType = null;
      this.carryAmount = 0;
      this.state = 'to_resource';
      this.path = paths.findWorkerPath({ col: this.col, row: this.row }, { col: this.targetNode.col, row: this.targetNode.row }).slice(1);
      return payload;
    }

    return null;
  }
}

export function generateWave(waveNumber, pathPoints) {
  const enemyCount = ENEMY_WAVE.baseCount + waveNumber * 2;
  const hp = 50 * (1 + waveNumber * ENEMY_WAVE.healthScale);
  const speed = ENEMY_WAVE.speedBase + waveNumber * 3;
  return Array.from({ length: enemyCount }, (_, index) => ({
    spawnDelay: index * 0.9,
    enemy: new Enemy(pathPoints, hp, speed),
  }));
}
