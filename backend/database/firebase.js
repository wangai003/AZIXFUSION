const admin = require('firebase-admin');
require('dotenv').config();

// Debug environment variables
console.log('🔍 Firebase environment check:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin SDK
let firebaseApp;
let db;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log("✅ Connected to Firebase with split environment variables");
  } else {
    throw new Error("❌ Missing one or more Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).");
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  db = null;
}

// Helper function to convert Firestore document to a plain object with ID
const convertDoc = (doc) => {
  return { _id: doc.id, ...doc.data() };
};

// Helper function to convert MongoDB-style query to Firestore query
const buildQuery = (collection, filter = {}, sort = {}, limit = 0, skip = 0) => {
  if (!db) {
    throw new Error("Firestore not initialized.");
  }

  let query = collection;

  console.log('Firebase buildQuery - filter:', filter);
  console.log('Firebase buildQuery - sort:', sort);

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    if (value instanceof Object && !(value instanceof Array)) {
      Object.entries(value).forEach(([op, opValue]) => {
        switch (op) {
          case '$eq':
            query = query.where(key, '==', opValue);
            break;
          case '$gt':
            query = query.where(key, '>', opValue);
            break;
          case '$gte':
            query = query.where(key, '>=', opValue);
            break;
          case '$lt':
            query = query.where(key, '<', opValue);
            break;
          case '$lte':
            query = query.where(key, '<=', opValue);
            break;
          case '$ne':
            query = query.where(key, '!=', opValue);
            break;
        }
      });
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        query = query.where(key, 'in', value);
      }
    } else {
      query = query.where(key, '==', value);
    }
  });

  // Apply sort
  Object.entries(sort).forEach(([key, direction]) => {
    query = query.orderBy(key, direction === 1 ? 'asc' : 'desc');
  });

  // Apply pagination
  if (skip > 0) {
    console.warn('Skip in Firestore is not efficient and may not work as expected');
  }

  if (limit > 0) {
    query = query.limit(limit);
  }

  console.log('Firebase buildQuery - final query:', query);
  return query;
};

// Helper function to start a transaction
async function withTransaction(callback) {
  if (!db) {
    throw new Error("Firestore not initialized.");
  }

  return await db.runTransaction(async (t) => {
    return await callback(t);
  });
}

module.exports = {
  db,
  admin,
  convertDoc,
  buildQuery,
  withTransaction
};