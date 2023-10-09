import { defineConfig } from "tsup";
import path from "path";

export default defineConfig(({ watch, entry, external }) => {
  const filename =
    entry && Array.isArray(entry) && path.basename(entry[0], ".ts");

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
    onSuccess: `node --enable-source-maps dist/${filename}.mjs --inspect`,
    loader: {
      ".json": "copy",
    },
  };
});
