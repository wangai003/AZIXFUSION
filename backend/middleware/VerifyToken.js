require('dotenv').config()
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const verifyToken = async (req, res, next) => {
  try {
    let idToken = null;
    // Try to get token from Authorization header (Bearer) or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies && req.cookies.token) {
      idToken = req.cookies.token;
    }
    if (!idToken) {
      res.clearCookie('token');
      return res.status(401).json({ message: 'Token missing, please login again' });
    }
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    res.clearCookie('token');
    return res.status(401).json({ message: 'Invalid or expired token, please login again' });
  }
};

module.exports = verifyToken;