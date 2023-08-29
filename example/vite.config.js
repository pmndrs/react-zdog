/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let alias = {};

  if (mode === "development") {
    alias = {
      "react-zdog": path.resolve(__dirname, "../src/index.js"),
    };
  }

  return {
    resolve: {
      alias: alias,
    },
    plugins: [react()],
  };
});
