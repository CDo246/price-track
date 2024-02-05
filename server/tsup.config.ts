import { defineConfig } from "tsup";
import path from "path";

export default defineConfig(({ watch, entry, external }) => {
  return {
    entry: ["src/server.ts"],
    splitting: true,
    sourcemap: true,
    clean: true,
    format: ["esm"],
    platform: "node",
    minify: false,
    dts: false,
    bundle: true,
    metafile: true,
    onSuccess: `node --enable-source-maps dist/server.mjs --inspect`,
    loader: {
      ".json": "copy",
    },
  };
});
