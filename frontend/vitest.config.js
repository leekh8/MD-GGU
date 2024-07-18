import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const port = parseInt(process.env.VITE_PORT);

console.log("Vitest Configuration:");
console.log("Port:", port);
console.log("Rollup input:", "./src/index.jsx");

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    esbuild: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
        ".ts": "tsx",
        ".tsx": "tsx",
      },
      include: /src\/.*\.jsx?$/,
      exclude: [],
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
