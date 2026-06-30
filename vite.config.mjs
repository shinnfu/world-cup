import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const isGitHubPages = Boolean(process.env.GITHUB_ACTIONS);
const buildStamp = process.env.VITE_BUILD_STAMP || `${Date.now()}`;

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: process.env.BASE_PATH || (isGitHubPages ? `/${repoName}/` : command === "build" ? "./" : "/"),
  define: {
    __APP_VERSION__: JSON.stringify(buildStamp)
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
}));
