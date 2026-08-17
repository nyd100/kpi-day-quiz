import admin from "firebase-admin";

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
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    }

    // Only initialize if we have a valid credential explicitly passed.
    // In Vercel, applicationDefault() crashes the server if no Google Cloud env is present.
    if (credential) {
      admin.initializeApp({
        credential,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.warn("Firebase Admin skipped initialization: No valid credentials provided in environment variables.");
    }
  }
} catch (err) {
  console.error("Fatal error during Firebase Admin initialization:", err);
}

// These might be undefined or throw if used before successful initialization,
// but they won't crash the entire Node server on boot.
export const adminDb = admin.apps.length ? admin.firestore() : ({} as any);
export const adminAuth = admin.apps.length ? admin.auth() : ({} as any);
export const adminStorage = admin.apps.length ? admin.storage() : ({} as any);

export { admin };
export default admin;
