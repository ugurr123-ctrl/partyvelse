import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), 'VITE_');
const endpoint = env.VITE_COLYSEUS_URL?.trim();
try {
  if (!endpoint || new URL(endpoint).protocol !== 'wss:') throw new Error();
} catch {
  console.error('iOS yayını için .env.production dosyasında VITE_COLYSEUS_URL değerini canlı wss:// adresine ayarlayın.');
  process.exit(1);
}

for (const args of [
  ['node_modules/vite/bin/vite.js', 'build'],
  ['node_modules/@capacitor/cli/bin/capacitor', 'sync', 'ios'],
]) {
  const result = spawnSync(process.execPath, [resolve(args[0]), ...args.slice(1)], {
    env: { ...process.env, VITE_COLYSEUS_URL: endpoint },
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
