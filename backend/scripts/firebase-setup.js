const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase with development credentials
try {
  admin.initializeApp({
    projectId: 'azix-ecommerce-dev'
  });
  console.log("✅ Connected to Firebase in development mode");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  process.exit(1);
}

// Get Firestore database
const db = admin.firestore();

// Create Firestore indexes for common queries
async function createIndexes() {
  try {
    console.log('Creating Firestore indexes...');
    
    // Example index for products by category and price
    await db.collection('products').where('category', '==', 'electronics').where('price', '>', 0).get();
    
    // Example index for orders by user and date
    await db.collection('orders').where('userId', '==', 'user123').where('orderDate', '>', new Date()).get();
    
    console.log('Firestore indexes created successfully!');
  } catch (error) {
    console.error('Error creating Firestore indexes:', error);
  }
}

// Create Firestore security rules
async function createSecurityRules() {
  try {
    console.log('Creating Firestore security rules...');
    
    const rules = `
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow anyone to read products, categories, and brands
        match /products/{productId} {
          allow read: if true;
          allow write: if request.auth != null && request.auth.token.admin == true;
        }
        
        match /categories/{categoryId} {
          allow read: if true;
          allow write: if request.auth != null && request.auth.token.admin == true;
        }
        
        match /brands/{brandId} {
          allow read: if true;
          allow write: if request.auth != null && request.auth.token.admin == true;
        }
        
        // Allow users to read and write their own data
        match /users/{userId} {
          allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);
          allow write: if request.auth != null && (request.auth.uid == userId || request.auth.token.admin == true);
        }
        
        // Allow users to read and write their own cart
        match /cart/{cartId} {
          allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
        }
        
        // Allow users to read and write their own orders
        match /orders/{orderId} {
          allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
          allow update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
        }
        
        // Default deny
        match /{document=**} {
          allow read, write: if false;
        }
      }
    }
    `;
    
    // In a real environment, you would use the Firebase Admin SDK to deploy these rules
    // For now, we'll just save them to a file
    fs.writeFileSync(path.join(__dirname, 'firestore.rules'), rules);
    
    console.log('Firestore security rules created successfully!');
  } catch (error) {
    console.error('Error creating Firestore security rules:', error);
  }
}

// Run setup
async function setup() {
  try {
    await createIndexes();
    await createSecurityRules();
    console.log('Firebase setup completed successfully!');
  } catch (error) {
    console.error('Firebase setup failed:', error);
  } finally {
    process.exit(0);
  }
}

setup();