import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The `base` must match your GitHub repo name so asset paths
// resolve correctly at https://<username>.github.io/multiplication-practice/
export default defineConfig({
  base: '/multiplication-practice/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})