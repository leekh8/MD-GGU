import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const port = parseInt(process.env.VITE_PORT) || 3000;

// TODO: DELETE console log
console.log("Vite Configuration:");
console.log("Port:", port);
console.log("Rollup input:", "./src/index.jsx");
console.log("Server open:", true);

export default defineConfig({
  root: path.resolve(__dirname, "src"), // 프로젝트의 루트를 src 폴더로 설정
  plugins: [react()],
  server: {
    port: port,
    open: true,
    host: true,
    historyApiFallback: true, // SPA 라우팅을 위해 필요
    watch: {
      usePolling: true,
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
