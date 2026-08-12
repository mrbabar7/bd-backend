const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(
  path.join(__dirname, "../serviceAccountKey.json"),
);

const cert =
  admin.credential?.cert ||
  admin.default?.credential?.cert ||
  require("firebase-admin/app").cert;

const initializeApp =
  admin.initializeApp ||
  admin.default?.initializeApp ||
  require("firebase-admin/app").initializeApp;

const getApps =
  admin.getApps ||
  admin.default?.getApps ||
  require("firebase-admin/app").getApps;

const apps = getApps ? getApps() : admin.apps || [];

if (apps.length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = admin.default || admin;
