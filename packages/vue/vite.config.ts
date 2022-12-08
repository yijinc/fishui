import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import path from 'path';
import { toCamelCase } from './src/utils'

const input: Record<string, string> = {};

const inputCollect = (componentsPath = './src/components') => {
  const dirs = fs.readdirSync(componentsPath, { withFileTypes: true });
  dirs.forEach(dir => {
    if (dir.isDirectory()) {
      input[dir.name] = `${componentsPath}/${dir.name}/index.vue`
    }
  });
}

inputCollect();

const afterBuild = () => {
  const entryJS = Object.keys(input).map(name => `export { default as ${toCamelCase(name)} } from './components/${name}/index.js'; \n`).join('');
  const entryDTS = Object.keys(input).map(name => `export { default as ${toCamelCase(name)} } from './components/${name}/index.vue'; \n`).join('');
  fs.writeFileSync(path.resolve('lib/index.js'), entryJS, { encoding: "utf8" });
  fs.writeFileSync(path.resolve('lib/index.d.ts'), entryDTS, { encoding: "utf8" });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      tsConfigFilePath: 'tsconfig.build.json',
      afterBuild
    }),
  ],
  build: {
    minify: false,
    outDir: 'lib',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: '',
      // name: 'taropui', // for umd
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', '@tarojs/taro', '@tarojs/components'],
      input,
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'vue': 'Vue',
          '@tarojs/taro': 'Taro',
        },
        dir: path.resolve(__dirname, './lib'),
        entryFileNames: 'components/[name]/index.js',
      }
    }
  }
})