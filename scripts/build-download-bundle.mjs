import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const bundleDir = resolve(distDir, 'download-bundle');
const standaloneSource = resolve(distDir, 'index.html');
const standaloneTarget = resolve(rootDir, 'frontier-bastion-standalone.html');
const sourceAssetsDir = resolve(rootDir, 'src/assets');
const bundleAssetsDir = resolve(bundleDir, 'assets');

if (!existsSync(standaloneSource)) {
  throw new Error('dist/index.html does not exist. Run `npm run build` first.');
}

rmSync(bundleDir, { force: true, recursive: true });
mkdirSync(bundleDir, { recursive: true });

cpSync(standaloneSource, standaloneTarget);
cpSync(standaloneSource, resolve(bundleDir, 'index.html'));

if (existsSync(sourceAssetsDir)) {
  cpSync(sourceAssetsDir, bundleAssetsDir, { recursive: true });
}

console.log('Updated standalone file:', standaloneTarget);
console.log('Prepared download bundle:', bundleDir);
