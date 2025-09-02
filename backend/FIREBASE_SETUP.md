# Firebase Setup Guide for MERN E-Commerce Application

This guide will help you set up Firebase for your MERN E-Commerce application, focusing on Firestore for database and Firebase Authentication.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Give your project a name (e.g., "azix-ecommerce")
4. Enable Google Analytics if desired
5. Click "Create project"

## 2. Set Up Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (recommended) or "Start in test mode" (for quick development)
4. Select a location for your Firestore database that's closest to your users
5. Click "Enable"

## 3. Set Up Firebase Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the authentication methods you want to use:
   - Email/Password (required for basic functionality)
   - Google (recommended for social login)
   - Other providers as needed
4. Configure each provider according to your needs

## 4. Generate Service Account Credentials

1. In your Firebase project, go to "Project settings" (gear icon in the top left)
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely - this contains sensitive information!

## 5. Configure Environment Variables

Create a `.env` file in your backend directory with the following options:

### Option 1: Using the entire service account JSON (recommended)

```
# Store the entire service account JSON as a single environment variable
# Make sure to escape any quotes and newlines properly
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"key-id","private_key":"-----BEGIN PRIVATE KEY-----\\nYour Private Key\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk@your-project-id.iam.gserviceaccount.com",...}
```

### Option 2: Using individual credentials

```
# Store individual credentials as separate environment variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
```

### Option 3: Using application default credentials

```
# Path to your service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json
```

## 6. Deploy to Production

When deploying to production:

1. **Heroku**:
   - Set environment variables in the Heroku dashboard or using the Heroku CLI:
   ```
   heroku config:set FIREBASE_SERVICE_ACCOUNT='{...}'
   ```

2. **Vercel**:
   - Add environment variables in the Vercel dashboard under Project Settings > Environment Variables

3. **AWS**:
   - Use AWS Parameter Store or Secrets Manager to store your Firebase credentials
   - Set up environment variables in your deployment configuration

## 7. Security Best Practices

1. **Never commit your service account key to version control**
2. **Use environment variables** to store sensitive information
3. **Set up proper Firestore security rules** to protect your data
4. **Implement proper authentication** in your Express routes
5. **Use HTTPS** for all communications
6. **Regularly rotate your service account keys**

## 8. Run the Firebase Setup Script

```bash
cd backend
node scripts/firebase-setup.js
```

This will create the necessary indexes and security rules for your Firestore database.

## 9. Seed the Database

```bash
cd backend
node seed/seed.js
```

This will populate your Firestore database with initial data.

## 10. Testing Your Firebase Setup

Run the following command to test your Firebase setup:

```bash
node -e "require('./database/firebase.js'); console.log('Firebase setup successful!');"
```

If you see "Firebase setup successful!" without any errors, your setup is working correctly.

## 11. Troubleshooting

### Common Issues:

1. **"Firebase app already exists" error**:
   - This happens when you try to initialize Firebase multiple times
   - Make sure you're only initializing Firebase once in your application

2. **"Invalid credential" error**:
   - Check that your service account key is correct and properly formatted
   - Make sure environment variables are properly set

3. **"Permission denied" error**:
   - Check your Firestore security rules
   - Make sure your service account has the necessary permissions

4. **"Network error" when connecting to Firestore**:
   - Check your internet connection
   - Make sure your firewall isn't blocking Firebase connections

For more help, refer to the [Firebase documentation](https://firebase.google.com/docs) or contact Firebase support.