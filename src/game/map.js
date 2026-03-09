import { GRID } from './config.js';

const roadLayout = [
  [0, 7],
  [5, 7],
  [5, 3],
  [11, 3],
  [11, 11],
  [17, 11],
  [17, 5],
  [23, 5],
];

const resourceNodes = [
  { col: 2, row: 2, type: 'wood' },
  { col: 4, row: 13, type: 'wood' },
  { col: 9, row: 13, type: 'ore' },
  { col: 15, row: 1, type: 'crystal' },
  { col: 20, row: 13, type: 'ore' },
  { col: 21, row: 2, type: 'crystal' },
];

function toWorld([col, row]) {
  return {
    x: col * GRID.tileSize + GRID.tileSize / 2,
    y: row * GRID.tileSize + GRID.tileSize / 2,
  };
}

export function tileToWorld(col, row) {
  return {
    x: col * GRID.tileSize + GRID.tileSize / 2,
    y: row * GRID.tileSize + GRID.tileSize / 2,
  };
}

export function createMap() {
  const pathPoints = roadLayout.map(toWorld);
  const pathTiles = new Set();

  for (let i = 0; i < roadLayout.length - 1; i += 1) {
    const [sx, sy] = roadLayout[i];
    const [ex, ey] = roadLayout[i + 1];
    const xStep = Math.sign(ex - sx);
    const yStep = Math.sign(ey - sy);

    let cx = sx;
    let cy = sy;
    pathTiles.add(`${cx},${cy}`);

    while (cx !== ex || cy !== ey) {
      if (cx !== ex) cx += xStep;
      if (cy !== ey) cy += yStep;
      pathTiles.add(`${cx},${cy}`);
    }
  }

  return {
    pathPoints,
    pathTiles,
    resourceNodes,
  };
}

export function findPath(start, goal, blockedSet) {
  const startKey = `${start.col},${start.row}`;
  const goalKey = `${goal.col},${goal.row}`;
  if (startKey === goalKey) return [start];

  const queue = [start];
  const parents = new Map();
  parents.set(startKey, null);

  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const cur = queue.shift();
    for (const [dx, dy] of neighbors) {
      const next = { col: cur.col + dx, row: cur.row + dy };
      if (next.col < 0 || next.col >= GRID.cols || next.row < 0 || next.row >= GRID.rows) continue;
      const nextKey = `${next.col},${next.row}`;
      if (blockedSet.has(nextKey) && nextKey !== goalKey) continue;
      if (parents.has(nextKey)) continue;
      parents.set(nextKey, `${cur.col},${cur.row}`);
      if (nextKey === goalKey) {
        const path = [];
        let cursor = goalKey;
        while (cursor) {
          const [col, row] = cursor.split(',').map(Number);
          path.push({ col, row });
          cursor = parents.get(cursor);
        }
        return path.reverse();
      }
      queue.push(next);
    }
  }

  return [];
}
