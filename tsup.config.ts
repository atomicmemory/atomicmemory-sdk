import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    browser: 'src/browser.ts',
    index: 'src/index.ts',
    storage: 'src/storage/index.ts',
    embedding: 'src/embedding/index.ts',
    search: 'src/search/index.ts',
    utils: 'src/utils/index.ts',
    core: 'src/core/index.ts',
    memory: 'src/memory/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  platform: 'neutral',
  splitting: true,
  treeshake: true,
});
