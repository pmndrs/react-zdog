import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "react-zdog",
      formats: ["es"],
      fileName: (format) => `react-zdog.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "zdog"],
    },
  },
});
