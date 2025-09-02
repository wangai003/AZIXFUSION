const { db, admin, withTransaction } = require('./firebase');

// Function to initialize the database connection
async function connectToDatabase() {
  try {
    // Firebase is already initialized in the firebase.js file
    // This function is kept for compatibility with the existing code
    console.log("✅ Connected to Firebase database.");
    return db;
  } catch (err) {
    console.error("❌ Firebase connection error:", err);
    process.exit(1);
  }
}

// Function to get the database instance
function getDb() {
  return db;
}

// Function to get the Firebase admin instance
function getClient() {
  return admin;
}

module.exports = { connectToDatabase, getDb, getClient, withTransaction };

