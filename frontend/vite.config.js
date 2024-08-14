import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const port = parseInt(process.env.VITE_PORT) || 3000;

export default defineConfig({
  root: path.resolve(__dirname, "src"), // 프로젝트의 루트를 src 폴더로 설정
  publicDir: path.resolve(__dirname, "public"), // public 폴더 경로를 명시적으로 지정
  plugins: [react()],
  server: {
    port: port,
    open: true,
    host: true,
    historyApiFallback: true, // SPA 라우팅을 위해 필요
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
    },
  },
  build: {
    rollupOptions: {
      input: "./src/index.jsx",
    },
    esbuild: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
        ".ts": "tsx",
        ".tsx": "tsx",
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
        ".ts": "tsx",
        ".tsx": "tsx",
      },
    },
  },
});
