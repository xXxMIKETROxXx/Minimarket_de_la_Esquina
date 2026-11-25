import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-market-images',
      writeBundle(outputOptions) {
        const outputDirectory = resolve(projectRoot, outputOptions.dir || 'dist', 'img');
        mkdirSync(outputDirectory, { recursive: true });
        cpSync(resolve(projectRoot, 'img'), outputDirectory, { recursive: true });
      },
    },
  ],
  server: { host: '0.0.0.0' },
});