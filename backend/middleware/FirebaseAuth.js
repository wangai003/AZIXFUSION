const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
});

// Middleware to verify Firebase token and attach user data
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Check if user exists in our database
        let user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
            // Create new user if not exists
            user = new User({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email.split('@')[0],
                isVerified: decodedToken.email_verified
            });
            await user.save();
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
        });

        // Attach user to request object
        req.user = user;
        req.firebaseUser = decodedToken;
        next();
    } catch (error) {
        console.error('Firebase Auth Error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Middleware to check if session is within 24 hours
const checkSessionValidity = async (req, res, next) => {
    try {
        if (!req.user || !req.user.lastLogin) {
            return res.status(401).json({ success: false, message: 'No active session' });
        }

        const lastLogin = new Date(req.user.lastLogin);
        const now = new Date();
        const hoursDiff = (now - lastLogin) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return res.status(401).json({ success: false, message: 'Session expired' });
        }

        next();
    } catch (error) {
        console.error('Session Check Error:', error);
        res.status(500).json({ success: false, message: 'Error checking session' });
    }
};

module.exports = { verifyFirebaseToken, checkSessionValidity };