// Postbuild: firebase-admin is kept external from the server bundle (see
// vite.config.ts), so install it into the Vercel function's node_modules with
// its full native dependency tree. Runs after `vite build`.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";

const FN_DIR = ".vercel/output/functions/__server.func";
if (!existsSync(FN_DIR)) {
  console.log("[vendor-firebase-admin] function dir not found, skipping:", FN_DIR);
  process.exit(0);
}

// Pin to the exact version resolved for the app to avoid drift.
const version = JSON.parse(readFileSync("node_modules/firebase-admin/package.json", "utf8")).version;

mkdirSync(`${FN_DIR}/node_modules`, { recursive: true });
writeFileSync(
  `${FN_DIR}/package.json`,
  JSON.stringify({ private: true, dependencies: { "firebase-admin": version } }, null, 2),
);

console.log(`[vendor-firebase-admin] installing firebase-admin@${version} into ${FN_DIR} ...`);
execSync("npm install --omit=dev --no-audit --no-fund --loglevel=error", {
  cwd: FN_DIR,
  stdio: "inherit",
});
console.log("[vendor-firebase-admin] done.");
