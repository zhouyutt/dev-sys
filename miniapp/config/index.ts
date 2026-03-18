import { defineConfig } from "@tarojs/cli";
import path from "path";

export default defineConfig({
  projectName: "dive-erp-miniapp",
  date: "2026-03-13",
  designWidth: 750,
  sourceRoot: "src",
  outputRoot: "dist",
  plugins: [],
  defineConstants: {},
  alias: {
    "@": path.resolve(__dirname, "..", "src")
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: "vue3",
  compiler: {
    type: "webpack5"
  },
  mini: {},
  h5: {}
});
