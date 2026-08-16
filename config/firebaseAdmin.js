// const admin = require("firebase-admin");
// const path = require("path");
// const serviceAccount = require(
//   path.join(__dirname, "../serviceAccountKey.json"),
// );
// const cert =
//   admin.credential?.cert ||
//   admin.default?.credential?.cert ||
//   require("firebase-admin/app").cert;
// const initializeApp =
//   admin.initializeApp ||
//   admin.default?.initializeApp ||
//   require("firebase-admin/app").initializeApp;
// const getApps =
//   admin.getApps ||
//   admin.default?.getApps ||
//   require("firebase-admin/app").getApps;
// const apps = getApps ? getApps() : admin.apps || [];
// if (apps.length === 0) {
//   initializeApp({
//     credential: cert(serviceAccount),
//   });
// }
// module.exports = admin.default || admin;

const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");

let serviceAccount;

// 1. Try loading credentials from Railway Environment Variable
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount =
      typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string"
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
  } catch (err) {
    console.error(
      "❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:",
      err.message,
    );
  }
}

// 2. Fallback to local JSON file if env var is missing
if (!serviceAccount) {
  try {
    serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));
  } catch (err) {
    console.error("❌ Could not load serviceAccountKey.json:", err.message);
  }
}

// 3. Initialize Firebase Admin if not already initialized
if (!admin.apps || admin.apps.length === 0) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin SDK initialized successfully.");
  } else {
    console.error(
      "⚠️ Firebase Admin initialized without service account credentials!",
    );
  }
}

// Safe messaging instance getter
const getMessagingInstance = () => {
  try {
    return getMessaging();
  } catch (e) {
    if (typeof admin.messaging === "function") {
      return admin.messaging();
    }
    throw new Error("Firebase Messaging SDK failed to initialize.");
  }
};

module.exports = {
  admin,
  messaging: getMessagingInstance(),
};
