import { defineConfig } from 'tsup';
export default defineConfig({ entry: ['src/worker/index.ts'], outDir: 'dist/worker', format: ['esm'], target: 'node22', bundle: true, clean: true });
