// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// firebase-admin can't be bundled into the server: its ESM build breaks under
// the bundler's CJS/ESM interop ("undefined reading 'apps'/'SDK_VERSION'"), and
// its CJS build lazily require()s native deps (google-auth-library, grpc, …) the
// bundler leaves unresolved. Keep the whole package external so it runs as a
// plain Node module; a postbuild step installs it into the function's
// node_modules (see scripts/vendor-firebase-admin.mjs, wired via `build`).
const externalFirebaseAdmin = (id: string) =>
  id === "firebase-admin" || id.startsWith("firebase-admin/");

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    nitro: {
      preset: "vercel",
      rollupConfig: {
        external: externalFirebaseAdmin,
      },
    },
  },
});
