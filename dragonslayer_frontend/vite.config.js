import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:8080",
  //       changeOrigin: true,
  //       // Need this line to make it work. I don't really know why, but without this, the proxy fails
  //       rewrite: (path) => path.replace(/^\/api/, ''),
  //     }
  //   }
  // },
  plugins: [react()],
});
