import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import path from 'path';

const input: Record<string, string> = {};

const inputCollect = (componentsPath: string) => {
  const dirs = fs.readdirSync(componentsPath, { withFileTypes: true });
  dirs.forEach(dir => {
    if (dir.isDirectory()) {
      input[dir.name] = `${componentsPath}/${dir.name}/index.vue`
    }
  });
}

inputCollect(path.resolve(__dirname, '../src/components'));

const afterBuild = () => {
  fs.copyFileSync('src/index.ts', 'lib/index.d.ts');
  // copy scss files
  Object.keys(input).forEach(key => {
    fs.copyFileSync(path.resolve(`src/components/${key}/style.scss`), path.resolve(`lib/components/${key}/style.scss`))
  })
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
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
      external: ['vue', '@tarojs/taro', '@tarojs/components'],
      input,
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'vue': 'Vue',
          '@tarojs/taro': 'Taro',
        },
        dir: path.resolve('lib/components'),
        entryFileNames: '[name]/index.js',
      }
    },
    emptyOutDir: false,
  }
})