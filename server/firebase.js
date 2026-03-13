const admin = require('firebase-admin');

// Validate required env vars at startup — fail loudly rather than silently
const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missing = requiredVars.filter(k => !process.env[k]);
if (missing.length > 0) {
    throw new Error(`Firebase Admin SDK: missing required env vars: ${missing.join(', ')}`);
}

// Private key: dotenv handles unescaping when value is double-quoted in .env.
// Fall back to manual \n replacement in case the env var is set externally without quotes.
const privateKey = process.env.FIREBASE_PRIVATE_KEY.includes('\\n')
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        }),
    });
}

const db = admin.firestore();

module.exports = { admin, db };
