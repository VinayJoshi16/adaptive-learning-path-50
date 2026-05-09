import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@tensorflow") || id.includes("tfjs")) return "vendor-tensorflow";
            if (id.includes("face-api")) return "vendor-faceapi";
            if (id.includes("@mediapipe")) return "vendor-mediapipe";
            if (id.includes("@monaco-editor") || id.includes("monaco")) return "vendor-editor";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (id.includes("react-dom")) return "vendor-react";
            if (id.includes("react-router")) return "vendor-react";
            if (id.includes("@radix-ui")) return "vendor-ui";
          }
        },
      },
    },
  },
});
