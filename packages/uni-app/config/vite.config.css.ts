import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const input: Record<string, string> = {};

const inputCollect = (componentsPath = './src/components') => {
  const dirs = fs.readdirSync(componentsPath, { withFileTypes: true });
  dirs.forEach(dir => {
    if (dir.isDirectory()) {
      input[dir.name] = `${componentsPath}/${dir.name}/style.scss`
    }
  });
}

inputCollect();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    minify: false,
    outDir: 'lib',
    lib: {
      entry: '',
      fileName: 'style',
      formats: ['es']
    },
    rollupOptions: {
      input,
      output: {
        dir: path.resolve(__dirname, '../lib/style'),
        entryFileNames: '[name]/style.css',
      }
    }
  }
})