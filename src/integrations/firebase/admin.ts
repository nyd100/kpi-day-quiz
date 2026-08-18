// Firebase Admin SDK.
//
// firebase-admin is CommonJS. Two bundling pitfalls to avoid:
//   * `import admin from "firebase-admin"` → the default resolves to `undefined`
//     under rollup/nitro interop ("Cannot read properties of undefined
//     (reading 'apps')").
//   * modular subpath imports (`firebase-admin/app` etc.) split it across chunks
//     and its internal `@firebase/app` ends up undefined ("reading 'SDK_VERSION'").
// A namespace import keeps the whole package as one CJS module whose internals
// reference each other consistently; the `.default ?? ns` fallback covers both
// interop shapes the bundler may produce.
import * as adminNs from "firebase-admin";

const admin = ((adminNs as any).default ?? adminNs) as typeof import("firebase-admin");

try {
  if (!admin.apps.length) {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }
        credential = admin.credential.cert(serviceAccount);
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", error);
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    }

    // Only initialize when a valid credential was explicitly provided.
    // In Vercel, applicationDefault() would crash without Google Cloud env present.
    if (credential) {
      admin.initializeApp({
        credential,
        storageBucket:
          process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.warn(
        "Firebase Admin skipped initialization: No valid credentials provided in environment variables.",
      );
    }
  }
} catch (err) {
  console.error("Fatal error during Firebase Admin initialization:", err);
}

// Empty stand-ins until a valid credential initializes the app, so importing
// this module never crashes the server on boot.
export const adminDb = admin.apps.length ? admin.firestore() : ({} as any);
export const adminAuth = admin.apps.length ? admin.auth() : ({} as any);
export const adminStorage = admin.apps.length ? admin.storage() : ({} as any);
