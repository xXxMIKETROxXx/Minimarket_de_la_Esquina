import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  build: {
    outDir: 'test-build',
    emptyOutDir: true,
    lib: {
      entry: 'src/tests/runner.js',
      name: 'MinimarketTests',
      formats: ['iife'],
      fileName: () => 'tests.js',
    },
  },
});