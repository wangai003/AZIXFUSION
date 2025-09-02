# Integrating Firebase Authentication with Your Existing Auth System

This guide explains how to integrate Firebase Authentication with your existing JWT-based authentication system.

## Understanding the Two Authentication Systems

Your application currently uses two authentication systems:

1. **Custom JWT Authentication**: Used for most API endpoints, with tokens stored in cookies
2. **Firebase Authentication**: Used for Google Sign-In and potentially other social logins

## Integration Strategy

### 1. Keep Both Systems Working in Parallel

The simplest approach is to maintain both authentication systems:

- Use your custom JWT system for most API endpoints
- Use Firebase Auth for social logins and specific features

### 2. Link User Accounts

When a user signs in with Firebase (e.g., Google Sign-In), link that account to your existing user system:

```javascript
// Example: In your auth controller
exports.handleGoogleSignIn = async (req, res) => {
  try {
    // Verify the Firebase ID token
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user info from the token
    const { email, name, picture, uid: firebaseUid } = decodedToken;
    
    // Check if a user with this email already exists in your system
    let user = await User.findOne({ email });
    
    if (user) {
      // Link the Firebase UID to the existing user
      if (!user.firebaseUid) {
        user = await User.updateById(user._id, { 
          firebaseUid,
          // Update other fields if needed
          name: user.name || name,
          // Add profile picture if not already set
          profilePicture: user.profilePicture || picture
        });
      }
    } else {
      // Create a new user with the Firebase UID
      user = await User.create({
        email,
        name,
        firebaseUid,
        profilePicture: picture,
        isVerified: true, // Email is verified by Google
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10) // Random password
      });
    }
    
    // Generate your custom JWT token
    const token = generateToken(sanitizeUser(user));
    
    // Set the token in a cookie
    res.cookie('token', token, {
      sameSite: process.env.PRODUCTION === 'true' ? "None" : 'Lax',
      maxAge: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000))),
      httpOnly: true,
      secure: process.env.PRODUCTION === 'true' ? true : false
    });
    
    // Return the user info
    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};
```

### 3. Add Firebase Authentication Routes

Add new routes to handle Firebase authentication:

```javascript
// In your Auth.js routes file
router.post('/google-signin', authController.handleGoogleSignIn);
router.post('/link-firebase-account', verifyToken, authController.linkFirebaseAccount);
```

### 4. Update Frontend to Handle Both Auth Systems

In your frontend, handle both authentication systems:

```javascript
// Example: Google Sign-In function
const handleGoogleSignIn = async () => {
  try {
    // 1. Sign in with Firebase
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // 2. Get the ID token
    const idToken = await result.user.getIdToken();
    
    // 3. Send the token to your backend
    const response = await axiosi.post('auth/google-signin', { idToken });
    
    // 4. Update your Redux store with the user info
    dispatch(setUser(response.data));
    
    // 5. Navigate to the dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    toast.error('Google Sign-In failed. Please try again.');
  }
};
```

## Handling Authentication in API Requests

### 1. For Custom JWT Authentication

Continue using your existing middleware:

```javascript
// VerifyToken.js middleware
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
```

### 2. For Firebase Authentication

Create a new middleware for Firebase authentication:

```javascript
// VerifyFirebaseToken.js middleware
const admin = require('../database/firebase').admin;

module.exports = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.sendStatus(401);
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decodedToken;
    
    // Optionally, fetch the corresponding user from your database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return res.sendStatus(401);
  }
};
```

## Best Practices

1. **Keep Authentication Logic Consistent**: Use similar patterns for both authentication systems
2. **Secure All Routes**: Make sure all routes are protected by appropriate middleware
3. **Handle Token Expiration**: Implement token refresh for both authentication systems
4. **Error Handling**: Provide clear error messages for authentication failures
5. **Testing**: Test both authentication systems thoroughly

## Migration Path (Optional)

If you want to eventually migrate fully to Firebase Authentication:

1. Start by implementing the integration strategy above
2. Gradually move more authentication features to Firebase
3. Update your frontend to use Firebase Authentication for all logins
4. Once all users have Firebase UIDs linked to their accounts, you can remove the custom JWT system

## Security Considerations

1. **Token Storage**: Store tokens securely (HTTP-only cookies for JWT, localStorage or IndexedDB for Firebase)
2. **CSRF Protection**: Implement CSRF protection for cookie-based authentication
3. **Rate Limiting**: Implement rate limiting for authentication endpoints
4. **Logging**: Log authentication events for security monitoring
5. **Session Management**: Implement proper session management for both authentication systems