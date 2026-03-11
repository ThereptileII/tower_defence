# tower_defence

Browser-based tower defence prototype with lane defense plus worker logistics.

## Development workflow (Vite + React)

```bash
npm install
npm run dev
```

This starts a Vite dev server for local iteration.

> Note: project-root `index.html` is a Vite entry file, not a standalone app. If opened directly (`file://`) it now shows instructions instead of a blank screen.

## Build standalone outputs (no server)

```bash
npm run build:bundle
```

This workflow does three things:
- Builds `dist/index.html` as a single-file app (JS/CSS inlined).
- Syncs `frontier-bastion-standalone.html` in the repo root so the one-file version stays up to date.
- Creates `dist/download-bundle/` with:
  - `index.html` (standalone)
  - `assets/` (copied from `src/assets`)

Everything in `dist/download-bundle/` works from `file://` with no server.

## Gameplay
- Build towers and worker stations (stations can share tiles with towers).
- Select a worker station by clicking it, then train workers.
- Workers path to resource patches (wood/ore/crystal), gather, then return to nearest station.
- Kill enemies for **salvage**.
- Simple tower uses only salvage; advanced towers use mixed resources.

See `docs/GAME_PLAN.md` for the mechanics and roadmap.

## GitHub workflow (build artifact)

A CI workflow is included at `.github/workflows/build-download-bundle.yml`.
On pushes and pull requests, it installs dependencies, runs `npm run build:bundle`, and uploads:
- `dist/download-bundle/` as `frontier-bastion-download-bundle`
- `frontier-bastion-standalone.html` as `frontier-bastion-standalone`

## CI standalone artifact

The GitHub Action `.github/workflows/build-download-bundle.yml` publishes both a dedicated standalone file and a download folder with assets.
Download either artifact and open `index.html` directly in the browser (`file://`).

## Instant standalone file (no build step)

If you just want a file you can download and open directly, use `frontier-bastion-standalone.html` in the repo root.
It is self-contained (HTML/CSS/JS in one file) and runs via `file://` in a browser.
