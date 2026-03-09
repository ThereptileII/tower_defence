# Web Tower Defence - Design Plan

## 1) Vision
Create a browser-first tower defence where the player balances two loops:
1. **Combat loop**: defend a route from waves using combat towers.
2. **Economy loop**: build stations, train workers, and run resource logistics.

## 2) Core Pillars
- **Classic readability**: obvious lane pressure and understandable tower behavior.
- **Layered economy**: salvage from kills + gathered resources from workers.
- **Position strategy**: station placement, worker travel distance, and mixed tower costs.

## 3) Implemented Mechanics
- Grid map with a fixed enemy route.
- Scaled waves and enemy reward (salvage).
- Three towers:
  - Arrow Tower: salvage-only starter tower.
  - Cannon Tower: mixed salvage/wood/ore cost.
  - Arcane Spire: mixed salvage/ore/crystal cost.
- Worker station building (can share the same tile as towers).
- Station selection + worker training.
- Worker behavior:
  - pathfind to nearest resource patch,
  - gather resource,
  - pathfind to nearest station,
  - drop off and repeat.
- Four resources in economy:
  - salvage (enemy kills),
  - wood,
  - ore,
  - crystal.

## 4) Visual Plan
- Keep top-down grid readability.
- Distinct color per resource type for patches and carried worker payloads.
- Selected station outline to improve worker-management clarity.

## 5) Technical Structure
- `index.html`: controls/HUD/canvas shell.
- `styles.css`: visual styling.
- `src/main.js`: game state, interactions, and update loop.
- `src/game/config.js`: balancing and definitions.
- `src/game/map.js`: map data + worker pathfinding.
- `src/game/entities.js`: enemies/towers/stations/workers.
- `src/game/renderer.js`: all rendering.

## 6) Next Mechanics
- Resource patch depletion and worker reassignment.
- Worker capacity upgrades and station storage.
- Enemy raids on workers for map-pressure interplay.
- Tower upgrades that consume mixed resources.
