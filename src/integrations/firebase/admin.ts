// Firebase Admin SDK — modular entry points only.
// The default `import admin from "firebase-admin"` resolves to `undefined` in the
// bundled Nitro/Vercel server (CJS/ESM interop), which made `admin.apps` throw
// "Cannot read properties of undefined (reading 'apps')" on every admin call.
// The modular subpath imports below are ESM-safe and avoid that pitfall.
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

try {
  if (!getApps().length) {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }
        credential = cert(serviceAccount as ServiceAccount);
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", error);
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    }

    // Only initialize when a valid credential was explicitly provided.
    // In Vercel, applicationDefault() would crash without Google Cloud env present.
    if (credential) {
      initializeApp({
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

// These stay as empty stand-ins until a valid credential initializes the app,
// so importing this module never crashes the server on boot.
const ready = getApps().length > 0;
export const adminDb = ready ? getFirestore() : ({} as any);
export const adminAuth = ready ? getAuth() : ({} as any);
export const adminStorage = ready ? getStorage() : ({} as any);
