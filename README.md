# tower_defence

Browser-based tower defence prototype with lane defense plus worker logistics.

## Development workflow (Vite + React)

```bash
npm install
npm run dev
```

This starts a Vite dev server for local iteration.

## Build a single-file app (`index.html`)

```bash
npm run build
```

The build output in `dist/index.html` is a one-page artifact (JS/CSS inlined) via `vite-plugin-singlefile`.
You can open `dist/index.html` directly in a browser from your filesystem (`file://`) without running Python or any server.

## Gameplay
- Build towers and worker stations (stations can share tiles with towers).
- Select a worker station by clicking it, then train workers.
- Workers path to resource patches (wood/ore/crystal), gather, then return to nearest station.
- Kill enemies for **salvage**.
- Simple tower uses only salvage; advanced towers use mixed resources.

See `docs/GAME_PLAN.md` for the mechanics and roadmap.
