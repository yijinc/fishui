import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    outDir: 'lib',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: 'src/style.scss',
      name: 'style',
      // the proper extensions will be added
      fileName: 'style',
      formats: ['es']
    },
    emptyOutDir: false
  }
})
