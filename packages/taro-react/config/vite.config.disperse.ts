import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import path from 'path';

const input: Record<string, string> = {};

const inputCollect = (componentsPath: string) => {
  const dirs = fs.readdirSync(componentsPath, { withFileTypes: true });
  dirs.forEach(dir => {
    if (dir.isDirectory()) {
      input[dir.name] = `${componentsPath}/${dir.name}/index.tsx`
    }
  });
}

inputCollect(path.resolve(__dirname, '../src/components'));

const afterBuild = () => {
  fs.copyFileSync('src/index.ts', 'lib/index.d.ts');
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsConfigFilePath: 'tsconfig.build.json',
      afterBuild,
    }),
  ],
  build: {
    minify: false,
    outDir: 'lib',
    lib: {
      entry: '',
      // fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', '@tarojs/taro', '@tarojs/components'],
      input,
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'react': 'React',
          '@tarojs/taro': 'Taro',
        },
        dir: path.resolve(__dirname, '../lib/es'),
        entryFileNames: '[name]/index.js',
      }
    }
  }
})