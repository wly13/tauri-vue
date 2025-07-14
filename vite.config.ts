import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from 'node:url';
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import vueDevTools from 'vite-plugin-vue-devtools'

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue(), viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      // 包含 png 文件
      filter: /\.(js|css|json|txt|html|ico|svg|png)(\?.*)?$/i,
      threshold: 10240, // 大于10k的文件才压缩
      deleteOriginFile: false, //压缩后是否删除源文件
    }),
    visualizer({
      open: true, //build后，是否自动打开分析页面，默认false
      gzipSize: true, //是否分析gzip大小
      brotliSize: true, //是否分析brotli大小
      //filename: 'stats.html'//分析文件命名
    }),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
