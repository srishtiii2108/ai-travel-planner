import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm } from "node:fs/promises";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

// esbuild-plugin-pino calls require() internally, which doesn't exist in a
// .mjs build script - provide it.
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(artifactDir, "dist");

// Fresh dist every build so stale files never get deployed.
await rm(distDir, { recursive: true, force: true });

await esbuild({
  entryPoints: [path.resolve(artifactDir, "src/index.ts")],
  platform: "node",
  target: "node22",
  bundle: true,
  format: "esm",
  outdir: distDir,
  // Output is dist/index.mjs (matches the "start" script).
  outExtension: { ".js": ".mjs" },
  logLevel: "info",
  sourcemap: "linked",
  // Workspace packages (@workspace/*) export raw .ts source, so they MUST be
  // bundled in. Only truly native / optional modules are kept external.
  external: ["*.node", "pg-native"],
  // Lets bundled CommonJS deps (express, pg, ...) use require()/__dirname
  // inside an ES module bundle.
  banner: {
    js: [
      "import { createRequire as __bannerCrReq } from 'node:module';",
      "import __bannerPath from 'node:path';",
      "import __bannerUrl from 'node:url';",
      "globalThis.require = __bannerCrReq(import.meta.url);",
      "globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);",
      "globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);",
    ].join("\n"),
  },
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
});

console.log("Build complete ->", path.relative(process.cwd(), distDir));
