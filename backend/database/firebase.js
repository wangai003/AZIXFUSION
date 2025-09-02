const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Method 1: Using a complete service account JSON string from environment variable (most secure for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Connected to Firebase using service account from environment variable");
  }
  // Method 2: Using individual environment variables
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    const serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL
    };
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Connected to Firebase using individual environment variables");
  }
  // Method 3: Using application default credentials
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log("✅ Connected to Firebase using application default credentials");
  }
  // Method 4: For local development without credentials (limited functionality)
  else {
    console.warn("⚠️ Firebase credentials not found. Using development configuration with limited functionality.");
    
    // Initialize with just the project ID for development
    firebaseApp = admin.initializeApp({
      projectId: 'azix-ecommerce-dev'
    });
    console.log("✅ Connected to Firebase in development mode");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  
  // If we're in development, we can try to initialize with just the project ID
  if (!firebaseApp && process.env.NODE_ENV !== 'production') {
    try {
      firebaseApp = admin.initializeApp({
        projectId: 'azix-ecommerce-dev'
      });
      console.log("✅ Connected to Firebase in fallback development mode");
    } catch (fallbackError) {
      console.error("❌ Firebase fallback initialization error:", fallbackError);
      // In a real application, you might want to exit the process here
      // process.exit(1);
    }
  } else if (process.env.NODE_ENV === 'production') {
    // In production, we should exit if Firebase fails to initialize
    console.error("❌ Firebase initialization failed in production environment");
    process.exit(1);
  }
}

// Get Firestore database
const db = admin.firestore();

// Helper function to convert Firestore document to a plain object with ID
const convertDoc = (doc) => {
  return { _id: doc.id, ...doc.data() };
};

// Helper function to convert MongoDB-style query to Firestore query
const buildQuery = (collection, filter = {}, sort = {}, limit = 0, skip = 0) => {
  let query = collection;
  
  console.log('Firebase buildQuery - filter:', filter);
  console.log('Firebase buildQuery - sort:', sort);
  
  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    if (value instanceof Object && !(value instanceof Array)) {
      // Handle MongoDB operators
      Object.entries(value).forEach(([op, opValue]) => {
        switch(op) {
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
          case '$in':
            // Firestore doesn't have a direct equivalent to $in
            // We'll handle this in the application layer
            break;
        }
      });
    } else {
      // Handle boolean values and other primitive types
      if (typeof value === 'boolean') {
        query = query.where(key, '==', value);
      } else if (Array.isArray(value)) {
        // Handle array values (like for $in operator)
        if (value.length > 0) {
          query = query.where(key, 'in', value);
        }
      } else {
        query = query.where(key, '==', value);
      }
    }
  });
  
  // Apply sort
  Object.entries(sort).forEach(([key, direction]) => {
    query = query.orderBy(key, direction === 1 ? 'asc' : 'desc');
  });
  
  // Apply pagination
  if (skip > 0) {
    // Firestore doesn't have a direct skip, we'll need to use startAfter with a query
    // This is a simplified version
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
  const transaction = db.runTransaction(async (t) => {
    return await callback(t);
  });
  
  return transaction;
}

module.exports = { 
  db, 
  admin, 
  convertDoc, 
  buildQuery, 
  withTransaction 
};