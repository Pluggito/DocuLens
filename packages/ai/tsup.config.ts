import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["ai", "@ai-sdk/google", "zod", "tesseract.js", "pdf2pic"],
});
