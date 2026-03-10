# tower_defence

Browser-based tower defence prototype with lane defense plus worker logistics.

## Development workflow (Vite + React)

```bash
npm install
npm run dev
```

This starts a Vite dev server for local iteration.

> Note: project-root `index.html` is a Vite entry file, not a standalone app. If opened directly (`file://`) it now shows instructions instead of a blank screen.

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

## GitHub workflow (build artifact)

A CI workflow is included at `.github/workflows/build-single-file.yml`.
On pushes and pull requests, it installs dependencies, runs `npm run build`, and uploads `dist/frontier-bastion-standalone.html` as an artifact named `frontier-bastion-standalone`.

## CI standalone artifact

The GitHub Action `.github/workflows/build-single-file.yml` now publishes a dedicated standalone file: `frontier-bastion-standalone.html`.
Download that artifact from the workflow run and open it directly in the browser (`file://`).

## Instant standalone file (no build step)

If you just want a file you can download and open directly, use `frontier-bastion-standalone.html` in the repo root.
It is self-contained (HTML/CSS/JS in one file) and runs via `file://` in a browser.
