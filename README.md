# tower_defence

Browser-based tower defence prototype with lane defense plus worker logistics.

## Run locally
```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Gameplay
- Build towers and worker stations (stations can share tiles with towers).
- Select a worker station by clicking it, then train workers.
- Workers path to resource patches (wood/ore/crystal), gather, then return to nearest station.
- Kill enemies for **salvage**.
- Simple tower uses only salvage; advanced towers use mixed resources.

See `docs/GAME_PLAN.md` for the mechanics and roadmap.
