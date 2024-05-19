import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    transform: {
      "^.+\\.jsx?$": "babel-jest",
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
