// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// firebase-admin v14's `import` (ESM) build re-exports its app module in a way
// that breaks when the server bundler re-processes it ("Cannot read properties
// of undefined (reading 'SDK_VERSION')"). Force its subpaths to the CommonJS
// build by resolving them to absolute file paths (which bypasses the package's
// exports-field restriction that blocks deep imports).
function firebaseAdminCjsAliases() {
  const req = createRequire(import.meta.url);
  // Locate the package root via its package.json (an exported path), then point
  // at the CJS build files directly — the exports field blocks resolving
  // `firebase-admin/lib/*` as a subpath, so we build the absolute path by hand.
  // `firebase-admin` resolves to <root>/lib/index.js (package.json is not an
  // exported subpath), so climb two levels to reach the package root.
  const pkgRoot = dirname(dirname(req.resolve("firebase-admin")));
  const subpaths = ["app", "auth", "firestore", "storage", "database", "messaging"];
  const alias: Record<string, string> = {};
  for (const s of subpaths) {
    const file = join(pkgRoot, "lib", s, "index.js");
    if (existsSync(file)) alias[`firebase-admin/${s}`] = file;
  }
  return alias;
}

const firebaseAdminAlias = firebaseAdminCjsAliases();

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    nitro: {
      preset: "vercel",
      alias: firebaseAdminAlias,
    },
    resolve: {
      alias: firebaseAdminAlias,
    },
  },
});
