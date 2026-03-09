export const GRID = {
  cols: 24,
  rows: 16,
  tileSize: 40,
};

export const RESOURCE_TYPES = ['salvage', 'wood', 'ore', 'crystal'];

export const RESOURCE_COLORS = {
  salvage: '#fbbf24',
  wood: '#22c55e',
  ore: '#94a3b8',
  crystal: '#a78bfa',
};

export const BUILD_TYPES = {
  arrow: {
    category: 'tower',
    name: 'Arrow Tower',
    cost: { salvage: 60 },
    range: 130,
    damage: 18,
    fireRate: 1.1,
    color: '#7dd3fc',
  },
  cannon: {
    category: 'tower',
    name: 'Cannon Tower',
    cost: { salvage: 45, wood: 20, ore: 25 },
    range: 110,
    damage: 44,
    fireRate: 0.55,
    color: '#f59e0b',
  },
  arcane: {
    category: 'tower',
    name: 'Arcane Spire',
    cost: { salvage: 35, ore: 15, crystal: 30 },
    range: 145,
    damage: 30,
    fireRate: 0.8,
    color: '#a78bfa',
  },
  station: {
    category: 'structure',
    name: 'Worker Station',
    cost: { salvage: 80, wood: 15 },
    color: '#34d399',
  },
};

export const WORKER_CONFIG = {
  cost: { salvage: 20 },
  speed: 70,
  gatherDuration: 2.2,
  carryAmount: 12,
};

export const ENEMY_WAVE = {
  baseCount: 7,
  healthScale: 0.28,
  speedBase: 54,
  salvageBounty: 12,
};
